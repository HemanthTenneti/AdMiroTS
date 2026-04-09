/**
 * System Log Service
 * Handles business logic for system log operations
 */
import { SystemLog, LogAction, EntityType } from "@admiro/domain";
import { SystemLogRepository } from "../../services/repositories/SystemLogRepository";
import { NotFoundError } from "../../utils/errors/NotFoundError";
import { Logger } from "../../utils/logger";

const ALLOWED_SORT_FIELDS = ["createdAt", "action", "entityType", "userId"] as const;

export class SystemLogService {
  private logRepository: SystemLogRepository;

  constructor() {
    this.logRepository = new SystemLogRepository();
  }

  /**
   * Create a new system log entry
   */
  async recordLog(data: {
    action: LogAction;
    entityType: EntityType;
    entityId: string;
    userId: string;
    description: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<SystemLog> {
    const log = SystemLog.create(data);
    const created = await this.logRepository.create(log as any);
    return created;
  }

  /**
   * Get log by ID
   */
  async getLog(id: string): Promise<SystemLog> {
    const log = await this.logRepository.findById(id);
    if (!log) {
      throw new NotFoundError(`System log with ID ${id} not found`);
    }
    return log;
  }

  /**
   * List system logs with pagination and filters
   */
  async listLogs(
    page: number,
    limit: number,
    filters?: {
      action?: LogAction;
      entityType?: EntityType;
      entityId?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<{ data: SystemLog[]; total: number }> {
    const filterObj: Record<string, any> = {};
    if (filters?.action) filterObj.action = filters.action;
    if (filters?.entityType) filterObj.entityType = filters.entityType;
    if (filters?.entityId) filterObj.entityId = filters.entityId;
    if (filters?.userId) filterObj.userId = filters.userId;

    if (filters?.startDate || filters?.endDate) {
      filterObj.createdAt = {};
      if (filters.startDate) filterObj.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) filterObj.createdAt.$lte = new Date(filters.endDate);
    }

    let sortBy = "createdAt";
    if (filters?.sortBy && ALLOWED_SORT_FIELDS.includes(filters.sortBy as any)) {
      sortBy = filters.sortBy;
    }

    return this.logRepository.findWithPagination(
      filterObj,
      page,
      limit,
      sortBy as any,
      filters?.sortOrder ?? "desc"
    );
  }
}

export default SystemLogService;
