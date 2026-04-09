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
}
//# sourceMappingURL=ISystemLog.d.ts.map