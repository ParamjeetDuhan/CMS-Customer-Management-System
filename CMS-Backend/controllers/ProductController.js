/**
 * controllers/productController.js
 *
 * All Salesforce responses normalised through productParser.
 */
const {
  sfGetShopProducts,
  sfGetProductById,
  sfGetProductCategories,
  sfSearchProducts,
} = require("../services/salesforce/sfProductService");
const { parseProduct, parseProductList } = require("../parsers/productParser");

/* ── GET /api/shops/:id/products?category=&search=&price=&minPrice= ── */
const getShopProducts = async (req, res) => {
  try {
    const shopId = req.params.id;
    const { category, search, price, minPrice } = req.query;

    const sfResult = await sfGetShopProducts(shopId, req.query);
    const raw      = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

    /* SF may return array or { data: [...] } */
    const list     = Array.isArray(raw) ? raw : (raw?.data || raw?.records || []);
    let products   = parseProductList(list);

    /* ── In-backend filters (mirrors existing ProductController logic) ── */
    if (category)  products = products.filter((p) => p.category === category);
    if (search)    products = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (price)     products = products.filter((p) => p.price <= Number(price));
    if (minPrice)  products = products.filter((p) => p.price >= Number(minPrice));

    return res.status(200).json({ products, total: products.length });
  } catch (err) {
    console.error("getShopProducts error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/shops/:id/products/search?q= ── */
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "q is required" });

    const sfResult = await sfSearchProducts(req.params.id, q);
    const raw      = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const list     = Array.isArray(raw) ? raw : (raw?.data || raw?.records || []);
    const products = parseProductList(list);
    return res.status(200).json({ products, total: products.length });
  } catch (err) {
    console.error("searchProducts error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/shops/:id/categories ── */
const getProductCategories = async (req, res) => {
  try {
    const sfResult   = await sfGetProductCategories(req.params.id);
    const raw        = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    /* Expected: array of strings or { categories: [...] } */
    const categories = Array.isArray(raw) ? raw : (raw?.categories || raw?.data || []);
    return res.status(200).json({ categories });
  } catch (err) {
    console.error("getProductCategories error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/products/:id ── */
const getProductById = async (req, res) => {
  try {
    const sfResult = await sfGetProductById(req.params.id);
    const raw      = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const prodData = raw?.data || raw;

    if (!prodData) return res.status(404).json({ message: "Product not found" });

    const product = parseProduct(prodData);
    return res.status(200).json({ product });
  } catch (err) {
    console.error("getProductById error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getShopProducts,
  searchProducts,
  getProductCategories,
  getProductById,
};
