const redis = require("redis");
require("dotenv").config();

const client = redis.createClient({ url: process.env.REDIS_URL });

client.on("error",  (err) => console.log("❌ Redis Error:", err.message));
client.on("ready",  ()    => console.log("✅ Redis Connected"));

(async () => {
  try {
    if (process.env.REDIS_URL) await client.connect();
    else console.log("⚠️  REDIS_URL not set – caching disabled");
  } catch (err) {
    console.log("❌ Redis not available:", err.message);
  }
})();

const isRedisReady = () => client.isOpen;

module.exports = { client, isRedisReady };
