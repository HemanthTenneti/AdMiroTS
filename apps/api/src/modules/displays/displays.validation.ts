/**
 * Display validation schemas using Zod
 * Validates all display operations with strict type safety
 * Enforces constraints on configuration, resolution, and metadata
 */
import { z } from "zod";

export const CreateDisplaySchema = z.object({
  displayId: z.string().min(1, "Display ID is required").max(100, "Display ID cannot exceed 100 characters"),
  location: z.string().min(1, "Location is required").max(255, "Location cannot exceed 255 characters"),
  layout: z.enum(["LANDSCAPE", "PORTRAIT"]).describe("Layout orientation"),
  resolution: z.object({
    width: z.number().int("Width must be an integer").positive("Width must be positive"),
    height: z.number().int("Height must be an integer").positive("Height must be positive"),
  }),
  configuration: z.object({
    brightness: z.number().int("Brightness must be an integer").min(0).max(100).default(100),
    volume: z.number().int("Volume must be an integer").min(0).max(100).default(50),
    refreshRate: z.number().int("Refresh rate must be an integer").positive("Refresh rate must be positive").default(60),
    orientation: z.enum(["LANDSCAPE", "PORTRAIT"]).default("LANDSCAPE"),
  }).optional(),
  serialNumber: z.string().min(1, "Serial number is required").max(100, "Serial number cannot exceed 100 characters").optional(),
});

export const UpdateDisplaySchema = z.object({
  location: z.string().min(1).max(255, "Location cannot exceed 255 characters").optional(),
  configuration: z.object({
    brightness: z.number().int("Brightness must be an integer").min(0).max(100).optional(),
    volume: z.number().int("Volume must be an integer").min(0).max(100).optional(),
    refreshRate: z.number().int("Refresh rate must be an integer").positive("Refresh rate must be positive").optional(),
    orientation: z.enum(["LANDSCAPE", "PORTRAIT"]).optional(),
  }).optional(),
});

export const DisplayFilterQuerySchema = z.object({
  page: z.coerce.number().int("Page must be an integer").min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int("Limit must be an integer").min(1).max(100, "Limit cannot exceed 100").default(10),
  status: z.string().optional(),
  location: z.string().optional(),
  layout: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const DisplayLoopSchema = z.object({
  displays: z.array(z.string().min(1, "Display ID cannot be empty")).min(1, "At least one display is required"),
});

export const DisplayConfigSchema = z.object({
  brightness: z.number().int("Brightness must be an integer").min(0).max(100),
  volume: z.number().int("Volume must be an integer").min(0).max(100),
  refreshRate: z.number().int("Refresh rate must be an integer").positive("Refresh rate must be positive"),
  orientation: z.enum(["LANDSCAPE", "PORTRAIT"]),
});

export const PairDisplaySchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required").max(100, "Serial number cannot exceed 100 characters"),
});

export const DisplayValidationSchemas = {
  create: CreateDisplaySchema,
  update: UpdateDisplaySchema,
  filterQuery: DisplayFilterQuerySchema,
  assignLoops: DisplayLoopSchema,
  config: DisplayConfigSchema,
  pair: PairDisplaySchema,
};
