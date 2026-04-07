/**
 * controllers/shopController.js
 *
 * All Salesforce responses are normalised through shopParser / reviewParser
 * before being sent to the frontend.
 */
const {
  sfGetNearbyShops,
  sfGetAllShops,
  sfGetShopById,
  sfGetReviews,
  sfSubmitReview,
} = require("../services/salesforce/sfShopService");
const { parseShop, parseShopList } = require("../parsers/shopParser");
const { parseReview, parseReviewList } = require("../parsers/reviewParser");

/* ── GET /api/shops/nearby?lat=&lng=&radius=&category=&sort= ── */
const getNearbyShops = async (req, res) => {
  try {
    const { lat, lng, category, sort ,q} = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const sfResult = await sfGetNearbyShops({ lat, lng, category, sort ,q});
    const raw      = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

    /* SF may return { data: [...] } or a bare array */
    const list = Array.isArray(raw) ? raw : (raw?.data || raw?.records || []);
    const shops = parseShopList(list);

    /* Apply sort on parsed data as fallback */
    if (sort === "rating")   shops.sort((a, b) => b.rating - a.rating);
    if (sort === "distance") shops.sort((a, b) => a.distance - b.distance);
    if (sort === "name")     shops.sort((a, b) => a.name.localeCompare(b.name));

    /* Apply category filter as fallback */
    const filtered = category && category !== "All"
      ? shops.filter((s) => s.category === category)
      : shops;

    return res.status(200).json({ shops: filtered, total: filtered.length });
  } catch (err) {
    console.error("getNearbyShops error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/shops ── */
const getAllShops = async (req, res) => {
  try {
    const sfResult = await sfGetAllShops(req.query);
    const raw      = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const list     = Array.isArray(raw) ? raw : (raw?.data || raw?.records || []);
    const shops    = parseShopList(list);
    return res.status(200).json({ shops, total: shops.length });
  } catch (err) {
    console.error("getAllShops error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};


/* ── GET /api/shops/:id ── */
const getShopById = async (req, res) => {
  try {
    const sfResult = await sfGetShopById(req.params.id);
    const raw      = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const shopData = raw?.data || raw;

    if (!shopData) return res.status(404).json({ message: "Shop not found" });

    const shop = parseShop(shopData);
    return res.status(200).json({ shop });
  } catch (err) {
    console.error("getShopById error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/shops/:id/reviews ── */
const getShopReviews = async (req, res) => {
  try {
    const sfResult = await sfGetReviews(req.params.id);
    const raw      = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const list     = Array.isArray(raw) ? raw : (raw?.data || raw?.records || []);
    const reviews  = parseReviewList(list);
    return res.status(200).json({ reviews, total: reviews.length });
  } catch (err) {
    console.error("getShopReviews error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/shops/:id/reviews ── */
const submitReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ message: "rating is required" });

    const sfResult = await sfSubmitReview(req.params.id, {
      rating,
      comment,
      customerId: req.user.id,
    });
    const raw    = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const review = parseReview(raw?.data || raw);
    return res.status(201).json({ message: "Review submitted", review });
  } catch (err) {
    console.error("submitReview error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getNearbyShops,
  getAllShops,
  getShopById,
  getShopReviews,
  submitReview,
};
