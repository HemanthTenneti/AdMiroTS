"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Monitor,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Eye,
  MousePointerClick,
  BarChart3,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import client from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type DisplayStatus = "online" | "offline" | "inactive";
type AdStatus = "active" | "paused" | "expired";
type MediaType = "image" | "video" | string;

interface DisplayRecord {
  _id: string;
  displayName: string;
  location: string;
  status: DisplayStatus;
  resolution: string;
  lastSeen: string | null;
}

interface AdRecord {
  _id: string;
  adName: string;
  mediaType: MediaType;
  status: AdStatus;
  duration: number;
  impressions: number;
  views: number;
  clicks: number;
}

interface DisplaysSummary {
  totalDisplays: number;
  onlineCount: number;
  offlineCount: number;
  inactiveCount: number;
  displays: DisplayRecord[];
}

interface AdsSummary {
  totalAds: number;
  activeAds: number;
  pausedAds: number;
  expiredAds: number;
  totalImpressions: number;
  ads: AdRecord[];
}

type ActiveTab = "displays" | "ads";

// ─── Custom Hook ──────────────────────────────────────────────────────────────

function useAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("displays");
  const [displaysData, setDisplaysData] = useState<DisplaysSummary | null>(null);
  const [adsData, setAdsData] = useState<AdsSummary | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [displaysRes, adsRes] = await Promise.all([
        client.get<{ data: DisplaysSummary }>("/api/analytics/displays-summary"),
        client.get<{ data: AdsSummary }>("/api/analytics/ads-summary"),
      ]);
      setDisplaysData(displaysRes.data.data);
      setAdsData(adsRes.data.data);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchAnalytics();
  }, [router, fetchAnalytics]);

  return { loading, activeTab, setActiveTab, displaysData, adsData };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}

function StatCard({ label, value, icon, accent = "bg-[#7E3AF0]/15" }: StatCardProps) {
  return (
    <div className="bg-[#111118] border border-white/8 rounded-xl p-5 flex items-start gap-4">
      <div className={`${accent} rounded-lg p-2 shrink-0`}>{icon}</div>
      <div>
        <p className="text-white/50 text-sm mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

interface BarVizProps {
  value: number;
  max: number;
  color?: string;
}

function BarViz({ value, max, color = "bg-[#7E3AF0]" }: BarVizProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-white/40 text-xs w-8 text-right">{pct}%</span>
    </div>
  );
}

function DisplayStatusBadge({ status }: { status: DisplayStatus }) {
  const map: Record<DisplayStatus, { cls: string; icon: React.ReactNode }> = {
    online: {
      cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
      icon: <CheckCircle2 size={12} />,
    },
    offline: {
      cls: "bg-red-500/15 text-red-400 border border-red-500/20",
      icon: <XCircle size={12} />,
    },
    inactive: {
      cls: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
      icon: <Clock size={12} />,
    },
  };
  const { cls, icon } = map[status] ?? map.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {icon}
      {capitalize(status)}
    </span>
  );
}

