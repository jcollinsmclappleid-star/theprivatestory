import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Flame, UserCircle, MapPin, Volume2, Gauge,
} from "lucide-react";
import type { AnatomyPreset } from "@/components/StoryAnatomy";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const img = (path: string) => `${BASE}/${path.replace(/^\//, "")}`;

type CategoryId = "pairing" | "chemistry" | "archetype" | "setting" | "intensity" | "voice";

type Option = {
  value: string;
  label: string;
  image: string;
  accent: string;
};

const CATEGORIES: {
  id: CategoryId;
  label: string;
  icon: typeof Users;
  axis: string;
  scale: string;
  options: Option[];
}[] = [
  {
    id: "pairing",
    label: "Pairing",
    icon: Users,
    axis: "Pairing",
    scale: "1 of 6",
    options: [
      { value: "Her & Him", label: "Her & Him", image: img("images/chemistry/lovers.webp"), accent: "#e879a0" },
      { value: "Her & Her", label: "Her & Her", image: img("images/seo-body-spa-two-women.png"), accent: "#f472b6" },
      { value: "Her & Him & Him", label: "MFM", image: img("images/rooms/more_than_two.webp"), accent: "#c084fc" },
    ],
  },
  {
    id: "chemistry",
    label: "Chemistry",
    icon: Flame,
    axis: "Chemistry",
    scale: "1 of 8",
    options: [
      { value: "Forbidden Pull", label: "Forbidden", image: img("images/chemistry/forbidden_pull.webp"), accent: "#c9a227" },
      { value: "Power Play", label: "Power", image: img("images/chemistry/power_play.webp"), accent: "#ef4444" },
      { value: "Slow Surrender", label: "Surrender", image: img("images/chemistry/slow_surrender.webp"), accent: "#a78bfa" },
      { value: "Push & Pull", label: "Push & pull", image: img("images/chemistry/push_pull.webp"), accent: "#fb7185" },
    ],
  },
  {
    id: "archetype",
    label: "Archetype",
    icon: UserCircle,
    axis: "Archetype",
    scale: "1 of 19",
    options: [
      { value: "The Executive", label: "Executive", image: img("images/energy/executive.webp"), accent: "#c9a227" },
      { value: "The Professor", label: "Professor", image: img("images/energy/professor.webp"), accent: "#60a5fa" },
      { value: "The Stranger", label: "Stranger", image: img("images/energy/stranger.webp"), accent: "#94a3b8" },
      { value: "The Charmer", label: "Charmer", image: img("images/energy/charmer.webp"), accent: "#f472b6" },
    ],
  },
  {
    id: "setting",
    label: "Setting",
    icon: MapPin,
    axis: "Setting",
    scale: "200+ places",
    options: [
      { value: "Victorian London", label: "Victorian", image: img("images/settings/victorian_london.webp"), accent: "#34d399" },
      { value: "Luxury hotel", label: "Hotel", image: img("images/settings/luxury_hotel.webp"), accent: "#c9a227" },
      { value: "Office after hours", label: "Office", image: img("images/settings/office_after_hours.webp"), accent: "#818cf8" },
      { value: "Private yacht", label: "Yacht", image: img("images/settings/private_yacht.webp"), accent: "#0ea5e9" },
    ],
  },
  {
    id: "intensity",
    label: "Intensity",
    icon: Gauge,
    axis: "Intensity",
    scale: "1 of 4",
    options: [
      { value: "Slow burn", label: "Slow burn", image: img("images/rooms/slow_burn.webp"), accent: "#94a3b8" },
      { value: "Warm", label: "Warm", image: img("images/chemistry/romantic.webp"), accent: "#f97316" },
      { value: "Explicit", label: "Explicit", image: img("images/rooms/dark_territory.webp"), accent: "#e879a0" },
      { value: "Unrestrained", label: "Unrestrained", image: img("images/rooms/power_exchange.webp"), accent: "#c9a227" },
    ],
  },
  {
    id: "voice",
    label: "Narrator",
    icon: Volume2,
    axis: "Voice",
    scale: "1 of 6 narrators",
    options: [
      { value: "Clara", label: "Clara · British", image: img("images/avatar-eleanor.webp"), accent: "#c9a227" },
      { value: "James", label: "James · British", image: img("images/avatar-nathaniel.webp"), accent: "#6b8cce" },
      { value: "Maya", label: "Maya · American", image: img("images/avatar-maya.webp"), accent: "#e879a0" },
      { value: "Theo", label: "Theo · British", image: img("images/avatar-oliver.webp"), accent: "#34d399" },
    ],
  },
];

const TEASERS: Record<string, string> = {
  "Slow burn": "\"They've been circling each other for weeks. Tonight, neither of them left.\"",
  Warm: "\"He shouldn't be in her study. She should have locked the door.\"",
  Explicit: "\"She set the rules. He looked at her like he was already breaking the first one.\"",
  Unrestrained: "\"Two men. One room. She'd had every chance to leave — and hadn't taken one.\"",
};

