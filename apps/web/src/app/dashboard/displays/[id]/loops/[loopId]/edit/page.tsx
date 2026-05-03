"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Image,
  Video,
} from "lucide-react";
import { AxiosError } from "axios";
import { advertisementsApi } from "@/lib/api/advertisements.api";
import { displayLoopsApi } from "@/lib/api/display-loops.api";
import { displaysApi } from "@/lib/api/displays.api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ad {
  id: string;
  adName: string;
  mediaType: "image" | "video";
  duration: number;
  status: string;
}

interface SelectedAd {
  adId: string;
  loopOrder: number;
  adName: string;
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────

function useEditLoop(displayId: string, loopId: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAds, setSelectedAds] = useState<SelectedAd[]>([]);
  const [loopName, setLoopName] = useState("");
  const [description, setDescription] = useState("");
  const [rotationType, setRotationType] = useState("sequential");
  const [displayLayout, setDisplayLayout] = useState("fullscreen");
  const [displayName, setDisplayName] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [displayRes, loopRes, adsRes] = await Promise.all([
        displaysApi.get(displayId),
        displayLoopsApi.get(loopId),
        advertisementsApi.list({ limit: 1000 }),
      ]);

      setDisplayName(displayRes.data.data.displayName);

      const loop = loopRes.data.data;
      setLoopName(loop.loopName);
      setDescription(loop.description ?? "");
      setRotationType(loop.rotationType);
      setDisplayLayout(loop.displayLayout ?? "fullscreen");

      const mapped: SelectedAd[] = (loop.advertisements ?? []).map(ad => ({
        adId: ad.advertisementId,
        loopOrder: ad.order,
        adName: "Advertisement",
      }));
      setSelectedAds(mapped);

