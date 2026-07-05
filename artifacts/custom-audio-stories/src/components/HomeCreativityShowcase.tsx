import { ChevronDown } from "lucide-react";
import { HomeMoodCarousel } from "@/components/HomeMoodCarousel";
import { HOME_DIMENSION_STATS } from "@/lib/homeBriefUtils";

export function HomeCreativityShowcase() {
  return (
    <section
      id="what-you-get"
      className="relative z-20 py-6 md:py-10 px-4 md:px-8 max-w-7xl mx-auto w-full scroll-mt-20"
    >
      <div className="max-w-2xl mx-auto text-center mb-5 md:mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary/90 mb-2">
          What you get
        </p>
        <h2 className="font-display text-xl md:text-3xl font-bold text-white leading-snug mb-3">
          A glimpse inside stories{" "}
          <span className="text-primary">written only for you.</span>
        </h2>
        <p className="text-sm md:text-base text-white/72 leading-relaxed max-w-lg mx-auto">
          Each one starts with your choices — cast, tension, place, heat — then becomes ~ten minutes
          of full-cast audio with original cover art. Nothing from a catalogue.
        </p>
      </div>

      <HomeMoodCarousel />

      <div className="flex flex-wrap justify-center gap-1.5 mt-6 max-w-xl mx-auto">
        {HOME_DIMENSION_STATS.slice(0, 6).map(({ label, total }) => (
          <span
            key={label}
            className="px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-[10px] text-white/65"
          >
            <span className="font-bold text-primary/90 tabular-nums">{total}</span> {label.toLowerCase()}
          </span>
        ))}
      </div>

      <a
        href="#home-samples"
        className="flex items-center justify-center gap-1.5 text-xs text-white/55 hover:text-primary transition-colors py-4 mt-2"
      >
        Hear it for real
        <ChevronDown className="w-3.5 h-3.5" />
      </a>
    </section>
  );
}
