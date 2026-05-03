"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, Play, Monitor, Activity, Wifi } from "lucide-react";
import { GradientBarsBackground } from "@/components/ui/gradient-bars-background";

const STATS = [
  { value: "99.9%", label: "Uptime" },
  { value: "<100ms", label: "Update latency" },
  { value: "∞", label: "Display scale" },
] as const;

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-lg ml-auto">
      {/* Outer glow */}
      <div
        className="absolute -inset-4 rounded-3xl blur-2xl"
        style={{ background: "rgba(126,58,240,0.18)" }}
        aria-hidden
      />

      {/* Main card */}
      <div className="relative bg-white border border-white/20 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden rotate-1">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F3F4F6] bg-[#FAFAF9]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 h-4 bg-[#F3F4F6] rounded-full mx-4" />
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-12 bg-[#0C0C0C] flex flex-col items-center py-4 gap-4">
            <div className="w-7 h-7 bg-gradient-to-br from-[#7E3AF0] to-[#9F67FF] rounded-lg flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            {[Monitor, Activity, Wifi].map((Icon, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${i === 0 ? "bg-white/10" : ""}`}
              >
                <Icon size={14} className="text-white/60" />
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 bg-[#FAFAF9]">
            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Displays", value: "24", color: "text-[#7E3AF0]" },
                { label: "Active", value: "8", color: "text-[#10B981]" },
                { label: "Uptime", value: "99.9%", color: "text-[#0A0A0A]" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-xl p-2.5 border border-[#E5E7EB]">
                  <div className={`text-base font-bold ${color}`}>{value}</div>
                  <div className="text-[10px] text-[#9CA3AF] font-medium">{label}</div>
                </div>
              ))}
            </div>

            {/* Display grid */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-3">
              <div className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2.5">
                Live Displays
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-video rounded bg-[#F3F4F6] border border-[#E5E7EB] flex items-end p-1"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < 6 ? "bg-[#10B981]" : "bg-[#F59E0B]"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mini chart */}
            <div className="mt-3 bg-white rounded-xl border border-[#E5E7EB] p-3">
              <div className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                Impressions today
              </div>
              <div className="flex items-end gap-1 h-8">
                {[30, 55, 40, 70, 60, 85, 75, 90, 65, 80].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-[#7E3AF0]"
                    style={{ height: `${h}%`, opacity: 0.25 + i * 0.07 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  useEffect(() => {
    const els = [titleRef, descRef, ctaRef, statsRef, mockupRef];
    if (els.some((r) => !r.current)) return;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.fromTo(titleRef.current, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1.1 })
      .fromTo(descRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.7")
      .fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .fromTo(statsRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.5")
      .fromTo(
        mockupRef.current,
        { opacity: 0, x: 40, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 1.2, ease: "power3.out" },
        "-=1.3"
      );

    const interval = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % STATS.length);
    }, 3000);

    return () => {
      interval && clearInterval(interval);
      tl.kill();
    };
  }, []);

  return (
    <GradientBarsBackground className="min-h-screen" numBars={24} animationDuration={2.5} overlayColor="rgba(8,4,16,0.6)">
      <div
        className="max-w-7xl mx-auto px-4 md:px-8 py-28 md:py-36"
        aria-labelledby="hero-heading"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">

          {/* Left — text */}
          <div className="max-w-2xl">
            <h1
              ref={titleRef}
              id="hero-heading"
              className="font-extrabold leading-[1.06] tracking-tight mb-6"
              style={{ fontSize: "clamp(2.8rem, 5.5vw, 4.8rem)" }}
            >
              <span className="text-white block">Display management,</span>
              <span className="bg-gradient-to-r from-[#9F67FF] to-[#C084FC] bg-clip-text text-transparent">
                reimagined
              </span>
            </h1>

            <p
              ref={descRef}
              className="text-lg md:text-xl text-white/60 leading-relaxed mb-10 font-medium"
            >
              Control thousands of displays from one dashboard. Push updates in under 100ms.
              Track every impression.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4 items-center mb-12">
              {/* Primary button */}
              <Link
                href="/login"
                className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-white text-base bg-[#7E3AF0] hover:bg-[#6D28D9] hover:scale-[1.03] transition-[background-color,transform] duration-200"
              >
                Start free today
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                  aria-hidden
                />
              </Link>

              {/* Secondary button — glass outline */}
              <Link
                href="#how-it-works"
                className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-white text-base border border-white/25 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-[background-color,border-color] duration-200"
              >
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
                  <Play size={11} className="text-white fill-white ml-0.5" aria-hidden />
                </span>
                See how it works
              </Link>
            </div>

            {/* Stats */}
            <div
              ref={statsRef}
              className="flex items-center gap-8 md:gap-12"
              role="list"
              aria-label="Platform statistics"
            >
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  role="listitem"
                  className={`transition-[opacity,transform] duration-500 ${
                    activeStatIndex === i ? "opacity-100 scale-110" : "opacity-30 scale-100"
                  }`}
                >
                  <div className="text-2xl md:text-3xl font-extrabold text-white tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/50 font-medium mt-0.5 tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div ref={mockupRef} className="hidden lg:block w-[480px]">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </GradientBarsBackground>
  );
}
