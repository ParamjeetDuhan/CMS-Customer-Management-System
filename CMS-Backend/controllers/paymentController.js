/**
 * controllers/paymentController.js
 */
const {
  sfInitiatePayment,
  sfVerifyPayment,
  sfGetPaymentStatus,
} = require("../services/salesforce/sfPaymentService");

/* ── POST /api/payments/initiate ── */
const initiatePayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;
    if (!orderId || !paymentMethod) {
      return res.status(400).json({ message: "orderId and paymentMethod are required" });
    }

    const sfResult = await sfInitiatePayment({
      orderId,
      paymentMethod,
      amount,
      customerId: req.user.id,
    });
    const raw = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

    /* Normalise payment initiation response */
    const payment = {
      paymentId:     raw?.paymentId     || raw?.Payment_ID__c     || raw?.id     || null,
      orderId:       raw?.orderId       || raw?.Order__c           || orderId,
      status:        raw?.status        || raw?.Payment_Status__c  || "Pending",
      amount:        parseFloat(raw?.amount || raw?.Amount__c || amount || 0),
      paymentMethod: raw?.paymentMethod || paymentMethod,
      gatewayData:   raw?.gatewayData   || raw?.Gateway_Data__c   || null,  // e.g. Razorpay order_id
      createdAt:     raw?.createdAt     || raw?.CreatedDate        || null,
    };

    return res.status(200).json({ message: "Payment initiated", payment });
  } catch (err) {
    console.error("initiatePayment error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/payments/verify ── */
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, gatewayResponse } = req.body;
    if (!orderId || !paymentId) {
      return res.status(400).json({ message: "orderId and paymentId are required" });
    }

    const sfResult = await sfVerifyPayment({
      orderId,
      paymentId,
      signature,
      gatewayResponse,
      customerId: req.user.id,
    });
    const raw = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

    if (raw?.status && raw.status !== "Success") {
      return res.status(400).json({ message: raw.message || "Payment verification failed" });
    }

    const payment = {
      paymentId:     raw?.paymentId     || raw?.Payment_ID__c   || paymentId,
      orderId:       raw?.orderId       || orderId,
      status:        raw?.status        || raw?.Payment_Status__c || "Paid",
      amount:        parseFloat(raw?.amount || raw?.Amount__c || 0),
      verifiedAt:    raw?.verifiedAt    || raw?.LastModifiedDate  || null,
    };

    return res.status(200).json({ message: "Payment verified", payment });
  } catch (err) {
    console.error("verifyPayment error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/payments/status/:orderId ── */
const getPaymentStatus = async (req, res) => {
  try {
    const sfResult = await sfGetPaymentStatus(req.params.orderId);
    const raw      = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

    const status = {
      orderId:       req.params.orderId,
      paymentId:     raw?.paymentId     || raw?.Payment_ID__c     || null,
      status:        raw?.status        || raw?.Payment_Status__c  || "Pending",
      amount:        parseFloat(raw?.amount || raw?.Amount__c || 0),
      paymentMethod: raw?.paymentMethod || raw?.Payment_Method__c  || null,
      paidAt:        raw?.paidAt        || raw?.Paid_At__c         || null,
    };

    return res.status(200).json({ payment: status });
  } catch (err) {
    console.error("getPaymentStatus error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { initiatePayment, verifyPayment, getPaymentStatus };
