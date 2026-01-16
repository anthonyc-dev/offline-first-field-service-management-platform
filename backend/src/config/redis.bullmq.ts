import Redis from "ioredis";
import type { Redis as RedisType } from "ioredis";

const RedisConstructor = Redis as unknown as new (
  url?: string,
  options?: any
) => RedisType;

let bullRedis: RedisType;

try {
  bullRedis = new RedisConstructor(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
  });

  bullRedis.on("error", (err: Error) => {
    console.error("Bull Redis connection error:", err);
  });

  bullRedis.on("connect", () => {
    console.log("Bull Redis connected");
  });
} catch (error) {
  console.error("Failed to initialize Bull Redis:", error);
  throw error;
}

export { bullRedis };
