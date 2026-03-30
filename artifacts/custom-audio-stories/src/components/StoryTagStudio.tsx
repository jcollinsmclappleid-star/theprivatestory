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

function buildContradictionPairs(_p: PronounCtx): [string, string][] {
  return [
    ["Slow simmer", "Quick burn"],
    ["Dialogue-rich", "Mostly sensation"],
    ["Sharp & direct", "Lyrical"],
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
    {
      heading: "What does she really want?",
      sub: "The desire at the core of it",
      tags: [
        "She leads",
        "She initiates",
        "She sets the terms",
        "She stays in control",
        "She chooses how far it goes",
        "She makes the first move",
        "She gives control over completely",
        "She lets herself go",
        "She doesn't have to think",
        "She lets herself be taken care of",
        "She's wanted this for a long time",
        "She comes back for more",
        "This is the version she never admits to",
        "She doesn't feel guilty",
        "It changes something in her",
        "She owns what she wants",
      ],
    },
    {
      heading: "Pure Romance",
      sub: "When tenderness is the whole story",
      tags: [
        "The tenderness is the whole thing",
        "He treats her like the only thing in the room",
        "Slow hands, full attention",
        "She feels adored, not just wanted",
        "Every gesture deliberate",
        "He remembers what she said",
        "Romance that earns what follows",
        "Softness that doesn't break",
      ],
    },
    {
      heading: "Fantasy & The Impossible",
      sub: "When reality is negotiable",
      tags: [
        "He's not entirely human",
        "The rules of this world don't apply here",
        "Time works differently",
        "She has power neither of them can explain",
        "No consequences, no morning",
        "He can sense what she needs",
        "The impossible is part of why it works",
        "Magic, mythology, something older",
      ],
    },
    {
      heading: "Praise & Devotion",
      sub: "When being wanted is its own kind of story",
      tags: [
        "He can't stop looking at her",
        "She is the obsession and she knows it",
        "He catalogues everything about her",
        "Every compliment specific and earned",
        "He makes her feel like a revelation",
        "The devotion is the whole story",
        "He names what he sees in her",
        "She is everything and he tells her",
      ],
    },
    {
      heading: "Story Arc & Plot",
      sub: "For stories with something more to say",
      tags: [
        "There's a complication first",
        "The obstacle makes the ending better",
        "Second chance — different this time",
        "They almost didn't make it",
        "The misunderstanding that almost cost everything",
        "The story earns its ending",
        "Feelings are the whole problem",
        "Something between them that neither will say",
      ],
    },
  ];
}

