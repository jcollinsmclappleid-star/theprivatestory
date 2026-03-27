/**
 * Canonical allowlist for experienceTags / customTags.
 *
 * NAMING NOTE
 * -----------
 * On the frontend, the user's StoryTagStudio selections are stored in
 * `casting.customTags`.  Before the API call the frontend merges them with any
 * hardcoded `selectedScenario.tags` (AfterDark preset tags) into a single
 * `allTags` array, which is sent to the API as `experienceTags`.  The backend
 * only ever sees `experienceTags` — it cannot distinguish StoryTagStudio picks
 * from scenario preset tags at that point.
 *
 * HOW THE ALLOWLIST IS BUILT
 * --------------------------
 * StoryTagStudio generates tags via pronoun-substituted template literals across
 * four protagonist pronoun contexts (she/her · he/him · they/them · you).
 * This file enumerates every resolved string all four contexts can produce,
 * plus every hardcoded AfterDark-scenario preset tag.
 *
 * DRIFT PREVENTION
 * ----------------
 * If StoryTagStudio.tsx gains new tags or renames existing ones, this file must
 * be updated in sync.  Run the parity-check script to verify:
 *
 *   node artifacts/api-server/scripts/checkTagParity.mjs  (plain node, no build needed)
 *
 * The script independently mirrors both this file and StoryTagStudio.tsx and
 * reports any mismatches between them.
 */

type P = { sub: string; obj: string; poss: string; refl: string };

const PRONOUN_CONTEXTS: P[] = [
  { sub: "She",  obj: "her",  poss: "her",   refl: "herself"    },
  { sub: "He",   obj: "him",  poss: "his",   refl: "himself"    },
  { sub: "They", obj: "them", poss: "their", refl: "themselves" },
  { sub: "You",  obj: "you",  poss: "your",  refl: "yourself"   },
];

function variants(fn: (p: P) => string): string[] {
  return PRONOUN_CONTEXTS.map(fn);
}

// ---------------------------------------------------------------------------
// Standard categories (buildStandardCategories in StoryTagStudio.tsx)
// ---------------------------------------------------------------------------

const STANDARD_TAGS: string[] = [
  // What You Want To Feel
  "Desired", "Seen", "Powerful", "Safe", "Vulnerable",
  "Chosen", "Overwhelmed", "Undone", "Adored", "Electric",
  "Rescued", "Consumed", "Breathless", "Known", "Discovered",
  "Wanted", "Held", "Irreplaceable", "Shattered", "Lit up",

  // The Energy Between Them
  "Slow Build", "Instant Chemistry", "Unfinished Business",
  "Old Wounds", "Forbidden", "Push & Pull",
  "Inevitable", "Complicated", "Playful tension", "Bittersweet",
  "First time", "Reunion after years", "Rivals to lovers",
  "One night only", "A decade of tension finally breaking",
  "Hate that was always this", "Friends who knew all along",

  // Their Presence (non-substituted)
  "Commanding", "Quiet Intensity", "Gentle", "Protective",
  "Unpredictable", "Brooding", "Playful", "Restrained",
  "Tender", "Obsessive", "Magnetic", "Dangerous",
  "Controlled", "Relentless", "Patient", "Unshakeable",
  "Impossible to read",
  // Their Presence — pronoun-substituted
  ...variants(p => `Focused entirely on ${p.obj}`),

  // Story Texture
  "Dialogue-rich", "Mostly sensation", "Poetic",
  "Sharp & direct", "Dreamlike", "Cinematic",
  "Raw & real", "Intimate & internal", "Lyrical",
  "Sensory", "Grounded & physical", "Interior monologue",
  "Explicit & direct", "Fragmented & urgent",

  // Pacing
  "Slow simmer", "Quick burn", "Even tension",
  "Agonising build", "All foreplay", "Fast then tender",
  "One long exhale", "Interrupted and restarted",
  "Building to a crash", "Starting mid-desire",
  "Two speeds — nothing in between",

  // What Makes It Yours (non-substituted)
  "It's set somewhere I know",
  "They remind me of someone",
  "The relationship is complicated",
  "It happens just once",
  "It happens more than once",
  "It shouldn't have happened",
  "It was always going to happen",
  "No one gets hurt",
  "Feelings are involved whether they want them or not",
  // What Makes It Yours — pronoun-substituted
  ...variants(p => `${p.sub} could be me`),
  ...variants(p => `${p.sub} doesn't tell anyone`),
  ...variants(p => `${p.sub} tells one person`),
];

// ---------------------------------------------------------------------------
// After Dark extra categories (buildAfterDarkExtraCategories in StoryTagStudio.tsx)
// ---------------------------------------------------------------------------

