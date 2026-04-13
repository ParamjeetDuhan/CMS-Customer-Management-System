/**
 * parsers/addressParser.js
 * FIX: consistent field mapping, safe isDefault
 */
const parseAddress = (sf = {}) => ({
  id:         sf.Id             || sf.id         || null,
  label:      sf.Label__c       || sf.label      || "Home",
  name:       sf.Name__c        || sf.Contact_Name__c || sf.name || "",
  phone:      sf.Phone__c       || sf.phone      || "",
  line1:      sf.Line1__c       || sf.Street__c  || sf.line1   || "",
  city:       sf.City__c        || sf.city       || "",
  state:      sf.State__c       || sf.state      || "",
  pincode:    sf.Pincode__c     || sf.PostalCode__c || sf.pincode || "",
  isDefault:  Boolean(sf.Is_Default__c ?? sf.isDefault ?? false),
  customerId: sf.Customer__c    || sf.customerId || null,
  createdAt:  sf.CreatedDate    || null,
});

const parseAddressList = (sfList = []) =>
  Array.isArray(sfList) ? sfList.map(parseAddress) : [];

module.exports = { parseAddress, parseAddressList };
