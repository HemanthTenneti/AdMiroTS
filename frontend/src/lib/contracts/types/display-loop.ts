/**
 * Display loop management DTOs
 * Handles loop creation, ad assignment, rotation configuration, and display assignments
 */

import { RotationType, DisplayLayout } from "@admiro/domain";
import { Timestamps, PaginatedResponse } from "./common";

/**
 * Loop advertisement entry
 * Represents an advertisement within a loop with ordering and weight
 */
export interface LoopAdvertisementEntryDTO {
  adId: string; // FK to Advertisement
  adName?: string | undefined; // Populated for display
  duration: number; // In seconds
  order: number; // Display order in sequential rotation
  weight?: number | undefined; // Weight for weighted rotation (1-100)
  isActive: boolean; // Can temporarily disable ads within loop
}

/**
 * Display loop response DTO
 * Standard loop representation returned by API endpoints
 */
export interface DisplayLoopResponse extends Timestamps {
  id: string;
  loopId: string; // Auto-generated unique ID
  loopName: string;
  displayId: string; // Legacy primary display reference
  displayIds: string[]; // Assigned displays
  displayName?: string | undefined; // Populated from display relationship
  advertisements: LoopAdvertisementEntryDTO[];
  rotationType: RotationType;
  displayLayout: DisplayLayout;
  totalDuration: number; // Sum of all ad durations in seconds
  isActive: boolean;
  description?: string | undefined;
  adCount: number; // Total number of ads in loop
}

/**
 * Create display loop request
 * Creates a new advertisement rotation loop for a display
 */
export interface CreateDisplayLoopRequest {
  loopName: string;
  displayId?: string | undefined; // Legacy single assignment
  displayIds?: string[] | undefined; // Optional multi-assignment
  rotationType: RotationType;
  displayLayout: DisplayLayout;
  description?: string | undefined;
  advertisements?: Array<{
    adId: string;
    order: number;
    weight?: number | undefined;
  }> | undefined; // Optional initial ads
}

/**
 * Update display loop request
 * Modifies loop properties (excluding ad assignments)
 */
export interface UpdateDisplayLoopRequest {
  loopName?: string | undefined;
  rotationType?: RotationType | undefined;
  displayLayout?: DisplayLayout | undefined;
  isActive?: boolean | undefined;
  description?: string | undefined;
}

/**
 * Add advertisements to loop request
 * Inserts one or more ads into an existing loop
 */
export interface AddAdvertisementsToLoopRequest {
  advertisements: Array<{
    adId: string;
    order?: number | undefined; // Auto-assigned if not provided
    weight?: number | undefined; // Required if rotationType is WEIGHTED
  }>;
}

/**
 * Remove advertisements from loop request
 * Removes one or more ads from a loop
 */
export interface RemoveAdvertisementsFromLoopRequest {
  adIds: string[];
}

/**
 * Reorder advertisements in loop request
 * Updates the display order of ads in sequential rotation
 */
export interface ReorderLoopAdvertisementsRequest {
  advertisements: Array<{
    adId: string;
    newOrder: number;
  }>;
}

/**
 * Update advertisement weight request
 * Modifies the weight of an ad in weighted rotation
 */
export interface UpdateAdvertisementWeightRequest {
  adId: string;
  weight: number; // 1-100
}

/**
 * Display loop list filter parameters
 * Used to filter and search loop listings
 */
export interface DisplayLoopFilterQuery {
  displayId?: string | undefined; // Filter by display
  rotationType?: RotationType | undefined; // Filter by rotation type
  displayLayout?: DisplayLayout | undefined; // Filter by layout
  isActive?: boolean | undefined; // Filter by active status
  search?: string | undefined; // Search by loop name or description
  hasAds?: boolean | undefined; // Filter loops with/without ads
  minDuration?: number | undefined; // Minimum total duration
  maxDuration?: number | undefined; // Maximum total duration
}

/**
 * Paginated display loop list response
 * Returns list of loops with pagination metadata
 */
export interface DisplayLoopListResponse
  extends PaginatedResponse<DisplayLoopResponse> {}

/**
 * Display loop deletion response
 * Confirms successful loop deletion
 */
export interface DeleteDisplayLoopResponse {
  id: string;
  message: string;
}

/**
 * Clone display loop request
 * Creates a copy of an existing loop for a different display
 */
export interface CloneDisplayLoopRequest {
  sourceLoopId: string;
  targetDisplayId: string;
  newLoopName: string;
}

/**
 * Clone display loop response
 * Returns the newly created loop
 */
export interface CloneDisplayLoopResponse {
  loop: DisplayLoopResponse;
}

/**
 * Display loop statistics response
 * Aggregate metrics for a specific loop
 */
export interface DisplayLoopStatsResponse {
  loopId: string;
  loopName: string;
  displayId: string;
  displayName: string;
  totalImpressions: number; // Total views across all ads
  totalClicks: number;
  averageCTR: number; // Click-through rate as percentage
  rotationCount: number; // Number of complete rotations
  mostViewedAd?: {
    adId: string;
    adName: string;
    views: number;
  } | undefined;
  leastViewedAd?: {
    adId: string;
    adName: string;
    views: number;
  } | undefined;
  adPerformance: Array<{
    adId: string;
    adName: string;
    views: number;
    clicks: number;
    ctr: number;
    avgViewDuration: number;
  }>;
}

/**
 * Bulk loop operation request
 * Allows batch operations on multiple loops
 */
export interface BulkLoopOperationRequest {
  loopIds: string[];
  operation: "activate" | "deactivate" | "delete";
}

/**
 * Bulk loop operation response
 * Reports results of batch loop operations
 */
export interface BulkLoopOperationResponse {
  successCount: number;
  failureCount: number;
  errors?: Array<{
    loopId: string;
    reason: string;
  }> | undefined;
}

/**
 * Loop validation response
 * Checks if loop configuration is valid
 */
export interface ValidateLoopResponse {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }> | undefined;
  warnings?: Array<{
    message: string;
  }> | undefined;
}

/**
 * Loop preview response
 * Returns a simulated playback preview of the loop
 */
export interface LoopPreviewResponse {
  loopId: string;
  totalDuration: number;
  rotationType: RotationType;
  playbackSequence: Array<{
    adId: string;
    adName: string;
    duration: number;
    startTime: number; // Offset in seconds from loop start
    endTime: number;
    thumbnailUrl?: string | undefined;
  }>;
}
