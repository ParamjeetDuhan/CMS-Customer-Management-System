const parsePayment = (sf = {}) => ({
  id:            sf.Id || sf.paymentId || null,

  orderId:       sf.Custom_order__c || sf.orderId || null,
  shopId:        sf.Shop__c || sf.shopId || null,
  customerId:    sf.Customer__c || sf.customerId || null,

  paymentMethod: sf.Payment_Method__c || sf.paymentMethod || "",
  transactionId: sf.Transaction_ID__c || sf.transactionId || "",

  amount:        parseFloat(sf.Amount__c || sf.amount || 0),
  status:        sf.Status__c || sf.status || "Pending",

  paymentDate:   sf.Payment_Date__c || sf.paymentDate || null,

  createdAt:     sf.CreatedDate || null,
});

const parsePaymentList = (sfList = []) =>
  Array.isArray(sfList) ? sfList.map(parsePayment) : [];

module.exports = { parsePayment, parsePaymentList };