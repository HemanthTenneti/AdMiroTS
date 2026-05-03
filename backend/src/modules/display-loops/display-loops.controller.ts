/**
 * Display Loop Controller
 * Handles HTTP requests for display loop operations
 */
import { Request, Response, NextFunction } from "express";
import { DisplayLoopService } from "./display-loops.service";
import { SuccessResponse } from "@admiro/shared";
import { AuthenticatedRequest } from "../../types/auth.types";
import { UnauthorizedError } from "../../utils/errors/UnauthorizedError";
import { auditLog } from "../../utils/audit-log";
import { EntityType, LogAction } from "@admiro/domain";

export class DisplayLoopController {
  private loopService: DisplayLoopService;

  constructor() {
    this.loopService = new DisplayLoopService();
  }

  private getUser(req: Request): any {
    const authReq = req as Request & AuthenticatedRequest;
    if (!authReq.user) {
      throw new UnauthorizedError("User not authenticated");
    }
    return authReq.user;
  }

  async createLoop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const loop = await this.loopService.createLoop({ ...req.body, createdById: user.id });
      await auditLog(req, {
        action: LogAction.CREATE,
        entityType: EntityType.LOOP,
        entityId: loop.id,
        userId: user.id,
        description: `Created display loop ${loop.loopName}`,
        metadata: { loopName: loop.loopName },
      });
      const response: SuccessResponse<any> = {
        success: true,
        data: loop,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getLoop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const id = req.params.id as string;
      const loop = await this.loopService.getLoopForUser(id, user.id);
      const response: SuccessResponse<any> = {
        success: true,
        data: loop,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

   async listLoops(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const user = this.getUser(req);
       const page = Number(req.query.page ?? 1);
       const limit = Number(req.query.limit ?? 10);
       const displayId = req.query.displayId as string | undefined;
       const isActive = req.query.isActive as boolean | undefined;
       const sortBy = req.query.sortBy as string | undefined;
       const sortOrder = req.query.sortOrder as "asc" | "desc" | undefined;

       // Build filter object with only defined values
       const filters: {
         displayId?: string;
         isActive?: boolean;
         createdById?: string;
         sortBy?: string;
         sortOrder?: "asc" | "desc";
       } = { createdById: user.id };

       if (displayId !== undefined) filters.displayId = displayId;
       if (isActive !== undefined) filters.isActive = isActive;
       if (sortBy !== undefined) filters.sortBy = sortBy;
       if (sortOrder !== undefined) filters.sortOrder = sortOrder;

       const result = await this.loopService.listLoops(
         page,
         limit,
         filters
       );

       const response: SuccessResponse<any> = {
         success: true,
         data: {
           data: result.data,
           pagination: {
             page,
             limit,
             total: result.total,
             hasMore: page * limit < result.total,
           },
         },
       };
       res.status(200).json(response);
     } catch (error) {
       next(error);
     }
   }

  async updateLoop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const id = req.params.id as string;
      const loop = await this.loopService.updateLoop(id, user.id, req.body);
      await auditLog(req, {
        action: LogAction.UPDATE,
        entityType: EntityType.LOOP,
        entityId: loop.id,
        userId: user.id,
        description: `Updated display loop ${loop.loopName}`,
        changes: req.body,
      });
      const response: SuccessResponse<any> = {
        success: true,
        data: loop,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteLoop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const id = req.params.id as string;
      await this.loopService.deleteLoop(id, user.id);
      await auditLog(req, {
        action: LogAction.DELETE,
        entityType: EntityType.LOOP,
        entityId: id,
        userId: user.id,
        description: `Deleted display loop ${id}`,
      });
      const response: SuccessResponse<{ message: string }> = {
        success: true,
        data: { message: "Display loop deleted successfully" },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async addAdvertisement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const loopId = req.params.id as string;
      const loop = await this.loopService.addAdvertisement(loopId, user.id, req.body);
      await auditLog(req, {
        action: LogAction.UPDATE,
        entityType: EntityType.LOOP,
        entityId: loop.id,
        userId: user.id,
        description: `Added advertisement to display loop ${loop.loopName}`,
        metadata: { advertisementId: req.body.advertisementId },
      });
      const response: SuccessResponse<any> = {
        success: true,
        data: loop,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async addDisplay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const loopId = req.params.id as string;
      const loop = await this.loopService.addDisplay(loopId, user.id, req.body);
      await auditLog(req, {
        action: LogAction.UPDATE,
        entityType: EntityType.LOOP,
        entityId: loop.id,
        userId: user.id,
        description: `Assigned display to loop ${loop.loopName}`,
        metadata: { displayId: req.body.displayId },
      });
      const response: SuccessResponse<any> = {
        success: true,
        data: loop,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async removeAdvertisement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const loopId = req.params.id as string;
      const advertisementId = req.params.adId as string;
      const loop = await this.loopService.removeAdvertisement(loopId, user.id, advertisementId);
      await auditLog(req, {
        action: LogAction.UPDATE,
        entityType: EntityType.LOOP,
        entityId: loop.id,
        userId: user.id,
        description: `Removed advertisement from display loop ${loop.loopName}`,
        metadata: { advertisementId },
      });
      const response: SuccessResponse<any> = {
        success: true,
        data: loop,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateAdvertisementOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const loopId = req.params.id as string;
      const advertisementId = req.params.adId as string;
      const { newOrder } = req.body;
      const loop = await this.loopService.updateAdvertisementOrder(loopId, user.id, advertisementId, newOrder);
      await auditLog(req, {
        action: LogAction.UPDATE,
        entityType: EntityType.LOOP,
        entityId: loop.id,
        userId: user.id,
        description: `Reordered advertisement in display loop ${loop.loopName}`,
        metadata: { advertisementId, newOrder },
      });
      const response: SuccessResponse<any> = {
        success: true,
        data: loop,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default DisplayLoopController;
