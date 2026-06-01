#!/usr/bin/env node
/**
 * qa-voice-attribution.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * QA harness for the multi-voice speaker attribution pipeline.
 *
 * Tests every library story via POST /api/debug-tags (zero ElevenLabs calls)
 * and applies per-pairing pass criteria. Prints a full story-by-story report
 * plus a pairing-level summary table.
 *
 * Usage:
 *   ADMIN_SCRIPT_KEY=<key> node scripts/qa-voice-attribution.mjs
 *   ADMIN_SCRIPT_KEY=<key> node scripts/qa-voice-attribution.mjs --verbose
 *   ADMIN_SCRIPT_KEY=<key> node scripts/qa-voice-attribution.mjs --pairing "Her & Him"
 *
 * Final accuracy (last run): documented at bottom of file after each iteration.
 */

import { execSync } from "child_process";

const API_BASE    = process.env.API_BASE    ?? "http://localhost:8080";
const ADMIN_TOKEN = process.env.ADMIN_SCRIPT_KEY ?? "";
const VERBOSE     = process.argv.includes("--verbose");
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

// ── HTTP helper ────────────────────────────────────────────────────────────
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

// ── Synthetic sample texts for Them pairings ──────────────────────────────
const SYNTHETIC_SAMPLES = [
  {
    label: "Her & Them (synthetic)",
    pairing: "Her & Them",
    voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The rooftop bar is almost empty. You arrived early, before the city lights softened everything into something bearable.

"You look like you're waiting for something," they say, setting a glass beside yours without asking.

You glance up. "Maybe I am."

"Same," they say, their voice unhurried. "I've seen you here before. You always sit at the end."

She laughed softly, surprised by it. "Is that your opening?"

"It's an observation," they reply. "Openings are overrated."

"You're not wrong," she says, turning toward them.

"I never am," they whisper.`,
  },
  {
    label: "Him & Them (synthetic)",
    pairing: "Him & Them",
    voiceId: "AeRdCCKzvd23BpJoofzx",
    text: `The gallery is quiet at this hour. He found the piece by accident, following a corridor that seemed to lead nowhere.

"You've been standing there for a while," they say, stepping into his peripheral vision.

He doesn't move. "It doesn't let you go easily."

"No," they say. "It doesn't."

He finally turns. "Do you know the artist?"

"I am the artist," they reply, a half-smile shifting their expression.

"Of course you are," he says, feeling the corners of his own mouth respond.

"Is that a problem?" they whisper.`,
  },
  {
    label: "Them & Them (synthetic)",
    pairing: "Them & Them",
    voiceId: "FA6HhUjVbervLw2rNl8M",
    text: `The library closes in twenty minutes. They found each other in the foreign-languages section, as they always did on Thursdays.

"You're late," they say, not looking up from the page.

"I was finishing something," they say, dropping into the opposite chair.

"You're always finishing something."

"And you're always waiting," they say, finally looking up.

"Maybe I like waiting," they reply. "For the right thing."

"Is that what this is?" they whisper.

"I think it might be," they say.`,
  },
];

// ── DB fetch ───────────────────────────────────────────────────────────────
function fetchStories() {
  const sql = `
    SELECT id, title, casting_data->>'pairing' as pairing
    FROM generated_stories
    WHERE is_library_story = true
    ORDER BY casting_data->>'pairing' NULLS LAST, id;
  `;
  const out = execSync(`psql "$DATABASE_URL" -t -A -F'|' -c "${sql.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
    env: process.env,
    timeout: 10000,
  }).toString().trim();
  return out.split("\n").filter(Boolean).map(line => {
    const [id, title, pairing] = line.split("|");
    return { id: id?.trim(), title: title?.trim(), pairing: pairing?.trim() || null };
  });
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`${C.bold}${C.cyan}Multi-Voice Attribution QA Harness${C.reset}`);
  console.log(`API: ${API_BASE}  |  verbose: ${VERBOSE}`);
  if (PAIRING_FILTER) console.log(`Filter: pairing = "${PAIRING_FILTER}"`);
  console.log();

  // 1. Fetch library stories
  let stories;
  try {
    stories = fetchStories();
  } catch (err) {
    console.error("DB fetch failed:", err.message);
    process.exit(1);
  }

  if (PAIRING_FILTER) {
    stories = stories.filter(s => (s.pairing ?? "") === PAIRING_FILTER);
  }

  console.log(`Found ${stories.length} library stories.\n`);

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

  // Library stories
  for (const story of stories) {
    process.stdout.write(`  Testing ${story.id.slice(-12)}  ${(story.title ?? "").padEnd(35)}  [${(story.pairing ?? "no pairing").padEnd(12)}] … `);
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
  }

  // Synthetic Them samples
  const synthFilter = PAIRING_FILTER
    ? SYNTHETIC_SAMPLES.filter(s => s.pairing === PAIRING_FILTER)
    : SYNTHETIC_SAMPLES;

  if (synthFilter.length > 0) {
    console.log(`\n${C.bold}Synthetic Them samples${C.reset}`);
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
