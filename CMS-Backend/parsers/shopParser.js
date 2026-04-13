/**
 * parsers/shopParser.js
 * FIX: Coordinates — handles Location__c compound field + flat fields
 */
const parseShop = (sf = {}) => {
  if (Array.isArray(sf)) sf = sf[0] || {};

  const lat = parseFloat(
    sf.Location__c?.latitude  ||
    sf.Location__Latitude__s  ||
    sf.Latitude__c            ||
    sf.lat                    || 0
  );
  const lng = parseFloat(
    sf.Location__c?.longitude ||
    sf.Location__Longitude__s ||
    sf.Longitude__c           ||
    sf.lng                    || 0
  );

  return {
    id:           sf.Id          || sf.Shop_ID__c || sf.id || null,
    name:         sf.Name        || sf.Shop_Name__c || "",
    category:     sf.Category__c || sf.Type         || "Other",
    description:  sf.Description__c || sf.Description || "",
    address:      sf.Address__c  || sf.BillingStreet || sf.Street__c || "",
    city:         sf.City__c     || sf.BillingCity   || "",
    phone:        sf.Phone__c    || sf.Phone         || "",
    email:        sf.Email__c    || sf.Email         || "",
    image:        sf.Image__c    || null,
    rating:       parseFloat(sf.Rating__c   || sf.Rating  || 0),
    totalReviews: parseInt(sf.Total_Reviews__c || 0, 10),
    distance:     parseFloat(sf.distance || 0),
    isOpen:       sf.Is_Open__c !== undefined ? Boolean(sf.Is_Open__c) : true,
    openTime:     sf.Open_Time__c  || "09:00",
    closeTime:    sf.Close_Time__c || "21:00",
    lat,
    lng,
    ownerId:      sf.OwnerId || null,
  };
};

const parseShopList = (sfList = []) =>
  Array.isArray(sfList) ? sfList.map(parseShop) : [];

module.exports = { parseShop, parseShopList };
