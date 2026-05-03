"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Monitor,
  FileImage,
  Eye,
  MousePointerClick,
  Plus,
  ArrowRight,
  PlaySquare,
  CalendarDays,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { displaysApi, type DisplayRecord } from "@/lib/api/displays.api";
import { advertisementsApi, type AdRecord } from "@/lib/api/advertisements.api";
import { analyticsApi } from "@/lib/api/analytics.api";
import { useAuthStore } from "@/features/auth/store/authStore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardStats {
  totalDisplays: number;
  activeAds: number;
  totalViews: number;
  totalClicks: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentDisplays: DisplayRecord[];
  recentAds: AdRecord[];
  loading: boolean;
  statsLoading: boolean;
}

// ---------------------------------------------------------------------------
// Custom hook — all data fetching isolated here
// ---------------------------------------------------------------------------

function useDashboardData(): DashboardData {
  const [stats, setStats] = useState<DashboardStats>({
    totalDisplays: 0,
    activeAds: 0,
    totalViews: 0,
    totalClicks: 0,
  });
  const [recentDisplays, setRecentDisplays] = useState<DisplayRecord[]>([]);
  const [recentAds, setRecentAds] = useState<AdRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const [displaysRes, adsRes, analyticsRes] = await Promise.allSettled([
          displaysApi.list({ limit: 5 }),
          advertisementsApi.list({ limit: 5 }),
          analyticsApi.overview(),
        ]);

        if (cancelled) return;

        // Displays
        if (displaysRes.status === "fulfilled") {
          const payload = displaysRes.value.data.data;
          setRecentDisplays(payload.data);
          setStats((prev) => ({
            ...prev,
            totalDisplays: payload.pagination.total,
          }));
        }

        // Ads
        if (adsRes.status === "fulfilled") {
          const payload = adsRes.value.data.data;
          setRecentAds(payload.data);
          setStats((prev) => ({
            ...prev,
            activeAds: payload.pagination.total,
          }));
        }

        // Analytics overview
        if (analyticsRes.status === "fulfilled") {
          const overview = analyticsRes.value.data.data;
          setStats((prev) => ({
            ...prev,
            totalViews: overview.totalViews,
            totalClicks: overview.totalClicks,
          }));
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
          setLoading(false);
        }
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, recentDisplays, recentAds, loading, statsLoading };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[var(--ds-hover)] rounded-xl ${className ?? ""}`}
    />
  );
}

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const upper = status.toUpperCase();

  let cls = "px-2 py-0.5 rounded-md text-xs font-medium ";
  if (upper === "ACTIVE") {
    cls += "bg-green-500/15 text-green-400";
  } else if (upper === "PENDING") {
    cls += "bg-yellow-500/15 text-yellow-400";
  } else {
    cls += "bg-[var(--ds-hover)] text-[var(--ds-text-2)]";
  }

  return <span className={cls}>{upper}</span>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface MetricCardProps {
  label: string;
  value: number;
  loading: boolean;
  Icon: React.ElementType;
}

function MetricCard({ label, value, loading, Icon }: MetricCardProps) {
  return (
    <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="bg-[#7E3AF0]/15 rounded-lg p-2">
          <Icon size={18} className="text-[#9F67FF]" />
        </div>
      </div>
      <div>
        <p className="text-[var(--ds-text-2)] text-sm mb-1">{label}</p>
        {loading ? (
          <SkeletonBlock className="h-8 w-20" />
        ) : (
          <p className="text-2xl font-bold text-[var(--ds-text)]">
            {value.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);
  const [authReady, setAuthReady] = useState(false);

  // Auth guard — stable selector prevents infinite re-render loop
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    hydrate();
    setAuthReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--ds-bg)]">
        <div className="w-10 h-10 rounded-full border-2 border-[#7E3AF0] border-t-transparent animate-spin" />
      </div>
    );
  }

  return <DashboardInner />;
}

// Separated so hooks only run after auth guard passes
function DashboardInner() {
  const store = useAuthStore();
  const { stats, recentDisplays, recentAds, loading, statsLoading } =
    useDashboardData();

  const firstName = store.user?.firstName ?? "User";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[var(--ds-bg)]">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

          {/* ----------------------------------------------------------------
              Welcome header
          ---------------------------------------------------------------- */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[var(--ds-text-2)] text-sm mb-1">Dashboard Overview</p>
              <h1 className="text-3xl font-bold text-[var(--ds-text)]">
                Welcome back, {firstName}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/displays/new"
                className="bg-[#7E3AF0] hover:bg-[#9F67FF] text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2"
              >
                <Plus size={15} />
                Add Display
              </Link>
              <Link
                href="/dashboard/ads/new"
                className="bg-[#7E3AF0] hover:bg-[#9F67FF] text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2"
              >
                <FileImage size={15} />
                Upload Ad
              </Link>
            </div>
          </div>

          {/* ----------------------------------------------------------------
              Metric cards
          ---------------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Displays"
              value={stats.totalDisplays}
              loading={statsLoading}
              Icon={Monitor}
            />
            <MetricCard
              label="Active Ads"
              value={stats.activeAds}
              loading={statsLoading}
              Icon={FileImage}
            />
            <MetricCard
              label="Total Views"
              value={stats.totalViews}
              loading={statsLoading}
              Icon={Eye}
            />
            <MetricCard
              label="Total Clicks"
              value={stats.totalClicks}
              loading={statsLoading}
              Icon={MousePointerClick}
            />
          </div>

          {/* ----------------------------------------------------------------
              Recent displays + Recent ads — two-column grid
          ---------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Displays */}
            <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[var(--ds-text)] font-semibold text-lg">
                  Recent Displays
                </h2>
                <Link
                  href="/dashboard/displays"
                  className="text-[var(--ds-text-2)] hover:text-[var(--ds-text)] text-sm flex items-center gap-1"
                >
                  View all
                  <ArrowRight size={13} />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonBlock key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : recentDisplays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="bg-[#7E3AF0]/10 rounded-full p-3">
                    <Monitor size={22} className="text-[var(--ds-text-3)]" />
                  </div>
                  <p className="text-[var(--ds-text-2)] text-sm">No displays yet</p>
                  <Link
                    href="/dashboard/displays/new"
                    className="bg-[#7E3AF0] hover:bg-[#9F67FF] text-white rounded-lg px-4 py-2 text-sm font-medium"
                  >
                    Add your first display
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--ds-border)]">
                  {recentDisplays.map((display) => (
                    <li
                      key={display.id}
                      className="flex items-center justify-between py-3 gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-[#7E3AF0]/15 rounded-lg p-1.5 shrink-0">
                          <Monitor size={14} className="text-[#9F67FF]" />
                        </div>
                        <span className="text-[var(--ds-text)] text-sm font-medium truncate">
                          {display.displayName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={display.status} />
                        <span className="text-[var(--ds-text-2)] text-xs flex items-center gap-1">
                          <CalendarDays size={11} />
                          {display.createdAt ? formatDate(display.createdAt) : "—"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Ads */}
            <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[var(--ds-text)] font-semibold text-lg">
                  Recent Ads
                </h2>
                <Link
                  href="/dashboard/ads"
                  className="text-[var(--ds-text-2)] hover:text-[var(--ds-text)] text-sm flex items-center gap-1"
                >
                  View all
                  <ArrowRight size={13} />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonBlock key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : recentAds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="bg-[#7E3AF0]/10 rounded-full p-3">
                    <FileImage size={22} className="text-[var(--ds-text-3)]" />
                  </div>
                  <p className="text-[var(--ds-text-2)] text-sm">No ads yet</p>
                  <Link
                    href="/dashboard/ads/new"
                    className="bg-[#7E3AF0] hover:bg-[#9F67FF] text-white rounded-lg px-4 py-2 text-sm font-medium"
                  >
                    Upload your first ad
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--ds-border)]">
                  {recentAds.map((ad) => (
                    <li
                      key={ad.id}
                      className="flex items-center justify-between py-3 gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-[#7E3AF0]/15 rounded-lg p-1.5 shrink-0">
                          <FileImage size={14} className="text-[#9F67FF]" />
                        </div>
                        <span className="text-[var(--ds-text)] text-sm font-medium truncate">
                          {ad.adName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[var(--ds-text-2)] text-xs font-mono bg-[var(--ds-input)] px-1.5 py-0.5 rounded">
                          {ad.mediaType}
                        </span>
                        <StatusBadge status={ad.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ----------------------------------------------------------------
              Quick actions
          ---------------------------------------------------------------- */}
          <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-5">
            <h2 className="text-[var(--ds-text)] font-semibold text-lg mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "Add Display",
                  href: "/dashboard/displays/new",
                  Icon: Monitor,
                },
                {
                  label: "Upload Ad",
                  href: "/dashboard/ads/new",
                  Icon: FileImage,
                },
                {
                  label: "Create Loop",
                  href: "/dashboard/loops",
                  Icon: PlaySquare,
                },
              ].map(({ label, href, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center justify-between bg-[var(--ds-hover)] hover:bg-[var(--ds-hover)] border border-[var(--ds-border)] rounded-xl px-4 py-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#7E3AF0]/15 rounded-lg p-2">
                      <Icon size={16} className="text-[#9F67FF]" />
                    </div>
                    <span className="text-[var(--ds-text)] text-sm font-medium">
                      {label}
                    </span>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-[var(--ds-text-3)] group-hover:text-[var(--ds-text-2)]"
                  />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
