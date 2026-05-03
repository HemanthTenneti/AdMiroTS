/**
 * Advertisement Controller
 * Handles HTTP requests for advertisement operations
 * Acts as bridge between HTTP layer and business logic layer
 */
import { Request, Response, NextFunction } from "express";
import AdvertisementService from "./advertisements.service";
import { AuthenticatedRequest } from "../../types/auth.types";
import { UnauthorizedError } from "../../utils/errors/UnauthorizedError";
import { SuccessResponse } from "@admiro/shared";
import { BulkUploadResponse } from "./advertisements.types";

export class AdvertisementController {
  private adService: AdvertisementService;

  constructor() {
    // Instantiate service with dependency injection
    // Service contains all business logic
    this.adService = new AdvertisementService();
  }

  /**
   * Extract authenticated user from request context
   * Thrown UnauthorizedError if user not authenticated
   *
   * @param req - Express request object with optional user property
   * @returns Authenticated user object
   * @throws UnauthorizedError if user not authenticated
   */
  private getUser(req: Request): any {
    const authReq = req as Request & AuthenticatedRequest;
    if (!authReq.user) {
      throw new UnauthorizedError("User not authenticated");
    }
    return authReq.user;
  }

  /**
   * POST /api/advertisements
   * Create a new advertisement
   * Requires authentication - uses authenticated user as advertiser
   *
   * @param req - Express request with body: CreateAdvertisementInput
   * @param res - Express response
   * @param next - Express next middleware
   */
  async createAdvertisement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const {
        adName,
        mediaUrl,
        mediaType,
        duration,
        description,
        targetAudience,
        fileSize,
        mediaObjectKey,
      } = req.body;

      const ad = await this.adService.createAdvertisement(user.id, {
        adName,
        mediaUrl,
        mediaType,
        duration,
        description,
        targetAudience,
        fileSize,
        mediaObjectKey,
      });

      const response: SuccessResponse<any> = {
        success: true,
        data: ad,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/advertisements/upload-url
   * Generates a signed URL for direct upload to Cloudflare R2.
   */
  async createUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const { mediaType, mimeType, fileName, fileSize } = req.body;

      const upload = await this.adService.createUploadUrl({
        advertiserId: user.id,
        mediaType,
        mimeType,
        fileName,
        fileSize,
      });

      const response: SuccessResponse<any> = {
        success: true,
        data: upload,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/advertisements
   * List advertisements with pagination and optional filtering
   * Public endpoint - no authentication required
   *
   * @param req - Express request with query params (page, limit, status, etc.)
   * @param res - Express response
   * @param next - Express next middleware
   */
  async listAdvertisements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page as string | undefined;
      const limit = req.query.limit as string | undefined;
      const status = req.query.status as string | undefined;
      const mediaType = req.query.mediaType as string | undefined;
      const advertiserId = req.query.advertiserId as string | undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as "asc" | "desc" | undefined;

      const result = await this.adService.listAdvertisements(
        Number(page) || 1,
        Number(limit) || 10,
        {
          status,
          mediaType,
          advertiserId,
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
   * GET /api/advertisements/:id
   * Retrieve a single advertisement by ID
   * Public endpoint - no authentication required
   *
   * @param req - Express request with id parameter
   * @param res - Express response
   * @param next - Express next middleware
   */
  async getAdvertisement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const ad = await this.adService.getAdvertisement(id);

      const response: SuccessResponse<any> = {
        success: true,
        data: ad,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/advertisements/:id
   * Update an advertisement
   * Requires authentication
   *
   * @param req - Express request with id parameter and body: UpdateAdvertisementInput
   * @param res - Express response
   * @param next - Express next middleware
   */
  async updateAdvertisement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const id = req.params.id as string;
      const ad = await this.adService.updateAdvertisement(id, user.id, req.body);

      const response: SuccessResponse<any> = {
        success: true,
        data: ad,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/advertisements/:id
   * Soft delete an advertisement
   * Requires authentication
   *
   * @param req - Express request with id parameter
   * @param res - Express response
   * @param next - Express next middleware
   */
  async deleteAdvertisement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const id = req.params.id as string;
      await this.adService.deleteAdvertisement(id, user.id);

      const response: SuccessResponse<{ message: string }> = {
        success: true,
        data: { message: "Advertisement deleted successfully" },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/advertisements/:id/activate
   * Activate an advertisement (set status to ACTIVE)
   * Requires authentication
   *
   * @param req - Express request with id parameter
   * @param res - Express response
   * @param next - Express next middleware
   */
  async activateAdvertisement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const id = req.params.id as string;
      const ad = await this.adService.activateAdvertisement(id, user.id);

      const response: SuccessResponse<any> = {
        success: true,
        data: ad,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/advertisements/:id/deactivate
   * Deactivate an advertisement (set status to PAUSED)
   * Requires authentication
   *
   * @param req - Express request with id parameter
   * @param res - Express response
   * @param next - Express next middleware
   */
  async deactivateAdvertisement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const id = req.params.id as string;
      const ad = await this.adService.deactivateAdvertisement(id, user.id);

      const response: SuccessResponse<any> = {
        success: true,
        data: ad,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/advertisements/:id/stats
   * Get engagement statistics for an advertisement
   * Public endpoint - no authentication required
   *
   * @param req - Express request with id parameter
   * @param res - Express response
   * @param next - Express next middleware
   */
  async getAdvertisementStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const stats = await this.adService.getAdvertisementStats(id);

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
   * GET /api/advertisements/user/:userId
   * List all advertisements created by a specific user
   * Public endpoint - no authentication required
   *
   * @param req - Express request with userId parameter
   * @param res - Express response
   * @param next - Express next middleware
   */
  async getAdvertisementsByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const ads = await this.adService.getAdvertisementsByUser(userId);

      const response: SuccessResponse<any> = {
        success: true,
        data: ads,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/advertisements/bulk-upload
   * Create multiple advertisements in a single request
   * Requires authentication - uses authenticated user as advertiser for all ads
   *
   * @param req - Express request with body: { advertisements: CreateAdvertisementInput[] }
   * @param res - Express response
   * @param next - Express next middleware
   */
  async bulkUploadAdvertisements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUser(req);
      const { advertisements } = req.body;

      const created = await this.adService.bulkCreateAdvertisements(user.id, advertisements);

      const response: SuccessResponse<BulkUploadResponse> = {
        success: true,
        data: {
          count: created.length,
          advertisements: created,
        },
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default AdvertisementController;
