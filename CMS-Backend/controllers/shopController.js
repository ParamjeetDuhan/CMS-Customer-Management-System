const {
  sfGetNearbyShops, sfGetAllShops, sfGetShopById, sfGetReviews, sfSubmitReview,
} = require("../services/salesforce/sfShopService");

const { parseShop, parseShopList } = require("../parsers/shopParser");
const { parseReview, parseReviewList } = require("../parsers/reviewParser");

const Shop   = require("../models/shop");
const Review = require("../models/review");

const { syncShop, syncShopList, syncReview, syncReviewList } = require("../services/syncHelpers");

/* 🔥 Distance function */
const calcDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

/** Map Mongo shop doc → same shape */
const docToShop = (doc) => ({
  id: doc.salesforceId,
  name: doc.name,
  category: doc.category,
  description: doc.description,
  address: doc.address,
  city: doc.city,
  phone: doc.phone,
  email: doc.email,
  image: doc.image,
  rating: doc.rating,
  totalReviews: doc.totalReviews,
  isOpen: doc.isOpen,
  openTime: doc.openTime,
  closeTime: doc.closeTime,
  lat: doc.location?.coordinates?.[1] || 0,
  lng: doc.location?.coordinates?.[0] || 0,
  ownerId: doc.ownerId,
});

/* ── GET /api/shops/nearby ── */
const getNearbyShops = async (req, res) => {
  try {
    const { lat, lng, category, sort, q } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    /* 🔥 Step 1: Mongo */
    try {
      const mongoShops = await Shop.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [userLng, userLat],
            },
            $maxDistance: 5000, // 5km
          },
        },
      }).limit(100);

      if (mongoShops.length > 0) {
        let shops = mongoShops.map((doc) => {
          const shop = docToShop(doc);

          /* 🔥 Inject distance */
          const distance = calcDistance(
            userLat,
            userLng,
            shop.lat,
            shop.lng
          );

          shop.distance = Number(distance.toFixed(2));
          return shop;
        });

        /* 🔥 Apply filters */
        if (q) {
          shops = shops.filter(
            (s) =>
              s.name.toLowerCase().includes(q.toLowerCase()) ||
              s.category?.toLowerCase().includes(q.toLowerCase())
          );
        }

        if (category && category !== "All") {
          shops = shops.filter((s) => s.category === category);
        }

        /* 🔥 Sorting */
        if (sort === "rating") {
          shops.sort((a, b) => b.rating - a.rating);
        }

        if (sort === "distance") {
          shops.sort((a, b) => a.distance - b.distance);
        }

        if (sort === "name") {
          shops.sort((a, b) => a.name.localeCompare(b.name));
        }

        if (shops.length > 0) {
          console.log("✅ From Mongo");
          return res.status(200).json({ shops, total: shops.length });
        }
      }
    } catch (err) {
      console.log("Mongo failed → fallback to Salesforce");
    }

    /* 🔥 Step 2: Salesforce */
    console.log("🔥 From Salesforce");

    const sfResult = await sfGetNearbyShops({ lat, lng, category, sort, q });

    const raw =
      typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

    const list = Array.isArray(raw)
      ? raw
      : raw?.data || raw?.records || [];

    let shops = parseShopList(list);

    if (sort === "rating") {
      shops.sort((a, b) => b.rating - a.rating);
    }

    if (sort === "distance") {
      shops.sort((a, b) => a.distance - b.distance);
    }

    if (sort === "name") {
      shops.sort((a, b) => a.name.localeCompare(b.name));
    }

    /* 🔥 Cache */
    syncShopList(shops);

    return res.status(200).json({ shops, total: shops.length });

  } catch (err) {
    console.error("getNearbyShops error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getAllShops = async (req, res) => {
  try {
    const { lat, lng, category, sort, q } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    /* 🔥 Mongo (10km) */
    try {
      const mongoShops = await Shop.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [userLng, userLat],
            },
            $maxDistance: 10000, // 🔥 10 KM
          },
        },
      }).limit(200);

      if (mongoShops.length > 0) {
        let shops = mongoShops.map((doc) => {
          const shop = docToShop(doc);

          const distance = calcDistance(
            userLat,
            userLng,
            shop.lat,
            shop.lng
          );

          shop.distance = Number(distance.toFixed(2));
          return shop;
        });

        /* 🔥 Filters */
        if (q) {
          shops = shops.filter(
            (s) =>
              s.name.toLowerCase().includes(q.toLowerCase()) ||
              s.category?.toLowerCase().includes(q.toLowerCase())
          );
        }

        if (category && category !== "All") {
          shops = shops.filter((s) => s.category === category);
        }

        /* 🔥 Sorting */
        if (sort === "rating") {
          shops.sort((a, b) => b.rating - a.rating);
        }

        if (sort === "distance") {
          shops.sort((a, b) => a.distance - b.distance);
        }

        if (sort === "name") {
          shops.sort((a, b) => a.name.localeCompare(b.name));
        }

        if (shops.length > 0) {
          console.log("✅ All Shops from Mongo (10km)");
          return res.status(200).json({ shops, total: shops.length });
        }
      }
    } catch (err) {
      console.log("Mongo failed → fallback to Salesforce");
    }

    /* 🔥 Salesforce fallback */
    console.log("🔥 All Shops from Salesforce");

    const sfResult = await sfGetAllShops({ lat, lng, category, sort, q });

    const raw =
      typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

    const list = Array.isArray(raw)
      ? raw
      : raw?.data || raw?.records || [];

    let shops = parseShopList(list);

    if (sort === "rating") {
      shops.sort((a, b) => b.rating - a.rating);
    }

    if (sort === "distance") {
      shops.sort((a, b) => a.distance - b.distance);
    }

    if (sort === "name") {
      shops.sort((a, b) => a.name.localeCompare(b.name));
    }

    syncShopList(shops);

    return res.status(200).json({ shops, total: shops.length });

  } catch (err) {
    console.error("getAllShops error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getShopById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "id is required" });

    const mongoShop = await Shop.findOne({ salesforceId: id }).lean();
    if (mongoShop) return res.status(200).json({ shop: docToShop(mongoShop) });

    const sfResult = await sfGetShopById(id);
    const raw  = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const shopData = raw?.data || raw;

    const shop = parseShop(Array.isArray(shopData) ? shopData[0] : shopData);
    syncShop(shop);

    return res.status(200).json({ shop });
  } catch (err) {
    console.error("getShopById error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getShopReviews = async (req, res) => {
  try {
    const shopId = req.params.id;

    const mongoReviews = await Review.find({ shopId }).lean();
    if (mongoReviews.length > 0) {
      return res.status(200).json({
        reviews: mongoReviews.map((r) => ({
          id: r.salesforceId,
          shopId: r.shopId,
          review: r.review,
          rating: r.rating,
        })),
        total: mongoReviews.length,
      });
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

const submitReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const sfResult = await sfSubmitReview(req.params.id, {
      rating,
      comment,
      customerId: req.user.id,
    });

    const raw  = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const review = parseReview(raw?.data || raw);

    syncReview(review, req.params.id);

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