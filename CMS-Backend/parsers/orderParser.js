/**
 * parsers/orderParser.js
 * Transforms raw Salesforce Order__c records
 * into the order shape the frontend expects.
 */

const { parseProduct } = require("./productParser");

const STATUS_MAP = {
  Pending:   "Pending",
  Confirmed: "Confirmed",
  Preparing: "Preparing",
  Shipped:   "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
};

const PAYMENT_STATUS_MAP = {
  Pending:  "Pending",
  Paid:     "Paid",
  Failed:   "Failed",
  Refunded: "Refunded",
};

const parseOrderItem = (sf = {}) => ({
  id:       sf.Id            || sf.id       || null,
  productId: sf.Product__c   || sf.productId || null,
  name:     sf.Product_Name__c || sf.Name   || "",
  price:    parseFloat(sf.Unit_Price__c || sf.Price__c || 0),
  quantity: parseInt(sf.Quantity__c || sf.quantity || 1, 10),
  image:    sf.Product_Image__c || null,
  subtotal: parseFloat(sf.Subtotal__c || 0),
});

const parseOrder = (sf = {}) => ({
  id:            sf.Id             || sf.id          || null,
  orderNumber:   sf.Order_Number__c|| sf.Name        || "",
  status:        STATUS_MAP[sf.Status__c] || sf.Status__c || "Pending",
  paymentStatus: PAYMENT_STATUS_MAP[sf.Payment_Status__c] || "Pending",
  paymentMethod: sf.Payment_Method__c || "cod",
  shopId:        sf.Shop__c        || null,
  shopName:      sf.Shop_Name__c   || "",
  items:         Array.isArray(sf.Order_Items__r?.records)
                   ? sf.Order_Items__r.records.map(parseOrderItem)
                   : [],
  subtotal:      parseFloat(sf.Subtotal__c      || 0),
  deliveryFee:   parseFloat(sf.Delivery_Fee__c  || 0),
  discount:      parseFloat(sf.Discount__c      || 0),
  total:         parseFloat(sf.Total_Amount__c  || 0),
  address:       sf.Delivery_Address__c || "",
  notes:         sf.Notes__c           || "",
  trackingInfo:  sf.Tracking_Info__c   || null,
  estimatedDelivery: sf.Estimated_Delivery__c || null,
  deliveredAt:   sf.Delivered_At__c    || null,
  cancelReason:  sf.Cancel_Reason__c   || null,
  createdAt:     sf.CreatedDate        || null,
  updatedAt:     sf.LastModifiedDate   || null,
});

const parseOrderList = (sfList = []) =>
  Array.isArray(sfList) ? sfList.map(parseOrder) : [];

module.exports = { parseOrder, parseOrderList, parseOrderItem };
