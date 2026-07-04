import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Sparkles, Headphones, ChevronDown } from "lucide-react";
import { hiwAct4Src } from "@/components/HowItWorksHero";
import { Act4Crossfade, SlideProgressDots } from "@/components/Act4Crossfade";
import { ACT4_SLIDE_INTERVAL_MS, usePreloadImages, useSlideshow } from "@/lib/preloadImages";

const PRICING_HERO_SLIDES = [
  {
    slug: "tension",
    label: "Your chemistry",
    line: "The look that says everything",
    sub: "The push, the pull — every pause written to land",
    accent: "#e879a0",
    objectPosition: "58% 22%",
  },
  {
    slug: "yours",
    label: "Your desires",
    line: "Your hunger, in the prose",
    sub: "What you want said — and done — lands exactly",
    accent: "#c9a227",
    objectPosition: "55% 18%",
  },
  {
    slug: "devotion",
    label: "Your intensity",
    line: "Praise, power, surrender",
    sub: "As far as you want it — unrestrained if you choose",
    accent: "#e879a0",
    objectPosition: "60% 20%",
  },
  {
    slug: "desire-she",
    label: "Your perspective",
    line: "Her perspective. Her hunger.",
    sub: "Cast and pronouns follow your choices exactly",
    accent: "#a78bfa",
    objectPosition: "52% 24%",
  },
  {
    slug: "romance",
    label: "Your feeling",
    line: "Slow burn or unrestrained",
    sub: "One story · ~10 minutes · heard only by you",
    accent: "#c9a227",
    objectPosition: "56% 16%",
  },
] as const;

type Props = {
  warmTraffic?: boolean;
  onScrollToPacks?: () => void;
};

export function PricingHero({ warmTraffic = false, onScrollToPacks }: Props) {
  const [reduceMotion, setReduceMotion] = useState(false);

  const slideSrcs = useMemo(
    () => PRICING_HERO_SLIDES.map((s) => ({ src: hiwAct4Src(s.slug), objectPosition: s.objectPosition })),
    [],
  );
  const thumbSrcs = useMemo(() => PRICING_HERO_SLIDES.map((s) => hiwAct4Src(s.slug)), []);

  usePreloadImages([...slideSrcs.map((s) => s.src), ...thumbSrcs]);
  const [active, setActive] = useSlideshow(PRICING_HERO_SLIDES.length, ACT4_SLIDE_INTERVAL_MS, !reduceMotion);

  const slide = PRICING_HERO_SLIDES[active]!;

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <section className="relative w-full min-h-[min(68dvh,580px)] md:min-h-[min(78dvh,700px)] overflow-hidden border-b border-white/8">
      <div className="absolute inset-0 z-0">
        <Act4Crossfade slides={slideSrcs} activeIndex={active} />
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-[#0a0810] via-[#0a0810]/93 to-[#0a0810]/40 md:via-[#0a0810]/82 md:to-transparent" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-[#0a0810] via-[#0a0810]/65 to-[#0a0810]/45 md:via-transparent md:to-[#0a0810]/28" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 flex flex-col justify-end min-h-[min(68dvh,580px)] md:min-h-[min(78dvh,700px)]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl lg:max-w-[46%]"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-primary/90 mb-3">
            Personalised erotica · private to you
          </p>

          {warmTraffic ? (
            <>
              <h1 className="font-display text-[2rem] sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-[1.08] mb-3 drop-shadow-lg">
                Your story is
                <span className="text-primary"> waiting.</span>
              </h1>
              <p className="text-base md:text-lg text-white/90 leading-relaxed mb-4">
                You&apos;ve chosen your cast, your tension, your heat. Choose a collection — then hear it in Theo&apos;s voice, private to you alone.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-[2rem] sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-[1.08] mb-3 drop-shadow-lg">
                Private erotica.
                <br />
                <span className="text-primary">Written around you. Narrated for you alone.</span>
              </h1>
              <p className="text-base md:text-lg text-white/90 leading-relaxed mb-4">
                Choose how many stories you want — each built from your cast, your chemistry, and how explicit you want it.
              </p>
            </>
          )}

          <motion.div
            key={slide.slug}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-4 md:mb-5 p-3 md:p-4 rounded-2xl border backdrop-blur-sm bg-black/45 max-w-md"
            style={{ borderColor: `${slide.accent}44` }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">{slide.line}</p>
            <p className="text-sm text-white/88">{slide.sub}</p>
          </motion.div>

          <SlideProgressDots count={PRICING_HERO_SLIDES.length} active={active} className="mb-4 md:hidden" />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3">
            <button
              type="button"
              onClick={onScrollToPacks}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_32px_-8px_rgba(201,162,39,0.55)]"
            >
              <Sparkles className="w-4 h-4" />
              {warmTraffic ? "Unlock your story" : "Choose your collection"}
            </button>
            <Link
              href="/after-dark"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-white/80 hover:text-primary transition-colors tracking-widest uppercase py-2"
            >
              {warmTraffic ? "Continue your story →" : "Create yours first →"}
            </Link>
          </div>
          <Link
            href="/samples"
            className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-primary transition-colors"
          >
            <Headphones className="w-3 h-3" />
            Hear Theo narrate a sample — then imagine yours going further
          </Link>
        </motion.div>

        <div className="mt-5 md:mt-7 flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1 -mx-1 px-1 max-w-full">
          {PRICING_HERO_SLIDES.map((s, i) => {
            const on = i === active;
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => setActive(i)}
                className={`flex-shrink-0 snap-start flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border backdrop-blur-md transition-all min-h-[44px] ${
                  on
                    ? "border-primary/70 bg-black/50 shadow-[0_0_20px_rgba(201,162,39,0.25)]"
                    : "border-white/20 bg-black/35 hover:border-white/35"
                }`}
              >
                <span className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 flex-shrink-0 ${on ? "border-primary/80" : "border-white/25"}`}>
                  <img src={hiwAct4Src(s.slug)} alt="" aria-hidden decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                </span>
                <span className={`text-[11px] font-semibold whitespace-nowrap pr-1 ${on ? "text-white" : "text-white/60"}`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onScrollToPacks}
          className="mt-3 md:mt-5 mx-auto flex flex-col items-center gap-1 text-white/40 hover:text-primary/80 transition-colors"
          aria-label="Scroll to collections"
        >
          <span className="text-[10px] uppercase tracking-widest">See collections</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
