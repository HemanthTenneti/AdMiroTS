/**
 * Profile Update Request/Response DTOs
 */

import { Timestamps } from "../common/timestamps";
import { UserResponse } from "../auth/login";

export interface UpdateProfileRequest {
  firstName: string | undefined;
  lastName: string | undefined;
  profilePicture: string | undefined;
}

export interface UpdateProfileResponse extends Timestamps {
  user: UserResponse;
}
