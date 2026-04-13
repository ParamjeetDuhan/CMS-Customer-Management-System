const parseInvoice = (sf = {}) => ({
  id:            sf.Id || sf.invoiceId || null,

  orderId:       sf.Order__c || sf.orderId || null,
  shopId:        sf.Shop__c || sf.shopId || null,
  customerId:    sf.Customer__c || sf.customerId || null,

  invoiceNumber: sf.Invoice_Number__c || sf.invoiceNumber || "",
  
  totalAmount:   parseFloat(sf.Total_Amount__c || sf.totalAmount || 0),
  taxAmount:     parseFloat(sf.Tax_Amount__c || sf.taxAmount || 0),
  discount:      parseFloat(sf.Discount__c || sf.discount || 0),

  status:        sf.Status__c || sf.status || "Generated",

  issueDate:     sf.Issue_Date__c || sf.issueDate || null,
  dueDate:       sf.Due_Date__c || sf.dueDate || null,

  pdfUrl:        sf.Invoice_PDF__c || sf.pdfUrl || null,

  createdAt:     sf.CreatedDate || null,
});

const parseInvoiceList = (sfList = []) =>
  Array.isArray(sfList) ? sfList.map(parseInvoice) : [];

module.exports = { parseInvoice, parseInvoiceList };