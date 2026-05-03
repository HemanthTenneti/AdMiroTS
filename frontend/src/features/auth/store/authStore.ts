"use client";

import { create } from "zustand";

interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  role: string;
  profilePicture?: string | undefined;
  isActive: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  hydrate: () => void;
}

function normalizeAuthUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== "object") return null;
  const candidate = "_doc" in value ? (value as { _doc?: unknown })._doc : value;
  if (!candidate || typeof candidate !== "object") return null;
  const raw = candidate as Partial<AuthUser>;
  if (!raw.id || !raw.username || !raw.email || !raw.role || raw.isActive === undefined) {
    return null;
  }
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    firstName: raw.firstName,
    lastName: raw.lastName,
    role: raw.role,
    profilePicture: raw.profilePicture,
    isActive: raw.isActive,
  };
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    const normalized = normalizeAuthUser(user);
    if (!normalized) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(normalized));
    }
    set({ user: normalized, accessToken: token, isAuthenticated: true });
  },

  setUser: (user) => {
    const normalized = normalizeAuthUser(user);
    if (!normalized) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(normalized));
    }
    set({ user: normalized });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    const raw = localStorage.getItem("user");
    if (token && raw) {
      try {
        const user = normalizeAuthUser(JSON.parse(raw));
        if (!user) throw new Error("Invalid stored user");
        localStorage.setItem("user", JSON.stringify(user));
        set({ user, accessToken: token, isAuthenticated: true });
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }
  },
}));
