const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // 🔑 Salesforce Mapping
    salesforceId: {
      type: String,
      required: true,
      unique: true,
    },

    // 🔗 Relations
    orderId: {
      type: String,
      required: true,
      index: true,
    },

    shopId: String,
    customerId: {
      type: String,
      index: true,
    },

    // 💳 Payment Info
    paymentMethod: String,   // renamed (clearer)
    transactionId: String,
    amount: Number,
    status: String,

    // 🕒 Dates
    paymentDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);