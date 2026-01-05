import type { Request, Response, NextFunction } from "express";

export function requestContext(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const forwardedForString = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor;

  const userAgent = req.headers["user-agent"];
  const userAgentString = Array.isArray(userAgent) ? userAgent[0] : userAgent;

  req.context = {
    ipAddress:
      forwardedForString?.split(",")[0] ??
      req.socket.remoteAddress ??
      "unknown",
    userAgent: userAgentString ?? "unknown",
    deviceId: req.body?.deviceId ?? "unknown",
  };
  next();
}
