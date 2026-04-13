/**
 * services/salesforce/sfAddressService.js
 * All Salesforce Apex REST calls for Address__c object.
 *
 * Required Apex endpoints (create in Salesforce):
 *   GET    /CustomerAddresses   { customerId }  → Address__c[]
 *   POST   /CustomerAddresses   { body }        → Address__c
 *   PUT    /CustomerAddresses   { body }        → Address__c
 *   DELETE /CustomerAddresses   { addressId }   → { status }
 *   PUT    /SetDefaultAddress   { customerId, addressId } → { status }
 */
const { sfGet, sfPost, sfPut } = require("./sfClient");
const axios = require("axios");
const { getValidToken } = require("../../config/salesforceToken");

/** Fetch all addresses for a customer */
const sfGetAddresses = (customerId) =>
  sfGet("/CustomerAddresses", { customerId });

/** Create a new address */
const sfCreateAddress = (data) =>
  sfPost("/CustomerAddresses", data);

/** Update an existing address */
const sfUpdateAddress = (data) =>
  sfPut("/CustomerAddresses", data);

/** Delete an address — needs raw DELETE call */
const sfDeleteAddress = async (addressId) => {
  const { accessToken, instanceUrl } = await getValidToken();
  const response = await axios.delete(
    `${instanceUrl}/services/apexrest/CustomerAddresses`,
    {
      params: { addressId },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  const raw = response.data;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
};

/** Set one address as default (unsets all others) */
const sfSetDefaultAddress = (customerId, addressId) =>
  sfPut("/SetDefaultAddress", { customerId, addressId });

module.exports = {
  sfGetAddresses,
  sfCreateAddress,
  sfUpdateAddress,
  sfDeleteAddress,
  sfSetDefaultAddress,
};