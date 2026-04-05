import { LogAction, EntityType } from "../enums";

/**
 * System log entry interface
 * Represents an audit trail entry for system actions
 */
export interface ISystemLog {
  id: string;
  action: LogAction;
  entityType: EntityType;
  entityId: string;
  userId: string; // FK to User who performed the action
  details: {
    description: string;
    changes?: Record<string, any> | undefined; // Before/after values
    metadata?: Record<string, any> | undefined; // Additional context
  };
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}
