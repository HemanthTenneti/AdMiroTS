/**
 * Token DTOs
 */

import { UserRole } from "@admiro/domain";

export interface AuthTokenResponse {
  token: string;
  expiresIn: string;
  type: "Bearer";
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface RefreshTokenRequest {
  token: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: string;
}
