const crypto = require("crypto");
const { createClient } = require("redis");

let client;
let connection;

const getClient = () => {
  if (!process.env.REDIS_URL) return null;
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (error) => console.error("Redis connection error:", error.message));
    connection = client.connect().catch((error) => {
      console.error("Redis connection failed:", error.message);
      return null;
    });
  }
  return client;
};

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const sessionKey = (token) => `chaitaniya:session:${hashToken(token)}`;

exports.createSession = async (user) => {
  const redis = getClient();
  if (!redis) return null;
  await connection;
  if (!redis.isReady) return null;

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
  await connection;
  if (!redis.isReady) return null;

  const session = await redis.getDel(sessionKey(refreshToken));
  if (!session) return null;
  const user = JSON.parse(session);
  const next = await exports.createSession({ _id: user.userId, role: user.role });
  return next ? { ...next, user } : null;
};

exports.revokeSession = async (refreshToken) => {
  const redis = getClient();
  if (!redis || !refreshToken) return;
  await connection;
  if (redis.isReady) await redis.del(sessionKey(refreshToken));
};

exports.getStatus = () => ({ configured: Boolean(process.env.REDIS_URL), connected: Boolean(client?.isReady) });

exports.close = async () => {
  if (client?.isOpen) await client.quit();
};