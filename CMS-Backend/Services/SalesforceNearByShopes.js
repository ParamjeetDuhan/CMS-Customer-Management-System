const axios = require('axios');
const { getValidToken } = require("../config/SalesforceTokenManager");

const GetShopes = async (Location) => {
    const { accessToken, instanceUrl } = await getValidToken();
    const response = await axios.get(
        `${instanceUrl}/services/apexrest/FindNearbyShopes`,
        {
            params: {
                lat: Location.lat,
                lng: Location.lng
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
};

module.exports = { GetShopes };