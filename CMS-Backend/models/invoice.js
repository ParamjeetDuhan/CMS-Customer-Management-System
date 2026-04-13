const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    salesforceId: {
      type: String,
      required: true,
      unique: true,
    },

    orderId: String,
    paymentId: String,

    totalAmount: Number,
    invoiceDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);