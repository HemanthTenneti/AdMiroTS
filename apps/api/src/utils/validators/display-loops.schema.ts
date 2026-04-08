/**
 * Display Loop validation schemas using Zod
 * Validates all display loop operations with strict type safety
 * Enforces constraints on rotation types, layouts, and advertisements
 */
import { z } from "zod";

export const CreateDisplayLoopSchema = z.object({
  loopName: z
    .string()
    .min(1, "Loop name is required")
    .max(255, "Loop name cannot exceed 255 characters"),
  displayId: z.string().min(1, "Display ID is required"),
  advertisements: z
    .array(z.string().min(1, "Advertisement ID cannot be empty"))
    .min(1, "At least one advertisement is required")
    .max(100, "Cannot add more than 100 advertisements to a loop"),
  rotationType: z
    .enum(["SEQUENTIAL", "RANDOM", "WEIGHTED"])
    .refine((val) => ["SEQUENTIAL", "RANDOM", "WEIGHTED"].includes(val), {
      message: "Rotation type must be SEQUENTIAL, RANDOM, or WEIGHTED",
    }),
  displayLayout: z
    .enum(["FULLSCREEN", "MASONRY", "GRID"])
    .refine((val) => ["FULLSCREEN", "MASONRY", "GRID"].includes(val), {
      message: "Display layout must be FULLSCREEN, MASONRY, or GRID",
    }),
  description: z
    .string()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),
});

export const UpdateDisplayLoopSchema = z.object({
  loopName: z
    .string()
    .min(1, "Loop name is required")
    .max(255, "Loop name cannot exceed 255 characters")
    .optional(),
  advertisements: z
    .array(z.string().min(1, "Advertisement ID cannot be empty"))
    .min(1, "At least one advertisement is required")
    .max(100, "Cannot add more than 100 advertisements to a loop")
    .optional(),
  rotationType: z
    .enum(["SEQUENTIAL", "RANDOM", "WEIGHTED"])
    .refine((val) => ["SEQUENTIAL", "RANDOM", "WEIGHTED"].includes(val), {
      message: "Rotation type must be SEQUENTIAL, RANDOM, or WEIGHTED",
    })
    .optional(),
  displayLayout: z
    .enum(["FULLSCREEN", "MASONRY", "GRID"])
    .refine((val) => ["FULLSCREEN", "MASONRY", "GRID"].includes(val), {
      message: "Display layout must be FULLSCREEN, MASONRY, or GRID",
    })
    .optional(),
  description: z
    .string()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),
  isActive: z.boolean().optional(),
});

export const DisplayLoopListQuerySchema = z.object({
  page: z
    .coerce
    .number()
    .int("Page must be an integer")
    .min(1, "Page must be at least 1")
    .default(1),
  limit: z
    .coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  displayId: z.string().optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val ? val === "true" : undefined)),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const DisplayLoopValidationSchemas = {
  create: CreateDisplayLoopSchema,
  update: UpdateDisplayLoopSchema,
  listQuery: DisplayLoopListQuerySchema,
};
