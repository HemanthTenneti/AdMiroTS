import client from "./client";
import {
  AnalyticsListResponseSchema,
  AnalyticsOverviewResponseSchema,
  AnalyticsTimelineResponseSchema,
  RecordAnalyticsPayload,
  RecordAnalyticsPayloadSchema,
  SuccessEnvelopeSchema,
} from "@admiro/shared";
import { z } from "zod";

const GenericStatsSchema = SuccessEnvelopeSchema(z.record(z.string(), z.any()));

export type { RecordAnalyticsPayload };

export const analyticsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    displayId?: string;
    adId?: string;
    loopId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await client.get("/api/analytics", { params });
    const parsed = AnalyticsListResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  record: async (payload: RecordAnalyticsPayload) => {
    const parsedPayload = RecordAnalyticsPayloadSchema.parse(payload);
    const response = await client.post("/api/analytics/record", parsedPayload);
    const parsed = GenericStatsSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  overview: async () => {
    const response = await client.get("/api/analytics/overview");
    const parsed = AnalyticsOverviewResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  displayStats: async (id: string) => {
    const response = await client.get(`/api/analytics/displays/${id}`);
    const parsed = GenericStatsSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  adStats: async (id: string) => {
    const response = await client.get(`/api/analytics/advertisements/${id}`);
    const parsed = GenericStatsSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  timeline: async (params?: { from?: string; to?: string; interval?: string }) => {
    const response = await client.get("/api/analytics/timeline", { params });
    const parsed = AnalyticsTimelineResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  stats: async () => {
    const response = await client.get("/api/analytics/stats");
    const parsed = GenericStatsSchema.parse(response.data);
    return { ...response, data: parsed };
  },
};
