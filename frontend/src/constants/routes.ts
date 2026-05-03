export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    ME: "/api/auth/me",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
  },

  DISPLAYS: {
    LIST: "/api/displays",
    GET: (id: string) => `/api/displays/${id}`,
    CREATE: "/api/displays",
    UPDATE: (id: string) => `/api/displays/${id}`,
    DELETE: (id: string) => `/api/displays/${id}`,
    STATUS: (id: string) => `/api/displays/${id}/status`,
    PING: (id: string) => `/api/displays/${id}/ping`,
    REGISTER_SELF: "/api/displays/register-self",
    BY_TOKEN: (token: string) => `/api/displays/by-token/${token}`,
    REPORT_STATUS: "/api/displays/report-status",
  },

  ADVERTISEMENTS: {
    LIST: "/api/advertisements",
    GET: (id: string) => `/api/advertisements/${id}`,
    CREATE: "/api/advertisements",
    UPDATE: (id: string) => `/api/advertisements/${id}`,
    DELETE: (id: string) => `/api/advertisements/${id}`,
    ACTIVATE: (id: string) => `/api/advertisements/${id}/activate`,
    DEACTIVATE: (id: string) => `/api/advertisements/${id}/deactivate`,
    STATS: (id: string) => `/api/advertisements/${id}/stats`,
  },

  ANALYTICS: {
    OVERVIEW: "/api/analytics/overview",
    TIMELINE: "/api/analytics/timeline",
    DISPLAY_STATS: (id: string) => `/api/analytics/displays/${id}`,
    AD_STATS: (id: string) => `/api/analytics/advertisements/${id}`,
  },
} as const;

export const PAGE_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  DISPLAYS: "/dashboard/displays",
  ADS: "/dashboard/ads",
  LOOPS: "/dashboard/loops",
  ANALYTICS: "/dashboard/analytics",
  PROFILE: "/dashboard/profile",
  LOGS: "/dashboard/logs",
  CONNECTION_REQUESTS: "/dashboard/connection-requests",
  DISPLAY: "/display",
  DISPLAY_LOGIN: "/display-login",
  DISPLAY_REGISTER: "/display-register",
} as const;
