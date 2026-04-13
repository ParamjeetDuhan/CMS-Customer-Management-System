const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    // 🔑 Salesforce Mapping
    salesforceId: {
      type: String,
      required: true,
      unique: true,
    },

    // 👤 Basic Info
    name: String,
    email: String,
    phone: String,

    // 🔐 Auth
    password: String,
    userType: String,

    // 🔑 Token System
    hashedToken: String,
    tokenExpiry: Date,

    // ✅ Status
    isActive: Boolean,

    // 🕒 Salesforce Metadata
    createdAtSF: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);