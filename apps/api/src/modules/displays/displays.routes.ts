/**
 * Display Routes
 * Defines all endpoints for display operations
 * Routes are organized with public endpoints first, then protected endpoints
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

  // Auth middleware for protected routes
  const authMiddleware = jwtAuth.authenticate();

  /**
   * PUBLIC ROUTES (no authentication required)
   * These endpoints are accessible to all users
   */

  // GET /api/displays - List all displays with pagination
  // Query params: page, limit, status, location, layout, sortBy, sortOrder
  // Rate limited to prevent data scraping
  router.get(
    "/",
    publicDataRateLimiter,
    validateQuery(DisplayValidationSchemas.filterQuery),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.listDisplays(req, res).catch(next);
    }
  );

  // GET /api/displays/:id - Get single display by ID
  router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    displayController.getDisplay(req, res).catch(next);
  });

  // GET /api/displays/:id/status - Get display status (online/offline)
  router.get("/:id/status", (req: Request, res: Response, next: NextFunction) => {
    displayController.getDisplayStatus(req, res).catch(next);
  });

  // GET /api/displays/:id/loops - Get loops assigned to a display
  router.get("/:id/loops", (req: Request, res: Response, next: NextFunction) => {
    displayController.getAssignedLoops(req, res).catch(next);
  });

  // GET /api/displays/location/:location - Get displays at specific location
  router.get("/location/:location", (req: Request, res: Response, next: NextFunction) => {
    displayController.getDisplaysByLocation(req, res).catch(next);
  });

  /**
   * PROTECTED ROUTES (authentication required)
   * These endpoints require valid JWT token
   */

  // POST /api/displays - Create new display
  router.post(
    "/",
    authMiddleware,
    validateRequest(DisplayValidationSchemas.create),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.createDisplay(req, res).catch(next);
    }
  );

  // PUT /api/displays/:id - Update display properties
  router.put(
    "/:id",
    authMiddleware,
    validateRequest(DisplayValidationSchemas.update),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.updateDisplay(req, res).catch(next);
    }
  );

  // DELETE /api/displays/:id - Soft delete display
  router.delete("/:id", authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    displayController.deleteDisplay(req, res).catch(next);
  });

  // POST /api/displays/pair - Pair/activate a display
  router.post(
    "/pair",
    validateRequest(DisplayValidationSchemas.create),
    (req: Request, res: Response, next: NextFunction) => {
      displayController.pairDisplay(req, res).catch(next);
    }
  );

  // POST /api/displays/:id/ping - Record display heartbeat
  router.post("/:id/ping", (req: Request, res: Response, next: NextFunction) => {
    displayController.pingDisplay(req, res).catch(next);
  });

  // POST /api/displays/:id/config - Update display configuration
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
