require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes    = require("./routes/authRoutes");
const shopRoutes    = require("./routes/shopRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes   = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

/* ── CORS ── */
app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      origin.startsWith("http://localhost") ||
      origin === "https://cms-customer-management-system.vercel.app"
    ) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
}));

app.use(express.json());

/* ── Routes ── */
app.use("/api/auth",     authRoutes);
app.use("/api/shops",    shopRoutes);
app.use("/api",          productRoutes);   // /api/products/:id  +  /api/shops/:id/products/*
app.use("/api/orders",   orderRoutes);
app.use("/api/payments", paymentRoutes);

/* ── Health check ── */
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

/* ── Global error handler ── */
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
