const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    salesforceId: {
      type: String,
      required: true,
      unique: true,
    },

    // 👤 Customer
    customerId: String, // Account__c

    // 🏪 Shop
    shopId: String, // Shop__c

    // 📦 Order Info
    orderDate: Date,
    status: String,
    paymentStatus: String,
    totalAmount: Number,

    // 👤 Customer Snapshot (important)
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    customerAddress: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);