const DEFAULT_SELECTIONS: Record<CategoryId, string> = {
  pairing: "Her & Him",
  chemistry: "Forbidden Pull",
  archetype: "The Executive",
  setting: "Victorian London",
  intensity: "Warm",
  voice: "Clara",
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
  selections: Record<CategoryId, string>,
  title = "Your story brief",
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
  const intensity = selections.intensity;
  return {
    title,
    teaser: TEASERS[intensity] ?? TEASERS.Warm,
    intensityIndex: intensityToIndex(intensity),
    rows: [
      ...rows,
      { axis: "Ending", value: "You choose", scale: "1 of 7", accent: "#a78bfa" },
      { axis: "Situation", value: "Your scenario", scale: "1 of 200+", accent: "#e11d48" },
    ],
  };
}

function ThemedTile({
  image,
  accent,
  label,
  sublabel,
  selected,
  onClick,
  size = "option",
}: {
  image: string;
  accent: string;
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
  size?: "tab" | "option";
}) {
  const isTab = size === "tab";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: selected ? 1.03 : 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden rounded-xl border text-left transition-shadow ${
        isTab ? "min-h-[84px]" : "w-[112px] sm:w-[120px] shrink-0 snap-start"
      } ${
        selected
          ? "border-primary/70 ring-2 ring-primary/45 shadow-[0_0_28px_-6px_rgba(201,162,39,0.55)]"
          : "border-white/15 hover:border-white/35 hover:shadow-[0_0_20px_-8px_rgba(201,162,39,0.35)]"
      }`}
      style={{
        boxShadow: selected ? `0 0 32px -8px ${accent}88` : undefined,
      }}
    >
      <img
        src={image}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
          selected ? "opacity-90 scale-105" : "opacity-65 group-hover:opacity-80"
        }`}
      />
      <div
        className="absolute inset-0"
        style={{
          background: selected
            ? `linear-gradient(to top, rgba(8,6,4,0.95) 0%, rgba(8,6,4,0.35) 45%, ${accent}22 100%)`
            : "linear-gradient(to top, rgba(8,6,4,0.92) 0%, rgba(8,6,4,0.5) 50%, rgba(8,6,4,0.25) 100%)",
        }}
      />
      {selected && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: `radial-gradient(circle at 50% 20%, ${accent}33 0%, transparent 55%)`,
          }}
        />
      )}
      <div
        className={`relative flex flex-col justify-end h-full ${
          isTab ? "p-2.5 min-h-[84px]" : "aspect-[4/5] p-2.5"
        }`}
      >
        {!isTab && (
          <div
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{
              background: accent,
              boxShadow: selected ? `0 0 10px ${accent}` : undefined,
            }}
          />
        )}
        <span
          className={`font-bold text-white leading-tight ${
            isTab ? "text-[9px] uppercase tracking-wide" : "text-[10px]"
          }`}
        >
          {label}
        </span>
        {sublabel && (
          <span className={`text-white/70 truncate leading-tight ${isTab ? "text-[8px]" : "text-[9px] mt-0.5"}`}>
            {sublabel}
          </span>
        )}
      </div>
    </motion.button>
  );
}

interface BriefBuilderProps {
  selections: Record<CategoryId, string>;
  onChange: (selections: Record<CategoryId, string>) => void;
  onIntensityChange: (index: number) => void;
}

export function BriefBuilder({ selections, onChange, onIntensityChange }: BriefBuilderProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("chemistry");
  const active = CATEGORIES.find((c) => c.id === activeCategory)!;

  const pick = (catId: CategoryId, value: string) => {
    const next = { ...selections, [catId]: value };
    onChange(next);
    if (catId === "intensity") {
      onIntensityChange(intensityToIndex(value));
    }
  };

  const filledCount = useMemo(
    () => Object.keys(selections).length,
    [selections],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary mb-1.5">
            Build your brief — tap to cast
          </p>
          <p className="text-sm text-white/85 leading-snug">
            Every tile updates your story live. This is what the Creation Room feels like.
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
          <span className="text-[9px] text-white/50 ml-1">{filledCount}/6</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const selected = selections[cat.id];
          const opt = cat.options.find((o) => o.value === selected) ?? cat.options[0]!;
          const isActive = activeCategory === cat.id;
          return (
            <div key={cat.id} className="relative">
              <ThemedTile
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
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/55 mb-2.5">
            Choose {active.label.toLowerCase()}
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-brand snap-x snap-mandatory">
            {active.options.map((opt) => (
              <ThemedTile
                key={opt.value}
                image={opt.image}
                accent={opt.accent}
                label={opt.label}
                selected={selections[activeCategory] === opt.value}
                onClick={() => pick(activeCategory, opt.value)}
              />
            ))}
          </div>
          {activeCategory === "intensity" && (
            <motion.p
              key={selections.intensity}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs italic text-white/75 leading-relaxed border-l-2 border-primary/50 pl-3"
            >
              {TEASERS[selections.intensity]}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export { CATEGORIES, DEFAULT_SELECTIONS, type CategoryId };
