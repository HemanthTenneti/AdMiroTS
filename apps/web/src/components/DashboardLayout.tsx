"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Monitor,
  Image,
  Link2,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Clock,
  Play,
  User,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Displays", href: "/dashboard/displays", icon: Monitor },
  { label: "Connection Requests", href: "/dashboard/connection-requests", icon: Link2 },
  { label: "Advertisements", href: "/dashboard/ads", icon: Image },
  { label: "Display Loops", href: "/dashboard/loops", icon: Play },
  { label: "All Logs", href: "/dashboard/logs", icon: Clock },
  { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName =
    mounted && user
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User"
      : "User";

  const userInitial = mounted && user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-transparent text-[var(--color-text)]">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-[var(--color-border)] p-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-bold text-white">
                A
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight">AdMiro</div>
                <div className="text-xs text-[var(--color-text-muted)]">Operations Console</div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-3 transition",
                    active
                      ? "bg-[var(--color-bg-secondary)] text-[var(--color-primary-darker)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      "shrink-0",
                      active ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[var(--color-border)] p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[var(--color-text-secondary)] transition hover:bg-[#f3ddda]"
            >
              <LogOut size={20} className="shrink-0" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 transition hover:bg-[var(--color-bg-secondary)] md:hidden"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="hidden md:block" />

            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-[var(--color-bg-secondary)]"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">{userName}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">Admin</span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] font-bold text-white">
                  {userInitial}
                </div>
              </button>

              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block rounded-t-xl px-4 py-3 text-sm transition hover:bg-[var(--color-bg-secondary)]"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full rounded-b-xl border-t border-[var(--color-border)] px-4 py-3 text-left text-sm text-[#8a2a2a] transition hover:bg-[#f3ddda]"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/35 md:hidden" onClick={closeSidebar} />
      )}
    </div>
  );
}
