/**
 * routes/paymentRoutes.js
 *
 * Mounted at /api/payments
 * All routes are protected.
 */
const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  initiatePayment,
  verifyPayment,
  getPaymentStatus,
} = require("../controllers/paymentController");

router.post("/initiate",       auth, initiatePayment);
router.post("/verify",         auth, verifyPayment);
router.get ("/status/:orderId", auth, getPaymentStatus);

module.exports = router;
