/**
 * Response formatter middleware
 * Extends Express Response with custom success response method
 */
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "@admiro/shared";

// Extend Express Response type to add our custom method
declare global {
  namespace Express {
    interface Response {
      sendSuccess<T>(data: T, statusCode?: number): Response;
    }
  }
}

export function responseFormatter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Add custom response method to format success responses
  res.sendSuccess = function <T>(data: T, statusCode: number = 200): Response {
    const response: SuccessResponse<T> = {
      success: true,
      data,
    };
    return this.status(statusCode).json(response);
  };

  next();
}
