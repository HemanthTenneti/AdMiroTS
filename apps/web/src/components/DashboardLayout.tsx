"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Monitor,
  Image,
  Link2,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
  Play,
  User,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";

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
  const { user, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = mounted && user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User"
    : "User";

  const userInitial = mounted && user?.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : "U";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#faf9f7]">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#e5e5e5] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#e5e5e5]">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8b6f47] rounded flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
              <span className="text-xl font-bold text-black">AdMiro</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition group"
                >
                  <Icon
                    size={20}
                    className="text-gray-600 group-hover:text-[#8b6f47] shrink-0"
                  />
                  <span className="font-medium text-gray-600 group-hover:text-[#8b6f47]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-[#e5e5e5] p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={20} className="text-gray-600 shrink-0" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-[#e5e5e5] sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X size={24} className="text-gray-700" />
              ) : (
                <Menu size={24} className="text-gray-700" />
              )}
            </button>

            <div className="hidden md:block" />

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">
                    {userName}
                  </span>
                  <span className="text-xs text-gray-500">Admin</span>
                </div>
                <div className="w-10 h-10 bg-[#8b6f47] rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  {userInitial}
                </div>
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#e5e5e5] z-50">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-t-lg transition"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-lg transition border-t border-[#e5e5e5]"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}
