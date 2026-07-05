import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Shuffle } from "lucide-react";
import { Link } from "wouter";
import {
  SITUATIONS,
  SITUATION_CATEGORIES,
  type SituationDisplay,
} from "@/data/situations";
import {
  HOME_STUDIO_HANDOFF_KEY,
  interpolateHomeSituation,
  type HomeBrief,
} from "@/lib/homeBriefUtils";
import { saveHomeBrief } from "@/lib/afterDarkExpress";
import {
  situationTileLabel,
  situationVisualMeta,
  SITUATION_CATEGORY_VISUALS,
} from "@/lib/situationImages";
import { VisualChoiceTile } from "@/components/VisualChoiceTile";
import { HorizontalScrollRow } from "@/components/ScrollRowHint";

/** Curated hero situations — one strong pick per popular category. */
export const CURATED_SITUATION_IDS = [
  "fc_01",
  "rr_01",
  "fu_04",
  "pt_03",
  "cp_02",
  "sb_02",
  "pt_01",
  "hd_01",
] as const;

export const HOME_SITUATION_CATEGORIES = SITUATION_CATEGORIES.filter(
  (c) => c !== "Her Desire",
).slice(0, 6);

function eligibleSituations(pairing: string, category?: string): SituationDisplay[] {
  return SITUATIONS.filter((s) => {
    if (category && s.category !== category) return false;
    if (!s.allowedPairings?.length) return true;
    return s.allowedPairings.includes(pairing);
  });
}

export interface SituationVisualPanelProps {
  pairing: string;
  situationId: string;
  situationLabel: string;
  onChange: (id: string, label: string) => void;
  fullBrief: HomeBrief;
  /** Hide “browse all” when already inside full studio (/create). */
  hideBrowseAll?: boolean;
  /** Override preview interpolation (e.g. Casting Room pronouns). */
  previewText?: string;
  /** Cap visible situation cards (homepage mobile). */
  maxItems?: number;
  /** Tighter typography and scroll regions for small screens. */
  compact?: boolean;
}

