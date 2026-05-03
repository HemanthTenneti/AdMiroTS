/**
 * 409 Conflict error
 */
import { AppError } from "./AppError";

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export default ConflictError;
