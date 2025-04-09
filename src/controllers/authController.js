const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Rename to 'User' to follow convention

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const sendResponse = (statusCode, status, payload) =>
      res.status(statusCode).json({ status, ...payload });

    // Validation: collect errors as array
    const errors = [];
    const fields = { name, email, phone, password };

    for (const [key, value] of Object.entries(fields)) {
      if (!value) {
        errors.push({
          message: `${key[0].toUpperCase() + key.slice(1)} is required`,
        });
      }
    }

    // Email format check (if email exists)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    // If any validation errors, return them
    if (errors.length > 0) {
      return sendResponse(400, false, { errors });
    }

    // Check for existing email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendResponse(400, false, {
        errors: [{ field: "email", message: "Email already in use" }],
      });
    }

    // Hash password & create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    return sendResponse(201, true, {
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      errors: [{ field: "server", message: error.message }],
    });
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
