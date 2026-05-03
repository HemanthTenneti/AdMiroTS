"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { systemLogsApi } from "@/lib/api/system-logs.api";

// ─── Types ────────────────────────────────────────────────────────────────────

type LogAction = "create" | "update" | "delete" | "status_change" | string;
type EntityType = "display" | "advertisement" | "loop" | "user" | "system" | string;

interface LogRecord {
  id: string;
  action: LogAction;
  entityType: EntityType;
  description?: string | undefined;
  userId?: string | undefined;
  createdAt: string;
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────

function useLogs() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;

  const [actionFilter, setActionFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
  }, [router]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await systemLogsApi.list({
        page: currentPage,
        limit: PAGE_SIZE,
        sortBy: "createdAt",
        sortOrder: "desc",
        ...(actionFilter ? { action: actionFilter } : {}),
        ...(entityTypeFilter ? { entityType: entityTypeFilter } : {}),
      });
      const data = response.data.data;
      setLogs(data.data ?? []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(Math.max(1, Math.ceil((data.pagination?.total ?? 0) / PAGE_SIZE)));
    } catch {
      setLogs([]);
      setTotal(0);
      setTotalPages(1);
      setError("System logs could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, actionFilter, entityTypeFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = useCallback(() => {
    setActiveSearchTerm(searchTerm);
    setCurrentPage(1);
  }, [searchTerm]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setActiveSearchTerm("");
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setActionFilter("");
    setEntityTypeFilter("");
    setSearchTerm("");
    setActiveSearchTerm("");
    setCurrentPage(1);
  }, []);

  return {
    logs,
    visibleLogs: activeSearchTerm
      ? logs.filter((log) => {
          const query = activeSearchTerm.toLowerCase();
          return [
            log.action,
            log.entityType,
            log.description,
            log.userId,
          ].some((value) => value?.toLowerCase().includes(query));
        })
      : logs,
    error,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    total,
    actionFilter,
    setActionFilter,
    entityTypeFilter,
    setEntityTypeFilter,
    searchTerm,
    setSearchTerm,
    activeSearchTerm,
    handleSearch,
    handleClearSearch,
    handleClearFilters,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getActionBadge(action: LogAction): string {
  switch (action) {
    case "create":
      return "bg-blue-500/15 text-blue-400 border border-blue-500/20";
    case "update":
      return "bg-orange-500/15 text-orange-400 border border-orange-500/20";
    case "delete":
      return "bg-red-500/15 text-red-400 border border-red-500/20";
    case "status_change":
      return "bg-[#7E3AF0]/20 text-[#9F67FF] border border-[#7E3AF0]/30";
    case "approve":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
    case "reject":
      return "bg-red-500/15 text-red-400 border border-red-500/20";
    default:
      return "bg-[var(--ds-hover)] text-[var(--ds-text-2)] border border-[var(--ds-border)]";
  }
}

function formatLogUser(userId?: string): string {
  return userId || "System";
}

function formatLogDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LogsPage() {
  const router = useRouter();
  const {
    logs,
    visibleLogs,
    error,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    total,
    actionFilter,
    setActionFilter,
    entityTypeFilter,
    setEntityTypeFilter,
    searchTerm,
    setSearchTerm,
    activeSearchTerm,
    handleSearch,
    handleClearSearch,
    handleClearFilters,
  } = useLogs();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-1">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[var(--ds-text-2)] hover:text-[var(--ds-text)] text-sm font-medium mb-5"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-[var(--ds-text)] mb-1">System Logs</h1>
          <p className="text-[var(--ds-text-2)] text-sm">View and manage system activity logs for all operations</p>
        </div>

        {/* Search + Filters */}
        <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-5 mb-6 space-y-5">
          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ds-text-3)]" />
            <input
              type="text"
              placeholder="Search logs by description, user, entity type, action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-32 py-2.5 bg-[var(--ds-input)] border border-[var(--ds-input-border)] text-[var(--ds-text)] placeholder:text-[var(--ds-text-3)] focus:border-[#7E3AF0] focus:outline-none rounded-lg text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="p-1.5 text-[var(--ds-text-3)] hover:text-[var(--ds-text-2)] hover:bg-[var(--ds-hover)] rounded-md"
                >
                  <X size={14} />
                </button>
              )}
              <button
                onClick={handleSearch}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white text-xs font-semibold rounded-md"
              >
                <Search size={13} />
                Search
              </button>
            </div>
          </div>

          {activeSearchTerm && (
            <p className="text-[var(--ds-text-2)] text-xs">
              Found <span className="text-[var(--ds-text)] font-semibold">{visibleLogs.length}</span> loaded-page log
              {visibleLogs.length !== 1 ? "s" : ""} for &ldquo;{activeSearchTerm}&rdquo;
            </p>
          )}

          {/* Filter row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[var(--ds-text-2)] text-xs uppercase tracking-wide mb-1.5">
                Action Type
              </label>
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); }}
                className="w-full bg-[var(--ds-input)] border border-[var(--ds-input-border)] text-[var(--ds-text)] focus:border-[#7E3AF0] focus:outline-none rounded-lg px-3 py-2 text-sm"
              >
                <option value="" className="bg-[var(--ds-card)]">All Actions</option>
                <option value="create" className="bg-[var(--ds-card)]">Create</option>
                <option value="update" className="bg-[var(--ds-card)]">Update</option>
                <option value="delete" className="bg-[var(--ds-card)]">Delete</option>
                <option value="status_change" className="bg-[var(--ds-card)]">Status Change</option>
                <option value="approve" className="bg-[var(--ds-card)]">Approve</option>
                <option value="reject" className="bg-[var(--ds-card)]">Reject</option>
                <option value="other" className="bg-[var(--ds-card)]">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--ds-text-2)] text-xs uppercase tracking-wide mb-1.5">
                Entity Type
              </label>
              <select
                value={entityTypeFilter}
                onChange={(e) => { setEntityTypeFilter(e.target.value); }}
                className="w-full bg-[var(--ds-input)] border border-[var(--ds-input-border)] text-[var(--ds-text)] focus:border-[#7E3AF0] focus:outline-none rounded-lg px-3 py-2 text-sm"
              >
                <option value="" className="bg-[var(--ds-card)]">All Types</option>
                <option value="display" className="bg-[var(--ds-card)]">Display</option>
                <option value="advertisement" className="bg-[var(--ds-card)]">Advertisement</option>
                <option value="loop" className="bg-[var(--ds-card)]">Loop</option>
                <option value="user" className="bg-[var(--ds-card)]">User</option>
                <option value="system" className="bg-[var(--ds-card)]">System</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--ds-input)] hover:bg-[var(--ds-hover)] border border-[var(--ds-input-border)] text-[var(--ds-text-2)] hover:text-[var(--ds-text)] text-sm font-medium rounded-lg"
              >
                <Filter size={14} />
                Clear All Filters
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--ds-border)]">
            <p className="text-[var(--ds-text-3)] text-xs">
              Showing <span className="text-[var(--ds-text-2)]">{logs.length}</span> of{" "}
              <span className="text-[var(--ds-text-2)]">{total}</span> total logs
            </p>
          </div>
        </div>

        {/* Logs table */}
        <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="text-[#7E3AF0] animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-red-500/10 rounded-xl p-4 mb-4">
                <Filter size={28} className="text-red-400" />
              </div>
              <p className="text-red-400 text-sm mb-1">{error}</p>
              <p className="text-[var(--ds-text-3)] text-xs">Check your connection and try again.</p>
            </div>
          ) : visibleLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-[var(--ds-input)] rounded-xl p-4 mb-4">
                <Filter size={28} className="text-[var(--ds-text-3)]" />
              </div>
              <p className="text-[var(--ds-text-3)] text-sm mb-1">No logs found</p>
              <p className="text-[var(--ds-text-3)] text-xs">
                {actionFilter || entityTypeFilter || activeSearchTerm
                  ? "Try adjusting your filters or search terms"
                  : "System activity will appear here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--ds-input)] border-b border-[var(--ds-border)]">
                    {["Action", "Entity Type", "Description", "User", "Date"].map((h, i) => (
                      <th
                        key={i}
                        className="px-5 py-3 text-left text-[var(--ds-text-2)] text-xs uppercase tracking-wide font-semibold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleLogs.map((log) => {
                    const { date, time } = formatLogDate(log.createdAt);
                    return (
                      <tr
                        key={log.id}
                        className="border-b border-[var(--ds-border)] hover:bg-[var(--ds-hover)] text-[var(--ds-text)]"
                      >
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getActionBadge(log.action)}`}
                          >
                            {log.action.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-[var(--ds-text)] capitalize">
                            {log.entityType}
                          </span>
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <p className="text-sm text-[var(--ds-text-2)] truncate">
                            {log.description || "N/A"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-[var(--ds-text)]">{formatLogUser(log.userId)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-[var(--ds-text-2)]">{date}</p>
                          <p className="text-xs text-[var(--ds-text-3)] mt-0.5">{time}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-[var(--ds-border)] flex items-center justify-between">
              <p className="text-[var(--ds-text-3)] text-xs">
                Page <span className="text-[var(--ds-text-2)]">{currentPage}</span> of{" "}
                <span className="text-[var(--ds-text-2)]">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ds-input)] hover:bg-[var(--ds-hover)] border border-[var(--ds-input-border)] text-[var(--ds-text-2)] text-xs font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ds-input)] hover:bg-[var(--ds-hover)] border border-[var(--ds-input-border)] text-[var(--ds-text-2)] text-xs font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
