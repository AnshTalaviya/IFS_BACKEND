const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Function to send OTP email
const sendOTPEmail = async (email, otp) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: email,
    subject: "Your OTP Code",
    html: `<p>Your OTP is: <b>${otp}</b>. Valid for 5 minutes.</p>`,
  });
};

// Register User and send OTP
exports.register = async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || !email || !password || !confirmPassword) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(201).json({ msg: "User registered and OTP sent" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Combined Login (password or OTP)
exports.login = async (req, res) => {
  const { email, password, otp } = req.body;

  if (!email) return res.status(400).json({ msg: "Email is required" });
  if (!password && !otp) return res.status(400).json({ msg: "Password or OTP is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ msg: "Invalid password" });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
      return res.json({ msg: "Login successful with password", token });
    }

    if (otp) {
      // Check if the OTP matches and is still valid
      const currentTime = new Date();

      if (user.otp !== otp && currentTime > user.otpExpiry) {
        return res.status(401).json({ msg: "Invalid or expired OTP" });
      }

      // Clear OTP after successful login
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
      return res.json({ msg: "Login successful with OTP", token });
    }
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Check if OTP has expired or not
    let otp = user.otp;
    let otpExpiry = user.otpExpiry;

    if (otpExpiry < new Date()) {
      // OTP has expired, generate a new OTP and set expiry
      otp = generateOTP(); // New OTP generated here
      otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    }

    // Update OTP and expiry in the database
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send the new OTP via email
    await sendOTPEmail(email, otp);

    res.json({ msg: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to resend OTP" });
  }
};
