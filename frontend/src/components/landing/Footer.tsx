import Link from "next/link";
import Image from "next/image";

const NAV_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const;

const SOCIAL = [
  { label: "Web", href: "https://10eti.me" },
  { label: "GitHub", href: "https://github.com/HemanthTenneti" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/hemanth10eti" },
] as const;

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 md:px-8">

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-12 py-16 border-b border-white/[0.06]">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="inline-block w-fit hover:opacity-70 transition-opacity duration-200">
              <Image
                src="/logo.svg"
                alt="AdMiro"
                width={88}
                height={21}
                className="brightness-0 invert"
              />
            </Link>
            <p className="text-white/35 text-sm leading-relaxed max-w-[200px]">
              The modern platform for digital signage at scale.
            </p>
            <div className="flex items-center gap-2 mt-2">
              {SOCIAL.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full border border-white/10 text-white/40 text-xs font-medium hover:border-[#7E3AF0]/50 hover:text-white/80 transition-[border-color,color] duration-200"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLUMNS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-4">
              <p className="text-white/25 text-[11px] font-semibold uppercase tracking-[0.1em]">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-3">
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-white/45 text-sm hover:text-white/80 transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-6">
          <p className="text-white/20 text-xs">© 2025 AdMiro. All rights reserved.</p>
          <p className="text-white/20 text-xs">Built for the future of digital signage</p>
        </div>

      </div>
    </footer>
  );
}
