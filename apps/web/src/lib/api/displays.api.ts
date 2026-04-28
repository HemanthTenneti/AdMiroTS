import client from "./client";

export interface DisplayRecord {
  id: string;
  displayId: string;
  displayName: string;
  location: string;
  status: string;
  connectionToken: string;
  isConnected: boolean;
  currentLoopId?: string;
  lastSeen?: string;
  resolution: { width: number; height: number };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDisplays {
  data: DisplayRecord[];
  pagination: { page: number; limit: number; total: number; hasMore: boolean };
}

export interface RegisterSelfPayload {
  displayName: string;
  location: string;
  displayId?: string;
  password?: string;
  resolution: { width: number; height: number };
  browserInfo?: Record<string, string>;
}

export const displaysApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    client.get<{ success: boolean; data: PaginatedDisplays }>("/api/displays", { params }),

  get: (id: string) =>
    client.get<{ success: boolean; data: DisplayRecord }>(`/api/displays/${id}`),

  create: (payload: { displayId: string; displayName: string; location: string; resolution: { width: number; height: number } }) =>
    client.post<{ success: boolean; data: DisplayRecord }>("/api/displays", payload),

  update: (id: string, payload: Partial<DisplayRecord>) =>
    client.put<{ success: boolean; data: DisplayRecord }>(`/api/displays/${id}`, payload),

  delete: (id: string) =>
    client.delete(`/api/displays/${id}`),

  getStatus: (id: string) =>
    client.get<{ success: boolean; data: { id: string; status: string; isOnline: boolean; lastSeen?: string } }>(`/api/displays/${id}/status`),

  ping: (id: string) =>
    client.post(`/api/displays/${id}/ping`),

  getAssignedLoops: (id: string) =>
    client.get(`/api/displays/${id}/loops`),

  // Display device self-registration
  registerSelf: (payload: RegisterSelfPayload) =>
    client.post<{
      success: boolean;
      data: { displayId: string; connectionToken: string; status: string; isPendingApproval: boolean };
    }>("/api/displays/register-self", payload),

  // Poll for approval using connection token
  getByConnectionToken: (token: string) =>
    client.get<{ success: boolean; data: DisplayRecord }>(`/api/displays/by-token/${token}`),

  // Heartbeat from display device
  reportStatus: (payload: { connectionToken: string; status: string; currentAdPlaying?: string }) =>
    client.post("/api/displays/report-status", payload),
};
