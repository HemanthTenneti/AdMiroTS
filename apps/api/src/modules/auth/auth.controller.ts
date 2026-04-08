import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { AuthService } from "./auth.service";
import { AuthenticatedRequest } from "../../types/auth.types";

/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */
export class AuthController {
  private authService: AuthService;
  private googleClient: OAuth2Client;

  constructor(
    jwtSecret: string,
    googleClientId: string,
    jwtExpiresIn?: string
  ) {
    this.authService = new AuthService(jwtSecret, jwtExpiresIn);
    this.googleClient = new OAuth2Client(googleClientId);
  }

  /**
   * POST /api/auth/register
   * Register new user with email and password
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, username, role } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: "Invalid email format" });
        return;
      }

      // Validate password length
      if (password.length < 6) {
        res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
        return;
      }

      const { user, token } = await this.authService.register(
        email,
        password,
        username,
        role
      );

      res.status(201).json({
        message: "User registered successfully",
        user: user.toSafeObject(),
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          res.status(409).json({ error: error.message });
          return;
        }
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  }

  /**
   * POST /api/auth/login
   * Login user with email and password
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const { user, token } = await this.authService.login(email, password);

      res.status(200).json({
        message: "Login successful",
        user: user.toSafeObject(),
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("Invalid email") ||
          error.message.includes("inactive")
        ) {
          res.status(401).json({ error: error.message });
          return;
        }
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }

  /**
   * POST /api/auth/google
   * Authenticate user with Google OAuth token
   */
  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: "Google token is required" });
        return;
      }

      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        res.status(500).json({ error: "Google client ID not configured" });
        return;
      }

      // Verify Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        res.status(401).json({ error: "Invalid Google token" });
        return;
      }

      const { user, token: jwtToken, isNewUser } = await this.authService.googleAuth(
        payload.sub,
        payload.email || "",
        payload.name,
        payload.picture
      );

      res.status(200).json({
        message: isNewUser
          ? "User registered successfully"
          : "Login successful",
        user: user.toSafeObject(),
        token: jwtToken,
        isNewUser,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("inactive")) {
          res.status(401).json({ error: error.message });
          return;
        }
      }
      console.error("Google auth error:", error);
      res.status(500).json({ error: "Google authentication failed" });
    }
  }

  /**
   * GET /api/auth/me
   * Get current user profile
   * Requires authentication middleware
   */
  async getProfile(req: Request & AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      res.status(200).json({
        user: req.user.toSafeObject(),
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh JWT token
   * Requires authentication middleware
   */
  async refreshToken(req: Request & AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const token = await this.authService.refreshToken(req.user.id);

      res.status(200).json({
        message: "Token refreshed successfully",
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("not found") ||
          error.message.includes("inactive")
        ) {
          res.status(401).json({ error: error.message });
          return;
        }
      }
      console.error("Refresh token error:", error);
      res.status(500).json({ error: "Failed to refresh token" });
    }
  }

  /**
   * POST /api/auth/change-password
   * Change user password
   * Requires authentication middleware
   */
  async changePassword(req: Request & AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // Validate required fields
      if (!currentPassword || !newPassword) {
        res
          .status(400)
          .json({ error: "Current password and new password are required" });
        return;
      }

      // Validate new password length
      if (newPassword.length < 6) {
        res
          .status(400)
          .json({ error: "New password must be at least 6 characters" });
        return;
      }

      await this.authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("incorrect") ||
          error.message.includes("not found") ||
          error.message.includes("no password")
        ) {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      console.error("Change password error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user (client-side token removal)
   * Placeholder for future token blacklist implementation
   */
  async logout(req: Request & AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // In JWT authentication, logout is typically handled client-side
      // by removing the token from storage
      // Future enhancement: Implement token blacklist for server-side logout

      res.status(200).json({
        message: "Logout successful",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  }
}

export default AuthController;
