import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GradientBarsBackground } from "@/components/ui/gradient-bars-background";

const trustItems = ["Free forever", "No credit card", "5-min setup"] as const;

export function CTA() {
  return (
    <div className="px-4 md:px-8 py-12">
    <GradientBarsBackground
      flipped
      numBars={24}
      animationDuration={3}
      overlayColor="rgba(8,4,16,0.55)"
      className="rounded-[2rem] py-28 px-6"
    >
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
          Ready to transform your display network?
        </h2>
        <p className="text-white/50 text-lg">
          Start free. No credit card. 5-minute setup.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-white text-base bg-[#7E3AF0] hover:bg-[#6D28D9] hover:scale-[1.03] transition-[background-color,transform] duration-200"
          >
            Get Started
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>

          <Link
            href="/#features"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/25 text-white font-bold text-base hover:bg-white/8 hover:border-white/40 transition-[background-color,border-color] duration-200"
          >
            Explore Features
          </Link>
        </div>

        <ul className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 mt-1">
          {trustItems.map((item) => (
            <li key={item} className="flex items-center gap-1.5 text-xs text-white/40">
              <span className="text-[#7E3AF0] font-bold">&#10003;</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </GradientBarsBackground>
    </div>
  );
}
