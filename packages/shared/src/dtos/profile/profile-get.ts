/**
 * Profile Get Request/Response DTOs
 */

import { Timestamps } from "../common/timestamps";
import { UserResponse } from "../auth/login";

export interface GetProfileResponse extends Timestamps {
  user: UserResponse;
}
