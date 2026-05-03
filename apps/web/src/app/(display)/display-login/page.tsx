"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { Loader2, Monitor } from "lucide-react";
import { displaysApi } from "@/lib/api/displays.api";
import { GradientBarsBackground } from "@/components/ui/gradient-bars-background";

interface FormData {
  displayId: string;
  password: string;
}

interface FieldErrors {
  displayId?: string;
  password?: string;
}

export default function DisplayLoginPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({ displayId: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in as display
  useEffect(() => {
    const token = localStorage.getItem("connectionToken");
    const id = localStorage.getItem("displayId");
    const isDisplayMode = localStorage.getItem("displayMode") === "true";
    if (token && id && isDisplayMode) {
      router.push("/display");
    }
  }, [router]);

  // Entry animation
  useEffect(() => {
    if (mainRef.current && mounted) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [mounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setError("");
  };

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!formData.displayId.trim()) errs.displayId = "Display ID is required.";
    if (!formData.password.trim()) errs.password = "Password is required.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await displaysApi.loginDisplay({
        displayId: formData.displayId.trim(),
        password: formData.password.trim(),
      });

      if (!response.data.data.displayId || !response.data.data.connectionToken) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("displayId", response.data.data.displayId);
      localStorage.setItem("connectionToken", response.data.data.connectionToken);
      localStorage.setItem("displayMode", "true");

      setSuccess(true);

      setTimeout(() => {
        router.push("/display");
      }, 2000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        axiosErr.response?.data?.message ||
          axiosErr.message ||
          "Failed to authenticate display. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (success) {
    return (
      <main className="h-screen overflow-hidden flex bg-[#0a0a0a] items-center justify-center">
        <div className="text-center max-w-sm px-8">
          <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-green-400 text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Logged In!</h1>
          <p className="text-white/40 text-sm mb-6">Display authenticated. Entering display mode...</p>
          <div className="flex items-center justify-center gap-2 text-white/30 text-sm">
            <Loader2 size={16} className="animate-spin" />
            Redirecting...
          </div>
        </div>
      </main>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-[#7E3AF0] focus:ring-1 focus:ring-[#7E3AF0]/50 text-sm";

  return (
    <main ref={mainRef} className="h-screen overflow-hidden flex bg-[#0a0a0a]">
      {/* Left — form panel */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center overflow-y-auto px-8 py-12 bg-[#0a0a0a]">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <Link href="/login" className="flex items-center gap-2.5 mb-10">
            <img src="/logo.svg" alt="AdMiro" className="h-8 w-auto brightness-0 invert" />
          </Link>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white tracking-tight">Display Login</h1>
          <p className="text-white/40 text-sm mt-1 mb-8">
            Reconnect your previously registered display device
          </p>

          {/* Error banner */}
          {error && (
            <div className="bg-red-500/[0.08] border border-red-500/15 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
                Display ID
              </label>
              <input
                type="text"
                name="displayId"
                value={formData.displayId}
                onChange={handleInputChange}
                placeholder="e.g., DISP-LOB123"
                className={`${inputClass} font-mono${fieldErrors.displayId ? " border-red-500/60" : ""}`}
              />
              {fieldErrors.displayId && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.displayId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`${inputClass}${fieldErrors.password ? " border-red-500/60" : ""}`}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#7E3AF0] hover:bg-[#9F67FF] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Login to Display"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-white/25 text-xs">or</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            {/* Register link */}
            <Link
              href="/display-register"
              className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-150"
            >
              <Monitor size={15} />
              Register New Display
            </Link>
          </form>

          {/* Back link */}
          <p className="mt-8 text-center">
            <Link href="/login" className="text-white/30 hover:text-white/60 text-sm transition-colors duration-150">
              Back to Login
            </Link>
          </p>

        </div>
      </div>

      {/* Right — gradient bars panel */}
      <div className="hidden md:block w-1/2 h-full relative">
        <GradientBarsBackground className="w-full h-full" />
      </div>
    </main>
  );
}
