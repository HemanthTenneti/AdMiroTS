/**
 * Google Auth Request/Response DTOs
 */

import { Timestamps } from "../common/timestamps";
import { UserResponse } from "./login";

export interface GoogleAuthRequest {
  idToken: string;
}

export interface GoogleAuthResponse extends Timestamps {
  user: UserResponse;
  token: string;
  isNewUser: boolean;
}
