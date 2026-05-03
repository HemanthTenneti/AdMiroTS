/**
 * Register Request/Response DTOs
 */

import { UserRole } from "@admiro/domain";
import { Timestamps } from "../common/timestamps";

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName: string | undefined;
  lastName: string | undefined;
}

export interface RegisterResponse extends Timestamps {
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string | undefined;
    lastName: string | undefined;
    role: UserRole;
    profilePicture: string | undefined;
    isActive: boolean;
  };
  token: string;
}
