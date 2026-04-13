const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    // 🔑 Salesforce Mapping
    salesforceId: {
      type: String,
      required: true,
      unique: true,
    },

    // 🧾 Basic Info
    name: String,
    email: String,
    phone: String,
    description: String,
    category: String,
    city: String,
    image: String,

    // 📍 Location (IMPORTANT for future nearby search)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
      },
    },

    address: String,

    // ⭐ Ratings
    rating: Number,
    totalReviews: Number,
    totalRevenue: Number,

    // ⏰ Timing
    isOpen: Boolean,
    openTime: String,
    closeTime: String,

    // 👤 Owner
    ownerId: String,
    ownerUser: String,

    // 🕒 Metadata
    createdAtSF: Date,
    updatedAtSF: Date,
  },
  { timestamps: true }
);

// 🔥 Geo Index (VERY IMPORTANT)
shopSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Shop", shopSchema);