import { Monitor, Upload, Zap, BarChart2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: Monitor,
    title: "Connect Displays",
    description: "Register displays with a secure token",
  },
  {
    number: "02",
    icon: Upload,
    title: "Upload Content",
    description: "Drag & drop images and videos, any format",
  },
  {
    number: "03",
    icon: Zap,
    title: "Deploy Instantly",
    description: "Assign loops in one click, live in <100ms",
  },
  {
    number: "04",
    icon: BarChart2,
    title: "Track Performance",
    description: "Monitor health, analytics, uptime",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-[#FAFAF9] py-24 px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-4">
          Process
        </p>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-[#0A0A0A] tracking-tight mb-16 max-w-xl">
          Go live in 4 simple steps
        </h2>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <div className="relative">
          {/* Connector line — desktop only */}
          <div
            className="hidden md:block absolute top-[3.25rem] left-[calc(12.5%+1.25rem)] right-[calc(12.5%+1.25rem)] h-px border-t border-dashed border-[#E5E7EB]"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <div
                key={number}
                data-step={number}
                className="flex flex-col items-start md:items-center md:text-center gap-4 relative"
              >
                {/* Icon — sits above the number circle */}
                <div className="w-9 h-9 text-[#7E3AF0]">
                  <Icon size={36} strokeWidth={1.5} />
                </div>

                {/* Number circle */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#7E3AF0] bg-[#FAFAF9] z-10">
                  <span className="text-sm font-bold text-[#7E3AF0] tabular-nums">
                    {number}
                  </span>
                </div>

                {/* Text */}
                <div className="space-y-1">
                  <h3 className="text-[#0A0A0A] font-semibold text-base leading-snug">
                    {title}
                  </h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
