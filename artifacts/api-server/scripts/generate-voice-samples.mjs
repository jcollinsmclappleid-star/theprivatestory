#!/usr/bin/env node

/**
 * Generate fixed voice samples for all voices — run once, commit to git
 *
 * Usage:
 *   node scripts/generate-voice-samples.mjs          # skip existing
 *   node scripts/generate-voice-samples.mjs --force  # regenerate all
 *
 * Requires: ELEVENLABS_API_KEY environment variable
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// public-static/ is committed to git and copied to public/ on each build
// public/ is the runtime serving directory (served directly at /voice-samples/:voiceId)
const SAMPLE_OUTPUT_DIR = path.join(__dirname, "..", "public-static", "voice-samples");
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const FORCE = process.argv.includes("--force");

if (!ELEVENLABS_API_KEY) {
  console.error("ERROR: ELEVENLABS_API_KEY environment variable not set");
  process.exit(1);
}

const VOICES = [
  { id: "aTxZrSrp47xsP6Ot4Kgd", label: "Expressive" },
  { id: "PB6BdkFkZLbI39GHdnbQ", label: "Sensual" },
  { id: "D9MdulIxfrCUUJcGNQon", label: "Warm" },
  { id: "tQ4MEZFJOzsahSEEZtHK", label: "Close" },
  { id: "AeRdCCKzvd23BpJoofzx", label: "Low" },
  { id: "n1PvBOwxb8X6m7tahp2h", label: "Deep" },
  { id: "jfIS2w2yJi0grJZPyEsk", label: "Heavy" },
];

// ~15 seconds at intimate narration pace (~120 wpm)
const SAMPLE_TEXT = `The door closed softly behind him. She hadn't expected this moment to feel so certain. He turned to face her — and in that quiet, everything she'd been holding back simply let go. She hadn't planned for any of it. But there it was.`;

async function generateVoiceSamples() {
  if (!fs.existsSync(SAMPLE_OUTPUT_DIR)) {
    fs.mkdirSync(SAMPLE_OUTPUT_DIR, { recursive: true });
    console.log(`✓ Created directory: ${SAMPLE_OUTPUT_DIR}`);
  }

  for (const voice of VOICES) {
    const outputPath = path.join(SAMPLE_OUTPUT_DIR, `${voice.id}.mp3`);

    if (!FORCE && fs.existsSync(outputPath)) {
      console.log(`⊘ Skipping ${voice.label} — already exists (use --force to regenerate)`);
      continue;
    }

    try {
      console.log(`⟳ Generating ${voice.label} (${voice.id})...`);

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: SAMPLE_TEXT,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs API error (${response.status}): ${error}`);
      }

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      console.log(`✓ ${voice.label} → ${outputPath}`);
    } catch (err) {
      console.error(`✗ Failed: ${voice.label} — ${err.message}`);
      process.exit(1);
    }
  }

  console.log("\n✓ All voice samples generated successfully!");
  console.log(`  Commit artifacts/api-server/src/public/voice-samples/*.mp3 to git.`);
  console.log(`  They will be served as static files at /voice-samples/:voiceId.mp3`);
}

generateVoiceSamples().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
