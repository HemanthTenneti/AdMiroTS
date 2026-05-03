/**
 * Display Loop Routes
 * Defines all endpoints for display loop operations
 */
import { Router, Request, Response, NextFunction } from "express";
import { DisplayLoopController } from "./display-loops.controller";
import { JWTAuthMiddleware } from "../../middleware/auth.middleware";
import { validateRequest, validateQuery } from "../../middleware/validation.middleware";
import { DisplayLoopValidationSchemas } from "./display-loops.validation";
import { publicDataRateLimiter } from "../../middleware/rate-limit.middleware.js";

export function createDisplayLoopRoutes(jwtSecret: string): Router {
  const router = Router();
  const loopController = new DisplayLoopController();
  const jwtAuth = new JWTAuthMiddleware(jwtSecret);
  const authMiddleware = jwtAuth.authenticate();

  /**
   * PUBLIC ROUTES
   */
  
  router.get(
    "/",
    publicDataRateLimiter,
    validateQuery(DisplayLoopValidationSchemas.list),
    (req: Request, res: Response, next: NextFunction) => {
      loopController.listLoops(req, res, next).catch(next);
    }
  );

  router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    loopController.getLoop(req, res, next).catch(next);
  });

  /**
   * PROTECTED ROUTES
   */

  router.post(
    "/",
    authMiddleware,
    validateRequest(DisplayLoopValidationSchemas.create),
    (req: Request, res: Response, next: NextFunction) => {
      loopController.createLoop(req, res, next).catch(next);
    }
  );

  router.put(
    "/:id",
    authMiddleware,
    validateRequest(DisplayLoopValidationSchemas.update),
    (req: Request, res: Response, next: NextFunction) => {
      loopController.updateLoop(req, res, next).catch(next);
    }
  );

  router.delete("/:id", authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    loopController.deleteLoop(req, res, next).catch(next);
  });

  // Advertisement management in loops
  router.post(
    "/:id/advertisements",
    authMiddleware,
    validateRequest(DisplayLoopValidationSchemas.addAdvertisement),
    (req: Request, res: Response, next: NextFunction) => {
      loopController.addAdvertisement(req, res, next).catch(next);
    }
  );

  router.delete(
    "/:id/advertisements/:adId",
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      loopController.removeAdvertisement(req, res, next).catch(next);
    }
  );

  router.put(
    "/:id/advertisements/:adId/order",
    authMiddleware,
    validateRequest(DisplayLoopValidationSchemas.updateOrder),
    (req: Request, res: Response, next: NextFunction) => {
      loopController.updateAdvertisementOrder(req, res, next).catch(next);
    }
  );

  return router;
}

export default createDisplayLoopRoutes;
