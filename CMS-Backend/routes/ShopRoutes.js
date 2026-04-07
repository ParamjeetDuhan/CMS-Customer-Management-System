/**
 * routes/shopRoutes.js
 *
 * Mounted at /api/shops
 */
const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  getNearbyShops,
  getAllShops,
  getShopById,
  getShopReviews,
  submitReview,
} = require("../controllers/shopController");

/* NOTE: /search and /nearby must come BEFORE /:id to avoid param collision */
router.get("/nearby",        getNearbyShops);
router.get("/",        getAllShops);
router.get("/:id",           getShopById);
router.get("/:id/reviews",   getShopReviews);
router.post("/:id/reviews",  auth, submitReview);

module.exports = router;
