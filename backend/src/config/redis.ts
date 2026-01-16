import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;

export async function getRedisClient() {
  if (client && client.isOpen) return client;

  // Build Redis URL with proper format
  const redisUrl = process.env.REDIS_URL;
  let url: string;

  if (redisUrl) {
    // If REDIS_URL is provided, use it as-is
    url = redisUrl;
  } else {
    // Default to localhost with password from env or docker-compose default
    const password = process.env.REDIS_PASSWORD || "anthony";
    const host = process.env.REDIS_HOST || "127.0.0.1";
    const port = process.env.REDIS_PORT || "6379";
    url = `redis://:${password}@${host}:${port}`;
  }

  client = createClient({
    url,
  });

  client.on("error", (err) => {
    console.error("Redis Client Error", err);
    // Reset client on error so it can reconnect
    client = null;
  });

  try {
    await client.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    client = null;
    throw error;
  }

  return client;
}
