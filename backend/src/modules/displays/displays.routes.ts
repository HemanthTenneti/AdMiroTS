/**
 * Display Routes
 */
import { Router, Request, Response, NextFunction } from "express";
import DisplayController from "./displays.controller";
import { JWTAuthMiddleware } from "../../middleware/auth.middleware";
import { validateRequest, validateQuery } from "../../middleware/validation.middleware";
import { DisplayValidationSchemas } from "./displays.validation";
import { publicDataRateLimiter } from "../../middleware/rate-limit.middleware.js";

export function createDisplayRoutes(jwtSecret: string): Router {
  const router = Router();
  const displayController = new DisplayController();
  const jwtAuth = new JWTAuthMiddleware(jwtSecret);

  const authMiddleware = jwtAuth.authenticate();

  // Device/public endpoints
  router.post(
    "/register-self",
    validateRequest(DisplayValidationSchemas.registerSelf),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.registerSelf(req, res).catch(next);
    }
  );

  router.post(
    "/login-display",
    validateRequest(DisplayValidationSchemas.loginDisplay),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.loginDisplay(req, res).catch(next);
    }
  );

  // Backward-compatible alias for existing display page flow
  router.post(
    "/login",
    validateRequest(DisplayValidationSchemas.loginDisplay),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.loginDisplay(req, res).catch(next);
    }
  );

  router.get("/by-token/:token", (req: Request, res: Response, next: NextFunction) => {
    displayController.getByConnectionToken(req, res).catch(next);
  });

  router.get("/loop/:token", (req: Request, res: Response, next: NextFunction) => {
    displayController.getDisplayLoop(req, res).catch(next);
  });

  router.post(
    "/report-status",
    validateRequest(DisplayValidationSchemas.reportStatus),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.reportStatus(req, res).catch(next);
    }
  );

  // Connection request workflow (protected)
  router.get(
    "/connection-requests/all",
    authMiddleware,
    validateQuery(DisplayValidationSchemas.connectionRequestListQuery),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.getConnectionRequests(req, res).catch(next);
    }
  );

  router.post(
    "/connection-requests/:requestId/approve",
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      displayController.approveConnectionRequest(req, res).catch(next);
    }
  );

  router.post(
    "/connection-requests/:requestId/reject",
    authMiddleware,
    validateRequest(DisplayValidationSchemas.rejectConnectionRequest),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.rejectConnectionRequest(req, res).catch(next);
    }
  );

  // Existing API endpoints
  router.get(
    "/",
    publicDataRateLimiter,
    validateQuery(DisplayValidationSchemas.filterQuery),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.listDisplays(req, res).catch(next);
    }
  );

  router.get("/location/:location", (req: Request, res: Response, next: NextFunction) => {
    displayController.getDisplaysByLocation(req, res).catch(next);
  });

  router.get("/:id/status", (req: Request, res: Response, next: NextFunction) => {
    displayController.getDisplayStatus(req, res).catch(next);
  });

  router.get("/:id/loops", (req: Request, res: Response, next: NextFunction) => {
    displayController.getAssignedLoops(req, res).catch(next);
  });

  router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    displayController.getDisplay(req, res).catch(next);
  });

  router.post(
    "/",
    authMiddleware,
    validateRequest(DisplayValidationSchemas.create),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.createDisplay(req, res).catch(next);
    }
  );

  router.put(
    "/:id",
    authMiddleware,
    validateRequest(DisplayValidationSchemas.update),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.updateDisplay(req, res).catch(next);
    }
  );

  router.delete("/:id", authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    displayController.deleteDisplay(req, res).catch(next);
  });

  router.post(
    "/pair",
    validateRequest(DisplayValidationSchemas.pair),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.pairDisplay(req, res).catch(next);
    }
  );

  router.post("/:id/ping", (req: Request, res: Response, next: NextFunction) => {
    displayController.pingDisplay(req, res).catch(next);
  });

  router.post(
    "/:id/config",
    authMiddleware,
    validateRequest(DisplayValidationSchemas.config),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.updateDisplayConfig(req, res).catch(next);
    }
  );

  return router;
}

export default createDisplayRoutes;
