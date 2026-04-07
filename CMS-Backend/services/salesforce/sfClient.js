/**
 * services/salesforce/sfClient.js
 * Thin wrapper around axios that injects the SF Bearer token
 * and provides GET / POST / PUT helpers.
 */
const axios = require("axios");
const { getValidToken } = require("../../config/salesforceToken");

const sfRequest = async (method, path, { params, body } = {}) => {
  const { accessToken, instanceUrl } = await getValidToken();
  const url = `${instanceUrl}/services/apexrest${path}`;
  console.log(path,body,params);
  const response = await axios({
    method,
    url,
    params,
    data: body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });

  const raw = response.data;
  console.log(raw);
  return typeof raw === "string" ? JSON.parse(raw) : raw;
};

const sfGet  = (path, params)       => sfRequest("GET",  path, { params });
const sfPost = (path, body)         => sfRequest("POST", path, { body });
const sfPut  = (path, body)         => sfRequest("PUT",  path, { body });

module.exports = { sfGet, sfPost, sfPut };
