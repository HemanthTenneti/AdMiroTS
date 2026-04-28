import type { Metadata } from "next";
import "./globals.css";
import { PageTransition } from "@/components/PageTransition";
import ScrollToTop from "@/components/ScrollToTop";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "AdMiro — Digital Ad Management",
  description: "Manage digital advertisements across multiple displays in real-time",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <PageTransition>{children}</PageTransition>
        <ScrollToTop />
        <ToastProvider />
      </body>
    </html>
  );
}
