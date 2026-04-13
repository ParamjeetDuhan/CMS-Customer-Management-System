/**
 * controllers/addressController.js
 * FIX: uses syncAddress / syncAddressList from syncHelpers (fire-and-forget).
 *      Mongo docs mapped to parsed shape via docToAddress before returning.
 */
const {
  sfGetAddresses, sfCreateAddress, sfUpdateAddress,
  sfDeleteAddress, sfSetDefaultAddress,
} = require("../services/salesforce/sfAddressService");
const { parseAddress, parseAddressList } = require("../parsers/addressParser");
const AddressModel = require("../models/address");
const { syncAddress, syncAddressList } = require("../services/syncHelpers");

const cId = (req) => req.user.id;

/** Map Mongo doc → same shape addressParser produces */
const docToAddress = (doc) => ({
  id:         doc.salesforceId,
  label:      doc.label,
  name:       doc.name,
  phone:      doc.phone,
  line1:      doc.line1,
  city:       doc.city,
  state:      doc.state,
  pincode:    doc.pincode,
  isDefault:  doc.isDefault,
  customerId: doc.customerId,
  createdAt:  doc.createdAt || null,
});

/* ── GET /api/addresses ── */
const getAddresses = async (req, res) => {
  try {
    const userId = cId(req);

    /* Step 1: Mongo */
    const mongoDocs = await AddressModel.find({ customerId: userId }).lean();
    if (mongoDocs.length > 0) {
      const addresses = mongoDocs
        .map(docToAddress)
        .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
      return res.status(200).json({ addresses });
    }

    /* Step 2: Salesforce fallback */
    const sfResult = await sfGetAddresses(userId);
    let raw = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const list = Array.isArray(raw) ? raw : (raw?.data || raw?.records || []);
    const addresses = parseAddressList(list)
      .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

    /* Step 3: Cache async */
    syncAddressList(addresses, userId);

    return res.status(200).json({ addresses });
  } catch (err) {
    console.error("getAddresses error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/addresses ── */
const createAddress = async (req, res) => {
  try {
    const { label, name, phone, line1, city, state, pincode, isDefault } = req.body;
    if (!line1 || !city || !pincode)
      return res.status(400).json({ message: "line1, city and pincode are required" });

    const sfResult = await sfCreateAddress({
      customerId:    cId(req),
      Label__c:      label    || "Home",
      Name__c:       name     || "",
      Phone__c:      phone    || "",
      Line1__c:      line1,
      City__c:       city,
      State__c:      state    || "",
      Pincode__c:    pincode,
      Is_Default__c: Boolean(isDefault),
      Customer__c:   cId(req),
    });

    let raw = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    if (Array.isArray(raw)) raw = raw[0];
    const address = parseAddress(raw?.data || raw);

    syncAddress(address, cId(req));

    return res.status(201).json({ message: "Address saved", address });
  } catch (err) {
    console.error("createAddress error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── PUT /api/addresses/:id ── */
const updateAddress = async (req, res) => {
  try {
    const { label, name, phone, line1, city, state, pincode, isDefault } = req.body;

    const sfResult = await sfUpdateAddress({
      addressId:     req.params.id,
      customerId:    cId(req),
      Label__c:      label,
      Name__c:       name,
      Phone__c:      phone,
      Line1__c:      line1,
      City__c:       city,
      State__c:      state,
      Pincode__c:    pincode,
      Is_Default__c: isDefault,
    });

    let raw = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    if (Array.isArray(raw)) raw = raw[0];
    const address = parseAddress(raw?.data || raw);

    syncAddress(address, cId(req));

    return res.status(200).json({ message: "Address updated", address });
  } catch (err) {
    console.error("updateAddress error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── DELETE /api/addresses/:id ── */
const deleteAddress = async (req, res) => {
  try {
    await sfDeleteAddress(req.params.id);
    setImmediate(() =>
      AddressModel.deleteOne({ salesforceId: req.params.id }).catch(() => {})
    );
    return res.status(200).json({ message: "Address deleted" });
  } catch (err) {
    console.error("deleteAddress error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── PUT /api/addresses/:id/default ── */
const setDefault = async (req, res) => {
  try {
    const userId = cId(req);
    await sfSetDefaultAddress(userId, req.params.id);

    setImmediate(async () => {
      try {
        await AddressModel.updateMany(
          { customerId: userId },
          { $set: { isDefault: false } }
        );
        await AddressModel.updateOne(
          { salesforceId: req.params.id },
          { $set: { isDefault: true } }
        );
      } catch (e) {
        console.error("[sync/address/default]", e.message);
      }
    });

    return res.status(200).json({ message: "Default address updated" });
  } catch (err) {
    console.error("setDefault error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress, setDefault };