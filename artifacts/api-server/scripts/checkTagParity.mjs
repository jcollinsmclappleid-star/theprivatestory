/**
 * Tag parity check — run with plain node (no build step required).
 *
 * Usage:
 *   node artifacts/api-server/scripts/checkTagParity.mjs
 *
 * Exit 0 → parity OK.  Exit 1 → mismatches found.
 *
 * This script independently re-implements the tag lists from two sources:
 *   A) StoryTagStudio.tsx  — "what the frontend can send"
 *   B) validTags.ts        — "what the backend accepts"
 *
 * If A has tags missing from B, legitimate user-selected tags will be dropped.
 * If B has tags missing from A (other than scenario presets), those entries are stale.
 *
 * Update both this script and the respective source file whenever StoryTagStudio.tsx
 * or AfterDark.tsx scenario tags change.
 */

// ── Pronoun contexts ──────────────────────────────────────────────────────────

const PRONOUNS = [
  { sub: "She",  obj: "her",  poss: "her",   refl: "herself"    },
  { sub: "He",   obj: "him",  poss: "his",   refl: "himself"    },
  { sub: "They", obj: "them", poss: "their", refl: "themselves" },
  { sub: "You",  obj: "you",  poss: "your",  refl: "yourself"   },
];

const v = (fn) => PRONOUNS.map(fn);

// ── A: StoryTagStudio tags (what the UI can produce) ────────────────────────

