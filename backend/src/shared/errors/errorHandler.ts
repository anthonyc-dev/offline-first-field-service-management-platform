import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError.js";
import { ValidationError } from "./validationError.js";
import { recordError } from "./metrics/errorMetrics.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const requestId = req.requestId ?? req.headers["x-request-id"];
  let statusCode = 500;
  let response: any = {
    success: false,
    message: "Internal Server Error",
    requestId,
  };

  /* ==============================
     API / BUSINESS ERRORS
  ============================== */
  if (err instanceof ApiError) {
    statusCode = err.statusCode;

    // metrics
    recordError(statusCode);

    // perational logging (WARN)
    console.warn({
      level: "warn",
      type: "API_ERROR",
      requestId,
      code: err.code,
      message: err.message,
      path: req.originalUrl,
      method: req.method,
    });

    return res.status(statusCode).json({
      ...response,
      message: err.message,
      statusCode,
      code: err.code,
    });
  }

  /* ==============================
     VALIDATION ERRORS
  ============================== */
  if (err instanceof ValidationError) {
    statusCode = err.statusCode;

    recordError(statusCode);

    console.warn({
      level: "warn",
      type: "VALIDATION_ERROR",
      requestId,
      message: err.message,
      errors: err.errors,
      path: req.originalUrl,
      method: req.method,
    });

    return res.status(statusCode).json({
      ...response,
      message: err.message,
      errors: err.errors,
    });
  }

  /* ==============================
     UNEXPECTED / SYSTEM ERRORS
  ============================== */
  recordError(statusCode);

  console.error({
    level: "error",
    type: "UNHANDLED_ERROR",
    requestId,
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  return res.status(statusCode).json({
    ...response,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
