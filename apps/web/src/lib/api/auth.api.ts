import client from "./client";

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    profilePicture?: string;
    isActive: boolean;
    lastLogin?: string;
  };
  accessToken: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    client.post<{ success: boolean; data: AuthResponse }>("/api/auth/login", payload),

  register: (payload: RegisterPayload) =>
    client.post<{ success: boolean; data: AuthResponse }>("/api/auth/register", payload),

  me: () =>
    client.get<{ success: boolean; data: { user: AuthResponse["user"] } }>("/api/auth/me"),

  refresh: () =>
    client.post<{ success: boolean; data: { accessToken: string } }>("/api/auth/refresh"),

  logout: () =>
    client.post("/api/auth/logout"),
};
