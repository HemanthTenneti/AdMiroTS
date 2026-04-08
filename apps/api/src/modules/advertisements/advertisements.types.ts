/**
 * Advertisement module types
 */
import { Advertisement } from "@admiro/domain";
import { PaginatedResponse } from "@admiro/shared";

/**
 * Advertisement response type (excludes sensitive fields)
 * Used for API responses to clients
 */
export type AdvertisementResponse = Omit<Advertisement, "password">;

/**
 * Paginated list response for advertisements
 * Includes pagination metadata alongside data
 */
export interface AdvertisementListResponse extends PaginatedResponse<AdvertisementResponse> {}

/**
 * Statistics for a single advertisement
 * Tracks engagement metrics like views, clicks, and CTR
 */
export interface AdvertisementStatsResponse {
  id: string;
  adName: string;
  views: number;
  clicks: number;
  clickThroughRate: number; // percentage (clicks / views * 100)
  displayCount: number; // number of times displayed across all displays
}

/**
 * Bulk upload response
 * Returns count and list of created advertisements
 */
export interface BulkUploadResponse {
  count: number;
  advertisements: AdvertisementResponse[];
}
