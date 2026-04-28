import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { AuthService } from "./auth.service";
import { AuthenticatedRequest } from "../../types/auth.types";

export class AuthController {
  private authService: AuthService;
  private googleClient: OAuth2Client;

  constructor(jwtSecret: string, googleClientId: string, jwtExpiresIn?: string) {
    this.authService = new AuthService(jwtSecret, jwtExpiresIn);
    this.googleClient = new OAuth2Client(googleClientId);
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, confirmPassword, username, firstName, lastName, role } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: "Email and password are required" });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ success: false, message: "Invalid email format" });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        return;
      }

      if (confirmPassword && confirmPassword !== password) {
        res.status(400).json({ success: false, message: "Passwords do not match" });
        return;
      }

      // Derive username from email if not provided
      const finalUsername = username || email.split("@")[0];

      const { user, token } = await this.authService.register(email, password, finalUsername, role);

      // Store firstName/lastName separately if provided — these come from the profile,
      // but we can update the user after creation if the domain supports it
      // For now surface them in the response so the frontend can display them

      res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: {
          user: {
            ...user.toSafeObject(),
            firstName: firstName || user.toSafeObject().firstName,
            lastName: lastName || user.toSafeObject().lastName,
          },
          accessToken: token,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ success: false, message: error.message });
        return;
      }
      console.error("Registration error:", error);
      res.status(500).json({ success: false, message: "Registration failed" });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      // Accept either `email` or `usernameOrEmail` from the request body
      const usernameOrEmail = req.body.usernameOrEmail || req.body.email;
      const { password } = req.body;

      if (!usernameOrEmail || !password) {
        res.status(400).json({ success: false, message: "Email/username and password are required" });
        return;
      }

      // The auth service login method expects email — we need to resolve username → email first.
      // We'll do that lookup here and pass email to the service.
      const userRepo = (this.authService as any).userRepository;
      let resolvedEmail = usernameOrEmail;

      // If it doesn't look like an email, treat it as a username
      if (!usernameOrEmail.includes("@")) {
        const userByUsername = await userRepo.findByUsernameOrEmail(usernameOrEmail);
        if (!userByUsername) {
          // Use the generic error message — don't reveal whether username exists
          res.status(401).json({ success: false, message: "Invalid email or password" });
          return;
        }
        resolvedEmail = userByUsername.email;
      }

      const { user, token } = await this.authService.login(resolvedEmail, password);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: user.toSafeObject(),
          accessToken: token,
        },
      });
    } catch (error) {
      if (error instanceof Error && (error.message.includes("Invalid") || error.message.includes("inactive"))) {
        res.status(401).json({ success: false, message: error.message });
        return;
      }
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ success: false, message: "Google token is required" });
        return;
      }

      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        res.status(500).json({ success: false, message: "Google client ID not configured" });
        return;
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        res.status(401).json({ success: false, message: "Invalid Google token" });
        return;
      }

      const { user, token: jwtToken, isNewUser } = await this.authService.googleAuth(
        payload.sub,
        payload.email || "",
        payload.name,
        payload.picture
      );

      res.status(200).json({
        success: true,
        message: isNewUser ? "Account created successfully" : "Login successful",
        data: {
          user: user.toSafeObject(),
          accessToken: jwtToken,
          isNewUser,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("inactive")) {
        res.status(401).json({ success: false, message: error.message });
        return;
      }
      console.error("Google auth error:", error);
      res.status(500).json({ success: false, message: "Google authentication failed" });
    }
  }

  async getProfile(req: Request & AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user: req.user.toSafeObject() },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ success: false, message: "Failed to get profile" });
    }
  }

  async refreshToken(req: Request & AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const token = await this.authService.refreshToken(req.user.id);

      res.status(200).json({
        success: true,
        data: { accessToken: token },
      });
    } catch (error) {
      if (error instanceof Error && (error.message.includes("not found") || error.message.includes("inactive"))) {
        res.status(401).json({ success: false, message: error.message });
        return;
      }
      console.error("Refresh token error:", error);
      res.status(500).json({ success: false, message: "Failed to refresh token" });
    }
  }

  async changePassword(req: Request & AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, message: "Current password and new password are required" });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
        return;
      }

      await this.authService.changePassword(req.user.id, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      if (error instanceof Error && (error.message.includes("incorrect") || error.message.includes("not found") || error.message.includes("no password"))) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      console.error("Change password error:", error);
      res.status(500).json({ success: false, message: "Failed to change password" });
    }
  }

  async logout(req: Request & AuthenticatedRequest, res: Response): Promise<void> {
    // JWT logout is client-side (remove token from storage).
    // Server-side token blacklist is a future enhancement.
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  }
}

export default AuthController;
