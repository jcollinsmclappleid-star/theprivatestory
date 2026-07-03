import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCategoryGallery, getCategoryImagePool, getCategoryThumb } from "@/lib/expressCategoryImages";
import { EXPRESS_CATEGORY_SHORT } from "@/lib/expressCategoryImages";
import { resolveExpressCategoryImage } from "@/lib/expressAct4Slugs";

const BASE = import.meta.env.BASE_URL;

function img(path: string) {
  return resolveExpressCategoryImage(path, BASE);
}

type Props = {
  category: string;
  categoryTabs: string[];
  activeCategory: string;
  onCategoryChange: (heading: string) => void;
  subtitle: string;
  /** Brief pulse when user selects a tag */
  pulseKey?: number;
  fallbackCover?: string;
};

export function ExpressCategoryHero({
  category,
  categoryTabs,
  activeCategory,
  onCategoryChange,
  subtitle,
  pulseKey = 0,
  fallbackCover,
}: Props) {
  const gallery = getCategoryGallery(category);
  const pool = useMemo(() => getCategoryImagePool(category), [category]);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    setSlideIndex(0);
  }, [category]);

  useEffect(() => {
    if (pool.length <= 1) return;
    const id = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % pool.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [pool]);

  const slideSrc = img(pool[slideIndex] ?? gallery.primary);

  return (
    <div className="relative -mx-4 sm:mx-0 mb-5 rounded-none sm:rounded-2xl overflow-hidden border-y sm:border border-[#e879a0]/25 shadow-[0_0_60px_rgba(192,57,43,0.15)]">
      <div
        className="absolute -inset-1 z-0 rounded-2xl opacity-40 blur-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 80%, ${gallery.glow}55, transparent 70%)` }}
      />

      <div className="relative min-h-[280px] md:min-h-[380px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${slideIndex}`}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1.06 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ opacity: { duration: 0.8 }, scale: { duration: 14, ease: "linear" } }}
          >
            <img
              src={slideSrc || (fallbackCover ?? "")}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover will-change-transform brightness-[1.05] contrast-[1.05]"
              style={{ objectPosition: gallery.focus }}
            />
          </motion.div>
        </AnimatePresence>

        <motion.div
          key={pulseKey}
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.25, 0] }}
          transition={{ duration: 0.75 }}
          style={{
            background: `radial-gradient(circle at 50% 60%, ${gallery.glow}55, transparent 65%)`,
          }}
        />
        {/* Light scrim — art must stay visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />

        <div className="relative z-10 p-5 md:p-8 flex flex-col justify-end min-h-[280px] md:min-h-[380px] pb-[4.75rem] md:pb-[5.25rem]">
          <motion.p
            key={`act-${category}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#e879a0] mb-1"
          >
            Act IV · Make it yours
          </motion.p>
          <motion.h1
            key={`title-${category}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-2xl md:text-4xl font-bold text-white leading-tight mb-1 drop-shadow-lg"
          >
            {category}
          </motion.h1>
          <motion.p
            key={`sub-${category}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-white/85 italic max-w-lg leading-relaxed"
          >
            {subtitle}
          </motion.p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 px-2 pb-2 pt-8 bg-gradient-to-t from-black via-black/95 to-transparent">
        <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
          {categoryTabs.map((heading) => {
            const active = heading === activeCategory;
            const thumb = getCategoryThumb(heading);
            const tabGlow = getCategoryGallery(heading).glow;
            const short = EXPRESS_CATEGORY_SHORT[heading] ?? heading;
            return (
              <button
                key={heading}
                type="button"
                onClick={() => onCategoryChange(heading)}
                className={`group flex-shrink-0 snap-start flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all ${
                  active
                    ? "border-[#e879a0]/70 bg-black/70 shadow-[0_0_24px_rgba(232,121,160,0.3)]"
                    : "border-white/12 bg-black/50 hover:border-white/28"
                }`}
              >
                <span
                  className={`relative w-11 h-11 rounded-full overflow-hidden border flex-shrink-0 transition-transform ${
                    active ? "border-[#e879a0]/80 scale-105 ring-2 ring-[#e879a0]/30" : "border-white/20 group-hover:border-white/35"
                  }`}
                >
                  <img
                    src={img(thumb)}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {active && (
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{ boxShadow: `inset 0 0 14px ${tabGlow}` }}
                    />
                  )}
                </span>
                <span className={`text-[11px] font-semibold whitespace-nowrap ${active ? "text-white" : "text-white/55"}`}>
                  {short}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Soft drifting backdrop for the whole Act IV page */
export function ExpressActIVBackdrop({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      {images.slice(0, 3).map((src, i) => (
        <motion.div
          key={src}
          className="absolute rounded-full overflow-hidden blur-3xl opacity-[0.08]"
          style={{
            width: `${42 + i * 18}%`,
            height: `${42 + i * 18}%`,
            left: `${i * 26}%`,
            top: `${8 + i * 24}%`,
          }}
          animate={{
            x: [0, 24, -12, 0],
            y: [0, -18, 12, 0],
            scale: [1, 1.06, 0.97, 1],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img src={src} alt="" className="w-full h-full object-cover" />
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black" />
    </div>
  );
}
