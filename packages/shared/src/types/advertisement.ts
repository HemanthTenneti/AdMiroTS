/**
 * Advertisement management DTOs
 * Handles ad creation, updates, listing, and media management
 */

import { AdStatus, MediaType } from "@admiro/domain";
import { Timestamps, PaginatedResponse, DateRangeQuery } from "./common.js";

/**
 * Advertisement response DTO
 * Standard advertisement representation returned by API endpoints
 */
export interface AdvertisementResponse extends Timestamps {
  id: string;
  adId: string; // Format: "AD-{UUID}"
  advertiserId: string; // FK to User
  advertiserName?: string | undefined; // Populated from user relationship
  adName: string;
  mediaUrl: string; // Base64 data URL or external URL
  mediaType: MediaType;
  thumbnailUrl?: string | undefined; // Auto-generated for videos
  duration: number; // In seconds (1-300)
  description?: string | undefined;
  status: AdStatus;
  targetAudience?: string | undefined;
  fileSize?: number | undefined; // In bytes
  views: number;
  clicks: number;
}

/**
 * Create advertisement request
 * Submits a new advertisement with media content
 */
export interface CreateAdvertisementRequest {
  adName: string; // 3-100 characters
  mediaUrl: string; // Base64 data URI or external URL
  mediaType: MediaType;
  duration: number; // 1-300 seconds
  description?: string | undefined;
  targetAudience?: string | undefined;
  status?: AdStatus | undefined; // Defaults to DRAFT
}

/**
 * Update advertisement request
 * Modifies existing advertisement properties
 */
export interface UpdateAdvertisementRequest {
  adName?: string | undefined;
  description?: string | undefined;
  targetAudience?: string | undefined;
  status?: AdStatus | undefined;
  duration?: number | undefined; // Only if media is replaced
  mediaUrl?: string | undefined; // Replacing media content
}

/**
 * Advertisement list filter parameters
 * Used to filter and search advertisement listings
 */
export interface AdvertisementFilterQuery extends DateRangeQuery {
  status?: AdStatus | undefined; // Filter by ad status
  mediaType?: MediaType | undefined; // Filter by media type
  advertiserId?: string | undefined; // Filter by advertiser
  search?: string | undefined; // Search by ad name or description
  minViews?: number | undefined; // Minimum view count
  maxViews?: number | undefined; // Maximum view count
  minDuration?: number | undefined; // Minimum duration in seconds
  maxDuration?: number | undefined; // Maximum duration in seconds
}

/**
 * Paginated advertisement list response
 * Returns list of advertisements with pagination metadata
 */
export interface AdvertisementListResponse
  extends PaginatedResponse<AdvertisementResponse> {}

/**
 * Advertisement deletion response
 * Confirms successful advertisement deletion
 */
export interface DeleteAdvertisementResponse {
  id: string;
  message: string;
}

/**
 * Advertisement status update request
 * Changes the status of an advertisement (e.g., activate, pause)
 */
export interface UpdateAdvertisementStatusRequest {
  status: AdStatus;
}

/**
 * Advertisement statistics response
 * Aggregate metrics for a specific advertisement
 */
export interface AdvertisementStatsResponse {
  adId: string;
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number; // CTR as percentage
  averageViewDuration: number; // In seconds
  completionRate: number; // Percentage of views that completed
  displayCount: number; // Number of displays showing this ad
  loopCount: number; // Number of loops containing this ad
  revenueGenerated?: number | undefined; // If applicable
  topDisplays: Array<{
    displayId: string;
    displayName: string;
    views: number;
  }>;
  performanceByHour: Array<{
    hour: number; // 0-23
    views: number;
    clicks: number;
  }>;
}

/**
 * Bulk advertisement operation request
 * Allows batch operations on multiple advertisements
 */
export interface BulkAdvertisementOperationRequest {
  adIds: string[];
  operation: "activate" | "pause" | "delete" | "archive";
}

/**
 * Bulk advertisement operation response
 * Reports results of batch advertisement operations
 */
export interface BulkAdvertisementOperationResponse {
  successCount: number;
  failureCount: number;
  errors?: Array<{
    adId: string;
    reason: string;
  }> | undefined;
}

/**
 * Media upload response
 * Returns upload confirmation and media metadata
 */
export interface MediaUploadResponse {
  mediaUrl: string; // URL of uploaded media
  thumbnailUrl?: string | undefined; // Auto-generated thumbnail
  fileSize: number; // In bytes
  duration?: number | undefined; // For video content
  mediaType: MediaType;
}

/**
 * Advertisement validation response
 * Checks if advertisement meets system requirements
 */
export interface ValidateAdvertisementResponse {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }> | undefined;
  warnings?: Array<{
    field: string;
    message: string;
  }> | undefined;
}
