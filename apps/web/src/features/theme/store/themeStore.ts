"use client";

import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeStore {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

const applyTheme = (theme: Theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("dark", "light");
  document.documentElement.classList.add(theme);
};

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("admiro-theme") as Theme | null;
  return stored ?? "dark";
};

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  theme: "dark",

  toggle: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    if (typeof window !== "undefined") {
      localStorage.setItem("admiro-theme", next);
    }
    applyTheme(next);
    set({ theme: next });
  },

  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admiro-theme", theme);
    }
    applyTheme(theme);
    set({ theme });
  },
}));

export const hydrateTheme = () => {
  const theme = getInitialTheme();
  applyTheme(theme);
  useThemeStore.setState({ theme });
};
