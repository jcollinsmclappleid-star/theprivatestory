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

  // Words & Praise
  ...v(p => `${p.sub} wanted to be praised`),
  ...v(p => `${p.sub} wanted to be told what ${p.sub} is`),
  ...v(p => `${p.sub} wanted to be narrated through it`),
  ...v(p => `${p.sub} wanted to be made to ask nicely`),
  ...v(p => `${p.sub} wanted to be made to repeat it back`),

  // Surrender & Power
  ...v(p => `${p.sub} wanted to be degraded`),
  ...v(p => `${p.sub} wanted to be spanked`),
  ...v(p => `${p.sub} wanted to be edged`),
  ...v(p => `${p.sub} wanted to be worshipped`),
  ...v(p => `${p.sub} wanted to be used and adored`),
  ...v(p => `${p.sub} wanted to be made to beg`),

  // How does it end? — explicit agency-led climax
  ...v(p => `${p.sub} comes apart completely`),
  ...v(p => `${p.sub} finishes while they watch`),
  ...v(p => `${p.sub} loses count of how many times`),
  ...v(p => `${p.sub} comes the moment they say to`),
  ...v(p => `${p.sub} asks to go again before they've stopped`),
  ...v(p => `${p.sub} is shaking and wants more`),
  ...v(p => `${p.sub} gets everything that was promised`),
  // How does it end? — aftermath
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

  // Their Presence
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
];

// Mirror of AFTER_DARK_TAGS in validTags.ts (trimmed to current UI)
const BACKEND_AFTER_DARK = [
  // What do you want? — Sensation & Restraint
  ...v(p => `${p.sub} wanted to be tied up`),
  ...v(p => `${p.sub} wanted to be blindfolded`),
  ...v(p => `${p.sub} wanted to be held down`),
  ...v(p => `${p.sub} wanted to be told not to move`),
  ...v(p => `${p.sub} wanted ${p.poss} mouth covered`),
  ...v(p => `${p.sub} wanted to be on display`),
  ...v(p => `${p.sub} wanted to be kneeling for them`),
  ...v(p => `${p.sub} wanted to be completely powerless`),
  // What do you want? — Words & Praise
  ...v(p => `${p.sub} wanted to be praised`),
  ...v(p => `${p.sub} wanted to be told what ${p.sub} is`),
  ...v(p => `${p.sub} wanted to be narrated through it`),
  ...v(p => `${p.sub} wanted to be made to ask nicely`),
  ...v(p => `${p.sub} wanted to be made to repeat it back`),
  // What do you want? — Surrender & Power
  ...v(p => `${p.sub} wanted to be degraded`),
  ...v(p => `${p.sub} wanted to be spanked`),
  ...v(p => `${p.sub} wanted to be edged`),
  ...v(p => `${p.sub} wanted to be worshipped`),
  ...v(p => `${p.sub} wanted to be used and adored`),
  ...v(p => `${p.sub} wanted to be made to beg`),
  // How It Ends — explicit agency-led climax
  ...v(p => `${p.sub} comes apart completely`),
  ...v(p => `${p.sub} finishes while they watch`),
  ...v(p => `${p.sub} loses count of how many times`),
  ...v(p => `${p.sub} comes the moment they say to`),
  ...v(p => `${p.sub} asks to go again before they've stopped`),
  ...v(p => `${p.sub} is shaking and wants more`),
  ...v(p => `${p.sub} gets everything that was promised`),
  // How It Ends — aftermath
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
