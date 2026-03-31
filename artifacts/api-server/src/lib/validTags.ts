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

  // What Does She/He/They Really Want? — all 4 protagonist pronoun forms
  // She/Her
  "She leads", "She initiates", "She sets the terms", "She stays in control",
  "She chooses how far it goes", "She makes the first move", "She gives control over completely",
  "She lets herself go", "She doesn't have to think", "She lets herself be taken care of",
  "She's wanted this for a long time", "She comes back for more",
  "This is the version she never admits to", "She doesn't feel guilty",
  "It changes something in her", "She owns what she wants",
  // He/Him
  "He leads", "He initiates", "He sets the terms", "He stays in control",
  "He chooses how far it goes", "He makes the first move", "He gives control over completely",
  "He lets himself go", "He doesn't have to think", "He lets himself be taken care of",
  "He's wanted this for a long time", "He comes back for more",
  "This is the version he never admits to", "He doesn't feel guilty",
  "It changes something in him", "He owns what he wants",
  // They/Them
  "They lead", "They initiate", "They set the terms", "They stay in control",
  "They choose how far it goes", "They make the first move", "They give control over completely",
  "They let themselves go", "They don't have to think", "They let themselves be taken care of",
  "They've wanted this for a long time", "They come back for more",
  "This is the version they never admit to", "They don't feel guilty",
  "It changes something in them", "They own what they want",

  // Pure Romance — all 6 pairing combinations (protagonist × partner pronouns)
  "The tenderness is the whole thing",
  "Slow hands, full attention",
  "Every gesture deliberate",
  "Romance that earns what follows",
  "Softness that doesn't break",
  // partner treats protagonist
  "He treats her like the only thing in the room",
  "She treats her like the only thing in the room",
  "He treats him like the only thing in the room",
  "They treat her like the only thing in the room",
  "They treat him like the only thing in the room",
  "They treat them like the only thing in the room",
  // protagonist feels adored
  "She feels adored, not just wanted",
  "He feels adored, not just wanted",
  "They feel adored, not just wanted",
  // partner remembers
  "He remembers what she said",
  "She remembers what she said",
  "He remembers what he said",
  "They remember what she said",
  "They remember what he said",
  "They remember what they said",

  // Fantasy & The Impossible — all pairing combinations
  "The rules of this world don't apply here",
  "Time works differently",
  "No consequences, no morning",
  "The impossible is part of why it works",
  "Magic, mythology, something older",
  // partner not entirely human
  "He's not entirely human",
  "She's not entirely human",
  "They're not entirely human",
  // protagonist has power
  "She has power neither of them can explain",
  "He has power neither of them can explain",
  "They have power neither of them can explain",
  // partner can sense what protagonist needs
  "He can sense what she needs",
  "She can sense what she needs",
  "He can sense what he needs",
  "They can sense what she needs",
  "They can sense what he needs",
  "They can sense what they needs",

  // Praise & Devotion — all pairing combinations
  "Every compliment specific and earned",
  "The devotion is the whole story",
  // partner can't stop looking at protagonist
  "He can't stop looking at her",
  "She can't stop looking at her",
  "He can't stop looking at him",
  "They can't stop looking at her",
  "They can't stop looking at him",
  "They can't stop looking at them",
  // protagonist is the obsession
  "She is the obsession and she knows it",
  "He is the obsession and he knows it",
  "They is the obsession and they knows it",
  // partner catalogues protagonist
  "He catalogues everything about her",
  "She catalogues everything about her",
  "He catalogues everything about him",
  "They catalogue everything about her",
  "They catalogue everything about him",
  "They catalogue everything about them",
  // partner makes protagonist feel
  "He makes her feel like a revelation",
  "She makes her feel like a revelation",
  "He makes him feel like a revelation",
  "They make her feel like a revelation",
  "They make him feel like a revelation",
  "They make them feel like a revelation",
  // partner names what they see in protagonist
  "He names what he sees in her",
  "She names what she sees in her",
  "He names what he sees in him",
  "They name what they see in her",
  "They name what they see in him",
  "They name what they see in them",
  // protagonist is everything and partner tells them
  "She is everything and he tells her",
  "She is everything and she tells her",
  "He is everything and he tells him",
  "She is everything and they tell her",
  "He is everything and they tell him",
  "They is everything and they tell them",

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
  ...variants(p => `${p.sub} wanted a hand pressed over ${p.poss} mouth`),
  ...variants(p => `${p.sub} wanted to be looked at — properly looked at`),
  ...variants(p => `${p.sub} wanted to kneel for them`),
  ...variants(p => `${p.sub} wanted to be completely powerless`),
  // Sensation & Restraint — new extensions
  ...variants(p => `${p.sub} wanted something around ${p.poss} wrists`),
  ...variants(p => `${p.sub} wanted to be undressed very slowly`),
  ...variants(p => `${p.sub} wanted to be kept completely still`),
  ...variants(p => `${p.sub} wanted to feel completely enclosed`),

  // Words & Praise
  ...variants(p => `${p.sub} wanted to be praised`),
  ...variants(p => `${p.sub} wanted to hear what ${p.sub} is`),
  ...variants(p => `${p.sub} wanted to be narrated through it`),
  ...variants(p => `${p.sub} wanted to have to ask for it`),
  ...variants(p => `${p.sub} wanted to say it back — out loud`),
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
  ...variants(p => `${p.sub} wanted to be taken completely — and adored for it`),
  ...variants(p => `${p.sub} wanted to beg for it`),

  // Dark Fantasy
  ...variants(p => `${p.sub} wanted something that wasn't entirely human`),
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

  // Her Lead standard tags (she/her protagonist only — buildSheOnlyStandardCategories)
  "He gives her what she asks for",
  "Her pleasure is the whole story",
  "He would wait as long as she needed",
  "She feels beautiful and powerful at once",
  "He notices everything about her",
  "She is the centre of everything in this room",

  // Her Power room scenario preset tags
  "She asked for it and he obliged completely",
  "He does exactly what she says",
  "She directed them both — they were there for exactly that",
  "He watches because she wanted him to",
  "She swings on her terms — her choice, her lead, her exit",
  "Two men, both completely focused on her",
  "She tells him what good behaviour earns — he earns it",
  "He is on his knees — that is where she wants him and he wants to be",
  "She told them the rules — they followed them",
  "She is worshipped before anything else",
  "She chooses who touches her",
  "She decides when it ends",
  "She leads and he follows",
];

// ---------------------------------------------------------------------------
// Exported canonical Set — used in normaliseIntake() in generate.ts
// ---------------------------------------------------------------------------

export const VALID_EXPERIENCE_TAGS: Set<string> = new Set([
  ...STANDARD_TAGS,
  ...AFTER_DARK_TAGS,
  ...SCENARIO_PRESET_TAGS,
]);
