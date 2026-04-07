/**
 * services/salesforce/sfShopService.js
 */
const { sfGet, sfPost } = require("./sfClient");
const { client, isRedisReady } = require("../../config/redisClient");

const CACHE_TTL = 300; // 5 min

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

/** Nearby shops by coordinates */
const sfGetNearbyShops = ({ lat, lng, category, sort ,q }) =>
  withCache(
    `shops:nearby:${lat}:${lng}:${category}:${sort}:${q}`,
    () => sfGet("/FindNearbyShopes", { lat, lng, category, sort ,q})
  );

/** All shops (fallback / admin) */
const sfGetAllShops = (params = {}) =>
  withCache(
    `shops:all:${JSON.stringify(params)}`,
    () => sfGet("/Shops", params)
  );

/** Single shop by ID */
const sfGetShopById = (id) =>
  withCache(`shop:${id}`, () => sfGet("/ShopDetails", { shopId: id }));

/** Shop reviews */
const sfGetReviews = (shopId) =>
  withCache(`reviews:${shopId}`, () => sfGet("/ShopReviews", { shopId }));

/** Submit review */
const sfSubmitReview = (shopId, data) =>
  sfPost("/ShopReviews", { shopId, ...data });

module.exports = {
  sfGetNearbyShops,
  sfGetAllShops,
  sfGetShopById,
  sfGetReviews,
  sfSubmitReview,
};
