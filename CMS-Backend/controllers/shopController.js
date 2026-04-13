/**
 * controllers/shopController.js
 * FIX: Mongo returns raw docs (not parsed shape) — map to parsed shape before return.
 * FIX: $maxDistance removed — Mongo geo is best-effort, always falls back to SF.
 * FIX: coordinates stored as [lng, lat] from s.lng / s.lat (not s.longitude/s.latitude).
 */
const {
  sfGetNearbyShops, sfGetAllShops, sfGetShopById, sfGetReviews, sfSubmitReview,
} = require("../services/salesforce/sfShopService");
const { parseShop, parseShopList } = require("../parsers/shopParser");
const { parseReview, parseReviewList } = require("../parsers/reviewParser");
const Shop   = require("../models/shop");
const Review = require("../models/review");
const { syncShop, syncShopList, syncReview, syncReviewList } = require("../services/syncHelpers");

/** Map Mongo shop doc → same shape as parseShop output */
const docToShop = (doc) => ({
  id: doc.salesforceId, name: doc.name, category: doc.category,
  description: doc.description, address: doc.address, city: doc.city,
  phone: doc.phone, email: doc.email, image: doc.image,
  rating: doc.rating, totalReviews: doc.totalReviews, distance: doc.distance || 0,
  isOpen: doc.isOpen, openTime: doc.openTime, closeTime: doc.closeTime,
  lat: doc.location?.coordinates?.[1] || 0,
  lng: doc.location?.coordinates?.[0] || 0,
  ownerId: doc.ownerId,
});

const docToReview = (doc) => ({
  id: doc.salesforceId, shopId: doc.shopId,
  review: doc.review, comment: doc.review,
  rating: doc.rating,
});

/* ── GET /api/shops/nearby ── */
const getNearbyShops = async (req, res) => {
  try {
    const { lat, lng, category, sort, q } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: "lat and lng are required" });

    /* Step 1: Mongo geo query (best-effort, no crash if index missing) */
    try {
      const mongoShops = await Shop.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          },
        },
      }).limit(100);

      if (mongoShops.length > 0) {
        let shops = mongoShops.map(docToShop);
        if (q)        shops = shops.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.category.toLowerCase().includes(q.toLowerCase()));
        if (category && category !== "All") shops = shops.filter((s) => s.category === category);
        if (sort === "rating")   shops.sort((a, b) => b.rating - a.rating);
        if (sort === "distance") shops.sort((a, b) => a.distance - b.distance);
        if (sort === "name")     shops.sort((a, b) => a.name.localeCompare(b.name));
        return res.status(200).json({ shops, total: shops.length });
      }
    } catch (_) { /* geo index not ready — fall through to SF */ }

    /* Step 2: Salesforce fallback */
    const sfResult = await sfGetNearbyShops({ lat, lng, category, sort, q });
    const raw  = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const list = Array.isArray(raw) ? raw : (raw?.data || raw?.records || []);
    const shops = parseShopList(list);
    if (sort === "rating")   shops.sort((a, b) => b.rating - a.rating);
    if (sort === "distance") shops.sort((a, b) => a.distance - b.distance);
    if (sort === "name")     shops.sort((a, b) => a.name.localeCompare(b.name));
    const filtered = category && category !== "All" ? shops.filter((s) => s.category === category) : shops;

    /* Step 3: Cache async */
    syncShopList(shops);

    return res.status(200).json({ shops: filtered, total: filtered.length });
  } catch (err) {
    console.error("getNearbyShops error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/shops ── */
const getAllShops = async (req, res) => {
  try {
    const mongoShops = await Shop.find().lean();
    if (mongoShops.length > 0) {
      const shops = mongoShops.map(docToShop);
      return res.status(200).json({ shops, total: shops.length });
    }

    const sfResult = await sfGetAllShops(req.query);
    const raw  = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const list = Array.isArray(raw) ? raw : (raw?.data || raw?.records || []);
    const shops = parseShopList(list);
    syncShopList(shops);
    return res.status(200).json({ shops, total: shops.length });
  } catch (err) {
    console.error("getAllShops error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/shops/:id ── */
const getShopById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "id is required" });

    const mongoShop = await Shop.findOne({ salesforceId: id }).lean();
    if (mongoShop) return res.status(200).json({ shop: docToShop(mongoShop) });

    const sfResult = await sfGetShopById(id);
    const raw  = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const shopData = raw?.data || raw;
    if (!shopData || (Array.isArray(shopData) && !shopData.length))
      return res.status(404).json({ message: "Shop not found" });

    const shop = parseShop(Array.isArray(shopData) ? shopData[0] : shopData);
    syncShop(shop);
    return res.status(200).json({ shop });
  } catch (err) {
    console.error("getShopById error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/shops/:id/reviews ── */
const getShopReviews = async (req, res) => {
  try {
    const shopId = req.params.id;
    if (!shopId) return res.status(400).json({ message: "shopId is required" });

    const mongoReviews = await Review.find({ shopId }).lean();
    if (mongoReviews.length > 0) {
      return res.status(200).json({ reviews: mongoReviews.map(docToReview), total: mongoReviews.length });
    }

    const sfResult = await sfGetReviews(shopId);
    const raw  = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const list = Array.isArray(raw) ? raw : (raw?.data || raw?.records || []);
    const reviews = parseReviewList(list);
    syncReviewList(reviews, shopId);
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

    const sfResult = await sfSubmitReview(req.params.id, { rating, comment, customerId: req.user.id });
    const raw  = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const review = parseReview(raw?.data || raw);
    syncReview(review, req.params.id);
    return res.status(201).json({ message: "Review submitted", review });
  } catch (err) {
    console.error("submitReview error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getNearbyShops, getAllShops, getShopById, getShopReviews, submitReview };
