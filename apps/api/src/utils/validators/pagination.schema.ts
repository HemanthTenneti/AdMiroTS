/**
 * Pagination validation schemas using Zod
 */
import { z } from "zod";

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be >= 1").default(1),
  limit: z.coerce.number().int().min(1).max(100, "Limit must be <= 100").default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const PaginationSchemas = {
  query: PaginationQuerySchema,
};
