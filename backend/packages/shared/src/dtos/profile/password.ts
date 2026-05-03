/**
 * Password Change Request/Response DTOs
 */

import { Timestamps } from "../common/timestamps";

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse extends Timestamps {
  success: boolean;
  message: string;
}
