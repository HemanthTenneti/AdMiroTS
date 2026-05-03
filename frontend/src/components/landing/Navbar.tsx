"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
] as const;

export function Navbar() {
  const pillRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!pillRef.current) return;
    gsap.fromTo(
      pillRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.1 }
    );
  }, []);

  useEffect(() => {
    if (!mobileMenuRef.current) return;
    if (mobileOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        opacity: 0,
        y: -8,
        duration: 0.18,
        ease: "power2.in",
      });
    }
  }, [mobileOpen]);

  return (
    <div className="fixed top-5 left-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto max-w-5xl mx-auto px-4">
        <div
          ref={pillRef}
          className="bg-[#0D0A14]/92 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/50 border border-white/10 px-5 py-3"
        >
          <div className="grid grid-cols-3 items-center">
            {/* Logo — left */}
            <Link href="/" className="flex items-center gap-2" aria-label="AdMiro home">
              <img src="/logo.svg" alt="AdMiro" className="h-8 w-auto brightness-0 invert" />
              <span className="text-white font-bold text-xl tracking-tight">AdMiro</span>
            </Link>

            {/* Center pill links — truly centered */}
            <nav
              className="hidden md:flex justify-center"
              aria-label="Main navigation"
            >
              <div className="flex items-center bg-white/8 rounded-full px-2 py-1 gap-0.5">
                {NAV_LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="px-4 py-1.5 text-sm font-medium text-white/70 rounded-full hover:bg-white/12 hover:text-white transition-[background-color,color] duration-150"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Right actions — desktop */}
            <div className="hidden md:flex items-center justify-end gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-white/50 hover:text-white transition-colors duration-150 px-3 py-2"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="bg-[#7E3AF0] text-white rounded-full px-5 py-2 text-sm font-bold hover:bg-[#6D28D9] hover:scale-[1.03] transition-[background-color,transform] duration-200"
              >
                Get started
              </Link>
            </div>

            {/* Hamburger — mobile (right-aligned via justify-self) */}
            <div className="md:hidden flex justify-end">
              <button
                type="button"
                className="flex items-center justify-center w-9 h-9 rounded-lg text-white/70 hover:bg-white/10 transition-colors duration-150"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobileOpen && (
            <div
              ref={mobileMenuRef}
              className="md:hidden mt-3 pt-3 border-t border-white/10 bg-[#0D0A14]"
            >
              <nav className="flex flex-col gap-0.5 mb-4" aria-label="Mobile navigation">
                {NAV_LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-[background-color,color] duration-150"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white/50 border border-white/15 rounded-xl hover:border-white/30 hover:text-white transition-[border-color,color] duration-150"
                >
                  Log in
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center bg-[#7E3AF0] text-white rounded-full px-4 py-2.5 text-sm font-bold hover:bg-[#6D28D9] transition-colors duration-200"
                >
                  Get started
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
