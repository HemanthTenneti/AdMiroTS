"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useAuthStore } from "@/features/auth/store/authStore";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const store = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const error = searchParams.get("error");

    if (error) {
      setTimeout(() => {
        router.push("/login?error=oauth_failed");
      }, 1500);
      return;
    }

    if (!accessToken) {
      setTimeout(() => {
        router.push("/login?error=no_token");
      }, 1500);
      return;
    }

    const userData = {
      id: searchParams.get("userId") ?? "",
      username: searchParams.get("username") ?? "",
      email: searchParams.get("email") ?? "",
      firstName: searchParams.get("firstName") ?? undefined,
      lastName: searchParams.get("lastName") ?? undefined,
      role: "user",
      isActive: true,
    };

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    store.setAuth(userData, accessToken);

    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  }, [searchParams, router, store]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-[#8b6f47]" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-2">Completing sign in...</h1>
        <p className="text-gray-600">You will be redirected in a moment.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-[#8b6f47]" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
