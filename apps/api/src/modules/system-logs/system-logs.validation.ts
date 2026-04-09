/**
 * System log validation schemas using Zod
 * Validates all system log operations with strict type safety
 */
import { z } from "zod";
import { LogAction, EntityType } from "@admiro/domain";

export const ListSystemLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  action: z.nativeEnum(LogAction).optional(),
  entityType: z.nativeEnum(EntityType).optional(),
  entityId: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const RecordSystemLogSchema = z.object({
  action: z.nativeEnum(LogAction),
  entityType: z.nativeEnum(EntityType),
  entityId: z.string().min(1, "Entity ID is required"),
  description: z.string().min(1, "Description is required").max(500, "Description cannot exceed 500 characters"),
  changes: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const SystemLogValidationSchemas = {
  list: ListSystemLogQuerySchema,
  record: RecordSystemLogSchema,
};
