import { z } from "zod";
import { PaginationSchema, SuccessEnvelopeSchema } from "./common";

export const AnalyticsRecordSchema = z.object({
  id: z.string(),
  displayId: z.string(),
  adId: z.string(),
  loopId: z.string(),
  impressions: z.number().int(),
  viewDuration: z.number(),
  completedViews: z.number().int(),
  partialViews: z.number().int(),
  metrics: z
    .object({
      clicks: z.number().int().optional(),
      interactions: z.number().int().optional(),
      dwellTime: z.number().optional(),
    })
    .optional(),
  timestamp: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const AnalyticsListResponseSchema = SuccessEnvelopeSchema(
  z.object({
    data: z.array(AnalyticsRecordSchema),
    pagination: PaginationSchema,
  })
);

export const RecordAnalyticsPayloadSchema = z.object({
  displayId: z.string().min(1),
  adId: z.string().min(1),
  loopId: z.string().min(1),
  impressions: z.number().int().min(0).default(0),
  viewDuration: z.number().min(0).default(0),
  completedViews: z.number().int().min(0).default(0),
  partialViews: z.number().int().min(0).default(0),
  metrics: z
    .object({
      clicks: z.number().int().min(0).optional(),
      interactions: z.number().int().min(0).optional(),
      dwellTime: z.number().min(0).optional(),
    })
    .optional(),
});

export const AnalyticsOverviewResponseSchema = SuccessEnvelopeSchema(
  z.object({
    totalViews: z.number(),
    totalClicks: z.number(),
    activeDisplays: z.number(),
    activeAds: z.number(),
  })
);

export const AnalyticsTimelineResponseSchema = SuccessEnvelopeSchema(
  z.array(
    z.object({
      label: z.string().optional(),
      timestamp: z.string().optional(),
      impressions: z.number().optional(),
      clicks: z.number().optional(),
      completedViews: z.number().optional(),
      partialViews: z.number().optional(),
      views: z.number().optional(),
    })
  )
);

export type RecordAnalyticsPayload = z.infer<typeof RecordAnalyticsPayloadSchema>;
