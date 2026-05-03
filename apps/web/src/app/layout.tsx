import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { PageTransition } from "@/components/PageTransition";
import ScrollToTop from "@/components/ScrollToTop";
import ToastProvider from "@/components/ToastProvider";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AdMiro — Digital Ad Management",
  description: "Manage digital advertisements across multiple displays in real-time",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={bricolage.variable}>
      <body className="antialiased">
        <PageTransition>{children}</PageTransition>
        <ScrollToTop />
        <ToastProvider />
      </body>
    </html>
  );
}
