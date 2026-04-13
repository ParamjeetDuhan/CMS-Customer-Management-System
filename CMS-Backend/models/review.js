const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    salesforceId: {
      type: String,
      required: true,
      unique: true,
    },

    shopId: String,
    review: String,
    rating: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);