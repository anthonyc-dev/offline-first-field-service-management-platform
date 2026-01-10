import { ApiError } from "./ApiError.js";

export class ValidationError extends ApiError {
  errors?: unknown;

  constructor(message = "Validation failed", errors?: unknown) {
    super(400, message);
    this.errors = errors;
  }
}
