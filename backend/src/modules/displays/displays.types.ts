/**
 * Display module type definitions
 * Defines response shapes and DTOs for display endpoints
 */
import { Display } from "@admiro/domain";

export type DisplayResponse = Display;

/**
 * Paginated response wrapper for display list endpoints
 */
export interface DisplayListResponse {
  data: DisplayResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Display status response for heartbeat/ping endpoints
 */
export interface DisplayStatusResponse {
  id: string;
  displayId: string;
  status: string;
  lastPing: Date | undefined;
  isOnline: boolean;
}

/**
 * Assigned loops response for a display
 */
export interface AssignedLoopsResponse {
  displayId: string;
  loops: Array<{
    loopId: string;
    name: string;
  }>;
}
