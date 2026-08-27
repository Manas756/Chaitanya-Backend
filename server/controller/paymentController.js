const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/payment");
const Registration = require("../models/registration");

const getClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

exports.createOrder = async (req, res) => {
  const client = getClient();
  if (!client) return res.status(503).json({ success: false, message: "Payment service is not configured" });

  const registration = await Registration.findOne({ _id: req.body.registrationId, user: req.user._id, status: "confirmed" }).populate("event", "fee");
  if (!registration) return res.status(404).json({ success: false, message: "Registration not found" });
  if (!registration.event || !Number.isFinite(registration.event.fee) || registration.event.fee <= 0) {
    return res.status(400).json({ success: false, message: "This event does not require payment" });
  }

  const existing = await Payment.findOne({ registration: registration._id });
  if (existing && existing.status === "paid") return res.json({ success: true, data: existing });

  const amount = Math.round(registration.event.fee * 100);
  const order = await client.orders.create({ amount, currency: "INR", receipt: `registration_${registration._id}` });
  const payment = await Payment.findOneAndUpdate(
    { registration: registration._id },
    { user: req.user._id, registration: registration._id, amount, currency: "INR", orderId: order.id, status: "created" },
    { upsert: true, new: true, runValidators: true }
  );
  res.status(201).json({ success: true, data: { payment, keyId: process.env.RAZORPAY_KEY_ID } });
};

exports.verifyPayment = async (req, res) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ success: false, message: "Payment service is not configured" });
  }

  const { registrationId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const payment = await Payment.findOne({ registration: registrationId, user: req.user._id, orderId: razorpayOrderId });
  if (!payment) return res.status(404).json({ success: false, message: "Payment order not found" });

  const digest = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
  const receivedSignature = Buffer.from(razorpaySignature || "");
  const expectedSignature = Buffer.from(digest);
  if (receivedSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(expectedSignature, receivedSignature)) {
    await Payment.updateOne({ _id: payment._id }, { status: "failed" });
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  }

  const updated = await Payment.findOneAndUpdate(
    { _id: payment._id, status: { $ne: "paid" } },
    { paymentId: razorpayPaymentId, signature: razorpaySignature, status: "paid" },
    { new: true }
  );
  res.json({ success: true, message: "Payment verified", data: updated || payment });
};