"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { displaysApi } from "@/lib/api/displays.api";
import type { AxiosError } from "axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreateDisplayForm {
  displayId: string;
  displayName: string;
  location: string;
  password: string;
  resolutionWidth: string;
  resolutionHeight: string;
}

type CreateDisplayFormErrors = Partial<Record<keyof CreateDisplayForm, string>>;

// ---------------------------------------------------------------------------
// Custom hook — all create form state & submit logic
// ---------------------------------------------------------------------------

function useCreateDisplay() {
  const router = useRouter();

  const [form, setForm] = useState<CreateDisplayForm>({
    displayId: "",
    displayName: "",
    location: "",
    password: "",
    resolutionWidth: typeof window !== "undefined" ? String(window.screen.width) : "1920",
    resolutionHeight: typeof window !== "undefined" ? String(window.screen.height) : "1080",
  });

  const [fieldErrors, setFieldErrors] = useState<CreateDisplayFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
  }, [router]);

  const setField = <K extends keyof CreateDisplayForm>(key: K, value: CreateDisplayForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errors: CreateDisplayFormErrors = {};

    if (!form.displayId.trim()) {
      errors.displayId = "Display ID is required.";
    } else if (form.displayId.trim().length < 3) {
      errors.displayId = "Display ID must be at least 3 characters.";
    }

    if (!form.displayName.trim()) {
      errors.displayName = "Display name is required.";
    } else if (form.displayName.trim().length < 3) {
      errors.displayName = "Display name must be at least 3 characters.";
    }

    if (!form.location.trim()) {
      errors.location = "Location is required.";
    } else if (form.location.trim().length < 3) {
      errors.location = "Location must be at least 3 characters.";
    }

    const w = parseInt(form.resolutionWidth, 10);
    const h = parseInt(form.resolutionHeight, 10);
    if (isNaN(w) || w < 1) errors.resolutionWidth = "Enter a valid width.";
    if (isNaN(h) || h < 1) errors.resolutionHeight = "Enter a valid height.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError("");

    try {
      const payload = {
        displayId: form.displayId.trim(),
        displayName: form.displayName.trim(),
        location: form.location.trim(),
        layout:
          parseInt(form.resolutionWidth, 10) >= parseInt(form.resolutionHeight, 10)
            ? ("landscape" as const)
            : ("portrait" as const),
        resolution: {
          width: parseInt(form.resolutionWidth, 10),
          height: parseInt(form.resolutionHeight, 10),
        },
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
      };

      await displaysApi.create(payload);
      toast.success("Display created successfully!");

      setTimeout(() => {
        router.push("/dashboard/displays");
      }, 800);
    } catch (err) {
      const axErr = err as AxiosError<{ message?: string }>;
      const msg = axErr.response?.data?.message ?? axErr.message ?? "Failed to create display.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return { form, fieldErrors, submitting, serverError, setField, handleSubmit };
}

// ---------------------------------------------------------------------------
// Field wrapper component
// ---------------------------------------------------------------------------

function FormField({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[var(--ds-text)] text-sm font-medium">
        {label}
        {required && <span className="text-[#9F67FF] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {!error && hint && <p className="text-[var(--ds-text-3)] text-xs">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function NewDisplayPage() {
  const { form, fieldErrors, submitting, serverError, setField, handleSubmit } = useCreateDisplay();

  const inputCls = (err?: string) =>
    `w-full bg-[var(--ds-input)] border ${
      err ? "border-red-500/50" : "border-[var(--ds-input-border)]"
    } text-[var(--ds-text)] placeholder:text-[var(--ds-text-3)] focus:border-[#7E3AF0] focus:outline-none rounded-lg px-3 py-2 text-sm`;

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[var(--ds-bg)] p-8">
        <div className="max-w-2xl mx-auto">

          {/* Back nav */}
          <Link
            href="/dashboard/displays"
            className="inline-flex items-center gap-2 text-[var(--ds-text-2)] hover:text-[var(--ds-text)] text-sm font-medium mb-8 group"
            style={{ transition: "color 150ms ease" }}
          >
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-0.5"
              style={{ transition: "transform 150ms ease" }}
            />
            Back to Displays
          </Link>

          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--ds-text)] tracking-tight mb-1">Create New Display</h1>
            <p className="text-[var(--ds-text-2)] text-sm">Set up a new display device for your network.</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {serverError}
            </div>
          )}

          {/* Form card */}
          <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Display ID */}
              <FormField
                label="Display ID"
                required
                error={fieldErrors.displayId}
                hint='Unique identifier for filtering (e.g. LOBBY-1, STORE-MAIN)'
              >
                <input
                  type="text"
                  value={form.displayId}
                  onChange={(e) => setField("displayId", e.target.value)}
                  placeholder="e.g. LOBBY-1"
                  maxLength={50}
                  className={inputCls(fieldErrors.displayId)}
                  style={{ transition: "border-color 150ms ease" }}
                />
              </FormField>

              {/* Display Name */}
              <FormField
                label="Display Name"
                required
                error={fieldErrors.displayName}
                hint={`${form.displayName.length}/100`}
              >
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setField("displayName", e.target.value)}
                  placeholder="e.g. Lobby Display"
                  maxLength={100}
                  className={inputCls(fieldErrors.displayName)}
                  style={{ transition: "border-color 150ms ease" }}
                />
              </FormField>

              {/* Location */}
              <FormField
                label="Location"
                required
                error={fieldErrors.location}
                hint={`${form.location.length}/100`}
              >
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setField("location", e.target.value)}
                  placeholder="e.g. Main Floor, New York"
                  maxLength={100}
                  className={inputCls(fieldErrors.location)}
                  style={{ transition: "border-color 150ms ease" }}
                />
              </FormField>

              {/* Password (optional) */}
              <FormField
                label="Password"
                error={fieldErrors.password}
                hint="Optional — enables Display ID + password login"
              >
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="Leave blank for token-only auth"
                  className={inputCls(fieldErrors.password)}
                  style={{ transition: "border-color 150ms ease" }}
                />
              </FormField>

              {/* Resolution */}
              <div className="space-y-1.5">
                <label className="block text-[var(--ds-text)] text-sm font-medium">Resolution</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={form.resolutionWidth}
                      onChange={(e) => setField("resolutionWidth", e.target.value)}
                      placeholder="Width (px)"
                      min={1}
                      className={inputCls(fieldErrors.resolutionWidth)}
                      style={{ transition: "border-color 150ms ease" }}
                    />
                    {fieldErrors.resolutionWidth && (
                      <p className="text-red-400 text-xs mt-1">{fieldErrors.resolutionWidth}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      value={form.resolutionHeight}
                      onChange={(e) => setField("resolutionHeight", e.target.value)}
                      placeholder="Height (px)"
                      min={1}
                      className={inputCls(fieldErrors.resolutionHeight)}
                      style={{ transition: "border-color 150ms ease" }}
                    />
                    {fieldErrors.resolutionHeight && (
                      <p className="text-red-400 text-xs mt-1">{fieldErrors.resolutionHeight}</p>
                    )}
                  </div>
                </div>
                <p className="text-[var(--ds-text-3)] text-xs">Pre-filled from your browser — adjust if needed.</p>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--ds-border)] pt-5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-semibold"
                  style={{ transition: "background-color 150ms ease" }}
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {submitting ? "Creating…" : "Create Display"}
                </button>
              </div>
            </form>
          </div>

          {/* Tips card */}
          <div className="mt-6 bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info size={15} className="text-[#9F67FF]" />
              <span className="text-[var(--ds-text)] text-sm font-medium">Setup tips</span>
            </div>
            <ul className="space-y-2 text-[var(--ds-text-2)] text-xs leading-relaxed">
              <li>
                <span className="text-[var(--ds-text-2)] font-medium">Display ID</span> — create a unique identifier for easy searching (e.g. LOBBY-1, STORE-MAIN).
              </li>
              <li>
                <span className="text-[var(--ds-text-2)] font-medium">Display Name</span> — descriptive name for quick identification in lists.
              </li>
              <li>
                <span className="text-[var(--ds-text-2)] font-medium">Location</span> — physical location of the display device.
              </li>
              <li>
                <span className="text-[var(--ds-text-2)] font-medium">Password</span> — optional. Enables Display ID + password login instead of connection tokens.
              </li>
              <li>
                <span className="text-[var(--ds-text-2)] font-medium">Resolution</span> — auto-detected from your browser; adjust to match the target device.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
