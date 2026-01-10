import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = req.headers["x-request-id"] || randomUUID();
  req.headers["x-request-id"] = id as string;
  res.setHeader("x-request-id", id as string);
  next();
};
