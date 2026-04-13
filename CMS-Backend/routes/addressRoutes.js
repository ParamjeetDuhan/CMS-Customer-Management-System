/**
 * routes/addressRoutes.js
 * Mounted at /api/addresses — all routes are protected.
 */
const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefault,
} = require("../controllers/addressController");

router.get  ("/",           auth, getAddresses);
router.post ("/",           auth, createAddress);
router.put  ("/:id",        auth, updateAddress);
router.delete("/:id",       auth, deleteAddress);
router.put  ("/:id/default", auth, setDefault);

module.exports = router;