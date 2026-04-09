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

export const SystemLogValidationSchemas = {
  list: ListSystemLogQuerySchema,
};
