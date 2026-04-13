/**
 * routes/productRoutes.js
 * Mounted at /api
 * FIX: removed searchProducts (not implemented in controller — handled via ?search= query param)
 */
const express = require("express");
const router  = express.Router();
const { getShopProducts, getProductById } = require("../controllers/productController");

router.get("/shops/:id/products", getShopProducts);
router.get("/products/:id",       getProductById);

module.exports = router;
