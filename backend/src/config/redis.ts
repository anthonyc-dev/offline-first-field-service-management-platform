import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;

export async function getRedisClient() {
  if (client && client.isOpen) return client;

  client = createClient({
    url: process.env.REDIS_URL || "127.0.0.1",
  });

  client.on("error", (err) => console.error("Redis Client Error", err));

  await client.connect();
  console.log("Redis connected");

  return client;
}
