#!/usr/bin/env node

/**
 * Generate three door-coded story samples for the /samples page.
 *
 * One short narrated excerpt per door (Romance / After Dark / Drift),
 * each in a voice picked to match the door's tone.
 *
 * Output: public-static/voice-samples/doors/{slug}.mp3
 *
 * Usage:
 *   node scripts/generate-door-samples.mjs          # skip existing
 *   node scripts/generate-door-samples.mjs --force  # regenerate all
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { hybridTts } from "./lib/ttsHybrid.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_OUTPUT_DIR = path.join(__dirname, "..", "public-static", "voice-samples", "doors");
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const FORCE = process.argv.includes("--force");

if (!ELEVENLABS_API_KEY) {
  console.error("ERROR: ELEVENLABS_API_KEY environment variable not set");
  process.exit(1);
}

const LISA = "PB6BdkFkZLbI39GHdnbQ";
const MAYA = "tQ4MEZFJOzsahSEEZtHK";
const SOFIA = "D9MdulIxfrCUUJcGNQon";

const SAMPLES = [
  {
    slug: "romance",
    door: "Romance",
    voiceId: LISA,
    voiceName: "Lisa",
    title: "The Fake-Dating One",
    style: 0.28,
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
    voiceId: MAYA,
    voiceName: "Maya",
    title: "The First Word",
    style: 0.38,
    role: "CHAR",
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

"[breathless] Yes. I want you to."`,
  },
  {
    slug: "drift",
    door: "Drift",
    voiceId: SOFIA,
    voiceName: "Sofia",
    title: "The House at the Edge of the Forest",
    style: 0.08,
    text:
`The house sits where the field ends and the forest begins.

You arrive on foot. There is no road. The path is soft underfoot — moss, then pine needles, then the worn stone of the doorstep.

The door is unlocked. It is always unlocked here. Inside, a fire has been laid for you. A blanket folded over the arm of the chair. A pot of tea, still warm.

You don't remember who left it. You don't need to.

There is a window seat that looks out over the trees. The light is the kind of light that only exists in late afternoon in autumn — gold, slow, settling on everything.

You sit. You let your shoulders drop. [sighs softly] You let your breath find its own pace.

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

  const buffer = await hybridTts(sample.voiceId, sample.text, {
    role: sample.role ?? "NARRATOR",
    style: sample.style,
    vocalEffects: true,
    apiKey: ELEVENLABS_API_KEY,
  });

  fs.writeFileSync(outputPath, buffer);
  console.log(`    -> ${outputPath} (${Math.round(buffer.length / 1024)} KB)`);
}

async function main() {
  if (!fs.existsSync(SAMPLE_OUTPUT_DIR)) {
    fs.mkdirSync(SAMPLE_OUTPUT_DIR, { recursive: true });
  }

  console.log(`Generating ${SAMPLES.length} door samples (turbo + v3 where tagged)...`);
  for (const sample of SAMPLES) {
    await generateSample(sample);
  }
  console.log("\nDone. Served at /voice-samples/doors/{slug}.mp3 after api-server build.");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
