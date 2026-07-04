import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "wouter";
import { StoryAnatomyCard } from "@/components/StoryAnatomy";
import { IntensityDial, INTENSITY_LEVELS } from "@/components/IntensityDial";
import {
  BriefBuilder,
  buildPresetFromSelections,
  DEFAULT_SELECTIONS,
  intensityToIndex,
  type CategoryId,
} from "@/components/BriefBuilder";
import { saveHomeBrief } from "@/lib/afterDarkExpress";

interface CreationStudioProps {
  priceDisplay: string;
}

const AUTO_CYCLE_MS = 3200;
const AUTO_PAUSE_MS = 12000;

export function CreationStudio({ priceDisplay }: CreationStudioProps) {
  const reduceMotion = useReducedMotion();
  const [selections, setSelections] = useState(DEFAULT_SELECTIONS);
  const [intensityIndex, setIntensityIndex] = useState(1);
  const autoPausedUntil = useRef(0);

  const pauseAutoCycle = useCallback(() => {
    autoPausedUntil.current = Date.now() + AUTO_PAUSE_MS;
  }, []);

  const handleSelectionsChange = useCallback((next: Record<CategoryId, string>) => {
    setSelections(next);
    setIntensityIndex(intensityToIndex(next.intensity));
    pauseAutoCycle();
  }, [pauseAutoCycle]);

  const handleIntensityChange = useCallback((index: number) => {
    pauseAutoCycle();
    setIntensityIndex(index);
    const level = INTENSITY_LEVELS[index];
    if (level) {
      setSelections((prev) => ({ ...prev, intensity: level.label }));
    }
  }, [pauseAutoCycle]);

  useEffect(() => {
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      if (Date.now() < autoPausedUntil.current) return;
      setIntensityIndex((prev) => {
        const next = (prev + 1) % INTENSITY_LEVELS.length;
        const level = INTENSITY_LEVELS[next];
        if (level) {
          setSelections((s) => ({ ...s, intensity: level.label }));
        }
        return next;
      });
    }, AUTO_CYCLE_MS);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const preset = buildPresetFromSelections(selections, "Your story brief");

  return (
    <section id="creation-room" className="relative py-4 md:py-8 px-4 md:px-8 max-w-7xl mx-auto w-full scroll-mt-24">
      <div className="relative rounded-3xl border border-primary/30 bg-[#120a14]/95 overflow-hidden shadow-[0_0_80px_-24px_hsl(var(--primary)/0.45)]">
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse at 15% 0%, hsl(var(--primary) / 0.14) 0%, transparent 50%), radial-gradient(ellipse at 95% 100%, rgba(180,90,110,0.14) 0%, transparent 45%)",
          }}
        />

        <div className="relative p-6 md:p-10 lg:p-12 space-y-6 md:space-y-8">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary mb-3">
              Create your spicy fantasy
            </p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Shape it.{" "}
              <span className="text-primary">Listen in minutes.</span>
            </h2>
            <p className="text-base text-white/88 leading-relaxed max-w-2xl">
              Who they are, where you are, how far it goes — tap to build a premium erotic story written and narrated just for you.
            </p>
            <p className="text-sm text-white/75 leading-relaxed max-w-2xl mt-3">
              Under three minutes to brief · ~10 minutes of full-cast audio in return.
            </p>
          </div>

          <IntensityDial activeIndex={intensityIndex} onChange={handleIntensityChange} />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-10 items-start">
            <div className="space-y-6">
              <BriefBuilder
                selections={selections}
                onChange={handleSelectionsChange}
                onIntensityChange={handleIntensityChange}
              />

              <p className="text-sm text-primary font-medium">
                Over 1 million combinations — <span className="text-white/90">this one is yours alone.</span>
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                <Link href="/after-dark" className="w-full sm:w-auto" onClick={() => saveHomeBrief(selections)}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_0_40px_-8px_hsl(var(--primary)/0.55)]"
                  >
                    <Sparkles className="w-4 h-4" />
                    Bring this brief to life — from {priceDisplay}
                  </motion.button>
                </Link>
                <Link
                  href="/how-it-works"
                  className="text-sm text-white/80 hover:text-primary transition-colors text-center sm:text-left py-2"
                >
                  See every choice →
                </Link>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={JSON.stringify(selections)}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.35 }}
              >
                <div className="relative">
                  <motion.div
                    aria-hidden
                    className="absolute -inset-px rounded-2xl pointer-events-none"
                    animate={{ opacity: [0.4, 0.85, 0.45] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{
                      background: `linear-gradient(135deg, ${INTENSITY_LEVELS[intensityIndex]?.color ?? "#c9a227"}55, transparent 60%)`,
                    }}
                  />
                  <StoryAnatomyCard preset={preset} showMotion={false} />
                </div>
                <p className="text-center text-[10px] text-white/55 mt-3 tracking-wide">
                  Live preview · updates as you tap
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