function AdStatusBadge({ status }: { status: AdStatus }) {
  const map: Record<AdStatus, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    paused: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    expired: "bg-red-500/15 text-red-400 border border-red-500/20",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? map.expired}`}>
      {capitalize(status)}
    </span>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function DisplaysPanel({ data }: { data: DisplaysSummary }) {
  const maxLastSeen = data.displays.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Displays"
          value={data.totalDisplays}
          icon={<Monitor size={18} className="text-[#7E3AF0]" />}
        />
        <StatCard
          label="Online"
          value={data.onlineCount}
          icon={<CheckCircle2 size={18} className="text-emerald-400" />}
          accent="bg-emerald-500/15"
        />
        <StatCard
          label="Offline"
          value={data.offlineCount}
          icon={<XCircle size={18} className="text-red-400" />}
          accent="bg-red-500/15"
        />
        <StatCard
          label="Inactive"
          value={data.inactiveCount}
          icon={<Clock size={18} className="text-amber-400" />}
          accent="bg-amber-500/15"
        />
      </div>

      {/* Status distribution bar visualization */}
      {data.totalDisplays > 0 && (
        <div className="bg-[#111118] border border-white/8 rounded-xl p-5">
          <p className="text-white font-semibold mb-4 text-sm">Status Distribution</p>
          <div className="space-y-3">
            {[
              { label: "Online", value: data.onlineCount, color: "bg-emerald-500" },
              { label: "Offline", value: data.offlineCount, color: "bg-red-500" },
              { label: "Inactive", value: data.inactiveCount, color: "bg-amber-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-white/50 text-xs w-14 shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full`}
                    style={{ width: `${data.totalDisplays > 0 ? (value / data.totalDisplays) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-white/40 text-xs w-6 text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#111118] border border-white/8 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/8">
                {["Display Name", "Location", "Status", "Resolution", "Last Seen"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-white/50 text-xs uppercase tracking-wide font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.displays.map((display) => (
                <tr
                  key={display._id}
                  className="border-b border-white/5 hover:bg-white/[0.03] text-white"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{display.displayName}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-white/60 text-sm">{display.location}</p>
                  </td>
                  <td className="px-5 py-4">
                    <DisplayStatusBadge status={display.status} />
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-white/60 text-sm font-mono">{display.resolution}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-white/40 text-xs">{formatDate(display.lastSeen)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.displays.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <Monitor size={32} className="text-white/20" />
            </div>
            <p className="text-white/30 text-sm">No displays found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdsPanel({ data }: { data: AdsSummary }) {
  const maxImpressions = Math.max(...data.ads.map((a) => a.impressions), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total Ads"
          value={data.totalAds}
          icon={<ImageIcon size={18} className="text-[#7E3AF0]" />}
        />
        <StatCard
          label="Active"
          value={data.activeAds}
          icon={<CheckCircle2 size={18} className="text-emerald-400" />}
          accent="bg-emerald-500/15"
        />
        <StatCard
          label="Paused"
          value={data.pausedAds}
          icon={<Clock size={18} className="text-amber-400" />}
          accent="bg-amber-500/15"
        />
        <StatCard
          label="Expired"
          value={data.expiredAds}
          icon={<XCircle size={18} className="text-red-400" />}
          accent="bg-red-500/15"
        />
        <StatCard
          label="Total Impressions"
          value={data.totalImpressions}
          icon={<TrendingUp size={18} className="text-[#7E3AF0]" />}
        />
      </div>

      <div className="bg-[#111118] border border-white/8 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/8">
                {["Ad Name", "Type", "Status", "Duration", "Impressions", "Views", "Clicks"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-white/50 text-xs uppercase tracking-wide font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.ads.map((ad) => (
                <tr
                  key={ad._id}
                  className="border-b border-white/5 hover:bg-white/[0.03] text-white"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{ad.adName}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-white/8 text-white/60">
                      {capitalize(ad.mediaType)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <AdStatusBadge status={ad.status} />
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-white/60 text-sm">{ad.duration}s</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-white text-sm">{ad.impressions.toLocaleString()}</p>
                      <BarViz value={ad.impressions} max={maxImpressions} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Eye size={13} className="text-white/30" />
                      <p className="font-semibold text-white text-sm">{ad.views.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <MousePointerClick size={13} className="text-white/30" />
                      <p className="font-semibold text-white text-sm">{ad.clicks.toLocaleString()}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.ads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <ImageIcon size={32} className="text-white/20" />
            </div>
            <p className="text-white/30 text-sm">No advertisements found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: "displays", label: "Displays", icon: <Monitor size={16} /> },
  { id: "ads", label: "Advertisements", icon: <BarChart3 size={16} /> },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const { loading, activeTab, setActiveTab, displaysData, adsData } = useAnalytics();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 size={40} className="text-[#7E3AF0] animate-spin mx-auto mb-3" />
            <p className="text-white/40 text-sm">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-1">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-medium mb-5"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-white/40 text-sm">Monitor your displays and advertisements performance</p>
        </div>

        {/* Tab pills */}
        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
                activeTab === tab.id
                  ? "bg-[#7E3AF0] text-white"
                  : "bg-white/8 text-white/50 hover:bg-white/12"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "displays" && displaysData && <DisplaysPanel data={displaysData} />}
        {activeTab === "ads" && adsData && <AdsPanel data={adsData} />}
      </div>
    </DashboardLayout>
  );
}
