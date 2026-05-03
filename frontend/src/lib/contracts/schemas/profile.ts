import { z } from "zod";
import { SuccessEnvelopeSchema } from "./common";

export const ProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string(),
  profilePicture: z.string().url().optional(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const ProfileResponseSchema = SuccessEnvelopeSchema(ProfileSchema);

export const UpdateProfilePayloadSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  profilePicture: z.string().url().optional(),
});

export const UploadAvatarPayloadSchema = z.object({
  avatarUrl: z.string().url(),
});

export const AvatarResponseSchema = SuccessEnvelopeSchema(
  z.object({
    avatarUrl: z.string().url().optional(),
  })
);

export type UpdateProfilePayload = z.infer<typeof UpdateProfilePayloadSchema>;
export type UploadAvatarPayload = z.infer<typeof UploadAvatarPayloadSchema>;
