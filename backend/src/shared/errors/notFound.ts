import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError.js";

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};
