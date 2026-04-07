const axios = require("axios");
require("dotenv").config();

let cachedToken = null;
let instanceUrl  = null;
let tokenExpiry  = null;

/**
 * Fetches a new access token from Salesforce using
 * the Username-Password OAuth flow (Integration Admin creds).
 */
const fetchAccessToken = async () => {
  const {
    SF_LOGIN_URL,
    SF_USERNAME_ADMIN,
    SF_PASSWORD_ADMIN,
    SF_TOKEN_ADMIN,
    SF_CLIENT_ID,
    SF_CLIENT_SECRET,
  } = process.env;

  const response = await axios.post(
    `${SF_LOGIN_URL}/services/oauth2/token`,
    null,
    {
      params: {
        grant_type:    "password",
        client_id:     SF_CLIENT_ID,
        client_secret: SF_CLIENT_SECRET,
        username:      SF_USERNAME_ADMIN,
        password:      SF_PASSWORD_ADMIN + SF_TOKEN_ADMIN,
      },
    }
  );
  return response.data; // { access_token, instance_url, ... }
};

/**
 * Returns a valid { accessToken, instanceUrl }.
 * Re-authenticates automatically when the cached token is ~expired.
 */
const getValidToken = async () => {
  if (cachedToken && Date.now() < tokenExpiry) {
    return { accessToken: cachedToken, instanceUrl };
  }

  const data = await fetchAccessToken();
  cachedToken  = data.access_token;
  instanceUrl  = data.instance_url;
  tokenExpiry  = Date.now() + 1000 * 60 * 60 * 2; // 2 hours

  return { accessToken: cachedToken, instanceUrl };
};

module.exports = { getValidToken };
