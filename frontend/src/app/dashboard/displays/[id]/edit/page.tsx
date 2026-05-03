"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { displaysApi, type DisplayRecord } from "@/lib/api/displays.api";
import type { AxiosError } from "axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EditDisplayForm {
  displayName: string;
  location: string;
}

type EditDisplayFormErrors = Partial<Record<keyof EditDisplayForm, string>>;

interface EditDisplayState {
  display: DisplayRecord | null;
  loading: boolean;
  submitting: boolean;
  serverError: string;
  form: EditDisplayForm;
  fieldErrors: EditDisplayFormErrors;
}

// ---------------------------------------------------------------------------
// Custom hook — all edit form state & handlers
// ---------------------------------------------------------------------------

function useEditDisplay(id: string) {
  const router = useRouter();

  const [state, setState] = useState<EditDisplayState>({
    display: null,
    loading: true,
    submitting: false,
    serverError: "",
    form: { displayName: "", location: "" },
    fieldErrors: {},
  });

  const patch = (partial: Partial<EditDisplayState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  const patchForm = (partial: Partial<EditDisplayForm>) =>
    setState((prev) => ({
      ...prev,
      form: { ...prev.form, ...partial },
      fieldErrors: {
        ...prev.fieldErrors,
        ...(Object.fromEntries(Object.keys(partial).map((k) => [k, undefined]))),
      },
    }));

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
  }, [router]);

  // Fetch display on mount
  useEffect(() => {
    if (!id) return;

    const fetchDisplay = async () => {
      patch({ loading: true, serverError: "" });
      try {
        const res = await displaysApi.get(id);
        const d = res.data.data;
        patch({
          display: d,
          form: {
            displayName: d.displayName,
            location: d.location,
          },
        });
      } catch (err) {
        const axErr = err as AxiosError<{ message?: string }>;
        const msg = axErr.response?.data?.message ?? axErr.message ?? "Failed to load display.";
        patch({ serverError: msg });
        toast.error(msg);
      } finally {
        patch({ loading: false });
      }
    };

    fetchDisplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const validate = (): boolean => {
    const errors: EditDisplayFormErrors = {};

    if (!state.form.location.trim()) {
      errors.location = "Location is required.";
    } else if (state.form.location.trim().length < 3) {
      errors.location = "Location must be at least 3 characters.";
    }

    patch({ fieldErrors: errors });
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    patch({ submitting: true, serverError: "" });
    try {
      await displaysApi.update(id, {
        location: state.form.location.trim(),
      });

      toast.success("Display updated successfully!");
      setTimeout(() => router.push(`/dashboard/displays/${id}`), 800);
    } catch (err) {
      const axErr = err as AxiosError<{ message?: string }>;
      const msg = axErr.response?.data?.message ?? "Failed to update display.";
      patch({ serverError: msg });
      toast.error(msg);
    } finally {
      patch({ submitting: false });
    }
  };

  return {
    ...state,
    patchForm,
    handleSubmit,
  };
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
      <label className="block text-white/70 text-sm font-medium">
        {label}
        {required && <span className="text-[#9F67FF] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {!error && hint && <p className="text-white/30 text-xs">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-2xl mx-auto flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={36} className="text-[#7E3AF0] animate-spin" />
            <p className="text-white/40 text-sm">Loading display details…</p>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function EditDisplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const {
    display,
    loading,
    submitting,
    serverError,
    form,
    fieldErrors,
    patchForm,
    handleSubmit,
  } = useEditDisplay(id);

  if (loading) return <LoadingSkeleton />;

  const inputCls = (err?: string) =>
    `w-full bg-white/5 border ${
      err ? "border-red-500/50" : "border-white/10"
    } text-white placeholder:text-white/30 focus:border-[#7E3AF0] focus:outline-none rounded-lg px-3 py-2 text-sm`;

  const readonlyCls =
    "w-full bg-white/[0.03] border border-white/5 text-white/30 rounded-lg px-3 py-2 text-sm font-mono cursor-not-allowed";

  if (!display && serverError) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-[#0a0a0a] p-8">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/dashboard/displays"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-sm font-medium mb-8 group"
              style={{ transition: "color 150ms ease" }}
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5" style={{ transition: "transform 150ms ease" }} />
              Back to Displays
            </Link>
            <div className="bg-[var(--ds-card)] border border-red-500/20 rounded-xl p-10 text-center">
              <p className="text-red-400 font-semibold mb-1">Error</p>
              <p className="text-white/40 text-sm">{serverError || "Display not found."}</p>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-2xl mx-auto">

          {/* Back nav */}
          <Link
            href={`/dashboard/displays/${id}`}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-sm font-medium mb-8 group"
            style={{ transition: "color 150ms ease" }}
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5" style={{ transition: "transform 150ms ease" }} />
            Back to Display
          </Link>

          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Edit Display</h1>
            <p className="text-white/40 text-sm">Update display settings for <span className="text-white/60">{display?.displayName}</span>.</p>
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

              {/* Display ID — read-only */}
              <FormField label="Display ID" hint="This cannot be changed.">
                <input
                  type="text"
                  value={display?.displayId ?? ""}
                  disabled
                  readOnly
                  className={readonlyCls}
                />
              </FormField>

              {/* Display Name */}
              <FormField
                label="Display Name"
                hint="Display names are generated from the display ID by the current backend."
              >
                <input
                  type="text"
                  value={form.displayName}
                  disabled
                  readOnly
                  className={readonlyCls}
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
                  onChange={(e) => patchForm({ location: e.target.value })}
                  placeholder="e.g. Main Floor, New York"
                  maxLength={100}
                  className={inputCls(fieldErrors.location)}
                  style={{ transition: "border-color 150ms ease" }}
                />
              </FormField>

              {/* Resolution — read-only */}
              <FormField label="Resolution" hint="This cannot be changed.">
                <div className={readonlyCls}>
                  {display?.resolution?.width ?? "—"} × {display?.resolution?.height ?? "—"}
                </div>
              </FormField>

              {/* Submit */}
              <div className="border-t border-[var(--ds-border)] pt-5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-semibold"
                  style={{ transition: "background-color 150ms ease" }}
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {submitting ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Help card */}
          <div className="mt-6 bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info size={15} className="text-[#9F67FF]" />
              <span className="text-white/70 text-sm font-medium">What can you edit?</span>
            </div>
            <ul className="space-y-2 text-white/40 text-xs leading-relaxed">
              <li>
                <span className="text-white/60 font-medium">Location</span> — update the physical location of the display.
              </li>
              <li>
                <span className="text-white/60 font-medium">Display ID, Display Name, and Resolution</span> — locked by the current backend after creation.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
