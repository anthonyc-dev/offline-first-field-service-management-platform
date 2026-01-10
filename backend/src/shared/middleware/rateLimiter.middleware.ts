import type { Request, Response, NextFunction } from "express";
import { getRedisClient } from "../libs/rateLimiter-connection.js";
import { ApiError } from "../errors/ApiError.js";

export const rateLimiter = ({
  window,
  limit,
}: {
  window: number;
  limit: number;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = (req.ip || "").replace(/^::ffff:/, "");
      const key = `rate:${ip}`;
      const now = Date.now();

      const redisClient = await getRedisClient();

      const tx = redisClient.multi();
      tx.zRemRangeByScore(key, 0, now - window * 1000);
      tx.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
      tx.zCard(key);
      tx.expire(key, window + 5);

      const results = await tx.exec();
      if (!results || results.length < 3) return next();

      const count = results[2] as number;

      if (count >= limit) {
        //--- audit log
        await redisClient.lPush(
          "rate_limit_hits",
          JSON.stringify({
            ip,
            path: req.originalUrl,
            ua: req.headers["user-agent"],
            time: new Date().toISOString(),
          })
        );

        //--- Set Retry-After header, client knows when to retry
        res.setHeader("Retry-After", window);

        throw new ApiError(429, "Too many requests");
      }

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      next(err);
    }
  };
};
