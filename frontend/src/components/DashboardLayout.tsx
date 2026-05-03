"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  Sun,
  Moon,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useThemeStore, hydrateTheme } from "@/features/theme/store/themeStore";

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

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrateTheme();
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  const userName =
    mounted && user
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || "User"
      : "User";

  const userInitial =
    mounted && user
      ? (user.firstName?.charAt(0) ?? user.username?.charAt(0) ?? "U").toUpperCase()
      : "U";

  const isNavActive = (item: NavItem): boolean => {
    if (item.href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
  };

  const isDark = theme === "dark";

  // ─── Derived class tokens ────────────────────────────────────────────────────
  const sidebarBg = "bg-[var(--ds-surface)] border-r border-[var(--ds-border)]";

  const mainBg = "bg-[var(--ds-bg)]";

  const topbarBg = "bg-[var(--ds-surface)] border-b border-[var(--ds-border)]";

  const logoText = "text-[var(--ds-text)]";
  const logoBorder = "border-b border-[var(--ds-border)]";

  const activeNav = "bg-[#7E3AF0]/15 text-[#9F67FF] border-l-2 border-[#7E3AF0]";

  const inactiveNav =
    "text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-hover)] border-l-2 border-transparent";

  const sidebarFooterBorder = "border-t border-[var(--ds-border)]";

  const logoutStyle = isDark
    ? "text-white/40 hover:text-red-400 hover:bg-red-500/10"
    : "text-gray-500 hover:text-red-600 hover:bg-red-50";

  const mobileToggleStyle =
    "p-2 hover:bg-[var(--ds-hover)] rounded-lg text-[var(--ds-text-2)] hover:text-[var(--ds-text)]";

  const themeToggleStyle =
    "p-2 rounded-lg text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-hover)]";

  const profileButtonStyle = "flex items-center gap-3 p-2 hover:bg-[var(--ds-hover)] rounded-lg";

  const profileNameStyle = "text-sm font-medium text-[var(--ds-text)]";
  const profileRoleStyle = "text-xs text-[var(--ds-text-2)]";

  const dropdownStyle =
    "absolute right-0 mt-2 w-52 bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl shadow-2xl z-50 overflow-hidden";

  const dropdownLinkStyle =
    "block px-4 py-3 text-sm text-[var(--ds-text-2)] hover:text-[var(--ds-text)] hover:bg-[var(--ds-hover)]";

  const dropdownDivider = "border-t border-[var(--ds-border)]";

  const dropdownLogoutStyle = isDark
    ? "w-full text-left px-4 py-3 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
    : "w-full text-left px-4 py-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50";

  const activeIconStyle = "text-[#9F67FF]";
  const inactiveIconStyle =
    "text-[var(--ds-text-2)] group-hover:text-[var(--ds-text)]";

  // ─── Sidebar inner ───────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`px-5 py-5 ${logoBorder}`}>
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.svg"
            alt="AdMiro"
            className={`h-7 w-auto${isDark ? " brightness-0 invert" : ""}`}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                active ? activeNav : inactiveNav
              }`}
            >
              <Icon
                size={17}
                className={`shrink-0 ${active ? activeIconStyle : inactiveIconStyle}`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer — Logout */}
      <div className={`${sidebarFooterBorder} px-3 py-3`}>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium ${logoutStyle}`}
        >
          <LogOut size={17} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen ${mainBg}`}>
      {/* ── Desktop Sidebar ──────────────────────────────────────────────────── */}
      <aside className={`hidden md:flex flex-col w-60 shrink-0 ${sidebarBg}`}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Drawer ─────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 ${sidebarBg} transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ transition: "transform 300ms ease-in-out" }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ───────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-40"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Main Column ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className={`${topbarBg} sticky top-0 z-30 shrink-0`}>
          <div className="flex items-center justify-between px-5 h-14">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`md:hidden ${mobileToggleStyle}`}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop spacer */}
            <div className="hidden md:block" />

            {/* Right cluster */}
            <div className="flex items-center gap-1">
              {/* Theme toggle */}
              <button
                onClick={toggle}
                className={themeToggleStyle}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`${profileButtonStyle} ml-1`}
                  aria-haspopup="true"
                  aria-expanded={profileMenuOpen}
                >
                  <div className="flex flex-col items-end">
                    <span className={profileNameStyle}>{userName}</span>
                    <span className={profileRoleStyle}>Admin</span>
                  </div>
                  <div className="w-9 h-9 bg-gradient-to-br from-[#7E3AF0] to-[#9F67FF] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md shadow-[#7E3AF0]/25">
                    {userInitial}
                  </div>
                </button>

                {profileMenuOpen && (
                  <div className={dropdownStyle} role="menu">
                    {/* User info header */}
                    <div className={`px-4 py-3 border-b border-[var(--ds-border)]`}>
                      <p className="text-sm font-semibold text-[var(--ds-text)]">
                        {userName}
                      </p>
                      <p className="text-xs mt-0.5 text-[var(--ds-text-2)]">
                        {mounted && user?.email ? user.email : ""}
                      </p>
                    </div>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className={dropdownLinkStyle}
                      role="menuitem"
                    >
                      View Profile
                    </Link>

                    <div className={dropdownDivider} />

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className={dropdownLogoutStyle}
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
