/**
 * Analytics Routes
 * Defines all endpoints for analytics operations
 */
import { Router, Request, Response, NextFunction } from "express";
import { AnalyticsController } from "./analytics.controller";
import { JWTAuthMiddleware } from "../../middleware/auth.middleware";
import { validateRequest, validateQuery } from "../../middleware/validation.middleware";
import { AnalyticsValidationSchemas } from "./analytics.validation";
import { publicDataRateLimiter } from "../../middleware/rate-limit.middleware.js";

export function createAnalyticsRoutes(jwtSecret: string): Router {
  const router = Router();
  const analyticsController = new AnalyticsController();
  const jwtAuth = new JWTAuthMiddleware(jwtSecret);
  const authMiddleware = jwtAuth.authenticate();

  /**
   * PUBLIC/DISPLAY ROUTES
   * Displays record analytics without full user authentication usually
   */
  router.post(
    "/record",
    validateRequest(AnalyticsValidationSchemas.record),
    (req: Request, res: Response, next: NextFunction) => {
      analyticsController.recordEvent(req, res, next).catch(next);
    }
  );

  /**
   * PROTECTED ROUTES
   * Management/Reporting access
   */

  router.get(
    "/",
    authMiddleware,
    publicDataRateLimiter,
    validateQuery(AnalyticsValidationSchemas.list),
    (req: Request, res: Response, next: NextFunction) => {
      analyticsController.listAnalytics(req, res, next).catch(next);
    }
  );

  router.get(
    "/stats",
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      analyticsController.getAggregatedStats(req, res, next).catch(next);
    }
  );

  router.get("/:id", authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    analyticsController.getAnalytics(req, res, next).catch(next);
  });

  return router;
}

export default createAnalyticsRoutes;
