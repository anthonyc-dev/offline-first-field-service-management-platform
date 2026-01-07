import type { NextFunction, Request, Response } from "express";
import type { AuthPayload } from "../types/auth.types.js";

export function requireRole(...allowedRoles: Array<AuthPayload["role"]>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
}