const AFTER_DARK_TAGS: string[] = [
  // Top Fantasies (non-substituted)
  "They find every limit",
  "They get caught",
  "Someone else is watching",
  // Top Fantasies — pronoun-substituted
  ...variants(p => `They take, ${p.sub} receives`),
  ...variants(p => `${p.sub} doesn't say stop`),
  ...variants(p => `${p.sub} does exactly as ${p.poss} told`),
  ...variants(p => `They make ${p.obj} beg for it`),
  ...variants(p => `${p.sub}'s completely powerless`),
  ...variants(p => `${p.sub} watches ${p.refl}`),
  ...variants(p => `${p.sub} doesn't want them to stop`),
  ...variants(p => `${p.sub} wears what they choose`),
  ...variants(p => `They make ${p.obj} say it out loud`),
  ...variants(p => `${p.sub} earns what ${p.poss} gets`),
  ...variants(p => `They go again before ${p.sub} recovers`),
  ...variants(p => `${p.sub} doesn't know what comes next`),
  ...variants(p => `They keep ${p.obj} at the edge`),
  ...variants(p => `${p.sub} surrenders completely`),

  // What You Want Them To Do (non-substituted)
  "Takes full control",
  "Commands what they want",
  "Takes their time",
  "Doesn't stop",
  "Watches closely",
  "Covers their mouth",
  "Goes again immediately",
  "Pushes every limit",
  "Asks permission first — then ignores the answer",
  "Uses only their hands first",
  // What You Want Them To Do — pronoun-substituted
  ...variants(p => `Makes ${p.obj} ask for it`),
  ...variants(p => `Holds ${p.obj} in place`),
  ...variants(p => `Undoes ${p.obj} slowly`),
  ...variants(p => `Makes ${p.obj} earn it`),
  ...variants(p => `Won't let ${p.obj} hide`),
  ...variants(p => `Keeps ${p.obj} at the edge`),
  ...variants(p => `Doesn't let ${p.obj} finish until they say`),
  ...variants(p => `Makes ${p.obj} count`),

  // The Scene (non-substituted)
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
  "On the desk",
  "In the bath",
  "Outdoors, barely hidden",
  "In the car",
  "On the floor",
  "Fully clothed at first",
  // The Scene — pronoun-substituted
  ...variants(p => `Hands behind ${p.poss} back`),
  ...variants(p => `${p.sub} doesn't move unless told`),
  ...variants(p => `${p.sub}'s blindfolded`),

  // What {sub} Wants Said (non-substituted)
  "They narrate everything as it happens",
  "They describe what comes next",
  "They say the name, every time",
  "They say it before they do it",
  "They count down",
  // What {sub} Wants Said — pronoun-substituted
  ...variants(p => `They tell ${p.obj} what ${p.sub} is`),
  ...variants(p => `${p.sub}'s told to repeat it back`),
  ...variants(p => `${p.sub}'s told to ask nicely`),
  ...variants(p => `They ask if ${p.sub} wants more`),
  ...variants(p => `${p.sub}'s told to be quiet`),
  ...variants(p => `They make ${p.obj} say ${p.sub} wants it`),
  ...variants(p => `They tell ${p.obj} not to move`),
  ...variants(p => `They ask ${p.obj} how it feels — ${p.sub} has to answer`),

  // Desire Details (non-substituted)
  "Being told what to do",
  "Being completely seen",
  "Power fully exchanged",
  "Nothing off limits",
  "Total attention",
  "Total surrender",
  "Boundaries dissolved",
  "Watched by someone",
  "Anonymous desire",
  "Multiple rounds",
  "Nothing is private",
  "They own every reaction",
  // Desire Details — pronoun-substituted
  ...variants(p => `${p.sub} takes control`),
  ...variants(p => `${p.sub} loses count`),
  ...variants(p => `Every part of ${p.obj}`),
  ...variants(p => `${p.sub} surrenders all control`),
  ...variants(p => `${p.sub} chooses everything`),
  ...variants(p => `${p.sub} surprises ${p.refl}`),

  // How It Ends (non-substituted)
  "They don't leave until morning",
  "No one speaks afterward",
  "They go again immediately",
  "Left open — mid-scene",
  "They lock the door again",
  // How It Ends — pronoun-substituted
  ...variants(p => `${p.sub} falls asleep in their arms`),
  ...variants(p => `${p.sub} asks for more`),
  ...variants(p => `They leave — ${p.sub} doesn't stop them`),
  ...variants(p => `They stay and ${p.sub}'s surprised`),
  ...variants(p => `${p.sub}'s still feeling it hours later`),
  ...variants(p => `${p.sub} texts them before they reach the door`),
  ...variants(p => `${p.sub} doesn't want it to be over`),
];

// ---------------------------------------------------------------------------
// AfterDark scenario preset tags (hardcoded in AfterDark.tsx selectedScenario.tags)
// These are added by the frontend before the API call, not by user text input.
// ---------------------------------------------------------------------------

const SCENARIO_PRESET_TAGS: string[] = [
  "He's completely in control",
  "Nothing implied where it can be named",
  "I'm completely in control",
  "I take what I want",
  "Control held, then released",
  "Nothing off limits",
  "Power fully exchanged",
  "Total surrender",
  "He shouldn't, and neither should you",
  "The risk is part of the pull",
  "Something between you that should be forbidden",
  "Unfinished business",
  "The danger makes it real",
  "Complicated wanting",
  "A line that keeps moving",
  "Being the only thing he is thinking about",
  "Complete presence, nothing held back",
  "Anonymous desire",
  "He pursues, I decide",
  "Being completely seen",
  "His total attention",
  "Equal desire, equal intensity",
  "Adoration and surrender",
  "He knows exactly what you need",
  "Desire without apology",
];

// ---------------------------------------------------------------------------
// Exported canonical Set — used in normaliseIntake() in generate.ts
// ---------------------------------------------------------------------------

export const VALID_EXPERIENCE_TAGS: Set<string> = new Set([
  ...STANDARD_TAGS,
  ...AFTER_DARK_TAGS,
  ...SCENARIO_PRESET_TAGS,
]);
