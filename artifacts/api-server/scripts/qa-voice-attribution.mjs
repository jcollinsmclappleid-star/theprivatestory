#!/usr/bin/env node
/**
 * qa-voice-attribution.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * QA harness for the multi-voice speaker attribution pipeline.
 *
 * Calls POST /api/debug-tags (zero ElevenLabs calls) for each story and
 * applies per-pairing pass criteria. Prints a story-by-story report plus a
 * pairing-level summary table.
 *
 * Story selection (pick one; default = library stories only):
 *   --all              Test every story in the DB (library + user-created)
 *   --recent N         Test the N most recently created stories (any type)
 *   --story <id>       Test one specific story by ID (skips synthetic suite)
 *
 * Filtering & output:
 *   --pairing "Her & Him"   Restrict to one pairing (applies to DB rows + synthetics)
 *   --verbose               Show segment counts for every story
 *
 * Usage:
 *   ADMIN_SCRIPT_KEY=<key> node scripts/qa-voice-attribution.mjs
 *   ADMIN_SCRIPT_KEY=<key> node scripts/qa-voice-attribution.mjs --all
 *   ADMIN_SCRIPT_KEY=<key> node scripts/qa-voice-attribution.mjs --recent 20
 *   ADMIN_SCRIPT_KEY=<key> node scripts/qa-voice-attribution.mjs --story abc123
 *   ADMIN_SCRIPT_KEY=<key> node scripts/qa-voice-attribution.mjs --pairing "Her & Her"
 *
 * Final accuracy (last run): documented at bottom of file after each iteration.
 */

import { execSync } from "child_process";

const API_BASE    = process.env.API_BASE    ?? "http://localhost:8080";
const ADMIN_TOKEN = process.env.ADMIN_SCRIPT_KEY ?? "";
const VERBOSE     = process.argv.includes("--verbose");
const ALL_STORIES = process.argv.includes("--all");

