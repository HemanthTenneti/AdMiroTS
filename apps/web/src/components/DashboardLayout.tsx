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
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User"
      : "User";

  const userInitial =
    mounted && user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U";

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
  const sidebarBg = isDark
    ? "bg-[#0C0C0C] border-r border-white/[0.08]"
    : "bg-white border-r border-gray-200";

  const mainBg = isDark ? "bg-[#080410]" : "bg-gray-50";

  const topbarBg = isDark
    ? "bg-[#0C0C0C] border-b border-white/[0.08]"
    : "bg-white border-b border-gray-200";

  const logoText = isDark ? "text-white" : "text-gray-900";
  const logoBorder = isDark ? "border-b border-white/[0.08]" : "border-b border-gray-200";

  const activeNav = isDark
    ? "bg-[#7E3AF0]/15 text-[#9F67FF] border-l-2 border-[#7E3AF0]"
    : "bg-purple-50 text-purple-700 border-l-2 border-purple-600";

  const inactiveNav = isDark
    ? "text-white/50 hover:text-white/80 hover:bg-white/5 border-l-2 border-transparent"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-l-2 border-transparent";

  const sidebarFooterBorder = isDark ? "border-t border-white/[0.08]" : "border-t border-gray-200";

  const logoutStyle = isDark
    ? "text-white/40 hover:text-red-400 hover:bg-red-500/10"
    : "text-gray-500 hover:text-red-600 hover:bg-red-50";

  const mobileToggleStyle = isDark
    ? "p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white/90"
    : "p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900";

  const themeToggleStyle = isDark
    ? "p-2 rounded-lg text-white/50 hover:text-white/90 hover:bg-white/5"
    : "p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100";

  const profileButtonStyle = isDark
    ? "flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg"
    : "flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg";

  const profileNameStyle = isDark ? "text-sm font-medium text-white/90" : "text-sm font-medium text-gray-900";
  const profileRoleStyle = isDark ? "text-xs text-white/40" : "text-xs text-gray-500";

  const dropdownStyle = isDark
    ? "absolute right-0 mt-2 w-52 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
    : "absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden";

  const dropdownLinkStyle = isDark
    ? "block px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5"
    : "block px-4 py-3 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50";

  const dropdownDivider = isDark ? "border-t border-white/[0.08]" : "border-t border-gray-100";

  const dropdownLogoutStyle = isDark
    ? "w-full text-left px-4 py-3 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
    : "w-full text-left px-4 py-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50";

  const activeIconStyle = isDark ? "text-[#9F67FF]" : "text-purple-700";
  const inactiveIconStyle = isDark ? "text-white/40 group-hover:text-white/70" : "text-gray-400 group-hover:text-gray-700";

  // ─── Sidebar inner ───────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`px-5 py-5 ${logoBorder}`}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#7E3AF0] to-[#9F67FF] rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-[#7E3AF0]/30 shrink-0">
            A
          </div>
          <span className={`text-lg font-bold tracking-tight ${logoText}`}>AdMiro</span>
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
                    <div className={`px-4 py-3 ${isDark ? "border-b border-white/[0.08]" : "border-b border-gray-100"}`}>
                      <p className={`text-sm font-semibold ${isDark ? "text-white/90" : "text-gray-900"}`}>
                        {userName}
                      </p>
                      <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>
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
