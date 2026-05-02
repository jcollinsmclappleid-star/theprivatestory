#!/usr/bin/env node

/**
 * Generate three door-coded story samples for the /samples page.
 *
 * One short narrated excerpt per door (Romance / After Dark / Drift),
 * each in a voice picked to match the door's tone.
 *
 * Output: public-static/voice-samples/doors/{slug}.mp3
 *   These are committed to git and copied to public/ on each api-server build,
 *   then served as static files at /voice-samples/doors/{slug}.mp3.
 *
 * Usage:
 *   node scripts/generate-door-samples.mjs          # skip existing
 *   node scripts/generate-door-samples.mjs --force  # regenerate all
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_OUTPUT_DIR = path.join(__dirname, "..", "public-static", "voice-samples", "doors");
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const FORCE = process.argv.includes("--force");

if (!ELEVENLABS_API_KEY) {
  console.error("ERROR: ELEVENLABS_API_KEY environment variable not set");
  process.exit(1);
}

const SAMPLES = [
  {
    slug: "romance",
    door: "Romance",
    voiceId: "FA6HhUjVbervLw2rNl8M",
    voiceName: "Clara",
    title: "The Fake-Dating One",
    voice_settings: { stability: 0.55, similarity_boost: 0.78, style: 0.15 },
    text:
`His sister's wedding was on Saturday, and the plus-one box had been empty for six months.

"Just one weekend," he said, sliding the invitation across the bar. "Pretend you adore me. I'll owe you for life."

She studied him over her glass. The crooked smile she'd been ignoring since university. The way he never quite met her eye when it mattered.

"Pretend," she repeated.

"Pretend."

Saturday came. He held her hand at the church. He laughed when she whispered something into his ear at the reception. And somewhere between the toast and the first dance, neither of them remembered to let go.

She didn't tell him, until Sunday morning, that she hadn't been pretending.`,
  },
  {
    slug: "after-dark",
    door: "After Dark",
    voiceId: "tQ4MEZFJOzsahSEEZtHK",
    voiceName: "Maya",
    title: "The First Word",
    voice_settings: { stability: 0.45, similarity_boost: 0.82, style: 0.35 },
    text:
`He stopped at her door.

She'd been waiting for him to ask. For weeks, maybe. Long enough that the silence between them had started to feel like a held breath.

"I want to," he said. "I just need you to say it first."

The hallway light was low. She could feel her own pulse at the base of her throat.

"Say what?"

"That you want me to."

She stepped back. Held the door open. Looked at him properly — at the way he hadn't moved, at the way he was waiting for her, exactly where she needed him to wait.

"Come in," she said.

And then, because he was still watching her, because he needed to hear it —

"Yes. I want you to."`,
  },
  {
    slug: "drift",
    door: "Drift",
    voiceId: "jfIS2w2yJi0grJZPyEsk",
    voiceName: "Theo",
    title: "The House at the Edge of the Forest",
    voice_settings: { stability: 0.7, similarity_boost: 0.75, style: 0.05 },
    text:
`The house sits where the field ends and the forest begins.

You arrive on foot. There is no road. The path is soft underfoot — moss, then pine needles, then the worn stone of the doorstep.

The door is unlocked. It is always unlocked here. Inside, a fire has been laid for you. A blanket folded over the arm of the chair. A pot of tea, still warm.

You don't remember who left it. You don't need to.

There is a window seat that looks out over the trees. The light is the kind of light that only exists in late afternoon in autumn — gold, slow, settling on everything.

You sit. You let your shoulders drop. You let your breath find its own pace.

Outside, somewhere deep in the forest, a single bird calls. And then everything is quiet again.`,
  },
];

async function generateSample(sample) {
  const outputPath = path.join(SAMPLE_OUTPUT_DIR, `${sample.slug}.mp3`);

  if (!FORCE && fs.existsSync(outputPath)) {
    console.log(`  - skip ${sample.door.padEnd(11)} ${sample.title} (already exists)`);
    return;
  }

  console.log(`  - gen  ${sample.door.padEnd(11)} ${sample.title} (${sample.voiceName})...`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${sample.voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: sample.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: sample.voice_settings,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `ElevenLabs API error (${response.status}) for ${sample.slug}: ${error}`,
    );
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
  const sizeKb = Math.round(buffer.byteLength / 1024);
  console.log(`    -> ${outputPath} (${sizeKb} KB)`);
}

async function main() {
  if (!fs.existsSync(SAMPLE_OUTPUT_DIR)) {
    fs.mkdirSync(SAMPLE_OUTPUT_DIR, { recursive: true });
    console.log(`+ created ${SAMPLE_OUTPUT_DIR}`);
  }

  console.log(`Generating ${SAMPLES.length} door samples...`);
  for (const sample of SAMPLES) {
    await generateSample(sample);
  }
  console.log("\nDone. Files committed to public-static/voice-samples/doors/");
  console.log("Served at /voice-samples/doors/{slug}.mp3 after api-server build.");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
