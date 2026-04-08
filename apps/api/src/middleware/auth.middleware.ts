import { Request, Response, NextFunction as ExpressNextFunction } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { UserRole } from "@admiro/domain";
import { JWTPayload, GoogleAuthPayload, AuthenticatedRequest } from "../types/auth.types";
import UserRepository from "../config/user.repository";

/**
 * JWT Authentication middleware
 * Verifies JWT token from Authorization header and attaches user to request
 */
export class JWTAuthMiddleware {
  private userRepository: UserRepository;

  constructor(private readonly jwtSecret: string) {
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is required");
    }
    this.userRepository = new UserRepository();
  }

  /**
   * Express middleware to verify JWT token
   * Validates token and fetches user from database
   */
  authenticate() {
    return async (
      req: Request & AuthenticatedRequest,
      res: Response,
      next: ExpressNextFunction
    ): Promise<void> => {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
          res.status(401).json({ error: "Missing authorization header" });
          return;
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
          res.status(401).json({ error: "Invalid authorization format" });
          return;
        }

        const token = parts[1]!;
        const decoded = jwt.verify(token, this.jwtSecret) as unknown as JWTPayload;
        req.jwtPayload = decoded;

        // Fetch full user from database
        const user = await this.userRepository.findById(decoded.sub);
        if (!user) {
          res.status(404).json({ error: "User not found" });
          return;
        }

        // Verify user is active
        if (!user.isActive) {
          res.status(403).json({ error: "User account is inactive" });
          return;
        }

        req.user = user;
        next();
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          res.status(401).json({ error: "Token expired" });
        } else if (error instanceof jwt.JsonWebTokenError) {
          res.status(401).json({ error: "Invalid token" });
        } else {
          res.status(401).json({ error: "Authentication failed" });
        }
      }
    };
  }
}

/**
 * Google OAuth authentication middleware
 * Verifies Google ID token and creates/updates user in database
 */
export class GoogleAuthMiddleware {
  private userRepository: UserRepository;
  private googleClient: OAuth2Client;

  constructor(private readonly googleClientId: string) {
    if (!googleClientId) {
      throw new Error("GOOGLE_CLIENT_ID is required");
    }
    this.userRepository = new UserRepository();
    this.googleClient = new OAuth2Client(googleClientId);
  }

  /**
   * Verify Google ID token using Google Auth Library
   * Returns decoded token payload with user information
   */
  async verifyGoogleToken(token: string): Promise<GoogleAuthPayload> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: this.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Failed to get payload from Google token");
    }

    return {
      sub: payload.sub,
      email: payload.email || "",
      email_verified: payload.email_verified || false,
      name: payload.name,
      picture: payload.picture,
    };
  }

  /**
   * Express middleware to handle Google OAuth authentication
   * Verifies token, finds or creates user, and attaches to request
   */
  authenticate() {
    return async (
      req: Request & AuthenticatedRequest,
      res: Response,
      next: ExpressNextFunction
    ): Promise<void> => {
      try {
        const token = req.body.token || req.headers["x-google-token"];

        if (!token) {
          res.status(401).json({ error: "Missing Google token" });
          return;
        }

        const googlePayload = await this.verifyGoogleToken(token as string);

        // Find existing user by Google ID or create new one
        let user = await this.userRepository.findByGoogleId(googlePayload.sub);

        if (!user) {
          // Create new user if doesn't exist
          user = await this.userRepository.create({
            googleId: googlePayload.sub,
            email: googlePayload.email,
            firstName: googlePayload.name,
            profilePicture: googlePayload.picture,
            role: UserRole.ADVERTISER,
            isActive: true,
          });
        }

        // Verify user is active
        if (!user.isActive) {
          res.status(403).json({ error: "User account is inactive" });
          return;
        }

        req.user = user;
        next();
      } catch (error) {
        if (error instanceof Error) {
          console.error("Google auth error:", error.message);
        }
        res.status(401).json({ error: "Google authentication failed" });
      }
    };
  }
}

export default JWTAuthMiddleware;
