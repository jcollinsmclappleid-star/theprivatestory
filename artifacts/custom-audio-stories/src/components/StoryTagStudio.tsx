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

const MAX_PER_SECTION = 2;

function buildContradictionPairs(p: PronounCtx): [string, string][] {
  return [
    // Pacing
    ["Slow simmer", "Quick burn"],
    ["Slow simmer", "Two speeds — nothing in between"],
    ["All foreplay", "Building to a crash"],
    ["Starting mid-desire", "Agonising build"],
    // Story Texture
    ["Dialogue-rich", "Mostly sensation"],
    ["Sharp & direct", "Dreamlike"],
    ["Sharp & direct", "Lyrical"],
    // Energy Between Them
    ["Slow Build", "Instant Chemistry"],
    ["One night only", "Reunion after years"],
    // Their Presence
    ["Gentle", "Relentless"],
    ["Patient", "Relentless"],
    ["Gentle", "Commanding"],
    // Desire Details (AfterDark)
    [`${p.sub} takes control`, `${p.sub} surrenders all control`],
    [`${p.sub} takes control`, "Total surrender"],
    [`${p.sub} chooses everything`, "Being told what to do"],
  ];
}

function getPronounCtx(pronouns: string): PronounCtx {
  switch (pronouns) {
    case "he/him":   return { sub: "He",   obj: "him",  poss: "his",   refl: "himself"    };
    case "they/them":return { sub: "They", obj: "them", poss: "their", refl: "themselves"  };
    case "you":      return { sub: "You",  obj: "you",  poss: "your",  refl: "yourself"   };
    default:         return { sub: "She",  obj: "her",  poss: "her",   refl: "herself"    };
  }
}

function buildStandardCategories(p: PronounCtx): TagCategory[] {
  return [
    {
      heading: "What You Want To Feel",
      sub: "The emotional register this story should carry",
      tags: [
        "Desired", "Seen", "Powerful", "Safe", "Vulnerable",
        "Chosen", "Overwhelmed", "Undone", "Adored", "Electric",
        "Rescued", "Consumed", "Breathless", "Known", "Discovered",
        "Wanted", "Held", "Irreplaceable", "Shattered", "Lit up",
      ],
    },
    {
      heading: "The Energy Between Them",
      sub: "How the charge between two people moves",
      tags: [
        "Slow Build", "Instant Chemistry", "Unfinished Business",
        "Old Wounds", "Forbidden", "Push & Pull",
        "Inevitable", "Complicated", "Playful tension", "Bittersweet",
        "First time", "Reunion after years", "Rivals to lovers",
        "One night only", "A decade of tension finally breaking",
        "Hate that was always this", "Friends who knew all along",
      ],
    },
    {
      heading: "Their Presence",
      sub: "The energy they bring into the room",
      tags: [
        "Commanding", "Quiet Intensity", "Gentle", "Protective",
        "Unpredictable", "Brooding", "Playful", "Restrained",
        "Tender", "Obsessive", "Magnetic",
        "Controlled", "Relentless", "Patient", "Unshakeable",
        `Focused entirely on ${p.obj}`, "Impossible to read",
      ],
    },
    {
      heading: "Story Texture",
      sub: "How the writing should feel on the page",
      tags: [
        "Dialogue-rich", "Mostly sensation", "Poetic",
        "Sharp & direct", "Dreamlike", "Cinematic",
        "Raw & real", "Intimate & internal", "Lyrical",
        "Sensory", "Grounded & physical", "Interior monologue",
        "Explicit & direct", "Fragmented & urgent",
      ],
    },
    {
      heading: "Pacing",
      sub: "How the tension moves through the story",
      tags: [
        "Slow simmer", "Quick burn", "Even tension",
        "Agonising build", "All foreplay", "Fast then tender",
        "One long exhale", "Interrupted and restarted",
        "Building to a crash", "Starting mid-desire",
        "Two speeds — nothing in between",
      ],
    },
    {
      heading: "What Makes It Yours",
      sub: "The personal detail that makes this story unmistakable",
      tags: [
        "It's set somewhere I know",
        "They remind me of someone",
        `${p.sub} could be me`,
        "The relationship is complicated",
        "It happens just once",
        "It happens more than once",
        "It shouldn't have happened",
        "It was always going to happen",
        `${p.sub} doesn't tell anyone`,
        `${p.sub} tells one person`,
        "No one gets hurt",
        "Feelings are involved whether they want them or not",
      ],
    },
  ];
}

