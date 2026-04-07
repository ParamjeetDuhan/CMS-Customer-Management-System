/**
 * services/salesforce/sfPaymentService.js
 */
const { sfPost, sfGet } = require("./sfClient");

const sfInitiatePayment = (data)    => sfPost("/InitiatePayment", data);
const sfVerifyPayment   = (data)    => sfPost("/VerifyPayment",   data);
const sfGetPaymentStatus = (orderId) => sfGet("/PaymentStatus",  { orderId });

module.exports = { sfInitiatePayment, sfVerifyPayment, sfGetPaymentStatus };
