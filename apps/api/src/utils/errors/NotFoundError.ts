/**
 * 404 Not Found error
 */
import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export default NotFoundError;
