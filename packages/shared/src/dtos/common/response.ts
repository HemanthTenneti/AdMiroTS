/**
 * API Response DTOs
 * Standard response envelopes for all API endpoints
 */

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string; // e.g., "INVALID_INPUT", "UNAUTHORIZED"
    message: string;
    details: Record<string, string> | undefined; // Field-level errors
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
