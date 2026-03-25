import { useEffect, useState } from "react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface TagCategory {
  heading: string;
  sub?: string;
  tags: string[];
}

const STANDARD_CATEGORIES: TagCategory[] = [
  {
    heading: "What You Want To Feel",
    sub: "The emotional register this story should carry",
    tags: [
      "Desired", "Seen", "Powerful", "Safe", "Vulnerable",
      "Chosen", "Overwhelmed", "Undone", "Adored", "Electric",
    ],
  },
  {
    heading: "The Energy Between Them",
    sub: "How the charge between two people moves",
    tags: [
      "Slow Build", "Instant Chemistry", "Unfinished Business",
      "Old Wounds", "Forbidden", "Push & Pull",
      "Inevitable", "Complicated", "Playful tension", "Bittersweet",
    ],
  },
  {
    heading: "His Presence",
    sub: "The energy he brings into the room",
    tags: [
      "Commanding", "Quiet Intensity", "Gentle", "Protective",
      "Unpredictable", "Brooding", "Playful", "Restrained",
      "Tender", "Obsessive",
    ],
  },
  {
    heading: "Story Texture",
    sub: "How the writing should feel on the page",
    tags: [
      "Dialogue-rich", "Mostly sensation", "Poetic",
      "Sharp & direct", "Dreamlike", "Cinematic",
      "Raw & real", "Intimate & internal", "Lyrical",
    ],
  },
  {
    heading: "Pacing",
    sub: "How the tension moves through the story",
    tags: [
      "Slow simmer", "Quick burn", "Even tension",
      "Agonising build", "All foreplay", "Fast then tender",
      "One long exhale",
    ],
  },
];

const AFTER_DARK_EXTRA_CATEGORIES: TagCategory[] = [
  {
    heading: "What You Want Him To Do",
    sub: "The specific energy you want from him",
    tags: [
      "Takes full control", "Asks permission first", "Pushes limits",
      "Watches closely", "Commands what he wants", "Takes his time",
      "Doesn't stop", "Makes her ask for it", "Holds her in place",
      "Undoes her slowly",
    ],
  },
  {
    heading: "The Scene",
    sub: "Where and how this plays out physically",
    tags: [
      "Slow undressing", "Everything at once", "In the dark",
      "Fully lit", "Against a wall", "In front of a mirror",
      "Barely private", "Somewhere unexpected", "Horizontal",
      "Standing the whole time",
    ],
  },
  {
    heading: "Desire Details",
    sub: "The specific flavour of what she wants",
    tags: [
      "Being told what to do", "Being completely seen",
      "Power fully exchanged", "Nothing off limits",
      "His total attention", "Total surrender",
      "She takes control", "Boundaries dissolved",
      "Watched by someone", "Anonymous desire",
    ],
  },
];

interface Props {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  freeText: string;
  onFreeTextChange: (text: string) => void;
  afterDark?: boolean;
  accentColor?: string;
}

export function StoryTagStudio({
  selectedTags,
  onTagToggle,
  freeText,
  onFreeTextChange,
  afterDark = false,
  accentColor = "#c9a227",
}: Props) {
  const [usualTags, setUsualTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`${API_BASE}/api/me/taste`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.tasteProfile) {
          const freq = data.tasteProfile as Record<string, number>;
          const frequent = new Set(
            Object.entries(freq)
              .filter(([, count]) => count > 0)
              .map(([tag]) => tag)
          );
          setUsualTags(frequent);
        }
      })
      .catch(() => {});
  }, []);

  const categories = afterDark
    ? [...STANDARD_CATEGORIES, ...AFTER_DARK_EXTRA_CATEGORIES]
    : STANDARD_CATEGORIES;

  return (
    <div className="space-y-8">
      {categories.map((cat) => (
        <div key={cat.heading}>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-0.5"
            style={{ color: accentColor }}
          >
            {cat.heading}
          </p>
          {cat.sub && (
            <p className="text-xs text-muted-foreground mb-3 leading-snug">{cat.sub}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {cat.tags.map((tag) => {
              const selected = selectedTags.includes(tag);
              const isUsual = usualTags.has(tag) && !selected;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagToggle(tag)}
                  className={`relative px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selected
                      ? "border-transparent text-black"
                      : isUsual
                      ? "border-primary/40 text-foreground/80 hover:border-primary/60"
                      : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                  }`}
                  style={
                    selected
                      ? { background: accentColor, borderColor: accentColor }
                      : isUsual
                      ? { background: `${accentColor}12` }
                      : undefined
                  }
                  title={isUsual ? "Your usual" : undefined}
                >
                  {tag}
                  {isUsual && (
                    <span
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-background"
                      style={{ background: accentColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="pt-2">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: accentColor }}
        >
          Anything specific? One sentence is enough.
        </p>
        <textarea
          value={freeText}
          onChange={(e) => onFreeTextChange(e.target.value)}
          maxLength={200}
          rows={3}
          placeholder="e.g. He's been watching her for weeks…"
          className="w-full rounded-2xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 px-4 py-3 resize-none focus:outline-none focus:border-white/20 transition-colors leading-relaxed"
        />
      </div>
    </div>
  );
}
