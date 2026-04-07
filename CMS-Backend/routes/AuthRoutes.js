/**
 * routes/authRoutes.js
 *
 * Mounted at /api/auth
 */
const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  signup,
  login,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

/* Public */
router.post("/signup",         signup);
router.post("/login",          login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

/* Protected */
router.put ("/profile",        auth, updateProfile);
router.put ("/change-password", auth, changePassword);

module.exports = router;
