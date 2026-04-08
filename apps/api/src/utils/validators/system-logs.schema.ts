/**
 * System Log validation schemas using Zod
 * Validates audit log entries with strict type safety
 * Enforces constraints on actions, entity types, and metadata
 */
import { z } from "zod";

export const CreateSystemLogSchema = z.object({
  action: z.enum(["CREATE", "UPDATE", "DELETE", "ACTIVATE", "DEACTIVATE", "LOGIN", "LOGOUT", "CONFIG_CHANGE"]),
  entityType: z.enum(["USER", "ADVERTISEMENT", "DISPLAY", "DISPLAY_LOOP", "ANALYTICS", "CONNECTION_REQUEST"]),
  entityId: z.string().min(1, "Entity ID is required"),
  userId: z.string().min(1, "User ID is required"),
  details: z.object({
    description: z.string().min(1, "Description is required").max(5000, "Description cannot exceed 5000 characters"),
    changes: z.record(z.string(), z.any()).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
  ipAddress: z
    .string()
    .refine((val) => /^(\d{1,3}\.){3}\d{1,3}$/.test(val), "Invalid IP address")
    .optional(),
  userAgent: z.string().max(500, "User agent cannot exceed 500 characters").optional(),
});

export const SystemLogListQuerySchema = z.object({
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
  action: z.string().optional(),
  entityType: z.string().optional(),
  userId: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const SystemLogValidationSchemas = {
  create: CreateSystemLogSchema,
  listQuery: SystemLogListQuerySchema,
};
