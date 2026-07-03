import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Sparkles, Headphones } from "lucide-react";
import { resolveExpressCategoryImage } from "@/lib/expressAct4Slugs";

const BASE = import.meta.env.BASE_URL;

/** Curated Act IV art — each slide = one personalisation layer */
export const HIW_PERSONALISATION_SLIDES = [
  {
    slug: "yours",
    label: "Your desires",
    sub: "Every tag you pick is written into the prose",
    accent: "#c9a227",
  },
  {
    slug: "tension",
    label: "Your chemistry",
    sub: "The push, the pull, who moves first",
    accent: "#e879a0",
  },
  {
    slug: "desire-she",
    label: "Your perspective",
    sub: "Her, him, them — pronouns follow your cast",
    accent: "#a78bfa",
  },
  {
    slug: "romance",
    label: "Your feeling",
    sub: "Slow burn intimacy or explicitly unrestrained",
    accent: "#c9a227",
  },
  {
    slug: "devotion",
    label: "Your intensity",
    sub: "Praise, power, surrender — as far as you choose",
    accent: "#e879a0",
  },
  {
    slug: "restraint-bdsm",
    label: "How far it goes",
    sub: "The intensity dial is yours alone",
    accent: "#e879a0",
  },
] as const;

export function hiwAct4Src(slug: string) {
  return resolveExpressCategoryImage(`images/express-act4-${slug}.png`, BASE);
}

type Props = {
  priceDisplay: string;
};

export function HowItWorksHero({ priceDisplay }: Props) {
  const [active, setActive] = useState(0);
  const slide = HIW_PERSONALISATION_SLIDES[active]!;

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % HIW_PERSONALISATION_SLIDES.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative w-full min-h-[min(92dvh,780px)] md:min-h-[720px] overflow-hidden border-b border-white/8">
      {/* Full-bleed generated art */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={slide.slug}
            src={hiwAct4Src(slide.slug)}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover brightness-[1.04] contrast-[1.03]"
            style={{ objectPosition: "55% 22%" }}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1.06 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1 }, scale: { duration: 12, ease: "linear" } }}
          />
        </AnimatePresence>
        {/* Readability scrim — art stays visible on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/15 md:via-background/72 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 flex flex-col justify-end min-h-[min(92dvh,780px)] md:min-h-[720px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl lg:max-w-[44%]"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-primary/90 mb-4">
            How personalisation works
          </p>
          <h1 className="font-display text-[2rem] sm:text-4xl lg:text-[2.85rem] font-bold text-white leading-[1.08] mb-5 drop-shadow-lg">
            Nothing generic.
            <br />
            <span className="text-primary">Every line shaped by your choices.</span>
          </h1>
          <p className="text-base md:text-lg text-white/90 leading-relaxed mb-4">
            You build a brief — cast, chemistry, setting, desires, intensity — and we write an original story around it. Narrated. Private. Yours alone.
          </p>
          <p className="text-sm text-white/70 mb-6">
            Over 1 million possible configurations. The one you create has never existed before.
          </p>

          <div
            className="mb-8 p-4 rounded-2xl border backdrop-blur-sm max-w-md bg-black/35"
            style={{ borderColor: `${slide.accent}44` }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">
              Personalisation layer {active + 1} · {slide.label}
            </p>
            <p className="text-sm text-white/85">{slide.sub}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
            <Link href="/after-dark" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_32px_-8px_rgba(201,162,39,0.55)]"
              >
                <Sparkles className="w-4 h-4" />
                Start your brief
              </button>
            </Link>
            <Link
              href="/samples"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-white/80 hover:text-primary transition-colors tracking-widest uppercase py-2"
            >
              <Headphones className="w-3 h-3" />
              Hear a sample →
            </Link>
          </div>
          <p className="text-[11px] text-white/55">From {priceDisplay} · no subscription · 18+</p>
        </motion.div>

        {/* Thumbnail strip — pick which art fills the hero */}
        <div className="mt-8 flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1 max-w-full">
          {HIW_PERSONALISATION_SLIDES.map((s, i) => {
            const on = i === active;
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => setActive(i)}
                className={`flex-shrink-0 snap-start flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border backdrop-blur-md transition-all ${
                  on
                    ? "border-primary/70 bg-black/50 shadow-[0_0_20px_rgba(201,162,39,0.25)]"
                    : "border-white/20 bg-black/35 hover:border-white/35"
                }`}
              >
                <span className={`relative w-11 h-11 rounded-full overflow-hidden border-2 ${on ? "border-primary/80" : "border-white/25"}`}>
                  <img
                    src={hiwAct4Src(s.slug)}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </span>
                <span className={`text-[11px] font-semibold whitespace-nowrap pr-1 ${on ? "text-white" : "text-white/60"}`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