function buildAfterDarkCategories(p: PronounCtx): TagCategory[] {
  return [
    {
      heading: "Sensation & Restraint",
      sub: "The things you rarely say out loud",
      tags: [
        `${p.sub} wanted to be tied up`,
        `${p.sub} wanted to be blindfolded`,
        `${p.sub} wanted to be held down`,
        `${p.sub} wanted to be told not to move`,
        `${p.sub} wanted ${p.poss} mouth covered`,
        `${p.sub} wanted to be on display`,
        `${p.sub} wanted to be kneeling for them`,
        `${p.sub} wanted to be completely powerless`,
        `${p.sub} wanted something around ${p.poss} wrists`,
        `${p.sub} wanted to be undressed very slowly`,
        `${p.sub} wanted to be kept completely still`,
        `${p.sub} wanted to be wrapped and contained`,
      ],
    },
    {
      heading: "Words & Praise",
      sub: "What you want said while it happens",
      tags: [
        `${p.sub} wanted to be praised`,
        `${p.sub} wanted to be told what ${p.sub} is`,
        `${p.sub} wanted to be narrated through it`,
        `${p.sub} wanted to be made to ask nicely`,
        `${p.sub} wanted to be made to repeat it back`,
        `${p.sub} wanted to be told ${p.refl} was perfect`,
        `${p.sub} wanted every moment described as it happened`,
        `${p.sub} wanted to hear how much they needed ${p.obj}`,
        `${p.sub} wanted to be called ${p.poss} name when it happened`,
      ],
    },
    {
      heading: "Surrender & Power",
      sub: "How deep the surrender goes",
      tags: [
        `${p.sub} wanted to be degraded`,
        `${p.sub} wanted to be spanked`,
        `${p.sub} wanted to be edged`,
        `${p.sub} wanted to be worshipped`,
        `${p.sub} wanted to be used and adored`,
        `${p.sub} wanted to be made to beg`,
      ],
    },
    {
      heading: "Dark Fantasy",
      sub: "When the fantasy doesn't follow natural rules",
      tags: [
        `${p.sub} wanted something that wasn't entirely human`,
        `${p.sub} wanted to be claimed by something ancient and certain`,
        `${p.sub} wanted the rules of this world suspended`,
        `${p.sub} wanted power that couldn't be explained`,
        `${p.sub} wanted to be taken somewhere impossible`,
      ],
    },
    {
      heading: "Just the Scene",
      sub: "No buildup. Start in the middle of it.",
      tags: [
        "No backstory — start in the moment",
        "Skip the tension — we're already there",
        "Pure sensation, nothing required before it",
        "Just the part that matters",
        "In medias res — already past the beginning",
        "No plot, no premise — just this",
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

function buildNocturneCategory(): TagCategory {
  return {
    heading: "What do you need tonight?",
    sub: "The specific version of tonight you're carrying into sleep",
    tags: [
      "The day is done and you can finally stop",
      "Company without performance",
      "Warmth, no urgency",
      "Someone present, nothing required",
      "Slow enough to drift",
      "Just enough tension to carry you somewhere else",
      "The quiet kind of wanted",
      "Something to fall into",
      "Rest that comes from connection",
      "A voice that takes its time",
    ],
  };
}

interface Props {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  afterDark?: boolean;
  bedtime?: boolean;
  accentColor?: string;
  protagonistPronouns?: string;
}

export function StoryTagStudio({
  selectedTags,
  onTagToggle,
  afterDark = false,
  bedtime = false,
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

  // Bedtime (Drift) mode: only the nocturne category is active.
  // Standard/After Dark categories are shown greyed-out so the user can
  // see they exist but understand they don't belong in a drift-to-sleep story.
  const activeCategories: TagCategory[] = afterDark
    ? [...buildStandardCategories(p), ...buildAfterDarkCategories(p)]
    : bedtime
    ? [buildNocturneCategory()]
    : buildStandardCategories(p);

  const lockedCategories: TagCategory[] = bedtime ? buildStandardCategories(p) : [];

  const contradictionPairs = buildContradictionPairs(p);

  function renderTag(tag: string, catTags: string[], locked: boolean) {
    const selected = !locked && selectedTags.includes(tag);
    const isUsual = !locked && usualTags.has(tag) && !selected;

    const contradictionPartners = contradictionPairs
      .filter(([a, b]) => a === tag || b === tag)
      .map(([a, b]) => (a === tag ? b : a));
    const blockedByContradiction = !selected && contradictionPartners.some(
      partner => catTags.includes(partner) && selectedTags.includes(partner)
    );

    const isDisabled = locked || blockedByContradiction;
    const titleText = locked
      ? "Not available in Drift mode"
      : blockedByContradiction
      ? "Conflicts with another selection"
      : undefined;

    return (
      <span key={tag} className="relative inline-flex flex-col items-start gap-0.5">
        <button
          type="button"
          onClick={() => !isDisabled && onTagToggle(tag)}
          disabled={isDisabled}
          title={titleText}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            selected
              ? "border-transparent text-black"
              : isDisabled
              ? "border-white/5 text-muted-foreground/20 cursor-not-allowed"
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
  }

  return (
    <div className="space-y-10">
      {activeCategories.map((cat) => (
        <div key={cat.heading}>
          <p className="text-base font-semibold text-foreground mb-1">{cat.heading}</p>
          {cat.sub && (
            <p className="text-xs text-muted-foreground mb-4 leading-snug">{cat.sub}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {cat.tags.map((tag) => renderTag(tag, cat.tags, false))}
          </div>
        </div>
      ))}

      {lockedCategories.length > 0 && (
        <div className="mt-8 pt-8 border-t border-white/6">
          <p className="text-xs text-muted-foreground/40 uppercase tracking-widest font-semibold mb-1">
            Not available in Drift mode
          </p>
          <p className="text-xs text-muted-foreground/30 mb-6 leading-snug">
            Drift is calm, warm, and unhurried. The options below belong to other modes.
          </p>
          <div className="space-y-8 opacity-30 pointer-events-none select-none">
            {lockedCategories.map((cat) => (
              <div key={cat.heading}>
                <p className="text-sm font-semibold text-foreground mb-1">{cat.heading}</p>
                {cat.sub && (
                  <p className="text-xs text-muted-foreground mb-3 leading-snug">{cat.sub}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {cat.tags.map((tag) => renderTag(tag, cat.tags, true))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
