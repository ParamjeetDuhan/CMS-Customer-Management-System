const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    salesforceId: {
      type: String,
      required: true,
      unique: true,
    },

    customerId: String,

    label: String,
    name: String,
    phone: String,

    line1: String,
    city: String,
    state: String,
    pincode: String,

    isDefault: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);