/**
 * Profile validation schemas using Zod
 */
import { z } from "zod";

export const UpdateProfileRequestSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profilePicture: z.string().optional(),
});

export const AvatarUploadRequestSchema = z.object({
  avatarUrl: z.string().min(1, "Avatar URL is required"),
});

export const ProfileSchemas = {
  updateProfile: UpdateProfileRequestSchema,
  uploadAvatar: AvatarUploadRequestSchema,
};
