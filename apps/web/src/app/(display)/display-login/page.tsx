"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { ArrowLeft, Loader2, Monitor } from "lucide-react";
import { displaysApi } from "@/lib/api/displays.api";

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
      <main className="min-h-screen bg-gradient-to-br from-[#faf9f7] to-[#f5f3f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Logged In!</h1>
          <p className="text-gray-600 mb-6">
            Display authenticated successfully. Entering display mode...
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
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Monitor size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Display Login</h1>
          <p className="text-gray-600">Reconnect your previously registered display device</p>
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
          className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8 space-y-6 mb-6"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="displayId"
              value={formData.displayId}
              onChange={handleInputChange}
              placeholder="e.g., DISP-LOB123"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                fieldErrors.displayId ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.displayId && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.displayId}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              The Display ID you created during registration
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                fieldErrors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.password && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              The password you set during display registration
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Authenticating...
              </>
            ) : (
              "Login to Display"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#faf9f7] text-gray-600">or</span>
          </div>
        </div>

        {/* Register link */}
        <Link
          href="/display-register"
          className="w-full px-6 py-3 border-2 border-[#8b6f47] text-[#8b6f47] font-semibold rounded-lg hover:bg-[#f5f0e8] text-center mb-4 flex items-center justify-center gap-2"
        >
          <Monitor size={18} />
          Register New Display
        </Link>

        {/* Info */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Easy Password Login</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>Use your Display ID and password to log in</li>
            <li>No need to copy long connection tokens</li>
            <li>Stay logged in across browser refreshes</li>
            <li>Display mode persists when you leave and return</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-gray-600 hover:text-black">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