      const activeAds = adsRes.data.data.data.filter(ad => ad.status.toLowerCase() === "active");
      setAds(activeAds);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? "Failed to load loop");
    } finally {
      setLoading(false);
    }
  }, [displayId, loopId]);

  useEffect(() => {
    if (!displayId || !loopId) return;
    void fetchData();
  }, [fetchData, displayId, loopId]);

  const handleAddAd = (adId: string) => {
    if (selectedAds.find(item => item.adId === adId)) return;
    const ad = ads.find(a => a.id === adId);
    setSelectedAds(prev => [
      ...prev,
      { adId, loopOrder: prev.length, adName: ad?.adName ?? "Unknown" },
    ]);
  };

  const handleRemoveAd = (index: number) => {
    setSelectedAds(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveAd = (index: number, direction: "up" | "down") => {
    setSelectedAds(prev => {
      const next = [...prev];
      if (direction === "up" && index > 0) {
        const current = next[index];
        const previous = next[index - 1];
        if (!current || !previous) return prev;
        next[index - 1] = current;
        next[index] = previous;
      } else if (direction === "down" && index < next.length - 1) {
        const current = next[index];
        const nextItem = next[index + 1];
        if (!current || !nextItem) return prev;
        next[index + 1] = current;
        next[index] = nextItem;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loopName.trim()) {
      toast.error("Loop name is required");
      return;
    }
    if (selectedAds.length === 0) {
      toast.error("Please add at least one advertisement");
      return;
    }

    setSubmitting(true);
    try {
      await displayLoopsApi.update(loopId, {
        loopName: loopName.trim(),
        rotationType: rotationType as "sequential" | "random" | "weighted",
        displayLayout: displayLayout as "fullscreen" | "masonry",
        ...(description.trim() ? { description: description.trim() } : {}),
      });
      await Promise.all(
        selectedAds.map((ad, idx) =>
          displayLoopsApi.updateAdvertisementOrder(loopId, ad.adId, { newOrder: idx }).catch(() =>
            displayLoopsApi.addAdvertisement(loopId, {
              advertisementId: ad.adId,
              duration: ads.find(item => item.id === ad.adId)?.duration ?? 15,
              order: idx,
            })
          )
        )
      );
      toast.success("Loop updated successfully.");
      router.push(`/dashboard/displays/${displayId}/loops`);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? "Failed to update loop");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    router,
    loading,
    submitting,
    ads,
    selectedAds,
    loopName,
    setLoopName,
    description,
    setDescription,
    rotationType,
    setRotationType,
    displayLayout,
    setDisplayLayout,
    displayName,
    handleAddAd,
    handleRemoveAd,
    handleMoveAd,
    handleSubmit,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditLoopPage({
  params,
}: {
  params: Promise<{ id: string; loopId: string }>;
}) {
  const { id: displayId, loopId } = use(params);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
  }, [router]);

  const {
    loading,
    submitting,
    ads,
    selectedAds,
    loopName,
    setLoopName,
    description,
    setDescription,
    rotationType,
    setRotationType,
    displayLayout,
    setDisplayLayout,
    displayName,
    handleAddAd,
    handleRemoveAd,
    handleMoveAd,
    handleSubmit,
  } = useEditLoop(displayId, loopId);

  const inputClass =
    "w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#7E3AF0] focus:outline-none rounded-lg px-3 py-2.5 text-sm";

  const selectClass =
    "w-full bg-[#0d0d14] border border-white/10 text-white focus:border-[#7E3AF0] focus:outline-none rounded-lg px-3 py-2.5 text-sm";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 size={36} className="animate-spin text-[#7E3AF0]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Edit Playlist
              </h1>
              {displayName && (
                <p className="text-white/40 text-sm mt-0.5">
                  For: {displayName}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Playlist Details */}
            <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-5">
                Playlist Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1.5">
                    Playlist Name <span className="text-[#7E3AF0]">*</span>
                  </label>
                  <input
                    type="text"
                    value={loopName}
                    onChange={e => setLoopName(e.target.value)}
                    placeholder="e.g., Morning Ads, Weekend Promo"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Optional description of this playlist"
                    rows={3}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1.5">
                    Display Layout
                  </label>
                  <select
                    value={displayLayout}
                    onChange={e => setDisplayLayout(e.target.value)}
                    className={selectClass}
                  >
                    <option value="fullscreen">Fullscreen</option>
                    <option value="masonry">Masonry</option>
                  </select>
                </div>

                {displayLayout === "fullscreen" && (
                  <div>
                    <label className="block text-white/70 text-sm mb-1.5">
                      Rotation Type
                    </label>
                    <select
                      value={rotationType}
                      onChange={e => setRotationType(e.target.value)}
                      className={selectClass}
                    >
                      <option value="sequential">Sequential (slideshow)</option>
                      <option value="random">Random</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Add Advertisements */}
            <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-5">
                Add Advertisements
              </h2>

              {ads.length === 0 ? (
                <p className="text-white/30 text-sm py-6 text-center">
                  No active advertisements available. Create some ads first.
                </p>
              ) : (
                <div className="space-y-2">
                  {ads.map(ad => (
                    <div
                      key={ad.id}
                      className="flex items-center justify-between p-3 border border-[var(--ds-border)] rounded-lg hover:border-white/15"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-white/30">
                          {ad.mediaType === "image" ? (
                            <Image size={16} />
                          ) : (
                            <Video size={16} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {ad.adName}
                          </p>
                          <p className="text-white/30 text-xs mt-0.5">
                            {ad.mediaType} · {ad.duration}s
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddAd(ad.id)}
                        disabled={selectedAds.some(item => item.adId === ad.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7E3AF0] hover:bg-[#9F67FF] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs rounded-lg font-medium shrink-0 ml-3"
                      >
                        <Plus size={12} />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Playlist Order */}
            {selectedAds.length > 0 && (
              <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-6">
                <h2 className="text-base font-semibold text-white mb-5">
                  Playlist Order{" "}
                  <span className="text-white/30 font-normal text-sm">
                    ({selectedAds.length} ads)
                  </span>
                </h2>

                <div className="space-y-2">
                  {selectedAds.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-white/3 border border-[var(--ds-border)] rounded-lg"
                    >
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveAd(idx, "up")}
                          disabled={idx === 0}
                          className="p-0.5 text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveAd(idx, "down")}
                          disabled={idx === selectedAds.length - 1}
                          className="p-0.5 text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>

                      <span className="text-white/20 text-xs font-mono w-5 shrink-0 text-center">
                        {idx + 1}
                      </span>

                      <p className="flex-1 text-white text-sm font-medium truncate">
                        {item.adName}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleRemoveAd(idx)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pb-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2.5 border border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  submitting || selectedAds.length === 0 || !loopName.trim()
                }
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7E3AF0] hover:bg-[#9F67FF] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Playlist"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
