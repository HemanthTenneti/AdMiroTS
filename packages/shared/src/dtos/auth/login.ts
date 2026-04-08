/**
 * Login Request/Response DTOs
 */

import { UserRole } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends Timestamps {
  user: UserResponse;
  token: string;
}

export interface UserResponse extends Timestamps {
  id: string;
  username: string;
  email: string;
  firstName: string | undefined;
  lastName: string | undefined;
  role: UserRole;
  profilePicture: string | undefined;
  isActive: boolean;
  lastLogin: Date | undefined;
}