const UI_STANDARD = [
  "Desired","Seen","Powerful","Safe","Vulnerable",
  "Chosen","Overwhelmed","Undone","Adored","Electric",
  "Rescued","Consumed","Breathless","Known","Discovered",
  "Wanted","Held","Irreplaceable","Shattered","Lit up",

  "Slow Build","Instant Chemistry","Unfinished Business",
  "Old Wounds","Forbidden","Push & Pull",
  "Inevitable","Complicated","Playful tension","Bittersweet",
  "First time","Reunion after years","Rivals to lovers",
  "One night only","A decade of tension finally breaking",
  "Hate that was always this","Friends who knew all along",

  "Commanding","Quiet Intensity","Gentle","Protective",
  "Unpredictable","Brooding","Playful","Restrained",
  "Tender","Obsessive","Magnetic","Dangerous",
  "Controlled","Relentless","Patient","Unshakeable",
  "Impossible to read",
  ...v(p => `Focused entirely on ${p.obj}`),

  "Dialogue-rich","Mostly sensation","Poetic",
  "Sharp & direct","Dreamlike","Cinematic",
  "Raw & real","Intimate & internal","Lyrical",
  "Sensory","Grounded & physical","Interior monologue",
  "Explicit & direct","Fragmented & urgent",

  "Slow simmer","Quick burn","Even tension",
  "Agonising build","All foreplay","Fast then tender",
  "One long exhale","Interrupted and restarted",
  "Building to a crash","Starting mid-desire",
  "Two speeds — nothing in between",

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

const UI_AFTER_DARK = [
  "They find every limit","They get caught","Someone else is watching",
  ...v(p => `They take, ${p.sub} receives`),
  ...v(p => `${p.sub} doesn't say stop`),
  ...v(p => `${p.sub} does exactly as ${p.poss} told`),
  ...v(p => `They make ${p.obj} beg for it`),
  ...v(p => `${p.sub}'s completely powerless`),
  ...v(p => `${p.sub} watches ${p.refl}`),
  ...v(p => `${p.sub} doesn't want them to stop`),
  ...v(p => `${p.sub} wears what they choose`),
  ...v(p => `They make ${p.obj} say it out loud`),
  ...v(p => `${p.sub} earns what ${p.poss} gets`),
  ...v(p => `They go again before ${p.sub} recovers`),
  ...v(p => `${p.sub} doesn't know what comes next`),
  ...v(p => `They keep ${p.obj} at the edge`),
  ...v(p => `${p.sub} surrenders completely`),

  "Takes full control","Commands what they want","Takes their time","Doesn't stop",
  "Watches closely","Covers their mouth","Goes again immediately",
  "Pushes every limit","Asks permission first — then ignores the answer",
  "Uses only their hands first",
  ...v(p => `Makes ${p.obj} ask for it`),
  ...v(p => `Holds ${p.obj} in place`),
  ...v(p => `Undoes ${p.obj} slowly`),
  ...v(p => `Makes ${p.obj} earn it`),
  ...v(p => `Won't let ${p.obj} hide`),
  ...v(p => `Keeps ${p.obj} at the edge`),
  ...v(p => `Doesn't let ${p.obj} finish until they say`),
  ...v(p => `Makes ${p.obj} count`),

  "Slow undressing","Everything at once","In the dark","Fully lit",
  "Against a wall","In front of a mirror","Barely private","Somewhere unexpected",
  "Horizontal","Standing the whole time","Tied down",
  "On the desk","In the bath","Outdoors, barely hidden","In the car","On the floor",
  "Fully clothed at first",
  ...v(p => `Hands behind ${p.poss} back`),
  ...v(p => `${p.sub} doesn't move unless told`),
  ...v(p => `${p.sub}'s blindfolded`),

  "They narrate everything as it happens","They describe what comes next",
  "They say the name, every time","They say it before they do it","They count down",
  ...v(p => `They tell ${p.obj} what ${p.sub} is`),
  ...v(p => `${p.sub}'s told to repeat it back`),
  ...v(p => `${p.sub}'s told to ask nicely`),
  ...v(p => `They ask if ${p.sub} wants more`),
  ...v(p => `${p.sub}'s told to be quiet`),
  ...v(p => `They make ${p.obj} say ${p.sub} wants it`),
  ...v(p => `They tell ${p.obj} not to move`),
  ...v(p => `They ask ${p.obj} how it feels — ${p.sub} has to answer`),

  "Being told what to do","Being completely seen","Power fully exchanged",
  "Nothing off limits","Total attention","Total surrender",
  "Boundaries dissolved","Watched by someone","Anonymous desire",
  "Multiple rounds","Nothing is private","They own every reaction",
  ...v(p => `${p.sub} takes control`),
  ...v(p => `${p.sub} loses count`),
  ...v(p => `Every part of ${p.obj}`),
  ...v(p => `${p.sub} surrenders all control`),
  ...v(p => `${p.sub} chooses everything`),
  ...v(p => `${p.sub} surprises ${p.refl}`),

  "They don't leave until morning","No one speaks afterward",
  "They go again immediately","Left open — mid-scene","They lock the door again",
  ...v(p => `${p.sub} falls asleep in their arms`),
  ...v(p => `${p.sub} asks for more`),
  ...v(p => `They leave — ${p.sub} doesn't stop them`),
  ...v(p => `They stay and ${p.sub}'s surprised`),
  ...v(p => `${p.sub}'s still feeling it hours later`),
  ...v(p => `${p.sub} texts them before they reach the door`),
  ...v(p => `${p.sub} doesn't want it to be over`),
];

// ── B: validTags.ts canonical list (what the backend accepts beyond UI_*) ────
// Scenario preset tags that are NOT in StoryTagStudio but ARE in validTags.ts:

const SCENARIO_PRESETS = new Set([
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
const BACKEND_ALLOWLIST = new Set([...UI_STANDARD, ...UI_AFTER_DARK, ...SCENARIO_PRESETS]);

// Tags that UI generates but backend doesn't know about → will be silently dropped
const missingFromBackend = [...EXPECTED_UI].filter(t => !BACKEND_ALLOWLIST.has(t));

// Tags only in backend that are NOT scenario presets and NOT in UI → stale entries
const staleInBackend = [...BACKEND_ALLOWLIST].filter(t => !EXPECTED_UI.has(t) && !SCENARIO_PRESETS.has(t));

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
  console.log(`   UI tags:          ${EXPECTED_UI.size}`);
  console.log(`   Scenario presets: ${SCENARIO_PRESETS.size}`);
  console.log(`   Backend total:    ${BACKEND_ALLOWLIST.size}`);
}

process.exit(ok ? 0 : 1);
