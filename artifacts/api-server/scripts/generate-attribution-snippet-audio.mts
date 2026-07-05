#!/usr/bin/env npx tsx
/**
 * Live attribution QA — real production engine + ElevenLabs.
 *
 * Runs generateAudioFile() on fixed IGNITE-phase fixtures (~2 min each) with
 * heavy multi-character dialogue and he said / she said tags.
 *
 * Usage (from artifacts/api-server):
 *   LOCAL_AUDIO_MIRROR=1 SKIP_GCS_UPLOAD=1 ATTRIBUTION_QA=1 \
 *     ELEVENLABS_API_KEY=… DATABASE_URL=… \
 *     npx tsx scripts/generate-attribution-snippet-audio.mts --all
 *
 *   npx tsx scripts/generate-attribution-snippet-audio.mts ignite-her-him-explicit
 *
 * Then verify audio:
 *   OPENAI_API_KEY=… npx tsx scripts/verify-attribution-audio.mts --all
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateAudioFile, type Scene } from "../src/routes/generate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, "../fixtures/attribution-snippets");
const OUT_DIR = path.resolve(__dirname, "../public/test-stories");
const AUDIO_DIR = path.resolve(__dirname, "../public/audio");

interface AttributionFixture {
  slug: string;
  phase: string;
  title: string;
  description?: string;
  pairing: string;
  narratorId: string;
  narratorLabel?: string;
  partnerName?: string;
  protagonistName?: string;
  intensity?: string;
  targetMinutes?: number;
  gate?: "strict" | "regression";
  gateNote?: string;
  forbiddenInAudio: string[];
  text: string;
  sourceStory?: string;
  sourceSceneId?: number;
}

function loadFixtures(slugs: string[]): AttributionFixture[] {
  const files = fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith(".json"));
  const all = files.map((f) => {
    const raw = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, f), "utf8")) as AttributionFixture;
    if (!raw.slug) raw.slug = f.replace(/\.json$/, "");
    return raw;
  });
  if (slugs.length === 0) return all;
  return all.filter((fx) => slugs.some((s) => fx.slug === s || fx.slug.startsWith(s)));
}

function fixtureToScenes(fx: AttributionFixture): Scene[] {
  return [
    {
      id: 1,
      heading: fx.title,
      text: fx.text,
      rawText: fx.text,
      visualPrompt: "",
      durationEstimate: (fx.targetMinutes ?? 2) * 60,
      emotionalShift: "IGNITE",
    },
  ];
}

async function generateOne(fx: AttributionFixture) {
  const cacheKey = `attr-${fx.slug}`;
  const scenes = fixtureToScenes(fx);

  console.log(`\n▶  ${fx.slug}  [${fx.phase}]  ${fx.pairing}`);
  console.log(`   ${fx.title}`);
  console.log(`   narrator=${fx.narratorLabel ?? fx.narratorId.slice(0, 8)}  ~${fx.targetMinutes ?? 2} min target`);

  const t0 = Date.now();
  const result = await generateAudioFile(
    scenes,
    fx.narratorId,
    cacheKey,
    fx.pairing,
    fx.intensity ?? "Explicit",
    fx.partnerName,
    fx.protagonistName,
  );

  const filename = `audio-${cacheKey}.mp3`;
  const localPath = path.join(AUDIO_DIR, filename);
  const wordCount = fx.text.split(/\s+/).filter(Boolean).length;

  const manifest = {
    generatedAt: new Date().toISOString(),
    engine: "generateAudioFile",
    fixture: fx.slug,
    phase: fx.phase,
    title: fx.title,
    pairing: fx.pairing,
    narratorId: fx.narratorId,
    partnerName: fx.partnerName ?? null,
    protagonistName: fx.protagonistName ?? null,
    intensity: fx.intensity ?? "Explicit",
    wordCount,
    durationSeconds: result.durationSeconds,
    audioUrl: result.url,
    audioFilename: filename,
    localPath: fs.existsSync(localPath) ? localPath : null,
    listenUrl: `http://localhost:3000${result.url}`,
    forbiddenInAudio: fx.forbiddenInAudio,
    gate: fx.gate ?? "strict",
    gateNote: fx.gateNote ?? null,
    elapsedMs: Date.now() - t0,
    qa: result.qa ?? null,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifestPath = path.join(OUT_DIR, `${cacheKey}.manifest.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  const muted = result.qa?.segments.filter((s) => s.muted).length ?? 0;
  const spoken = result.qa?.segments.filter((s) => s.spokenText).length ?? 0;
  console.log(`   ✓ ${result.durationSeconds}s audio  multiVoice=${result.qa?.useMultiVoice ?? "?"}  tagger=${result.qa?.tagger ?? "?"}`);
  console.log(`   segments: ${result.qa?.segments.length ?? 0} spoken=${spoken} muted=${muted}`);
  console.log(`   file: public/audio/${filename}`);
  console.log(`   manifest: public/test-stories/${cacheKey}.manifest.json`);

  if (result.qa && !result.qa.useMultiVoice) {
    console.warn(`   ⚠ WARNING: single-voice fallback — attribution mute may not apply`);
  }

  return manifest;
}

async function main() {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error("ERROR: ELEVENLABS_API_KEY is required for live generation.");
    process.exit(1);
  }

  process.env.ATTRIBUTION_QA = "1";

  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const all = process.argv.includes("--all");
  const slugs = all ? [] : args;

  if (!all && slugs.length === 0) {
    console.log(`Usage:
  npx tsx scripts/generate-attribution-snippet-audio.mts --all
  npx tsx scripts/generate-attribution-snippet-audio.mts ignite-her-him-explicit ignite-her-her-office

Env:
  LOCAL_AUDIO_MIRROR=1   mirror MP3 to public/audio/
  SKIP_GCS_UPLOAD=1      skip GCS (local QA only)
  ATTRIBUTION_QA=1       set automatically`);
    process.exit(0);
  }

  const fixtures = loadFixtures(slugs);
  if (fixtures.length === 0) {
    console.error("No fixtures matched.");
    process.exit(1);
  }

  console.log("=".repeat(72));
  console.log("ATTRIBUTION LIVE QA — production engine + ElevenLabs");
  console.log(`Fixtures: ${fixtures.length}  LOCAL_AUDIO_MIRROR=${process.env.LOCAL_AUDIO_MIRROR ?? "off"}`);
  console.log("=".repeat(72));

  const results = [];
  for (const fx of fixtures) {
    results.push(await generateOne(fx));
  }

  const summaryPath = path.join(OUT_DIR, "attribution-qa-latest.json");
  fs.writeFileSync(
    summaryPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), fixtures: results }, null, 2),
  );

  console.log(`\n${"=".repeat(72)}`);
  console.log(`Done. ${results.length} snippet(s) generated.`);
  console.log(`Summary: public/test-stories/attribution-qa-latest.json`);
  console.log(`Next: OPENAI_API_KEY=… npx tsx scripts/verify-attribution-audio.mts --all`);
  console.log("=".repeat(72));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
