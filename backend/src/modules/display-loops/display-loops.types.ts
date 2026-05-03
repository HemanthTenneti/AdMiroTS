/**
 * Display loop module type definitions
 * Defines response shapes and DTOs for display loop endpoints
 */
import { DisplayLoop, RotationType, DisplayLayout } from "@admiro/domain";

export type DisplayLoopResponse = DisplayLoop;

/**
 * Paginated response wrapper for display loop list endpoints
 */
export interface DisplayLoopListResponse {
  data: DisplayLoopResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Input for creating a new display loop
 */
export interface CreateDisplayLoopInput {
  loopName: string;
  displayId?: string | undefined;
  displayIds?: string[] | undefined;
  rotationType: RotationType;
  displayLayout: DisplayLayout;
  description?: string;
}

/**
 * Input for updating an existing display loop
 */
export interface UpdateDisplayLoopInput {
  loopName?: string;
  rotationType?: RotationType;
  displayLayout?: DisplayLayout;
  isActive?: boolean;
  description?: string;
}

/**
 * Input for adding an advertisement to a loop
 */
export interface AddAdvertisementToLoopInput {
  advertisementId: string;
  duration: number;
  order: number;
  weight?: number;
}

export interface AddDisplayToLoopInput {
  displayId: string;
}
