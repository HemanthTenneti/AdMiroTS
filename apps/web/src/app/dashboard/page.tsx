"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, Clock3, Image, Monitor, Play } from "lucide-react";
import { advertisementsApi } from "@/lib/api/advertisements.api";
import { displaysApi } from "@/lib/api/displays.api";
import { displayLoopsApi } from "@/lib/api/display-loops.api";
import { systemLogsApi } from "@/lib/api/system-logs.api";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import { DataTable, PageTitle, Panel, StatusPill } from "@/components/dashboard/ui";
import { formatDateTime } from "@/lib/utils";

interface MetricCard {
  label: string;
  value: string;
  icon: React.ElementType;
  hint: string;
}

export default function DashboardPage() {
  const { authReady, user } = useDashboardAuth();
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(0);
  const [adCount, setAdCount] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!authReady) return;

    const load = async () => {
      setLoading(true);
      try {
        const [displays, ads, loops, logs] = await Promise.all([
          displaysApi.list({ page: 1, limit: 1 }),
          advertisementsApi.list({ page: 1, limit: 1 }),
          displayLoopsApi.list({ page: 1, limit: 1 }),
          systemLogsApi.list({ page: 1, limit: 5 }),
        ]);

        setDisplayCount(displays.data.data.pagination.total);
        setAdCount(ads.data.data.pagination.total);
        setLoopCount(loops.data.data.pagination.total);
        setRecentLogs(logs.data.data.data);
      } catch {
        // 401 redirects are handled by the Axios interceptor; avoid unhandled promise rejections.
        setRecentLogs([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [authReady]);

  const metrics = useMemo<MetricCard[]>(
    () => [
      {
        label: "Displays",
        value: String(displayCount),
        icon: Monitor,
        hint: "Connected and managed screens",
      },
      {
        label: "Advertisements",
        value: String(adCount),
        icon: Image,
        hint: "Media assets available for loops",
      },
      {
        label: "Display Loops",
        value: String(loopCount),
        icon: Play,
        hint: "Scheduled playback loops",
      },
      {
        label: "Recent Logs",
        value: String(recentLogs.length),
        icon: Clock3,
        hint: "Latest system activity records",
      },
    ],
    [adCount, displayCount, loopCount, recentLogs.length]
  );

  if (!authReady) {
    return <div className="p-6 text-sm text-[var(--color-text-secondary)]">Checking session...</div>;
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title={`Welcome${user?.firstName ? `, ${user.firstName}` : ""}`}
        subtitle="Control displays, approve devices, and publish campaigns from one place."
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, hint }) => (
          <Panel key={label}>
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-[var(--color-bg-secondary)] p-2.5">
                <Icon className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              {loading ? <span className="text-xs text-[var(--color-text-muted)]">syncing...</span> : null}
            </div>
            <div className="text-3xl font-semibold tracking-tight">{loading ? "..." : value}</div>
            <div className="mt-1 text-sm text-[var(--color-text-secondary)]">{label}</div>
            <div className="mt-2 text-xs text-[var(--color-text-muted)]">{hint}</div>
          </Panel>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Link
          href="/dashboard/displays"
          className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-primary)]"
        >
          <div className="mb-3 text-sm font-medium text-[var(--color-text-secondary)]">Devices</div>
          <div className="text-xl font-semibold">Manage Displays</div>
          <div className="mt-2 text-sm text-[var(--color-text-muted)]">Create displays, update config, and check live status.</div>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]">
            Open <ArrowRight className="h-4 w-4" />
          </div>
        </Link>

        <Link
          href="/dashboard/ads"
          className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-primary)]"
        >
          <div className="mb-3 text-sm font-medium text-[var(--color-text-secondary)]">Media</div>
          <div className="text-xl font-semibold">Upload Advertisements</div>
          <div className="mt-2 text-sm text-[var(--color-text-muted)]">Use signed R2 uploads and publish instantly.</div>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]">
            Open <ArrowRight className="h-4 w-4" />
          </div>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-primary)]"
        >
          <div className="mb-3 text-sm font-medium text-[var(--color-text-secondary)]">Insights</div>
          <div className="text-xl font-semibold">Review Analytics</div>
          <div className="mt-2 text-sm text-[var(--color-text-muted)]">Track delivery, impressions, and click-through trends.</div>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]">
            Open <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
      </section>

      <Panel>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent System Activity</h2>
          <Link
            href="/dashboard/logs"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            View all <BarChart3 className="h-4 w-4" />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
            No log records yet.
          </div>
        ) : (
          <DataTable headers={["Action", "Entity", "Description", "Time"]}>
            {recentLogs.map((log) => (
              <tr key={log.id} className="bg-white">
                <td className="px-4 py-3">
                  <StatusPill label={log.action} tone="info" />
                </td>
                <td className="px-4 py-3 capitalize text-[var(--color-text-secondary)]">{log.entityType}</td>
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
