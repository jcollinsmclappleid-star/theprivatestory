#!/usr/bin/env node
/**
 * Generate 4 cliffhanger sample previews for review before updating live MP3s.
 * Output: public/voice-samples/previews/{slug}.mp3
 *
 * Usage:
 *   node scripts/generate-sample-previews.mjs              # all 4
 *   node scripts/generate-sample-previews.mjs neighbour    # just one
 *
 * Voice cast mirrors the live /samples page — Maya is the lead female voice.
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
  theo:  { id: "jfIS2w2yJi0grJZPyEsk", stability: 0.38, similarity_boost: 0.80, style: 0.58 },
  maya:  { id: "tQ4MEZFJOzsahSEEZtHK", stability: 0.36, similarity_boost: 0.84, style: 0.68 },
  james: { id: "AeRdCCKzvd23BpJoofzx", stability: 0.40, similarity_boost: 0.80, style: 0.62 },
  kayla: { id: "aTxZrSrp47xsP6Ot4Kgd", stability: 0.38, similarity_boost: 0.82, style: 0.65 },
  clara: { id: "FA6HhUjVbervLw2rNl8M", stability: 0.42, similarity_boost: 0.78, style: 0.55 },
};

const SAMPLES = [
  {
    slug: "preview-adjoining-suites",
    label: "The Adjoining Suites",
    segments: [
      { voice: "theo",  text: "Two men. One hotel suite. She'd had every chance to leave — and walked through the connecting door instead." },
      { voice: "james", text: "We've been talking about you. For months. Tell us what you've imagined." },
      { voice: "maya",  text: "Both of you. In this room. Me between you — and you deciding who goes first." },
      { voice: "james", text: "Be specific." },
      { voice: "maya",  text: "One of you holding me still. The other watching until I say his name." },
      { voice: "james", text: "Look at me. Are you sure?" },
      { voice: "maya",  text: "I've never been more sure of anything." },
      { voice: "james", text: "Then get on the bed." },
    ],
  },
  {
    slug: "preview-neighbour",
    label: "The Neighbour",
    segments: [
      { voice: "theo",  text: "Three weeks. Every night — footsteps above her. Barefoot. Restless. Tonight she knocked on his door with an empty wine glass and no shoes." },
      { voice: "maya",  text: "I've been listening to you. The shower. The late nights. I know your rhythm better than I should." },
      { voice: "james", text: "That's a strange thing to admit to your neighbour." },
      { voice: "maya",  text: "I didn't come for the corkscrew. I came because I wanted to know if you've been listening too." },
      { voice: "james", text: "Every night. Every sound you make upstairs." },
      { voice: "maya",  text: "Good. Then tell me what you've been imagining when you hear me." },
      { voice: "james", text: "You. In my kitchen. Not leaving until I—" },
      { voice: "maya",  text: "Until you what? Say it." },
      { voice: "james", text: "Until you let me do everything I've been thinking about for three weeks." },
    ],
  },
  {
    slug: "preview-supervisors-office",
    label: "The Supervisor's Office",
    segments: [
      { voice: "clara", text: "The report was still open. Neither of them was reading it. Three years of supervision — and tonight, for the first time, the rule didn't apply." },
      { voice: "maya",  text: "You're not looking at the page." },
      { voice: "kayla", text: "No. I'm looking at you. And I'm done pretending I haven't wanted to for three years." },
      { voice: "maya",  text: "You can't say that. You're still my—" },
      { voice: "kayla", text: "I'm not your supervisor anymore. You passed. You're a doctor now. So tell me — what have you been writing about me in those footnotes?" },
      { voice: "maya",  text: "Wanting your hands on me. Wanting you to tell me what to do." },
      { voice: "kayla", text: "Be still." },
      { voice: "maya",  text: "...yes." },
      { voice: "kayla", text: "Lock the door. Then we'll find out if you mean it." },
    ],
  },
  {
    slug: "preview-proposition",
    label: "The Proposition",
    segments: [
      { voice: "clara", text: "The members' club had no sign on the door. He'd been watching her for an hour. A drink arrived she didn't order — and a message: he asked if he could come over." },
      { voice: "maya",  text: "...yes." },
      { voice: "james", text: "I'm going to be direct. I have a room upstairs. I won't touch you in the lift. I won't touch you in the corridor. If you change your mind, you walk away — I won't follow." },
      { voice: "maya",  text: "And if I don't?" },
      { voice: "james", text: "Then you'll tell me exactly what you want — and I'll decide whether I'm willing to give it to you." },
      { voice: "maya",  text: "You want me to ask." },
      { voice: "james", text: "I want you to say it out loud. What you want a stranger to do to you tonight." },
      { voice: "maya",  text: "Then stop talking — and let me say it." },
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
