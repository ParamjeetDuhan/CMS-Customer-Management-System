/**
 * routes/orderRoutes.js
 *
 * Mounted at /api/orders
 * All routes are protected.
 */
const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  reorder,
  trackOrder,
  submitFeedback,
} = require("../controllers/orderController");

/* NOTE: /my must come BEFORE /:id */
router.get  ("/my",             auth, getMyOrders);
router.post ("/",               auth, placeOrder);
router.get  ("/:id",            auth, getOrderById);
router.put  ("/:id/cancel",     auth, cancelOrder);
router.post ("/:id/reorder",    auth, reorder);
router.get  ("/:id/track",      auth, trackOrder);
router.post ("/:id/feedback",   auth, submitFeedback);

module.exports = router;
