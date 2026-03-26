const axios = require("axios");
const { client, isRedisReady } = require("../config/redisClient");
const { getValidToken } = require("../config/SalesforceTokenManager");

const GetProduct = async (Shopid) => {
    const cacheKey = `products:${Shopid}`;
    try {
        // Check Redis if connected
        if (isRedisReady()) {
            const cachedData = await client.get(cacheKey);

            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }

        //  Fetch from Salesforce

        const { accessToken, instanceUrl } = await getValidToken();

        const response = await axios.get(
            `${instanceUrl}/services/apexrest/products`,
            {
                params: { Shopid },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const products = response.data;

        // ✅ 3. Save in Redis  if connected
        if (isRedisReady()) {
            await client.setEx(cacheKey, 300, JSON.stringify(products)); // 5 min cache
        }

        return products;

    } catch (error) {
        console.error("❌ Error in GetProduct:", error.message);
        throw error;
    }
};

module.exports = { GetProduct };