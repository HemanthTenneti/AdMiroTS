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
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video,
  LayoutGrid,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { advertisementsApi, AdRecord } from "@/lib/api/advertisements.api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortBy = "createdAt" | "adName" | "status" | "duration";
type Order = "asc" | "desc";
type StatusFilter = "" | "ACTIVE" | "INACTIVE" | "PENDING";

interface AdsListState {
  advertisements: AdRecord[];
  loading: boolean;
  deleteLoading: string | null;
  deleteConfirmId: string | null;
  searchTerm: string;
  activeSearchTerm: string;
  statusFilter: StatusFilter;
  sortBy: SortBy;
  order: Order;
  page: number;
  totalPages: number;
  totalItems: number;
}

// ---------------------------------------------------------------------------
// Custom hook — single responsibility: data + derived handlers
// ---------------------------------------------------------------------------

function useAdsList() {
  const router = useRouter();
  const ITEMS_PER_PAGE = 9;

  const [state, setState] = useState<AdsListState>({
    advertisements: [],
    loading: true,
    deleteLoading: null,
    deleteConfirmId: null,
    searchTerm: "",
    activeSearchTerm: "",
    statusFilter: "",
    sortBy: "createdAt",
    order: "desc",
    page: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchAdvertisements = useCallback(
    async (
      pageNum: number,
      statusFilter: StatusFilter,
      activeSearchTerm: string
    ) => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const params: Record<string, unknown> = {
          page: pageNum,
          limit: ITEMS_PER_PAGE,
        };
        if (statusFilter) params.status = statusFilter;
        if (activeSearchTerm.trim()) params.search = activeSearchTerm.trim();

        const response = await advertisementsApi.list(
          params as Parameters<typeof advertisementsApi.list>[0]
        );
        const { data: paginatedData } = response.data;
        setState((prev) => ({
          ...prev,
          advertisements: paginatedData.data ?? [],
          totalPages: Math.ceil(
            (paginatedData.pagination?.total ?? 0) / ITEMS_PER_PAGE
          ),
          totalItems: paginatedData.pagination?.total ?? 0,
          loading: false,
        }));
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Failed to fetch advertisements.";
        toast.error(message);
        setState((prev) => ({
          ...prev,
          advertisements: [],
          loading: false,
        }));
      }
    },
    []
  );

  // Initial auth guard
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchAdvertisements(state.page, state.statusFilter, state.activeSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch on filter / sort / search change
  useEffect(() => {
    setState((prev) => ({ ...prev, page: 1 }));
    fetchAdvertisements(1, state.statusFilter, state.activeSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.statusFilter, state.sortBy, state.order, state.activeSearchTerm]);

  // Refetch on page change
  useEffect(() => {
    fetchAdvertisements(state.page, state.statusFilter, state.activeSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page]);

  const handleDelete = async (adId: string) => {
    setState((prev) => ({ ...prev, deleteLoading: adId }));
    try {
      await advertisementsApi.delete(adId);
      setState((prev) => ({
        ...prev,
        advertisements: prev.advertisements.filter((a) => a.id !== adId),
        deleteConfirmId: null,
        deleteLoading: null,
      }));
      toast.success("Advertisement deleted successfully.");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to delete advertisement.";
      toast.error(message);
      setState((prev) => ({ ...prev, deleteLoading: null }));
    }
  };

  const commitSearch = () => {
    setState((prev) => ({
      ...prev,
      activeSearchTerm: prev.searchTerm,
      page: 1,
    }));
  };

  const clearSearch = () => {
    setState((prev) => ({
      ...prev,
      searchTerm: "",
      activeSearchTerm: "",
      page: 1,
    }));
  };

  const setSearchTerm = (v: string) =>
    setState((prev) => ({ ...prev, searchTerm: v }));
  const setStatusFilter = (v: StatusFilter) =>
    setState((prev) => ({ ...prev, statusFilter: v }));
  const setSortBy = (v: SortBy) => setState((prev) => ({ ...prev, sortBy: v }));
  const setOrder = (v: Order) => setState((prev) => ({ ...prev, order: v }));
  const setPage = (v: number) => setState((prev) => ({ ...prev, page: v }));
  const setDeleteConfirmId = (v: string | null) =>
    setState((prev) => ({ ...prev, deleteConfirmId: v }));

  return {
    ...state,
    itemsPerPage: ITEMS_PER_PAGE,
    handleDelete,
    commitSearch,
    clearSearch,
    setSearchTerm,
    setStatusFilter,
    setSortBy,
    setOrder,
    setPage,
    setDeleteConfirmId,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const normalised = status?.toUpperCase();
  if (normalised === "ACTIVE")
    return (
      <span className="bg-green-500/15 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
        Active
      </span>
    );
  if (normalised === "PENDING")
    return (
      <span className="bg-yellow-500/15 text-yellow-400 text-xs px-2 py-0.5 rounded-full font-medium">
        Pending
      </span>
    );
  return (
    <span className="bg-[var(--ds-hover)] text-[var(--ds-text-2)] text-xs px-2 py-0.5 rounded-full font-medium">
      {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
    </span>
  );
}

function MediaIcon({ mediaType }: { mediaType: string }) {
  if (mediaType?.toUpperCase() === "VIDEO")
    return <Video size={28} className="text-[var(--ds-text-3)]" />;
  return <ImageIcon size={28} className="text-[var(--ds-text-3)]" />;
}

interface AdCardProps {
  ad: AdRecord;
  deleteLoading: string | null;
  onEdit: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

function AdCard({ ad, deleteLoading, onEdit, onDeleteRequest }: AdCardProps) {
  return (
    <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl overflow-hidden hover:border-[#7E3AF0]/40 transition-colors flex flex-col">
      {/* Media preview */}
      <div className="bg-[var(--ds-input)] aspect-video flex items-center justify-center relative overflow-hidden">
        {ad.mediaUrl ? (
          ad.mediaType?.toUpperCase() === "VIDEO" ? (
            <video
              src={ad.mediaUrl}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ad.mediaUrl}
              alt={ad.adName}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <MediaIcon mediaType={ad.mediaType} />
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-[var(--ds-text)] font-medium text-sm leading-snug line-clamp-2 flex-1">
            {ad.adName}
          </h3>
          <StatusBadge status={ad.status} />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-[var(--ds-text-2)] text-xs capitalize">
            {ad.mediaType?.toLowerCase()}
          </span>
          <span className="text-[var(--ds-text-3)] text-xs">·</span>
          <span className="text-[var(--ds-text-2)] text-xs">{ad.duration}s</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[var(--ds-hover)] rounded-lg px-3 py-2">
            <p className="text-[var(--ds-text-2)] text-xs mb-0.5">Views</p>
            <p className="text-[var(--ds-text)] font-semibold text-sm">
              {(ad.views ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-[var(--ds-hover)] rounded-lg px-3 py-2">
            <p className="text-[var(--ds-text-2)] text-xs mb-0.5">Clicks</p>
            <p className="text-[var(--ds-text)] font-semibold text-sm">
              {(ad.clicks ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={() => onEdit(ad.id)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white text-xs font-medium rounded-lg px-3 py-2 transition-colors"
          >
            <Pencil size={13} />
            Edit
          </button>
          <button
            onClick={() => onDeleteRequest(ad.id)}
            disabled={deleteLoading === ad.id}
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
          >
            {deleteLoading === ad.id ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdvertisementsPage() {
  const router = useRouter();
  const {
    advertisements,
    loading,
    deleteLoading,
    deleteConfirmId,
    searchTerm,
    activeSearchTerm,
    statusFilter,
    sortBy,
    order,
    page,
    totalPages,
    totalItems,
    itemsPerPage,
    handleDelete,
    commitSearch,
    clearSearch,
    setSearchTerm,
    setStatusFilter,
    setSortBy,
    setOrder,
    setPage,
    setDeleteConfirmId,
  } = useAdsList();

  const STATUS_TABS: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "" },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
    { label: "Pending", value: "PENDING" },
  ];

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[var(--ds-bg)] p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[var(--ds-text)] mb-1">
                Advertisements
              </h1>
              <p className="text-[var(--ds-text-2)] text-sm">
                Create and manage your advertisement campaigns
              </p>
            </div>
            <Link
              href="/dashboard/ads/new"
              className="flex items-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              <Plus size={16} />
              Create Ad
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-4 mb-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ds-text-3)] pointer-events-none"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && commitSearch()}
                placeholder="Search by name, status, type..."
                className="w-full bg-[var(--ds-input)] border border-[var(--ds-input-border)] text-[var(--ds-text)] placeholder:text-[var(--ds-text-3)] focus:border-[#7E3AF0] focus:outline-none rounded-lg pl-9 pr-24 py-2 text-sm transition-colors"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="p-1.5 text-[var(--ds-text-3)] hover:text-[var(--ds-text-2)] rounded-md transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  onClick={commitSearch}
                  className="bg-[#7E3AF0] hover:bg-[#9F67FF] text-white text-xs font-medium rounded-md px-3 py-1.5 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {activeSearchTerm && (
              <p className="text-[var(--ds-text-2)] text-xs">
                <span className="text-[var(--ds-text)] font-medium">{totalItems}</span>{" "}
                result{totalItems !== 1 ? "s" : ""} for &ldquo;
                {activeSearchTerm}&rdquo;
              </p>
            )}

            {/* Status tabs + sort controls */}
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`text-xs font-medium rounded-full px-3 py-1 transition-colors ${
                      statusFilter === tab.value
                        ? "bg-[#7E3AF0] text-white"
                        : "bg-[var(--ds-hover)] text-[var(--ds-text-2)] hover:bg-[var(--ds-input)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="bg-[var(--ds-card)] border border-[var(--ds-input-border)] text-[var(--ds-text)] text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#7E3AF0] transition-colors"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="adName">Name</option>
                  <option value="status">Status</option>
                  <option value="duration">Duration</option>
                </select>
                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value as Order)}
                  className="bg-[var(--ds-card)] border border-[var(--ds-input-border)] text-[var(--ds-text)] text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#7E3AF0] transition-colors"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2
                  size={36}
                  className="text-[#7E3AF0] animate-spin mx-auto mb-3"
                />
                <p className="text-[var(--ds-text-2)] text-sm">
                  Loading advertisements...
                </p>
              </div>
            </div>
          ) : advertisements.length === 0 ? (
            <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-12 text-center">
              <div className="w-12 h-12 bg-[var(--ds-hover)] rounded-xl flex items-center justify-center mx-auto mb-4">
                <LayoutGrid size={22} className="text-[var(--ds-text-3)]" />
              </div>
              <h2 className="text-[var(--ds-text)] font-semibold mb-2">
                {activeSearchTerm
                  ? "No advertisements found"
                  : "No advertisements yet"}
              </h2>
              <p className="text-[var(--ds-text-2)] text-sm mb-6">
                {activeSearchTerm
                  ? "Try adjusting your search or filters."
                  : "Create your first advertisement to start managing campaigns."}
              </p>
              {!activeSearchTerm && (
                <Link
                  href="/dashboard/ads/new"
                  className="inline-flex items-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                >
                  <Plus size={15} />
                  Create Advertisement
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {advertisements.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  deleteLoading={deleteLoading}
                  onEdit={(id) => router.push(`/dashboard/ads/${id}/edit`)}
                  onDeleteRequest={setDeleteConfirmId}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-3 mt-8">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-input)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(
                    1,
                    Math.min(page - 2, totalPages - 4)
                  );
                  return start + i;
                }).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? "bg-[#7E3AF0] text-white"
                        : "text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-input)]"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-input)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <p className="text-[var(--ds-text-3)] text-xs">
                Page{" "}
                <span className="text-[var(--ds-text-2)] font-medium">{page}</span> of{" "}
                <span className="text-[var(--ds-text-2)] font-medium">{totalPages}</span>
                {advertisements.length > 0 && (
                  <>
                    {" "}
                    &middot; Showing{" "}
                    <span className="text-[var(--ds-text-2)] font-medium">
                      {(page - 1) * itemsPerPage + 1}–
                      {(page - 1) * itemsPerPage + advertisements.length}
                    </span>{" "}
                    of{" "}
                    <span className="text-[var(--ds-text-2)] font-medium">
                      {totalItems}
                    </span>
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-[var(--ds-text)] font-semibold text-base mb-2">
              Delete Advertisement
            </h3>
            <p className="text-[var(--ds-text-2)] text-sm mb-6">
              Are you sure you want to delete this advertisement? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleteLoading === deleteConfirmId}
                className="flex-1 bg-[var(--ds-input)] hover:bg-[var(--ds-input)] text-[var(--ds-text)] text-sm font-medium rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleteLoading === deleteConfirmId}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50"
              >
                {deleteLoading === deleteConfirmId && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
