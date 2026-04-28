"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ArrowLeft, Loader2, Check, Clock, Monitor } from "lucide-react";
import { displaysApi } from "@/lib/api/displays.api";

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

export default function DisplayRegisterPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [registeredDisplayId, setRegisteredDisplayId] = useState("");
  const [connectionToken, setConnectionToken] = useState("");
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

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
  }, [mounted]);

  // Poll for approval
  useEffect(() => {
    if (!waitingForApproval || !registeredDisplayId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await displaysApi.getByConnectionToken(connectionToken);
        const displayData = response.data.data;
        const requestStatus = (displayData as unknown as Record<string, string>).connectionRequestStatus;
        const reason = (displayData as unknown as Record<string, string>).rejectionReason;

        if (requestStatus === "rejected") {
          setWaitingForApproval(false);
          setError(
            `Your display registration was rejected${reason ? `: ${reason}` : ""}. Please contact your administrator.`
          );
          return;
        }

        const assignedAdmin = (displayData as unknown as Record<string, unknown>).assignedAdmin;
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

  if (!mounted) return null;

  // --- Waiting for approval ---
  if (waitingForApproval) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#faf9f7] to-[#f5f3f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Clock size={32} className="text-white animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Waiting for Approval</h1>
          <p className="text-gray-600 mb-6">
            Your display is registered. An admin needs to approve it.
          </p>

          <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-6 mb-6 text-left space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Display Name</p>
              <p className="text-lg font-semibold text-black">{formData.displayName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Location</p>
              <p className="text-lg font-semibold text-black">{formData.location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Display ID</p>
              <p className="font-mono text-sm text-[#8b6f47] break-all">{registeredDisplayId}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-3">What to do:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. Log in to the admin dashboard</li>
              <li>2. Go to &quot;Connection Requests&quot; page</li>
              <li>3. Find your display and click &quot;Approve&quot;</li>
              <li>4. This display will automatically start showing ads</li>
            </ol>
          </div>

          <p className="text-xs text-gray-500 mt-6">Still waiting... (checks every 3 seconds)</p>
        </div>
      </main>
    );
  }

  // --- Success ---
  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#faf9f7] to-[#f5f3f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Check size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Approved!</h1>
          <p className="text-gray-600 mb-6">
            Your display has been approved. Entering display mode...
          </p>
          <div className="flex items-center justify-center gap-2 text-[#8b6f47]">
            <Loader2 size={20} className="animate-spin" />
            <span>Redirecting...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      ref={mainRef}
      className="min-h-screen bg-gradient-to-br from-[#faf9f7] to-[#f5f3f0] flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#8b6f47] rounded-full mx-auto mb-4 flex items-center justify-center">
            <Monitor size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Register Display</h1>
          <p className="text-gray-600">Set up this device to display advertisements</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8 space-y-6"
        >
          {/* Display ID (optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display ID{" "}
              <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              name="displayId"
              value={formData.displayId}
              onChange={handleInputChange}
              placeholder="e.g., DISP-LOBBY"
              maxLength={30}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent ${
                fieldErrors.displayId ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.displayId && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.displayId}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Create a short ID (3–30 chars) like DISP-LOBBY, or leave blank for auto-generated
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="e.g., Living Room Display"
              maxLength={50}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent ${
                fieldErrors.displayName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.displayName && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.displayName}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Store Front, Office"
              maxLength={50}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent ${
                fieldErrors.location ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.location && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.location}</p>
            )}
          </div>

          {/* Password (optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password{" "}
              <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password for easy login (4–50 characters)"
              maxLength={50}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent ${
                fieldErrors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.password && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to use connection token for login, or set a password for easier access
            </p>
          </div>

          {/* Device info */}
          {deviceInfo && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-semibold mb-2">Device Information:</p>
              <p>
                <strong>Resolution:</strong> {deviceInfo.width} x {deviceInfo.height}
              </p>
              <p className="text-xs mt-1 truncate">
                <strong>Browser:</strong> {deviceInfo.userAgent.substring(0, 60)}...
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Registering...
              </>
            ) : (
              "Register Display"
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>Your device will be registered</li>
            <li>An admin will receive a connection request</li>
            <li>Once approved, this device will enter display mode</li>
            <li>Ads will rotate automatically in full-screen</li>
            <li>You can exit by pressing the ESC key</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
