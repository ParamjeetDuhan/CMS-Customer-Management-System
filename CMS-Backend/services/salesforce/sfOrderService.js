/**
 * services/salesforce/sfOrderService.js
 */
const { sfGet, sfPost, sfPut } = require("./sfClient");

const sfPlaceOrder     = (data)          => sfPost("/Orders", data);
const sfGetMyOrders    = (customerId, p) => sfGet("/MyOrders",  { customerId, ...p });
const sfGetOrderById   = (id, cId)       => sfGet("/OrderDetails", { orderId: id, customerId: cId });
const sfCancelOrder    = (id, reason, cId) => sfPut("/CancelOrder",  { orderId: id, reason, customerId: cId });
const sfReorder        = (id, cId)       => sfPost("/Reorder",       { orderId: id, customerId: cId });
const sfTrackOrder     = (id, cId)       => sfGet("/TrackOrder",     { orderId: id, customerId: cId });
const sfSubmitFeedback = (id, data, cId) => sfPost("/OrderFeedback", { orderId: id, customerId: cId, ...data });

module.exports = {
  sfPlaceOrder,
  sfGetMyOrders,
  sfGetOrderById,
  sfCancelOrder,
  sfReorder,
  sfTrackOrder,
  sfSubmitFeedback,
};
