import client from "./client";
import {
  ConnectionRequestListResponseSchema,
  DisplayListResponseSchema,
  DisplayLoginPayload,
  DisplayLoginPayloadSchema,
  DisplayLoginResponseSchema,
  DisplayRecord,
  RegisterSelfPayload,
  RegisterSelfPayloadSchema,
  RegisterSelfResponseSchema,
  RejectConnectionRequestPayload,
  RejectConnectionRequestPayloadSchema,
  SuccessEnvelopeSchema,
} from "@admiro/shared";
import { z } from "zod";

const DisplayDetailsResponseSchema = SuccessEnvelopeSchema(
  z
    .object({
      id: z.string(),
      displayId: z.string(),
      displayName: z.string(),
      location: z.string(),
      status: z.string(),
      layout: z.string().optional(),
      serialNumber: z.string().optional(),
    })
    .passthrough()
);

const DisplayStatusResponseSchema = SuccessEnvelopeSchema(
  z.object({
    id: z.string(),
    status: z.string(),
    isOnline: z.boolean(),
    lastSeen: z.string().optional(),
  })
);

const DisplayLoopResponseSchema = SuccessEnvelopeSchema(
  z.object({
    loop: z.any().nullable(),
    advertisements: z.array(
      z.object({
        id: z.string(),
        adId: z.string(),
        adName: z.string(),
        mediaUrl: z.string().url(),
        mediaType: z.string(),
        duration: z.number(),
        order: z.number().int(),
      })
    ),
  })
);

const ByTokenResponseSchema = SuccessEnvelopeSchema(
  z
    .object({
      id: z.string(),
      displayId: z.string(),
      displayName: z.string(),
      location: z.string(),
      status: z.string(),
      connectionRequestStatus: z.enum(["pending", "approved", "rejected"]).optional(),
      connectionRequestId: z.string().nullable().optional(),
      rejectionReason: z.string().nullable().optional(),
    })
    .passthrough()
);

const MutationSuccessSchema = SuccessEnvelopeSchema(z.any());

export type { DisplayRecord, RegisterSelfPayload, DisplayLoginPayload, RejectConnectionRequestPayload };

export const displaysApi = {
  list: async (params?: { page?: number; limit?: number; status?: string; location?: string }) => {
    const response = await client.get("/api/displays", { params });
    const parsed = DisplayListResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  get: async (id: string) => {
    const response = await client.get(`/api/displays/${id}`);
    const parsed = DisplayDetailsResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  create: async (payload: {
    displayId: string;
    location: string;
    layout: "landscape" | "portrait";
    resolution: { width: number; height: number };
    serialNumber?: string;
  }) => {
    const response = await client.post("/api/displays", payload);
    const parsed = MutationSuccessSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  update: async (id: string, payload: Partial<DisplayRecord>) => {
    const response = await client.put(`/api/displays/${id}`, payload);
    const parsed = MutationSuccessSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  delete: async (id: string) => {
    const response = await client.delete(`/api/displays/${id}`);
    const parsed = MutationSuccessSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  getStatus: async (id: string) => {
    const response = await client.get(`/api/displays/${id}/status`);
    const parsed = DisplayStatusResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  ping: async (id: string) => {
    const response = await client.post(`/api/displays/${id}/ping`);
    const parsed = MutationSuccessSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  getAssignedLoops: async (id: string) => {
    const response = await client.get(`/api/displays/${id}/loops`);
    const parsed = MutationSuccessSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  updateConfig: async (
    id: string,
    payload: { brightness: number; volume: number; refreshRate: number; orientation: "landscape" | "portrait" }
  ) => {
    const response = await client.post(`/api/displays/${id}/config`, payload);
    const parsed = MutationSuccessSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  pair: async (payload: { serialNumber: string }) => {
    const response = await client.post("/api/displays/pair", payload);
    const parsed = MutationSuccessSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  registerSelf: async (payload: RegisterSelfPayload) => {
    const parsedPayload = RegisterSelfPayloadSchema.parse(payload);
    const response = await client.post("/api/displays/register-self", parsedPayload);
    const parsedResponse = RegisterSelfResponseSchema.parse(response.data);
    return { ...response, data: parsedResponse };
  },

  loginDisplay: async (payload: DisplayLoginPayload) => {
    const parsedPayload = DisplayLoginPayloadSchema.parse(payload);
    const response = await client.post("/api/displays/login-display", parsedPayload);
    const parsedResponse = DisplayLoginResponseSchema.parse(response.data);
    return { ...response, data: parsedResponse };
  },

  getByConnectionToken: async (token: string) => {
    const response = await client.get(`/api/displays/by-token/${token}`);
    const parsedResponse = ByTokenResponseSchema.parse(response.data);
    return { ...response, data: parsedResponse };
  },

  getLoopByToken: async (token: string) => {
    const response = await client.get(`/api/displays/loop/${token}`);
    const parsed = DisplayLoopResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  reportStatus: async (payload: {
    connectionToken: string;
    status: string;
    currentAdPlaying?: string;
  }) => {
    const response = await client.post("/api/displays/report-status", payload);
    const parsed = MutationSuccessSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  getConnectionRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "approved" | "rejected";
  }) => {
    const response = await client.get("/api/displays/connection-requests/all", { params });
    const parsed = ConnectionRequestListResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  approveConnectionRequest: async (requestId: string) => {
    const response = await client.post(`/api/displays/connection-requests/${requestId}/approve`, {});
    const parsed = MutationSuccessSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  rejectConnectionRequest: async (requestId: string, payload: RejectConnectionRequestPayload) => {
    const parsedPayload = RejectConnectionRequestPayloadSchema.parse(payload);
    const response = await client.post(
      `/api/displays/connection-requests/${requestId}/reject`,
      parsedPayload
    );
    const parsed = MutationSuccessSchema.parse(response.data);
    return { ...response, data: parsed };
  },
};
