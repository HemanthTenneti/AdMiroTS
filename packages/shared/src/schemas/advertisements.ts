import { z } from "zod";
import { PaginationSchema, SuccessEnvelopeSchema } from "./common";

export const AdRecordSchema = z.object({
  id: z.string(),
  adId: z.string(),
  advertiserId: z.string(),
  adName: z.string(),
  mediaUrl: z.string().url(),
  mediaType: z.enum(["image", "video"]),
  duration: z.number().positive(),
  description: z.string().optional(),
  status: z.string(),
  views: z.number().int(),
  clicks: z.number().int(),
  fileSize: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AdvertisementListResponseSchema = SuccessEnvelopeSchema(
  z.object({
    data: z.array(AdRecordSchema),
    pagination: PaginationSchema,
  })
);

export const CreateUploadUrlPayloadSchema = z.object({
  mediaType: z.enum(["image", "video"]),
  mimeType: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().int().positive(),
});

export const UploadUrlResponseSchema = SuccessEnvelopeSchema(
  z.object({
    objectKey: z.string(),
    uploadUrl: z.string().url(),
    publicUrl: z.string().url(),
    expiresIn: z.number().int().positive(),
  })
);

export type CreateUploadUrlPayload = z.infer<typeof CreateUploadUrlPayloadSchema>;
