import client from "./client";
import {
  UpdateProfilePayload,
  UpdateProfilePayloadSchema,
  UploadAvatarPayload,
  UploadAvatarPayloadSchema,
} from "@/lib/contracts";

export type { UpdateProfilePayload, UploadAvatarPayload };

export interface ProfileData {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
}

export const profileApi = {
  get: () =>
    client.get<ProfileResponse>("/api/profile"),

  update: async (payload: UpdateProfilePayload) => {
    const parsedPayload = UpdateProfilePayloadSchema.parse(payload);
    return client.put<ProfileResponse>("/api/profile", parsedPayload);
  },

  getAvatar: () =>
    client.get<{ success: boolean; data: { avatarUrl?: string } }>("/api/profile/avatar"),

  uploadAvatar: async (payload: UploadAvatarPayload) => {
    const parsedPayload = UploadAvatarPayloadSchema.parse(payload);
    return client.post<ProfileResponse>("/api/profile/avatar", parsedPayload);
  },
};
