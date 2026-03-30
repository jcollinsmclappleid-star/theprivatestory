import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface TagCategory {
  heading: string;
  sub?: string;
  tags: string[];
  maxSelect?: number;
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

/**
 * Returns all pairs of tags that cannot both be selected at once.
 * Checked globally across all categories — not just within a single category.
 */
function buildContradictionPairs(p: PronounCtx): [string, string][] {
  const sub = p.sub;

  // Control-side tags (protagonist in charge)
  const controlTags = [
    sub === "She" ? "She leads"              : sub === "He" ? "He leads"              : "They lead",
    sub === "She" ? "She initiates"          : sub === "He" ? "He initiates"          : "They initiate",
    sub === "She" ? "She sets the terms"     : sub === "He" ? "He sets the terms"     : "They set the terms",
    sub === "She" ? "She stays in control"   : sub === "He" ? "He stays in control"   : "They stay in control",
    sub === "She" ? "She chooses how far it goes" : sub === "He" ? "He chooses how far it goes" : "They choose how far it goes",
    sub === "She" ? "She makes the first move"    : sub === "He" ? "He makes the first move"    : "They make the first move",
  ];

  // Surrender-side tags (protagonist yielding)
  const surrenderTags = [
    sub === "She" ? "She gives control over completely"  : sub === "He" ? "He gives control over completely"  : "They give control over completely",
    sub === "She" ? "She doesn't have to think"          : sub === "He" ? "He doesn't have to think"          : "They don't have to think",
    sub === "She" ? "She lets herself be taken care of"  : sub === "He" ? "He lets himself be taken care of"  : "They let themselves be taken care of",
  ];

  // Every control tag conflicts with every surrender tag
  const powerPairs: [string, string][] = [];
  for (const c of controlTags) {
    for (const s of surrenderTags) {
      powerPairs.push([c, s]);
    }
  }

  return [
    // Writing style opposites
    ["Slow simmer", "Quick burn"],
    ["Dialogue-rich", "Mostly sensation"],
    ["Sharp & direct", "Lyrical"],

    // Energy opposites
    ["Slow Build", "Instant Chemistry"],
    ["Slow Build", "Skip the tension — we're already there"],

    // "What makes this yours?" opposites
    ["It shouldn't have happened", "It was always going to happen"],

    // "Just the Scene" vs story structure
    ["No backstory — start in the moment", "There's a complication first"],
    ["No backstory — start in the moment", "The obstacle makes the ending better"],
    ["No backstory — start in the moment", "The story earns its ending"],
    ["No plot, no premise — just this",    "There's a complication first"],
    ["No plot, no premise — just this",    "The story earns its ending"],
    ["No plot, no premise — just this",    "The obstacle makes the ending better"],

    // Power dynamic opposites
    ...powerPairs,
  ];
}

/** Pick the correct pronoun form for the protagonist. */
function pSub(p: PronounCtx, sheV: string, heV: string, theyV: string): string {
  if (p.sub === "He") return heV;
  if (p.sub === "They" || p.sub === "You") return theyV;
  return sheV;
}

function buildStandardCategories(p: PronounCtx, partner: PronounCtx): TagCategory[] {
  const protagonistHeading = pSub(p, "she", "he", "they");
  const partnerS = partner.sub;
  const partnerObj = partner.obj;

  return [
    {
      heading: "How do you want to feel?",
      sub: "The emotional register of this story",
      maxSelect: 4,
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
      maxSelect: 2,
      tags: [
        "Slow Build", "Instant Chemistry", "Forbidden", "Push & Pull",
        "Inevitable", "Unfinished Business", "One night only", "Rivals to lovers",
      ],
    },
    {
      heading: "How do you want it written?",
      sub: "The texture and pacing of the writing",
      maxSelect: 2,
      tags: [
        "Slow simmer", "Dialogue-rich", "Mostly sensation",
        "Lyrical", "Cinematic", "Sharp & direct",
      ],
    },
    {
      heading: "What makes this yours?",
      sub: "The personal detail that makes it unmistakable",
      maxSelect: 2,
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
      heading: `What does ${protagonistHeading} really want?`,
      sub: "The desire at the core of it",
      maxSelect: 3,
      tags: [
        pSub(p, "She leads",                             "He leads",                              "They lead"),
        pSub(p, "She initiates",                         "He initiates",                          "They initiate"),
        pSub(p, "She sets the terms",                    "He sets the terms",                     "They set the terms"),
        pSub(p, "She stays in control",                  "He stays in control",                   "They stay in control"),
        pSub(p, "She chooses how far it goes",           "He chooses how far it goes",            "They choose how far it goes"),
        pSub(p, "She makes the first move",              "He makes the first move",               "They make the first move"),
        pSub(p, "She gives control over completely",     "He gives control over completely",      "They give control over completely"),
        pSub(p, "She lets herself go",                   "He lets himself go",                    "They let themselves go"),
        pSub(p, "She doesn't have to think",             "He doesn't have to think",              "They don't have to think"),
        pSub(p, "She lets herself be taken care of",     "He lets himself be taken care of",      "They let themselves be taken care of"),
        pSub(p, "She's wanted this for a long time",     "He's wanted this for a long time",      "They've wanted this for a long time"),
        pSub(p, "She comes back for more",               "He comes back for more",                "They come back for more"),
        pSub(p, "This is the version she never admits to", "This is the version he never admits to", "This is the version they never admit to"),
        pSub(p, "She doesn't feel guilty",               "He doesn't feel guilty",                "They don't feel guilty"),
        pSub(p, "It changes something in her",           "It changes something in him",           "It changes something in them"),
        pSub(p, "She owns what she wants",               "He owns what he wants",                 "They own what they want"),
      ],
    },
    {
      heading: "Pure Romance",
      sub: "When tenderness is the whole story",
      maxSelect: 3,
      tags: [
        "The tenderness is the whole thing",
        `${partnerS} treats ${p.obj} like the only thing in the room`,
        "Slow hands, full attention",
        `${p.sub} feels adored, not just wanted`,
        "Every gesture deliberate",
        `${partnerS} remembers what ${pSub(p, "she", "he", "they")} said`,
        "Romance that earns what follows",
        "Softness that doesn't break",
      ],
    },
    {
      heading: "Fantasy & The Impossible",
      sub: "When reality is negotiable",
      maxSelect: 3,
      tags: [
        `${partnerS}'s not entirely human`,
        "The rules of this world don't apply here",
        "Time works differently",
        `${p.sub} has power neither of them can explain`,
        "No consequences, no morning",
        `${partnerS} can sense what ${p.sub === "She" ? "she" : p.sub === "He" ? "he" : "they"} needs`,
        "The impossible is part of why it works",
        "Magic, mythology, something older",
      ],
    },
    {
      heading: "Praise & Devotion",
      sub: "When being wanted is its own kind of story",
      maxSelect: 3,
      tags: [
        `${partnerS} can't stop looking at ${p.obj}`,
        `${p.sub} is the obsession and ${pSub(p, "she", "he", "they")} knows it`,
        `${partnerS} catalogues everything about ${p.obj}`,
        "Every compliment specific and earned",
        `${partnerS} makes ${p.obj} feel like a revelation`,
        "The devotion is the whole story",
        `${partnerS} names what ${partnerObj === "him" ? "he" : partnerObj === "her" ? "she" : "they"} sees in ${p.obj}`,
        `${p.sub} is everything and ${partnerObj === "him" ? "he" : partnerObj === "her" ? "she" : "they"} tells ${p.obj}`,
      ],
    },
    {
      heading: "Story Arc & Plot",
      sub: "For stories with something more to say",
      maxSelect: 2,
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
      maxSelect: 4,
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
      maxSelect: 3,
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
      maxSelect: 2,
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
      maxSelect: 2,
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
      maxSelect: 2,
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
      maxSelect: 2,
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
  partnerPronouns?: string;
}

export function StoryTagStudio({
  selectedTags,
  onTagToggle,
  afterDark = false,
  bedtime = false,
  accentColor = "#c9a227",
  protagonistPronouns = "she/her",
  partnerPronouns = "he/him",
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
  const partner = getPronounCtx(partnerPronouns);

  const activeCategories: TagCategory[] = afterDark
    ? [...buildStandardCategories(p, partner), ...buildAfterDarkCategories(p)]
    : bedtime
    ? [buildNocturneCategory()]
    : buildStandardCategories(p, partner);

  const lockedCategories: TagCategory[] = bedtime ? buildStandardCategories(p, partner) : [];

  const contradictionPairs = buildContradictionPairs(p);

  function renderTag(
    tag: string,
    catSelectedCount: number,
    maxSelect: number | undefined,
    locked: boolean,
  ) {
    const selected = !locked && selectedTags.includes(tag);
    const isUsual = !locked && usualTags.has(tag) && !selected;

    // Contradiction check — global across all categories
    const contradictionPartners = contradictionPairs
      .filter(([a, b]) => a === tag || b === tag)
      .map(([a, b]) => (a === tag ? b : a));
    const blockedByContradiction = !selected && contradictionPartners.some(
      (cp) => selectedTags.includes(cp),
    );

    // Cap check — disabled when category is full and this tag isn't selected
    const blockedByCap = !selected && maxSelect !== undefined && catSelectedCount >= maxSelect;

    const isDisabled = locked || blockedByContradiction || blockedByCap;
    const titleText = locked
      ? "Not available in Drift mode"
      : blockedByContradiction
      ? "Conflicts with another selection"
      : blockedByCap
      ? `Limit reached (${maxSelect} per section)`
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

  function renderCategory(cat: TagCategory, locked: boolean) {
    const catSelectedCount = locked
      ? 0
      : cat.tags.filter((t) => selectedTags.includes(t)).length;
    const atCap = cat.maxSelect !== undefined && catSelectedCount >= cat.maxSelect;

    return (
      <div key={cat.heading} className={locked ? "opacity-30" : undefined}>
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-base font-semibold text-foreground">{cat.heading}</p>
          {!locked && cat.maxSelect !== undefined && (
            <span
              className={`text-xs tabular-nums transition-colors ${
                atCap ? "font-semibold" : "text-muted-foreground/50"
              }`}
              style={atCap ? { color: accentColor } : undefined}
            >
              {catSelectedCount}/{cat.maxSelect}
            </span>
          )}
        </div>
        {cat.sub && (
          <p className="text-xs text-muted-foreground mb-4 leading-snug">{cat.sub}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {cat.tags.map((tag) =>
            renderTag(tag, catSelectedCount, cat.maxSelect, locked),
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {activeCategories.map((cat) => renderCategory(cat, false))}
      {lockedCategories.map((cat) => renderCategory(cat, true))}
    </div>
  );
}
