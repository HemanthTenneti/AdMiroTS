/**
 * Display Loop Controller
 * Handles HTTP requests for display loop operations
 */
import { Request, Response, NextFunction } from "express";
import { DisplayLoopService } from "./display-loops.service";
import { SuccessResponse } from "@admiro/shared";
import { AuthenticatedRequest } from "../../types/auth.types";
import { UnauthorizedError } from "../../utils/errors/UnauthorizedError";

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
      this.getUser(req);
      const loop = await this.loopService.createLoop(req.body);
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
      const id = req.params.id as string;
      const loop = await this.loopService.getLoop(id);
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
      const page = req.query.page as string | undefined;
      const limit = req.query.limit as string | undefined;
      const displayId = req.query.displayId as string | undefined;
      const isActive = req.query.isActive as string | undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as "asc" | "desc" | undefined;

      const result = await this.loopService.listLoops(
        Number(page) || 1,
        Number(limit) || 10,
        {
          displayId,
          isActive: isActive !== undefined ? isActive === "true" : undefined,
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

  async updateLoop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.getUser(req);
      const id = req.params.id as string;
      const loop = await this.loopService.updateLoop(id, req.body);
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
      this.getUser(req);
      const id = req.params.id as string;
      await this.loopService.deleteLoop(id);
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
      this.getUser(req);
      const loopId = req.params.id as string;
      const loop = await this.loopService.addAdvertisement(loopId, req.body);
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
      this.getUser(req);
      const loopId = req.params.id as string;
      const advertisementId = req.params.adId as string;
      const loop = await this.loopService.removeAdvertisement(loopId, advertisementId);
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
      this.getUser(req);
      const loopId = req.params.id as string;
      const advertisementId = req.params.adId as string;
      const { newOrder } = req.body;
      const loop = await this.loopService.updateAdvertisementOrder(loopId, advertisementId, newOrder);
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
