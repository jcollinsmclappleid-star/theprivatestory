#!/usr/bin/env node
/**
 * qa-llm-tag-compliance.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Tests two things end-to-end with real LLM calls (no mocking):
 *
 *  1. TAG COMPLIANCE — Does Mistral Large correctly wrap dialogue in [A]/[B]
 *     tags when instructed to? Checks presence, balance, and no untagged text.
 *
 *  2. FALLBACK ATTRIBUTION — After stripping the LLM tags (as the server does
 *     before storing), does the regex tagger (debug-tags) still correctly
 *     attribute the dialogue? Tests the fallback path used when a story was
 *     written without tags or tags were stripped.
 *
 * Runs 10 test cases across all six pairings. Makes real OpenRouter API calls
 * (~$0.05–0.10 total at Mistral Large pricing).
 *
 * Usage:
 *   node scripts/qa-llm-tag-compliance.mjs
 *   node scripts/qa-llm-tag-compliance.mjs --verbose
 */

import OpenAI from "openai";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
const ADMIN_TOKEN        = process.env.ADMIN_SCRIPT_KEY ?? "";
const API_BASE           = process.env.API_BASE ?? "http://localhost:8080";
const MISTRAL_MODEL      = "mistralai/mistral-large-2512";
const VERBOSE            = process.argv.includes("--verbose");

if (!OPENROUTER_API_KEY) { console.error("ERROR: OPENROUTER_API_KEY is required."); process.exit(1); }
if (!ADMIN_TOKEN)        { console.error("ERROR: ADMIN_SCRIPT_KEY is required.");   process.exit(1); }

const openrouter = new OpenAI({ baseURL: "https://openrouter.ai/api/v1", apiKey: OPENROUTER_API_KEY });

// ── Colours ──────────────────────────────────────────────────────────────────
const C = { reset:"\x1b[0m", bold:"\x1b[1m", red:"\x1b[31m", green:"\x1b[32m",
            yellow:"\x1b[33m", cyan:"\x1b[36m", gray:"\x1b[90m" };
const ok   = s => `${C.green}✓ ${s}${C.reset}`;
const fail = s => `${C.red}✗ ${s}${C.reset}`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Pairing config ────────────────────────────────────────────────────────────
const PAIRINGS = {
  "Her & Him":   { protSubLc:"she", partnSub:"he",   protNoun:"her",  partnNoun:"him",   voiceId:"FA6HhUjVbervLw2rNl8M" },
  "Her & Her":   { protSubLc:"she", partnSub:"she",  protNoun:"her",  partnNoun:"her",   voiceId:"FA6HhUjVbervLw2rNl8M" },
  "Him & Him":   { protSubLc:"he",  partnSub:"he",   protNoun:"him",  partnNoun:"him",   voiceId:"AeRdCCKzvd23BpJoofzx" },
  "Her & Them":  { protSubLc:"she", partnSub:"they", protNoun:"her",  partnNoun:"them",  voiceId:"tQ4MEZFJOzsahSEEZtHK" },
  "Him & Them":  { protSubLc:"he",  partnSub:"they", protNoun:"him",  partnNoun:"them",  voiceId:"AeRdCCKzvd23BpJoofzx" },
  "Them & Them": { protSubLc:"they",partnSub:"they", protNoun:"them", partnNoun:"them",  voiceId:"FA6HhUjVbervLw2rNl8M" },
};

