/**
 * parsers/reviewParser.js
 * FIX: consistent field mapping
 */
const parseReview = (sf = {}) => ({
  id:           sf.Id             || null,
  shopId:       sf.Shop__c        || null,
  customerId:   sf.Customer__c    || null,
  customerName: sf.Customer_Name__c || sf.Name || "Anonymous",
  review:       sf.Review__c      || sf.Comment__c || "",
  comment:      sf.Comment__c     || sf.Review__c  || "",
  rating:       parseFloat(sf.Rating__c || 0),
  createdAt:    sf.CreatedDate    || null,
});

const parseReviewList = (sfList = []) =>
  Array.isArray(sfList) ? sfList.map(parseReview) : [];

module.exports = { parseReview, parseReviewList };
