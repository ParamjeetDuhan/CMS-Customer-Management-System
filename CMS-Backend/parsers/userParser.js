/**
 * parsers/userParser.js
 * Transforms raw Salesforce Account / Contact records
 * into the user shape the frontend expects.
 */

const parseUser = (sfUser = {}) => ({
  id:       sfUser.Account_ID  || sfUser.Id        || sfUser.id        || null,
  name:     sfUser.Name       || sfUser.FullName   || "",
  email:    sfUser.Email      || "",
  phone:    sfUser.Phone      || sfUser.MobilePhone || "",
  userType: sfUser.UserType   || sfUser.User_Type__c || "",
  ExpiryToken : sfUser.TokenExpiry|| ""
});

module.exports = { parseUser };
