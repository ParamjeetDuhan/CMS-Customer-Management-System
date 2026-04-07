/**
 * routes/productRoutes.js
 *
 * Mounted at /api
 * Handles:
 *   GET /api/shops/:id/products
 *   GET /api/shops/:id/products/search
 *   GET /api/shops/:id/categories
 *   GET /api/products/:id
 */
const express = require("express");
const router  = express.Router();
const {
  getShopProducts,
  searchProducts,
  getProductCategories,
  getProductById,
} = require("../controllers/productController");

/* NOTE: /search must come before /:id to avoid treating "search" as a product id */
router.get("/shops/:id/products/search", searchProducts);
router.get("/shops/:id/products",        getShopProducts);
router.get("/shops/:id/categories",      getProductCategories);
router.get("/products/:id",              getProductById);

module.exports = router;
