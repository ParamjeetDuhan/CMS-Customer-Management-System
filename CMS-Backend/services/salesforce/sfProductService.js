/**
 * services/salesforce/sfProductService.js
 */
const { sfGet } = require("./sfClient");
const { client, isRedisReady } = require("../../config/redisClient");

const CACHE_TTL = 300;

const withCache = async (key, fetchFn) => {
  if (isRedisReady()) {
    const cached = await client.get(key).catch(() => null);
    if (cached) return JSON.parse(cached);
  }
  const data = await fetchFn();
  if (isRedisReady()) {
    client.setEx(key, CACHE_TTL, JSON.stringify(data)).catch(() => {});
  }
  return data;
};

/** Products for a shop */
const sfGetShopProducts = (shopId, params = {}) =>
  withCache(
    `products:${shopId}:${JSON.stringify(params)}`,
    () => sfGet("/products", { Shopid: shopId, ...params })
  );

/** Single product */
const sfGetProductById = (productId) =>
  withCache(`product:${productId}`, () =>
    sfGet("/ProductDetails", { productId })
  );


module.exports = {
  sfGetShopProducts,
  sfGetProductById,
};
