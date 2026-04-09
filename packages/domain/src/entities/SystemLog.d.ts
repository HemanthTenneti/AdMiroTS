import { ISystemLog } from "../interfaces";
import { LogAction, EntityType } from "../enums";
/**
 * System log entity class
 * Encapsulates audit trail business logic
 */
export declare class SystemLog implements ISystemLog {
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
    constructor(data: ISystemLog);
    /**
     * Check if log entry is a creation action
     */
    isCreate(): boolean;
    /**
     * Check if log entry is an update action
     */
    isUpdate(): boolean;
    /**
     * Check if log entry is a deletion action
     */
    isDelete(): boolean;
    /**
     * Check if log entry is a status change action
     */
    isStatusChange(): boolean;
    /**
     * Check if log entry is an approval action
     */
    isApprove(): boolean;
    /**
     * Check if log entry is a rejection action
     */
    isReject(): boolean;
    /**
     * Check if log has change tracking data
     */
    hasChanges(): boolean;
    /**
     * Check if log has metadata
     */
    hasMetadata(): boolean;
    /**
     * Get specific change by field name
     */
    getChange(fieldName: string): {
        before: any;
        after: any;
    } | null;
    /**
     * Get all changed field names
     */
    getChangedFields(): string[];
    /**
     * Format log entry as human-readable string
     */
    toHumanReadable(): string;
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
    }): SystemLog;
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
    }): SystemLog;
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
    }): SystemLog;
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
    }): SystemLog;
}
//# sourceMappingURL=SystemLog.d.ts.map