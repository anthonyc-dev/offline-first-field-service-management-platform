import { ValidationError } from "#shared/errors/validationError.js";
import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";

export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));

        return next(new ValidationError(errors));
      }
      next(err);
    }
  };
