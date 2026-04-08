import { User, UserRole } from "@admiro/domain";

/**
 * JWT payload structure
 * Contains user identification and authorization claims
 */
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat: number; // Issued at
  exp: number; // Expiration
}

/**
 * Google OAuth response from google-auth-library
 */
export interface GoogleAuthPayload {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name?: string | undefined;
  picture?: string | undefined;
}

/**
 * Authenticated request with JWT or Google OAuth
 */
export interface AuthenticatedRequest {
  user?: User;
  jwtPayload?: JWTPayload;
}
