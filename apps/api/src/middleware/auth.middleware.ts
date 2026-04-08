import { Request, Response, NextFunction as ExpressNextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload, AuthenticatedRequest } from "../types/auth.types";
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

export default JWTAuthMiddleware;
