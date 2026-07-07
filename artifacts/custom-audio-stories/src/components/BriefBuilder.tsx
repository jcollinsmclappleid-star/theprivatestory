import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Flame, UserCircle, MapPin, Volume2,
} from "lucide-react";
import type { AnatomyPreset } from "@/components/StoryAnatomy";
import { HOME_STUDIO_IMAGES } from "@/lib/chemistryImages";
import { CREATION_ROOM_FOCUS_EVENT } from "@/components/HeroChoiceChips";
import { HorizontalScrollRow } from "@/components/ScrollRowHint";
import { VisualChoiceTile } from "@/components/VisualChoiceTile";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const img = (path: string) => `${BASE}/${path.replace(/^\//, "")}`;

export type CastCategoryId = "pairing" | "chemistry" | "archetype" | "setting" | "voice";
export type CategoryId = CastCategoryId | "intensity";

type Option = {
  value: string;
  label: string;
  image: string;
  accent: string;
};

const CATEGORIES: {
  id: CastCategoryId;
  label: string;
  icon: typeof Users;
  axis: string;
  scale: string;
  moreLabel?: string;
  options: Option[];
}[] = [
  {
    id: "pairing",
    label: "Who you're with",
    icon: Users,
    axis: "Who you're with",
    scale: "6 ways",
    moreLabel: "+3 more in studio",
    options: [
      { value: "Her & Him", label: "Her & Him", image: img(HOME_STUDIO_IMAGES.pairing.herHim), accent: "#e879a0" },
      { value: "Her & Her", label: "Her & Her", image: img(HOME_STUDIO_IMAGES.pairing.herHer), accent: "#f472b6" },
      { value: "Her & Him & Him", label: "MFM", image: img(HOME_STUDIO_IMAGES.pairing.mfm), accent: "#c084fc" },
    ],
  },
  {
    id: "chemistry",
    label: "The tension",
    icon: Flame,
    axis: "The tension",
    scale: "8 dynamics",
    moreLabel: "+4 more in studio",
    options: [
      { value: "Forbidden Pull", label: "Forbidden", image: img(HOME_STUDIO_IMAGES.chemistry.forbidden), accent: "#c9a227" },
      { value: "Power Play", label: "Power", image: img(HOME_STUDIO_IMAGES.chemistry.power), accent: "#ef4444" },
      { value: "Slow Surrender", label: "Surrender", image: img(HOME_STUDIO_IMAGES.chemistry.surrender), accent: "#a78bfa" },
      { value: "Push & Pull", label: "Push & pull", image: img(HOME_STUDIO_IMAGES.chemistry.pushPull), accent: "#fb7185" },
    ],
  },
  {
    id: "archetype",
    label: "Who they are",
    icon: UserCircle,
    axis: "Who they are",
    scale: "19 types",
    moreLabel: "+15 more in studio",
    options: [
      { value: "The Executive", label: "Executive", image: img(HOME_STUDIO_IMAGES.archetype.executive), accent: "#c9a227" },
      { value: "The Professor", label: "Professor", image: img(HOME_STUDIO_IMAGES.archetype.professor), accent: "#60a5fa" },
      { value: "The Stranger", label: "Stranger", image: img(HOME_STUDIO_IMAGES.archetype.stranger), accent: "#94a3b8" },
      { value: "The Charmer", label: "Charmer", image: img(HOME_STUDIO_IMAGES.archetype.charmer), accent: "#f472b6" },
    ],
  },
  {
    id: "setting",
    label: "Where it happens",
    icon: MapPin,
    axis: "Where it happens",
    scale: "200+ places",
    moreLabel: "+196 more in studio",
    options: [
      { value: "Victorian London", label: "Victorian", image: img("images/settings/victorian_london.webp"), accent: "#34d399" },
      { value: "Luxury hotel", label: "Hotel", image: img("images/settings/luxury_hotel.webp"), accent: "#c9a227" },
      { value: "Office after hours", label: "Office", image: img("images/settings/office_after_hours.webp"), accent: "#818cf8" },
      { value: "Private yacht", label: "Yacht", image: img("images/settings/private_yacht.webp"), accent: "#0ea5e9" },
    ],
  },
  {
    id: "voice",
    label: "Who tells it",
    icon: Volume2,
    axis: "Who tells it",
    scale: "5 narrators",
    options: [
      { value: "Lisa", label: "Lisa · American", image: img("images/avatar-isla.webp"), accent: "#e879a0" },
      { value: "Theo", label: "Theo · British", image: img("images/avatar-oliver.webp"), accent: "#34d399" },
      { value: "Maya", label: "Maya · American", image: img("images/avatar-maya.webp"), accent: "#f472b6" },
      { value: "James", label: "James · British", image: img("images/avatar-nathaniel.webp"), accent: "#6b8cce" },
      { value: "Sofia", label: "Sofia · Latina", image: img("images/avatar-eleanor.webp"), accent: "#c9a227" },
    ],
  },
];

