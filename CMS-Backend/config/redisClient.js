const redis = require("redis");
require("dotenv").config();

const client = redis.createClient({
    url: process.env.REDIS_URL
});

client.on("error", (err) => {
    console.log("❌ Redis Error:", err.message);
});

client.on("ready", () => {
    console.log("✅ Redis Connected");
});

// connect once
(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.log("❌ Redis not available");
    }
})();

// ✅ FUNCTION instead of variable
const isRedisReady = () => client.isOpen;

module.exports = { client, isRedisReady };