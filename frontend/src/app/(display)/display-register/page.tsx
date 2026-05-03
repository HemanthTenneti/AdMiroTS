"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Loader2, Copy, Check, ArrowLeft } from "lucide-react";
import { displaysApi } from "@/lib/api/displays.api";
import { GradientBarsBackground } from "@/components/ui/gradient-bars-background";

interface FormData {
  displayName: string;
  location: string;
  displayId: string;
  password: string;
}

interface FieldErrors {
  displayName?: string;
  location?: string;
  displayId?: string;
  password?: string;
}

interface DeviceInfo {
  width: number;
  height: number;
  userAgent: string;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-[#7E3AF0] focus:ring-1 focus:ring-[#7E3AF0]/50 text-sm";

export default function DisplayRegisterPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [registeredDisplayId, setRegisteredDisplayId] = useState("");
  const [connectionToken, setConnectionToken] = useState("");
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    location: "",
    displayId: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setMounted(true);
    setDeviceInfo({
      width: window.innerWidth,
      height: window.innerHeight,
      userAgent: navigator.userAgent,
    });
  }, []);

  // Entry animation
  useEffect(() => {
    if (mainRef.current && mounted) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
    if (formRef.current && mounted) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.7)", delay: 0.2 }
      );
    }
  }, [mounted]);

  // Poll for approval
  useEffect(() => {
    if (!waitingForApproval || !registeredDisplayId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await displaysApi.getByConnectionToken(connectionToken);
        const displayData = response.data.data;
        const requestStatus = displayData.connectionRequestStatus;
        const reason = displayData.rejectionReason;

        if (requestStatus === "rejected") {
          setWaitingForApproval(false);
          setError(
            `Your display registration was rejected${reason ? `: ${reason}` : ""}. Please contact your administrator.`
          );
          return;
        }

        const assignedAdmin = displayData.assignedAdmin;
        if (requestStatus === "approved" && assignedAdmin) {
          setSuccess(true);
          setWaitingForApproval(false);

          localStorage.setItem("displayId", registeredDisplayId);
          localStorage.setItem("connectionToken", connectionToken);
          localStorage.setItem("displayMode", "true");

          setTimeout(() => {
            router.push("/display");
          }, 2000);
        }
      } catch {
        // Still waiting
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [waitingForApproval, registeredDisplayId, connectionToken, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const errs: FieldErrors = {};

    if (!formData.displayName.trim()) {
      errs.displayName = "Display name is required.";
    } else if (formData.displayName.length < 2) {
      errs.displayName = "Display name must be at least 2 characters.";
    } else if (formData.displayName.length > 50) {
      errs.displayName = "Display name must not exceed 50 characters.";
    }

    if (!formData.location.trim()) {
      errs.location = "Location is required.";
    } else if (formData.location.length < 2) {
      errs.location = "Location must be at least 2 characters.";
    } else if (formData.location.length > 50) {
      errs.location = "Location must not exceed 50 characters.";
    }

    if (formData.displayId.trim()) {
      if (formData.displayId.length < 3) {
        errs.displayId = "Display ID must be at least 3 characters.";
      } else if (formData.displayId.length > 30) {
        errs.displayId = "Display ID must not exceed 30 characters.";
      }
    }

    if (formData.password.trim()) {
      if (formData.password.length < 4) {
        errs.password = "Password must be at least 4 characters.";
      } else if (formData.password.length > 50) {
        errs.password = "Password must not exceed 50 characters.";
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setError("Please fix the errors above.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const resolution = {
        width: deviceInfo?.width ?? window.innerWidth,
        height: deviceInfo?.height ?? window.innerHeight,
      };

      const browserInfo: Record<string, string> = {
        browserVersion: deviceInfo?.userAgent ?? navigator.userAgent,
      };

      const payload = {
        displayName: formData.displayName.trim(),
        location: formData.location.trim(),
        resolution,
        browserInfo,
        ...(formData.displayId.trim() ? { displayId: formData.displayId.trim() } : {}),
        ...(formData.password.trim() ? { password: formData.password.trim() } : {}),
      };

      const response = await displaysApi.registerSelf(payload);

      const {
        displayId: newDisplayId,
        connectionToken: newToken,
        isPendingApproval,
      } = response.data.data;

      setRegisteredDisplayId(newDisplayId);
      setConnectionToken(newToken);

      if (isPendingApproval) {
        setWaitingForApproval(true);
      } else {
        localStorage.setItem("displayId", newDisplayId);
        localStorage.setItem("connectionToken", newToken);
        localStorage.setItem("displayMode", "true");

        setSuccess(true);

        setTimeout(() => {
          router.push("/display");
        }, 2000);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        axiosErr.response?.data?.message ||
          axiosErr.message ||
          "Failed to register display device."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(connectionToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  if (!mounted) return null;

  // --- Waiting for approval ---
  if (waitingForApproval) {
    return (
      <main className="h-screen overflow-hidden flex bg-[#0a0a0a] items-center justify-center">
        <div className="w-full max-w-sm px-8 text-center">
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
            <div className="w-12 h-12 rounded-full border border-[#7E3AF0]/40 bg-[#7E3AF0]/10 mx-auto mb-5 flex items-center justify-center">
              <Loader2 size={22} className="animate-spin text-[#7E3AF0]" />
            </div>

            <h2 className="text-lg font-semibold text-white mb-1">Waiting for Approval</h2>
            <p className="text-white/40 text-sm mb-6">
              An admin needs to approve this display before it can go live.
            </p>

            <div className="text-left space-y-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/30 mb-1">Display Name</p>
                <p className="text-white text-sm font-medium">{formData.displayName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/30 mb-1">Location</p>
                <p className="text-white text-sm font-medium">{formData.location}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/30 mb-1.5">
                  Connection Token
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-white bg-white/5 rounded-lg px-3 py-2 text-xs border border-white/10 break-all">
                    {connectionToken}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="shrink-0 text-[#9F67FF] hover:text-white transition-colors duration-150"
                    title="Copy token"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-left bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 mb-4">
              <p className="text-xs text-white/40 font-medium mb-2">What to do next:</p>
              <ol className="space-y-1 text-xs text-white/30">
                <li>1. Log in to the admin dashboard</li>
                <li>2. Go to &quot;Connection Requests&quot;</li>
                <li>3. Find your display and click &quot;Approve&quot;</li>
                <li>4. This page will advance automatically</li>
              </ol>
            </div>

            <p className="text-white/20 text-xs">Checking every 3 seconds...</p>
          </div>
        </div>
      </main>
    );
  }

  // --- Success ---
  if (success) {
    return (
      <main className="h-screen overflow-hidden flex bg-[#0a0a0a] items-center justify-center">
        <div className="text-center max-w-sm px-8">
          <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-green-400 text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Display Registered!</h1>
          <p className="text-white/40 text-sm mb-6">
            Your display has been approved. Entering display mode...
          </p>
          <div className="flex items-center justify-center gap-2 text-white/30 text-sm">
            <Loader2 size={16} className="animate-spin" />
            Redirecting...
          </div>
        </div>
      </main>
    );
  }

  // --- Registration form ---
  return (
    <GradientBarsBackground className="min-h-screen" numBars={20} animationDuration={2.5} overlayColor="rgba(8,4,16,0.65)">
    <main ref={mainRef} className="min-h-screen flex">
      {/* Left — form panel */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center overflow-y-auto px-8 py-12 bg-[#0a0a0a]">
        <div ref={formRef} className="w-full max-w-sm">

          {/* Logo */}
          <Link href="/login" className="flex items-center mb-6">
            <img src="/logo.svg" alt="AdMiro" className="h-8 w-auto brightness-0 invert" />
          </Link>

          {/* Back link */}
          <Link href="/login" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-xs mb-6 transition-colors duration-150">
            <ArrowLeft size={14} />
            Back to login
          </Link>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white tracking-tight">Register Display</h1>
          <p className="text-white/40 text-sm mt-1 mb-8">
            Set up this device to show advertisements
          </p>

          {/* Error banner */}
          {error && (
            <div className="bg-red-500/[0.08] border border-red-500/15 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
                Display Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="e.g., Lobby Screen"
                maxLength={50}
                className={inputClass}
              />
              {fieldErrors.displayName && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.displayName}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
                Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Store Front, Office"
                maxLength={50}
                className={inputClass}
              />
              {fieldErrors.location && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.location}</p>
              )}
            </div>

            {/* Display ID (optional) */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
                Display ID{" "}
                <span className="text-white/25 normal-case tracking-normal text-xs">(optional)</span>
              </label>
              <input
                type="text"
                name="displayId"
                value={formData.displayId}
                onChange={handleInputChange}
                placeholder="e.g., DISP-LOBBY"
                maxLength={30}
                className={`${inputClass} font-mono`}
              />
              {fieldErrors.displayId ? (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.displayId}</p>
              ) : (
                <p className="text-xs text-white/20 mt-1">
                  3–30 chars, or leave blank for auto-generated
                </p>
              )}
            </div>

            {/* Password (optional) */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
                Password{" "}
                <span className="text-white/25 normal-case tracking-normal text-xs">(optional)</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password for easy login"
                maxLength={50}
                className={inputClass}
              />
              {fieldErrors.password ? (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>
              ) : (
                <p className="text-xs text-white/20 mt-1">
                  Leave blank to use connection token for login
                </p>
              )}
            </div>

            {/* Device info */}
            {deviceInfo && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-white/25 mb-2">
                  Detected Device
                </p>
                <p className="text-xs text-white/40">
                  Resolution: {deviceInfo.width} &times; {deviceInfo.height}
                </p>
                <p className="text-xs text-white/25 truncate mt-0.5">
                  {deviceInfo.userAgent.substring(0, 60)}...
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#7E3AF0] hover:bg-[#9F67FF] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Display"
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-white/30 text-xs">
            Already registered?{" "}
            <Link
              href="/display-login"
              className="text-[#9F67FF] hover:text-white transition-colors duration-150"
            >
              Log in to display
            </Link>
          </p>

        </div>
      </div>

      {/* Right — bars visible through background */}
      <div className="hidden md:block md:w-1/2" />
    </main>
    </GradientBarsBackground>
  );
}