const CATEGORY_PROMPTS: Record<CastCategoryId, string> = {
  pairing: "Who's in this fantasy?",
  chemistry: "What's the pull between you?",
  archetype: "Stranger, executive, old friend…",
  setting: "Hotel, office, your city…",
  voice: "Pick the voice in your ear",
};

const TEASERS: Record<string, string> = {
  "Slow burn": "\"They've been circling each other for weeks. Neither of them left.\"",
  Warm: "\"He shouldn't be in her study. She should have locked the door.\"",
  Explicit: "\"She set the rules. He looked at her like he was already breaking the first one.\"",
  Unrestrained: "\"Two men. One room. She'd had every chance to leave — and hadn't taken one.\"",
};

export const DEFAULT_CAST_SELECTIONS: Record<CastCategoryId, string> = {
  pairing: "Her & Him",
  chemistry: "Forbidden Pull",
  archetype: "The Executive",
  setting: "Victorian London",
  voice: "Lisa",
};

/** @deprecated use DEFAULT_CAST_SELECTIONS — kept for callers expecting intensity key */
export const DEFAULT_SELECTIONS: Record<CategoryId, string> = {
  ...DEFAULT_CAST_SELECTIONS,
  intensity: "Warm",
};

export function intensityToIndex(value: string): number {
  const map: Record<string, number> = {
    "Slow burn": 0,
    Warm: 1,
    Explicit: 2,
    Unrestrained: 3,
  };
  return map[value] ?? 1;
}

export function buildPresetFromSelections(
  selections: Record<CastCategoryId, string>,
  opts?: {
    intensity?: string;
    situationLabel?: string;
    customTagCount?: number;
    title?: string;
  },
): AnatomyPreset {
  const rows = CATEGORIES.map((cat) => {
    const opt = cat.options.find((o) => o.value === selections[cat.id]) ?? cat.options[0]!;
    return {
      axis: cat.axis,
      value: opt.value,
      scale: cat.scale,
      accent: opt.accent,
    };
  });
  const intensity = opts?.intensity ?? "Warm";
  const extraRows = [
    {
      axis: "Situation",
      value: opts?.situationLabel ?? "Choose your situation",
      scale: "1 of 200+",
      accent: "#e11d48",
    },
    {
      axis: "Intensity",
      value: intensity,
      scale: "1 of 4",
      accent: "#f97316",
    },
    {
      axis: "Ending",
      value: "You choose",
      scale: "1 of 7",
      accent: "#a78bfa",
    },
  ];
  if (opts?.customTagCount && opts.customTagCount > 0) {
    extraRows.push({
      axis: "Desires",
      value: `${opts.customTagCount} chosen`,
      scale: "40+ available",
      accent: "#c9a227",
    });
  }
  return {
    title: opts?.title ?? "Your story brief",
    teaser: TEASERS[intensity] ?? TEASERS.Warm,
    intensityIndex: intensityToIndex(intensity),
    rows: [...rows, ...extraRows],
  };
}

