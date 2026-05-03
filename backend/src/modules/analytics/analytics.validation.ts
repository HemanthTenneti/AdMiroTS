/**
 * Analytics validation schemas using Zod
 * Validates all analytics operations with strict type safety
 */
import { z } from "zod";

const DateStringSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid date",
});

export const RecordAnalyticsSchema = z.object({
  displayId: z.string().min(1, "Display ID is required"),
  adId: z.string().min(1, "Advertisement ID is required"),
  loopId: z.string().min(1, "Loop ID is required"),
  impressions: z.number().int().min(0).default(0),
  viewDuration: z.number().min(0).default(0),
  completedViews: z.number().int().min(0).default(0),
  partialViews: z.number().int().min(0).default(0),
  metrics: z.object({
    clicks: z.number().int().min(0).optional(),
    interactions: z.number().int().min(0).optional(),
    dwellTime: z.number().min(0).optional(),
  }).optional(),
  metadata: z.object({
    deviceType: z.string().optional(),
    location: z.string().optional(),
    weatherCondition: z.string().optional(),
    crowdDensity: z.string().optional(),
  }).optional(),
});

export const ListAnalyticsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  displayId: z.string().optional(),
  adId: z.string().optional(),
  loopId: z.string().optional(),
  startDate: DateStringSchema.optional(),
  endDate: DateStringSchema.optional(),
  sortBy: z.string().default("timestamp"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const AnalyticsValidationSchemas = {
  record: RecordAnalyticsSchema,
  list: ListAnalyticsQuerySchema,
};
