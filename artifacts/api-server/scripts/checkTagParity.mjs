/**
 * Tag parity check — run with plain node (no build step required).
 *
 * Usage:
 *   node artifacts/api-server/scripts/checkTagParity.mjs
 *
 * Exit 0 → parity OK.  Exit 1 → mismatches found (missing OR unexpected stale).
 *
 * SOURCE A — mirrors StoryTagStudio.tsx (what the frontend can send).
 * SOURCE B — mirrors validTags.ts VALID_EXPERIENCE_TAGS (what the backend accepts).
 *
 * These are INDEPENDENT enumerations. If a tag is in A but not B it will be
 * silently dropped by the backend. If B has entries not in A (other than
 * scenario presets or known historical tags) those are unexpected stale entries.
 *
 * KNOWN_HISTORICAL_TAGS — standard tags kept in validTags.ts for backward
 * compatibility with existing taste profiles and stored stories. They are no
 * longer shown in the condensed standard UI but are still accepted by the
 * backend. Stale detection ignores these intentional extras.
 *
 * Update both sources and the respective source file whenever StoryTagStudio.tsx
 * or validTags.ts changes.
 */

// ── Pronoun contexts ──────────────────────────────────────────────────────────

const PRONOUNS = [
  { sub: "She",  obj: "her",  poss: "her",   refl: "herself"    },
  { sub: "He",   obj: "him",  poss: "his",   refl: "himself"    },
  { sub: "They", obj: "them", poss: "their", refl: "themselves" },
  { sub: "You",  obj: "you",  poss: "your",  refl: "yourself"   },
];

const v = (fn) => PRONOUNS.map(fn);

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE A: StoryTagStudio.tsx — current UI output
// Sync with buildStandardCategories() and buildAfterDarkCategories()
// ─────────────────────────────────────────────────────────────────────────────

