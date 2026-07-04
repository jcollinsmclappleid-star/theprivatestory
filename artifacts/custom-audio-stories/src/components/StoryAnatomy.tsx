import { motion } from "framer-motion";

export type AnatomyRow = {
  axis: string;
  value: string;
  scale: string;
  accent: string;
};

export type AnatomyPreset = {
  title: string;
  teaser: string;
  rows: AnatomyRow[];
  intensityIndex?: number;
};

export const ANATOMY_ROWS: ReadonlyArray<AnatomyRow> = [
  { axis: "Pairing",   value: "Her & Him",          scale: "1 of 6",            accent: "#e879a0" },
  { axis: "Chemistry", value: "Forbidden Pull",     scale: "1 of 8",            accent: "#c9a227" },
  { axis: "Archetype", value: "The Executive",      scale: "1 of 19",           accent: "#6b8cce" },
  { axis: "Setting",   value: "Victorian London",   scale: "200+ places",       accent: "#34d399" },
  { axis: "Intensity", value: "Warm",               scale: "1 of 4",            accent: "#f97316" },
  { axis: "Ending",    value: "Left wanting more",  scale: "1 of 7",            accent: "#a78bfa" },
  { axis: "Situation", value: "Unexpected Reunion", scale: "1 of 200+",         accent: "#e11d48" },
  { axis: "Voice",     value: "Kayla",              scale: "1 of 6 narrators",  accent: "#e879a0" },
];

/**
 * Single "Anatomy of Your Story" exhibit — a rendered spec sheet for one
 * specific generated story, with eight axis rows + scale markers + a story
 * teaser. Used as the right column of Home's Creation Room and as a
 * standalone proof block on SEO landing pages.
 */
const DEFAULT_PRESET: AnatomyPreset = {
  title: "The Fog Between Us",
  teaser: "\"He shouldn't be in her study. She should have locked the door.\"",
  rows: [...ANATOMY_ROWS],
};

export function StoryAnatomyCard({
  preset,
  showMotion = true,
}: {
  preset?: AnatomyPreset;
  showMotion?: boolean;
} = {}) {
  const { title, teaser, rows } = preset ?? DEFAULT_PRESET;
  const Wrapper = showMotion ? motion.div : "div";
  const motionProps = showMotion
    ? {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.6 },
      }
    : {};

  return (
    <Wrapper {...motionProps} className="relative">
      <div
        className="relative overflow-hidden rounded-2xl border"
        style={{
          background: "linear-gradient(160deg, #0c0a08 0%, #0a0814 55%, #100614 100%)",
          borderColor: "#c9a22730",
          boxShadow: "inset 0 0 80px #c9a2270c, 0 24px 60px -24px #c9a22735, 0 8px 24px rgba(0,0,0,0.65)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 15%, #c9a22720 0%, transparent 60%), radial-gradient(ellipse at 80% 85%, #6b8cce14 0%, transparent 55%)" }}
        />

        <div className="relative z-10 p-7 md:p-8">
          <div className="flex items-baseline justify-between mb-6 pb-5 border-b border-white/8">
            <div>
              <p className="text-[10px] font-bold tracking-[0.32em] uppercase text-primary/80 mb-1.5">
                Anatomy of Your Story
              </p>
              <p className="font-display text-xl md:text-[1.35rem] text-white/95 leading-tight">
                {title}
              </p>
            </div>
            <span className="font-display text-2xl italic text-primary/40 flex-shrink-0">✦</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {rows.map((row) => (
              <div key={row.axis} className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-[10px] font-bold tracking-[0.28em] uppercase"
                    style={{ color: `${row.accent}c0` }}
                  >
                    {row.axis}
                  </span>
                  <span className="text-[10px] text-white/35 tracking-wide italic">
                    · {row.scale}
                  </span>
                </div>
                <p className="font-display text-base text-white/92 leading-snug mt-1">
                  {row.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-7 pt-5 border-t border-white/8">
            <p className="font-display italic text-base text-white/88 leading-relaxed">
              {teaser}
            </p>
            <p className="text-[11px] text-white/60 mt-3 tracking-wide">
              One of <span className="text-primary/85">over a million</span>. Built for you.
            </p>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
