/**
 * services/salesforce/sfInvoiceService.js
 */
const {  sfGet } = require("./sfClient");

/* 🔥 Get all invoices (by customer) */
const sfGetInvoices = (customerId) =>
  sfGet("/GetInvoices", { customerId });

/* 🔥 Get single invoice */
const sfGetInvoiceById = (invoiceId) =>
  sfGet("/GetInvoiceById", { invoiceId });


module.exports = {
  sfGetInvoices,
  sfGetInvoiceById,
};