// ── Tag instruction block (mirrors masterEroticLayer.ts lines 437-477) ────────
function buildTagInstruction(pairing) {
  const p = PAIRINGS[pairing];
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDIO SPEAKER TAGGING — MANDATORY — APPLIES TO STORY PROSE ONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This story is rendered by three distinct audio voices. You MUST wrap every word of the story prose in one of these three speaker tags:

[N]...[/N]  →  Narrator voice — ALL prose: descriptions, atmosphere, setting, internal monologue, and attribution phrases ("he says", "she whispers", "he commands", "you say")
[A]...[/A]  →  Protagonist voice (${p.protNoun}) — ONLY ${p.protSubLc}'s spoken dialogue: the exact words ${p.protSubLc} says aloud
[B]...[/B]  →  Love interest voice (${p.partnNoun}) — ONLY ${p.partnSub}'s spoken dialogue: the exact words ${p.partnSub} says aloud

RULES — NON-NEGOTIABLE:
1. Every word of story prose must sit inside exactly one tag — no untagged text anywhere
2. Tags never nest inside each other
3. Internal monologue (thoughts not spoken aloud) always goes in [N]
4. Attribution phrases ("he groans", "you say", "she breathes") always go in [N]
5. Keep quote marks inside the character tag: [A]"dialogue here"[/A]

CORRECT EXAMPLE:
[N]The kitchen is empty except for the two of you.[/N]
[B]"You're still here,"[/B][N] he says. His voice is low.[/N]
[A]"So are you."[/A]
[N]A smile tugs at the corner of his mouth.[/N]

MISTAKE 1 — Untagged text (every word must be in exactly one tag):
The kitchen is empty.   ← WRONG

MISTAKE 2 — Attribution inside the character tag:
[B]"You're still here," he says.[/B]   ← WRONG ("he says" must be in [N])

REMEMBER: Attribution prose ("he says", "she breathes") is ALWAYS in [N], never inside [A] or [B].
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// ── Test cases (10, spanning all 6 pairings) ─────────────────────────────────
const TEST_CASES = [
  { id:1,  pairing:"Her & Him",   setting:"a luxury hotel bar after a conference",          partnerName:"Marcus" },
  { id:2,  pairing:"Her & Her",   setting:"a late-night art gallery opening",               partnerName:"Elena"  },
  { id:3,  pairing:"Him & Him",   setting:"an empty office building after everyone leaves", partnerName:"Rafe"   },
  { id:4,  pairing:"Her & Them",  setting:"a rooftop bar at dusk",                          partnerName:"Sasha"  },
  { id:5,  pairing:"Him & Them",  setting:"a train compartment between cities",             partnerName:"Ari"    },
  { id:6,  pairing:"Them & Them", setting:"a shared artist residency studio",               partnerName:"River"  },
  { id:7,  pairing:"Her & Him",   setting:"an after-hours restaurant kitchen",              partnerName:"James"  },
  { id:8,  pairing:"Her & Her",   setting:"a hotel swimming pool at midnight",              partnerName:"Clara"  },
  { id:9,  pairing:"Him & Him",   setting:"a mountain refuge during a storm",               partnerName:"Daniel" },
  { id:10, pairing:"Her & Them",  setting:"a bookshop at closing time",                     partnerName:"Quinn"  },
];

// ── LLM call ─────────────────────────────────────────────────────────────────
async function writeMiniStory(tc) {
  const p = PAIRINGS[tc.pairing];

  const systemPrompt = `You are writing a short premium adult audio story for a specific listener.
All characters are adults aged 25 or older.
${buildTagInstruction(tc.pairing)}

PAIRING: "${tc.pairing}" — use ${p.protSubLc}/${p.protNoun} for the protagonist, ${p.partnSub}/${p.partnNoun} for the love interest.
PARTNER NAME: The love interest is named ${tc.partnerName}. Use this name in narration and dialogue.`;

  const userPrompt = `Write a 2-scene story (~120 words per scene, 240 words total) set in: ${tc.setting}.

The protagonist and ${tc.partnerName} meet for the first time. There must be clear spoken dialogue — at least 3 lines each from the protagonist [A] and ${tc.partnerName} [B] — with atmospheric narration [N] between each line.

Return ONLY valid JSON (no markdown fences) in this exact format:
{
  "title": "short evocative title",
  "scenes": [
    { "id": 1, "heading": "scene 1 title", "text": "full tagged scene prose here" },
    { "id": 2, "heading": "scene 2 title", "text": "full tagged scene prose here" }
  ]
}

Every word of story prose in "text" must be wrapped in [N], [A], or [B] tags. No untagged words.`;

  const res = await openrouter.chat.completions.create({
    model: MISTRAL_MODEL,
    max_tokens: 2000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
  });

  const raw = res.choices[0]?.message?.content ?? "";
  let parsed;
  try { parsed = JSON.parse(raw); } catch { parsed = null; }
  return { raw, parsed };
}

// ── Tag compliance checker ───────────────────────────────────────────────────
function checkTagCompliance(text) {
  const hasA = /\[A\]/.test(text);
  const hasB = /\[B\]/.test(text);
  const hasN = /\[N\]/.test(text);

  const aOpen  = (text.match(/\[A\]/g)   ?? []).length;
  const aClose = (text.match(/\[\/A\]/g) ?? []).length;
  const bOpen  = (text.match(/\[B\]/g)   ?? []).length;
  const bClose = (text.match(/\[\/B\]/g) ?? []).length;
  const nOpen  = (text.match(/\[N\]/g)   ?? []).length;
  const nClose = (text.match(/\[\/N\]/g) ?? []).length;

  const balanced = aOpen === aClose && bOpen === bClose && nOpen === nClose;

  // Untagged text = anything left after stripping all properly closed tag content
  const stripped = text
    .replace(/\[N\][\s\S]*?\[\/N\]/g, "")
    .replace(/\[A\][\s\S]*?\[\/A\]/g, "")
    .replace(/\[B\][\s\S]*?\[\/B\]/g, "")
    .replace(/\[\/?(N|A|B)\]/g, "")
    .trim();
  const untaggedLen = stripped.replace(/\s+/g, " ").length;
  const hasUntagged = untaggedLen > 15;

  return {
    hasA, hasB, hasN,
    aCount: aOpen, bCount: bOpen, nCount: nOpen,
    balanced, hasUntagged, untaggedLen,
    pass: hasA && hasB && hasN && balanced && !hasUntagged,
  };
}

// ── Strip tags → plain prose (what the server stores in DB) ──────────────────
function stripTags(text) {
  return text
    .replace(/\[N\]([\s\S]*?)\[\/N\]/g, "$1")
    .replace(/\[A\]([\s\S]*?)\[\/A\]/g, "$1")
    .replace(/\[B\]([\s\S]*?)\[\/B\]/g, "$1")
    .replace(/\[\/?(N|A|B)\]/g, "")
    .trim();
}

// ── debug-tags call (same as qa-voice-attribution.mjs) ───────────────────────
async function debugTags(body) {
  const res = await fetch(`${API_BASE}/api/debug-tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Simple attribution pass check ────────────────────────────────────────────
function attributionPass(r, pairing) {
  const mv = r.summary?.wouldUseMultiVoice ?? false;
  const explicit = r.summary?.explicitAttributions ?? 0;
  const p = pairing.toLowerCase();
  // For mixed-gender pairings: expect multi-voice when explicit cues exist
  if (p === "her & him" || p === "her & them" || p === "him & them") {
    if (explicit >= 1 && !mv) return { pass: false, note: `explicit=${explicit} but mv=false` };
  }
  // For same-gender: expect multi-voice when enough char segs
  const charSegs = (r.summary?.charASegments ?? 0) + (r.summary?.charBSegments ?? 0);
  if (charSegs >= 4 && !mv) return { pass: false, note: `charSegs=${charSegs} but mv=false` };
  return { pass: true, note: mv ? "multi-voice" : "single-voice (no clear cues)" };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`${C.bold}${C.cyan}LLM Tag Compliance QA${C.reset}`);
  console.log(`Model: ${MISTRAL_MODEL}  |  Tests: ${TEST_CASES.length}  |  API: ${API_BASE}`);
  console.log(`Checking: [A]/[B] tag injection (primary path) + regex fallback (stripped text)\n`);

  let tagPass = 0, tagFail = 0, attrPass = 0, attrFail = 0;
  const failures = [];

  for (const tc of TEST_CASES) {
    const label = `T${String(tc.id).padStart(2,"0")} [${tc.pairing.padEnd(10)}]  ${tc.setting.padEnd(42)}`;
    process.stdout.write(`  ${label} …\n`);

    // 1. LLM call
    let raw, parsed;
    try {
      ({ raw, parsed } = await writeMiniStory(tc));
    } catch (err) {
      console.log(`      ${C.red}LLM ERROR: ${err.message}${C.reset}`);
      tagFail++; attrFail++;
      failures.push({ tc, stage: "llm", err: err.message });
      await sleep(2000);
      continue;
    }

    if (!parsed || !Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
      console.log(`      ${fail("TAG")}  JSON parse failed or no scenes`);
      if (VERBOSE) console.log(`      ${C.gray}raw: ${raw.slice(0,200)}${C.reset}`);
      tagFail++; attrFail++;
      failures.push({ tc, stage: "parse", raw: raw.slice(0,300) });
      await sleep(1500);
      continue;
    }

    const title = parsed.title ?? "(untitled)";
    const fullText = parsed.scenes.map(s => s.text ?? "").join("\n\n");

    // 2. Tag compliance
    const tc2 = checkTagCompliance(fullText);
    const tagLabel = tc2.pass ? ok("TAG ") : fail("TAG ");
    const tagDetail = `[A]×${tc2.aCount} [B]×${tc2.bCount} [N]×${tc2.nCount}  balanced=${tc2.balanced}  untagged=${tc2.hasUntagged ? tc2.untaggedLen+"ch" : "none"}`;

    process.stdout.write(`      ${tagLabel}  ${tagDetail}\n`);
    if (VERBOSE) console.log(`      ${C.gray}title: "${title}"${C.reset}`);

    if (tc2.pass) tagPass++; else {
      tagFail++;
      failures.push({ tc, stage: "tags", detail: tagDetail, raw: fullText.slice(0,400) });
    }

    // 3. Strip tags → run debug-tags (fallback path)
    const stripped = stripTags(fullText);
    let attrResult, attrCheck;
    try {
      attrResult = await debugTags({
        text: stripped,
        pairing: tc.pairing,
        voiceId: PAIRINGS[tc.pairing].voiceId,
        partnerName: tc.partnerName,
      });
      attrCheck = attributionPass(attrResult, tc.pairing);
    } catch (err) {
      process.stdout.write(`      ${fail("ATTR")}  debug-tags error: ${err.message}\n`);
      attrFail++;
      failures.push({ tc, stage: "debug-tags", err: err.message });
      await sleep(1500);
      continue;
    }

    const s = attrResult.summary ?? {};
    const attrLabel  = attrCheck.pass ? ok("ATTR") : fail("ATTR");
    const attrDetail = `total=${s.totalSegments} A=${s.charASegments} B=${s.charBSegments} explicit=${s.explicitAttributions} mv=${s.wouldUseMultiVoice}  → ${attrCheck.note}`;
    process.stdout.write(`      ${attrLabel}  ${attrDetail}\n`);

    if (attrCheck.pass) attrPass++; else {
      attrFail++;
      failures.push({ tc, stage: "attribution", detail: attrDetail });
    }

    if (VERBOSE) {
      const preview = stripped.slice(0, 200).replace(/\n/g, " ");
      console.log(`      ${C.gray}stripped: "${preview}…"${C.reset}`);
    }

    await sleep(1500);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const total = TEST_CASES.length;
  console.log(`\n${"─".repeat(80)}`);
  console.log(`${C.bold}RESULTS${C.reset}\n`);
  console.log(`  Tag compliance  (LLM path)  : ${tagPass}/${total}  ${tagPass === total ? ok("100%") : fail(`${tagFail} failing`)}`);
  console.log(`  Attribution     (regex path) : ${attrPass}/${total}  ${attrPass === total ? ok("100%") : fail(`${attrFail} failing`)}`);

  if (failures.length > 0) {
    console.log(`\n${C.bold}${C.red}FAILURES${C.reset}\n`);
    for (const f of failures) {
      console.log(`  T${f.tc.id} ${f.tc.pairing} — ${f.tc.setting}`);
      console.log(`    Stage: ${f.stage}  ${f.detail ?? f.err ?? ""}`);
      if (VERBOSE && f.raw) console.log(`    ${C.gray}${f.raw.slice(0,300)}${C.reset}`);
    }
  }

  process.exit(tagFail + attrFail > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
