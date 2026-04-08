/**
 * Global error handler middleware
 * Catches all errors and returns properly formatted error responses
 * Never exposes internal implementation details in production
 */
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors/AppError";
import { ErrorResponse } from "@admiro/shared";
import { Logger } from "../utils/logger";

// Global error handler middleware
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log detailed error only in development or to secure logger
  // Never leak internal details to client in production
  if (process.env.NODE_ENV !== "production") {
    console.error("Error:", error);
  } else {
    Logger.error("Unhandled error", {
      message: error.message,
      endpoint: req.path,
      method: req.method,
    });
  }

  if (error instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
    res.status(error.statusCode).json(response);
    return;
  }

  // Never expose internal error details in production
  // Always return generic error message to prevent information leakage
  const response: ErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : error.message,
      details: undefined,
    },
  };
  res.status(500).json(response);
}
