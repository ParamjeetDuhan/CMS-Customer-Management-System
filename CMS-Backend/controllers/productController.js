/**
 * controllers/productController.js
 * FIX: variable name collision (product model vs parsed product),
 *      consistent id resolution, Mongo doc mapped to parsed shape.
 */
const {
  sfGetShopProducts, sfGetProductById,
} = require("../services/salesforce/sfProductService");
const { parseProduct, parseProductList } = require("../parsers/productParser");
const ProductModel = require("../models/product");
const { syncProduct, syncProductList } = require("../services/syncHelpers");

const docToProduct = (doc) => ({
  id: doc.salesforceId, name: doc.name, description: doc.description || "",
  price: doc.price, mrp: doc.price, stock: doc.stock,
  category: doc.category, image: doc.image || null,
  available: doc.isAvailable, isAvailable: doc.isAvailable,
  unit: "piece", shopId: doc.shopId, createdAt: doc.createdAt || null,
});

/* ── GET /api/shops/:id/products ── */
const getShopProducts = async (req, res) => {
  try {
    const shopId = req.params.id;
    if (!shopId) return res.status(400).json({ message: "shopId is required" });

    const { category, search, price, minPrice } = req.query;

    /* Step 1: Mongo */
    const mongoDocs = await ProductModel.find({ shopId }).lean();
    if (mongoDocs.length > 0) {
      let products = mongoDocs.map(docToProduct);
      if (category) products = products.filter((p) => p.category === category);
      if (search)   products = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
      if (price)    products = products.filter((p) => p.price <= Number(price));
      if (minPrice) products = products.filter((p) => p.price >= Number(minPrice));
      return res.status(200).json({ products, total: products.length });
    }

    /* Step 2: Salesforce */
    const sfResult = await sfGetShopProducts(shopId, req.query);
    const raw  = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const list = Array.isArray(raw) ? raw : (raw?.data || raw?.records || []);
    const allProducts = parseProductList(list);
    let products = [...allProducts];
    if (category) products = products.filter((p) => p.category === category);
    if (search)   products = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (price)    products = products.filter((p) => p.price <= Number(price));
    if (minPrice) products = products.filter((p) => p.price >= Number(minPrice));

    /* Step 3: Cache */
    syncProductList(allProducts, shopId);

    return res.status(200).json({ products, total: products.length });
  } catch (err) {
    console.error("getShopProducts error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/products/:id ── */
const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "id is required" });

    /* Step 1: Mongo */
    const mongoDoc = await ProductModel.findOne({ salesforceId: id }).lean();
    if (mongoDoc) return res.status(200).json({ product: docToProduct(mongoDoc) });

    /* Step 2: Salesforce */
    const sfResult = await sfGetProductById(id);
    let raw = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    if (Array.isArray(raw))       raw = raw[0];
    if (Array.isArray(raw?.data)) raw = raw.data[0];
    else if (raw?.data)           raw = raw.data;
    if (!raw) return res.status(404).json({ message: "Product not found" });

    const product = parseProduct(raw);

    /* Step 3: Cache */
    syncProduct(product, product.shopId);

    return res.status(200).json({ product });
  } catch (err) {
    console.error("getProductById error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getShopProducts, getProductById };
