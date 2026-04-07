/**
 * services/salesforce/sfAuthService.js
 */
const { sfPost, sfGet, sfPut } = require("./sfClient");

/** Register a new customer in Salesforce */
const sfSignUp = (data) => sfPost("/signup", data);

/** Validate credentials against Salesforce */
const sfLogin  = (data) => sfPost("/login", data);


/** profile */
const sfUpdateProfile = (customerid, data) =>
  sfPut("/CustomerProfile", { customerid, ...data });

const sfChangePassword = (customerid, data) =>
  sfPut("/UpdatePassword", { customerid, ...data });

const sfGetProfileByEmail = (Email) => 
  sfGet("/GetCustomer",  { Email });

/** Trigger forgot-password flow */

const sfSaveResetToken = (customerid, hashedToken, expiresAt) =>
  sfPut("/CustomerProfile", { customerid, hashedToken, expiresAt });

/** Reset password with token */
const sfGetUserByResetToken = (hashedToken) =>
  sfGet("/GetCustomer", { hashedToken });

const sfUpdatePassword = (customerid, newPassword) =>
  sfPut("/UpdatePassword", { customerid, newPassword });

const sfClearResetToken = (customerid) =>
  sfPut("/ClearResetToken", { customerid });
 

module.exports = {
  sfSignUp,
  sfLogin,
  sfGetProfileByEmail,
  sfUpdateProfile,
  sfChangePassword,
  sfSaveResetToken,
  sfGetUserByResetToken,
  sfUpdatePassword,
  sfClearResetToken,
};
