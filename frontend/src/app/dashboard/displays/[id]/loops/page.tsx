"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Loader2,
  Trash2,
  Pencil,
  Plus,
  ListChecks,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AxiosError } from "axios";
import { displayLoopsApi } from "@/lib/api/display-loops.api";
import { displaysApi } from "@/lib/api/displays.api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Advertisement {
  advertisementId: string;
  duration: number;
  order: number;
}

interface Loop {
  id: string;
  loopName: string;
  description?: string | undefined;
  rotationType: string;
  displayLayout: string;
  advertisements?: Advertisement[] | undefined;
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────

const LIMIT = 10;

function useDisplayLoops(displayId: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDisplay = useCallback(async () => {
    try {
      const res = await displaysApi.get(displayId);
      setDisplayName(res.data.data.displayName);
    } catch {
      // non-critical — page still functional without display name
    }
  }, [displayId]);

  const fetchLoops = useCallback(async () => {
    try {
      setLoading(true);
      const res = await displayLoopsApi.list({ displayId, page, limit: LIMIT });
      setLoops(res.data.data.data);
      setTotalPages(Math.max(1, Math.ceil((res.data.data.pagination.total ?? 0) / LIMIT)));
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const msg = axiosErr.response?.data?.message ?? "Failed to load loops";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [displayId, page]);

  useEffect(() => {
    if (!displayId) return;
    void fetchLoops();
    void fetchDisplay();
  }, [fetchLoops, fetchDisplay, displayId]);

  const handleDelete = async (loopId: string) => {
      setDeleting(true);
    try {
      await displayLoopsApi.delete(loopId);
      setLoops(prev => prev.filter(l => l.id !== loopId));
      setDeleteConfirm(null);
      toast.success("Loop deleted successfully.");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? "Failed to delete loop");
    } finally {
      setDeleting(false);
    }
  };

  return {
    router,
    loading,
    loops,
    displayName,
    page,
    setPage,
    totalPages,
    deleteConfirm,
    setDeleteConfirm,
    deleting,
    handleDelete,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function getAdName(ad: Advertisement): string {
  return ad.advertisementId;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DisplayLoopsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: displayId } = use(params);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
  }, [router]);

  const {
    loading,
    loops,
    displayName,
    page,
    setPage,
    totalPages,
    deleteConfirm,
    setDeleteConfirm,
    deleting,
    handleDelete,
  } = useDisplayLoops(displayId);

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--ds-text)] tracking-tight">
                Playlists
                {displayName && (
                  <span className="text-[var(--ds-text-2)] font-normal ml-2 text-xl">
                    for {displayName}
                  </span>
                )}
              </h1>
              <p className="text-[var(--ds-text-2)] text-sm mt-1">
                Manage advertisement playlists for this display
              </p>
            </div>
            <button
              onClick={() =>
                router.push(`/dashboard/displays/${displayId}/loops/new`)
              }
              className="flex items-center gap-2 px-4 py-2 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white rounded-lg text-sm font-medium"
            >
              <Plus size={16} />
              Create Playlist
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 size={36} className="animate-spin text-[#7E3AF0]" />
            </div>
          ) : loops.length === 0 ? (
            /* Empty State */
            <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-16 text-center">
              <ListChecks size={40} className="mx-auto text-[var(--ds-text-3)] mb-4" />
              <h3 className="text-lg font-semibold text-[var(--ds-text)] mb-2">
                No playlists yet
              </h3>
              <p className="text-[var(--ds-text-3)] text-sm mb-6">
                Create your first playlist to assign ads to this display
              </p>
              <button
                onClick={() =>
                  router.push(`/dashboard/displays/${displayId}/loops/new`)
                }
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white rounded-lg text-sm font-medium"
              >
                <Plus size={16} />
                Create Playlist
              </button>
            </div>
          ) : (
            /* Loops Grid */
            <div className="space-y-3">
              {loops.map(loop => (
                <div
                  key={loop.id}
                  className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-6 hover:border-[var(--ds-border)]"
                >
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-[var(--ds-text)] truncate">
                        {loop.loopName}
                      </h3>
                      {loop.description && (
                        <p className="text-[var(--ds-text-2)] text-sm mt-0.5 line-clamp-1">
                          {loop.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/displays/${displayId}/loops/${loop.id}/edit`
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-input)] rounded-lg text-sm font-medium"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(loop.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-[var(--ds-hover)] rounded-lg p-3">
                      <p className="text-[var(--ds-text-2)] text-xs mb-1">Advertisements</p>
                      <p className="text-[var(--ds-text)] font-semibold text-lg">
                        {loop.advertisements?.length ?? 0}
                      </p>
                    </div>
                    <div className="bg-[var(--ds-hover)] rounded-lg p-3">
                      <p className="text-[var(--ds-text-2)] text-xs mb-1">Total Duration</p>
                      <p className="text-[var(--ds-text)] font-semibold text-lg">
                        {formatDuration(
                          loop.advertisements?.reduce((sum, ad) => sum + ad.duration, 0) ?? 0
                        )}
                      </p>
                    </div>
                    <div className="bg-[var(--ds-hover)] rounded-lg p-3">
                      <p className="text-[var(--ds-text-2)] text-xs mb-1">Rotation</p>
                      <p className="text-[var(--ds-text)] font-semibold text-lg capitalize">
                        {loop.rotationType}
                      </p>
                    </div>
                  </div>

                  {/* Ad Tags */}
                  {loop.advertisements && loop.advertisements.length > 0 && (
                    <div className="pt-4 border-t border-[var(--ds-border)]">
                      <p className="text-[var(--ds-text-3)] text-xs mb-2 uppercase tracking-wider">
                        Ads in order
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {loop.advertisements.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-[var(--ds-input)] border border-[var(--ds-border)] text-[var(--ds-text-2)] text-xs rounded-full"
                          >
                            {idx + 1}. {getAdName(item)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-input)] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium ${
                      page === p
                        ? "bg-[#7E3AF0] text-white"
                        : "text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-input)]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-input)] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--ds-card)] border border-[var(--ds-input-border)] rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-[var(--ds-text)] mb-2">
              Delete Playlist?
            </h3>
            <p className="text-[var(--ds-text-2)] text-sm mb-6">
              This action cannot be undone. All associations with advertisements
              will be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-[var(--ds-input-border)] rounded-lg text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-input)] text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
