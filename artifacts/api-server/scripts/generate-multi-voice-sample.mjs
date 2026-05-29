/**
 * Multi-voice trial: "The Last One in the Building"
 *
 * Parses a [TAG] / [TAG:modifier] script, assigns each segment a voice
 * and ElevenLabs settings, then concatenates the MP3 buffers into a
 * single file.
 *
 * Usage:
 *   node artifacts/api-server/scripts/generate-multi-voice-sample.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUTPUT_PATH = path.resolve(
  __dirname,
  "../public-static/voice-samples/editors-picks/01-last-one-multi.mp3"
);

// ── Voice IDs ────────────────────────────────────────────────────────────────
const VOICES = {
  clara: "FA6HhUjVbervLw2rNl8M",
  james: "AeRdCCKzvd23BpJoofzx",
};

// ── Tag → voice + settings map ───────────────────────────────────────────────
const TAG_CONFIG = {
  NARRATOR: {
    voiceId: VOICES.clara,
    stability: 0.45,
    similarity_boost: 0.80,
    style: 0.25,
  },
  HIM: {
    voiceId: VOICES.james,
    stability: 0.40,
    similarity_boost: 0.80,
    style: 0.45,
  },
  "HIM:close": {
    voiceId: VOICES.james,
    stability: 0.22,
    similarity_boost: 0.88,
    style: 0.78,
  },
  HER: {
    voiceId: VOICES.clara,
    stability: 0.42,
    similarity_boost: 0.80,
    style: 0.35,
  },
  "HER:whisper": {
    voiceId: VOICES.clara,
    stability: 0.12,
    similarity_boost: 0.92,
    style: 0.92,
  },
};

// ── Tagged script ─────────────────────────────────────────────────────────────
const SCRIPT = `
[NARRATOR] She had stayed late on purpose. The quarterly close had finished at six. It was half past eight and she was still at her desk because that morning she had overheard him say he might come back.

[NARRATOR] The lift chimed at the end of the corridor. She didn't look up.

[NARRATOR] He stopped in her doorway. Tie loosened, top button open, coat over one arm.

[HIM] "You're still here."

[HER] "Just finishing."

[HIM] "You finished two hours ago."

[NARRATOR] She looked up and let him see it — let him see she was done pretending.

[HIM] "So why are you still at your desk."

[HER] "You know exactly why."

[NARRATOR] Something shifted in his face. He put the coat down.

[NARRATOR] He crossed the office and stopped at her chair. She could smell him — clean shirt, something expensive — and the proximity of him after two years of careful distance made the ache in her chest drop lower, settle somewhere more specific.

[NARRATOR] He reached past her and pressed a key. The screen went dark. His face was close enough that she could feel the warmth of his breath.

[NARRATOR] She stood up. She took his hands — both of them — and placed them at her waist. Felt him go absolutely still. Felt the change in his breathing.

[HER:whisper] "Two years."

[NARRATOR] Then she tilted her face up and kissed him.

[NARRATOR] The sound he made against her mouth was not patient. His hands gripped her waist and pulled her in and kissed her back with everything two years of not doing this had accumulated — her fingers knotting into his hair, the edge of the desk pressing into the backs of her thighs as he walked her into it. She felt how much he wanted her and it sent heat through her in a wave she didn't try to manage.

[HIM:close] "I should have done this months ago."

[HER] "Longer than that."

[NARRATOR] He pulled back just far enough to look at her the way she had wanted him to look at her for two years. Then his hands moved to the zip at the back of her dress.

[HIM:close] "Tell me to stop."

[NARRATOR] She reached back and found his hands. Guided them.

[HER:whisper] "Don't."
`.trim();

// ── Parser ────────────────────────────────────────────────────────────────────
function parseScript(script) {
  const segments = [];
  let currentTag = null;
  let currentLines = [];

  for (const raw of script.split("\n")) {
    const line = raw.trimEnd();
    const m = line.match(/^\[([A-Z]+(?::[a-z]+)?)\]\s*(.*)/);
    if (m) {
      if (currentTag && currentLines.join("").trim()) {
        segments.push({ tag: currentTag, text: currentLines.join(" ").trim() });
      }
      currentTag = m[1];
      currentLines = m[2] ? [m[2]] : [];
    } else if (currentTag && line.trim()) {
      currentLines.push(line.trim());
    }
  }
  if (currentTag && currentLines.join("").trim()) {
    segments.push({ tag: currentTag, text: currentLines.join(" ").trim() });
  }
  return segments;
}

// ── TTS call ──────────────────────────────────────────────────────────────────
async function tts(text, config) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY not set");

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "xi-api-key": key,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: config.stability,
          similarity_boost: config.similarity_boost,
          style: config.style,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${err}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const segments = parseScript(SCRIPT);
  console.log(`Parsed ${segments.length} segments.\n`);

  const buffers = [];
  for (let i = 0; i < segments.length; i++) {
    const { tag, text } = segments[i];
    const config = TAG_CONFIG[tag] ?? TAG_CONFIG.NARRATOR;
    const label = tag.padEnd(12);
    const preview = text.length > 60 ? text.slice(0, 57) + "…" : text;
    process.stdout.write(`  [${i + 1}/${segments.length}] ${label} "${preview}"\n`);
    const buf = await tts(text, config);
    buffers.push(buf);
    process.stdout.write(`         → ${buf.length} bytes\n`);
  }

  const final = Buffer.concat(buffers);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, final);

  const kb = Math.round(final.length / 1024);
  console.log(`\nDone. ${kb} KB → ${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
