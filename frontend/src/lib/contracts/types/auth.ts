/**
 * Authentication and authorization DTOs
 * Handles login, registration, OAuth, and token management
 */

import { UserRole } from "@admiro/domain";
import { UserResponse } from "./user";

/**
 * Standard email/password login request
 * Validates user credentials and returns authentication tokens
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * New user registration request
 * Creates a new user account with basic profile information
 */
export interface RegisterRequest {
  username: string; // Unique username, 3-20 characters
  email: string; // Valid email address
  password: string; // Min 8 characters, must include uppercase, lowercase, number
  firstName?: string | undefined;
  lastName?: string | undefined;
}

/**
 * Google OAuth authentication request
 * Authenticates user using Google ID token from OAuth flow
 */
export interface GoogleAuthRequest {
  idToken: string; // JWT token from Google Sign-In
}

/**
 * Refresh token request
 * Exchanges a valid refresh token for a new access token pair
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Password reset request initiation
 * Sends password reset email to the user
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Password reset confirmation
 * Completes password reset using token from email
 */
export interface ResetPasswordRequest {
  token: string; // Reset token from email link
  newPassword: string; // Must meet password requirements
}

/**
 * Authentication token response
 * Contains JWT tokens and expiration information
 */
export interface AuthTokenResponse {
  accessToken: string; // Short-lived JWT for API authentication
  refreshToken: string; // Long-lived token for obtaining new access tokens
  expiresIn: number; // Access token lifetime in seconds
}

/**
 * Successful login response
 * Returns user profile and authentication tokens
 */
export interface LoginResponse extends AuthTokenResponse {
  user: UserResponse;
}

/**
 * Successful registration response
 * Returns newly created user profile and authentication tokens
 */
export interface RegisterResponse {
  user: UserResponse;
  tokens: AuthTokenResponse;
}

/**
 * JWT token payload structure
 * Decoded access token contents for client-side use
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number; // Issued at timestamp (Unix epoch)
  exp: number; // Expiration timestamp (Unix epoch)
}

/**
 * Token validation response
 * Confirms token validity and returns decoded payload
 */
export interface ValidateTokenResponse {
  valid: boolean;
  payload?: TokenPayload | undefined;
}

/**
 * Logout response
 * Confirms successful token invalidation
 */
export interface LogoutResponse {
  message: string;
}

/**
 * OAuth callback data
 * Data received from OAuth provider after successful authentication
 */
export interface OAuthCallbackData {
  code: string; // Authorization code from OAuth provider
  state?: string | undefined; // CSRF protection state parameter
}
