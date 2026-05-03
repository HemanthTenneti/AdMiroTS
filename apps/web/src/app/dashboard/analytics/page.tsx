"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { analyticsApi } from "@/lib/api/analytics.api";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import {
  DataTable,
  PageTitle,
  Panel,
  SecondaryButton,
  StatusPill,
} from "@/components/dashboard/ui";

export default function AnalyticsPage() {
  const { authReady } = useDashboardAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState({
    totalViews: 0,
    totalClicks: 0,
    activeDisplays: 0,
    activeAds: 0,
  });
  const [timeline, setTimeline] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const ctr = useMemo(() => {
    if (overview.totalViews <= 0) return 0;
    return (overview.totalClicks / overview.totalViews) * 100;
  }, [overview.totalClicks, overview.totalViews]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, timelineRes, listRes] = await Promise.all([
        analyticsApi.overview(),
        analyticsApi.timeline({ interval: "day" }),
        analyticsApi.list({ page: 1, limit: 50 }),
      ]);

      setOverview(overviewRes.data.data);
      setTimeline(timelineRes.data.data);
      setEvents(listRes.data.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    void loadAnalytics();
  }, [authReady]);

  if (!authReady) {
    return <div className="p-6 text-sm text-[var(--color-text-secondary)]">Checking session...</div>;
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Analytics"
        subtitle="Track impression volume, click engagement, and playback performance over time."
        action={
          <SecondaryButton onClick={() => void loadAnalytics()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </SecondaryButton>
        }
      />

      {error ? <p className="text-sm text-[#8a2a2a]">{error}</p> : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Panel>
          <div className="text-xs uppercase text-[var(--color-text-muted)]">Total Views</div>
          <div className="mt-2 text-3xl font-semibold">{loading ? "..." : overview.totalViews}</div>
        </Panel>
        <Panel>
          <div className="text-xs uppercase text-[var(--color-text-muted)]">Total Clicks</div>
          <div className="mt-2 text-3xl font-semibold">{loading ? "..." : overview.totalClicks}</div>
        </Panel>
        <Panel>
          <div className="text-xs uppercase text-[var(--color-text-muted)]">Active Displays</div>
          <div className="mt-2 text-3xl font-semibold">{loading ? "..." : overview.activeDisplays}</div>
        </Panel>
        <Panel>
          <div className="text-xs uppercase text-[var(--color-text-muted)]">Active Ads</div>
          <div className="mt-2 text-3xl font-semibold">{loading ? "..." : overview.activeAds}</div>
        </Panel>
        <Panel>
          <div className="text-xs uppercase text-[var(--color-text-muted)]">CTR</div>
          <div className="mt-2 text-3xl font-semibold">{loading ? "..." : `${ctr.toFixed(2)}%`}</div>
        </Panel>
      </section>

      <Panel>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold">Timeline</h2>
        </div>
        {timeline.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
            No timeline records yet.
          </div>
        ) : (
          <DataTable headers={["Bucket", "Impressions", "Clicks", "Completed", "Partial"]}>
            {timeline.map((bucket, idx) => (
              <tr key={`${bucket.label ?? bucket.timestamp ?? idx}`} className="bg-white">
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{bucket.label ?? bucket.timestamp ?? "-"}</td>
                <td className="px-4 py-3">{bucket.impressions ?? 0}</td>
                <td className="px-4 py-3">{bucket.clicks ?? 0}</td>
                <td className="px-4 py-3">{bucket.completedViews ?? 0}</td>
                <td className="px-4 py-3">{bucket.partialViews ?? 0}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>

      <Panel>
        <h2 className="mb-4 text-lg font-semibold">Recent Analytics Events</h2>
        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
            No event records yet.
          </div>
        ) : (
          <DataTable headers={["Display", "Ad", "Impressions", "Completed", "Status"]}>
            {events.map((event) => (
              <tr key={event.id} className="bg-white">
                <td className="px-4 py-3 font-mono text-xs">{event.displayId}</td>
                <td className="px-4 py-3 font-mono text-xs">{event.adId}</td>
                <td className="px-4 py-3">{event.impressions}</td>
                <td className="px-4 py-3">{event.completedViews}</td>
                <td className="px-4 py-3">
                  <StatusPill label="recorded" tone="success" />
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
