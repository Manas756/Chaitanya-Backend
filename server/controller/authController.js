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
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        console.log(`OTP for ${email}: ${otp}`);

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