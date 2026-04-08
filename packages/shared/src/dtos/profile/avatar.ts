/**
 * Avatar Upload Request/Response DTOs
 */

import { Timestamps } from "../common/timestamps";

export interface AvatarUploadRequest {
  avatarUrl: string;
}

export interface AvatarResponse {
  url: string;
}

export interface AvatarUploadResponse extends Timestamps {
  avatar: AvatarResponse;
}
