import type { CastCategoryId } from "@/components/BriefBuilder";

export const CREATION_ROOM_FOCUS_EVENT = "creation-room-focus";

export const HERO_CHOICE_CHIPS: { label: string; category: CastCategoryId | "situation" }[] = [
  { label: "Who you're with", category: "pairing" },
  { label: "The tension", category: "chemistry" },
  { label: "Who they are", category: "archetype" },
  { label: "Where it happens", category: "setting" },
  { label: "The situation", category: "situation" },
  { label: "Who tells it", category: "voice" },
];

export function scrollToCreationCategory(category: CastCategoryId | "situation") {
  if (category === "situation") {
    document.getElementById("creation-step-situation")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  window.dispatchEvent(new CustomEvent(CREATION_ROOM_FOCUS_EVENT, { detail: category }));
  document.getElementById("creation-room")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

interface HeroChoiceChipsProps {
  className?: string;
}

export function HeroChoiceChips({ className = "" }: HeroChoiceChipsProps) {
  return (
    <div className={className}>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/85 mb-2.5">
        Create your spicy fantasy
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {HERO_CHOICE_CHIPS.map((chip, i) => (
          <button
            key={`${chip.category}-${i}`}
            type="button"
            onClick={() => scrollToCreationCategory(chip.category)}
            className="rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-left transition-colors hover:border-primary/35 hover:bg-primary/[0.06] active:scale-[0.98]"
          >
            <span className="block text-[11px] font-semibold text-white/92 leading-snug">{chip.label}</span>
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-[10px] text-white/50 leading-snug">
        Over a million ways to combine them — each story written fresh.
      </p>
    </div>
  );
}
