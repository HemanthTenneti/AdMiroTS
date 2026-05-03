"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/authStore";

export function useDashboardAuth() {
  const router = useRouter();
  const store = useAuthStore();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    store.hydrate();
    setAuthReady(true);
  }, [router, store]);

  return { authReady, user: store.user };
}
