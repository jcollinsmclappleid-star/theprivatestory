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
  "Tender", "Obsessive", "Magnetic",
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

  // What Does She Really Want?
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

  // Pure Romance
  "The tenderness is the whole thing",
  "He treats her like the only thing in the room",
  "Slow hands, full attention",
  "She feels adored, not just wanted",
  "Every gesture deliberate",
  "He remembers what she said",
  "Romance that earns what follows",
  "Softness that doesn't break",

  // Fantasy & The Impossible
  "He's not entirely human",
  "The rules of this world don't apply here",
  "Time works differently",
  "She has power neither of them can explain",
  "No consequences, no morning",
  "He can sense what she needs",
  "The impossible is part of why it works",
  "Magic, mythology, something older",

  // Praise & Devotion
  "He can't stop looking at her",
  "She is the obsession and she knows it",
  "He catalogues everything about her",
  "Every compliment specific and earned",
  "He makes her feel like a revelation",
  "The devotion is the whole story",
  "He names what he sees in her",
  "She is everything and he tells her",

  // Story Arc & Plot
  "There's a complication first",
  "The obstacle makes the ending better",
  "Second chance — different this time",
  "They almost didn't make it",
  "The misunderstanding that almost cost everything",
  "The story earns its ending",
  "Feelings are the whole problem",
  "Something between them that neither will say",

  // Nocturne / Drift — What do you need tonight?
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
];

// ---------------------------------------------------------------------------
// After Dark extra categories (buildAfterDarkCategories in StoryTagStudio.tsx)
// ---------------------------------------------------------------------------

const AFTER_DARK_TAGS: string[] = [
  // Sensation & Restraint
  ...variants(p => `${p.sub} wanted to be tied up`),
  ...variants(p => `${p.sub} wanted to be blindfolded`),
  ...variants(p => `${p.sub} wanted to be held down`),
  ...variants(p => `${p.sub} wanted to be told not to move`),
  ...variants(p => `${p.sub} wanted ${p.poss} mouth covered`),
  ...variants(p => `${p.sub} wanted to be on display`),
  ...variants(p => `${p.sub} wanted to be kneeling for them`),
  ...variants(p => `${p.sub} wanted to be completely powerless`),
  // Sensation & Restraint — new extensions
  ...variants(p => `${p.sub} wanted something around ${p.poss} wrists`),
  ...variants(p => `${p.sub} wanted to be undressed very slowly`),
  ...variants(p => `${p.sub} wanted to be kept completely still`),
  ...variants(p => `${p.sub} wanted to be wrapped and contained`),

  // Words & Praise
  ...variants(p => `${p.sub} wanted to be praised`),
  ...variants(p => `${p.sub} wanted to be told what ${p.sub} is`),
  ...variants(p => `${p.sub} wanted to be narrated through it`),
  ...variants(p => `${p.sub} wanted to be made to ask nicely`),
  ...variants(p => `${p.sub} wanted to be made to repeat it back`),
  // Words & Praise — new extensions
  ...variants(p => `${p.sub} wanted to be told ${p.refl} was perfect`),
  ...variants(p => `${p.sub} wanted every moment described as it happened`),
  ...variants(p => `${p.sub} wanted to hear how much they needed ${p.obj}`),
  ...variants(p => `${p.sub} wanted to be called ${p.poss} name when it happened`),

  // Surrender & Power
  ...variants(p => `${p.sub} wanted to be degraded`),
  ...variants(p => `${p.sub} wanted to be spanked`),
  ...variants(p => `${p.sub} wanted to be edged`),
  ...variants(p => `${p.sub} wanted to be worshipped`),
  ...variants(p => `${p.sub} wanted to be used and adored`),
  ...variants(p => `${p.sub} wanted to be made to beg`),

  // Dark Fantasy
  ...variants(p => `${p.sub} wanted something that wasn't entirely human`),
  ...variants(p => `${p.sub} wanted to be claimed by something ancient and certain`),
  ...variants(p => `${p.sub} wanted the rules of this world suspended`),
  ...variants(p => `${p.sub} wanted power that couldn't be explained`),
  ...variants(p => `${p.sub} wanted to be taken somewhere impossible`),

  // Just the Scene
  "No backstory — start in the moment",
  "Skip the tension — we're already there",
  "Pure sensation, nothing required before it",
  "Just the part that matters",
  "In medias res — already past the beginning",
  "No plot, no premise — just this",

  // How It Ends
  ...variants(p => `${p.sub} falls asleep in their arms`),
  "They don't leave until morning",
  ...variants(p => `${p.sub} asks for more`),
  "No one speaks afterward",
  "They go again immediately",
  ...variants(p => `${p.sub} doesn't want it to be over`),
  ...variants(p => `They leave — ${p.sub} doesn't stop them`),
  ...variants(p => `They stay and ${p.sub}'s surprised`),
  "Left open — mid-scene",
  ...variants(p => `${p.sub}'s still feeling it hours later`),
  ...variants(p => `${p.sub} texts them before they reach the door`),
  "They lock the door again",
];

// ---------------------------------------------------------------------------
// AfterDark + Drift scenario preset tags
// (hardcoded in selectedScenario.tags arrays in AfterDark.tsx and Drift.tsx)
// ---------------------------------------------------------------------------

const SCENARIO_PRESET_TAGS: string[] = [
  // Original After Dark preset tags
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

  // All of Them room presets
  "Multiple men, undivided attention",
  "Black masculine dominance",
  "Physical dominance and commanding presence",
  "The object of all their wanting",

  // Dark Fantasy room presets
  "Something not entirely human",
  "Ancient claiming",

  // The Praise Room presets
  "Every word of praise named specifically",
  "He catalogues what she is",
  "She is described and adored as it happens",
  "The words are part of the act",

  // Drift (nocturne) room presets
  "Warmth with nowhere to go",
  "The night is private and unhurried",
  "Warmth interrupted slowly",
  "He knows without asking",
];

// ---------------------------------------------------------------------------
// Exported canonical Set — used in normaliseIntake() in generate.ts
// ---------------------------------------------------------------------------

export const VALID_EXPERIENCE_TAGS: Set<string> = new Set([
  ...STANDARD_TAGS,
  ...AFTER_DARK_TAGS,
  ...SCENARIO_PRESET_TAGS,
]);
