import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";

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
      "Tender", "Obsessive", "Magnetic", "Dangerous",
      "Controlled", "Relentless", "Patient", "Unshakeable",
      "Focused entirely on her", "Impossible to read",
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
      "He reminds me of someone",
      "She could be me",
      "The relationship is complicated",
      "It happens just once",
      "It happens more than once",
      "It shouldn't have happened",
      "It was always going to happen",
      "She doesn't tell anyone",
      "She tells one person",
      "No one gets hurt",
      "Feelings are involved whether they want them or not",
    ],
  },
];

const AFTER_DARK_EXTRA_CATEGORIES: TagCategory[] = [
  {
    heading: "Top Fantasies",
    sub: "The ones people rarely say out loud. Select what's true for you.",
    tags: [
      "He takes, she receives",
      "She doesn't say stop",
      "He finds every limit",
      "She does exactly as she's told",
      "He makes her beg for it",
      "She's completely powerless",
      "They get caught",
      "Someone else is watching",
      "She watches herself",
      "He doesn't stop when she asks him to",
      "She wears what he chooses",
      "He makes her say it out loud",
      "Nothing is off limits tonight",
      "She earns what she gets",
      "He goes again before she recovers",
      "She doesn't know what comes next",
      "He keeps her at the edge",
      "She surrenders completely",
    ],
  },
  {
    heading: "What You Want Him To Do",
    sub: "The specific energy you want from him",
    tags: [
      "Takes full control",
      "Commands what he wants",
      "Takes his time",
      "Doesn't stop",
      "Makes her ask for it",
      "Holds her in place",
      "Undoes her slowly",
      "Makes her earn it",
      "Won't let her hide",
      "Watches closely",
      "Keeps her at the edge",
      "Covers her mouth",
      "Goes again immediately",
      "Doesn't let her finish until he says",
      "Pushes every limit",
      "Asks permission first — then ignores the answer",
      "Uses only his hands first",
      "Makes her count",
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
      "Hands behind her back",
      "On the desk",
      "In the bath",
      "She doesn't move unless told",
      "Outdoors, barely hidden",
      "In the car",
      "On the floor",
      "She's blindfolded",
      "Fully clothed at first",
    ],
  },
  {
    heading: "What She Wants Said",
    sub: "The words matter as much as anything else",
    tags: [
      "He narrates everything as it happens",
      "He tells her what she is",
      "She's told to repeat it back",
      "He describes what comes next",
      "She's told to ask nicely",
      "He says her name, every time",
      "He asks if she wants more",
      "He says it before he does it",
      "She's told to be quiet",
      "He makes her say she wants it",
      "He tells her not to move",
      "He counts down",
      "He asks her how it feels — she has to answer",
    ],
  },
  {
    heading: "Desire Details",
    sub: "The specific flavour of what she wants",
    tags: [
      "Being told what to do",
      "Being completely seen",
      "Power fully exchanged",
      "Nothing off limits",
      "His total attention",
      "Total surrender",
      "She takes control",
      "Boundaries dissolved",
      "Watched by someone",
      "Anonymous desire",
      "Multiple rounds",
      "She loses count",
      "Every part of her",
      "Nothing is private",
      "She doesn't get a choice",
      "She chooses everything",
      "He owns every reaction",
      "She surprises herself",
    ],
  },
  {
    heading: "How It Ends",
    sub: "The final note of the story",
    tags: [
      "She falls asleep in his arms",
      "He doesn't leave until morning",
      "She asks for more",
      "No one speaks afterward",
      "He leaves — she doesn't stop him",
      "They go again immediately",
      "He stays and she's surprised",
      "Left open — mid-scene",
      "She's still feeling it hours later",
      "She texts him before he reaches the door",
      "He locks the door again",
      "She doesn't want it to be over",
    ],
  },
];

interface Props {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  afterDark?: boolean;
  accentColor?: string;
}

export function StoryTagStudio({
  selectedTags,
  onTagToggle,
  afterDark = false,
  accentColor = "#c9a227",
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
                <span key={tag} className="relative inline-flex flex-col items-start gap-0.5">
                  <button
                    type="button"
                    onClick={() => onTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selected
                        ? "border-transparent text-black"
                        : isUsual
                        ? "border-primary/40 text-foreground hover:border-primary/60"
                        : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                    }`}
                    style={
                      selected
                        ? { background: accentColor, borderColor: accentColor }
                        : isUsual
                        ? { background: `${accentColor}14` }
                        : undefined
                    }
                  >
                    {tag}
                  </button>
                  {isUsual && (
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
      ))}

    </div>
  );
}
