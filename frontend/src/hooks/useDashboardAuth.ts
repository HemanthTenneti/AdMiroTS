"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/authStore";

export function useDashboardAuth() {
  const router = useRouter();
  // Stable selector references — not the whole store object, which changes on every state update
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    hydrate();
    setAuthReady(true);
  // hydrate is a stable function reference from Zustand; router is stable from Next.js
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { authReady, user };
}
