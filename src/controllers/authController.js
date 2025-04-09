const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const Otp = require("../models/otp");
require("dotenv").config();
// Register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });

    if (
      !existingUser ||
      !(await bcrypt.compare(password, existingUser.password))
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email"],
    });
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    res.json(currentUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send OTP
exports.sendOtp = async (req, res) => {
  const { method, value } = req.body;


  if (!method || !value) {
    return res.status(400).json({ error: "Method and value are required" });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  try {
    await Otp.create({ identifier: value, otp, expiresAt });

    if (method === "email") {
      await sendEmail(value, "Your OTP Code", `Your OTP is: ${otp}`);
    } else if (method === "phone") {
      console.log(`OTP for ${value} is ${otp}`);
    }

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { method, value, otp } = req.body;

  if (!method || !value || !otp) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const record = await Otp.findOne({
      where: { identifier: value, otp },
      order: [["createdAt", "DESC"]],
    });

    if (!record) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // Optional: Delete used OTP
    await record.destroy();

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
};

// Logout (Handled on Frontend)
exports.logout = (req, res) => {
  res.json({ message: "Logout successful" });
};
