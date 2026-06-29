#!/usr/bin/env node
/**
 * Generate 4 new sample previews for review before updating the live samples page.
 * Output: public/voice-samples/previews/{slug}.mp3
 *
 * Usage:
 *   node scripts/generate-sample-previews.mjs              # all 4
 *   node scripts/generate-sample-previews.mjs neighbour    # just one
 *
 * NOTE: Elena has no configured ElevenLabs ID yet.
 *       Clara (FA6HhUjVbervLw2rNl8M) is used as a stand-in until the ID is provided.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import os from "os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "public", "voice-samples", "previews");
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Voice settings: stability down → more breath/variation; style up → emotional presence
const V = {
  theo:  { id: "jfIS2w2yJi0grJZPyEsk", stability: 0.38, similarity_boost: 0.80, style: 0.58 },
  maya:  { id: "tQ4MEZFJOzsahSEEZtHK", stability: 0.36, similarity_boost: 0.84, style: 0.68 },
  james: { id: "AeRdCCKzvd23BpJoofzx", stability: 0.40, similarity_boost: 0.80, style: 0.62 },
  kayla: { id: "aTxZrSrp47xsP6Ot4Kgd", stability: 0.38, similarity_boost: 0.82, style: 0.65 },
  elena: { id: "FA6HhUjVbervLw2rNl8M", stability: 0.42, similarity_boost: 0.78, style: 0.55 }, // Clara stand-in
};

const SAMPLES = [
  // ── 1. THE NEIGHBOUR ────────────────────────────────────────────────────────
  // Structure: hook → "you" pull → threshold line → physical cliff
  {
    slug: "preview-neighbour",
    label: "The Neighbour",
    segments: [
      { voice: "theo",  text: "Three weeks. Every night — footsteps above him. Soft. Barefoot. Restless. Tonight he knocked." },
      { voice: "james", text: "I have wine. And I've been thinking about you every night." },
      { voice: "maya",  text: "That's either very thoughtful — or very dangerous." },
      { voice: "james", text: "Which would you prefer it to be?" },
      { voice: "maya",  text: "Come in." },
      { voice: "james", text: "I've been standing in that hallway wanting you. Every single night." },
      { voice: "maya",  text: "Then stop standing there." },
      { voice: "james", text: "Tell me what you want me to do to you." },
      { voice: "maya",  text: "Everything." },
    ],
  },

  // ── 2. THE ADJOINING SUITES ─────────────────────────────────────────────────
  // Structure: hook → explicit "you" fantasy → names the physical act → cliff
  {
    slug: "preview-adjoining-suites",
    label: "The Adjoining Suites",
    segments: [
      { voice: "theo",  text: "Two men. One room. She'd had every chance to leave." },
      { voice: "james", text: "Tell us what you want. Say it out loud." },
      { voice: "maya",  text: "I've imagined both of you. More than once." },
      { voice: "james", text: "What were we doing to you?" },
      { voice: "maya",  text: "Taking turns." },
      { voice: "james", text: "Be more specific." },
      { voice: "maya",  text: "Your hands. His mouth. And then — however you want to arrange the rest of it." },
      { voice: "james", text: "Look at me." },
      { voice: "james", text: "Are you wet?" },
      { voice: "maya",  text: "Yes." },
      { voice: "james", text: "Then get on the bed." },
    ],
  },

  // ── 3. THE PROPOSITION ──────────────────────────────────────────────────────
  // Structure: hook → "you" challenge → names undressing / losing control → cliff
  {
    slug: "preview-proposition",
    label: "The Proposition (Elena = Clara stand-in)",
    segments: [
      { voice: "elena", text: "She'd told herself she wouldn't answer him. She was still there." },
      { voice: "james", text: "You've been thinking about it since I sat down." },
      { voice: "maya",  text: "You're very sure of yourself." },
      { voice: "james", text: "Tell me I'm wrong. Tell me you don't want this." },
      { voice: "maya",  text: "...what exactly are you proposing?" },
      { voice: "james", text: "I want to take you somewhere quiet. Undress you. Slowly. And find out exactly what makes you lose control." },
      { voice: "maya",  text: "You'd do all of that." },
      { voice: "james", text: "I'd do a great deal more than that." },
      { voice: "maya",  text: "Then stop talking." },
    ],
  },

  // ── 4. THE SUPERVISOR'S OFFICE ──────────────────────────────────────────────
  // Structure: hook → three-year tension named → "you" want stated physically → cliff flips
  {
    slug: "preview-supervisors-office",
    label: "The Supervisor's Office (Elena narrates · Kayla = supervisor · Maya = junior)",
    segments: [
      { voice: "elena", text: "The report was still open. Neither of them was reading it." },
      { voice: "maya",  text: "You're not looking at the page." },
      { voice: "kayla", text: "No. I'm looking at you." },
      { voice: "maya",  text: "You've been doing that all afternoon." },
      { voice: "kayla", text: "I've been doing it for three years. I'm done pretending I haven't." },
      { voice: "maya",  text: "What are you going to do about it?" },
      { voice: "kayla", text: "Tell me what you want me to do to you." },
      { voice: "maya",  text: "I want your hands on me. Right now." },
      { voice: "kayla", text: "Right here?" },
      { voice: "maya",  text: "Lock the door and find out." },
    ],
  },
];

async function ttsSegment(voice, text) {
  const v = V[voice];
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.id}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: v.stability,
        similarity_boost: v.similarity_boost,
        style: v.style,
        use_speaker_boost: true,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs error ${res.status}: ${err}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function concatMp3(files, output) {
  return new Promise((resolve, reject) => {
    const inputs = files.flatMap(f => ["-i", f]);
    const filterComplex =
      files.map((_, i) => `[${i}:a]`).join("") +
      `concat=n=${files.length}:v=0:a=1[out]`;
    const args = [
      ...inputs,
      "-filter_complex", filterComplex,
      "-map", "[out]",
      "-y", output,
    ];
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", d => { stderr += d; });
    proc.on("close", code => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`));
    });
  });
}

async function generateSample(sample, tmpDir) {
  console.log(`\n▶  ${sample.label}`);
  const segFiles = [];
  for (let i = 0; i < sample.segments.length; i++) {
    const seg = sample.segments[i];
    process.stdout.write(`   [${seg.voice.padEnd(5)}] ${seg.text.slice(0, 55).replace(/\n/g, " ")}…\n`);
    const audio = await ttsSegment(seg.voice, seg.text);
    const segPath = path.join(tmpDir, `${sample.slug}-seg${i}.mp3`);
    fs.writeFileSync(segPath, audio);
    segFiles.push(segPath);
  }
  const outPath = path.join(OUTPUT_DIR, `${sample.slug}.mp3`);
  await concatMp3(segFiles, outPath);
  const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
  console.log(`   ✓ saved  ${sample.slug}.mp3  (${kb} KB)`);
  return outPath;
}

async function main() {
  if (!ELEVENLABS_API_KEY) {
    console.error("ERROR: ELEVENLABS_API_KEY not set");
    process.exit(1);
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sample-preview-"));

  const only = process.argv.slice(2).filter(a => !a.startsWith("-"));
  const toGenerate = only.length
    ? SAMPLES.filter(s => only.some(o => s.slug.includes(o)))
    : SAMPLES;

  for (const sample of toGenerate) {
    await generateSample(sample, tmpDir);
  }

  try { fs.rmSync(tmpDir, { recursive: true }); } catch {}

  console.log("\n✅ All done. Listen at:");
  toGenerate.forEach(s =>
    console.log(`   /voice-samples/previews/${s.slug}.mp3`)
  );
}

main().catch(e => { console.error(e.message); process.exit(1); });
