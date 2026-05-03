/**
 * Validation error for request validation failures
 * Returns 400 with field-level error details
 */
import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(message: string, details: Record<string, string> | undefined = undefined) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export default ValidationError;
