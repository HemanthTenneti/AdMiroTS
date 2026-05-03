"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import type { AxiosError } from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import { advertisementsApi, type AdRecord } from "@/lib/api/advertisements.api";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EditAdForm {
  adName: string;
  description: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  duration: number | string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
}

type EditAdFormErrors = Partial<Record<keyof EditAdForm, string>>;

interface EditAdState {
  ad: AdRecord | null;
  loading: boolean;
  submitting: boolean;
  serverError: string;
  form: EditAdForm;
  fieldErrors: EditAdFormErrors;
}

const EMPTY_FORM: EditAdForm = {
  adName: "",
  description: "",
  mediaUrl: "",
  mediaType: "image",
  duration: 5,
  status: "draft",
  scheduledStart: "",
  scheduledEnd: "",
};

// ---------------------------------------------------------------------------
// Custom hook
// ---------------------------------------------------------------------------

function useEditAd(id: string) {
  const router = useRouter();
  const { authReady } = useDashboardAuth();

  const [state, setState] = useState<EditAdState>({
    ad: null,
    loading: true,
    submitting: false,
    serverError: "",
    form: EMPTY_FORM,
    fieldErrors: {},
  });

  const patch = (partial: Partial<EditAdState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  const patchForm = (partial: Partial<EditAdForm>) =>
    setState((prev) => ({
      ...prev,
      form: { ...prev.form, ...partial },
      fieldErrors: {
        ...prev.fieldErrors,
        ...Object.fromEntries(Object.keys(partial).map((k) => [k, undefined])),
      },
    }));

  // Fetch ad once auth is confirmed
  useEffect(() => {
    if (!authReady || !id) return;

    const fetchAd = async () => {
      patch({ loading: true, serverError: "" });
      try {
        const res = await advertisementsApi.get(id);
        const ad = res.data.data;
        patch({
          ad,
          form: {
            adName: ad.adName,
            description: ad.description ?? "",
            mediaUrl: ad.mediaUrl,
            mediaType: ad.mediaType,
            duration: ad.duration,
            status: ad.status,
            scheduledStart: "",
            scheduledEnd: "",
          },
        });
      } catch (err) {
        const axErr = err as AxiosError<{ message?: string }>;
        const msg =
          axErr.response?.data?.message ??
          axErr.message ??
          "Failed to load advertisement.";
        patch({ serverError: msg });
        toast.error(msg);
      } finally {
        patch({ loading: false });
      }
    };

    fetchAd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, id]);

  const validate = (): boolean => {
    const { form } = state;
    const errors: EditAdFormErrors = {};

    if (!form.adName.trim()) {
      errors.adName = "Advertisement name is required.";
    } else if (form.adName.trim().length < 2) {
      errors.adName = "Must be at least 2 characters.";
    } else if (form.adName.trim().length > 100) {
      errors.adName = "Must not exceed 100 characters.";
    }

    if (!form.mediaUrl.trim()) {
      errors.mediaUrl = "Media URL is required.";
    } else {
      try {
        new URL(form.mediaUrl);
      } catch {
        errors.mediaUrl = "Please enter a valid URL.";
      }
    }

    const durationNum = Number(form.duration);
    if (form.duration === "" || form.duration === null) {
      errors.duration = "Duration is required.";
    } else if (isNaN(durationNum) || durationNum < 1 || durationNum > 300) {
      errors.duration = "Must be between 1 and 300 seconds.";
    }

    if (form.scheduledStart && form.scheduledEnd) {
      const start = new Date(form.scheduledStart);
      const end = new Date(form.scheduledEnd);
      if (start >= end) {
        errors.scheduledEnd = "End date must be after start date.";
      }
    }

    patch({ fieldErrors: errors });
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    patch({ submitting: true, serverError: "" });

    const { form } = state;

    const payload: Partial<AdRecord> = {
      adName: form.adName.trim(),
      description: form.description.trim() || undefined,
      mediaUrl: form.mediaUrl.trim(),
      mediaType: form.mediaType,
      duration: Number(form.duration),
      status: form.status,
    };

    try {
      await advertisementsApi.update(id, payload);
      toast.success("Advertisement updated successfully!");
      setTimeout(() => router.push(`/dashboard/ads/${id}`), 800);
    } catch (err) {
      const axErr = err as AxiosError<{ message?: string }>;
      const msg =
        axErr.response?.data?.message ?? "Failed to update advertisement.";
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
// FormField wrapper
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
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[var(--ds-bg)] p-8">
        <div className="max-w-2xl mx-auto flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={36} className="text-[#7E3AF0] animate-spin" />
            <p className="text-[var(--ds-text-2)] text-sm">Loading advertisement…</p>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EditAdvertisementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    ad,
    loading,
    submitting,
    serverError,
    form,
    fieldErrors,
    patchForm,
    handleSubmit,
  } = useEditAd(id);

  if (loading) return <LoadingSkeleton />;

  const inputCls = (err?: string) =>
    `bg-[var(--ds-input)] border ${
      err ? "border-red-500/50" : "border-[var(--ds-input-border)]"
    } text-[var(--ds-text)] placeholder:text-[var(--ds-text-3)] focus:border-[#7E3AF0] focus:outline-none rounded-lg px-3 py-2.5 w-full text-sm`;

  const selectCls =
    "bg-[var(--ds-card)] border border-[var(--ds-input-border)] text-[var(--ds-text)] focus:border-[#7E3AF0] focus:outline-none rounded-lg px-3 py-2.5 w-full text-sm";

  if (!ad && serverError) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-[var(--ds-bg)] p-8">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/dashboard/ads"
              className="inline-flex items-center gap-1.5 text-[var(--ds-text-2)] hover:text-[var(--ds-text)] text-sm mb-8"
              style={{ transition: "color 150ms ease" }}
            >
              <ArrowLeft size={15} />
              Back to Advertisements
            </Link>
            <div className="bg-[var(--ds-card)] border border-red-500/20 rounded-xl p-10 text-center">
              <p className="text-red-400 font-semibold mb-1">Error</p>
              <p className="text-[var(--ds-text-2)] text-sm">
                {serverError || "Advertisement not found."}
              </p>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[var(--ds-bg)] p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">

          {/* Back nav */}
          <Link
            href={`/dashboard/ads/${id}`}
            className="inline-flex items-center gap-1.5 text-[var(--ds-text-2)] hover:text-[var(--ds-text)] text-sm mb-8"
            style={{ transition: "color 150ms ease" }}
          >
            <ArrowLeft size={15} />
            Back to Advertisement
          </Link>

          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--ds-text)] tracking-tight mb-1">
              Edit Advertisement
            </h1>
            <p className="text-[var(--ds-text-2)] text-sm">
              Update details for{" "}
              <span className="text-[var(--ds-text-2)]">{ad?.adName}</span>.
            </p>
          </div>

          {/* Server error banner */}
          {serverError && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {serverError}
            </div>
          )}

          {/* Form card */}
          <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-6">
            <h2 className="text-[var(--ds-text)] font-semibold text-lg mb-6">
              Advertisement Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Ad Name */}
              <FormField
                label="Advertisement Name"
                required
                error={fieldErrors.adName}
                hint={`${form.adName.length}/100`}
              >
                <input
                  type="text"
                  value={form.adName}
                  onChange={(e) => patchForm({ adName: e.target.value })}
                  placeholder="e.g., Spring Collection Campaign"
                  maxLength={100}
                  className={inputCls(fieldErrors.adName)}
                  style={{ transition: "border-color 150ms ease" }}
                />
              </FormField>

              {/* Description */}
              <FormField
                label="Description"
                hint={`${form.description.length}/500`}
              >
                <textarea
                  value={form.description}
                  onChange={(e) => patchForm({ description: e.target.value })}
                  placeholder="Describe your advertisement campaign"
                  maxLength={500}
                  rows={4}
                  className={`${inputCls()} resize-none`}
                  style={{ transition: "border-color 150ms ease" }}
                />
              </FormField>

              {/* Media Type + Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Media Type" required>
                  <select
                    value={form.mediaType}
                    onChange={(e) =>
                      patchForm({
                        mediaType: e.target.value as "image" | "video",
                      })
                    }
                    className={selectCls}
                    style={{ transition: "border-color 150ms ease" }}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </FormField>

                <FormField
                  label="Duration (seconds)"
                  required
                  error={fieldErrors.duration}
                  hint="Valid range: 1–300 seconds"
                >
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => patchForm({ duration: e.target.value })}
                    placeholder="e.g., 15"
                    min={1}
                    max={300}
                    className={inputCls(fieldErrors.duration)}
                    style={{ transition: "border-color 150ms ease" }}
                  />
                </FormField>
              </div>

              {/* Media URL */}
              <FormField
                label="Media URL"
                required
                error={fieldErrors.mediaUrl}
                hint={
                  form.mediaType === "image"
                    ? "Recommended: PNG, JPEG, or WebP"
                    : "Recommended: MP4 or WebM"
                }
              >
                <input
                  type="url"
                  value={form.mediaUrl}
                  onChange={(e) => patchForm({ mediaUrl: e.target.value })}
                  placeholder="https://example.com/media.jpg"
                  className={inputCls(fieldErrors.mediaUrl)}
                  style={{ transition: "border-color 150ms ease" }}
                />
              </FormField>

              {/* Status */}
              <FormField
                label="Status"
                hint="Control the publication state of your advertisement."
              >
                <select
                  value={form.status}
                  onChange={(e) => patchForm({ status: e.target.value })}
                  className={selectCls}
                  style={{ transition: "border-color 150ms ease" }}
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </FormField>

              {/* Scheduling */}
              <div className="border-t border-[var(--ds-border)] pt-5">
                <p className="text-[var(--ds-text)] text-sm font-medium mb-4">
                  Scheduling{" "}
                  <span className="text-[var(--ds-text-3)] font-normal">(optional)</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Start Date &amp; Time">
                    <input
                      type="datetime-local"
                      value={form.scheduledStart}
                      onChange={(e) =>
                        patchForm({ scheduledStart: e.target.value })
                      }
                      className={inputCls()}
                      style={{ transition: "border-color 150ms ease", colorScheme: "dark" }}
                    />
                  </FormField>

                  <FormField
                    label="End Date &amp; Time"
                    error={fieldErrors.scheduledEnd}
                  >
                    <input
                      type="datetime-local"
                      value={form.scheduledEnd}
                      onChange={(e) =>
                        patchForm({ scheduledEnd: e.target.value })
                      }
                      className={inputCls(fieldErrors.scheduledEnd)}
                      style={{ transition: "border-color 150ms ease", colorScheme: "dark" }}
                    />
                  </FormField>
                </div>

                <p className="text-[var(--ds-text-3)] text-xs mt-3">
                  Leave blank to use current status immediately.
                </p>
              </div>

              {/* Actions */}
              <div className="border-t border-[var(--ds-border)] pt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  disabled={submitting}
                  className="flex-1 bg-[var(--ds-input)] hover:bg-[var(--ds-input)] disabled:opacity-50 text-[var(--ds-text)] text-sm font-medium rounded-lg px-5 py-2.5"
                  style={{ transition: "background-color 150ms ease" }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] disabled:opacity-50 text-white rounded-lg px-5 py-2.5 text-sm font-medium"
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
              <span className="text-[var(--ds-text)] text-sm font-medium">Tips</span>
            </div>
            <ul className="space-y-2 text-[var(--ds-text-2)] text-xs leading-relaxed">
              <li>
                <span className="text-[var(--ds-text-2)] font-medium">Duration</span> —
                how long the ad plays on displays (1–300 seconds).
              </li>
              <li>
                <span className="text-[var(--ds-text-2)] font-medium">Status</span> —
                Draft (unpublished), Scheduled (future), Active (live), or
                Paused.
              </li>
              <li>
                <span className="text-[var(--ds-text-2)] font-medium">Scheduling</span> —
                set dates to automatically start/stop your campaign. Leave blank
                to apply status immediately.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
