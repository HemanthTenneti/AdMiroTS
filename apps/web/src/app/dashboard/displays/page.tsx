"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2, Wifi } from "lucide-react";
import { z } from "zod";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import { displaysApi } from "@/lib/api/displays.api";
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

const CreateDisplayFormSchema = z.object({
  displayId: z.string().min(1, "Display ID is required"),
  location: z.string().min(1, "Location is required"),
  layout: z.enum(["landscape", "portrait"]),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  serialNumber: z.string().optional(),
});

interface CreateDisplayFormState {
  displayId: string;
  location: string;
  layout: "landscape" | "portrait";
  width: string;
  height: string;
  serialNumber: string;
}

const initialForm: CreateDisplayFormState = {
  displayId: "",
  location: "",
  layout: "landscape",
  width: "1920",
  height: "1080",
  serialNumber: "",
};

export default function DisplaysPage() {
  const { authReady } = useDashboardAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateDisplayFormState>(initialForm);
  const [displays, setDisplays] = useState<any[]>([]);

  const loadDisplays = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await displaysApi.list({ page: 1, limit: 50 });
      setDisplays(response.data.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load displays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    void loadDisplays();
  }, [authReady]);

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = CreateDisplayFormSchema.safeParse({
      displayId: form.displayId,
      location: form.location,
      layout: form.layout,
      width: Number(form.width),
      height: Number(form.height),
      serialNumber: form.serialNumber || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form values");
      return;
    }

    setSubmitting(true);
    try {
      const createPayload: {
        displayId: string;
        location: string;
        layout: "landscape" | "portrait";
        resolution: { width: number; height: number };
        serialNumber?: string;
      } = {
        displayId: parsed.data.displayId,
        location: parsed.data.location,
        layout: parsed.data.layout,
        resolution: { width: parsed.data.width, height: parsed.data.height },
      };

      if (parsed.data.serialNumber) {
        createPayload.serialNumber = parsed.data.serialNumber;
      }

      await displaysApi.create(createPayload);
      setForm(initialForm);
      await loadDisplays();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create display");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    setError(null);
    try {
      await displaysApi.delete(id);
      await loadDisplays();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete display");
    }
  };

  const onPing = async (id: string) => {
    setError(null);
    try {
      await displaysApi.ping(id);
      await loadDisplays();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ping display");
    }
  };

  if (!authReady) {
    return <div className="p-6 text-sm text-[var(--color-text-secondary)]">Checking session...</div>;
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Displays"
        subtitle="Provision displays, monitor status, and control connected screens."
        action={
          <SecondaryButton onClick={() => void loadDisplays()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </SecondaryButton>
        }
      />

      <Panel>
        <h2 className="mb-4 text-lg font-semibold">Create Display</h2>
        <form onSubmit={submitCreate} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <TextInput
            placeholder="Display ID"
            value={form.displayId}
            onChange={(e) => setForm((prev) => ({ ...prev, displayId: e.target.value }))}
          />
          <TextInput
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
          />
          <SelectInput
            value={form.layout}
            onChange={(e) => setForm((prev) => ({ ...prev, layout: e.target.value as "landscape" | "portrait" }))}
          >
            <option value="landscape">Landscape</option>
            <option value="portrait">Portrait</option>
          </SelectInput>
          <TextInput
            type="number"
            placeholder="Width"
            value={form.width}
            onChange={(e) => setForm((prev) => ({ ...prev, width: e.target.value }))}
          />
          <TextInput
            type="number"
            placeholder="Height"
            value={form.height}
            onChange={(e) => setForm((prev) => ({ ...prev, height: e.target.value }))}
          />
          <TextInput
            placeholder="Serial Number (optional)"
            value={form.serialNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, serialNumber: e.target.value }))}
          />
          <div className="md:col-span-3">
            <PrimaryButton type="submit" disabled={submitting}>
              <Plus className="mr-2 h-4 w-4" /> {submitting ? "Creating..." : "Create Display"}
            </PrimaryButton>
          </div>
        </form>
        {error ? <p className="mt-3 text-sm text-[#8a2a2a]">{error}</p> : null}
      </Panel>

      <Panel>
        <h2 className="mb-4 text-lg font-semibold">All Displays</h2>
        {loading ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
            Loading displays...
          </div>
        ) : displays.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
            No displays yet.
          </div>
        ) : (
          <DataTable headers={["Display", "Location", "Status", "Last Seen", "Actions"]}>
            {displays.map((display) => (
              <tr key={display.id} className="bg-white">
                <td className="px-4 py-3">
                  <div className="font-medium">{display.displayId}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{display.displayName ?? "Unnamed"}</div>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{display.location}</td>
                <td className="px-4 py-3">
                  <StatusPill
                    label={display.status}
                    tone={display.status === "online" ? "success" : display.status === "pending" ? "warning" : "neutral"}
                  />
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {display.lastSeen ? formatDateTime(display.lastSeen) : "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <SecondaryButton className="px-3 py-1.5" onClick={() => void onPing(display.id)}>
                      <Wifi className="h-4 w-4" />
                    </SecondaryButton>
                    <SecondaryButton
                      className="border-[#e6c1bc] bg-[#f9e3df] text-[#8a2a2a] hover:bg-[#f4d3cd]"
                      onClick={() => void onDelete(display.id)}
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
