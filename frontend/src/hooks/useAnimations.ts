"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

export function usePageTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [pathname]);

  return ref;
}

export function useScrollAnimation() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);
}

export function animateOnScroll(
  element: Element,
  options?: { duration?: number; delay?: number; y?: number; opacity?: [number, number] }
) {
  const { duration = 0.6, delay = 0, y = 20, opacity = [0, 1] } = options ?? {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.fromTo(
            entry.target,
            { opacity: opacity[0], y },
            { opacity: opacity[1], y: 0, duration, delay, ease: "power2.out" }
          );
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(element);
  return () => observer.disconnect();
}

export function useScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    gsap.to(window, { scrollTo: 0, duration: 1, ease: "power2.inOut" });
  };

  return { isVisible, scrollToTop, buttonRef };
}
