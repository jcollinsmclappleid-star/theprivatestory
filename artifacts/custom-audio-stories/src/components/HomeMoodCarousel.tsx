import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HorizontalScrollRow } from "@/components/ScrollRowHint";
import {
  HOME_STORY_SHOWCASES,
  presetForShowcase,
} from "@/lib/homeStoryShowcases";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const img = (path: string) => `${BASE}/${path.replace(/^\//, "")}`;

const AXIS_SHORT: Record<string, string> = {
  "Who you're with": "Cast",
  "The tension": "Tension",
  "Who they are": "Character",
  "Where it happens": "Setting",
  "Who tells it": "Narrator",
  Situation: "Situation",
  Intensity: "Heat",
};

/** Carousel of example generated stories — cover art focal, selections visible. */
export function HomeMoodCarousel() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const pauseAutoUntil = useRef(0);
  const touchStartX = useRef<number | null>(null);
  const story = HOME_STORY_SHOWCASES[index];
  const total = HOME_STORY_SHOWCASES.length;
  const preset = useMemo(() => presetForShowcase(story), [story]);
  const selectionRows = preset.rows.slice(0, 6);

  const go = useCallback(
    (delta: number) => {
      pauseAutoUntil.current = Date.now() + 12_000;
      setIndex((i) => (i + delta + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      if (Date.now() < pauseAutoUntil.current) return;
      setIndex((i) => (i + 1) % total);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [reduceMotion, total]);

  const onTouchStart = (clientX: number) => {
    touchStartX.current = clientX;
    pauseAutoUntil.current = Date.now() + 12_000;
  };

  const onTouchEnd = (clientX: number) => {
    if (touchStartX.current === null) return;
    const dx = clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 48) return;
    go(dx > 0 ? -1 : 1);
  };

  return (
    <div className="relative max-w-lg mx-auto">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0a0806] shadow-[0_24px_64px_-28px_rgba(0,0,0,0.85)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={story.id}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Cover art — shorter on mobile so selections stay in view */}
            <div
              className="relative aspect-[4/5] max-h-[min(40vh,320px)] sm:max-h-[min(52vh,440px)] w-full overflow-hidden touch-pan-y"
              onTouchStart={(e) => onTouchStart(e.touches[0].clientX)}
              onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)}
            >
              <img
                src={img(story.image)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="lazy"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0806] via-transparent to-transparent opacity-90" />
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2 py-1 rounded-full border border-white/15 bg-black/40 text-[9px] font-bold uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
                  Generated cover
                </span>
              </div>
            </div>

            <div
              className="relative px-4 py-4 sm:px-5 sm:py-5 -mt-1"
              style={{
                background:
                  "linear-gradient(160deg, #0c0a08 0%, #0a0814 55%, #100614 100%)",
              }}
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-primary/75 mb-1">
                Your selections · written fresh
              </p>
              <h3 className="font-display text-lg sm:text-2xl text-white/95 leading-tight mb-1">
                {story.title}
              </h3>
              <p className="text-[13px] sm:text-sm text-white/65 leading-relaxed italic mb-3 sm:mb-4">
                {story.tagline}
              </p>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-2.5 pb-3 border-b border-white/8">
                {selectionRows.map((row) => (
                  <div key={row.axis} className="min-w-0">
                    <p
                      className="text-[9px] font-bold uppercase tracking-[0.16em] mb-0.5"
                      style={{ color: `${row.accent}c8` }}
                    >
                      {AXIS_SHORT[row.axis] ?? row.axis}
                    </p>
                    <p className="text-[12px] sm:text-[13px] text-white/88 font-medium leading-snug line-clamp-2">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-white/45 mt-3 text-center">
                ~10 min · full-cast · private to you
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous story"
          className="absolute left-2 top-[32%] sm:top-[38%] -translate-y-1/2 z-10 w-10 h-10 sm:w-9 sm:h-9 rounded-full border border-white/15 bg-black/50 text-white/80 hover:text-white hover:bg-black/65 transition-colors hidden sm:flex items-center justify-center backdrop-blur-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next story"
          className="absolute right-2 top-[32%] sm:top-[38%] -translate-y-1/2 z-10 w-10 h-10 sm:w-9 sm:h-9 rounded-full border border-white/15 bg-black/50 text-white/80 hover:text-white hover:bg-black/65 transition-colors hidden sm:flex items-center justify-center backdrop-blur-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile — swipe + thumb controls */}
      <div className="flex items-center justify-between gap-2 mt-3 sm:hidden">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous story"
          className="flex-shrink-0 w-11 h-11 rounded-full border border-white/12 bg-white/[0.04] text-white/75 flex items-center justify-center active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <p className="text-[10px] text-white/45 text-center flex-1">
          Swipe the cover · {index + 1} of {total}
        </p>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next story"
          className="flex-shrink-0 w-11 h-11 rounded-full border border-white/12 bg-white/[0.04] text-white/75 flex items-center justify-center active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <HorizontalScrollRow
        className="flex gap-2 mt-3 sm:mt-3 sm:flex-wrap sm:justify-center overflow-x-auto snap-x snap-mandatory scrollbar-brand -mx-1 px-1 sm:mx-0 pb-0.5 sm:pb-0"
        role="tablist"
        aria-label="Example stories"
      >
        {HOME_STORY_SHOWCASES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => {
              pauseAutoUntil.current = Date.now() + 12_000;
              setIndex(i);
            }}
            className={[
              "snap-start flex-shrink-0 min-h-[44px] px-3.5 py-2 rounded-full text-[11px] font-medium transition-all max-w-[11rem] truncate",
              i === index
                ? "bg-primary/15 border border-primary/35 text-primary"
                : "border border-white/10 text-white/50 active:bg-white/[0.06]",
            ].join(" ")}
            title={s.title}
          >
            {s.title}
          </button>
        ))}
      </HorizontalScrollRow>
    </div>
  );
}
