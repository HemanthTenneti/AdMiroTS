import { Router } from "express";
import { AuthController } from "./auth.controller";
import { JWTAuthMiddleware } from "../../middleware/auth.middleware";

/**
 * Create authentication routes
 * Sets up all auth endpoints with appropriate middleware
 */
export function createAuthRoutes(
  jwtSecret: string,
  googleClientId: string,
  jwtExpiresIn?: string
): Router {
  const router = Router();
  const authController = new AuthController(jwtSecret, googleClientId, jwtExpiresIn);
  const jwtAuth = new JWTAuthMiddleware(jwtSecret);

  // Public routes (no authentication required)
  router.post("/register", (req, res) => authController.register(req, res));
  router.post("/login", (req, res) => authController.login(req, res));
  router.post("/google", (req, res) => authController.googleAuth(req, res));

  // Protected routes (authentication required)
  router.get("/me", jwtAuth.authenticate(), (req, res) =>
    authController.getProfile(req, res)
  );
  router.post("/refresh", jwtAuth.authenticate(), (req, res) =>
    authController.refreshToken(req, res)
  );
  router.post("/change-password", jwtAuth.authenticate(), (req, res) =>
    authController.changePassword(req, res)
  );
  router.post("/logout", jwtAuth.authenticate(), (req, res) =>
    authController.logout(req, res)
  );

  return router;
}

export default createAuthRoutes;
