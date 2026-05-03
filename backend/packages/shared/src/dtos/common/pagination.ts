/**
 * Pagination DTOs
 * Used for paginated API responses
 */

export interface PaginationQuery {
  page: number; // 1-based, >= 1
  limit: number; // 1-100
  sortBy: string | undefined;
  sortOrder: "asc" | "desc" | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
