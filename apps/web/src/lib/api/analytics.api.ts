import client from "./client";

interface OverviewStats {
  totalViews: number;
  totalClicks: number;
  activeDisplays: number;
  activeAds: number;
}

interface TimelineParams {
  from?: string;
  to?: string;
  interval?: string;
}

export const analyticsApi = {
  overview: () =>
    client.get<{ success: boolean; data: OverviewStats }>("/api/analytics/overview"),

  displayStats: (id: string) =>
    client.get(`/api/analytics/displays/${id}`),

  adStats: (id: string) =>
    client.get(`/api/analytics/advertisements/${id}`),

  timeline: (params?: TimelineParams) =>
    client.get("/api/analytics/timeline", { params }),
};
