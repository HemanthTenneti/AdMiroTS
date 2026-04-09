/**
 * System Log Controller
 * Handles HTTP requests for system log operations
 */
import { Request, Response, NextFunction } from "express";
import { SystemLogService } from "./system-logs.service";
import { SuccessResponse } from "@admiro/shared";
import { AuthenticatedRequest } from "../../types/auth.types";
import { UnauthorizedError } from "../../utils/errors/UnauthorizedError";
import { LogAction, EntityType } from "@admiro/domain";

export class SystemLogController {
  private logService: SystemLogService;

  constructor() {
    this.logService = new SystemLogService();
  }

  private getUser(req: Request): any {
    const authReq = req as Request & AuthenticatedRequest;
    if (!authReq.user) {
      throw new UnauthorizedError("User not authenticated");
    }
    return authReq.user;
  }

  /**
   * List system logs with pagination and filtering
   */
  async listLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.getUser(req);
      const page = req.query.page as string | undefined;
      const limit = req.query.limit as string | undefined;
      const action = req.query.action as LogAction | undefined;
      const entityType = req.query.entityType as EntityType | undefined;
      const entityId = req.query.entityId as string | undefined;
      const userId = req.query.userId as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as "asc" | "desc" | undefined;

      const result = await this.logService.listLogs(
        Number(page) || 1,
        Number(limit) || 10,
        {
          action,
          entityType,
          entityId,
          userId,
          startDate,
          endDate,
          sortBy,
          sortOrder,
        }
      );

      const response: SuccessResponse<any> = {
        success: true,
        data: {
          data: result.data,
          pagination: {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            total: result.total,
            hasMore: (Number(page) || 1) * (Number(limit) || 10) < result.total,
          },
        },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single log record
   */
  async getLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.getUser(req);
      const id = req.params.id as string;
      const log = await this.logService.getLog(id);
      const response: SuccessResponse<any> = {
        success: true,
        data: log,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default SystemLogController;
