"use client";

import { useEffect, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
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

export default function ConnectionRequestsPage() {
  const { authReady } = useDashboardAuth();
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [requests, setRequests] = useState<any[]>([]);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await displaysApi.getConnectionRequests({ page: 1, limit: 50, status: statusFilter });
      setRequests(response.data.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    void loadRequests();
  }, [authReady, statusFilter]);

  const approve = async (requestId: string) => {
    setProcessingId(requestId);
    setError(null);
    try {
      await displaysApi.approveConnectionRequest(requestId);
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (requestId: string) => {
    setProcessingId(requestId);
    setError(null);
    try {
      await displaysApi.rejectConnectionRequest(requestId, {
        rejectionReason: rejectReason[requestId] || "Rejected by admin",
      });
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  if (!authReady) {
    return <div className="p-6 text-sm text-[var(--color-text-secondary)]">Checking session...</div>;
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Connection Requests"
        subtitle="Review pending display registration requests and assign approvals."
        action={
          <div className="flex items-center gap-2">
            <SelectInput
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "pending" | "approved" | "rejected")}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </SelectInput>
            <SecondaryButton onClick={() => void loadRequests()} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </SecondaryButton>
          </div>
        }
      />

      <Panel>
        {error ? <p className="mb-4 text-sm text-[#8a2a2a]">{error}</p> : null}
        {loading ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
            No requests found for selected status.
          </div>
        ) : (
          <DataTable headers={["Request", "Display", "Location", "Status", "Requested", "Actions"]}>
            {requests.map((request) => (
              <tr key={request.requestId} className="bg-white align-top">
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-muted)]">{request.requestId}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{request.displayId}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{request.displayName ?? "Unknown display"}</div>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{request.location ?? "-"}</td>
                <td className="px-4 py-3">
                  <StatusPill
                    label={request.status}
                    tone={request.status === "approved" ? "success" : request.status === "rejected" ? "danger" : "warning"}
                  />
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {request.requestedAt ? formatDateTime(request.requestedAt) : "-"}
                </td>
                <td className="px-4 py-3">
                  {request.status !== "pending" ? (
                    <span className="text-xs text-[var(--color-text-muted)]">No action</span>
                  ) : (
                    <div className="space-y-2">
                      <TextInput
                        placeholder="Rejection reason"
                        value={rejectReason[request.requestId] ?? ""}
                        onChange={(e) =>
                          setRejectReason((prev) => ({ ...prev, [request.requestId]: e.target.value }))
                        }
                      />
                      <div className="flex gap-2">
                        <PrimaryButton
                          className="px-3 py-1.5"
                          onClick={() => void approve(request.requestId)}
                          disabled={processingId === request.requestId}
                        >
                          <Check className="mr-1 h-4 w-4" /> Approve
                        </PrimaryButton>
                        <SecondaryButton
                          className="border-[#e6c1bc] bg-[#f9e3df] text-[#8a2a2a] hover:bg-[#f4d3cd]"
                          onClick={() => void reject(request.requestId)}
                          disabled={processingId === request.requestId}
                        >
                          <X className="mr-1 h-4 w-4" /> Reject
                        </SecondaryButton>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
