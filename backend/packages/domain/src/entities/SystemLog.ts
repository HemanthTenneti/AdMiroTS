import { ISystemLog } from "../interfaces";
import { LogAction, EntityType } from "../enums";

/**
 * System log entity class
 * Encapsulates audit trail business logic
 */
export class SystemLog implements ISystemLog {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;

  constructor(data: ISystemLog) {
    this.id = data.id;
    this.action = data.action;
    this.entityType = data.entityType;
    this.entityId = data.entityId;
    this.userId = data.userId;
    this.details = data.details;
    this.ipAddress = data.ipAddress ?? undefined;
    this.userAgent = data.userAgent ?? undefined;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Check if log entry is a creation action
   */
  isCreate(): boolean {
    return this.action === LogAction.CREATE;
  }

  /**
   * Check if log entry is an update action
   */
  isUpdate(): boolean {
    return this.action === LogAction.UPDATE;
  }

  /**
   * Check if log entry is a deletion action
   */
  isDelete(): boolean {
    return this.action === LogAction.DELETE;
  }

  /**
   * Check if log entry is a status change action
   */
  isStatusChange(): boolean {
    return this.action === LogAction.STATUS_CHANGE;
  }

  /**
   * Check if log entry is an approval action
   */
  isApprove(): boolean {
    return this.action === LogAction.APPROVE;
  }

  /**
   * Check if log entry is a rejection action
   */
  isReject(): boolean {
    return this.action === LogAction.REJECT;
  }

  /**
   * Check if log has change tracking data
   */
  hasChanges(): boolean {
    return !!this.details.changes;
  }

  /**
   * Check if log has metadata
   */
  hasMetadata(): boolean {
    return !!this.details.metadata;
  }

  /**
   * Get specific change by field name
   */
  getChange(fieldName: string):
    | { before: any; after: any }
    | null {
    if (!this.details.changes) {
      return null;
    }

    const change = this.details.changes[fieldName];
    if (!change) {
      return null;
    }

    return change as { before: any; after: any };
  }

  /**
   * Get all changed field names
   */
  getChangedFields(): string[] {
    if (!this.details.changes) {
      return [];
    }

    return Object.keys(this.details.changes);
  }

  /**
   * Format log entry as human-readable string
   */
  toHumanReadable(): string {
    const actionText = this.action.replace(/_/g, " ").toLowerCase();
    const entityText = this.entityType.toLowerCase();

    let message = `${actionText} ${entityText} ${this.entityId}`;

    if (this.hasChanges()) {
      const fields = this.getChangedFields();
      message += ` (changed: ${fields.join(", ")})`;
    }

    return message;
  }

  /**
   * Create a system log entry
   * Factory method for common log creation pattern
   */
  static create(params: {
    action: LogAction;
    entityType: EntityType;
    entityId: string;
    userId: string;
    description: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): SystemLog {
    const now = new Date();

    return new SystemLog({
      id: crypto.randomUUID(),
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId,
      details: {
        description: params.description,
        changes: params.changes ?? undefined,
        metadata: params.metadata ?? undefined,
      },
      ipAddress: params.ipAddress ?? undefined,
      userAgent: params.userAgent ?? undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Create a creation log entry
   */
  static logCreate(params: {
    entityType: EntityType;
    entityId: string;
    userId: string;
    description: string;
    ipAddress?: string;
    userAgent?: string;
  }): SystemLog {
    return SystemLog.create({
      ...params,
      action: LogAction.CREATE,
    });
  }

  /**
   * Create an update log entry with change tracking
   */
  static logUpdate(params: {
    entityType: EntityType;
    entityId: string;
    userId: string;
    description: string;
    changes: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): SystemLog {
    return SystemLog.create({
      ...params,
      action: LogAction.UPDATE,
    });
  }

  /**
   * Create a deletion log entry
   */
  static logDelete(params: {
    entityType: EntityType;
    entityId: string;
    userId: string;
    description: string;
    ipAddress?: string;
    userAgent?: string;
  }): SystemLog {
    return SystemLog.create({
      ...params,
      action: LogAction.DELETE,
    });
  }
}
