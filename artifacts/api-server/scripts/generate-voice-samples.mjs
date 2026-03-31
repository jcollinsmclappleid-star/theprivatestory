#!/usr/bin/env node

/**
 * Generate voice samples for all voices
 * Run once to create fixed MP3 samples that won't incur costs each time they're played
 * 
 * Usage:
 *   node scripts/generate-voice-samples.mjs
 * 
 * Requires:
 *   ELEVENLABS_API_KEY environment variable set
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_OUTPUT_DIR = path.join(__dirname, "..", "src", "public", "voice-samples");
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  console.error("ERROR: ELEVENLABS_API_KEY environment variable not set");
  process.exit(1);
}

const VOICES = [
  { id: "RILOU7YmBhvwJGDGjNmP", label: "Classic" },
  { id: "tQ4MEZFJOzsahSEEZtHK", label: "Close" },
  { id: "FA6HhUjVbervLw2rNl8M", label: "Unhurried" },
  { id: "AeRdCCKzvd23BpJoofzx", label: "Low" },
  { id: "n1PvBOwxb8X6m7tahp2h", label: "Deep" },
  { id: "jfIS2w2yJi0grJZPyEsk", label: "Heavy" },
];

const SAMPLE_TEXT = "I've been waiting for you. There's something I need to tell you that I've kept locked away for far too long.";

async function generateVoiceSamples() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(SAMPLE_OUTPUT_DIR)) {
    fs.mkdirSync(SAMPLE_OUTPUT_DIR, { recursive: true });
    console.log(`✓ Created directory: ${SAMPLE_OUTPUT_DIR}`);
  }

  for (const voice of VOICES) {
    const outputPath = path.join(SAMPLE_OUTPUT_DIR, `${voice.id}.mp3`);

    // Skip if sample already exists
    if (fs.existsSync(outputPath)) {
      console.log(`⊘ Skipping ${voice.label} (${voice.id}) — already exists`);
      continue;
    }

    try {
      console.log(`⟳ Generating sample for ${voice.label} (${voice.id})...`);

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.id}/stream`, {
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
      console.log(`✓ Generated: ${voice.label} (${voice.id})`);
    } catch (err) {
      console.error(`✗ Failed to generate ${voice.label} (${voice.id}):`, err.message);
      process.exit(1);
    }
  }

  console.log("\n✓ All voice samples generated successfully!");
  console.log(`  Samples saved to: ${SAMPLE_OUTPUT_DIR}`);
  console.log(`  Commit these files to git, and they will be served via /voice-samples/:voiceId`);
}

generateVoiceSamples().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
