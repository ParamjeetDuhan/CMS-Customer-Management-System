const STATUS_MAP = {
  Pending: "Pending", Confirmed: "Confirmed", Preparing: "Preparing",
  Shipped: "Shipped", Delivered: "Delivered", Cancelled: "Cancelled",
};

const PAYMENT_STATUS_MAP = {
  Pending: "Pending", Paid: "Paid", Failed: "Failed", Refunded: "Refunded",
};

/* 🔥 Order Item Parser */
const parseOrderItem = (sf = {}, orderId = null) => ({
  id:        sf.Id || sf.id || null,

  orderId:   sf.Order__c || orderId || null, // 🔥 IMPORTANT
  productId: sf.Product__c || sf.productId || null,

  name:      sf.Product_Name__c || sf.Name || "",
  price:     parseFloat(sf.Unit_Price__c || sf.Price__c || 0),
  quantity:  parseInt(sf.Quantity__c || sf.quantity || 1, 10),

  image:     sf.Product_Image__c || null,

  subtotal:  parseFloat(
    sf.Subtotal__c ||
    (sf.Unit_Price__c * sf.Quantity__c) ||
    0
  ),

  createdAt: sf.CreatedDate || null,
});

/* 🔥 Order Parser */
const parseOrder = (sf = {}) => {
  if (Array.isArray(sf)) sf = sf[0] || {};

  const orderId = sf.Id || sf.id || null;

  const items = Array.isArray(sf.Order_Items__r?.records)
    ? sf.Order_Items__r.records.map((item) =>
        parseOrderItem(item, orderId)
      )
    : Array.isArray(sf.items)
      ? sf.items.map((item) => parseOrderItem(item, orderId))
      : [];

  return {
    id:            orderId,

    orderNumber:   sf.Order_Number__c || sf.Name || "",

    customerId:    sf.Account__c || sf.Customer__c || sf.customerId || null,
    shopId:        sf.Shop__c || sf.shopId || null,
    shopName:      sf.Shop_Name__c || "",

    status:        STATUS_MAP[sf.Status__c] || sf.Status__c || "Pending",
    paymentStatus: PAYMENT_STATUS_MAP[sf.Payment_Status__c] || "Pending",
    paymentMethod: sf.Payment_Method__c || "cod",

    items, // ✅ still stored inside order

    subtotal:      parseFloat(sf.Subtotal__c || 0),
    deliveryFee:   parseFloat(sf.Delivery_Fee__c || 0),
    discount:      parseFloat(sf.Discount__c || 0),

    total:         parseFloat(sf.Total_Amount__c || sf.TotalAmount || 0),
    totalAmount:   parseFloat(sf.Total_Amount__c || sf.TotalAmount || 0),

    address:       sf.Delivery_Address__c || sf.address || "",
    notes:         sf.Notes__c || "",

    trackingInfo:  sf.Tracking_Info__c || null,
    estimatedDelivery: sf.Estimated_Delivery__c || null,

    deliveredAt:   sf.Delivered_At__c || null,
    cancelReason:  sf.Cancel_Reason__c || null,

    createdAt:     sf.CreatedDate || null,
    updatedAt:     sf.LastModifiedDate || null,
  };
};

const parseOrderList = (sfList = []) =>
  Array.isArray(sfList) ? sfList.map(parseOrder) : [];

module.exports = {
  parseOrder,
  parseOrderList,
  parseOrderItem,
};