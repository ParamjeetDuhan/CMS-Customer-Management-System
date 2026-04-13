/**
 * controllers/orderController.js
 * FIX: Mongo order docs mapped to parsed shape before return.
 *      syncOrder uses syncHelpers (fire-and-forget, never blocks).
 */
const {
  sfPlaceOrder, sfGetMyOrders, sfGetOrderById,
  sfCancelOrder, sfReorder, sfTrackOrder, sfSubmitFeedback,
} = require("../services/salesforce/sfOrderService");
const { parseOrder, parseOrderList } = require("../parsers/orderParser");
const OrderModel = require("../models/order");
const { syncOrder, syncOrderList } = require("../services/syncHelpers");
const InvoiceModel = require("../models/invoice");
const { syncInvoice } = require("../services/syncHelpers");
const { parseInvoice } = require("../parsers/invoiceParser");
const { sfGetInvoiceById } = require("../services/salesforce/sfInvoiceService");

const cId = (req) => req.user.id;

const docToOrder = (doc) => ({
  id: doc.salesforceId, orderNumber: doc.orderNumber || "",
  customerId: doc.customerId, shopId: doc.shopId, shopName: doc.shopName || "",
  status: doc.status, paymentStatus: doc.paymentStatus, paymentMethod: doc.paymentMethod || "cod",
  items: doc.items || [], subtotal: doc.subtotal || 0, deliveryFee: doc.deliveryFee || 0,
  discount: doc.discount || 0, total: doc.totalAmount || 0, totalAmount: doc.totalAmount || 0,
  address: doc.customerAddress || doc.address || "", notes: doc.notes || "",
  cancelReason: doc.cancelReason || null, deliveredAt: doc.deliveredAt || null,
  createdAt: doc.createdAt || null,
});

/* ── POST /api/orders ── */
const placeOrder = async (req, res) => {
  try {
    const { AccountId, ShopId, OrderDate, TotalAmount, DeliveryAddress, ProductList, paymentMethod, subtotal, deliveryFee, taxes } = req.body;

    const payload = {
      AccountId, ShopId, OrderDate, TotalAmount, DeliveryAddress,
      ProductList: (ProductList || []).map((i) => ({
        ProductId: i.ProductId || i.id,
        Quantity:  i.Quantity,
        Price:     i.Price,
      })),
      paymentMethod: paymentMethod || "cod",
      subtotal, deliveryFee, taxes,
    };

    const sfResult = await sfPlaceOrder(payload);
    const raw = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    if (raw?.status && raw.status !== "Success")
      return res.status(400).json({ message: raw.message || "Failed to place order" });

    const order = parseOrder(raw?.data || raw);
    syncOrder(order, AccountId);
    return res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("placeOrder error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/orders/my ── */
const getMyOrders = async (req, res) => {
  try {
    const userId = cId(req);
    const mongoDocs = await OrderModel.find({ customerId: userId }).lean();
    if (mongoDocs.length > 0) {
      return res.status(200).json({ orders: mongoDocs.map(docToOrder), total: mongoDocs.length });
    }

    const sfResult = await sfGetMyOrders(userId, req.query);
    const raw  = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const list = Array.isArray(raw) ? raw : (raw?.data || raw?.records || []);
    const orders = parseOrderList(list);
    syncOrderList(orders, userId);
    return res.status(200).json({ orders, total: orders.length });
  } catch (err) {
    console.error("getMyOrders error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/orders/:id ── */
const getOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = cId(req);

    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    /* =========================
       STEP 1: Mongo (ORDER)
    ========================= */
    const mongoOrder = await OrderModel.findOne({ salesforceId: id }).lean();

    /* =========================
       STEP 2: Mongo (INVOICE)
    ========================= */
    const mongoInvoice = await InvoiceModel.findOne({ orderId: id }).lean();

    if (mongoOrder) {
      return res.status(200).json({
        order: docToOrder(mongoOrder),
        invoice: mongoInvoice || null,
      });
    }

    /* =========================
       STEP 3: Salesforce (ORDER)
    ========================= */
    const sfOrderRes = await sfGetOrderById(id, userId);
    const rawOrder =
      typeof sfOrderRes === "string" ? JSON.parse(sfOrderRes) : sfOrderRes;

    const orderData = rawOrder?.data || rawOrder;

    if (!orderData) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = parseOrder(orderData);

    /* =========================
       STEP 4: Salesforce (INVOICE)
    ========================= */
    let invoice = null;

    try {
      const sfInvoiceRes = await sfGetInvoiceById(id);
      let rawInvoice =
        typeof sfInvoiceRes === "string"
          ? JSON.parse(sfInvoiceRes)
          : sfInvoiceRes;

      if (Array.isArray(rawInvoice)) rawInvoice = rawInvoice[0];
      if (Array.isArray(rawInvoice?.data)) rawInvoice = rawInvoice.data[0];
      else if (rawInvoice?.data) rawInvoice = rawInvoice.data;

      if (rawInvoice) {
        invoice = parseInvoice(rawInvoice);

        /* 🔥 Sync invoice */
        syncInvoice(invoice, userId);
      }
    } catch (err) {
      console.warn("Invoice fetch failed:", err.message);
    }

    /* =========================
       STEP 5: Sync ORDER
    ========================= */
    syncOrder(order, userId);

    /* =========================
       FINAL RESPONSE
    ========================= */
    return res.status(200).json({
      order,
      invoice, // 🔥 combined response
    });

  } catch (err) {
    console.error("getOrderById error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};
/* ── PUT /api/orders/:id/cancel ── */
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const sfResult = await sfCancelOrder(req.params.id, reason || "", cId(req));
    const raw = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    if (raw?.status && raw.status !== "Success")
      return res.status(400).json({ message: raw.message || "Cannot cancel order" });

    const order = parseOrder(raw?.data || raw);
    syncOrder(order, cId(req));
    return res.status(200).json({ message: "Order cancelled", order });
  } catch (err) {
    console.error("cancelOrder error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/orders/:id/reorder ── */
const reorder = async (req, res) => {
  try {
    const sfResult = await sfReorder(req.params.id, cId(req));
    const raw  = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const order = parseOrder(raw?.data || raw);
    syncOrder(order, cId(req));
    return res.status(201).json({ message: "Reorder placed successfully", order });
  } catch (err) {
    console.error("reorder error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/orders/:id/track ── */
const trackOrder = async (req, res) => {
  try {
    const sfResult  = await sfTrackOrder(req.params.id, cId(req));
    const raw       = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const trackData = raw?.data || raw;
    return res.status(200).json({
      tracking: {
        orderId:           req.params.id,
        status:            trackData?.Status__c            || trackData?.status           || "Pending",
        estimatedDelivery: trackData?.Estimated_Delivery__c || trackData?.estimatedDelivery || null,
        currentLocation:   trackData?.Current_Location__c   || trackData?.currentLocation   || null,
        steps:             trackData?.Steps__c              || trackData?.steps             || [],
        updatedAt:         trackData?.LastModifiedDate      || trackData?.updatedAt          || null,
      },
    });
  } catch (err) {
    console.error("trackOrder error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/orders/:id/feedback ── */
const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ message: "rating is required" });
    await sfSubmitFeedback(req.params.id, { rating, comment }, cId(req));
    return res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("submitFeedback error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder, reorder, trackOrder, submitFeedback };
