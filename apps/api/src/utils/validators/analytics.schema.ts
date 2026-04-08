/**
 * Analytics validation schemas using Zod
 * Validates analytics data collection with type safety
 * Enforces constraints on metrics and engagement data
 */
import { z } from "zod";

export const CreateAnalyticsSchema = z.object({
  displayId: z.string().min(1, "Display ID is required"),
  adId: z.string().min(1, "Advertisement ID is required"),
  loopId: z.string().min(1, "Loop ID is required"),
  impressions: z.number().int("Impressions must be an integer").min(0, "Impressions cannot be negative").default(0),
  engagementMetrics: z.object({
    views: z.number().int("Views must be an integer").min(0).default(0),
    clicks: z.number().int("Clicks must be an integer").min(0).default(0),
    shares: z.number().int("Shares must be an integer").min(0).default(0),
    conversions: z.number().int("Conversions must be an integer").min(0).default(0),
  }).optional(),
  viewDuration: z.number().min(0, "View duration cannot be negative").default(0),
  completedViews: z.number().int("Completed views must be an integer").min(0).default(0),
  partialViews: z.number().int("Partial views must be an integer").min(0).default(0),
  metadata: z
    .object({
      deviceType: z.string().optional(),
      location: z.string().optional(),
      weatherCondition: z.string().optional(),
      crowdDensity: z.string().optional(),
    })
    .optional(),
});

export const AnalyticsListQuerySchema = z.object({
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
  adId: z.string().optional(),
  loopId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const AnalyticsValidationSchemas = {
  create: CreateAnalyticsSchema,
  listQuery: AnalyticsListQuerySchema,
};
