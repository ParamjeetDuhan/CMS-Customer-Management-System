/**
 * config/db.js
 * FIX: graceful failure instead of process.exit so server stays up if Mongo is slow.
 */
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    console.log("⚠️  Server continues without MongoDB — Salesforce handles all reads");
  }
};

module.exports = connectDB;
