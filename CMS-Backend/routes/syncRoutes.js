const express = require("express");
const router  = express.Router();

const {
  syncShop, deleteShop,
  syncProduct, deleteProduct,
  syncOrder, syncOrderItems, deleteOrder,
  syncReview, deleteReview,
  syncAddress, deleteAddress,
  syncPayment, deletePayment,
  syncCustomer, deleteCustomer,
  syncInvoice, deleteInvoice,
} = require("../services/syncHelpers");

const extractRecords = (body) => {
  if (Array.isArray(body)) return { records: body, action: body[0]?.action || "upsert" };
  if (body?.records) return { records: body.records, action: body.action || "upsert" };
  return { records: [body], action: body.action || "upsert" };
};

/* ========================= */
const handler = (syncFn, deleteFn) => async (req, res) => {
  try {
    const { records, action } = extractRecords(req.body);

    if (!records.length) return res.json({ ok: true });

    if (action === "delete") {
      for (const r of records) await deleteFn(r.id || r.Id);
      return res.json({ ok: true, action });
    }

    for (const r of records) await syncFn(r);

    res.json({ ok: true, action });

  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ========================= */
router.post("/shop", handler(syncShop, deleteShop));
router.post("/product", handler(syncProduct, deleteProduct));

router.post("/order", async (req, res) => {
  try {
    const { records, action } = extractRecords(req.body);

    if (action === "delete") {
      for (const r of records) await deleteOrder(r.Id || r.id);
      return res.json({ ok: true });
    }

    for (const r of records) {
      await syncOrder(r, r.customerId || r.customerid);
      await syncOrderItems(r);
    }

    res.json({ ok: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/review", handler(syncReview, deleteReview));
router.post("/address", handler(syncAddress, deleteAddress));
router.post("/payment", handler(syncPayment, deletePayment));
router.post("/invoice", handler(syncInvoice, deleteInvoice));
router.post("/account", handler(syncCustomer, deleteCustomer));

module.exports = router;