/**
 * Common DTOs used across all modules
 * These types provide standardized pagination, error handling, and response structures
 */

/**
 * Pagination query parameters for list endpoints
 * All list endpoints should accept these parameters to support pagination
 */
export interface PaginationQuery {
  page: number; // 1-based index, must be >= 1
  limit: number; // Items per page, range: 1-100
  sortBy?: string | undefined; // Field name to sort by
  sortOrder?: "asc" | "desc" | undefined; // Sort direction
}

/**
 * Standardized paginated response wrapper
 * Used by all list endpoints to return data with pagination metadata
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number; // Current page number
    limit: number; // Items per page
    total: number; // Total number of items across all pages
    totalPages: number; // Total number of pages
    hasMore: boolean; // Whether there are more pages available
  };
}

/**
 * Timestamp fields that appear on all entities
 * Dates are serialized as ISO 8601 strings in JSON responses
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Standardized error response structure
 * All API errors should conform to this shape for consistent client-side handling
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string; // Machine-readable error code (e.g., "INVALID_INPUT", "UNAUTHORIZED")
    message: string; // Human-readable error message
    details?: Record<string, string> | undefined; // Field-level validation errors
  };
}

/**
 * Success response wrapper
 * Used to wrap successful API responses with a success flag
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Discriminated union for all API responses
 * Clients can check the success field to determine response type
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Date range filter for analytics and reporting
 * Used to query data within a specific time window
 */
export interface DateRangeQuery {
  startDate: Date; // ISO 8601 string in JSON
  endDate: Date; // ISO 8601 string in JSON
}

/**
 * ID-only response for operations that return just an identifier
 * Common for delete operations or simple creation endpoints
 */
export interface IdResponse {
  id: string;
}

/**
 * Generic count response
 * Used for endpoints that return aggregate counts
 */
export interface CountResponse {
  count: number;
}

/**
 * Status update response for state change operations
 * Returns the new status and timestamp of the change
 */
export interface StatusUpdateResponse {
  id: string;
  status: string;
  updatedAt: Date;
}
