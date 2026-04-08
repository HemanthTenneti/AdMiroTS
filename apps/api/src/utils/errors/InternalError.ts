/**
 * 500 Internal Server Error
 */
import { AppError } from "./AppError";

export class InternalError extends AppError {
  constructor(message: string = "Internal Server Error") {
    super(message, 500, "INTERNAL_ERROR");
    this.name = "InternalError";
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

export default InternalError;
