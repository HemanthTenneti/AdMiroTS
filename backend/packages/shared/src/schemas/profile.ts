import { z } from "zod";
import { SuccessEnvelopeSchema } from "./common";

const ImageSourceSchema = z
  .string()
  .url()
  .or(z.string().regex(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "Invalid image data URI"));

export const ProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string(),
  profilePicture: ImageSourceSchema.optional(),
  googleId: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const ProfileResponseSchema = SuccessEnvelopeSchema(
  z.preprocess((value) => {
    if (value && typeof value === "object" && "_doc" in value) {
      return (value as { _doc: unknown })._doc;
    }
    return value;
  }, ProfileSchema)
);

export const UpdateProfilePayloadSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  profilePicture: ImageSourceSchema.optional(),
});

export const UploadAvatarPayloadSchema = z.object({
  avatarUrl: ImageSourceSchema,
});

export const AvatarResponseSchema = SuccessEnvelopeSchema(
  z.object({
    avatarUrl: ImageSourceSchema.optional(),
  })
);

export type UpdateProfilePayload = z.infer<typeof UpdateProfilePayloadSchema>;
export type UploadAvatarPayload = z.infer<typeof UploadAvatarPayloadSchema>;
