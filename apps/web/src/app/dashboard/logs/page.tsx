"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { RecordSystemLogPayloadSchema } from "@admiro/shared";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import { systemLogsApi } from "@/lib/api/system-logs.api";
import {
  DataTable,
  PageTitle,
  Panel,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  StatusPill,
  TextArea,
  TextInput,
} from "@/components/dashboard/ui";
import { formatDateTime } from "@/lib/utils";

export default function LogsPage() {
  const { authReady } = useDashboardAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const [form, setForm] = useState({
    action: "other",
    entityType: "system",
    entityId: "dashboard",
    description: "",
  });

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await systemLogsApi.list({ page: 1, limit: 100 });
      setLogs(response.data.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    void loadLogs();
  }, [authReady]);

  const submitLog = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = RecordSystemLogPayloadSchema.safeParse({
      action: form.action,
      entityType: form.entityType,
      entityId: form.entityId,
      description: form.description,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid log payload");
      return;
    }

    setSubmitting(true);
    try {
      await systemLogsApi.record(parsed.data);
      setForm((prev) => ({ ...prev, description: "" }));
      await loadLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record log");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authReady) {
    return <div className="p-6 text-sm text-[var(--color-text-secondary)]">Checking session...</div>;
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="System Logs"
        subtitle="Audit trail for operational changes across displays, loops, ads, and users."
        action={
          <SecondaryButton onClick={() => void loadLogs()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </SecondaryButton>
        }
      />

      <Panel>
        <h2 className="mb-4 text-lg font-semibold">Record Manual Log Entry</h2>
        <form onSubmit={submitLog} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <SelectInput value={form.action} onChange={(e) => setForm((prev) => ({ ...prev, action: e.target.value }))}>
              <option value="create">create</option>
              <option value="update">update</option>
              <option value="delete">delete</option>
              <option value="status_change">status_change</option>
              <option value="approve">approve</option>
              <option value="reject">reject</option>
              <option value="other">other</option>
            </SelectInput>
            <SelectInput
              value={form.entityType}
              onChange={(e) => setForm((prev) => ({ ...prev, entityType: e.target.value }))}
            >
              <option value="display">display</option>
              <option value="advertisement">advertisement</option>
              <option value="loop">loop</option>
              <option value="user">user</option>
              <option value="system">system</option>
            </SelectInput>
            <TextInput
              placeholder="Entity ID"
              value={form.entityId}
              onChange={(e) => setForm((prev) => ({ ...prev, entityId: e.target.value }))}
            />
          </div>
          <TextArea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Recording..." : "Record Log"}
          </PrimaryButton>
        </form>
        {error ? <p className="mt-3 text-sm text-[#8a2a2a]">{error}</p> : null}
      </Panel>

      <Panel>
        <h2 className="mb-4 text-lg font-semibold">Recent Logs</h2>
        {loading ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
            No logs recorded yet.
          </div>
        ) : (
          <DataTable headers={["Action", "Entity", "ID", "Description", "Time"]}>
            {logs.map((log) => (
              <tr key={log.id} className="bg-white">
                <td className="px-4 py-3">
                  <StatusPill label={log.action} tone="info" />
                </td>
                <td className="px-4 py-3 capitalize text-[var(--color-text-secondary)]">{log.entityType}</td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-muted)]">{log.entityId}</td>
                <td className="px-4 py-3 text-[var(--color-text)]">{log.description}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{formatDateTime(log.createdAt)}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
