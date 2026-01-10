import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError.js";
import { recordError } from "./metrics/errorMetrics.js";
import { ValidationError } from "./validationError.js";

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  recordError(statusCode);

  // Always log full error in server logs
  console.error({
    requestId: req.headers["x-request-id"],
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
