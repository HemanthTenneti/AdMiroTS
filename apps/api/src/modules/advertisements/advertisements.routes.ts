/**
 * Advertisement Routes
 * Defines all endpoints for advertisement operations
 * Routes are organized with public endpoints first, then protected endpoints
 */
import { Router, Request, Response, NextFunction } from "express";
import AdvertisementController from "./advertisements.controller";
import { JWTAuthMiddleware } from "../../middleware/auth.middleware";
import { validateRequest, validateQuery } from "../../middleware/validation.middleware";
import { AdvertisementValidationSchemas } from "./advertisements.validation";
import { publicDataRateLimiter } from "../../middleware/rate-limit.middleware.js";

export function createAdvertisementRoutes(jwtSecret: string): Router {
  const router = Router();
  const adController = new AdvertisementController();
  const jwtAuth = new JWTAuthMiddleware(jwtSecret);

  // Auth middleware for protected routes
  const authMiddleware = jwtAuth.authenticate();

  /**
   * PUBLIC ROUTES (no authentication required)
   * These endpoints are accessible to all users
   */

  // GET /api/advertisements - List all advertisements with pagination
  // Query params: page, limit, status, mediaType, advertiserId, sortBy, sortOrder
  // Rate limited to prevent data scraping
  router.get(
    "/",
    publicDataRateLimiter,
    validateQuery(AdvertisementValidationSchemas.listQuery),
    (req: Request, res: Response, next: NextFunction) => {
      adController.listAdvertisements(req, res, next).catch(next);
    }
  );

  // GET /api/advertisements/:id - Get single advertisement by ID
  router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    adController.getAdvertisement(req, res, next).catch(next);
  });

  // GET /api/advertisements/:id/stats - Get advertisement statistics (views, clicks, CTR)
  router.get("/:id/stats", (req: Request, res: Response, next: NextFunction) => {
    adController.getAdvertisementStats(req, res, next).catch(next);
  });

  // GET /api/advertisements/user/:userId - Get all ads by a specific advertiser
  router.get("/user/:userId", (req: Request, res: Response, next: NextFunction) => {
    adController.getAdvertisementsByUser(req, res, next).catch(next);
  });

  /**
   * PROTECTED ROUTES (authentication required)
   * These endpoints require valid JWT token
   */

  // POST /api/advertisements - Create new advertisement
  router.post(
    "/",
    authMiddleware,
    validateRequest(AdvertisementValidationSchemas.create),
    (req: Request, res: Response, next: NextFunction) => {
      adController.createAdvertisement(req, res, next).catch(next);
    }
  );

  // PUT /api/advertisements/:id - Update advertisement
  router.put(
    "/:id",
    authMiddleware,
    validateRequest(AdvertisementValidationSchemas.update),
    (req: Request, res: Response, next: NextFunction) => {
      adController.updateAdvertisement(req, res, next).catch(next);
    }
  );

  // DELETE /api/advertisements/:id - Soft delete advertisement
  router.delete("/:id", authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    adController.deleteAdvertisement(req, res, next).catch(next);
  });

  // POST /api/advertisements/:id/activate - Activate advertisement
  router.post(
    "/:id/activate",
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      adController.activateAdvertisement(req, res, next).catch(next);
    }
  );

  // POST /api/advertisements/:id/deactivate - Deactivate advertisement
  router.post(
    "/:id/deactivate",
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      adController.deactivateAdvertisement(req, res, next).catch(next);
    }
  );

  // POST /api/advertisements/bulk-upload - Bulk create advertisements
  router.post(
    "/bulk-upload",
    authMiddleware,
    validateRequest(AdvertisementValidationSchemas.bulkUpload),
    (req: Request, res: Response, next: NextFunction) => {
      adController.bulkUploadAdvertisements(req, res, next).catch(next);
    }
  );

  return router;
}

export default createAdvertisementRoutes;
