const InvoiceModel = require("../models/invoice");

const {
  sfGetInvoices,
  sfGetInvoiceById,
} = require("../services/salesforce/sfInvoiceService");

const {
  parseInvoice,
  parseInvoiceList,
} = require("../parsers/invoiceParser");

const {
  syncInvoice,
  syncInvoiceList,
} = require("../services/syncHelpers");

/* helper */
const cId = (req) => req.user.id;

/* =========================
   GET ALL INVOICES
   GET /api/invoices
========================= */
const getInvoices = async (req, res) => {
  try {
    const userId = cId(req);

    /* 🔥 Step 1: Mongo */
    const mongoDocs = await InvoiceModel.find({ customerId: userId }).lean();

    if (mongoDocs.length > 0) {
      return res.status(200).json({
        invoices: mongoDocs,
        total: mongoDocs.length,
      });
    }

    /* 🔥 Step 2: Salesforce fallback */
    const sfResult = await sfGetInvoices(userId);
    let raw = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

    const list = Array.isArray(raw)
      ? raw
      : (raw?.data || raw?.records || []);

    const invoices = parseInvoiceList(list);

    /* 🔥 Step 3: Cache async */
    syncInvoiceList(invoices, userId);

    return res.status(200).json({
      invoices,
      total: invoices.length,
    });

  } catch (err) {
    console.error("getInvoices error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET SINGLE INVOICE
   GET /api/invoices/:id
========================= */
const getInvoiceById = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    if (!invoiceId) {
      return res.status(400).json({ message: "Invoice ID required" });
    }

    /* 🔥 Step 1: Mongo */
    const mongoDoc = await InvoiceModel.findOne({
      salesforceId: invoiceId,
    }).lean();

    if (mongoDoc) {
      return res.status(200).json({ invoice: mongoDoc });
    }

    /* 🔥 Step 2: Salesforce fallback */
    const sfResult = await sfGetInvoiceById(invoiceId);
    let raw = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

    if (Array.isArray(raw)) raw = raw[0];
    if (Array.isArray(raw?.data)) raw = raw.data[0];
    else if (raw?.data) raw = raw.data;

    if (!raw) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoice = parseInvoice(raw);

    /* 🔥 Step 3: Cache async */
    syncInvoice(invoice, req.user.id);

    return res.status(200).json({ invoice });

  } catch (err) {
    console.error("getInvoiceById error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/invoices/:id/download ── */
const downloadInvoice = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: "Invoice ID required" });
    }

    /* =========================
       STEP 1: Mongo
    ========================= */
    let invoice = await InvoiceModel.findOne({
      salesforceId: id,
    }).lean();

    /* =========================
       STEP 2: Salesforce fallback
    ========================= */
    if (!invoice) {
      const sfResult = await sfGetInvoiceById(id);
      let raw =
        typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

      if (Array.isArray(raw)) raw = raw[0];
      if (Array.isArray(raw?.data)) raw = raw.data[0];
      else if (raw?.data) raw = raw.data;

      if (!raw) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      invoice = parseInvoice(raw);

      /* 🔥 cache */
      syncInvoice(invoice, req.user.id);
    }

    /* =========================
       STEP 3: RETURN PDF
    ========================= */

    // ✅ Case 1: PDF already stored (best)
    if (invoice.pdfUrl) {
      return res.redirect(invoice.pdfUrl);
    }

    // ❗ Case 2: Generate simple PDF (fallback)
    const content = `
      Invoice ID: ${invoice.id}
      Order ID: ${invoice.orderId}
      Amount: ₹${invoice.totalAmount}
      Status: ${invoice.status}
    `;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoice.id}.pdf`
    );

    return res.send(Buffer.from(content));

  } catch (err) {
    console.error("downloadInvoice error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  downloadInvoice,
};