// buildStandardCategories()
const UI_STANDARD = [
  // How do you want to feel?
  "Desired", "Seen", "Powerful", "Chosen",
  "Adored", "Electric", "Wanted", "Known",
  "Vulnerable", "Held", "Breathless", "Undone",
  "Overwhelmed", "Consumed", "Lit up", "Irreplaceable",
  "Discovered", "Safe",

  // What's between them?
  "Slow Build", "Instant Chemistry", "Forbidden", "Push & Pull",
  "Inevitable", "Unfinished Business", "One night only", "Rivals to lovers",

  // How do you want it written?
  "Slow simmer", "Dialogue-rich", "Mostly sensation",
  "Lyrical", "Cinematic", "Sharp & direct",

  // What makes this yours?
  "They remind me of someone",
  "It happens just once",
  "It shouldn't have happened",
  "It was always going to happen",
  "The relationship is complicated",
  "No one gets hurt",

  // What does she really want?
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

  // Nocturne — What do you need tonight?
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

// buildAfterDarkCategories() — only what it currently returns
const UI_AFTER_DARK = [
  // Sensation & Restraint
  ...v(p => `${p.sub} wanted to be tied up`),
  ...v(p => `${p.sub} wanted to be blindfolded`),
  ...v(p => `${p.sub} wanted to be held down`),
  ...v(p => `${p.sub} wanted to be told not to move`),
  ...v(p => `${p.sub} wanted ${p.poss} mouth covered`),
  ...v(p => `${p.sub} wanted to be on display`),
  ...v(p => `${p.sub} wanted to be kneeling for them`),
  ...v(p => `${p.sub} wanted to be completely powerless`),
  // Sensation & Restraint — extensions
  ...v(p => `${p.sub} wanted something around ${p.poss} wrists`),
  ...v(p => `${p.sub} wanted to be undressed very slowly`),
  ...v(p => `${p.sub} wanted to be kept completely still`),
  ...v(p => `${p.sub} wanted to be wrapped and contained`),

  // Words & Praise
  ...v(p => `${p.sub} wanted to be praised`),
  ...v(p => `${p.sub} wanted to be told what ${p.sub} is`),
  ...v(p => `${p.sub} wanted to be narrated through it`),
  ...v(p => `${p.sub} wanted to be made to ask nicely`),
  ...v(p => `${p.sub} wanted to be made to repeat it back`),
  // Words & Praise — extensions
  ...v(p => `${p.sub} wanted to be told ${p.refl} was perfect`),
  ...v(p => `${p.sub} wanted every moment described as it happened`),
  ...v(p => `${p.sub} wanted to hear how much they needed ${p.obj}`),
  ...v(p => `${p.sub} wanted to be called ${p.poss} name when it happened`),

  // Surrender & Power
  ...v(p => `${p.sub} wanted to be degraded`),
  ...v(p => `${p.sub} wanted to be spanked`),
  ...v(p => `${p.sub} wanted to be edged`),
  ...v(p => `${p.sub} wanted to be worshipped`),
  ...v(p => `${p.sub} wanted to be used and adored`),
  ...v(p => `${p.sub} wanted to be made to beg`),

  // Dark Fantasy
  ...v(p => `${p.sub} wanted something that wasn't entirely human`),
  ...v(p => `${p.sub} wanted to be claimed by something ancient and certain`),
  ...v(p => `${p.sub} wanted the rules of this world suspended`),
  ...v(p => `${p.sub} wanted power that couldn't be explained`),
  ...v(p => `${p.sub} wanted to be taken somewhere impossible`),

  // Just the Scene
  "No backstory — start in the moment",
  "Skip the tension — we're already there",
  "Pure sensation, nothing required before it",
  "Just the part that matters",
  "In medias res — already past the beginning",
  "No plot, no premise — just this",

  // How does it end?
  ...v(p => `${p.sub} falls asleep in their arms`),
  "They don't leave until morning",
  ...v(p => `${p.sub} asks for more`),
  "No one speaks afterward",
  "They go again immediately",
  ...v(p => `${p.sub} doesn't want it to be over`),
  ...v(p => `They leave — ${p.sub} doesn't stop them`),
  ...v(p => `They stay and ${p.sub}'s surprised`),
  "Left open — mid-scene",
  ...v(p => `${p.sub}'s still feeling it hours later`),
  ...v(p => `${p.sub} texts them before they reach the door`),
  "They lock the door again",
];

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE B: validTags.ts — what the backend accepts
// Sync with STANDARD_TAGS, AFTER_DARK_TAGS, SCENARIO_PRESET_TAGS
// ─────────────────────────────────────────────────────────────────────────────

// Mirror of STANDARD_TAGS in validTags.ts
const BACKEND_STANDARD = [
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

  // Their Presence section (not shown in condensed UI)
  "Commanding", "Quiet Intensity", "Gentle", "Protective",
  "Unpredictable", "Brooding", "Playful", "Restrained",
  "Tender", "Obsessive", "Magnetic",
  "Controlled", "Relentless", "Patient", "Unshakeable",
  "Impossible to read",
  ...v(p => `Focused entirely on ${p.obj}`),

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

  // What Makes It Yours
  "It's set somewhere I know",
  "They remind me of someone",
  "The relationship is complicated",
  "It happens just once",
  "It happens more than once",
  "It shouldn't have happened",
  "It was always going to happen",
  "No one gets hurt",
  "Feelings are involved whether they want them or not",
  ...v(p => `${p.sub} could be me`),
  ...v(p => `${p.sub} doesn't tell anyone`),
  ...v(p => `${p.sub} tells one person`),

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

  // Nocturne
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

// Mirror of AFTER_DARK_TAGS in validTags.ts
const BACKEND_AFTER_DARK = [
  // Sensation & Restraint
  ...v(p => `${p.sub} wanted to be tied up`),
  ...v(p => `${p.sub} wanted to be blindfolded`),
  ...v(p => `${p.sub} wanted to be held down`),
  ...v(p => `${p.sub} wanted to be told not to move`),
  ...v(p => `${p.sub} wanted ${p.poss} mouth covered`),
  ...v(p => `${p.sub} wanted to be on display`),
  ...v(p => `${p.sub} wanted to be kneeling for them`),
  ...v(p => `${p.sub} wanted to be completely powerless`),
  ...v(p => `${p.sub} wanted something around ${p.poss} wrists`),
  ...v(p => `${p.sub} wanted to be undressed very slowly`),
  ...v(p => `${p.sub} wanted to be kept completely still`),
  ...v(p => `${p.sub} wanted to be wrapped and contained`),
  // Words & Praise
  ...v(p => `${p.sub} wanted to be praised`),
  ...v(p => `${p.sub} wanted to be told what ${p.sub} is`),
  ...v(p => `${p.sub} wanted to be narrated through it`),
  ...v(p => `${p.sub} wanted to be made to ask nicely`),
  ...v(p => `${p.sub} wanted to be made to repeat it back`),
  ...v(p => `${p.sub} wanted to be told ${p.refl} was perfect`),
  ...v(p => `${p.sub} wanted every moment described as it happened`),
  ...v(p => `${p.sub} wanted to hear how much they needed ${p.obj}`),
  ...v(p => `${p.sub} wanted to be called ${p.poss} name when it happened`),
  // Surrender & Power
  ...v(p => `${p.sub} wanted to be degraded`),
  ...v(p => `${p.sub} wanted to be spanked`),
  ...v(p => `${p.sub} wanted to be edged`),
  ...v(p => `${p.sub} wanted to be worshipped`),
  ...v(p => `${p.sub} wanted to be used and adored`),
  ...v(p => `${p.sub} wanted to be made to beg`),
  // Dark Fantasy
  ...v(p => `${p.sub} wanted something that wasn't entirely human`),
  ...v(p => `${p.sub} wanted to be claimed by something ancient and certain`),
  ...v(p => `${p.sub} wanted the rules of this world suspended`),
  ...v(p => `${p.sub} wanted power that couldn't be explained`),
  ...v(p => `${p.sub} wanted to be taken somewhere impossible`),
  // Just the Scene
  "No backstory — start in the moment",
  "Skip the tension — we're already there",
  "Pure sensation, nothing required before it",
  "Just the part that matters",
  "In medias res — already past the beginning",
  "No plot, no premise — just this",
  // How It Ends
  ...v(p => `${p.sub} falls asleep in their arms`),
  "They don't leave until morning",
  ...v(p => `${p.sub} asks for more`),
  "No one speaks afterward",
  "They go again immediately",
  ...v(p => `${p.sub} doesn't want it to be over`),
  ...v(p => `They leave — ${p.sub} doesn't stop them`),
  ...v(p => `They stay and ${p.sub}'s surprised`),
  "Left open — mid-scene",
  ...v(p => `${p.sub}'s still feeling it hours later`),
  ...v(p => `${p.sub} texts them before they reach the door`),
  "They lock the door again",
];

// Mirror of SCENARIO_PRESET_TAGS in validTags.ts
const BACKEND_SCENARIO_PRESETS = new Set([
  // Original presets
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
  // All of Them
  "Multiple men, undivided attention",
  "Black masculine dominance",
  "Physical dominance and commanding presence",
  "The object of all their wanting",
  // Dark Fantasy
  "Something not entirely human",
  "Ancient claiming",
  // Praise Room
  "Every word of praise named specifically",
  "He catalogues what she is",
  "She is described and adored as it happens",
  "The words are part of the act",
  // Drift (nocturne)
  "Warmth with nowhere to go",
  "The night is private and unhurried",
  "Warmth interrupted slowly",
  "He knows without asking",
]);

// ─────────────────────────────────────────────────────────────────────────────
// KNOWN_HISTORICAL_TAGS — in validTags.ts STANDARD_TAGS for backward
// compatibility with existing taste profiles and stories. No longer shown in
// the condensed standard UI. Intentional extras: not flagged as stale.
// ─────────────────────────────────────────────────────────────────────────────

const KNOWN_HISTORICAL_TAGS = new Set([
  // Standard feel tags not in condensed UI
  "Rescued", "Shattered",
  // Energy/tension tags not in condensed UI
  "Old Wounds", "Complicated", "Playful tension", "Bittersweet",
  "First time", "Reunion after years", "A decade of tension finally breaking",
  "Hate that was always this", "Friends who knew all along",
  // Their Presence section (not shown in condensed UI)
  "Commanding", "Quiet Intensity", "Gentle", "Protective",
  "Unpredictable", "Brooding", "Playful", "Restrained",
  "Tender", "Obsessive", "Magnetic",
  "Controlled", "Relentless", "Patient", "Unshakeable",
  "Impossible to read",
  ...v(p => `Focused entirely on ${p.obj}`),
  // Extended story texture not in condensed UI
  "Poetic", "Dreamlike", "Raw & real", "Intimate & internal",
  "Sensory", "Grounded & physical", "Interior monologue",
  "Explicit & direct", "Fragmented & urgent",
  // Extended pacing not in condensed UI
  "Quick burn", "Even tension", "Agonising build", "All foreplay",
  "Fast then tender", "One long exhale", "Interrupted and restarted",
  "Building to a crash", "Starting mid-desire",
  "Two speeds — nothing in between",
  // Extended "makes it yours" not in condensed UI
  "It's set somewhere I know",
  "It happens more than once",
  "Feelings are involved whether they want them or not",
  ...v(p => `${p.sub} could be me`),
  ...v(p => `${p.sub} doesn't tell anyone`),
  ...v(p => `${p.sub} tells one person`),
]);

// ── Diff ──────────────────────────────────────────────────────────────────────

const EXPECTED_UI = new Set([...UI_STANDARD, ...UI_AFTER_DARK]);
const BACKEND_ALLOWLIST = new Set([...BACKEND_STANDARD, ...BACKEND_AFTER_DARK, ...BACKEND_SCENARIO_PRESETS]);

// UI tags the backend doesn't accept → will be silently dropped (CRITICAL)
const missingFromBackend = [...EXPECTED_UI].filter(t => !BACKEND_ALLOWLIST.has(t));

// Backend entries not in UI, not scenario presets, not known historical → unexpected drift
const staleInBackend = [...BACKEND_ALLOWLIST].filter(
  t => !EXPECTED_UI.has(t) && !BACKEND_SCENARIO_PRESETS.has(t) && !KNOWN_HISTORICAL_TAGS.has(t)
);

let ok = true;

if (missingFromBackend.length > 0) {
  ok = false;
  console.error("❌  UI tags MISSING from validTags.ts (will be silently dropped by backend):");
  missingFromBackend.forEach(t => console.error(`   - ${JSON.stringify(t)}`));
}

if (staleInBackend.length > 0) {
  ok = false;
  console.error("❌  Unexpected stale entries in validTags.ts (not in UI, not scenario presets, not historical):");
  staleInBackend.forEach(t => console.error(`   ~ ${JSON.stringify(t)}`));
}

if (ok) {
  console.log(`✅  Tag parity OK`);
  console.log(`   UI tags:             ${EXPECTED_UI.size}`);
  console.log(`   Backend allowlist:   ${BACKEND_ALLOWLIST.size}`);
  console.log(`   Scenario presets:    ${BACKEND_SCENARIO_PRESETS.size}`);
  console.log(`   Historical extras:   ${KNOWN_HISTORICAL_TAGS.size}`);
}

process.exit(ok ? 0 : 1);
