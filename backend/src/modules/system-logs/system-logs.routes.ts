/**
 * System Log Routes
 * Defines all endpoints for system log operations
 */
import { Router, Request, Response, NextFunction } from "express";
import { SystemLogController } from "./system-logs.controller";
import { JWTAuthMiddleware } from "../../middleware/auth.middleware";
import { validateRequest, validateQuery } from "../../middleware/validation.middleware";
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

  // POST /api/system-logs/record - Record a new system log entry
  router.post(
    "/record",
    authMiddleware,
    validateRequest(SystemLogValidationSchemas.record),
    (req: Request, res: Response, next: NextFunction) => {
      logController.recordLog(req, res, next).catch(next);
    }
  );

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
