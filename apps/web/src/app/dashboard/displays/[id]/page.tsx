"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Play,
  Copy,
  Check,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { displaysApi, type DisplayRecord } from "@/lib/api/displays.api";
import type { AxiosError } from "axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DisplayDetailState {
  display: DisplayRecord | null;
  loading: boolean;
  error: string;
  deleteLoading: boolean;
  deleteConfirm: boolean;
  copiedToken: boolean;
}

// ---------------------------------------------------------------------------
// Custom hook — display detail state & handlers
// ---------------------------------------------------------------------------

function useDisplayDetail(id: string) {
  const router = useRouter();

  const [state, setState] = useState<DisplayDetailState>({
    display: null,
    loading: true,
    error: "",
    deleteLoading: false,
    deleteConfirm: false,
    copiedToken: false,
  });

  const patch = (partial: Partial<DisplayDetailState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
  }, [router]);

  const fetchDisplay = async () => {
    patch({ loading: true, error: "" });
    try {
      const res = await displaysApi.get(id);
      patch({ display: res.data.data });
    } catch (err) {
      const axErr = err as AxiosError<{ message?: string }>;
      const msg = axErr.response?.data?.message ?? axErr.message ?? "Failed to fetch display details.";
      patch({ error: msg });
    } finally {
      patch({ loading: false });
    }
  };

  useEffect(() => {
    if (id) fetchDisplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    patch({ copiedToken: true });
    toast.success("Token copied to clipboard!");
    setTimeout(() => patch({ copiedToken: false }), 2000);
  };

  const handleDelete = async () => {
    patch({ deleteLoading: true });
    try {
      await displaysApi.delete(id);
      toast.success("Display deleted successfully!");
      router.push("/dashboard/displays");
    } catch (err) {
      const axErr = err as AxiosError<{ message?: string }>;
      const msg = axErr.response?.data?.message ?? "Failed to delete display.";
      patch({ error: msg, deleteLoading: false });
      toast.error(msg);
    }
  };

  return {
    ...state,
    patch,
    handleCopyToken,
    handleDelete,
  };
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    online: "bg-green-500/15 text-green-400 border border-green-500/20",
    offline: "bg-white/5 text-white/40 border border-white/8",
    inactive: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
    pending: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  };
  const cls = map[status] ?? "bg-white/5 text-white/40 border border-white/8";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-white/5 last:border-0">
      <dt className="text-white/40 text-xs uppercase tracking-wider font-medium mb-1.5">{label}</dt>
      <dd className="text-white text-sm">{children}</dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[#080410] p-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
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

export default function DisplayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const {
    display,
    loading,
    error,
    deleteLoading,
    deleteConfirm,
    copiedToken,
    patch,
    handleCopyToken,
    handleDelete,
  } = useDisplayDetail(id);

  if (loading) return <LoadingSkeleton />;

  if (error || !display) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-[#080410] p-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/dashboard/displays"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-sm font-medium mb-8 group"
              style={{ transition: "color 150ms ease" }}
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5" style={{ transition: "transform 150ms ease" }} />
              Back to Displays
            </Link>
            <div className="bg-[#111118] border border-red-500/20 rounded-xl p-10 text-center">
              <p className="text-red-400 font-semibold mb-1">Error</p>
              <p className="text-white/40 text-sm">{error || "Display not found."}</p>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  const formattedDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[#080410] p-8">
        <div className="max-w-4xl mx-auto">

          {/* Back nav */}
          <Link
            href="/dashboard/displays"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-sm font-medium mb-8 group"
            style={{ transition: "color 150ms ease" }}
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5" style={{ transition: "transform 150ms ease" }} />
            Back to Displays
          </Link>

          {/* Inline error */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Main detail card */}
          <div className="bg-[#111118] border border-white/8 rounded-xl overflow-hidden">

            {/* Card header */}
            <div className="px-6 py-5 border-b border-white/8 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight mb-1">
                  {display.displayName}
                </h1>
                <p className="text-white/40 text-xs font-mono">
                  ID: {display.displayId}
                </p>
              </div>
              <StatusBadge status={display.status} />
            </div>

            {/* Detail grid */}
            <div className="px-6 py-2">
              <dl className="divide-y divide-white/5">
                <DetailRow label="Location">{display.location}</DetailRow>

                <DetailRow label="Resolution">
                  <span className="tabular-nums">
                    {display.resolution
                      ? `${display.resolution.width} × ${display.resolution.height}`
                      : "—"}
                  </span>
                </DetailRow>

                <DetailRow label="Connection Token">
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-xs text-white/70 font-mono overflow-x-auto">
                      {display.connectionToken ?? "—"}
                    </code>
                    <button
                      onClick={() => display.connectionToken && handleCopyToken(display.connectionToken)}
                      disabled={!display.connectionToken}
                      className="inline-flex items-center gap-1.5 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                      style={{ transition: "background-color 150ms ease" }}
                    >
                      {copiedToken ? (
                        <>
                          <Check size={13} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </DetailRow>

                <DetailRow label="Created">{display.createdAt ? formattedDate(display.createdAt) : "—"}</DetailRow>

                <DetailRow label="Last Updated">{display.updatedAt ? formattedDate(display.updatedAt) : "—"}</DetailRow>
              </dl>
            </div>

            {/* Actions footer */}
            <div className="px-6 py-5 border-t border-white/8 flex flex-wrap items-center gap-3">
              <Link
                href={`/dashboard/displays/${display.id}/loops`}
                className="inline-flex items-center gap-2 bg-green-600/80 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ transition: "background-color 150ms ease" }}
              >
                <Play size={14} />
                Manage Loops
              </Link>

              <Link
                href={`/dashboard/displays/${display.id}/edit`}
                className="inline-flex items-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ transition: "background-color 150ms ease" }}
              >
                <Pencil size={14} />
                Edit Display
              </Link>

              <button
                onClick={() => patch({ deleteConfirm: true })}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 bg-red-500/15 text-red-400 hover:bg-red-500/25 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{ transition: "background-color 150ms ease" }}
              >
                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleteLoading ? "Deleting…" : "Delete Display"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111118] border border-white/8 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">Delete Display</h3>
            <p className="text-white/50 text-sm mb-6">
              Are you sure you want to delete <span className="text-white font-medium">{display.displayName}</span>?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => patch({ deleteConfirm: false })}
                disabled={deleteLoading}
                className="px-4 py-2 text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ transition: "color 120ms ease, border-color 120ms ease" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{ transition: "background-color 120ms ease" }}
              >
                {deleteLoading && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
