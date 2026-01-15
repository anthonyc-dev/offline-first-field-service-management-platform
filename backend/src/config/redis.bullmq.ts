import Redis from "ioredis";
import type { Redis as RedisType } from "ioredis";

const RedisConstructor = Redis as unknown as new (
  url?: string,
  options?: any
) => RedisType;

export const bullRedis = new RedisConstructor(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});
