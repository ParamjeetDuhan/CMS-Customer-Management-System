/**
 * controllers/paymentController.js
 * FIX: Payment model import case (payment not Payment), syncPayment helper.
 */
const {
  sfInitiatePayment, sfVerifyPayment, sfGetPaymentStatus,
} = require("../services/salesforce/sfPaymentService");
const PaymentModel = require("../models/payment");
const { syncPayment } = require("../services/syncHelpers");

/* ── POST /api/payments/initiate ── */
const initiatePayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;
    if (!orderId || !paymentMethod)
      return res.status(400).json({ message: "orderId and paymentMethod are required" });

    const sfResult = await sfInitiatePayment({ orderId, paymentMethod, amount, customerId: req.user.id });
    const raw = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

    const payment = {
      paymentId:     raw?.paymentId     || raw?.Payment_ID__c  || raw?.id   || null,
      orderId:       raw?.orderId       || raw?.Order__c        || orderId,
      status:        raw?.status        || raw?.Payment_Status__c || "Pending",
      amount:        parseFloat(raw?.amount  || raw?.Amount__c  || amount || 0),
      paymentMethod: raw?.paymentMethod || paymentMethod,
      transactionId: raw?.Transaction_ID__c  || null,
      createdAt:     raw?.createdAt     || raw?.CreatedDate     || null,
    };

    syncPayment(payment, req.user.id);
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
    if (!orderId || !paymentId)
      return res.status(400).json({ message: "orderId and paymentId are required" });

    const sfResult = await sfVerifyPayment({ orderId, paymentId, signature, gatewayResponse, customerId: req.user.id });
    const raw = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    if (raw?.status && raw.status !== "Success")
      return res.status(400).json({ message: raw.message || "Payment verification failed" });

    const payment = {
      paymentId:  raw?.paymentId || raw?.Payment_ID__c || paymentId,
      orderId,
      status:     raw?.status   || raw?.Payment_Status__c || "Paid",
      amount:     parseFloat(raw?.amount || raw?.Amount__c || 0),
      verifiedAt: raw?.verifiedAt || raw?.LastModifiedDate || null,
    };

    // Update Mongo status
    setImmediate(async () => {
      try {
        await PaymentModel.updateOne(
          { salesforceId: payment.paymentId },
          { $set: { status: payment.status, paymentDate: payment.verifiedAt } }
        );
      } catch (e) { console.error("[sync/payment/verify]", e.message); }
    });

    return res.status(200).json({ message: "Payment verified", payment });
  } catch (err) {
    console.error("verifyPayment error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── GET /api/payments/status/:orderId ── */
const getPaymentStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    /* Step 1: Mongo */
    const mongoPayment = await PaymentModel.findOne({ orderId }).lean();
    if (mongoPayment) {
      return res.status(200).json({
        payment: {
          orderId,
          paymentId:     mongoPayment.salesforceId,
          status:        mongoPayment.status,
          amount:        mongoPayment.amount,
          paymentMethod: mongoPayment.paymentMethod,
          paidAt:        mongoPayment.paymentDate,
        },
      });
    }

    /* Step 2: Salesforce */
    const sfResult = await sfGetPaymentStatus(orderId);
    const raw = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

    const payment = {
      paymentId:     raw?.paymentId     || raw?.Payment_ID__c    || null,
      orderId,
      status:        raw?.status        || raw?.Payment_Status__c || "Pending",
      amount:        parseFloat(raw?.amount || raw?.Amount__c || 0),
      paymentMethod: raw?.paymentMethod || raw?.Payment_Method__c || null,
      paidAt:        raw?.paidAt        || raw?.Paid_At__c        || null,
    };

    syncPayment(
      { paymentId: payment.paymentId, orderId, status: payment.status, amount: payment.amount, paymentMethod: payment.paymentMethod, createdAt: payment.paidAt },
      req.user?.id
    );

    return res.status(200).json({ payment });
  } catch (err) {
    console.error("getPaymentStatus error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { initiatePayment, verifyPayment, getPaymentStatus };
