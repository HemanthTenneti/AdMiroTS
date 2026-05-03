"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { Loader2, Monitor } from "lucide-react";
import { displaysApi } from "@/lib/api/displays.api";
import { GradientBarsBackground } from "@/components/ui/gradient-bars-background";

type LoginMethod = "password" | "token";

interface PasswordFormData {
  displayId: string;
  password: string;
}

interface TokenFormData {
  connectionToken: string;
}

interface FieldErrors {
  displayId?: string;
  password?: string;
  connectionToken?: string;
}

export default function DisplayLoginPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    displayId: "",
    password: "",
  });
  const [tokenFormData, setTokenFormData] = useState<TokenFormData>({
    connectionToken: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("connectionToken");
    const id = localStorage.getItem("displayId");
    const isDisplayMode = localStorage.getItem("displayMode") === "true";
    if (token && id && isDisplayMode) {
      router.push("/display");
    }
  }, [router]);

  useEffect(() => {
    if (mainRef.current && mounted) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [mounted]);

  const resetErrors = () => {
    setFieldErrors({});
    setError("");
  };

  const switchMethod = (method: LoginMethod) => {
    setLoginMethod(method);
    resetErrors();
  };

  const validate = (): boolean => {
    const errs: FieldErrors = {};

    if (loginMethod === "password") {
      if (!passwordFormData.displayId.trim()) errs.displayId = "Display ID is required.";
      if (!passwordFormData.password.trim()) errs.password = "Password is required.";
    } else {
      if (!tokenFormData.connectionToken.trim()) {
        errs.connectionToken = "Connection token is required.";
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const persistDisplaySession = (displayId: string, connectionToken: string) => {
    localStorage.setItem("displayId", displayId);
    localStorage.setItem("connectionToken", connectionToken);
    localStorage.setItem("displayMode", "true");
    setSuccess(true);

    setTimeout(() => {
      router.push("/display");
    }, 1200);
  };

  const handlePasswordLogin = async () => {
    const response = await displaysApi.loginDisplay({
      displayId: passwordFormData.displayId.trim(),
      password: passwordFormData.password.trim(),
    });

    if (!response.data.data.displayId || !response.data.data.connectionToken) {
      throw new Error("Invalid response from server");
    }

    persistDisplaySession(response.data.data.displayId, response.data.data.connectionToken);
  };

  const handleTokenLogin = async () => {
    const connectionToken = tokenFormData.connectionToken.trim();
    const response = await displaysApi.getByConnectionToken(connectionToken);
    const displayData = response.data.data as {
      displayId: string;
      connectionRequestStatus?: "pending" | "approved" | "rejected";
      rejectionReason?: string | null;
      assignedAdmin?: string | null;
    };

    if (!displayData.displayId) {
      throw new Error("Invalid display record for this connection token.");
    }

    if (displayData.connectionRequestStatus === "rejected") {
      throw new Error(
        `This display registration was rejected${displayData.rejectionReason ? `: ${displayData.rejectionReason}` : "."}`
      );
    }

    if (
      displayData.connectionRequestStatus === "pending" ||
      (!displayData.connectionRequestStatus && !displayData.assignedAdmin)
    ) {
      throw new Error("This display is still pending admin approval.");
    }

    persistDisplaySession(displayData.displayId, connectionToken);
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

      if (loginMethod === "password") {
        await handlePasswordLogin();
      } else {
        await handleTokenLogin();
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const message =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        "Failed to authenticate display. Please check your credentials.";

      if (message.toLowerCase().includes("connection token")) {
        setLoginMethod("token");
      }

      setError(message);
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
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center overflow-y-auto px-8 py-12 bg-[#0a0a0a]">
        <div className="w-full max-w-sm">
          <Link href="/login" className="flex items-center gap-2.5 mb-10">
            <img src="/logo.svg" alt="AdMiro" className="h-8 w-auto brightness-0 invert" />
          </Link>

          <h1 className="text-3xl font-bold text-white tracking-tight">Display Login</h1>
          <p className="text-white/40 text-sm mt-1 mb-5">Reconnect your previously registered display device</p>

          <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.04] p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMethod("password")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                loginMethod === "password"
                  ? "bg-[#7E3AF0] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              Display ID + Password
            </button>
            <button
              type="button"
              onClick={() => switchMethod("token")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                loginMethod === "token"
                  ? "bg-[#7E3AF0] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              Connection Token
            </button>
          </div>

          {error && (
            <div className="bg-red-500/[0.08] border border-red-500/15 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {loginMethod === "password" ? (
              <>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">Display ID</label>
                  <input
                    type="text"
                    value={passwordFormData.displayId}
                    onChange={(e) => {
                      setPasswordFormData((prev) => ({ ...prev, displayId: e.target.value }));
                      setFieldErrors((prev) => ({ ...prev, displayId: "" }));
                      setError("");
                    }}
                    placeholder="e.g., DISP-LOB123"
                    className={`${inputClass} font-mono${fieldErrors.displayId ? " border-red-500/60" : ""}`}
                  />
                  {fieldErrors.displayId && <p className="text-xs text-red-400 mt-1">{fieldErrors.displayId}</p>}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={passwordFormData.password}
                    onChange={(e) => {
                      setPasswordFormData((prev) => ({ ...prev, password: e.target.value }));
                      setFieldErrors((prev) => ({ ...prev, password: "" }));
                      setError("");
                    }}
                    placeholder="Enter your password"
                    className={`${inputClass}${fieldErrors.password ? " border-red-500/60" : ""}`}
                  />
                  {fieldErrors.password && <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>}
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">Connection Token</label>
                <input
                  type="text"
                  value={tokenFormData.connectionToken}
                  onChange={(e) => {
                    setTokenFormData({ connectionToken: e.target.value });
                    setFieldErrors((prev) => ({ ...prev, connectionToken: "" }));
                    setError("");
                  }}
                  placeholder="ct-disp_..."
                  className={`${inputClass} font-mono${fieldErrors.connectionToken ? " border-red-500/60" : ""}`}
                />
                {fieldErrors.connectionToken && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.connectionToken}</p>
                )}
                <p className="text-xs text-white/40 mt-2">
                  Use the token shown during registration while waiting for admin approval.
                </p>
              </div>
            )}

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
              ) : loginMethod === "password" ? (
                "Login to Display"
              ) : (
                "Login with Token"
              )}
            </button>

            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-white/25 text-xs">or</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            <Link
              href="/display-register"
              className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-150"
            >
              <Monitor size={15} />
              Register New Display
            </Link>
          </form>

          <p className="mt-8 text-center">
            <Link href="/login" className="text-white/30 hover:text-white/60 text-sm transition-colors duration-150">
              Back to Login
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden md:block w-1/2 h-full relative">
        <GradientBarsBackground className="w-full h-full" />
      </div>
    </main>
  );
}