export function SituationVisualPanel({
  pairing,
  situationId,
  situationLabel,
  onChange,
  fullBrief,
  hideBrowseAll = false,
  previewText: previewTextOverride,
}: SituationVisualPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>(
    () =>
      SITUATIONS.find((s) => s.id === situationId)?.category ??
      HOME_SITUATION_CATEGORIES[0] ??
      SITUATION_CATEGORIES[0]!,
  );

  const curated = useMemo(() => {
    const picks = CURATED_SITUATION_IDS.map((id) => SITUATIONS.find((s) => s.id === id)).filter(
      (s): s is SituationDisplay => !!s,
    );
    return picks.filter(
      (s) => !s.allowedPairings?.length || s.allowedPairings.includes(pairing),
    );
  }, [pairing]);

  const categoryPool = useMemo(
    () => eligibleSituations(pairing, activeCategory),
    [pairing, activeCategory],
  );

  const displayPool = useMemo(() => {
    const pool = categoryPool.length ? categoryPool : curated;
    return pool.slice(0, 10);
  }, [categoryPool, curated]);

  const activeSit = SITUATIONS.find((s) => s.id === situationId);
  const previewText = previewTextOverride ?? (activeSit
    ? interpolateHomeSituation(activeSit, pairing)
    : situationLabel
      ? situationLabel
      : "Choose what happens — or let us surprise you.");

  const heroMeta = situationVisualMeta(
    situationId,
    activeSit?.category ?? activeCategory,
  );

  const pickRandom = () => {
    const pool = eligibleSituations(pairing);
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)]!;
    onChange(pick.id, pick.label);
    setActiveCategory(pick.category);
  };

  const browseAll = () => {
    saveHomeBrief(fullBrief);
    try {
      sessionStorage.setItem(HOME_STUDIO_HANDOFF_KEY, "situation");
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <div id="situation-picker" className="space-y-4 scroll-mt-28">
      <AnimatePresence mode="wait">
        <motion.div
          key={situationId || activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="relative aspect-[16/10] sm:aspect-[2/1] rounded-2xl overflow-hidden border border-white/12"
        >
          <img
            src={heroMeta.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0608] via-[#0a0608]/65 to-[#0a0608]/20" />
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-primary/85 mb-1.5">
              {activeSit?.category ?? activeCategory}
            </p>
            <p className="text-sm md:text-[15px] text-white/95 leading-relaxed italic line-clamp-3">
              &ldquo;{previewText}&rdquo;
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <HorizontalScrollRow className="flex gap-2 overflow-x-auto pb-1 scrollbar-brand snap-x snap-mandatory">
        {HOME_SITUATION_CATEGORIES.map((cat) => {
          const meta = SITUATION_CATEGORY_VISUALS[cat] ?? situationVisualMeta("", cat);
          const short = cat.split(" ")[0] ?? cat;
          return (
            <VisualChoiceTile
              key={cat}
              image={meta.image}
              accent={meta.accent}
              label={short}
              sublabel={cat.split(" ").slice(1).join(" ") || undefined}
              selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              size="tab"
            />
          );
        })}
      </HorizontalScrollRow>

      <HorizontalScrollRow className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-brand snap-x snap-mandatory">
        {displayPool.map((sit) => {
          const meta = situationVisualMeta(sit.id, sit.category);
          return (
            <VisualChoiceTile
              key={sit.id}
              image={meta.image}
              accent={meta.accent}
              label={situationTileLabel(sit.label, 6)}
              selected={situationId === sit.id}
              onClick={() => {
                onChange(sit.id, sit.label);
                setActiveCategory(sit.category);
              }}
              size="scenario"
            />
          );
        })}
      </HorizontalScrollRow>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          type="button"
          onClick={pickRandom}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          Surprise me
        </button>
        {!hideBrowseAll && (
          <Link
            href="/after-dark"
            onClick={browseAll}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/12 text-sm text-white/75 hover:text-primary hover:border-primary/30 transition-colors"
          >
            Browse all 200+ situations
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

/** Text-first situation picker — literary excerpts, no scene imagery. */
export function SituationLiteraryPanel({
  pairing,
  situationId,
  situationLabel,
  onChange,
  fullBrief,
  hideBrowseAll = false,
  previewText: previewTextOverride,
  maxItems = 8,
  compact = false,
}: SituationVisualPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>(
    () =>
      SITUATIONS.find((s) => s.id === situationId)?.category ??
      HOME_SITUATION_CATEGORIES[0] ??
      SITUATION_CATEGORIES[0]!,
  );

  const curated = useMemo(() => {
    const picks = CURATED_SITUATION_IDS.map((id) => SITUATIONS.find((s) => s.id === id)).filter(
      (s): s is SituationDisplay => !!s,
    );
    return picks.filter(
      (s) => !s.allowedPairings?.length || s.allowedPairings.includes(pairing),
    );
  }, [pairing]);

  const categoryPool = useMemo(
    () => eligibleSituations(pairing, activeCategory),
    [pairing, activeCategory],
  );

  const displayPool = useMemo(() => {
    const pool = categoryPool.length ? categoryPool : curated;
    return pool.slice(0, maxItems);
  }, [categoryPool, curated, maxItems]);

  const activeSit = SITUATIONS.find((s) => s.id === situationId);
  const previewText = previewTextOverride ?? (activeSit
    ? interpolateHomeSituation(activeSit, pairing)
    : situationLabel
      ? situationLabel
      : "Choose what happens — or let us surprise you.");

  const pickRandom = () => {
    const pool = eligibleSituations(pairing);
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)]!;
    onChange(pick.id, pick.label);
    setActiveCategory(pick.category);
  };

  const browseAll = () => {
    saveHomeBrief(fullBrief);
    try {
      sessionStorage.setItem(HOME_STUDIO_HANDOFF_KEY, "situation");
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <div id="situation-picker" className="space-y-3 md:space-y-4 scroll-mt-28">
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={situationId || activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28 }}
          className={`relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent ${
            compact ? "px-4 py-4" : "px-5 py-5 md:px-6 md:py-6"
          }`}
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-primary/80 mb-1.5">
            {activeSit?.category ?? activeCategory}
            {activeSit?.label ? ` · ${activeSit.label}` : ""}
          </p>
          <p
            className={`font-display text-white/95 leading-relaxed italic ${
              compact ? "text-[15px] leading-snug line-clamp-4" : "text-lg md:text-xl"
            }`}
          >
            &ldquo;{previewText}&rdquo;
          </p>
        </motion.blockquote>
      </AnimatePresence>

      <HorizontalScrollRow className="flex gap-2 overflow-x-auto pb-1 scrollbar-brand snap-x snap-mandatory -mx-1 px-1">
        {HOME_SITUATION_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 snap-start px-3 py-2 rounded-full text-[11px] font-semibold border transition-colors whitespace-nowrap ${
              activeCategory === cat
                ? "border-primary/50 bg-primary/12 text-primary"
                : "border-white/12 text-white/65 hover:border-primary/25 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </HorizontalScrollRow>

      <div
        className={`space-y-2 ${
          compact ? "max-h-[min(42vh,320px)] overflow-y-auto pr-0.5 scrollbar-brand" : ""
        }`}
      >
        {displayPool.map((sit) => {
          const excerpt = interpolateHomeSituation(sit, pairing);
          const selected = situationId === sit.id;
          return (
            <button
              key={sit.id}
              type="button"
              onClick={() => {
                onChange(sit.id, sit.label);
                setActiveCategory(sit.category);
              }}
              className={`w-full text-left rounded-xl border transition-all active:scale-[0.99] ${
                compact ? "px-3 py-2.5" : "px-4 py-3"
              } ${
                selected
                  ? "border-primary/45 bg-primary/[0.08]"
                  : "border-white/10 bg-white/[0.02] hover:border-primary/25"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary/75 mb-0.5">
                {sit.label}
              </p>
              <p
                className={`text-white/80 leading-snug italic ${
                  compact ? "text-[12px] line-clamp-2" : "text-[13px] line-clamp-2"
                }`}
              >
                &ldquo;{excerpt}&rdquo;
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          type="button"
          onClick={pickRandom}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl border border-primary/30 bg-primary/5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors min-h-[44px] sm:min-h-0"
        >
          <Shuffle className="w-4 h-4" />
          Surprise me
        </button>
        {!hideBrowseAll && (
          <Link
            href="/after-dark"
            onClick={browseAll}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/12 text-sm text-white/75 hover:text-primary hover:border-primary/30 transition-colors"
          >
            Browse all 200+ situations
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

/** @deprecated use SituationVisualPanel */
export const SituationPicker = SituationVisualPanel;
