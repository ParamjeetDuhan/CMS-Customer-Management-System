const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/JWTauthMiddleware");

const {Shop} = require('../controllers/ShopController');
const{Products} = require('../controllers/ProductController');
router.get("/MyNearShops",Shop );
router.get("/products",Products);

module.exports = router;