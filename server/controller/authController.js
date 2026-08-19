const generateOTP = require("../utils/generateOTP");
const OTP = require("../models/OTP");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { sendOTPEmail } = require("../utils/email");

exports.registerUser = async (req, res) => {
    try {

        const { name, email, password, teamName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = generateOTP();

        console.log(`OTP for ${email}: ${otp}`);

          // Save OTP to database so it can be verified later
         await OTP.create({
      email,
     otp,
     action: "account_verify",
          });

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            teamName
        });

        await user.save();

        // Send OTP email
        await sendOTPEmail(
            email,
            otp,
            "complete your registration",
            teamName
        );

        res.status(201).json({
            message: "Registration successful. OTP sent to your email."
        });

    } catch (err) {

        console.error("Registration error:", err);

        res.status(400).json({
            message: "Error registering user",
            error: err.message
        });
    }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // TODO: generate and send token/session here
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("Looking for:", email, otp);
const allOtps = await OTP.find({ email });
console.log("Found OTP docs for this email:", allOtps);

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await OTP.findOne({ email, otp, action: "account_verify" });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Error verifying OTP", error: err.message });
  }
};