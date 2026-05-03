"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ChevronUp } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  useEffect(() => {
    const animateOnScroll = (
      selector: string,
      fromVars: gsap.TweenVars,
      staggerDelay = 0.1
    ) => {
      document.querySelectorAll(selector).forEach((el, i) => {
        const obs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !entry.target.classList.contains("animated")) {
                entry.target.classList.add("animated");
                gsap.fromTo(entry.target, fromVars, {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: 1,
                  duration: 0.8,
                  ease: "power3.out",
                  delay: i * staggerDelay,
                });
              }
            });
          },
          { threshold: 0.15 }
        );
        obs.observe(el);
      });
    };

    animateOnScroll("[data-card]", { opacity: 0, y: 40, scale: 0.95 });
    animateOnScroll("[data-logo]", { opacity: 0, scale: 0.8 }, 0.08);
    animateOnScroll("[data-step]", { opacity: 0, y: 30 });
  }, []);

  return (
    <main className="min-h-screen bg-[#FAFAF9] overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 w-11 h-11 bg-[#7E3AF0] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#6D28D9] hover:scale-110 transition-[background-color,transform] duration-200 z-50"
        aria-label="Scroll to top"
      >
        <ChevronUp size={18} />
      </button>
    </main>
  );
}
