/**
 * System log module type definitions
 * Defines response shapes and DTOs for system log endpoints
 */
import { SystemLog } from "@admiro/domain";

export type SystemLogResponse = SystemLog;

/**
 * Paginated response wrapper for system log list endpoints
 */
export interface SystemLogListResponse {
  data: SystemLogResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
