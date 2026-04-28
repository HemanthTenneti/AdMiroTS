import client from "./client";

export interface AdRecord {
  id: string;
  adId: string;
  advertiserId: string;
  adName: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO" | "HTML";
  duration: number;
  description?: string;
  status: string;
  views: number;
  clicks: number;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAds {
  data: AdRecord[];
  pagination: { page: number; limit: number; total: number; hasMore: boolean };
}

export const advertisementsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; advertiserId?: string }) =>
    client.get<{ success: boolean; data: PaginatedAds }>("/api/advertisements", { params }),

  get: (id: string) =>
    client.get<{ success: boolean; data: AdRecord }>(`/api/advertisements/${id}`),

  create: (payload: {
    adName: string;
    mediaUrl: string;
    mediaType: string;
    duration: number;
    description?: string;
    targetAudience?: string;
    fileSize?: number;
  }) =>
    client.post<{ success: boolean; data: AdRecord }>("/api/advertisements", payload),

  update: (id: string, payload: Partial<AdRecord>) =>
    client.put<{ success: boolean; data: AdRecord }>(`/api/advertisements/${id}`, payload),

  delete: (id: string) =>
    client.delete(`/api/advertisements/${id}`),

  activate: (id: string) =>
    client.post<{ success: boolean; data: AdRecord }>(`/api/advertisements/${id}/activate`),

  deactivate: (id: string) =>
    client.post<{ success: boolean; data: AdRecord }>(`/api/advertisements/${id}/deactivate`),

  getStats: (id: string) =>
    client.get<{ success: boolean; data: { views: number; clicks: number; clickThroughRate: number } }>(`/api/advertisements/${id}/stats`),
};
