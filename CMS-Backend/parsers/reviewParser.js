/**
 * parsers/reviewParser.js
 */

const parseReview = (sf = {}) => ({
  id:         sf.Id          || null,
  shopId:     sf.Shop__c     || null,
  customerId: sf.Customer__c || null,
  customerName: sf.Customer_Name__c || sf.Name || "Anonymous",
  rating:     parseFloat(sf.Rating__c || 0),
  comment:    sf.Comment__c  || "",
  createdAt:  sf.CreatedDate || null,
});

const parseReviewList = (sfList = []) =>
  Array.isArray(sfList) ? sfList.map(parseReview) : [];

module.exports = { parseReview, parseReviewList };
