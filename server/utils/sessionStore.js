const crypto = require("crypto");
const { createClient } = require("redis");

let client;

const getClient = () => {
  if (!process.env.REDIS_URL) return null;
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (error) => console.error("Redis connection error:", error.message));
  }
  return client;
};

const ensureReady = async (redis) => {
  try {
    if (!redis.isReady) await redis.connect();
    return redis.isReady;
  } catch (error) {
    console.error("Redis connection failed:", error.message);
    return false;
  }
};

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const sessionKey = (token) => `chaitaniya:session:${hashToken(token)}`;

exports.createSession = async (user) => {
  const redis = getClient();
  if (!redis) return null;
  if (!await ensureReady(redis)) return null;

  const refreshToken = crypto.randomBytes(48).toString("hex");
  const ttl = Number(process.env.REFRESH_TOKEN_TTL_SECONDS || 2592000);
  await redis.setEx(sessionKey(refreshToken), ttl, JSON.stringify({
    userId: user._id.toString(),
    role: user.role,
  }));
  return { refreshToken, ttl };
};

exports.rotateSession = async (refreshToken) => {
  const redis = getClient();
  if (!redis || !refreshToken) return null;
  if (!await ensureReady(redis)) return null;

  const session = await redis.getDel(sessionKey(refreshToken));
  if (!session) return null;
  const user = JSON.parse(session);
  const next = await exports.createSession({ _id: user.userId, role: user.role });
  return next ? { ...next, user } : null;
};

exports.revokeSession = async (refreshToken) => {
  const redis = getClient();
  if (!redis || !refreshToken) return;
  if (await ensureReady(redis)) await redis.del(sessionKey(refreshToken));
};

exports.getStatus = () => ({ configured: Boolean(process.env.REDIS_URL), connected: Boolean(client?.isReady) });

exports.getCache = async (key) => {
  const redis = getClient();
  if (!redis) return null;
  if (!await ensureReady(redis)) return null;
  const value = await redis.get(`chaitaniya:cache:${key}`);
  return value ? JSON.parse(value) : null;
};

exports.setCache = async (key, value, ttl = 30) => {
  const redis = getClient();
  if (!redis) return;
  if (await ensureReady(redis)) await redis.setEx(`chaitaniya:cache:${key}`, ttl, JSON.stringify(value));
};

exports.clearCache = async (prefix) => {
  const redis = getClient();
  if (!redis) return;
  if (!await ensureReady(redis)) return;
  const keys = [];
  for await (const key of redis.scanIterator({ MATCH: `chaitaniya:cache:${prefix}*`, COUNT: 100 })) keys.push(key);
  if (keys.length) await redis.del(keys);
};

exports.close = async () => {
  if (client?.isOpen) await client.quit();
};