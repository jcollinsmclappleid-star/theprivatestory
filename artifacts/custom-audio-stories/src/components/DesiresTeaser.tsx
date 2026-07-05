import { getTagDisplayLabel } from "@/components/StoryTagStudio";

const DESIRE_CHIPS_BY_PAIRING: Record<string, { label: string; tag: string }[]> = {
  default: [
    { label: "Desired", tag: "Desired" },
    { label: "Forbidden", tag: "Forbidden" },
    { label: "Slow build", tag: "Slow Build" },
    { label: "Worshipped", tag: "She wanted to be worshipped" },
    { label: "Praise", tag: "Every compliment specific and earned" },
    { label: "She leads", tag: "She leads" },
  ],
  "Him & Him": [
    { label: "Desired", tag: "Desired" },
    { label: "Forbidden", tag: "Forbidden" },
    { label: "Slow build", tag: "Slow Build" },
    { label: "Worshipped", tag: "He wanted to be worshipped" },
    { label: "He leads", tag: "He leads" },
    { label: "Tender", tag: "The tenderness is the whole thing" },
  ],
  "Them & Them": [
    { label: "Desired", tag: "Desired" },
    { label: "Forbidden", tag: "Forbidden" },
    { label: "Slow build", tag: "Slow Build" },
    { label: "They lead", tag: "They lead" },
    { label: "Electric", tag: "Electric" },
    { label: "Chosen", tag: "Chosen" },
  ],
};

interface DesiresTeaserProps {
  pairing: string;
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export function DesiresTeaser({ pairing, selectedTags, onToggle }: DesiresTeaserProps) {
  const chips =
    DESIRE_CHIPS_BY_PAIRING[pairing] ?? DESIRE_CHIPS_BY_PAIRING.default!;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary mb-1.5">
          Step 4 · Make it yours <span className="text-white/40 font-medium normal-case tracking-normal">(optional)</span>
        </p>
        <p className="text-sm text-white/75 leading-snug">
          The last touch — what you want written in, exactly.{" "}
          <span className="text-white/55">40+ more in the studio.</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map(({ label, tag }) => {
          const selected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                selected
                  ? "border-primary/55 bg-primary/15 text-primary"
                  : "border-white/12 text-white/75 hover:border-primary/30 hover:text-white"
              }`}
            >
              {selected ? getTagDisplayLabel(tag) : label}
            </button>
          );
        })}
      </div>

      {selectedTags.length > 0 && (
        <p className="text-[11px] text-primary/85">
          {selectedTags.length} desire{selectedTags.length === 1 ? "" : "s"} locked in — written exactly as you chose.
        </p>
      )}
    </div>
  );
}
