"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Search,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { displaysApi, type DisplayRecord } from "@/lib/api/displays.api";
import type { AxiosError } from "axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortOrder = "none" | "asc" | "desc";
type SortColumn =
  | "displayId"
  | "displayName"
  | "location"
  | "resolution"
  | "status"
  | null;

interface DisplaysListState {
  displays: DisplayRecord[];
  loading: boolean;
  error: string;
  deleteLoading: string | null;
  searchTerm: string;
  activeSearchTerm: string;
  page: number;
  totalPages: number;
  totalItems: number;
  copiedId: string | null;
  deleteConfirmId: string | null;
  sortBy: SortColumn;
  sortOrder: SortOrder;
}

// ---------------------------------------------------------------------------
// Custom hook — single responsibility: all list state & handlers
// ---------------------------------------------------------------------------

function useDisplaysList() {
  const router = useRouter();
  const ITEMS_PER_PAGE = 8;

  const [state, setState] = useState<DisplaysListState>({
    displays: [],
    loading: true,
    error: "",
    deleteLoading: null,
    searchTerm: "",
    activeSearchTerm: "",
    page: 1,
    totalPages: 1,
    totalItems: 0,
    copiedId: null,
    deleteConfirmId: null,
    sortBy: null,
    sortOrder: "none",
  });

  const patch = (partial: Partial<DisplaysListState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
  }, [router]);

  const fetchDisplays = useCallback(
    async (pageNum: number, searchTerm: string, sortBy: SortColumn, sortOrder: SortOrder) => {
      patch({ loading: true, error: "" });

      try {
        const params: Record<string, string | number> = {
          page: pageNum,
          limit: ITEMS_PER_PAGE,
        };

        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (sortBy && sortOrder !== "none") {
          params.sortBy = sortBy;
          params.order = sortOrder;
        }

        const res = await displaysApi.list(params as Parameters<typeof displaysApi.list>[0]);
        const body = res.data;

        patch({
          displays: body.data.data ?? [],
          totalPages: body.data.pagination?.total
            ? Math.ceil(body.data.pagination.total / ITEMS_PER_PAGE)
            : 1,
          totalItems: body.data.pagination?.total ?? 0,
        });
      } catch (err) {
        const axErr = err as AxiosError<{ message?: string }>;
        const msg = axErr.response?.data?.message ?? axErr.message ?? "Failed to fetch displays.";
        patch({ error: msg, displays: [] });
        toast.error(msg);
      } finally {
        patch({ loading: false });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Re-fetch whenever page, active search or sort changes
  useEffect(() => {
    fetchDisplays(state.page, state.activeSearchTerm, state.sortBy, state.sortOrder);
  }, [state.page, state.activeSearchTerm, state.sortBy, state.sortOrder, fetchDisplays]);

  const handleSearch = () => {
    patch({ activeSearchTerm: state.searchTerm, page: 1 });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    patch({ searchTerm: "", activeSearchTerm: "", page: 1 });
  };

  const handleColumnSort = (col: NonNullable<SortColumn>) => {
    const next: SortOrder =
      state.sortBy === col
        ? state.sortOrder === "asc"
          ? "desc"
          : state.sortOrder === "desc"
          ? "none"
          : "asc"
        : "asc";

    patch({
      sortBy: next === "none" ? null : col,
      sortOrder: next,
      page: 1,
    });
  };

  const handleCopyDisplayId = (displayId: string) => {
    navigator.clipboard.writeText(displayId);
    patch({ copiedId: displayId });
    toast.success("Display ID copied!");
    setTimeout(() => patch({ copiedId: null }), 2000);
  };

  const handleDelete = async (id: string) => {
    patch({ deleteLoading: id });
    try {
      await displaysApi.delete(id);
      toast.success("Display deleted successfully!");
      patch({ deleteConfirmId: null });
      fetchDisplays(state.page, state.activeSearchTerm, state.sortBy, state.sortOrder);
    } catch (err) {
      const axErr = err as AxiosError<{ message?: string }>;
      const msg = axErr.response?.data?.message ?? "Failed to delete display.";
      patch({ error: msg });
      toast.error(msg);
    } finally {
      patch({ deleteLoading: null });
    }
  };

  return {
    ...state,
    ITEMS_PER_PAGE,
    router,
    setSearchTerm: (v: string) => patch({ searchTerm: v }),
    setPage: (v: number) => patch({ page: v }),
    setDeleteConfirmId: (v: string | null) => patch({ deleteConfirmId: v }),
    handleSearch,
    handleSearchKeyDown,
    handleClearSearch,
    handleColumnSort,
    handleCopyDisplayId,
    handleDelete,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SortIcon({ col, sortBy, sortOrder }: { col: string; sortBy: SortColumn; sortOrder: SortOrder }) {
  if (sortBy !== col) return <ChevronsUpDown size={13} className="ml-1 text-[var(--ds-text-3)]" />;
  if (sortOrder === "asc") return <ArrowUp size={13} className="ml-1 text-[#9F67FF]" />;
  return <ArrowDown size={13} className="ml-1 text-[#9F67FF]" />;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    online: "bg-green-500/15 text-green-400 border border-green-500/20",
    offline: "bg-[var(--ds-input)] text-[var(--ds-text-2)] border border-[var(--ds-border)]",
    inactive: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
    pending: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  };
  const cls = map[status] ?? "bg-[var(--ds-input)] text-[var(--ds-text-2)] border border-[var(--ds-border)]";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function DisplaysPage() {
  const {
    displays,
    loading,
    error,
    deleteLoading,
    searchTerm,
    activeSearchTerm,
    page,
    totalPages,
    totalItems,
    copiedId,
    deleteConfirmId,
    sortBy,
    sortOrder,
    ITEMS_PER_PAGE,
    router,
    setSearchTerm,
    setPage,
    setDeleteConfirmId,
    handleSearch,
    handleSearchKeyDown,
    handleClearSearch,
    handleColumnSort,
    handleCopyDisplayId,
    handleDelete,
  } = useDisplaysList();

  const columns: { key: NonNullable<SortColumn> | "createdBy" | "actions"; label: string; sortable: boolean }[] = [
    { key: "displayId", label: "Display ID", sortable: true },
    { key: "displayName", label: "Name", sortable: true },
    { key: "location", label: "Location", sortable: true },
    { key: "resolution", label: "Resolution", sortable: true },
    { key: "createdBy", label: "Created By", sortable: false },
    { key: "status", label: "Status", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[var(--ds-bg)] p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--ds-text)] mb-1 tracking-tight">Displays</h1>
              <p className="text-[var(--ds-text-2)] text-sm">Manage your display devices</p>
            </div>
            <Link
              href="/dashboard/displays/new"
              className="inline-flex items-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ transition: "background-color 150ms ease" }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Display
            </Link>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ds-text-3)] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by ID, name, location, status…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-9 pr-9 py-2.5 bg-[var(--ds-input)] border border-[var(--ds-input-border)] text-[var(--ds-text)] placeholder:text-[var(--ds-text-3)] focus:border-[#7E3AF0] focus:outline-none rounded-lg text-sm"
                  style={{ transition: "border-color 150ms ease" }}
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ds-text-3)] hover:text-[var(--ds-text-2)]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={handleSearch}
                className="inline-flex items-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white rounded-lg px-4 py-2.5 text-sm font-semibold"
                style={{ transition: "background-color 150ms ease" }}
              >
                <Search size={14} />
                Search
              </button>
            </div>
            {activeSearchTerm && (
              <p className="mt-2 text-xs text-[var(--ds-text-2)]">
                Found <span className="text-[var(--ds-text)] font-medium">{totalItems}</span> display{totalItems !== 1 ? "s" : ""} for &ldquo;{activeSearchTerm}&rdquo;
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={36} className="text-[#7E3AF0] animate-spin" />
                <p className="text-[var(--ds-text-2)] text-sm">Loading displays…</p>
              </div>
            </div>
          ) : displays.length === 0 ? (
            /* Empty state */
            <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-16 text-center">
              <p className="text-[var(--ds-text-2)] text-lg font-medium mb-2">
                {activeSearchTerm ? "No displays found" : "No displays yet"}
              </p>
              <p className="text-[var(--ds-text-3)] text-sm mb-8">
                {activeSearchTerm
                  ? "Try adjusting your search terms."
                  : "Create your first display to get started."}
              </p>
              {!activeSearchTerm && (
                <Link
                  href="/dashboard/displays/new"
                  className="inline-flex items-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white rounded-lg px-5 py-2.5 text-sm font-semibold"
                  style={{ transition: "background-color 150ms ease" }}
                >
                  <Plus size={16} />
                  Add Display
                </Link>
              )}
            </div>
          ) : (
            /* Table */
            <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--ds-input)] border-b border-[var(--ds-border)]">
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          onClick={col.sortable ? () => handleColumnSort(col.key as NonNullable<SortColumn>) : undefined}
                          className={`px-5 py-3 text-left text-xs uppercase tracking-wider font-semibold text-[var(--ds-text-2)] whitespace-nowrap select-none ${
                            col.sortable ? "cursor-pointer hover:text-[var(--ds-text)]" : ""
                          } ${col.key === "actions" ? "text-right" : ""}`}
                          style={col.sortable ? { transition: "color 150ms ease" } : undefined}
                        >
                          <span className="inline-flex items-center">
                            {col.label}
                            {col.sortable && (
                              <SortIcon
                                col={col.key}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                              />
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displays.map((display) => (
                      <tr
                        key={display.id ?? display.displayId}
                        className="border-b border-[var(--ds-border)] hover:bg-[var(--ds-hover)]"
                        style={{ transition: "background-color 120ms ease" }}
                      >
                        {/* Display ID */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-[#9F67FF]">
                              {display.displayId}
                            </span>
                            <button
                              onClick={() => handleCopyDisplayId(display.displayId)}
                              className="p-1 rounded text-[var(--ds-text-3)] hover:text-[var(--ds-text-2)] hover:bg-[var(--ds-input)]"
                              style={{ transition: "color 120ms ease, background-color 120ms ease" }}
                              title="Copy Display ID"
                            >
                              {copiedId === display.displayId ? (
                                <Check size={13} className="text-green-400" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-5 py-3.5">
                          <span className="text-[var(--ds-text)] text-sm font-medium">{display.displayName}</span>
                        </td>

                        {/* Location */}
                        <td className="px-5 py-3.5">
                          <span className="text-[var(--ds-text-2)] text-sm">{display.location}</span>
                        </td>

                        {/* Resolution */}
                        <td className="px-5 py-3.5">
                          <span className="text-[var(--ds-text-2)] text-sm tabular-nums">
                            {display.resolution
                              ? `${display.resolution.width} × ${display.resolution.height}`
                              : "—"}
                          </span>
                        </td>

                        {/* Created by — not in DisplayRecord, show dash */}
                        <td className="px-5 py-3.5">
                          <span className="text-[var(--ds-text-3)] text-sm">—</span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <StatusBadge status={display.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1 justify-end">
                            <button
                              onClick={() => display.id && router.push(`/dashboard/displays/${display.id}`)}
                              disabled={!display.id}
                              className="inline-flex items-center gap-1.5 text-[var(--ds-text-2)] hover:text-[var(--ds-text)] px-3 py-1.5 rounded-lg hover:bg-[var(--ds-input)] text-xs font-medium"
                              style={{ transition: "color 120ms ease, background-color 120ms ease" }}
                            >
                              <Pencil size={13} />
                              Edit
                            </button>
                            <button
                              onClick={() => display.id && setDeleteConfirmId(display.id)}
                              disabled={!display.id || deleteLoading === display.id}
                              className="inline-flex items-center gap-1.5 bg-red-500/15 text-red-400 hover:bg-red-500/25 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                              style={{ transition: "background-color 120ms ease" }}
                            >
                              {deleteLoading === display.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                              {deleteLoading === display.id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination + count */}
          {displays.length > 0 && (
            <div className="mt-8 flex flex-col items-center gap-4">
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-input)] disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ transition: "color 120ms ease, background-color 120ms ease" }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page range */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    return start + i;
                  }).map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold ${
                        page === pNum
                          ? "bg-[#7E3AF0] text-white"
                          : "text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-input)]"
                      }`}
                      style={{ transition: "background-color 120ms ease, color 120ms ease" }}
                    >
                      {pNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-input)] disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ transition: "color 120ms ease, background-color 120ms ease" }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              <p className="text-xs text-[var(--ds-text-3)] tabular-nums">
                Showing{" "}
                <span className="text-[var(--ds-text-2)] font-medium">
                  {(page - 1) * ITEMS_PER_PAGE + 1}–{(page - 1) * ITEMS_PER_PAGE + displays.length}
                </span>{" "}
                of{" "}
                <span className="text-[var(--ds-text-2)] font-medium">{totalItems}</span>{" "}
                display{totalItems !== 1 ? "s" : ""}
                {activeSearchTerm && " (filtered)"}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-[var(--ds-text)] font-semibold text-lg mb-2">Delete Display</h3>
            <p className="text-[var(--ds-text-2)] text-sm mb-6">
              Are you sure you want to delete this display? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleteLoading === deleteConfirmId}
                className="px-4 py-2 text-[var(--ds-text-2)] hover:text-[var(--ds-text)] border border-[var(--ds-input-border)] hover:border-[#7E3AF0]/40 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ transition: "color 120ms ease, border-color 120ms ease" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleteLoading === deleteConfirmId}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{ transition: "background-color 120ms ease" }}
              >
                {deleteLoading === deleteConfirmId && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
