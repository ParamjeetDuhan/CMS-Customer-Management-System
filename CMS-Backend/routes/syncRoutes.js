/**
 * routes/syncRoutes.js
 * Mounted at /api/sync
 */

const express = require("express");
const router  = express.Router();
require("dotenv").config();

/* =========================
   PARSERS
========================= */
const { parseShop }    = require("../parsers/shopParser");
const { parseProduct } = require("../parsers/productParser");
const { parseOrder }   = require("../parsers/orderParser");
const { parseReview }  = require("../parsers/reviewParser");
const { parseAddress } = require("../parsers/addressParser");
const { parseInvoice } = require("../parsers/invoiceParser");

/* =========================
   SYNC HELPERS
========================= */
const {
  syncShopList, deleteShop,
  syncProductList, deleteProduct,
  syncOrder, syncOrderItems, deleteOrder,
  syncReviewList, deleteReview,
  syncAddressList, deleteAddress,
  syncPayment, deletePayment,
  syncCustomer, deleteCustomer,
  syncInvoice, deleteInvoice,
} = require("../services/syncHelpers");

/* =========================
   AUTH
========================= */
const syncAuth = (req, res, next) => {
  const secret = process.env.SYNC_SECRET;

  if (!secret) {
    console.warn("[SyncRoute] ⚠️ SYNC_SECRET not set");
    return next();
  }

  if (req.headers["x-sync-secret"] !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

/* =========================
   EXTRACT RECORDS
========================= */
const extractRecords = (body) => {
  if (Array.isArray(body)) {
    return { records: body, action: body[0]?.action || "upsert" };
  }
  if (body?.records) {
    return { records: body.records, action: body.action || "upsert" };
  }
  return { records: [body], action: body.action || "upsert" };
};

/* =========================
   HEALTH
========================= */
router.get("/health", (_req, res) => {
  const mongoose = require("mongoose");

  res.json({
    status: "ok",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

/* =========================
   SHOP
========================= */
router.post("/shop", syncAuth, async (req, res) => {
  try {
    const { records, action } = extractRecords(req.body);

    if (!records.length) return res.json({ ok: true });

    if (action === "delete") {
      records.forEach((r) => deleteShop(r.Id));
      return res.json({ ok: true, action });
    }

    const parsed = records.map(parseShop);
    syncShopList(parsed);

    return res.json({ ok: true, action });

  } catch (err) {
    console.error("[Sync/shop]", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   PRODUCT
========================= */
router.post("/product", syncAuth, async (req, res) => {
  try {
    const { records, action } = extractRecords(req.body);

    if (!records.length) return res.json({ ok: true });

    if (action === "delete") {
      records.forEach((r) => deleteProduct(r.Id));
      return res.json({ ok: true, action });
    }

    const parsed = records.map(parseProduct);
    syncProductList(parsed);

    return res.json({ ok: true, action });

  } catch (err) {
    console.error("[Sync/product]", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ORDER + ORDER ITEMS
========================= */
router.post("/order", syncAuth, async (req, res) => {
  try {
    const { records, action } = extractRecords(req.body);

    if (!records.length) return res.json({ ok: true });

    if (action === "delete") {
      records.forEach((r) => deleteOrder(r.Id));
      return res.json({ ok: true, action });
    }

    const parsed = records.map(parseOrder);

    parsed.forEach((order) => {
      syncOrder(order, order.customerId);
      syncOrderItems(order); // 🔥 important
    });

    return res.json({ ok: true, action });

  } catch (err) {
    console.error("[Sync/order]", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   INVOICE (NEW)
========================= */
router.post("/invoice", syncAuth, async (req, res) => {
  try {
    const { records, action } = extractRecords(req.body);

    if (!records.length) return res.json({ ok: true });

    if (action === "delete") {
      records.forEach((r) => deleteInvoice(r.Id));
      return res.json({ ok: true, action });
    }

    const parsed = records.map(parseInvoice);

    parsed.forEach((inv) => {
      syncInvoice(inv, inv.customerId);
    });

    return res.json({ ok: true, action });

  } catch (err) {
    console.error("[Sync/invoice]", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   REVIEW
========================= */
router.post("/review", syncAuth, async (req, res) => {
  try {
    const { records, action } = extractRecords(req.body);

    if (!records.length) return res.json({ ok: true });

    if (action === "delete") {
      records.forEach((r) => deleteReview(r.Id));
      return res.json({ ok: true, action });
    }

    const parsed = records.map(parseReview);
    syncReviewList(parsed);

    return res.json({ ok: true, action });

  } catch (err) {
    console.error("[Sync/review]", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADDRESS
========================= */
router.post("/address", syncAuth, async (req, res) => {
  try {
    const { records, action } = extractRecords(req.body);

    if (!records.length) return res.json({ ok: true });

    if (action === "delete") {
      records.forEach((r) => deleteAddress(r.Id));
      return res.json({ ok: true, action });
    }

    const parsed = records.map(parseAddress);
    syncAddressList(parsed);

    return res.json({ ok: true, action });

  } catch (err) {
    console.error("[Sync/address]", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   PAYMENT
========================= */
router.post("/payment", syncAuth, async (req, res) => {
  try {
    const { records, action } = extractRecords(req.body);

    if (!records.length) return res.json({ ok: true });

    if (action === "delete") {
      records.forEach((r) => deletePayment(r.Id));
      return res.json({ ok: true, action });
    }

    records.forEach((r) => {
      const payment = {
        paymentId: r.Id,
        orderId: r.Order__c,
        status: r.Payment_Status__c,
        amount: parseFloat(r.Amount__c || 0),
        paymentMethod: r.Payment_Method__c,
        transactionId: r.Transaction_ID__c,
        createdAt: r.Payment_Date__c || r.CreatedDate,
      };

      syncPayment(payment, r.Customer__c);
    });

    return res.json({ ok: true, action });

  } catch (err) {
    console.error("[Sync/payment]", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ACCOUNT (CUSTOMER)
========================= */
router.post("/account", syncAuth, async (req, res) => {
  try {
    const { records, action } = extractRecords(req.body);

    if (!records.length) return res.json({ ok: true });

    if (action === "delete") {
      records.forEach((r) => deleteCustomer(r.Id));
      return res.json({ ok: true, action });
    }

    records.forEach((r) => syncCustomer(r));

    return res.json({ ok: true, action });

  } catch (err) {
    console.error("[Sync/account]", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;