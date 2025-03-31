const express = require("express");
const { registerSuperAdmin, loginSuperAdmin, logoutSuperAdmin, getSuperAdminProfile } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerSuperAdmin);
router.post("/login", loginSuperAdmin);
router.post("/logout", logoutSuperAdmin);
router.get("/profile", verifyToken, getSuperAdminProfile);

module.exports = router;
