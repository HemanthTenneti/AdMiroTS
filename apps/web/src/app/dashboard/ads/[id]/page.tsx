"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  Pencil,
  Copy,
  Check,
  Image as ImageIcon,
  Video,
  Eye,
  MousePointerClick,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { advertisementsApi, AdRecord } from "@/lib/api/advertisements.api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdDetailState {
  ad: AdRecord | null;
  loading: boolean;
  deleteLoading: boolean;
  statusLoading: boolean;
  error: string;
  copiedField: string | null;
  deleteConfirm: boolean;
}

// ---------------------------------------------------------------------------
// Custom hook
// ---------------------------------------------------------------------------

function useAdDetail(id: string) {
  const router = useRouter();

  const [state, setState] = useState<AdDetailState>({
    ad: null,
    loading: true,
    deleteLoading: false,
    statusLoading: false,
    error: "",
    copiedField: null,
    deleteConfirm: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchAd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAd = async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const response = await advertisementsApi.get(id);
      setState((prev) => ({
        ...prev,
        ad: response.data.data,
        loading: false,
      }));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to fetch advertisement.";
      setState((prev) => ({ ...prev, error: message, loading: false }));
    }
  };

  const handleDelete = async () => {
    setState((prev) => ({ ...prev, deleteLoading: true }));
    try {
      await advertisementsApi.delete(id);
      toast.success("Advertisement deleted.");
      router.push("/dashboard/ads");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to delete advertisement.";
      toast.error(message);
      setState((prev) => ({
        ...prev,
        deleteLoading: false,
        deleteConfirm: false,
      }));
    }
  };

  const handleActivate = async () => {
    setState((prev) => ({ ...prev, statusLoading: true }));
    try {
      const response = await advertisementsApi.activate(id);
      setState((prev) => ({
        ...prev,
        ad: response.data.data,
        statusLoading: false,
      }));
      toast.success("Advertisement activated.");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to activate advertisement.";
      toast.error(message);
      setState((prev) => ({ ...prev, statusLoading: false }));
    }
  };

  const handleDeactivate = async () => {
    setState((prev) => ({ ...prev, statusLoading: true }));
    try {
      const response = await advertisementsApi.deactivate(id);
      setState((prev) => ({
        ...prev,
        ad: response.data.data,
        statusLoading: false,
      }));
      toast.success("Advertisement deactivated.");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to deactivate advertisement.";
      toast.error(message);
      setState((prev) => ({ ...prev, statusLoading: false }));
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setState((prev) => ({ ...prev, copiedField: field }));
      setTimeout(
        () => setState((prev) => ({ ...prev, copiedField: null })),
        2000
      );
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  return {
    ...state,
    handleDelete,
    handleActivate,
    handleDeactivate,
    copyToClipboard,
    setDeleteConfirm: (v: boolean) =>
      setState((prev) => ({ ...prev, deleteConfirm: v })),
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const upper = status?.toUpperCase();
  if (upper === "ACTIVE")
    return (
      <span className="bg-green-500/15 text-green-400 text-xs px-2.5 py-1 rounded-full font-medium">
        Active
      </span>
    );
  if (upper === "PENDING")
    return (
      <span className="bg-yellow-500/15 text-yellow-400 text-xs px-2.5 py-1 rounded-full font-medium">
        Pending
      </span>
    );
  return (
    <span className="bg-white/[0.08] text-white/40 text-xs px-2.5 py-1 rounded-full font-medium">
      {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
    </span>
  );
}

function CopyField({
  label,
  value,
  fieldKey,
  copiedField,
  onCopy,
  mono = false,
}: {
  label: string;
  value: string;
  fieldKey: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-white/40 text-xs mb-1.5">{label}</p>
      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 overflow-hidden">
        <span
          className={`flex-1 text-white/70 text-xs truncate ${mono ? "font-mono" : ""}`}
        >
          {value}
        </span>
        <button
          onClick={() => onCopy(value, fieldKey)}
          className="shrink-0 p-1 text-white/30 hover:text-white/70 rounded transition-colors"
        >
          {copiedField === fieldKey ? (
            <Check size={13} className="text-green-400" />
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="bg-[#111118] border border-white/[0.08] rounded-xl p-4">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${accent}`}
      >
        <Icon size={16} />
      </div>
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdvertisementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    ad,
    loading,
    deleteLoading,
    statusLoading,
    error,
    copiedField,
    deleteConfirm,
    handleDelete,
    handleActivate,
    handleDeactivate,
    copyToClipboard,
    setDeleteConfirm,
  } = useAdDetail(id);

  const router = useRouter();

  if (loading) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="text-center">
            <Loader2
              size={36}
              className="text-[#7E3AF0] animate-spin mx-auto mb-3"
            />
            <p className="text-white/40 text-sm">Loading advertisement...</p>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  if (error || !ad) {
    return (
      <DashboardLayout>
        <main className="min-h-screen bg-[#0A0A0F] p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/dashboard/ads"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Advertisements
            </Link>
            <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl p-8 text-center">
              <p className="text-red-400 font-medium mb-2">
                Unable to Load Advertisement
              </p>
              <p className="text-white/40 text-sm mb-6">
                {error || "Advertisement not found."}
              </p>
              <Link
                href="/dashboard/ads"
                className="inline-flex items-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              >
                Back to Advertisements
              </Link>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  const isActive = ad.status?.toUpperCase() === "ACTIVE";
  const ctr =
    ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(2) + "%" : "—";

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[#0A0A0F] p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-start gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors mt-0.5 shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-white truncate">
                  {ad.adName}
                </h1>
                <StatusBadge status={ad.status} />
              </div>
              <p className="text-white/40 text-sm mt-0.5">
                Advertisement Details
              </p>
            </div>
          </div>

          {/* Media Preview */}
          {ad.mediaUrl && (
            <div className="bg-[#111118] border border-white/[0.08] rounded-xl overflow-hidden mb-6">
              <div className="aspect-video bg-white/[0.03] flex items-center justify-center">
                {ad.mediaType?.toUpperCase() === "VIDEO" ? (
                  <video
                    src={ad.mediaUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ad.mediaUrl}
                    alt={ad.adName}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main col */}
            <div className="lg:col-span-2 space-y-5">
              {/* Info card */}
              <div className="bg-[#111118] border border-white/[0.08] rounded-xl p-5 space-y-4">
                <h2 className="text-white font-semibold text-sm">
                  Information
                </h2>

                <CopyField
                  label="Advertisement ID"
                  value={ad.adId || ad.id}
                  fieldKey="id"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                  mono
                />

                {ad.description && (
                  <div>
                    <p className="text-white/40 text-xs mb-1.5">Description</p>
                    <p className="text-white/70 text-sm bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5">
                      {ad.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/40 text-xs mb-1.5">Duration</p>
                    <p className="text-white font-semibold">
                      {ad.duration}
                      <span className="text-white/40 font-normal text-xs ml-1">
                        seconds
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1.5">Media Type</p>
                    <div className="flex items-center gap-2">
                      {ad.mediaType?.toUpperCase() === "VIDEO" ? (
                        <Video size={14} className="text-[#7E3AF0]" />
                      ) : (
                        <ImageIcon size={14} className="text-[#7E3AF0]" />
                      )}
                      <p className="text-white/70 text-sm capitalize">
                        {ad.mediaType?.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {ad.mediaUrl && (
                  <CopyField
                    label="Media URL"
                    value={ad.mediaUrl}
                    fieldKey="url"
                    copiedField={copiedField}
                    onCopy={copyToClipboard}
                    mono
                  />
                )}
              </div>

              {/* Timestamps */}
              <div className="bg-[#111118] border border-white/[0.08] rounded-xl p-5">
                <h2 className="text-white/60 text-xs font-medium uppercase tracking-wide mb-4">
                  Timestamps
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/30 text-xs mb-1">Created</p>
                    <p className="text-white/60 text-sm">
                      {new Date(ad.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs mb-1">Last Updated</p>
                    <p className="text-white/60 text-sm">
                      {new Date(ad.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Stats */}
              <div className="space-y-3">
                <StatCard
                  icon={Eye}
                  label="Total Views"
                  value={ad.views ?? 0}
                  accent="bg-blue-500/10 text-blue-400"
                />
                <StatCard
                  icon={MousePointerClick}
                  label="Total Clicks"
                  value={ad.clicks ?? 0}
                  accent="bg-green-500/10 text-green-400"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Click-Through Rate"
                  value={ctr}
                  accent="bg-[#7E3AF0]/10 text-[#9F67FF]"
                />
              </div>

              {/* Actions */}
              <div className="bg-[#111118] border border-white/[0.08] rounded-xl p-4 space-y-2">
                <h2 className="text-white/60 text-xs font-medium uppercase tracking-wide mb-3">
                  Actions
                </h2>

                <Link
                  href={`/dashboard/ads/${ad.id}/edit`}
                  className="w-full flex items-center justify-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
                >
                  <Pencil size={14} />
                  Edit Advertisement
                </Link>

                {isActive ? (
                  <button
                    onClick={handleDeactivate}
                    disabled={statusLoading}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
                  >
                    {statusLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : null}
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={handleActivate}
                    disabled={statusLoading}
                    className="w-full flex items-center justify-center gap-2 bg-green-500/15 text-green-400 hover:bg-green-500/25 disabled:opacity-50 text-sm font-medium rounded-lg px-3 py-2.5 transition-colors"
                  >
                    {statusLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : null}
                    Activate
                  </button>
                )}

                <button
                  onClick={() => setDeleteConfirm(true)}
                  disabled={deleteLoading}
                  className="w-full flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-red-500/10 text-white/40 hover:text-red-400 disabled:opacity-50 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
                >
                  {deleteLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete Advertisement
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111118] border border-white/[0.08] rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-white font-semibold text-base mb-2">
              Delete Advertisement
            </h3>
            <p className="text-white/40 text-sm mb-6">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 bg-white/[0.06] hover:bg-white/[0.10] text-white/70 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50"
              >
                {deleteLoading && (
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
