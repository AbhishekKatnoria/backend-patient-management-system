const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const SECRET_KEY = process.env.JWT_SECRET;

// **Register Super Admin**
const registerSuperAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO super_admins (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );
    res.status(201).json({ message: "Super admin registered", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error registering super admin" });
  }
};

// **Login Super Admin**
const loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM super_admins WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
};

// **Logout Super Admin**
const logoutSuperAdmin = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

// **Get Super Admin Profile**
const getSuperAdminProfile = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, created_at FROM super_admins WHERE id = $1", [req.user.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = { registerSuperAdmin, loginSuperAdmin, logoutSuperAdmin, getSuperAdminProfile };
