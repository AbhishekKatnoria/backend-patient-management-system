const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Rename to 'User' to follow convention

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

    const token = jwt.sign({ id: existingUser.id }, "secretKey", {
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

// Logout (Handled on Frontend by Removing Token)
exports.logout = (req, res) => {
  res.json({ message: "Logout successful" });
};
