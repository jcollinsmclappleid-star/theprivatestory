#!/usr/bin/env npx tsx
/**
 * Verify live attribution QA audio via Whisper STT.
 *
 * Scans generated snippet MP3s for forbidden attribution phrases that must
 * be muted by the engine (he said, she said, her supervisor said, etc.).
 *
 * Usage (from artifacts/api-server):
 *   OPENAI_API_KEY=… npx tsx scripts/verify-attribution-audio.mts --all
 *   npx tsx scripts/verify-attribution-audio.mts ignite-her-him-explicit
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/test-stories");
const AUDIO_DIR = path.resolve(__dirname, "../public/audio");

interface Manifest {
  fixture: string;
  audioFilename: string;
  forbiddenInAudio: string[];
  gate?: "strict" | "regression";
  durationSeconds: number;
  qa?: {
    useMultiVoice: boolean;
    segments: Array<{ muted: boolean; rawText: string; spokenText: string | null }>;
  };
}

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9'\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findForbidden(transcript: string, forbidden: string[]): string[] {
  const norm = normalise(transcript);
  const hits: string[] = [];
  for (const phrase of forbidden) {
    const p = normalise(phrase);
    if (!p) continue;
    // Word-boundary style match on normalised text
    const re = new RegExp(`(?:^|\\s)${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`, "i");
    if (re.test(norm)) hits.push(phrase);
  }
  return hits;
}

async function transcribe(client: OpenAI, audioPath: string): Promise<string> {
  const file = fs.createReadStream(audioPath);
  const result = await client.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "en",
    response_format: "text",
  });
  return typeof result === "string" ? result : String(result);
}

async function verifyOne(client: OpenAI, slug: string) {
  const cacheKey = `attr-${slug}`;
  const manifestPath = path.join(OUT_DIR, `${cacheKey}.manifest.json`);
  const audioPath = path.join(AUDIO_DIR, `audio-${cacheKey}.mp3`);

  if (!fs.existsSync(manifestPath)) {
    return { slug, pass: false, error: `manifest missing — run generate-attribution-snippet-audio.mts ${slug} first` };
  }
  if (!fs.existsSync(audioPath)) {
    return { slug, pass: false, error: `audio missing at ${audioPath}` };
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;
  console.log(`\n▶  ${slug}`);
  console.log(`   transcribing ${path.basename(audioPath)}…`);

  const transcript = await transcribe(client, audioPath);
  const hits = findForbidden(transcript, manifest.forbiddenInAudio);
  const isStrict = (manifest.gate ?? "strict") === "strict";
  const pass = hits.length === 0;

  const textLayerMuted = manifest.qa?.segments.filter((s) => s.muted).length ?? 0;
  const sttPath = path.join(OUT_DIR, `${cacheKey}.stt.json`);
  const sttReport = {
    verifiedAt: new Date().toISOString(),
    fixture: slug,
    gate: manifest.gate ?? "strict",
    transcript,
    forbiddenInAudio: manifest.forbiddenInAudio,
    forbiddenHits: hits,
    pass,
    strictPass: isStrict ? pass : null,
    textLayer: {
      useMultiVoice: manifest.qa?.useMultiVoice ?? null,
      mutedSegments: textLayerMuted,
      totalSegments: manifest.qa?.segments.length ?? 0,
    },
  };
  fs.writeFileSync(sttPath, JSON.stringify(sttReport, null, 2));

  if (pass) {
    console.log(`   ${"\x1b[32m"}✓ PASS${"\x1b[0m"}  no forbidden phrases in audio`);
  } else if (!isStrict) {
    console.log(`   ${"\x1b[33m"}⚠ REGRESSION${"\x1b[0m"}  hits (expected until engine catches up): ${hits.join(", ")}`);
  } else {
    console.log(`   ${"\x1b[31m"}✗ FAIL${"\x1b[0m"}  forbidden in audio: ${hits.join(", ")}`);
    console.log(`   transcript preview: ${transcript.slice(0, 160).replace(/\n/g, " ")}…`);
  }
  console.log(`   stt report: public/test-stories/${cacheKey}.stt.json`);

  return { slug, pass, strict: isStrict, hits, transcript };
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) {
    console.error("ERROR: OPENAI_API_KEY (or AI_INTEGRATIONS_OPENAI_API_KEY) required for Whisper STT.");
    process.exit(1);
  }

  const client = new OpenAI({ apiKey });
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const all = process.argv.includes("--all");

  let slugs: string[];
  if (all) {
    const summaryPath = path.join(OUT_DIR, "attribution-qa-latest.json");
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8")) as { fixtures: Array<{ fixture: string }> };
      slugs = summary.fixtures.map((f) => f.fixture);
    } else {
      slugs = fs
        .readdirSync(OUT_DIR)
        .filter((f) => f.startsWith("attr-") && f.endsWith(".manifest.json"))
        .map((f) => f.replace(/^attr-/, "").replace(/\.manifest\.json$/, ""));
    }
  } else {
    slugs = args;
  }

  if (slugs.length === 0) {
    console.log(`Usage:
  npx tsx scripts/verify-attribution-audio.mts --all
  npx tsx scripts/verify-attribution-audio.mts ignite-her-him-explicit`);
    process.exit(0);
  }

  console.log("=".repeat(72));
  console.log("ATTRIBUTION AUDIO VERIFY — Whisper STT");
  console.log(`Fixtures: ${slugs.length}`);
  console.log("=".repeat(72));

  const results = [];
  for (const slug of slugs) {
    results.push(await verifyOne(client, slug));
  }

  const passed = results.filter((r) => r.pass).length;
  const strictFailed = results.filter((r) => r.strict && !r.pass);
  const regressionWarn = results.filter((r) => !r.strict && !r.pass);

  console.log(`\n${"─".repeat(72)}`);
  console.log(`RESULT: ${passed}/${results.length} clean transcripts`);
  if (regressionWarn.length > 0) {
    for (const f of regressionWarn) {
      console.log(`  ⚠ ${f.slug} (regression): ${f.hits?.join(", ")}`);
    }
  }
  if (strictFailed.length > 0) {
    for (const f of strictFailed) {
      console.log(`  ✗ ${f.slug}: ${f.hits?.join(", ")}`);
    }
    process.exit(1);
  }
  console.log(`${"\x1b[32m"}STRICT GATE: 100% PASS${"\x1b[0m"}${regressionWarn.length ? ` (${regressionWarn.length} regression fixture(s) with known hits)` : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
