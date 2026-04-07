/**
 * controllers/orderController.js
 *
 * All Salesforce responses normalised through orderParser.
 */
const {
  sfPlaceOrder,
  sfGetMyOrders,
  sfGetOrderById,
  sfCancelOrder,
  sfReorder,
  sfTrackOrder,
  sfSubmitFeedback,
} = require("../services/salesforce/sfOrderService");
const { parseOrder, parseOrderList } = require("../parsers/orderParser");

const customerId = (req) => req.user.id;

/* ── POST /api/orders ── */
const placeOrder = async (req, res) => {
  try {
    const { shopId, items, address, paymentMethod, notes } = req.body;

    if (!shopId || !items?.length || !address) {
      return res.status(400).json({ message: "shopId, items and address are required" });
    }

    const payload = {
      customerId: customerId(req),
      shopId,
      items: items.map((i) => ({
        productId: i.productId || i.id,
        quantity:  i.quantity,
        price:     i.price,
      })),
      address,
      paymentMethod: paymentMethod || "cod",
      notes: notes || "",
    };

    const sfResult = await sfPlaceOrder(payload);
    const raw      = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    if (raw?.status && raw.status !== "Success") {
      return res.status(400).json({ message: raw.message || "Failed to place order" });
    }

    const order = parseOrder(raw?.data || raw);
    return res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("placeOrder error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/orders/my?page=&limit=&status= ── */
const getMyOrders = async (req, res) => {
  try {
    const sfResult = await sfGetMyOrders(customerId(req), req.query);
    const raw      = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const list     = Array.isArray(raw) ? raw : (raw?.data || raw?.records || []);
    const orders   = parseOrderList(list);
    return res.status(200).json({ orders, total: orders.length });
  } catch (err) {
    console.error("getMyOrders error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/orders/:id ── */
const getOrderById = async (req, res) => {
  try {
    const sfResult = await sfGetOrderById(req.params.id, customerId(req));
    const raw      = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const orderData = raw?.data || raw;
    if (!orderData) return res.status(404).json({ message: "Order not found" });
    const order = parseOrder(orderData);
    return res.status(200).json({ order });
  } catch (err) {
    console.error("getOrderById error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── PUT /api/orders/:id/cancel ── */
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const sfResult   = await sfCancelOrder(req.params.id, reason || "", customerId(req));
    const raw        = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    if (raw?.status && raw.status !== "Success") {
      return res.status(400).json({ message: raw.message || "Cannot cancel order" });
    }
    const order = parseOrder(raw?.data || raw);
    return res.status(200).json({ message: "Order cancelled", order });
  } catch (err) {
    console.error("cancelOrder error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/orders/:id/reorder ── */
const reorder = async (req, res) => {
  try {
    const sfResult = await sfReorder(req.params.id, customerId(req));
    const raw      = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const order    = parseOrder(raw?.data || raw);
    return res.status(201).json({ message: "Reorder placed successfully", order });
  } catch (err) {
    console.error("reorder error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/orders/:id/track ── */
const trackOrder = async (req, res) => {
  try {
    const sfResult = await sfTrackOrder(req.params.id, customerId(req));
    const raw      = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const trackData = raw?.data || raw;
    /* Return a flat tracking object; order detail already has full order */
    const tracking = {
      orderId:           req.params.id,
      status:            trackData?.Status__c          || trackData?.status         || "Pending",
      estimatedDelivery: trackData?.Estimated_Delivery__c || trackData?.estimatedDelivery || null,
      currentLocation:   trackData?.Current_Location__c   || trackData?.currentLocation   || null,
      steps:             trackData?.Steps__c             || trackData?.steps             || [],
      updatedAt:         trackData?.LastModifiedDate     || trackData?.updatedAt          || null,
    };
    return res.status(200).json({ tracking });
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

    await sfSubmitFeedback(req.params.id, { rating, comment }, customerId(req));
    return res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("submitFeedback error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  reorder,
  trackOrder,
  submitFeedback,
};
