/**
 * System Log Routes
 * Defines all endpoints for system log operations
 */
import { Router, Request, Response, NextFunction } from "express";
import { SystemLogController } from "./system-logs.controller";
import { JWTAuthMiddleware } from "../../middleware/auth.middleware";
import { validateQuery } from "../../middleware/validation.middleware";
import { SystemLogValidationSchemas } from "./system-logs.validation";
import { publicDataRateLimiter } from "../../middleware/rate-limit.middleware.js";

export function createSystemLogRoutes(jwtSecret: string): Router {
  const router = Router();
  const logController = new SystemLogController();
  const jwtAuth = new JWTAuthMiddleware(jwtSecret);
  const authMiddleware = jwtAuth.authenticate();

  /**
   * ALL PROTECTED ROUTES
   * System logs are sensitive audit trails
   */

  router.get(
    "/",
    authMiddleware,
    publicDataRateLimiter,
    validateQuery(SystemLogValidationSchemas.list),
    (req: Request, res: Response, next: NextFunction) => {
      logController.listLogs(req, res, next).catch(next);
    }
  );

  router.get("/:id", authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    logController.getLog(req, res, next).catch(next);
  });

  return router;
}

export default createSystemLogRoutes;
