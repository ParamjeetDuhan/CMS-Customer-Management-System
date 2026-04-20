const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    // 🔑 Salesforce Mapping
    salesforceId: {
      type: String,
      required: true,
      unique: true,
    },

    // 🔗 Relationships
    orderId: {
      type: String, // Custom_order__c
      required: true,
    },

    productId: {
      type: String, // Product_Master__c
      required: true,
    },

    // 📦 Item Details
    name : String,
    quantity: Number,
    unitPrice: Number,
    subtotal: Number,
    image : String,

    // 🕒 Metadata
    createdAtSF: Date,
    updatedAtSF: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderItem", orderItemSchema);
