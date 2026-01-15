import { logger } from "#config/logger.js";
import { httpRequests } from "#shared/metrics/http.metrics.js";
import type { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      requestId: req.requestId,
      userId: req.id,
    });

    httpRequests.inc({
      method: req.method,
      path: req.path,
      status: res.statusCode,
    });
  });

  next();
}
