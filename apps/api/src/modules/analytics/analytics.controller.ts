/**
 * Analytics Controller
 * Handles HTTP requests for analytics operations
 */
import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "./analytics.service";
import { SuccessResponse } from "@admiro/shared";
import { AuthenticatedRequest } from "../../types/auth.types";
import { UnauthorizedError } from "../../utils/errors/UnauthorizedError";

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  private getUser(req: Request): any {
    const authReq = req as Request & AuthenticatedRequest;
    if (!authReq.user) {
      throw new UnauthorizedError("User not authenticated");
    }
    return authReq.user;
  }

  /**
   * Record a new analytics event
   */
  async recordEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In this system, displays might record events without a full user context,
      // but for this implementation, we'll keep it simple
      const event = await this.analyticsService.recordEvent(req.body);
      const response: SuccessResponse<any> = {
        success: true,
        data: event,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

   /**
    * List analytics records with pagination and filtering
    */
   async listAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       this.getUser(req);
       const page = req.query.page as string | undefined;
       const limit = req.query.limit as string | undefined;
       const displayId = req.query.displayId as string | undefined;
       const adId = req.query.adId as string | undefined;
       const loopId = req.query.loopId as string | undefined;
       const startDate = req.query.startDate as string | undefined;
       const endDate = req.query.endDate as string | undefined;
       const sortBy = req.query.sortBy as string | undefined;
       const sortOrder = req.query.sortOrder as "asc" | "desc" | undefined;

       // Build filter object with only defined values
       const filters: {
         displayId?: string;
         adId?: string;
         loopId?: string;
         startDate?: string;
         endDate?: string;
         sortBy?: string;
         sortOrder?: "asc" | "desc";
       } = {};

       if (displayId !== undefined) filters.displayId = displayId;
       if (adId !== undefined) filters.adId = adId;
       if (loopId !== undefined) filters.loopId = loopId;
       if (startDate !== undefined) filters.startDate = startDate;
       if (endDate !== undefined) filters.endDate = endDate;
       if (sortBy !== undefined) filters.sortBy = sortBy;
       if (sortOrder !== undefined) filters.sortOrder = sortOrder;

       const result = await this.analyticsService.listAnalytics(
         Number(page) || 1,
         Number(limit) || 10,
         filters
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
    * Get aggregated statistics
    */
   async getAggregatedStats(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       this.getUser(req);
       const displayId = req.query.displayId as string | undefined;
       const adId = req.query.adId as string | undefined;
       const loopId = req.query.loopId as string | undefined;
       const startDate = req.query.startDate as string | undefined;
       const endDate = req.query.endDate as string | undefined;

       // Build filter object with only defined values
       const filters: {
         displayId?: string;
         adId?: string;
         loopId?: string;
         startDate?: string;
         endDate?: string;
       } = {};

       if (displayId !== undefined) filters.displayId = displayId;
       if (adId !== undefined) filters.adId = adId;
       if (loopId !== undefined) filters.loopId = loopId;
       if (startDate !== undefined) filters.startDate = startDate;
       if (endDate !== undefined) filters.endDate = endDate;

       const stats = await this.analyticsService.getAggregatedAnalytics(filters);

       const response: SuccessResponse<any> = {
         success: true,
         data: stats,
       };
       res.status(200).json(response);
     } catch (error) {
       next(error);
     }
   }

  /**
   * Get single analytics record
   */
  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.getUser(req);
      const id = req.params.id as string;
      const analytics = await this.analyticsService.getAnalytics(id);
      const response: SuccessResponse<any> = {
        success: true,
        data: analytics,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default AnalyticsController;
