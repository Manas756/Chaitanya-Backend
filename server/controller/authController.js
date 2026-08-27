const generateOTP = require("../utils/generateOTP");
const OTP = require("../models/OTP");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { sendOTPEmail } = require("../utils/email");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { createSession, rotateSession, revokeSession } = require("../utils/sessionStore");

const createAccessToken = (user) => jwt.sign(
  { userId: user._id.toString(), role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
);

exports.registerUser = async (req, res) => {
    try {

    const { name, password } = req.body;
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

        const normalizedName = typeof name === "string" ? name.trim() : "";

        if (!normalizedName || !email || !password) {
          return res.status(400).json({
            message: "Name, email, and password are required"
          });
        }

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

          // Save OTP to database so it can be verified later
        const hashedOtp = await bcrypt.hash(otp, 10);
        await OTP.create({
      email,
      otp: hashedOtp,
      action: "account_verify",
          });

        // Create user
        const user = new User({
            name: normalizedName,
            email,
            password: hashedPassword
        });

        await user.save();

        // Send OTP email
        await sendOTPEmail(
            email,
            otp,
            "complete your registration"
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
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const { password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Authentication service is not configured" });
    }

    const token = createAccessToken(user);
    const session = await createSession(user);

    res.status(200).json({
      message: "Login successful",
      token,
      refreshToken: session?.refreshToken || null,
      refreshTokenExpiresIn: session?.ttl || null,
      role: user.role,
      isAdmin: user.role === "admin"
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const normalizedEmail = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const { otp } = req.body;

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await OTP.findOne({ email: normalizedEmail, action: "account_verify" }).sort({ createdAt: -1 });

    if (!otpRecord || !(await bcrypt.compare(otp, otpRecord.otp))) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
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

exports.forgotPassword = async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const response = { message: "If an account exists, a password reset OTP has been sent" };
  if (!email) return res.status(200).json(response);

  const user = await User.findOne({ email });
  if (!user) return res.status(200).json(response);

  const otp = generateOTP();
  await OTP.deleteMany({ email, action: "password_reset" });
  await OTP.create({ email, otp: await bcrypt.hash(otp, 10), action: "password_reset" });
  await sendOTPEmail(email, otp, "reset your password");
  res.status(200).json(response);
};

exports.resetPassword = async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const { otp, password } = req.body;
  if (!email || !otp || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "Email, OTP, and a password of at least 8 characters are required" });
  }

  const otpRecord = await OTP.findOne({ email, action: "password_reset" }).sort({ createdAt: -1 });
  if (!otpRecord || !(await bcrypt.compare(otp, otpRecord.otp))) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const user = await User.findOneAndUpdate(
    { email }, { password: await bcrypt.hash(password, 10) }, { new: true }
  );
  if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });
  await OTP.deleteOne({ _id: otpRecord._id });
  res.status(200).json({ message: "Password reset successfully" });
};

exports.logoutUser = (req, res) => {
  return revokeSession(req.body?.refreshToken)
    .then(() => res.status(200).json({ message: "Logout successful" }));
};

exports.refreshToken = async (req, res) => {
  if (!process.env.JWT_SECRET) return res.status(500).json({ message: "Authentication service is not configured" });
  const session = await rotateSession(req.body?.refreshToken);
  if (!session) return res.status(401).json({ message: "Invalid or expired refresh token" });

  const user = await User.findById(session.user.userId).select("-password");
  if (!user || !user.isVerified) return res.status(401).json({ message: "User is not authorized" });
  res.json({
    message: "Token refreshed",
    token: createAccessToken(user),
    refreshToken: session.refreshToken,
    refreshTokenExpiresIn: session.ttl,
    role: user.role,
    isAdmin: user.role === "admin",
  });
};

exports.googleLogin = async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
    return res.status(503).json({ message: "Google authentication is not configured" });
  }
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "Google ID token is required" });

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.email || payload.email_verified !== true) {
    return res.status(401).json({ message: "Google account email is not verified" });
  }

  const user = await User.findOneAndUpdate(
    { email: payload.email.toLowerCase() },
    { googleId: payload.sub, isVerified: true },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: "Create an account with email registration first" });

  const token = createAccessToken(user);
  const session = await createSession(user);
  res.json({ message: "Google login successful", token, refreshToken: session?.refreshToken || null, refreshTokenExpiresIn: session?.ttl || null, role: user.role, isAdmin: user.role === "admin" });
};