interface BriefBuilderProps {
  selections: Record<CastCategoryId, string>;
  onChange: (selections: Record<CastCategoryId, string>) => void;
  /** Hide “+N more in studio” hints (homepage mobile funnel). */
  hideStudioHints?: boolean;
  /** Homepage demo — emphasise visual creativity showcase. */
  showcaseMode?: boolean;
}

export function BriefBuilder({
  selections,
  onChange,
  hideStudioHints = false,
  showcaseMode = false,
}: BriefBuilderProps) {
  const [activeCategory, setActiveCategory] = useState<CastCategoryId>("chemistry");

  useEffect(() => {
    const handler = (e: Event) => {
      const cat = (e as CustomEvent<CastCategoryId>).detail;
      if (cat && CATEGORIES.some((c) => c.id === cat)) {
        setActiveCategory(cat);
      }
    };
    window.addEventListener(CREATION_ROOM_FOCUS_EVENT, handler);
    return () => window.removeEventListener(CREATION_ROOM_FOCUS_EVENT, handler);
  }, []);

  const pick = (catId: CastCategoryId, value: string) => {
    onChange({ ...selections, [catId]: value });
  };

  const filledCount = useMemo(() => Object.keys(selections).length, [selections]);
  const active = CATEGORIES.find((c) => c.id === activeCategory)!;

  return (
    <div id="creation-step-fantasy" className="space-y-4 md:space-y-5 scroll-mt-24">
      {showcaseMode && (
        <div className="rounded-xl border border-primary/25 bg-primary/[0.06] px-3 py-2 flex items-center gap-2">
          <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-primary/15 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-primary">
            Live demo
          </span>
          <p className="text-[11px] sm:text-[12px] text-white/75 leading-snug">
            <span className="hidden sm:inline">Images show the </span>
            <span className="text-white/90">creative range</span>
            <span className="hidden sm:inline"> — every tap reshapes your story.</span>
            <span className="sm:hidden"> — tap to explore.</span>
          </p>
        </div>
      )}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary mb-1 md:mb-1.5">
            {showcaseMode ? "Step 1 · Your fantasy" : "Step 1 · Build your cast"}
          </p>
          <p className="text-[13px] md:text-sm text-white/85 leading-snug">
            {showcaseMode
              ? "Explore the visual palette — this is what we can write for you."
              : "Tap each piece — pairing, tension, character, place, voice."}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                selections[cat.id] ? "bg-primary" : "bg-white/20"
              }`}
              aria-hidden
            />
          ))}
          <span className="text-[9px] text-white/50 ml-1">{filledCount}/5</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const selected = selections[cat.id];
          const opt = cat.options.find((o) => o.value === selected) ?? cat.options[0]!;
          const isActive = activeCategory === cat.id;
          return (
            <div key={cat.id} className="relative">
              <VisualChoiceTile
                image={opt.image}
                accent={opt.accent}
                label={cat.label}
                sublabel={opt.label}
                selected={isActive}
                onClick={() => setActiveCategory(cat.id)}
                size="tab"
              />
              <Icon
                className="absolute top-2 left-2 w-3 h-3 z-10 pointer-events-none drop-shadow"
                style={{ color: opt.accent }}
              />
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <div className="flex items-baseline justify-between gap-2 mb-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/55">
              {showcaseMode ? (
                <>
                  <span className="text-primary/80">Visual · </span>
                  {active.label} · {active.scale}
                </>
              ) : (
                <>{active.label} · {active.scale}</>
              )}
            </p>
            {active.moreLabel && !hideStudioHints && (
              <p className="text-[9px] text-primary/70">{active.moreLabel}</p>
            )}
          </div>
          <p className="text-[11px] text-white/65 mb-2.5 leading-snug">{CATEGORY_PROMPTS[activeCategory]}</p>
          <HorizontalScrollRow className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-brand snap-x snap-mandatory">
            {active.options.map((opt) => (
              <VisualChoiceTile
                key={opt.value}
                image={opt.image}
                accent={opt.accent}
                label={opt.label}
                selected={selections[activeCategory] === opt.value}
                onClick={() => pick(activeCategory, opt.value)}
              />
            ))}
          </HorizontalScrollRow>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export { CATEGORIES };
