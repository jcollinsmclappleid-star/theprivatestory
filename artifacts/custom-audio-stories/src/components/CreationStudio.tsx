import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { StoryAnatomyCard } from "@/components/StoryAnatomy";
import { IntensityDial, INTENSITY_LEVELS } from "@/components/IntensityDial";
import {
  BriefBuilder,
  buildPresetFromSelections,
  DEFAULT_CAST_SELECTIONS,
  intensityToIndex,
} from "@/components/BriefBuilder";
import { DesiresTeaser } from "@/components/DesiresTeaser";
import { CreativityStrip } from "@/components/CreativityStrip";
import { HeroLivingPortrait } from "@/components/HeroLivingPortrait";
import { CreationStepRail } from "@/components/CreationStepRail";
import { SituationLiteraryPanel } from "@/components/SituationPicker";
import { saveHomeBrief } from "@/lib/afterDarkExpress";
import { buildLiveBriefSentence, type HomeBrief } from "@/lib/homeBriefUtils";
import { SITUATIONS } from "@/data/situations";

interface CreationStudioProps {
  priceDisplay: string;
}

const AUTO_CYCLE_MS = 3200;
const AUTO_PAUSE_MS = 12000;

const DEFAULT_SITUATION_ID = "fc_01";

export function CreationStudio({ priceDisplay }: CreationStudioProps) {
  const reduceMotion = useReducedMotion();
  const [selections, setSelections] = useState(DEFAULT_CAST_SELECTIONS);
  const [intensityIndex, setIntensityIndex] = useState(1);
  const [situationId, setSituationId] = useState(DEFAULT_SITUATION_ID);
  const [situationLabel, setSituationLabel] = useState(
    () => SITUATIONS.find((s) => s.id === DEFAULT_SITUATION_ID)?.label ?? "",
  );
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [mobileRefineOpen, setMobileRefineOpen] = useState(false);
  const autoPausedUntil = useRef(0);

  const intensityLabel = INTENSITY_LEVELS[intensityIndex]?.label ?? "Warm";

  const fullBrief: HomeBrief = useMemo(
    () => ({
      ...selections,
      intensity: intensityLabel,
      situationId: situationId || undefined,
      situationLabel: situationLabel || undefined,
      customTags: customTags.length ? customTags : undefined,
    }),
    [selections, intensityLabel, situationId, situationLabel, customTags],
  );

  const activeCreativityKeys = useMemo(() => {
    const keys = new Set<string>(["pairing", "chemistry", "archetype", "setting", "voice", "intensity"]);
    if (situationId) keys.add("situation");
    if (customTags.length) keys.add("desires");
    return keys;
  }, [situationId, customTags.length]);

  const liveSentence = useMemo(() => buildLiveBriefSentence(fullBrief), [fullBrief]);

  const preset = buildPresetFromSelections(selections, {
    intensity: intensityLabel,
    situationLabel: situationLabel || undefined,
    customTagCount: customTags.length || undefined,
  });

  const persistBrief = useCallback(() => {
    saveHomeBrief(fullBrief);
  }, [fullBrief]);

  const pauseAutoCycle = useCallback(() => {
    autoPausedUntil.current = Date.now() + AUTO_PAUSE_MS;
  }, []);

  const handleIntensityChange = useCallback((index: number) => {
    pauseAutoCycle();
    setIntensityIndex(index);
  }, [pauseAutoCycle]);

  const handleSituationChange = useCallback((id: string, label: string) => {
    pauseAutoCycle();
    setSituationId(id);
    setSituationLabel(label);
  }, [pauseAutoCycle]);

  const handleDesireToggle = useCallback((tag: string) => {
    pauseAutoCycle();
    setCustomTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 4),
    );
  }, [pauseAutoCycle]);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      if (Date.now() < autoPausedUntil.current) return;
      setIntensityIndex((prev) => (prev + 1) % INTENSITY_LEVELS.length);
    }, AUTO_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <section id="creation-room" className="relative py-1 md:py-8 px-3 md:px-8 max-w-7xl mx-auto w-full scroll-mt-20">
      <div className="relative rounded-3xl border border-primary/30 bg-[#120a14]/95 overflow-hidden shadow-[0_0_80px_-24px_hsl(var(--primary)/0.45)]">
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse at 15% 0%, hsl(var(--primary) / 0.14) 0%, transparent 50%), radial-gradient(ellipse at 95% 100%, rgba(180,90,110,0.14) 0%, transparent 45%)",
          }}
        />

        <div className="relative p-4 md:p-10 lg:p-12 space-y-5 md:space-y-10">
          <CreationStepRail className="mb-2 md:mb-4" />
          <CreativityStrip activeKeys={activeCreativityKeys} className="hidden md:block" />

          <BriefBuilder
            selections={selections}
            onChange={setSelections}
            hideStudioHints
            showcaseMode
          />

          <div id="creation-step-intensity" className="space-y-3 scroll-mt-24 pt-2 border-t border-white/8">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Step 2 · How explicit?
            </p>
            <IntensityDial activeIndex={intensityIndex} onChange={handleIntensityChange} />
          </div>

          {/* Mobile — convert after demo; optional refinements collapsed */}
          <div className="md:hidden rounded-2xl border border-primary/30 bg-primary/[0.06] p-4 space-y-3 scroll-mt-4">
            <p className="text-xs text-white/70 leading-relaxed border-l-2 border-primary/40 pl-3 italic line-clamp-3">
              {liveSentence}
            </p>
            <Link href="/after-dark" className="block w-full" onClick={persistBrief}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-primary text-primary-foreground shadow-[0_0_32px_-8px_hsl(var(--primary)/0.55)] min-h-[48px]"
              >
                <Sparkles className="w-4 h-4" />
                Bring this brief to life — from {priceDisplay}
              </motion.button>
            </Link>
            <p className="text-[10px] text-center text-white/45">
              Situation &amp; personal touches optional below
            </p>
          </div>

          <div className="md:hidden pt-1">
            <button
              type="button"
              onClick={() => setMobileRefineOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-left min-h-[44px]"
            >
              <span className="text-[11px] font-semibold text-white/80">
                Refine situation &amp; make it yours
                <span className="text-white/45 font-normal"> · optional</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-primary/70 flex-shrink-0 transition-transform ${
                  mobileRefineOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <div className={`space-y-5 md:space-y-0 ${mobileRefineOpen ? "block" : "hidden md:block"}`}>
            <div id="creation-step-situation" className="space-y-4 scroll-mt-24 pt-2 md:border-t border-white/8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary mb-1">
                  Step 3 · The situation
                </p>
                <p className="text-[13px] md:text-sm text-white/85 leading-snug">
                  The literary setup — who wants what, and what&apos;s at stake.{" "}
                  <span className="text-white/55">Written in your pronouns.</span>
                </p>
              </div>
              <SituationLiteraryPanel
                pairing={selections.pairing}
                situationId={situationId}
                situationLabel={situationLabel}
                onChange={handleSituationChange}
                fullBrief={fullBrief}
                hideBrowseAll
                compact
                maxItems={4}
              />
            </div>

            <div id="creation-step-desires" className="scroll-mt-24 pt-2 md:border-t border-white/8">
              <DesiresTeaser
                pairing={selections.pairing}
                selectedTags={customTags}
                onToggle={handleDesireToggle}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-primary/25 bg-primary/[0.04] p-4 md:p-5 space-y-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight mb-2">
                Shape it.{" "}
                <span className="text-primary">Listen in minutes.</span>
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Under three minutes to brief · ~10 minutes of full-cast audio in return.
              </p>
            </div>

            <p className="text-xs text-white/70 leading-relaxed border-l-2 border-primary/40 pl-3 italic">
              {liveSentence}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-6 lg:gap-8 items-start">
              <div className="space-y-4 order-2 lg:order-1">
                <p className="text-sm text-primary font-medium">
                  Over 1 million combinations — <span className="text-white/90">this one is yours alone.</span>
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                  <Link href="/after-dark" className="w-full sm:w-auto hidden md:block" onClick={persistBrief}>
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
                  <Link href="/after-dark" className="w-full md:hidden" onClick={persistBrief}>
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-primary text-primary-foreground shadow-[0_0_40px_-8px_hsl(var(--primary)/0.55)] min-h-[48px]"
                    >
                      <Sparkles className="w-4 h-4" />
                      Continue with this brief
                    </button>
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
                  key={JSON.stringify({ selections, situationId, intensityIndex, customTags })}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.99 }}
                  transition={{ duration: 0.35 }}
                  className="order-1 lg:order-2"
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

          <div className="pt-2 hidden md:block">
            <HeroLivingPortrait variant="contained" className="w-full max-w-2xl mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
