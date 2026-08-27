const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	registration: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true, unique: true },
	amount: { type: Number, required: true, min: 0 },
	currency: { type: String, default: "INR" },
	orderId: { type: String, unique: true, sparse: true },
	paymentId: { type: String, unique: true, sparse: true },
	signature: String,
	status: { type: String, enum: ["created", "paid", "failed"], default: "created", index: true },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
