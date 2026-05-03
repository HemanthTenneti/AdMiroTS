/**
 * Display loop validation schemas using Zod
 * Validates all display loop operations with strict type safety
 */
import { z } from "zod";
import { RotationType, DisplayLayout } from "@admiro/domain";

export const CreateDisplayLoopSchema = z.object({
  loopName: z.string().min(3, "Loop name must be at least 3 characters").max(255, "Loop name cannot exceed 255 characters"),
  displayId: z.string().min(1, "Display ID is required").optional(),
  displayIds: z.array(z.string().min(1, "Display ID is required")).optional(),
  rotationType: z.nativeEnum(RotationType).default(RotationType.SEQUENTIAL),
  displayLayout: z.nativeEnum(DisplayLayout).default(DisplayLayout.FULLSCREEN),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
});

export const UpdateDisplayLoopSchema = z.object({
  loopName: z.string().min(3).max(255).optional(),
  rotationType: z.nativeEnum(RotationType).optional(),
  displayLayout: z.nativeEnum(DisplayLayout).optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(1000).optional(),
});

export const ListDisplayLoopQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  displayId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const AddAdvertisementToLoopSchema = z.object({
  advertisementId: z.string().min(1, "Advertisement ID is required"),
  duration: z.number().int().positive("Duration must be positive"),
  order: z.number().int().min(0, "Order must be non-negative"),
  weight: z.number().int().min(1).default(1).optional(),
});

export const AddDisplayToLoopSchema = z.object({
  displayId: z.string().min(1, "Display ID is required"),
});

export const UpdateAdvertisementOrderSchema = z.object({
  newOrder: z.number().int().min(0, "Order must be non-negative"),
});

export const DisplayLoopValidationSchemas = {
  create: CreateDisplayLoopSchema,
  update: UpdateDisplayLoopSchema,
  list: ListDisplayLoopQuerySchema,
  addAdvertisement: AddAdvertisementToLoopSchema,
  addDisplay: AddDisplayToLoopSchema,
  updateOrder: UpdateAdvertisementOrderSchema,
};
