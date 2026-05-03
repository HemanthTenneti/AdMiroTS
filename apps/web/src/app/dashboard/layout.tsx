"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
