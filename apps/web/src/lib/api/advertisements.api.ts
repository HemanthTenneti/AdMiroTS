import client from "./client";
import {
  AdvertisementListResponseSchema,
  AdRecordSchema,
  CreateUploadUrlPayload,
  CreateUploadUrlPayloadSchema,
  SuccessEnvelopeSchema,
  UploadUrlResponseSchema,
} from "@admiro/shared";
import { z } from "zod";

export interface AdRecord {
  id: string;
  adId: string;
  advertiserId: string;
  adName: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  duration: number;
  description?: string;
  status: string;
  views: number;
  clicks: number;
  fileSize?: number;
  mediaObjectKey?: string;
  createdAt: string;
  updatedAt: string;
}

const AdWithKeySchema = AdRecordSchema.extend({
  mediaObjectKey: z.string().optional(),
});

const AdResponseSchema = SuccessEnvelopeSchema(AdWithKeySchema);

const AdStatsResponseSchema = SuccessEnvelopeSchema(
  z.object({
    views: z.number(),
    clicks: z.number(),
    clickThroughRate: z.number(),
  })
);

const MutationResponseSchema = SuccessEnvelopeSchema(z.any());

export const advertisementsApi = {
  list: async (params?: { page?: number; limit?: number; status?: string; advertiserId?: string }) => {
    const response = await client.get("/api/advertisements", { params });
    const parsed = AdvertisementListResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  listByUser: async (userId: string) => {
    const response = await client.get(`/api/advertisements/user/${userId}`);
    const parsed = AdvertisementListResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  get: async (id: string) => {
    const response = await client.get(`/api/advertisements/${id}`);
    const parsed = AdResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  create: async (payload: {
    adName: string;
    mediaUrl: string;
    mediaType: "image" | "video";
    duration: number;
    description?: string;
    targetAudience?: string;
    fileSize?: number;
    mediaObjectKey?: string;
  }) => {
    const response = await client.post("/api/advertisements", payload);
    const parsed = AdResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  update: async (id: string, payload: Partial<AdRecord>) => {
    const response = await client.put(`/api/advertisements/${id}`, payload);
    const parsed = AdResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  delete: async (id: string) => {
    const response = await client.delete(`/api/advertisements/${id}`);
    const parsed = MutationResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  activate: async (id: string) => {
    const response = await client.post(`/api/advertisements/${id}/activate`);
    const parsed = AdResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  deactivate: async (id: string) => {
    const response = await client.post(`/api/advertisements/${id}/deactivate`);
    const parsed = AdResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  getStats: async (id: string) => {
    const response = await client.get(`/api/advertisements/${id}/stats`);
    const parsed = AdStatsResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  bulkUpload: async (payload: {
    advertisements: Array<{
      adName: string;
      mediaUrl: string;
      mediaType: "image" | "video";
      duration: number;
      description?: string;
      targetAudience?: string;
      fileSize?: number;
      mediaObjectKey?: string;
    }>;
  }) => {
    const response = await client.post("/api/advertisements/bulk-upload", payload);
    const parsed = MutationResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  createUploadUrl: async (payload: CreateUploadUrlPayload) => {
    const parsedPayload = CreateUploadUrlPayloadSchema.parse(payload);
    const response = await client.post("/api/advertisements/upload-url", parsedPayload);
    const parsed = UploadUrlResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },
};
