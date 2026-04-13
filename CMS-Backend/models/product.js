const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // 🔑 Salesforce Mapping
    salesforceId: {
      type: String,
      required: true,
      unique: true,
    },

    // 🛍 Product Info
    name: String,
    category: String,
    price: Number,
    stock: Number,
    isAvailable: Boolean,

    // 🏪 Relationship (IMPORTANT)
    shopId: {
      type: String, // Salesforce Shop__c Id
      required: true,
    },

    // 🕒 Metadata
    createdAtSF: Date,
    updatedAtSF: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);