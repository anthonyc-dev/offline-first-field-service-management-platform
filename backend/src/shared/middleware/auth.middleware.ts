import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { config } from "../../config/env.js";
import type { Roles } from "../constants/role.js";

export function authentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Try to get token from cookie first, then fallback to Authorization header
  const token =
    req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (typeof decoded === "string") {
      return res.sendStatus(401);
    }
    req.user = {
      ...decoded,
      id: decoded.sub,
    } as {
      sub: string;
      role: Roles;
      exp: Date;
      id: string;
    } & jwt.JwtPayload;
    next();
  } catch {
    res.sendStatus(401);
  }
}
