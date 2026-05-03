/**
 * Base application error class with HTTP status code
 * All domain-specific errors inherit from this
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details: Record<string, string> | undefined = undefined
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export default AppError;
