/**
 * Display device management DTOs
 * Handles display registration, configuration, monitoring, and connection management
 */

import { DisplayStatus, DisplayLayout, Orientation } from "@admiro/domain";
import { Timestamps, PaginatedResponse } from "./common";

/**
 * Resolution value object
 * Represents display screen dimensions
 */
export interface ResolutionDTO {
  width: number; // In pixels
  height: number; // In pixels
}

/**
 * Display configuration settings
 * Contains operational parameters for display devices
 */
export interface DisplayConfigurationDTO {
  brightness: number; // 0-100
  volume: number; // 0-100
  orientation: Orientation;
  autoRefresh: boolean; // Auto-update loop content
  refreshInterval: number; // In minutes
}

/**
 * Display response DTO
 * Standard display representation returned by API endpoints
 */
export interface DisplayResponse extends Timestamps {
  id: string;
  displayId: string; // Unique identifier (3+ chars)
  displayName: string;
  location: string;
  status: DisplayStatus;
  assignedAdminId?: string | undefined; // FK to User
  assignedAdminName?: string | undefined; // Populated from user relationship
  resolution: ResolutionDTO;
  lastSeen?: Date | undefined; // Last heartbeat timestamp
  firmwareVersion: string;
  configuration: DisplayConfigurationDTO;
  isConnected: boolean;
  currentLoopId?: string | undefined; // FK to DisplayLoop
  currentLoopName?: string | undefined; // Populated from loop relationship
  needsRefresh: boolean; // Content update pending flag
  lastRefreshCheck?: Date | undefined;
}

/**
 * Create display request
 * Registers a new display device in the system
 */
export interface CreateDisplayRequest {
  displayId: string; // Unique identifier, min 3 characters
  displayName: string;
  location: string;
  resolution: ResolutionDTO;
  password?: string | undefined; // Optional password for display authentication
  firmwareVersion?: string | undefined; // Defaults to "1.0.0"
}

/**
 * Update display request
 * Modifies existing display properties
 */
export interface UpdateDisplayRequest {
  displayName?: string | undefined;
  location?: string | undefined;
  assignedAdminId?: string | undefined;
  configuration?: Partial<DisplayConfigurationDTO> | undefined;
  password?: string | undefined; // Change display password
}

/**
 * Display connection request
 * Authenticates a display device for WebSocket connection
 */
export interface DisplayConnectionRequest {
  displayId: string;
  password?: string | undefined; // If display has password protection
}

/**
 * Display connection response
 * Returns connection token and WebSocket URL
 */
export interface DisplayConnectionResponse {
  connectionToken: string; // JWT for WebSocket authentication
  wsUrl: string; // WebSocket endpoint URL
  expiresIn: number; // Token lifetime in seconds
  currentLoop?: {
    loopId: string;
    loopName: string;
    totalDuration: number;
  } | undefined;
}

/**
 * Display heartbeat request
 * Periodic ping from display to update status
 */
export interface DisplayHeartbeatRequest {
  displayId: string;
  status: DisplayStatus;
  currentAdId?: string | undefined; // Currently playing ad
  playbackPosition?: number | undefined; // Position in current ad (seconds)
}

/**
 * Display heartbeat response
 * Acknowledges heartbeat and returns any pending updates
 */
export interface DisplayHeartbeatResponse {
  acknowledged: boolean;
  needsRefresh: boolean; // Should display reload loop content
  configuration?: DisplayConfigurationDTO | undefined; // Updated config
}

/**
 * Display list filter parameters
 * Used to filter and search display listings
 */
export interface DisplayFilterQuery {
  status?: DisplayStatus | undefined; // Filter by display status
  location?: string | undefined; // Filter by location (partial match)
  assignedAdminId?: string | undefined; // Filter by assigned admin
  isConnected?: boolean | undefined; // Filter by connection state
  hasLoop?: boolean | undefined; // Filter by loop assignment
  search?: string | undefined; // Search by display name or ID
}

/**
 * Paginated display list response
 * Returns list of displays with pagination metadata
 */
export interface DisplayListResponse
  extends PaginatedResponse<DisplayResponse> {}

/**
 * Display deletion response
 * Confirms successful display deletion
 */
export interface DeleteDisplayResponse {
  id: string;
  message: string;
}

/**
 * Display statistics response
 * Aggregate metrics for a specific display
 */
export interface DisplayStatsResponse {
  displayId: string;
  displayName: string;
  location: string;
  uptime: number; // Total hours online in last 30 days
  totalImpressions: number; // Total ad views
  uniqueAdsShown: number; // Count of unique ads displayed
  currentLoop?: {
    loopId: string;
    loopName: string;
    adCount: number;
  } | undefined;
  averageDailyViews: number;
  lastSevenDaysViews: number[];
  connectionHistory: Array<{
    date: Date;
    status: DisplayStatus;
    duration: number; // Minutes
  }>;
}

/**
 * Bulk display operation request
 * Allows batch operations on multiple displays
 */
export interface BulkDisplayOperationRequest {
  displayIds: string[];
  operation: "activate" | "deactivate" | "refresh" | "update_config";
  configuration?: Partial<DisplayConfigurationDTO> | undefined; // For update_config
}

/**
 * Bulk display operation response
 * Reports results of batch display operations
 */
export interface BulkDisplayOperationResponse {
  successCount: number;
  failureCount: number;
  errors?: Array<{
    displayId: string;
    reason: string;
  }> | undefined;
}

/**
 * Display assignment request
 * Assigns a display to an admin user
 */
export interface AssignDisplayRequest {
  adminId: string; // Must be a user with admin role
}

/**
 * Display refresh request
 * Triggers immediate content refresh on display
 */
export interface RefreshDisplayRequest {
  displayId: string;
}

/**
 * Display refresh response
 * Confirms refresh command was sent
 */
export interface RefreshDisplayResponse {
  displayId: string;
  refreshScheduled: boolean;
  message: string;
}
