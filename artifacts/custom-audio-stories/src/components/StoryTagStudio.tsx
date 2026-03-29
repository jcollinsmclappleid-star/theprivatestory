import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface TagCategory {
  heading: string;
  sub?: string;
  tags: string[];
}

type PronounCtx = {
  sub: string;
  obj: string;
  poss: string;
  refl: string;
};

function getPronounCtx(pronouns: string): PronounCtx {
  switch (pronouns) {
    case "he/him":    return { sub: "He",   obj: "him",  poss: "his",   refl: "himself"   };
    case "they/them": return { sub: "They", obj: "them", poss: "their", refl: "themselves" };
    case "you":       return { sub: "You",  obj: "you",  poss: "your",  refl: "yourself"  };
    default:          return { sub: "She",  obj: "her",  poss: "her",   refl: "herself"   };
  }
}

function buildContradictionPairs(p: PronounCtx): [string, string][] {
  return [
    ["Slow simmer", "Quick burn"],
    ["Dialogue-rich", "Mostly sensation"],
    ["Sharp & direct", "Lyrical"],
    [`${p.sub} takes control`, `${p.sub} surrenders completely`],
    [`${p.sub} takes control`, "Being fully taken care of"],
  ];
}

function buildStandardCategories(p: PronounCtx): TagCategory[] {
  return [
    {
      heading: "How do you want to feel?",
      sub: "The emotional register of this story",
      tags: [
        "Desired", "Seen", "Powerful", "Chosen",
        "Adored", "Electric", "Wanted", "Known",
        "Vulnerable", "Held", "Breathless", "Undone",
        "Overwhelmed", "Consumed", "Lit up", "Irreplaceable",
        "Discovered", "Safe",
      ],
    },
    {
      heading: "What's between them?",
      sub: "The energy and tension at the heart of it",
      tags: [
        "Slow Build", "Instant Chemistry", "Forbidden", "Push & Pull",
        "Inevitable", "Unfinished Business", "One night only", "Rivals to lovers",
      ],
    },
    {
      heading: "How do you want it written?",
      sub: "The texture and pacing of the writing",
      tags: [
        "Slow simmer", "Dialogue-rich", "Mostly sensation",
        "Lyrical", "Cinematic", "Sharp & direct",
      ],
    },
    {
      heading: "What makes this yours?",
      sub: "The personal detail that makes it unmistakable",
      tags: [
        "They remind me of someone",
        "It happens just once",
        "It shouldn't have happened",
        "It was always going to happen",
        "The relationship is complicated",
        "No one gets hurt",
      ],
    },
  ];
}

function buildAfterDarkCategories(p: PronounCtx): TagCategory[] {
  return [
    {
      heading: "What do you want?",
      sub: "The things you rarely say out loud",
      tags: [
        `They find every limit ${p.sub} has`,
        `${p.sub} surrenders completely`,
        `${p.sub} loses the fight to stay quiet`,
        `${p.sub} takes control`,
        `They keep ${p.obj} at the edge`,
        "They get caught",
        `${p.sub} doesn't know what comes next`,
        "Being fully taken care of",
      ],
    },
    {
      heading: "How does it end?",
      sub: "The final note of your story",
      tags: [
        `${p.sub} falls asleep in their arms`,
        "They don't leave until morning",
        `${p.sub} asks for more`,
        "No one speaks afterward",
        "They go again immediately",
        `${p.sub} doesn't want it to be over`,
        `They leave — ${p.sub} doesn't stop them`,
        `They stay and ${p.sub}'s surprised`,
        "Left open — mid-scene",
        `${p.sub}'s still feeling it hours later`,
        `${p.sub} texts them before they reach the door`,
        "They lock the door again",
      ],
    },
  ];
}

interface Props {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  afterDark?: boolean;
  accentColor?: string;
  protagonistPronouns?: string;
}

export function StoryTagStudio({
  selectedTags,
  onTagToggle,
  afterDark = false,
  accentColor = "#c9a227",
  protagonistPronouns = "she/her",
}: Props) {
  const { isAuthenticated } = useAuth();
  const [usualTags, setUsualTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/me/taste`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.tasteProfile) {
          const freq = data.tasteProfile as Record<string, number>;
          const top5 = Object.entries(freq)
            .filter(([, count]) => count > 0)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([tag]) => tag);
          setUsualTags(new Set(top5));
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const p = getPronounCtx(protagonistPronouns);
  const categories: TagCategory[] = afterDark
    ? [...buildStandardCategories(p), ...buildAfterDarkCategories(p)]
    : buildStandardCategories(p);
  const contradictionPairs = buildContradictionPairs(p);

  return (
    <div className="space-y-10">
      {categories.map((cat) => {
        return (
          <div key={cat.heading}>
            <p
              className="text-base font-semibold text-foreground mb-1"
            >
              {cat.heading}
            </p>
            {cat.sub && (
              <p className="text-xs text-muted-foreground mb-4 leading-snug">{cat.sub}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {cat.tags.map((tag) => {
                const selected = selectedTags.includes(tag);
                const isUsual = usualTags.has(tag) && !selected;

                const contradictionPartners = contradictionPairs
                  .filter(([a, b]) => a === tag || b === tag)
                  .map(([a, b]) => (a === tag ? b : a));
                const blockedByContradiction = !selected && contradictionPartners.some(
                  partner => cat.tags.includes(partner) && selectedTags.includes(partner)
                );

                const isDisabled = blockedByContradiction;

                return (
                  <span key={tag} className="relative inline-flex flex-col items-start gap-0.5">
                    <button
                      type="button"
                      onClick={() => !isDisabled && onTagToggle(tag)}
                      disabled={isDisabled}
                      title={blockedByContradiction ? "Conflicts with another selection" : undefined}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        selected
                          ? "border-transparent text-black"
                          : isDisabled
                          ? "border-white/5 text-muted-foreground/25 cursor-not-allowed"
                          : isUsual
                          ? "border-primary/40 text-foreground hover:border-primary/60"
                          : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                      }`}
                      style={
                        selected
                          ? { background: accentColor, borderColor: accentColor }
                          : isUsual && !isDisabled
                          ? { background: `${accentColor}14` }
                          : undefined
                      }
                    >
                      {tag}
                    </button>
                    {isUsual && !isDisabled && (
                      <span
                        className="text-[8px] font-semibold uppercase tracking-widest px-1.5 leading-tight"
                        style={{ color: accentColor, opacity: 0.85 }}
                      >
                        Your Usual
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
