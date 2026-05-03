/**
 * System logs and audit trail DTOs
 * Handles activity logging, audit trails, and system event tracking
 */

import { LogAction, EntityType } from "@admiro/domain";
import { Timestamps, PaginatedResponse, DateRangeQuery } from "./common.js";

/**
 * System log entry response DTO
 * Represents an audit trail entry for system actions
 */
export interface SystemLogResponse extends Timestamps {
  id: string;
  action: LogAction;
  entityType: EntityType;
  entityId: string;
  entityName?: string | undefined; // Human-readable entity identifier
  userId: string; // User who performed the action
  username?: string | undefined; // Populated from user relationship
  userRole?: string | undefined; // User's role at time of action
  details: {
    description: string;
    changes?: Record<string, any> | undefined; // Before/after values
    metadata?: Record<string, any> | undefined; // Additional context
  };
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  timestamp: Date; // Duplicate of createdAt for convenience
}

/**
 * Log filter query parameters
 * Used to filter and search system logs
 */
export interface LogFilterQuery extends DateRangeQuery {
  action?: LogAction | undefined; // Filter by action type
  entityType?: EntityType | undefined; // Filter by entity type
  entityId?: string | undefined; // Filter by specific entity
  userId?: string | undefined; // Filter by user who performed action
  search?: string | undefined; // Search in description and metadata
  ipAddress?: string | undefined; // Filter by IP address
}

/**
 * Paginated system log list response
 * Returns list of log entries with pagination metadata
 */
export interface SystemLogListResponse
  extends PaginatedResponse<SystemLogResponse> {}

/**
 * Create system log request
 * Records a new audit trail entry
 */
export interface CreateSystemLogRequest {
  action: LogAction;
  entityType: EntityType;
  entityId: string;
  userId: string;
  details: {
    description: string;
    changes?: Record<string, any> | undefined;
    metadata?: Record<string, any> | undefined;
  };
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

/**
 * Audit summary response
 * Aggregate statistics about system activity
 */
export interface AuditSummaryResponse {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  totalActions: number;
  actionBreakdown: Record<LogAction, number>;
  entityBreakdown: Record<EntityType, number>;
  mostActiveUsers: Array<{
    userId: string;
    username: string;
    actionCount: number;
    lastAction: Date;
  }>;
  recentActivity: SystemLogResponse[];
  criticalActions: number; // Count of high-priority actions (delete, approve, reject)
}

/**
 * User activity report response
 * Detailed activity history for a specific user
 */
export interface UserActivityReportResponse {
  userId: string;
  username: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  totalActions: number;
  actionBreakdown: Record<LogAction, number>;
  entityBreakdown: Record<EntityType, number>;
  activityTimeline: Array<{
    date: Date;
    actions: SystemLogResponse[];
  }>;
  activityByHour: Array<{
    hour: number; // 0-23
    actionCount: number;
  }>;
  mostModifiedEntities: Array<{
    entityType: EntityType;
    entityId: string;
    entityName: string;
    modificationCount: number;
  }>;
}

/**
 * Entity audit trail response
 * Complete change history for a specific entity
 */
export interface EntityAuditTrailResponse {
  entityType: EntityType;
  entityId: string;
  entityName: string;
  createdBy?: {
    userId: string;
    username: string;
    timestamp: Date;
  } | undefined;
  lastModifiedBy?: {
    userId: string;
    username: string;
    timestamp: Date;
  } | undefined;
  totalModifications: number;
  changeHistory: Array<{
    id: string;
    action: LogAction;
    userId: string;
    username: string;
    timestamp: Date;
    changes?: Record<string, any> | undefined;
    description: string;
  }>;
  statusChanges: Array<{
    timestamp: Date;
    userId: string;
    username: string;
    oldStatus: string;
    newStatus: string;
  }>;
}

/**
 * Security event response
 * High-priority security-related log entries
 */
export interface SecurityEventResponse extends SystemLogResponse {
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  resolvedBy?: string | undefined;
  resolvedAt?: Date | undefined;
  notes?: string | undefined;
}

/**
 * Security events query parameters
 * Filters for security event listings
 */
export interface SecurityEventsQuery extends DateRangeQuery {
  severity?: "low" | "medium" | "high" | "critical" | undefined;
  resolved?: boolean | undefined;
  userId?: string | undefined;
  ipAddress?: string | undefined;
}

/**
 * Paginated security events list response
 * Returns list of security events with pagination metadata
 */
export interface SecurityEventsListResponse
  extends PaginatedResponse<SecurityEventResponse> {}

/**
 * System activity statistics response
 * Real-time and historical activity metrics
 */
export interface SystemActivityStatsResponse {
  currentActiveUsers: number;
  actionsInLastHour: number;
  actionsInLast24Hours: number;
  actionsInLast7Days: number;
  peakActivityHour: number; // 0-23
  peakActivityDay: string; // Day of week
  averageActionsPerDay: number;
  recentActivity: SystemLogResponse[];
  activityTrend: Array<{
    date: Date;
    actionCount: number;
  }>;
}

/**
 * Export logs request
 * Generates downloadable log report
 */
export interface ExportLogsRequest extends LogFilterQuery {
  format: "csv" | "json" | "pdf";
  includeMetadata?: boolean | undefined;
  includeChanges?: boolean | undefined;
}

/**
 * Export logs response
 * Returns download URL for generated log export
 */
export interface ExportLogsResponse {
  downloadUrl: string;
  expiresAt: Date;
  format: string;
  fileSize: number; // In bytes
  recordCount: number;
}

/**
 * Log retention policy response
 * Current system log retention settings
 */
export interface LogRetentionPolicyResponse {
  retentionDays: number;
  archiveEnabled: boolean;
  archiveAfterDays?: number | undefined;
  purgeEnabled: boolean;
  purgeAfterDays?: number | undefined;
  totalLogs: number;
  oldestLog?: Date | undefined;
  estimatedPurgeDate?: Date | undefined;
}

/**
 * Bulk log deletion request
 * Deletes logs matching specific criteria (admin only)
 */
export interface BulkLogDeletionRequest extends LogFilterQuery {
  confirm: boolean; // Safety flag, must be true
}

/**
 * Bulk log deletion response
 * Reports results of bulk log deletion
 */
export interface BulkLogDeletionResponse {
  deletedCount: number;
  message: string;
}

/**
 * Change comparison response
 * Compares two versions of an entity from audit logs
 */
export interface ChangeComparisonResponse {
  entityType: EntityType;
  entityId: string;
  entityName: string;
  beforeVersion: {
    timestamp: Date;
    userId: string;
    username: string;
    data: Record<string, any>;
  };
  afterVersion: {
    timestamp: Date;
    userId: string;
    username: string;
    data: Record<string, any>;
  };
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    changeType: "added" | "removed" | "modified";
  }>;
}
