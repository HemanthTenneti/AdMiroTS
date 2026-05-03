import client from "./client";
import {
  RecordSystemLogPayload,
  RecordSystemLogPayloadSchema,
  SystemLogListResponseSchema,
  SystemLogResponseSchema,
} from "@/lib/contracts";

export type { RecordSystemLogPayload };

export const systemLogsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const response = await client.get("/api/system-logs", { params });
    const parsed = SystemLogListResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  get: async (id: string) => {
    const response = await client.get(`/api/system-logs/${id}`);
    const parsed = SystemLogResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },

  record: async (payload: RecordSystemLogPayload) => {
    const parsedPayload = RecordSystemLogPayloadSchema.parse(payload);
    const response = await client.post("/api/system-logs/record", parsedPayload);
    const parsed = SystemLogResponseSchema.parse(response.data);
    return { ...response, data: parsed };
  },
};
