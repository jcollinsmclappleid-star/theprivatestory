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

const V = {
  theo:  { id: "jfIS2w2yJi0grJZPyEsk", stability: 0.52, similarity_boost: 0.78, style: 0.20 },
  maya:  { id: "tQ4MEZFJOzsahSEEZtHK", stability: 0.45, similarity_boost: 0.82, style: 0.40 },
  james: { id: "AeRdCCKzvd23BpJoofzx", stability: 0.55, similarity_boost: 0.78, style: 0.22 },
  kayla: { id: "aTxZrSrp47xsP6Ot4Kgd", stability: 0.48, similarity_boost: 0.80, style: 0.32 },
  elena: { id: "FA6HhUjVbervLw2rNl8M", stability: 0.58, similarity_boost: 0.76, style: 0.14 }, // Clara stand-in
};

const SAMPLES = [
  {
    slug: "preview-neighbour",
    label: "The Neighbour",
    segments: [
      { voice: "theo",  text: "Three weeks. Every night — footsteps above him. Soft. Barefoot. Restless. Tonight he knocked." },
      { voice: "james", text: "I have wine. And I've been hearing you walk around in there alone." },
      { voice: "maya",  text: "That's either very thoughtful — or very presumptuous." },
      { voice: "james", text: "Which would you prefer it to be?" },
      { voice: "maya",  text: "...come in." },
      { voice: "theo",  text: "She stepped back. He didn't wait." },
      { voice: "james", text: "I've wanted to knock for weeks." },
      { voice: "maya",  text: "Then why didn't you?" },
      { voice: "james", text: "Because I wasn't sure I'd stop at wine." },
    ],
  },
  {
    slug: "preview-adjoining-suites",
    label: "The Adjoining Suites",
    segments: [
      { voice: "theo",  text: "Two men. One room. She'd had every chance to leave." },
      { voice: "james", text: "Tell us what you want. Say it." },
      { voice: "maya",  text: "I want to stop pretending I haven't thought about this." },
      { voice: "james", text: "You've thought about it." },
      { voice: "maya",  text: "Both of you. Yes." },
      { voice: "james", text: "Tell me — in that thought — what were we doing to you?" },
      { voice: "maya",  text: "Everything." },
      { voice: "james", text: "Be specific." },
      { voice: "maya",  text: "You. Then him. And then — however you want to arrange it after that." },
      { voice: "james", text: "Look at me when you say that again." },
      { voice: "maya",  text: "However. You. Want." },
      { voice: "theo",  text: "Neither man moved. Not yet. They were very good at waiting." },
    ],
  },
  {
    slug: "preview-proposition",
    label: "The Proposition (Elena = Clara stand-in)",
    segments: [
      { voice: "elena", text: "She'd told herself she wouldn't answer him. She was still there." },
      { voice: "james", text: "You've been thinking about it since I sat down." },
      { voice: "maya",  text: "You're very sure of yourself." },
      { voice: "james", text: "Tell me I'm wrong." },
      { voice: "maya",  text: "What exactly are you proposing?" },
      { voice: "james", text: "I want the rest of your evening. All of it." },
      { voice: "maya",  text: "And what would you do with it?" },
      { voice: "james", text: "I'd take my time with you. Something tells me no one has." },
      { voice: "maya",  text: "And if I said yes?" },
      { voice: "james", text: "Then we finish our drinks. We leave. And I show you what it feels like when a man knows exactly what he wants — and isn't in any hurry to stop wanting it." },
      { voice: "elena", text: "She set down her glass. Very deliberately. And looked at him." },
      { voice: "maya",  text: "Finish your drink." },
    ],
  },
  {
    slug: "preview-supervisors-office",
    label: "The Supervisor's Office (Elena narrates · Kayla = supervisor · Maya = junior)",
    segments: [
      { voice: "elena", text: "The report was still open. Neither of them was reading it." },
      { voice: "maya",  text: "You're not looking at the page." },
      { voice: "kayla", text: "No." },
      { voice: "maya",  text: "What are you looking at?" },
      { voice: "kayla", text: "You. The way you've been sitting across from me for three years pretending you don't feel this." },
      { voice: "maya",  text: "I never said I didn't feel it." },
      { voice: "kayla", text: "Then say what you do feel. Right now. Just us." },
      { voice: "maya",  text: "I want you to touch me." },
      { voice: "kayla", text: "Here?" },
      { voice: "maya",  text: "Yes. Here. I have wanted it every single Friday." },
      { voice: "kayla", text: "And I have spent every single Friday not doing it." },
      { voice: "maya",  text: "Then stop being good." },
      { voice: "elena", text: "She stood. Crossed the room. Her supervisor finally — finally — moved." },
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