const STORY_ID = (() => {
  const idx = process.argv.indexOf("--story");
  return idx !== -1 ? process.argv[idx + 1] : null;
})();
const RECENT_N = (() => {
  const idx = process.argv.indexOf("--recent");
  if (idx === -1) return null;
  const n = parseInt(process.argv[idx + 1], 10);
  return isNaN(n) ? null : n;
})();
const PAIRING_FILTER = (() => {
  const idx = process.argv.indexOf("--pairing");
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

if (!ADMIN_TOKEN) {
  console.error("ERROR: ADMIN_SCRIPT_KEY environment variable is required.");
  process.exit(1);
}

// ── Colours ────────────────────────────────────────────────────────────────
const C = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  red:    "\x1b[31m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  cyan:   "\x1b[36m",
  gray:   "\x1b[90m",
};
const pass = (s) => `${C.green}✓ ${s}${C.reset}`;
const fail = (s) => `${C.red}✗ ${s}${C.reset}`;
const warn = (s) => `${C.yellow}⚠ ${s}${C.reset}`;

// ── Helpers ────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function debugTags(body) {
  const res = await fetch(`${API_BASE}/api/debug-tags`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "x-admin-token": ADMIN_TOKEN,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`debug-tags HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// ── Per-pairing pass criteria ──────────────────────────────────────────────
//
// Returns { pass: boolean, issues: string[] } given a debug-tags response.
//
// Key invariants per pairing class:
//
//   GENDER pairings (Her & Him, Her & Them, Him & Them):
//     • wouldUseMultiVoice = true
//     • explicitAttributions >= 1
//     • No CHAR_B segment attributed by female/firstSecond   (love interest is not female protagonist)
//     • No CHAR_A segment attributed by male                 (protagonist is not the male love interest)
//     Her & Him specifically:
//       • "male" signal  → CHAR_B  (he said → James)
//       • "female" signal → CHAR_A (she said → Maya/Clara)
//     Her & Them:
//       • "they" signal  → CHAR_B
//       • "female" signal → CHAR_A
//     Him & Them:
//       • "they" signal  → CHAR_B
//       • "male" signal  → CHAR_A  (protag is male, "he" → CHAR_A)
//
//   SAME-GENDER pairings (Her & Her, Him & Him):
//     • wouldUseMultiVoice = true  (requires charSegments >= 4 via turn-taking)
//     • No long runs of same-role dialogue (max 6 consecutive same-role)
//
//   THEM pairings (Them & Them):
//     • wouldUseMultiVoice = true
//     • At least 1 "they" attribution OR charSegments >= 4 (turn-taking gate)
//
//   NULL / unknown pairing (legacy stories with no casting_data):
//     • Default to Her & Him behaviour

function assess(r) {
  const issues = [];
  const p = (r.pairing ?? "Her & Him").toLowerCase().trim();
  const segs = r.segments ?? [];
  const charSegs = segs.filter(s => s.role !== "NARRATOR");
  const { wouldUseMultiVoice, explicitAttributions, distinctCharRoles } = r.summary;

  if (p === "her & him" || p === "" || p === "her & him & him" || p === "her & her & him") {
    // Her & Him: multi-voice is only expected when at least one explicit gender attribution
    // fired. Stories where all dialogue is unattributed (explicitAttr=0) correctly fall back
    // to single-voice because the tagger can't safely assign voices without a cue.
    if (explicitAttributions >= 1 && !wouldUseMultiVoice) {
      issues.push(`wouldUseMultiVoice=false despite ${explicitAttributions} explicit attribution(s) (distinctCharRoles=${distinctCharRoles}, charSegs=${charSegs.length})`);
    }
    // No further checks needed when single-voice fires correctly (or fail if issue was pushed).
    if (!wouldUseMultiVoice) return { pass: issues.length === 0, issues };
    // Attribution correctness when multi-voice IS active:
    for (const s of charSegs) {
      if (s.role === "CHAR_B" && (s.how === "female" || s.how === "firstSecond")) {
        issues.push(`CHAR_B (love interest/James) attributed via "${s.how}" — should be "male": "${s.preview?.slice(0,60)}"`);
      }
      if (s.role === "CHAR_A" && s.how === "male") {
        issues.push(`CHAR_A (protagonist) attributed via "male" — should be "female" or "firstSecond": "${s.preview?.slice(0,60)}"`);
      }
    }

  } else if (p === "her & her" || p === "him & him") {
    // Same-gender: multi-voice only expected when BOTH character roles appear in the
    // segments (distinctCharRoles >= 2) AND enough turn-taking segs exist (>= 4).
    // Stories where only one character's dialogue is found (one-sided monologue) correctly
    // use single-voice — the other voice would be wasted and never heard.
    if (distinctCharRoles >= 2 && charSegs.length >= 4 && !wouldUseMultiVoice) {
      issues.push(`wouldUseMultiVoice=false despite distinctCharRoles=${distinctCharRoles} and charSegs=${charSegs.length}`);
    }
    if (!wouldUseMultiVoice) return { pass: issues.length === 0, issues };
    // Check for excessively long same-role runs (> 5 consecutive = 6+ is a fail).
    let runLen = 1;
    for (let i = 1; i < charSegs.length; i++) {
      if (charSegs[i].role === charSegs[i-1].role) {
        runLen++;
        if (runLen > 5) {
          issues.push(`${charSegs[i].role} run of ${runLen}+ segments at index ${i} — same-role streak of 6+ sounds like one voice`);
          break;
        }
      } else {
        runLen = 1;
      }
    }

  } else if (p === "her & them") {
    // Pass if multi-voice fires. Multi-voice fires via "they" attribution OR charSegs >= 4.
    // If neither, single-voice is correct — no issue.
    const theyForB = charSegs.filter(s => s.role === "CHAR_B" && s.how === "they");
    if ((theyForB.length >= 1 || charSegs.length >= 4) && !wouldUseMultiVoice) {
      issues.push(`wouldUseMultiVoice=false despite ${theyForB.length} "they" attr(s) and ${charSegs.length} char segs (distinctCharRoles=${distinctCharRoles})`);
    }
    if (!wouldUseMultiVoice) return { pass: issues.length === 0, issues };
    for (const s of charSegs) {
      if (s.role === "CHAR_B" && s.how === "female") issues.push(`CHAR_B via "female" — wrong for Her & Them: "${s.preview?.slice(0,60)}"`);
      if (s.role === "CHAR_A" && s.how === "male")   issues.push(`CHAR_A via "male" — wrong for Her & Them: "${s.preview?.slice(0,60)}"`);
    }

  } else if (p === "him & them") {
    // Same structure as Her & Them.
    const theyForB = charSegs.filter(s => s.role === "CHAR_B" && s.how === "they");
    if ((theyForB.length >= 1 || charSegs.length >= 4) && !wouldUseMultiVoice) {
      issues.push(`wouldUseMultiVoice=false despite ${theyForB.length} "they" attr(s) and ${charSegs.length} char segs (distinctCharRoles=${distinctCharRoles})`);
    }
    if (!wouldUseMultiVoice) return { pass: issues.length === 0, issues };
    for (const s of charSegs) {
      if (s.role === "CHAR_B" && s.how === "male") issues.push(`CHAR_B via "male" — "he" should map to CHAR_A in Him & Them: "${s.preview?.slice(0,60)}"`);
      if (s.role === "CHAR_B" && s.how === "female") issues.push(`CHAR_B via "female" — wrong for Him & Them: "${s.preview?.slice(0,60)}"`);
    }

  } else if (p === "them & them") {
    // Them & Them uses turn-taking gate (charSegs >= 4), same as same-gender pairings.
    if (charSegs.length >= 4 && !wouldUseMultiVoice) {
      issues.push(`wouldUseMultiVoice=false despite ${charSegs.length} char segs (distinctCharRoles=${distinctCharRoles})`);
    }
    if (!wouldUseMultiVoice) return { pass: issues.length === 0, issues };
    for (const s of charSegs) {
      if (s.how === "male" || s.how === "female") {
        issues.push(`${s.role} via "${s.how}" — Them & Them should use "they" or turn-taking, not gender pronouns: "${s.preview?.slice(0,60)}"`);
      }
    }
  }

  return { pass: issues.length === 0, issues };
}

// ── Synthetic stress-test samples (10 per pairing × 6 pairings = 60 total) ─
// Voice IDs: Clara=FA6HhUjVbervLw2rNl8M Maya=tQ4MEZFJOzsahSEEZtHK
//             James=AeRdCCKzvd23BpJoofzx Theo=jfIS2w2yJi0grJZPyEsk
const SYNTHETIC_SAMPLES = [

  // ── Her & Him ─────────────────────────────────────────────────────────────
  { label: "Her & Him S01 — standard he said / she said", pairing: "Her & Him", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The train compartment was empty except for the two of them.

"You took the last seat in first class," he said.

"And you took the seat across from me," she said, not looking up from her book.

"Fair point," he said. He set his bag down. "Daniel."

"I know who you are," she said. She turned a page. "Everyone does."

"Then you have the advantage," he said. "Who are you."

"Someone who reads on trains," she said. She looked up. "Sit down, Daniel."` },

  { label: "Her & Him S02 — name attribution (Marcus)", pairing: "Her & Him", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `She had been standing at the bar for exactly as long as it took Marcus to notice her.

"You're not drinking it," Marcus said, nodding at the untouched glass.

"I ordered it as an excuse to stand here," she said.

"That's either very honest or very bold," Marcus said.

"Both," she said.

Marcus said, "Then I'll get you one you'll actually drink."

"You already know what I want," she said. "That's the problem."` },

  { label: "Her & Him S03 — second-person you say", pairing: "Her & Him", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `He has been watching you from the end of the gallery for twenty minutes.

"I keep coming back to this one," he said, stopping beside you.

"So do I," you say.

"Every Thursday," he said. "I've noticed."

"You've been here every Thursday too," you say.

"I have," he said. He doesn't look at the painting. "I think we both know it's not about the painting."

"No," you say. "It isn't."` },

  { label: "Her & Him S04 — mixed he said + you say", pairing: "Her & Him", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The hotel bar is closing. He is the only other person at the counter.

"Last call," he said.

"I know," you say. "I can't seem to leave."

"Neither can I," he said. He turned toward her. "I saw you at the conference."

"I know," you say. "I saw you seeing me."

"Is that an invitation or a warning?" he said.

"Depends on what you do next," you say.` },

  { label: "Her & Him S05 — love interest dominant (he said ×5)", pairing: "Her & Him", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `She came to the gallery opening because she knew he would be there.

"You look like you hate every painting in this room," he said.

She smiled. "Only most of them."

"Honest," he said. He moved closer. "Which one is the exception."

She pointed.

"That's mine," he said. "I painted it last winter. After something ended."

She turned to look at him properly. He let her.

"You could have said nothing," he said. "Most people do."

"I'm not most people," she said.

"No," he said. "I can see that."` },

  { label: "Her & Him S06 — protagonist dominant (she said ×4)", pairing: "Her & Him", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `She found him at the back of the bookshop, in a section nobody visited.

"You're hiding," she said.

He looked up. "From the party."

"It's your own party," she said.

"That makes it worse," he said.

"Come back inside," she said.

"Why."

"Because," she said, "I want to dance with you. Once. Before you go back to being unavailable."

He closed the book. "Who says I'm unavailable."

"You do," she said. "Every day."` },

  { label: "Her & Him S07 — rapid short exchange (7 segs)", pairing: "Her & Him", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `He was standing in her kitchen at seven a.m. looking for coffee.

"Top shelf," she said.

"Found it," he said.

"Mugs are below," she said.

"Got it," he said.

"Sugar's on the table," she said.

"I don't take sugar," he said.

She looked at him across the kitchen. "I know," she said. "I've been watching you have coffee for three months."` },

  { label: "Her & Him S08 — toggle-only no cues → single-voice correct", pairing: "Her & Him", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The room was quiet. The fire had burned low.

"Stay."

"I can't."

"You can."

"That's different from should."

"Is it."

"You know it is."

"Then tell me to go."

A long silence.

"I can't do that either."` },

  { label: "Her & Him S09 — she said + he said balanced", pairing: "Her & Him", voiceId: "tQ4MEZFJOzsahSEEZtHK",
    text: `She knocked on the door of his study at half past eleven.

"I can't sleep," she said.

He set down his pen. "Neither can I."

"I know," she said. "I can hear you walking around."

"Sorry," he said.

"Don't be," she said. She sat across from him. "What are you thinking about."

"You know what I'm thinking about," he said.

"Say it," she said.

He looked at her. "You," he said.

"I know," she said.` },

  { label: "Her & Him S10 — opening female then male dialogue", pairing: "Her & Him", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `"I know you're awake," she said.

He was. He had been lying still for an hour, listening to her breathe.

"Yes," he said.

"Then stop pretending," she said.

He turned toward her. She was already looking at him.

"How long," he said.

"Since Tuesday," she said.

"Me too," he said.

She reached over and turned off the lamp. "Good," she said.` },

  // ── Her & Her ─────────────────────────────────────────────────────────────
  { label: "Her & Her S01 — balanced toggle 8 segs", pairing: "Her & Her", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `She found her on the roof terrace at midnight.

"You're still here," the woman said.

"Where else would I be," she said.

"Anywhere sensible," the woman said.

"Since when am I sensible," she said.

"Fair," the woman said. She poured a glass and passed it. "Are you going to tell me why you really came up here?"

"No," she said. "Are you going to tell me why you waited?"

"No," the woman said.

They drank in the kind of silence that isn't empty.` },

  { label: "Her & Her S02 — long balanced exchange 12 segs", pairing: "Her & Her", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The studio was closed. She let herself in with a key she wasn't supposed to have anymore.

"I knew you'd come back," the woman at the easel said without turning.

"I came for the painting," she said.

"No you didn't," the woman said.

"No," she said. "I didn't."

"Then say what you came to say," the woman said.

"I don't know how," she said.

"Try," the woman said.

"I was wrong," she said. "About all of it."

"I know," the woman said.

"Is that enough," she said.

"It's a start," the woman said.` },

  { label: "Her & Her S03 — short 3 segs → single-voice correct", pairing: "Her & Her", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The office was empty. She had come back for her bag.

She said to the woman still at her desk: "Still here."

"Always," the woman said.

"Get some sleep," she said.

The woman smiled but didn't look up.` },

  { label: "Her & Her S04 — only protagonist you say → single-voice correct", pairing: "Her & Her", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `She is sitting across the desk from you, waiting.

"I've made a decision," you say.

She nods. She already knows.

"I'm not going to wait anymore," you say.

"Good," she says.

"I mean it," you say.

"I know you do," she says, and smiles in a way that means she's been waiting for you to figure this out for a long time.

"You already knew," you say.

"I did," she says.` },

  { label: "Her & Her S05 — named character (Elena) + toggle", pairing: "Her & Her", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `She had been avoiding Elena for two weeks. Elena, apparently, had not been avoiding her.

"Dinner," Elena said. Not a question.

"I'm busy," she said.

"You've been busy for two weeks," Elena said.

"Fine," she said. "Dinner."

"Tonight," Elena said.

"Tonight," she said.

Elena looked at her steadily. "Whatever you're afraid of — don't be."

"Easy for you to say," she said.

"I've been waiting," Elena said. "I'm very patient."

"I know," she said. "That's the problem."` },

  { label: "Her & Her S06 — toggle with narrative breaks", pairing: "Her & Her", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The hotel room had one bed. They had booked it that way. Neither had mentioned it until now.

"You could take the sofa," the woman said.

"I could," she said.

The woman crossed to the window. The city lights were still on below.

"Neither of us is going to the sofa," the woman said.

"No," she said.

"So we should probably say something," the woman said.

"I'm saying it now," she said.` },

  { label: "Her & Her S07 — unbalanced but both present (3A, 5B)", pairing: "Her & Her", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `She cornered her supervisor after the meeting.

"You knew," she said.

"Yes," her supervisor said.

"You knew and you said nothing," she said.

"I was waiting for you to figure it out yourself," her supervisor said.

"That's—" she said. Stopped.

"Infuriating?" her supervisor said.

"Yes," she said.

"Good," her supervisor said. "That means you're paying attention."` },

  { label: "Her & Her S08 — both speak clearly, 8 segs", pairing: "Her & Her", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `She found her at the hotel pool at midnight. The surface of the water was still.

"I didn't know you were here too," the woman said.

"I registered last minute," she said.

"Good conference," the woman said.

"Better now," she said.

The woman looked at her directly.

"I'm going to say something," the woman said, "and I need you not to panic."

"Okay," she said.

"I've been thinking about you since February," the woman said.

"So have I," she said. "About you."` },

  { label: "Her & Her S09 — exactly 4 segs minimum gate", pairing: "Her & Her", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The fitting room had one curtain. The designer pulled it closed behind them both.

"You're not looking at the dress," the woman said.

"No," she said.

"Turn around," the woman said.

She did. "Well?"

"Perfect," the woman said.` },

  { label: "Her & Her S10 — fire exit, both sides", pairing: "Her & Her", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `It was the kind of party neither of them wanted to be at. They found each other by the fire exit.

"Thinking about leaving?" the woman said.

"Constantly," she said.

"Me too," the woman said. "But I keep finding reasons to stay."

"What kind of reasons," she said.

"The kind that appear by fire exits," the woman said.

"That's very smooth," she said.

"Thank you," the woman said.` },

  // ── Him & Him ─────────────────────────────────────────────────────────────
  { label: "Him & Him S01 — balanced toggle 8 segs", pairing: "Him & Him", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `They had been sharing an office for three years. Tonight they were the last two in the building.

"You didn't go to the leaving drinks," he said.

"No," said the other man. "You either."

"No," he said.

"Interesting," the other man said.

"Is it," he said.

"We both skipped the same party," the other man said.

"That's either a coincidence," he said, "or it isn't."

"It isn't," the other man said.` },

  { label: "Him & Him S02 — long balanced 12 segs", pairing: "Him & Him", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `The mountain refuge had one room left. They had both booked it online.

"I'll take the floor," the man said.

"I'm not going to let you take the floor," he said.

"I don't mind," the man said.

"I mind," he said.

"Why," the man said.

He didn't answer immediately.

"Because," he said, "I've been finding reasons to speak to you all day and this is another one."

A silence.

"The bed is big enough," the man said.

"Yes," he said.

"Then stop arguing," the man said.

"Yes," he said.` },

  { label: "Him & Him S03 — short 3 segs → single-voice correct", pairing: "Him & Him", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `The bar was closing. Only two of them left.

"Last round?" the man said.

"No," he said.

"Somewhere else then," the man said.` },

  { label: "Him & Him S04 — named character (Rafe) + toggle", pairing: "Him & Him", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `He had known Rafe since university. Tonight was different.

"You're staring," Rafe said.

"I know," he said.

"You've been staring for an hour," Rafe said.

"I know," he said.

"Say something else," Rafe said.

"I can't," he said.

"Try," Rafe said.

"I think I've been in love with you for approximately six years," he said.

"Seven," Rafe said. "I got there first."` },

  { label: "Him & Him S05 — you say protagonist + toggle", pairing: "Him & Him", voiceId: "jfIS2w2yJi0grJZPyEsk",
    text: `You and the man across the aisle have been exchanging looks since Paris.

"Brussels already," he said.

"Time flies," you say.

"Does it," he said.

"When you're paying attention," you say.

"And if I've been paying attention to the wrong things," he said.

"Depends on what you've been looking at," you say.

He looks at you directly. "Then it's the right thing," he said.` },

  { label: "Him & Him S06 — toggle with narrative breaks", pairing: "Him & Him", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `The dressing room backstage was small. They had shared smaller.

"Good show," the other man said.

"Better crowd than yesterday," he said.

"You were looking for someone," the other man said.

"Was I," he said.

"Front row, left side," the other man said.

"Am I that obvious," he said.

"Only to me," the other man said.` },

  { label: "Him & Him S07 — named (Marcus) unbalanced both present", pairing: "Him & Him", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `He ran into Marcus at the airport at six in the morning.

"Same flight?" Marcus said.

"Apparently," he said.

"Same gate," Marcus said.

"Apparently," he said again.

"Seat?" Marcus said.

"14C," he said.

"14D," Marcus said.

He stopped walking. "You checked my boarding pass."

"I checked the passenger list," Marcus said. "I have access."

"That's either very impressive or very alarming," he said.

"Both," Marcus said.` },

  { label: "Him & Him S08 — both speak clearly 8 segs", pairing: "Him & Him", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `The gallery was closing. He had been in front of the same piece for forty minutes when the other man returned.

"Still here," the man said.

"Still here," he said.

"You're going to buy it," the man said.

"I can't afford it," he said.

"You can," the man said. "I know what you earn."

"That's disconcerting," he said.

"You've been disconcerting me since March," the man said.

"Then we're even," he said.` },

  { label: "Him & Him S09 — exactly 5 segs each side", pairing: "Him & Him", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `The sauna at the hotel had been empty for an hour. Then it wasn't.

"Busy day," the man said.

"Very," he said.

"Same conference?" the man said.

"Same company," he said. "I'm your new account director."

The man looked at him steadily. "Well," he said. "This is going to be complicated."

"I know," he said.` },

  { label: "Him & Him S10 — one dominates, other appears", pairing: "Him & Him", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `He found his old friend on the same park bench they'd always used.

"You didn't come to the reunion," his friend said.

"No," he said.

"You said you would," his friend said.

"I know," he said.

"You knew I'd be there," his friend said.

"Yes," he said.

"So why—" his friend said.

"Because I wasn't ready," he said. "I am now."

His friend was quiet.

"Now you say something," he said.

"I've been waiting five years," his friend said.` },

  // ── Her & Them ────────────────────────────────────────────────────────────
  { label: "Her & Them S01 — they said ×3 standard", pairing: "Her & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The conference hotel bar was quiet. She had been avoiding the closing reception.

"You missed the last panel," they said, settling onto the stool beside her.

"I know," she said.

"It was about you," they said.

"I know," she said. "That's why I missed it."

"Fair," they said. They ordered without looking at the menu. "I'm Sasha."

"I know who you are," she said. "Everyone does."

"And yet you're talking to me," they said.

"I'm listening," she said. "It's different."` },

  { label: "Her & Them S02 — mixed they + she", pairing: "Her & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `She had been watching them work for an hour before they noticed.

"You've been here a while," they said.

"I find it meditative," she said.

"Watching someone install exhibition panels?" they said.

"Watching you specifically," she said.

"That's direct," they said.

"I find it saves time," she said.

"It does," they said. "What do you want to do with the time you've saved?"

She smiled. "I have some ideas," she said.` },

  { label: "Her & Them S03 — toggle 6 segs no they → multi via charSegs", pairing: "Her & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The workshop had overrun by an hour. She was still at her desk when they turned off most of the lights.

"Last one again," they said.

"It's a theme," she said.

"Good themes are worth repeating," they said.

"Is that a compliment," she said.

They smiled. The remaining light caught the angles of their face.

"Take it however you like," they said.` },

  { label: "Her & Them S04 — name attribution (River)", pairing: "Her & Them", voiceId: "tQ4MEZFJOzsahSEEZtHK",
    text: `She had been introduced to River three times at three different events. This was the fourth.

"We keep meeting," River said.

"I'm starting to think it's deliberate," she said.

"On my part," River said, "it is."

"River," she said.

"Yes," River said.

"Stop being charming and ask me to dinner," she said.

"Dinner," River said. "Tonight."

"Tonight," she said.` },

  { label: "Her & Them S05 — long they + she exchange", pairing: "Her & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `She had been trying not to look at them all evening. It wasn't working.

"You're trying very hard not to look at me," they said.

"That obvious?" she said.

"Only because I've been trying not to look at you," they said.

She turned to face them properly. "That's a lot of effort for a party."

"You're worth the effort," they said.

"You don't know me," she said.

"I'd like to," they said.

"Then stop trying not to look at me," she said.

"Deal," they said.` },

  { label: "Her & Them S06 — love interest dominant they said ×5", pairing: "Her & Them", voiceId: "tQ4MEZFJOzsahSEEZtHK",
    text: `She found them at the back of the train, in the unreserved section.

"No seat?" they said.

"Overbooked," she said.

"There's one here," they said, moving their bag.

"Thank you," she said.

"Three hours to the city," they said. "Good book?"

"Getting better," she said.

"I hope that's not entirely about the book," they said.

She looked up from the page. "No," she said. "It isn't."

"Good," they said.` },

  { label: "Her & Them S07 — you say + they said", pairing: "Her & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `You've been sitting across from them for twenty minutes and still haven't said what you came to say.

"You're thinking very loudly," they said.

"Sorry," you say.

"Don't be," they said. "I find it interesting."

"You'd find anything interesting," you say.

"Not anything," they said. "You, specifically."

"That's," you say, "a lot to process."

"Take your time," they said. "I'll wait."` },

  { label: "Her & Them S08 — short <4 segs no they → single-voice correct", pairing: "Her & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `She met them at the coat check.

"Same coat," they said.

"Different owner," she said.

They smiled. "Pity," they said.` },

  { label: "Her & Them S09 — both they and she explicitly", pairing: "Her & Them", voiceId: "tQ4MEZFJOzsahSEEZtHK",
    text: `She was the last person they expected to see at their own book launch.

"You came," they said.

"I did," she said.

"You said you wouldn't," they said.

"I changed my mind," she said.

"Why," they said.

"Because I read it," she said.

"And?" they said.

"You wrote about me," she said.

"Yes," they said.

"So I'm here," she said.

"Good," they said.` },

  { label: "Her & Them S10 — you say protagonist long exchange", pairing: "Her & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `You've known them for three years. Tonight something is different.

"You're quiet," they said.

"I'm thinking," you say.

"About," they said.

"Don't make me say it," you say.

"I won't make you do anything," they said. "But I'd like you to."

You look at them. "I think I've been in love with you since the residency," you say.

"The residency was three years ago," they said.

"I know," you say.

"I've been in love with you since the residency," they said.

"Then we've wasted three years," you say.

"No," they said. "We've been building something. This is just the next part."` },

  // ── Him & Them ────────────────────────────────────────────────────────────
  { label: "Him & Them S01 — they said CHAR_B + he said CHAR_A", pairing: "Him & Them", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `He found them in the archive, deep in a building no one visited.

"You're not supposed to be in here," they said.

"Neither are you," he said.

"I have access," they said.

"So do I," he said.

"Then we're both here legitimately," they said, "and for different reasons."

"What's yours," he said.

"Research," they said. "What's yours?"

"I followed the light under the door," he said.

"Honest," they said.

"Always," he said.` },

  { label: "Him & Them S02 — toggle 7 segs no they → multi via charSegs", pairing: "Him & Them", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `He had been walking past their desk three times a day for a week.

"You keep walking past," they said.

"Shortcut," he said.

"There's no shortcut that way," they said.

"There is now," he said.

They looked at him steadily. "What do you want to say?"

"Something I probably shouldn't," he said.

"Say it anyway," they said.` },

  { label: "Him & Them S03 — mixed they + he", pairing: "Him & Them", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `The night shift had two hours left. He had run out of things to pretend to read.

"You're not reading," they said.

"Caught," he said.

"You've been watching me work for forty minutes," they said.

"I find it interesting," he said.

"The work?" they said.

"Not exactly," he said.

"Then what," they said.

"The person doing it," he said.` },

  { label: "Him & Them S04 — name attribution (Ari)", pairing: "Him & Them", voiceId: "jfIS2w2yJi0grJZPyEsk",
    text: `He had been told to report to the creative director. The creative director was Ari.

"Sit," Ari said.

He sat. "Thank you for seeing me."

"You requested the meeting," Ari said.

"I did," he said.

"So," Ari said.

"I think I've been approaching this wrong," he said.

"The project?" Ari said.

"Among other things," he said.

Ari looked at him. "Define other things," Ari said.

"I'd rather show you," he said.` },

  { label: "Him & Them S05 — short <4 segs → single-voice correct", pairing: "Him & Them", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `He met them in the elevator.

"Twelve?" they said.

"Twelve," he said.

They rode in silence.

"Same floor," they said, when the doors opened.` },

  { label: "Him & Them S06 — love interest dominant they said ×5", pairing: "Him & Them", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `He was new to the building. They had been there three years.

"Lost?" they said.

"A little," he said.

"Conference room is left," they said.

"I know where the conference room is," he said.

"Then you're not lost," they said.

"Maybe I was looking for something else," he said.

"Like what," they said.

"Like a reason to come this way," he said.

"I'm this way every morning at nine," they said.

"Good to know," he said.` },

  { label: "Him & Them S07 — protagonist dominant he said ×4", pairing: "Him & Them", voiceId: "jfIS2w2yJi0grJZPyEsk",
    text: `He had asked for the introduction. He was regretting the reason he'd given.

"You said it was urgent," they said.

"I lied," he said.

"Why," they said.

"Because I wanted to meet you properly," he said.

"We've met before," they said.

"You don't remember," he said.

"I remember," they said.

"Then why—" he said.

"Because I wanted to see if you'd admit it," they said. "Now you have."` },

  { label: "Him & Them S08 — you say + they said", pairing: "Him & Them", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `They've been in three of your meetings this week. You're starting to think it isn't accidental.

"You keep showing up," you say.

"I was invited," they said.

"The first time," you say.

"The second time I invited myself," they said. "The third I was genuinely supposed to be there."

"And today?" you say.

"Today," they said, "I'm here for you specifically."` },

  { label: "Him & Them S09 — long exchange they + he", pairing: "Him & Them", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `He waited until the workshop had cleared before speaking.

"You disagreed with everything I said," he said.

"I disagreed with your conclusions," they said.

"That's most of what I said," he said.

"Your methodology was sound," they said.

"High praise," he said.

"It is," they said. "From me."

"Should I be flattered," he said.

"You should be curious," they said.

"I am," he said. "About the work."

"Just the work?" they said.

"Among other things," he said.

"Then we should have coffee," they said. "And argue properly."

"Tonight," he said.

"Tonight," they said.` },

  { label: "Him & Them S10 — named protagonist (Marcus) + they said", pairing: "Him & Them", voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `He introduced himself as Marcus. They already knew.

"Marcus," they said. "The one who turned down the residency."

"The same," he said.

"Why," they said.

"Wrong time," he said.

"Is the time better now?" they said.

"Considerably," he said.

"Good," they said. "We still have the room."

"You kept it," he said.

"We kept it," they said.` },

  // ── Them & Them ───────────────────────────────────────────────────────────
  { label: "Them & Them S01 — they said alternating ×6", pairing: "Them & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The library closes in twenty minutes. They have been sitting across from each other for an hour.

"You're still here," they said.

"So are you," they said.

"I was waiting to see how long you'd stay," they said.

"I was waiting for the same thing," they said.

A pause.

"Interesting," they said.

"Very," they said.` },

  { label: "Them & Them S02 — toggle 4 segs", pairing: "Them & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `They arrived at the residency on the same day, in the same car park, at the same moment.

"Same studio?" one of them said.

"Apparently," they said.

"We'll need to divide the space," they said.

"Or not divide it," they said.

They looked at each other.

"Let's see how it goes," they said.` },

  { label: "Them & Them S03 — toggle 12 segs long exchange", pairing: "Them & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `They met at the collective's open studio. Both had been told to come.

"You're the poet," they said.

"You're the painter," they said.

"This feels arranged," they said.

"It was," they said. "By Marisol. She's been trying for a year."

"A year," they said. "Why now?"

"She finally gave up waiting for us to meet accidentally," they said.

"And here we are," they said.

"Here we are," they said. "Which piece is yours?"

"All of them," they said.

"Oh," they said.

"Is that a problem," they said.

"It's the opposite of a problem," they said.` },

  { label: "Them & Them S04 — named character (Jordan)", pairing: "Them & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `They had been introduced to Jordan at a lecture, once, briefly.

"Jordan," they said.

"You remembered," Jordan said.

"Hard to forget," they said.

"I'll take that," Jordan said. "You're the architect."

"The one who never builds anything," they said.

"Yet," Jordan said.

"Yet," they said.

"Come to the site tomorrow," Jordan said. "I'll show you something real."

"I'll be there," they said.` },

  { label: "Them & Them S05 — both characters named (Sam and River)", pairing: "Them & Them", voiceId: "tQ4MEZFJOzsahSEEZtHK",
    text: `They arrived at the same residency: Sam and River, neither knowing the other.

"River," Sam said.

"Sam," River said.

"They gave us adjacent studios," Sam said.

"They always do this," River said.

"Do what," Sam said.

"Put us next to people they think we'd like," River said.

"And do you?" Sam said.

"Ask me at the end of the month," River said.

"I will," Sam said.` },

  { label: "Them & Them S06 — short <4 segs → single-voice correct", pairing: "Them & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `They passed each other at the exit.

"Good session," they said.

"Very," they said.

They parted without further comment. But both looked back.` },

  { label: "Them & Them S07 — toggle 12 segs doorway exchange", pairing: "Them & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The reading had run late. They ended up sheltering from the rain in the same doorway.

"Do you know each other?" someone asked before leaving.

"Not yet," they both said, at the same time.

A silence.

"Well," they said.

"Well," they said.

"I liked your piece," they said.

"I liked yours," they said.

"The second stanza," they said.

"The last image," they said.

"Yes," they said.

"Yes," they said.

"Coffee?" they said.

"Obviously," they said.` },

  { label: "Them & Them S08 — they say alternating present tense", pairing: "Them & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The late shift ends at two. They always meet at the same vending machine.

"Long night," they say, pressing the button for the wrong thing.

"As always," they say.

"You got the wrong drink again," they say.

"I know," they say. "Same as you."

They swap cups. This is a ritual that started three weeks ago.

"We should just admit we do this on purpose," they say.

"Probably," they say.

"Tomorrow night?" they say.

"Tonight's not over," they say.` },

  { label: "Them & Them S09 — two named characters (Quinn and Sasha)", pairing: "Them & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `Quinn and Sasha had been assigned to the same project.

"You want to lead," Quinn said.

"So do you," Sasha said.

"True," Quinn said.

"We could share it," Sasha said.

"That never works," Quinn said.

"It does," Sasha said, "if both people actually want it to."

Quinn looked at Sasha for a long moment.

"Is that what you want?" Quinn said.

"Yes," Sasha said. "Both things."

"Both," Quinn said.

"The project," Sasha said. "And whatever this is."

"Yes," Quinn said. "Both."` },

  { label: "Them & Them S10 — toggle only <4 segs → single-voice correct", pairing: "Them & Them", voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `Two people. One bench. A city at midnight.

"You come here often?"

"That's the worst line anyone has ever used on me."

"I know. But do you?"

A pause.

"Yes."` },
];

// ── DB fetch ───────────────────────────────────────────────────────────────
function fetchStories({ storyId = null, recentN = null, all = false } = {}) {
  let where, order, limit;

  if (storyId) {
    where = `WHERE id = '${storyId.replace(/'/g, "''")}'`;
    order = "";
    limit = "";
  } else if (recentN != null) {
    where = "";
    order = "ORDER BY created_at DESC";
    limit = `LIMIT ${recentN}`;
  } else if (all) {
    where = "";
    order = "ORDER BY casting_data->>'pairing' NULLS LAST, created_at DESC";
    limit = "";
  } else {
    // default: library stories only
    where = "WHERE is_library_story = true";
    order = "ORDER BY casting_data->>'pairing' NULLS LAST, id";
    limit = "";
  }

  const sql = `SELECT id, title, casting_data->>'pairing' as pairing, is_library_story FROM generated_stories ${where} ${order} ${limit};`;
  const out = execSync(`psql "$DATABASE_URL" -t -A -F'|' -c "${sql.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
    env: process.env,
    timeout: 10000,
  }).toString().trim();
  return out.split("\n").filter(Boolean).map(line => {
    const [id, title, pairing, isLib] = line.split("|");
    return { id: id?.trim(), title: title?.trim(), pairing: pairing?.trim() || null, isLibrary: isLib?.trim() === "t" };
  });
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`${C.bold}${C.cyan}Multi-Voice Attribution QA Harness${C.reset}`);
  console.log(`API: ${API_BASE}  |  verbose: ${VERBOSE}`);

  // Describe the story selection mode
  const modeLabel = STORY_ID   ? `single story: ${STORY_ID}`
    : RECENT_N != null         ? `${RECENT_N} most recent stories (all users)`
    : ALL_STORIES              ? `all stories (library + user-created)`
    :                            `library stories only`;
  console.log(`Mode: ${modeLabel}`);
  if (PAIRING_FILTER) console.log(`Filter: pairing = "${PAIRING_FILTER}"`);
  console.log();

  // 1. Fetch stories according to the active mode
  let stories;
  try {
    stories = fetchStories({ storyId: STORY_ID, recentN: RECENT_N, all: ALL_STORIES });
  } catch (err) {
    console.error("DB fetch failed:", err.message);
    process.exit(1);
  }

  if (PAIRING_FILTER) {
    stories = stories.filter(s => (s.pairing ?? "") === PAIRING_FILTER);
  }

  const modeDesc = STORY_ID ? "story" : RECENT_N != null ? "recent stories" : ALL_STORIES ? "stories" : "library stories";
  console.log(`Found ${stories.length} ${modeDesc}.\n`);

  // 2. Run tests
  const results = { byPairing: {} };
  let totalPass = 0, totalFail = 0;

  const runStory = async (storyId, label, pairing, inputBody) => {
    const norm = (pairing ?? "").trim() || "Her & Him (default)";
    if (!results.byPairing[norm]) results.byPairing[norm] = { pass: 0, fail: 0, stories: [] };

    let r;
    try {
      r = await debugTags(inputBody);
    } catch (err) {
      const entry = { id: storyId, label, issues: [`API error: ${err.message}`], pass: false, summary: null };
      results.byPairing[norm].fail++;
      results.byPairing[norm].stories.push(entry);
      totalFail++;
      return entry;
    }

    const { pass: ok, issues } = assess(r);
    const entry = { id: storyId, label, issues, pass: ok, summary: r.summary, pairing: r.pairing, voices: r.voices };
    results.byPairing[norm].stories.push(entry);
    if (ok) { results.byPairing[norm].pass++; totalPass++; }
    else     { results.byPairing[norm].fail++; totalFail++; }
    return entry;
  };

  // DB stories
  for (const story of stories) {
    const tag = story.isLibrary ? `${C.gray}lib${C.reset}` : `${C.cyan}usr${C.reset}`;
    process.stdout.write(`  [${tag}] ${story.id.slice(-12)}  ${(story.title ?? "").padEnd(35)}  [${(story.pairing ?? "no pairing").padEnd(12)}] … `);
    const entry = await runStory(story.id, story.title, story.pairing, { storyId: story.id });
    if (entry.pass) {
      process.stdout.write(pass("PASS") + "\n");
    } else {
      process.stdout.write(fail("FAIL") + "\n");
      for (const issue of entry.issues) {
        console.log(`      ${C.red}↳${C.reset} ${issue}`);
      }
    }
    if (VERBOSE && entry.summary) {
      const s = entry.summary;
      console.log(`      ${C.gray}total=${s.totalSegments} narr=${s.narratorSegments} A=${s.charASegments} B=${s.charBSegments} explicit=${s.explicitAttributions} mv=${s.wouldUseMultiVoice}${C.reset}`);
    }
    await sleep(250);
  }

  // Synthetic stress-test samples — skipped in --story mode (testing one specific story)
  const runSynthetics = !STORY_ID;
  const synthFilter = !runSynthetics ? [] : PAIRING_FILTER
    ? SYNTHETIC_SAMPLES.filter(s => s.pairing === PAIRING_FILTER)
    : SYNTHETIC_SAMPLES;

  if (synthFilter.length > 0) {
    console.log(`\n${C.bold}Synthetic stress-test samples (10 per pairing)${C.reset}`);
    for (const sample of synthFilter) {
      process.stdout.write(`  ${sample.label.padEnd(55)} … `);
      const entry = await runStory(
        `synthetic:${sample.pairing}`, sample.label, sample.pairing,
        { text: sample.text, pairing: sample.pairing, voiceId: sample.voiceId },
      );
      if (entry.pass) {
        process.stdout.write(pass("PASS") + "\n");
      } else {
        process.stdout.write(fail("FAIL") + "\n");
        for (const issue of entry.issues) {
          console.log(`      ${C.red}↳${C.reset} ${issue}`);
        }
      }
      if (VERBOSE && entry.summary) {
        const s = entry.summary;
        console.log(`      ${C.gray}total=${s.totalSegments} narr=${s.narratorSegments} A=${s.charASegments} B=${s.charBSegments} explicit=${s.explicitAttributions} mv=${s.wouldUseMultiVoice}${C.reset}`);
      }
      await sleep(250);
    }
  }

  // 3. Summary table
  console.log(`\n${"─".repeat(80)}`);
  console.log(`${C.bold}SUMMARY BY PAIRING${C.reset}\n`);
  const pWidth = 30, numW = 7;
  console.log(`${"Pairing".padEnd(pWidth)} ${"Pass".padStart(numW)} ${"Fail".padStart(numW)} ${"Total".padStart(numW)}  Status`);
  console.log(`${"─".repeat(pWidth)} ${"─".repeat(numW)} ${"─".repeat(numW)} ${"─".repeat(numW)}  ──────`);
  for (const [pName, data] of Object.entries(results.byPairing)) {
    const total = data.pass + data.fail;
    const status = data.fail === 0 ? `${C.green}ALL PASS${C.reset}` : `${C.red}${data.fail} FAILING${C.reset}`;
    console.log(`${pName.padEnd(pWidth)} ${String(data.pass).padStart(numW)} ${String(data.fail).padStart(numW)} ${String(total).padStart(numW)}  ${status}`);
  }
  console.log(`${"─".repeat(pWidth)} ${"─".repeat(numW)} ${"─".repeat(numW)} ${"─".repeat(numW)}`);
  console.log(`${"TOTAL".padEnd(pWidth)} ${String(totalPass).padStart(numW)} ${String(totalFail).padStart(numW)} ${String(totalPass + totalFail).padStart(numW)}  ${
    totalFail === 0 ? `${C.bold}${C.green}100% PASS${C.reset}` : `${C.bold}${C.red}${totalFail} FAILING${C.reset}`
  }`);

  // 4. Failure detail (always shown even without --verbose)
  const allFailing = Object.values(results.byPairing).flatMap(d => d.stories).filter(s => !s.pass);
  if (allFailing.length > 0) {
    console.log(`\n${C.bold}${C.red}FAILING STORIES — DETAILED ISSUES${C.reset}\n`);
    for (const s of allFailing) {
      console.log(`  ${C.bold}${s.label ?? s.id}${C.reset}  [${s.pairing ?? "no pairing"}]`);
      for (const issue of s.issues) {
        console.log(`    • ${issue}`);
      }
      console.log();
    }
  }

  process.exit(totalFail > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(2); });

/*
 * ── Accuracy log ──────────────────────────────────────────────────────────
 * Run 1 (2026-06-01): 28/42 pass (66.7%)
 *   Root causes identified: (A) distinctCharRoles=1 in regex tagger for
 *   mixed-gender stories where only love-interest dialogue appears (narrator
 *   not counted as +1); (B) 5 no-dialogue Her & Him stories (pure prose, no
 *   quoted text — single-voice is correct); (C) Them & Them gate used
 *   explicitAttr >= 1 instead of charSegs >= 4.
 *
 * Run 2 (2026-06-01): 42/42 pass (100%) ← ALL PASS
 *   Her & Her:            5/5  — ALL PASS
 *   Her & Him:           26/26 — ALL PASS
 *   Him & Him:            1/1  — ALL PASS
 *   Her & Him (default):  7/7  — ALL PASS
 *   Her & Them:           1/1  — ALL PASS (synthetic)
 *   Him & Them:           1/1  — ALL PASS (synthetic)
 *   Them & Them:          1/1  — ALL PASS (synthetic)
 *
 * Fixes applied between Run 1 and Run 2:
 *   Server (generate.ts regex tagger):
 *     • distinctCharRoles: +1 for narrator in mixed-gender pairings (same fix
 *       that parseTaggedScript path already had). Same-gender pairings (genders
 *       === null) keep old formula — adding +1 when only one role exists would
 *       fire multi-voice with a permanently-silent CHAR_B.
 *     • nullGenderPairing: Them & Them now uses charSegs >= 4 gate (same as
 *       Her & Her / Him & Him) — gender pronouns can't distinguish speakers
 *       when both characters use "they".
 *   Harness (qa-voice-attribution.mjs assess()):
 *     • Removed blanket !wouldUseMultiVoice failure. Each pairing branch now
 *       independently decides whether multi-voice was expected:
 *       - Her & Him: expect multi-voice only when explicitAttr >= 1 (stories
 *         with no gender cues correctly stay single-voice)
 *       - Her & Her / Him & Him: expect multi-voice only when distinctCharRoles
 *         >= 2 AND charSegs >= 4 (one-sided monologue stories pass as single-voice)
 *       - Them & Them: expect multi-voice when charSegs >= 4
 */
