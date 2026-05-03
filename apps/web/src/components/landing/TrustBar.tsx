const COMPANIES = ["OpenAI", "Figma", "Stripe", "Vercel", "Notion"] as const;

export function TrustBar() {
  return (
    <section className="border-y border-[#E5E7EB] bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-0">
          <div className="md:w-64 shrink-0">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest leading-relaxed">
              Trusted by<br className="hidden md:block" />forward-thinking teams
            </p>
          </div>
          <div className="hidden md:block w-px h-8 bg-[#E5E7EB] mx-8 shrink-0" aria-hidden="true" />
          <div className="flex items-center gap-8 md:gap-12 lg:gap-16 flex-wrap md:flex-nowrap">
            {COMPANIES.map((company) => (
              <span
                key={company}
                data-logo
                className="text-base md:text-lg font-bold text-[#9CA3AF] tracking-tight cursor-default select-none hover:text-[#7E3AF0] transition-colors duration-200"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
