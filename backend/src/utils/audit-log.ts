import { Request } from "express";
import { EntityType, LogAction } from "@admiro/domain";
import { SystemLogService } from "../modules/system-logs/system-logs.service";

const systemLogService = new SystemLogService();

export async function auditLog(
  req: Request,
  input: {
    action: LogAction;
    entityType: EntityType;
    entityId: string;
    userId: string;
    description: string;
    changes?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const logData: {
      action: LogAction;
      entityType: EntityType;
      entityId: string;
      userId: string;
      description: string;
      changes?: Record<string, any>;
      metadata?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    } = {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId,
      description: input.description,
    };

    if (input.changes !== undefined) logData.changes = input.changes;
    if (input.metadata !== undefined) logData.metadata = input.metadata;
    if (req.ip !== undefined) logData.ipAddress = req.ip;

    const userAgent = req.get("user-agent");
    if (userAgent !== undefined) logData.userAgent = userAgent;

    await systemLogService.recordLog(logData);
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
}
