/**
 * Analytics Controller
 */
import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "./analytics.service";
import { SuccessResponse } from "@admiro/shared";
import { AuthenticatedRequest } from "../../types/auth.types";
import { UnauthorizedError } from "../../utils/errors/UnauthorizedError";

export class AnalyticsController {
  private readonly analyticsService: AnalyticsService;

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

  async recordEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
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

      const result = await this.analyticsService.listAnalytics(Number(page) || 1, Number(limit) || 10, {
        displayId,
        adId,
        loopId,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

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

  async getAggregatedStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.getUser(req);
      const displayId = req.query.displayId as string | undefined;
      const adId = req.query.adId as string | undefined;
      const loopId = req.query.loopId as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const stats = await this.analyticsService.getAggregatedAnalytics({
        displayId,
        adId,
        loopId,
        startDate,
        endDate,
      });

      const response: SuccessResponse<any> = {
        success: true,
        data: stats,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

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

  async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.getUser(req);
      const overview = await this.analyticsService.getOverviewStats();
      res.status(200).json({ success: true, data: overview });
    } catch (error) {
      next(error);
    }
  }

  async getDisplayStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.getUser(req);
      const displayId = req.params.id as string;
      const stats = await this.analyticsService.getDisplayStats(displayId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getAdvertisementStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.getUser(req);
      const adId = req.params.id as string;
      const stats = await this.analyticsService.getAdvertisementStats(adId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.getUser(req);
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;
      const interval = req.query.interval as "hour" | "day" | undefined;
      const timeline = await this.analyticsService.getTimeline({ from, to, interval });
      res.status(200).json({ success: true, data: timeline });
    } catch (error) {
      next(error);
    }
  }
}

export default AnalyticsController;
