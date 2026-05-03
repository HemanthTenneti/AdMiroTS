import { Zap, BarChart2, Layers, Lock, Code, Eye, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FeatureCard = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  colSpan: string;
  rowSpan: string;
  featured?: boolean;
};

const FEATURES: FeatureCard[] = [
  {
    id: "fast",
    title: "Lightning Fast Updates",
    subtitle: "< 100ms",
    description: "Push content changes to thousands of displays in under 100ms. Real-time sync that never blocks.",
    icon: Zap,
    colSpan: "col-span-1 md:col-span-2",
    rowSpan: "row-span-1",
    featured: true,
  },
  {
    id: "analytics",
    title: "Deep Analytics",
    subtitle: "Every metric, every display",
    description: "Impressions, dwell time, and engagement per display — surfaced in a single view.",
    icon: BarChart2,
    colSpan: "col-span-1",
    rowSpan: "row-span-1 md:row-span-2",
    featured: true,
  },
  {
    id: "scale",
    title: "Infinite Scale",
    subtitle: "1 → 10,000+ displays",
    description: "Our infrastructure grows with you. No performance degradation at any scale.",
    icon: Layers,
    colSpan: "col-span-1",
    rowSpan: "row-span-1",
    featured: false,
  },
  {
    id: "security",
    title: "Enterprise Security",
    subtitle: "SOC 2 compliant",
    description: "JWT auth, encrypted connections, and SOC 2 compliance. Your content protected at every layer.",
    icon: Lock,
    colSpan: "col-span-1",
    rowSpan: "row-span-1",
    featured: false,
  },
  {
    id: "api",
    title: "Developer API",
    subtitle: "REST + Webhooks",
    description: "Complete REST API with webhooks. Build custom integrations and automate everything.",
    icon: Code,
    colSpan: "col-span-1",
    rowSpan: "row-span-1",
    featured: false,
  },
  {
    id: "monitoring",
    title: "Real-time Monitoring",
    subtitle: "99.9% uptime",
    description: "Instant offline alerts and continuous health checks. Know the moment anything goes wrong.",
    icon: Eye,
    colSpan: "col-span-1",
    rowSpan: "row-span-1",
    featured: false,
  },
  {
    id: "deploy",
    title: "Deploy in Minutes",
    subtitle: "Zero setup required",
    description: "No hardware to configure. Connect your displays and start broadcasting. Live in under 10 minutes.",
    icon: Rocket,
    colSpan: "col-span-1",
    rowSpan: "row-span-1",
    featured: false,
  },
];

function SpeedDiagram() {
  return (
    <div className="mt-6 flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full bg-[#7E3AF0]"
          style={{ width: `${(i + 1) * 8}px`, opacity: 0.15 + i * 0.11 }}
        />
      ))}
      <span className="ml-2 text-[10px] font-bold text-[#7E3AF0] tracking-wider uppercase">
        &lt; 100ms
      </span>
    </div>
  );
}

function AnalyticsDiagram() {
  const bars = [45, 72, 58, 88, 64, 95, 79];
  return (
    <div className="mt-6 flex items-end gap-1.5 h-16" aria-hidden="true">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-[#7E3AF0]"
          style={{ height: `${h}%`, opacity: 0.2 + i * 0.1 }}
        />
      ))}
    </div>
  );
}

function FeatureTile({ card }: { card: FeatureCard }) {
  const Icon = card.icon;
  return (
    <div
      data-card
      className={`${card.colSpan} ${card.rowSpan} group relative flex flex-col bg-white border border-[#E5E7EB] rounded-2xl p-7 hover:shadow-[0_8px_32px_rgba(126,58,240,0.08)] hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200 overflow-hidden`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[#7E3AF0] opacity-0 group-hover:opacity-[0.025] transition-opacity duration-200" />

      <div className={`relative z-10 flex items-center justify-center rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] ${card.featured ? "w-12 h-12" : "w-10 h-10"}`}>
        <Icon size={card.featured ? 26 : 20} className="text-[#7E3AF0]" />
      </div>

      <p className="relative z-10 mt-4 text-[11px] font-semibold text-[#7E3AF0] uppercase tracking-widest">
        {card.subtitle}
      </p>

      <h3 className={`relative z-10 font-bold text-[#0A0A0A] mt-1.5 leading-snug ${card.featured ? "text-xl md:text-2xl" : "text-base md:text-lg"}`}>
        {card.title}
      </h3>

      <p className="relative z-10 mt-2 text-sm text-[#6B7280] leading-relaxed flex-1">
        {card.description}
      </p>

      {card.id === "fast" && <div className="relative z-10"><SpeedDiagram /></div>}
      {card.id === "analytics" && <div className="relative z-10"><AnalyticsDiagram /></div>}
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
        <div className="mb-12 md:mb-16">
          <p className="text-xs font-semibold text-[#7E3AF0] uppercase tracking-widest mb-4">
            Platform capabilities
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0A0A0A] leading-[1.1] max-w-3xl">
            Everything you need to
            <span className="block text-[#6B7280] font-medium mt-1">
              run a world-class display network
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-auto">
          {FEATURES.map((card) => (
            <FeatureTile key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
