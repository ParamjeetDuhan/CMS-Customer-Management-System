/**
 * parsers/productParser.js
 * Transforms raw Salesforce Product__c records
 * into the product shape the frontend expects.
 */

const parseProduct = (sf = {}) => ({
  id:          sf.Id           || sf.id          || null,
  name:        sf.Name         || "",
  description: sf.Description__c || sf.Description || "",
  price:       parseFloat(sf.Price__c   || sf.UnitPrice || 0),
  mrp:         parseFloat(sf.MRP__c     || sf.Price__c  || 0),
  stock:       parseInt(sf.Stock__c     || 0, 10),
  category:    sf.Category__c  || sf.Family       || "General",
  image:       sf.Image_URL__c || null,
  available:   sf.Is_Available__c !== undefined
                 ? Boolean(sf.Is_Available__c)
                 : (parseInt(sf.Stock__c || 0, 10) > 0),
  unit:        sf.Unit__c      || "piece",
  shopId:      sf.Shop__c      || sf.Shop_ID__c   || null,
  createdAt:   sf.CreatedDate  || null,
});

const parseProductList = (sfList = []) =>
  Array.isArray(sfList) ? sfList.map(parseProduct) : [];

module.exports = { parseProduct, parseProductList };
