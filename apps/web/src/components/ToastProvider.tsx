"use client";

import { Toaster } from "sonner";
import { useThemeStore } from "@/features/theme/store/themeStore";

export default function ToastProvider() {
  const theme = useThemeStore((s) => s.theme);
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme={theme}
    />
  );
}
