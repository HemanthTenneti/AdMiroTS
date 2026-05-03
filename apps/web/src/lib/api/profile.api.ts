import client from "./client";
import {
  AvatarResponseSchema,
  ProfileResponseSchema,
  UpdateProfilePayload,
  UpdateProfilePayloadSchema,
  UploadAvatarPayload,
  UploadAvatarPayloadSchema,
} from "@admiro/shared";

export type { UpdateProfilePayload, UploadAvatarPayload };

export const profileApi = {
  get: async () => {
    const response = await client.get("/api/profile");
    const parsed = ProfileResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  update: async (payload: UpdateProfilePayload) => {
    const parsedPayload = UpdateProfilePayloadSchema.parse(payload);
    const response = await client.put("/api/profile", parsedPayload);
    const parsed = ProfileResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  getAvatar: async () => {
    const response = await client.get("/api/profile/avatar");
    const parsed = AvatarResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  uploadAvatar: async (payload: UploadAvatarPayload) => {
    const parsedPayload = UploadAvatarPayloadSchema.parse(payload);
    const response = await client.post("/api/profile/avatar", parsedPayload);
    const parsed = ProfileResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },
};
