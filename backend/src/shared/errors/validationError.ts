import { ApiError } from "./ApiError.js";

export class ValidationError extends ApiError {
  readonly errors:
    | Array<{
        path: string;
        message: string;
      }>
    | undefined;

  constructor(errors?: Array<{ path: string; message: string }>) {
    const message =
      errors && errors.length > 0
        ? errors.map((e) => e.message).join(", ")
        : "Validation failed";
    super(400, message, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.errors = errors;
  }
}
