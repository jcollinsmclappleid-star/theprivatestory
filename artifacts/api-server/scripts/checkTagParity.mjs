/**
 * Tag parity check — run with plain node (no build step required).
 *
 * Usage:
 *   node artifacts/api-server/scripts/checkTagParity.mjs
 *
 * Exit 0 → parity OK.  Exit 1 → mismatches found.
 *
 * SOURCE A — mirrors StoryTagStudio.tsx tag output (what the frontend can send).
 * SOURCE B — mirrors validTags.ts VALID_EXPERIENCE_TAGS (what the backend accepts).
 *
 * These are INDEPENDENT enumerations. If a tag is added to Source A but not B
 * it will be silently dropped by the backend. If B has entries missing from A
 * (other than scenario presets) those are stale allowlist entries.
 *
 * Update BOTH sources and the respective source file whenever StoryTagStudio.tsx
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
// SOURCE A: StoryTagStudio.tsx — what the UI can produce
// Keep in sync with buildStandardCategories() and buildAfterDarkCategories()
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

  // How do you want it written? (pacing + texture merged in UI)
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

// buildAfterDarkCategories() — ONLY what the function currently returns
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
// Keep in sync with STANDARD_TAGS, AFTER_DARK_TAGS, SCENARIO_PRESET_TAGS
// ─────────────────────────────────────────────────────────────────────────────

// Mirror of STANDARD_TAGS
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

// Mirror of AFTER_DARK_TAGS in validTags.ts
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

  // Top Fantasies
  "They get caught",
  "Someone else is watching",
  ...v(p => `They take, ${p.sub} receives`),
  ...v(p => `They find every limit ${p.sub} has`),
  ...v(p => `${p.sub} gives ${p.refl} over completely`),
  ...v(p => `${p.sub} begs for it`),
  ...v(p => `${p.sub} lets ${p.refl} be completely powerless`),
  ...v(p => `${p.sub} watches ${p.refl}`),
  ...v(p => `${p.sub} doesn't want them to stop`),
  ...v(p => `${p.sub} wears what they choose`),
  ...v(p => `${p.sub} loses the fight to stay quiet`),
  ...v(p => `${p.sub} doesn't know what comes next`),
  ...v(p => `They keep ${p.obj} at the edge`),
  ...v(p => `${p.sub} surrenders completely`),

  // What You Want Them To Do
  "Takes full control",
  "Commands what they want",
  "Takes their time",
  "Watches closely",
  "Uses only their hands first",
  ...v(p => `Covers ${p.poss} mouth`),
  ...v(p => `Makes ${p.obj} ask for it`),
  ...v(p => `Holds ${p.obj} in place`),
  ...v(p => `Undoes ${p.obj} slowly`),
  ...v(p => `Makes ${p.obj} earn it`),
  ...v(p => `Won't let ${p.obj} hide`),
  ...v(p => `Keeps ${p.obj} at the edge`),
  ...v(p => `Doesn't let ${p.obj} finish until they say`),
  ...v(p => `Takes ${p.obj} to every edge`),
  ...v(p => `Makes ${p.obj} count`),

  // The Scene
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
  ...v(p => `Hands behind ${p.poss} back`),
  ...v(p => `${p.sub} holds perfectly still for them`),
  ...v(p => `${p.sub}'s blindfolded`),

  // What sub Wants Said
  "They narrate everything as it happens",
  "They describe what comes next",
  "They say the name, every time",
  "They say it before they do it",
  "They count down",
  ...v(p => `They tell ${p.obj} what ${p.sub} is`),
  ...v(p => `${p.sub}'s told to repeat it back`),
  ...v(p => `${p.sub}'s told to ask nicely`),
  ...v(p => `They ask if ${p.sub} wants more`),
  ...v(p => `${p.sub} goes quiet when they say`),
  ...v(p => `${p.sub} tells them ${p.sub} wants it`),
  ...v(p => `${p.sub} holds still when they ask`),
  ...v(p => `They ask how it feels — ${p.sub} answers every time`),

  // Desire Details
  "Being told what to do",
  "Being completely seen",
  "Power fully exchanged",
  "Nothing off limits",
  "Total attention",
  "Total surrender",
  "Watched by someone",
  "Anonymous desire",
  "Multiple rounds",
  "They own every reaction",
  ...v(p => `${p.sub} takes control`),
  ...v(p => `${p.sub} loses count`),
  ...v(p => `Every part of ${p.obj}`),
  ...v(p => `${p.sub} holds nothing back`),
  ...v(p => `${p.sub} surrenders all control`),
  ...v(p => `${p.sub} chooses everything`),
  ...v(p => `${p.sub} surprises ${p.refl}`),

  // How It Ends
  "They don't leave until morning",
  "No one speaks afterward",
  "They go again immediately",
  "Left open — mid-scene",
  "They lock the door again",
  ...v(p => `${p.sub} falls asleep in their arms`),
  ...v(p => `${p.sub} asks for more`),
  ...v(p => `They leave — ${p.sub} doesn't stop them`),
  ...v(p => `They stay and ${p.sub}'s surprised`),
  ...v(p => `${p.sub}'s still feeling it hours later`),
  ...v(p => `${p.sub} texts them before they reach the door`),
  ...v(p => `${p.sub} doesn't want it to be over`),
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

// ── Diff ──────────────────────────────────────────────────────────────────────

const EXPECTED_UI = new Set([...UI_STANDARD, ...UI_AFTER_DARK]);
const BACKEND_ALLOWLIST = new Set([...BACKEND_STANDARD, ...BACKEND_AFTER_DARK, ...BACKEND_SCENARIO_PRESETS]);

// UI tags that the backend doesn't know → will be silently dropped
const missingFromBackend = [...EXPECTED_UI].filter(t => !BACKEND_ALLOWLIST.has(t));

// Backend entries not in UI and not scenario presets → stale allowlist entries
const staleInBackend = [...BACKEND_ALLOWLIST].filter(
  t => !EXPECTED_UI.has(t) && !BACKEND_SCENARIO_PRESETS.has(t)
);

let ok = true;

if (missingFromBackend.length > 0) {
  ok = false;
  console.error("❌  UI tags MISSING from validTags.ts (will be silently dropped by backend):");
  missingFromBackend.forEach(t => console.error(`   - ${JSON.stringify(t)}`));
}

if (staleInBackend.length > 0) {
  console.warn("⚠️   validTags.ts entries not found in StoryTagStudio (stale — not scenario presets):");
  staleInBackend.forEach(t => console.warn(`   ~ ${JSON.stringify(t)}`));
}

if (ok) {
  console.log(`✅  Tag parity OK`);
  console.log(`   UI tags:             ${EXPECTED_UI.size}`);
  console.log(`   Backend allowlist:   ${BACKEND_ALLOWLIST.size}`);
  console.log(`   Scenario presets:    ${BACKEND_SCENARIO_PRESETS.size}`);
}

process.exit(ok ? 0 : 1);