function buildAfterDarkExtraCategories(p: PronounCtx): TagCategory[] {
  return [
    {
      heading: "Top Fantasies",
      sub: "The ones people rarely say out loud. Select what's true for you.",
      tags: [
        `They take, ${p.sub} receives`,
        "They find every limit",
        `${p.sub} gives ${p.refl} over completely`,
        `${p.sub} begs for it`,
        `${p.sub} lets ${p.refl} be completely powerless`,
        "They get caught",
        "Someone else is watching",
        `${p.sub} watches ${p.refl}`,
        `${p.sub} doesn't want them to stop`,
        `${p.sub} wears what they choose`,
        `${p.sub} loses the fight to stay quiet`,
        `${p.sub} doesn't know what comes next`,
        `They keep ${p.obj} at the edge`,
        `${p.sub} surrenders completely`,
      ],
    },
    {
      heading: "What You Want Them To Do",
      sub: "The specific energy you want from them",
      tags: [
        "Takes full control",
        "Commands what they want",
        "Takes their time",
        `Makes ${p.obj} ask for it`,
        `Holds ${p.obj} in place`,
        `Undoes ${p.obj} slowly`,
        `Makes ${p.obj} earn it`,
        `Won't let ${p.obj} hide`,
        "Watches closely",
        `Keeps ${p.obj} at the edge`,
        "Covers their mouth",
        `Doesn't let ${p.obj} finish until they say`,
        `Takes ${p.obj} to every edge`,
        "Uses only their hands first",
        `Makes ${p.obj} count`,
      ],
    },
    {
      heading: "The Scene",
      sub: "Where and how this plays out physically",
      tags: [
        "Slow undressing",
        "Everything at once",
        "In the dark",
        "Fully lit",
        "Against a wall",
        "In front of a mirror",
        "Barely private",
        "Somewhere unexpected",
        "Horizontal",
        "Standing the whole time",
        "Tied down",
        `Hands behind ${p.poss} back`,
        "On the desk",
        "In the bath",
        `${p.sub} holds perfectly still for them`,
        "Outdoors, barely hidden",
        "In the car",
        "On the floor",
        `${p.sub}'s blindfolded`,
        "Fully clothed at first",
      ],
    },
    {
      heading: `What ${p.sub} Wants Said`,
      sub: "The words matter as much as anything else",
      tags: [
        "They narrate everything as it happens",
        `They tell ${p.obj} what ${p.sub} is`,
        `${p.sub}'s told to repeat it back`,
        "They describe what comes next",
        `${p.sub}'s told to ask nicely`,
        "They say the name, every time",
        `They ask if ${p.sub} wants more`,
        "They say it before they do it",
        `${p.sub} goes quiet when they say`,
        `${p.sub} tells them ${p.sub} wants it`,
        `${p.sub} holds still when they ask`,
        "They count down",
        `They ask how it feels — ${p.sub} answers every time`,
      ],
    },
    {
      heading: "Desire Details",
      sub: `The specific flavour of what ${p.sub} wants`,
      tags: [
        "Being told what to do",
        "Being completely seen",
        "Power fully exchanged",
        "Nothing off limits",
        "Total attention",
        "Total surrender",
        `${p.sub} takes control`,
        "Watched by someone",
        "Anonymous desire",
        "Multiple rounds",
        `${p.sub} loses count`,
        `Every part of ${p.obj}`,
        `${p.sub} holds nothing back`,
        `${p.sub} surrenders all control`,
        `${p.sub} chooses everything`,
        "They own every reaction",
        `${p.sub} surprises ${p.refl}`,
      ],
    },
    {
      heading: "How It Ends",
      sub: "The final note of the story",
      tags: [
        `${p.sub} falls asleep in their arms`,
        "They don't leave until morning",
        `${p.sub} asks for more`,
        "No one speaks afterward",
        `They leave — ${p.sub} doesn't stop them`,
        "They go again immediately",
        `They stay and ${p.sub}'s surprised`,
        "Left open — mid-scene",
        `${p.sub}'s still feeling it hours later`,
        `${p.sub} texts them before they reach the door`,
        "They lock the door again",
        `${p.sub} doesn't want it to be over`,
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
  const categories = afterDark
    ? [...buildStandardCategories(p), ...buildAfterDarkExtraCategories(p)]
    : buildStandardCategories(p);
  const contradictionPairs = buildContradictionPairs(p);

  return (
    <div className="space-y-8">
      {categories.map((cat) => {
        const catSelectedCount = cat.tags.filter(t => selectedTags.includes(t)).length;

        return (
          <div key={cat.heading}>
            <div className="flex items-baseline justify-between mb-0.5">
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                {cat.heading}
              </p>
              {catSelectedCount > 0 && (
                <span
                  className="text-[10px] font-semibold tabular-nums"
                  style={{ color: catSelectedCount >= MAX_PER_SECTION ? accentColor : `${accentColor}80` }}
                >
                  {catSelectedCount}/{MAX_PER_SECTION}
                </span>
              )}
            </div>
            {cat.sub && (
              <p className="text-xs text-muted-foreground mb-3 leading-snug">{cat.sub}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {cat.tags.map((tag) => {
                const selected = selectedTags.includes(tag);
                const isUsual = usualTags.has(tag) && !selected;

                const atSectionLimit = !selected && catSelectedCount >= MAX_PER_SECTION;

                const contradictionPartners = contradictionPairs
                  .filter(([a, b]) => a === tag || b === tag)
                  .map(([a, b]) => (a === tag ? b : a));
                const blockedByContradiction = !selected && contradictionPartners.some(
                  partner => cat.tags.includes(partner) && selectedTags.includes(partner)
                );

                const isDisabled = atSectionLimit || blockedByContradiction;

                return (
                  <span key={tag} className="relative inline-flex flex-col items-start gap-0.5">
                    <button
                      type="button"
                      onClick={() => !isDisabled && onTagToggle(tag)}
                      disabled={isDisabled}
                      title={blockedByContradiction ? "Conflicts with another selection" : undefined}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? "border-transparent text-black"
                          : isDisabled
                          ? "border-white/5 text-muted-foreground/30 cursor-not-allowed"
                          : isUsual
                          ? "border-primary/40 text-foreground hover:border-primary/60"
                          : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
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
