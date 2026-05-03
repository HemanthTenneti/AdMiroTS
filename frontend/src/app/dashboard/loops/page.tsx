"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  AddLoopAdvertisementPayloadSchema,
  CreateDisplayLoopPayloadSchema,
} from "@/lib/contracts";
import DashboardLayout from "@/components/DashboardLayout";
import { advertisementsApi } from "@/lib/api/advertisements.api";
import { displayLoopsApi } from "@/lib/api/display-loops.api";
import { displaysApi } from "@/lib/api/displays.api";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import {
  DataTable,
  PageTitle,
  Panel,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  StatusPill,
  TextInput,
} from "@/components/dashboard/ui";
import { formatDateTime } from "@/lib/utils";

export default function LoopsPage() {
  const { authReady } = useDashboardAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loops, setLoops] = useState<any[]>([]);
  const [displays, setDisplays] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);

  const [loopForm, setLoopForm] = useState({
    loopName: "",
    displayId: "",
    rotationType: "sequential",
    displayLayout: "fullscreen",
    description: "",
  });

  const [adForm, setAdForm] = useState({
    loopId: "",
    advertisementId: "",
    duration: "15",
    order: "0",
  });
  const [displayAssignment, setDisplayAssignment] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [loopsRes, displaysRes, adsRes] = await Promise.all([
        displayLoopsApi.list({ page: 1, limit: 100 }),
        displaysApi.list({ page: 1, limit: 100 }),
        advertisementsApi.list({ page: 1, limit: 100 }),
      ]);

      setLoops(loopsRes.data.data.data);
      setDisplays(displaysRes.data.data.data);
      setAds(adsRes.data.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load loops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    void loadData();
  }, [authReady]);

  const submitLoop = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = CreateDisplayLoopPayloadSchema.safeParse({
      loopName: loopForm.loopName,
      displayId: loopForm.displayId || undefined,
      rotationType: loopForm.rotationType,
      displayLayout: loopForm.displayLayout,
      description: loopForm.description || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid loop form");
      return;
    }

    setSubmitting(true);
    try {
      await displayLoopsApi.create(parsed.data);
      setLoopForm({
        loopName: "",
        displayId: "",
        rotationType: "sequential",
        displayLayout: "fullscreen",
        description: "",
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create loop");
    } finally {
      setSubmitting(false);
    }
  };

  const submitAddAd = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = AddLoopAdvertisementPayloadSchema.safeParse({
      advertisementId: adForm.advertisementId,
      duration: Number(adForm.duration),
      order: Number(adForm.order),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid ad assignment form");
      return;
    }

    if (!adForm.loopId) {
      setError("Loop ID is required for assignment");
      return;
    }

    setSubmitting(true);
    try {
      await displayLoopsApi.addAdvertisement(adForm.loopId, parsed.data);
      setAdForm({ loopId: "", advertisementId: "", duration: "15", order: "0" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign advertisement");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteLoop = async (id: string) => {
    setError(null);
    try {
      await displayLoopsApi.delete(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete loop");
    }
  };

  const addLoopToDisplay = async (loopId: string) => {
    const displayId = displayAssignment[loopId];
    if (!displayId) {
      setError("Please select a display to assign.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await displayLoopsApi.addDisplay(loopId, { displayId });
      setDisplayAssignment((prev) => ({ ...prev, [loopId]: "" }));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign display");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authReady) {
    return <div className="p-6 text-sm text-[var(--ds-text-2)]">Checking session...</div>;
  }

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <PageTitle
        title="Display Loops"
        subtitle="Create ad playback playlists and assign ads with explicit order and duration."
        action={
          <SecondaryButton onClick={() => void loadData()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </SecondaryButton>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-lg font-semibold">Create Loop</h2>
          <form onSubmit={submitLoop} className="space-y-3">
            <TextInput
              placeholder="Loop name"
              value={loopForm.loopName}
              onChange={(e) => setLoopForm((prev) => ({ ...prev, loopName: e.target.value }))}
            />
            <SelectInput
              value={loopForm.displayId}
              onChange={(e) => setLoopForm((prev) => ({ ...prev, displayId: e.target.value }))}
            >
              <option value="">Initial display (optional)</option>
              {displays.map((display) => (
                <option key={display.id} value={display.id}>
                  {display.displayId} - {display.location}
                </option>
              ))}
            </SelectInput>
            <div className="grid grid-cols-2 gap-3">
              <SelectInput
                value={loopForm.rotationType}
                onChange={(e) => setLoopForm((prev) => ({ ...prev, rotationType: e.target.value }))}
              >
                <option value="sequential">Sequential</option>
                <option value="random">Random</option>
                <option value="weighted">Weighted</option>
              </SelectInput>
              <SelectInput
                value={loopForm.displayLayout}
                onChange={(e) => setLoopForm((prev) => ({ ...prev, displayLayout: e.target.value }))}
              >
                <option value="fullscreen">Fullscreen</option>
                <option value="masonry">Masonry</option>
              </SelectInput>
            </div>
            <TextInput
              placeholder="Description (optional)"
              value={loopForm.description}
              onChange={(e) => setLoopForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <PrimaryButton type="submit" disabled={submitting}>
              <Plus className="mr-2 h-4 w-4" /> Create Loop
            </PrimaryButton>
          </form>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-lg font-semibold">Assign Advertisement to Loop</h2>
          <form onSubmit={submitAddAd} className="space-y-3">
            <SelectInput
              value={adForm.loopId}
              onChange={(e) => setAdForm((prev) => ({ ...prev, loopId: e.target.value }))}
            >
              <option value="">Select loop</option>
              {loops.map((loop) => (
                <option key={loop.id} value={loop.id}>
                  {loop.loopName}
                </option>
              ))}
            </SelectInput>

            <SelectInput
              value={adForm.advertisementId}
              onChange={(e) => setAdForm((prev) => ({ ...prev, advertisementId: e.target.value }))}
            >
              <option value="">Select advertisement</option>
              {ads.map((ad) => (
                <option key={ad.id} value={ad.id}>
                  {ad.adName}
                </option>
              ))}
            </SelectInput>

            <div className="grid grid-cols-2 gap-3">
              <TextInput
                type="number"
                placeholder="Duration"
                value={adForm.duration}
                onChange={(e) => setAdForm((prev) => ({ ...prev, duration: e.target.value }))}
              />
              <TextInput
                type="number"
                placeholder="Order"
                value={adForm.order}
                onChange={(e) => setAdForm((prev) => ({ ...prev, order: e.target.value }))}
              />
            </div>

            <PrimaryButton type="submit" disabled={submitting}>
              <Plus className="mr-2 h-4 w-4" /> Assign Ad
            </PrimaryButton>
          </form>
        </Panel>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Panel>
        <h2 className="mb-4 text-lg font-semibold">Existing Loops</h2>
        {loading ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--ds-input)] p-8 text-center text-sm text-[var(--ds-text-2)]">
            Loading loops...
          </div>
        ) : loops.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--ds-input)] p-8 text-center text-sm text-[var(--ds-text-2)]">
            No loops found.
          </div>
        ) : (
          <DataTable headers={["Loop", "Displays", "Rotation", "Layout", "Ads", "Updated", "Actions"]}>
            {loops.map((loop) => {
              const assignedDisplayIds =
                (loop.displayIds?.length ?? 0) > 0
                  ? loop.displayIds
                  : loop.displayId
                    ? [loop.displayId]
                    : [];

              return (
              <tr key={loop.id} className="hover:bg-[var(--ds-hover)]">
                <td className="px-4 py-3">
                  <div className="font-medium">{loop.loopName}</div>
                  <div className="text-xs text-[var(--ds-text-2)]">{loop.loopId}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-2">
                    <div className="text-xs text-[var(--ds-text-2)]">
                      {assignedDisplayIds.length > 0
                        ? `${assignedDisplayIds.length} assigned`
                        : "Unassigned"}
                    </div>
                    <div className="max-h-16 overflow-auto space-y-1">
                      {assignedDisplayIds.map((id: string) => (
                        <div key={id} className="font-mono text-[11px] text-[var(--ds-text-2)]">
                          {id}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <SelectInput
                        value={displayAssignment[loop.id] ?? ""}
                        onChange={(e) =>
                          setDisplayAssignment((prev) => ({
                            ...prev,
                            [loop.id]: e.target.value,
                          }))
                        }
                      >
                        <option value="">Add to display</option>
                        {displays
                          .filter((display) => !assignedDisplayIds.includes(display.id))
                          .map((display) => (
                            <option key={display.id} value={display.id}>
                              {display.displayId} - {display.location}
                            </option>
                          ))}
                      </SelectInput>
                      <SecondaryButton onClick={() => void addLoopToDisplay(loop.id)} disabled={submitting}>
                        Add
                      </SecondaryButton>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-[var(--ds-text-2)]">{loop.rotationType}</td>
                <td className="px-4 py-3">
                  <StatusPill label={loop.displayLayout} tone="info" />
                </td>
                <td className="px-4 py-3 text-[var(--ds-text-2)]">{loop.advertisements?.length ?? 0}</td>
                <td className="px-4 py-3 text-[var(--ds-text-2)]">{formatDateTime(loop.updatedAt)}</td>
                <td className="px-4 py-3">
                  <SecondaryButton
                    className="border-red-500/20 bg-red-500/15 text-red-400 hover:bg-red-500/25"
                    onClick={() => void deleteLoop(loop.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </SecondaryButton>
                </td>
              </tr>
              );
            })}
          </DataTable>
        )}
      </Panel>
    </div>
    </DashboardLayout>
  );
}
