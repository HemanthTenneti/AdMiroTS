/**
 * Advertisement validation schemas using Zod.
 */
import { z } from "zod";

export const CreateAdvertisementSchema = z.object({
  adName: z
    .string()
    .min(1, "Ad name is required")
    .max(255, "Ad name cannot exceed 255 characters"),
  mediaUrl: z.string().url("Invalid media URL").max(2048, "Media URL cannot exceed 2048 characters"),
  mediaType: z.enum(["image", "video"]),
  duration: z
    .number()
    .int("Duration must be an integer")
    .positive("Duration must be positive")
    .max(3600, "Duration cannot exceed 3600 seconds"),
  description: z.string().max(5000, "Description cannot exceed 5000 characters").optional(),
  targetAudience: z.string().max(500, "Target audience cannot exceed 500 characters").optional(),
  fileSize: z
    .number()
    .positive("File size must be positive")
    .max(500 * 1024 * 1024, "File size cannot exceed 500MB")
    .optional(),
  mediaObjectKey: z.string().max(1024).optional(),
});

export const UpdateAdvertisementSchema = z.object({
  adName: z
    .string()
    .min(1, "Ad name is required")
    .max(255, "Ad name cannot exceed 255 characters")
    .optional(),
  mediaUrl: z
    .string()
    .url("Invalid media URL")
    .max(2048, "Media URL cannot exceed 2048 characters")
    .optional(),
  mediaType: z.enum(["image", "video"]).optional(),
  duration: z
    .number()
    .int("Duration must be an integer")
    .positive("Duration must be positive")
    .max(3600, "Duration cannot exceed 3600 seconds")
    .optional(),
  description: z.string().max(5000, "Description cannot exceed 5000 characters").optional(),
  targetAudience: z.string().max(500, "Target audience cannot exceed 500 characters").optional(),
  fileSize: z
    .number()
    .positive("File size must be positive")
    .max(500 * 1024 * 1024, "File size cannot exceed 500MB")
    .optional(),
  mediaObjectKey: z.string().max(1024).optional(),
});

export const AdvertisementListQuerySchema = z.object({
  page: z.coerce.number().int("Page must be an integer").min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int("Limit must be an integer").min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
  status: z.string().optional(),
  mediaType: z.string().optional(),
  advertiserId: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const BulkUploadAdvertisementsSchema = z.object({
  advertisements: z
    .array(CreateAdvertisementSchema)
    .min(1, "At least one advertisement is required")
    .max(100, "Cannot bulk upload more than 100 advertisements at once"),
});

export const CreateUploadUrlSchema = z.object({
  mediaType: z.enum(["image", "video"]),
  mimeType: z.string().min(1),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive(),
});

export const AdvertisementValidationSchemas = {
  create: CreateAdvertisementSchema,
  update: UpdateAdvertisementSchema,
  listQuery: AdvertisementListQuerySchema,
  bulkUpload: BulkUploadAdvertisementsSchema,
  createUploadUrl: CreateUploadUrlSchema,
};
