"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Monitor, FileImage, PlaySquare, ScrollText, Plus, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { displaysApi } from "@/lib/api/displays.api";
import { advertisementsApi } from "@/lib/api/advertisements.api";
import { useAuthStore } from "@/features/auth/store/authStore";

interface StatCard {
  label: string;
  value: string;
  loading: boolean;
  bgColor: string;
  iconColor: string;
  Icon: React.ElementType;
}

interface QuickAction {
  label: string;
  href: string;
  Icon: React.ElementType;
}

export default function DashboardPage() {
  const router = useRouter();
  const store = useAuthStore();

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<{ firstName?: string } | null>(null);

  const [totalDisplays, setTotalDisplays] = useState(0);
  const [displaysLoading, setDisplaysLoading] = useState(true);

  const [totalAds, setTotalAds] = useState(0);
  const [adsLoading, setAdsLoading] = useState(true);

  // Loops API not yet implemented — hardcoded to 0
  const totalLoops = 0;
  const loopsLoading = false;

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }

    store.hydrate();
    setAuthLoading(false);
  }, [router, store]);

  // Fetch counts in parallel once auth is confirmed
  useEffect(() => {
    if (authLoading) return;

    const fetchDisplays = async () => {
      try {
        setDisplaysLoading(true);
        const res = await displaysApi.list({ limit: 1 });
        setTotalDisplays(res.data.data.pagination.total);
      } catch {
        setTotalDisplays(0);
      } finally {
        setDisplaysLoading(false);
      }
    };

    const fetchAds = async () => {
      try {
        setAdsLoading(true);
        const res = await advertisementsApi.list({ limit: 1 });
        setTotalAds(res.data.data.pagination.total);
      } catch {
        setTotalAds(0);
      } finally {
        setAdsLoading(false);
      }
    };

    fetchDisplays();
    fetchAds();
  }, [authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf9f7]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b6f47]" />
      </div>
    );
  }

  const firstName = store.user?.firstName ?? user?.firstName ?? "User";

  const stats: StatCard[] = [
    {
      label: "Total Displays",
      value: displaysLoading ? "..." : String(totalDisplays),
      loading: displaysLoading,
      bgColor: "#dbeafe",
      iconColor: "#3b82f6",
      Icon: Monitor,
    },
    {
      label: "Advertisements",
      value: adsLoading ? "..." : String(totalAds),
      loading: adsLoading,
      bgColor: "#e9d5ff",
      iconColor: "#a855f7",
      Icon: FileImage,
    },
    {
      label: "Display Loops",
      value: loopsLoading ? "..." : String(totalLoops),
      loading: loopsLoading,
      bgColor: "#fef3c7",
      iconColor: "#f59e0b",
      Icon: PlaySquare,
    },
    {
      label: "System Logs",
      value: "—",
      loading: false,
      bgColor: "#dcfce7",
      iconColor: "#22c55e",
      Icon: ScrollText,
    },
  ];

  const quickActions: QuickAction[] = [
    { label: "Add Display", href: "/dashboard/displays", Icon: Monitor },
    { label: "Upload Ad", href: "/dashboard/ads", Icon: Plus },
    { label: "Create Loop", href: "/dashboard/loops", Icon: PlaySquare },
  ];

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Welcome back, {firstName}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your displays today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.Icon;
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-lg p-3" style={{ backgroundColor: stat.bgColor }}>
                  <Icon size={24} style={{ color: stat.iconColor }} />
                </div>
              </div>
              <p className="text-sm mb-2 text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="rounded-lg border border-[#e5e5e5] bg-white p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.Icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between p-4 border border-[#e5e5e5] rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-blue-100">
                    <Icon size={20} className="text-[#8b6f47]" />
                  </div>
                  <span className="font-medium text-gray-900">{action.label}</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* System logs placeholder */}
      <div className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-900">System Logs</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No activity yet</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
