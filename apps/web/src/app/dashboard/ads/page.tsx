"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { z } from "zod";
import { advertisementsApi } from "@/lib/api/advertisements.api";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import {
  DataTable,
  PageTitle,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatusPill,
  TextInput,
} from "@/components/dashboard/ui";
import { formatDateTime, formatFileSize } from "@/lib/utils";

const CreateAdFormSchema = z.object({
  adName: z.string().min(1, "Ad name is required"),
  duration: z.number().int().positive("Duration must be positive"),
  description: z.string().optional(),
});

export default function AdsPage() {
  const { authReady } = useDashboardAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ adName: "", duration: "15", description: "" });

  const mediaType = useMemo<"image" | "video" | null>(() => {
    if (!file) return null;
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return null;
  }, [file]);

  const loadAds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await advertisementsApi.list({ page: 1, limit: 100 });
      setAds(response.data.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    void loadAds();
  }, [authReady]);

  const submitCreateAd = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!file || !mediaType) {
      setError("Choose an image or video file before uploading.");
      return;
    }

    const parsed = CreateAdFormSchema.safeParse({
      adName: form.adName,
      duration: Number(form.duration),
      description: form.description || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid values");
      return;
    }

    setSubmitting(true);
    try {
      const uploadMeta = await advertisementsApi.createUploadUrl({
        mediaType,
        mimeType: file.type,
        fileName: file.name,
        fileSize: file.size,
      });

      const { uploadUrl, publicUrl, objectKey } = uploadMeta.data.data;

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`R2 upload failed with status ${uploadResponse.status}`);
      }

      const createPayload: {
        adName: string;
        mediaUrl: string;
        mediaObjectKey: string;
        mediaType: "image" | "video";
        duration: number;
        fileSize: number;
        description?: string;
      } = {
        adName: parsed.data.adName,
        mediaUrl: publicUrl,
        mediaObjectKey: objectKey,
        mediaType,
        duration: parsed.data.duration,
        fileSize: file.size,
      };

      if (parsed.data.description) {
        createPayload.description = parsed.data.description;
      }

      await advertisementsApi.create(createPayload);

      setForm({ adName: "", duration: "15", description: "" });
      setFile(null);
      await loadAds();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Advertisement upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAdStatus = async (ad: any) => {
    setError(null);
    try {
      if (ad.status === "active") {
        await advertisementsApi.deactivate(ad.id);
      } else {
        await advertisementsApi.activate(ad.id);
      }
      await loadAds();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update advertisement status");
    }
  };

  const deleteAd = async (adId: string) => {
    setError(null);
    try {
      await advertisementsApi.delete(adId);
      await loadAds();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete advertisement");
    }
  };

  if (!authReady) {
    return <div className="p-6 text-sm text-[var(--color-text-secondary)]">Checking session...</div>;
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Advertisements"
        subtitle="Upload images/videos to R2 and publish campaigns to display loops."
        action={
          <SecondaryButton onClick={() => void loadAds()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </SecondaryButton>
        }
      />

      <Panel>
        <h2 className="mb-4 text-lg font-semibold">New Advertisement</h2>
        <form onSubmit={submitCreateAd} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <TextInput
            placeholder="Ad Name"
            value={form.adName}
            onChange={(e) => setForm((prev) => ({ ...prev, adName: e.target.value }))}
          />
          <TextInput
            type="number"
            placeholder="Duration (seconds)"
            value={form.duration}
            onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
          />

          <TextInput
            className="md:col-span-2"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="md:col-span-2 rounded-xl border border-dashed border-[var(--color-border-strong)] bg-white p-4">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-[var(--color-text-secondary)]"
            />
            {file ? (
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                Selected: {file.name} ({formatFileSize(file.size)})
              </p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <PrimaryButton type="submit" disabled={submitting}>
              <UploadCloud className="mr-2 h-4 w-4" />
              {submitting ? "Uploading..." : "Upload to R2 and Create Ad"}
            </PrimaryButton>
          </div>
        </form>

        {error ? <p className="mt-3 text-sm text-[#8a2a2a]">{error}</p> : null}
      </Panel>

      <Panel>
        <h2 className="mb-4 text-lg font-semibold">All Advertisements</h2>
        {loading ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
            Loading advertisements...
          </div>
        ) : ads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
            No advertisements uploaded yet.
          </div>
        ) : (
          <DataTable headers={["Name", "Type", "Status", "Duration", "Created", "Actions"]}>
            {ads.map((ad) => (
              <tr key={ad.id} className="bg-white">
                <td className="px-4 py-3">
                  <div className="font-medium">{ad.adName}</div>
                  <a
                    href={ad.mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[var(--color-primary)] hover:underline"
                  >
                    Open media
                  </a>
                </td>
                <td className="px-4 py-3 capitalize text-[var(--color-text-secondary)]">{ad.mediaType}</td>
                <td className="px-4 py-3">
                  <StatusPill label={ad.status} tone={ad.status === "active" ? "success" : "neutral"} />
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{ad.duration}s</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{formatDateTime(ad.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <SecondaryButton className="px-3 py-1.5" onClick={() => void toggleAdStatus(ad)}>
                      {ad.status === "active" ? "Deactivate" : "Activate"}
                    </SecondaryButton>
                    <SecondaryButton
                      className="border-[#e6c1bc] bg-[#f9e3df] text-[#8a2a2a] hover:bg-[#f4d3cd]"
                      onClick={() => void deleteAd(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </SecondaryButton>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
