/**
 * Profile Routes
 * Defines all endpoints for user profile operations
 */
import { Router, Request, Response, NextFunction } from "express";
import ProfileController from "./profile.controller";
import { JWTAuthMiddleware } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { UpdateProfileRequestSchema, AvatarUploadRequestSchema } from "../../utils/validators/profile.schema";

export function createProfileRoutes(jwtSecret: string): Router {
  const router = Router();
  const profileController = new ProfileController();
  const jwtAuth = new JWTAuthMiddleware(jwtSecret);

  // All profile routes require authentication
  const authMiddleware = jwtAuth.authenticate();

  // GET /api/profile - Get user profile
  router.get("/", authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    profileController.getProfile(req, res).catch(next);
  });

  // PUT /api/profile - Update user profile
  router.put(
    "/",
    authMiddleware,
    validateRequest(UpdateProfileRequestSchema),
    (req: Request, res: Response, next: NextFunction) => {
      profileController.updateProfile(req, res).catch(next);
    }
  );

  // GET /api/profile/avatar - Get user avatar
  router.get("/avatar", authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    profileController.getAvatar(req, res).catch(next);
  });

  // POST /api/profile/avatar - Upload/update avatar
  router.post(
    "/avatar",
    authMiddleware,
    validateRequest(AvatarUploadRequestSchema),
    (req: Request, res: Response, next: NextFunction) => {
      profileController.uploadAvatar(req, res).catch(next);
    }
  );

  return router;
}

export default createProfileRoutes;
