import client from "./client";
import {
  AddLoopAdvertisementPayload,
  AddLoopAdvertisementPayloadSchema,
  CreateDisplayLoopPayload,
  CreateDisplayLoopPayloadSchema,
  DisplayLoopListResponseSchema,
  DisplayLoopResponseSchema,
  UpdateDisplayLoopPayload,
  UpdateDisplayLoopPayloadSchema,
  UpdateLoopOrderPayload,
  UpdateLoopOrderPayloadSchema,
} from "@admiro/shared";

export type {
  CreateDisplayLoopPayload,
  UpdateDisplayLoopPayload,
  AddLoopAdvertisementPayload,
  UpdateLoopOrderPayload,
};

export const displayLoopsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    displayId?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const response = await client.get("/api/display-loops", { params });
    const parsed = DisplayLoopListResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  get: async (id: string) => {
    const response = await client.get(`/api/display-loops/${id}`);
    const parsed = DisplayLoopResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  create: async (payload: CreateDisplayLoopPayload) => {
    const parsedPayload = CreateDisplayLoopPayloadSchema.parse(payload);
    const response = await client.post("/api/display-loops", parsedPayload);
    const parsed = DisplayLoopResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  update: async (id: string, payload: UpdateDisplayLoopPayload) => {
    const parsedPayload = UpdateDisplayLoopPayloadSchema.parse(payload);
    const response = await client.put(`/api/display-loops/${id}`, parsedPayload);
    const parsed = DisplayLoopResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  delete: async (id: string) => {
    const response = await client.delete(`/api/display-loops/${id}`);
    return response;
  },

  addAdvertisement: async (id: string, payload: AddLoopAdvertisementPayload) => {
    const parsedPayload = AddLoopAdvertisementPayloadSchema.parse(payload);
    const response = await client.post(`/api/display-loops/${id}/advertisements`, parsedPayload);
    const parsed = DisplayLoopResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  removeAdvertisement: async (id: string, advertisementId: string) => {
    const response = await client.delete(`/api/display-loops/${id}/advertisements/${advertisementId}`);
    const parsed = DisplayLoopResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  updateAdvertisementOrder: async (id: string, advertisementId: string, payload: UpdateLoopOrderPayload) => {
    const parsedPayload = UpdateLoopOrderPayloadSchema.parse(payload);
    const response = await client.put(
      `/api/display-loops/${id}/advertisements/${advertisementId}/order`,
      parsedPayload
    );
    const parsed = DisplayLoopResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },
};
