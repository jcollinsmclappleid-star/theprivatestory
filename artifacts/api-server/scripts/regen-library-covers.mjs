import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.resolve(__dirname, "../public/images");

const BASE_STYLE =
  "stylised digital illustration, painterly romantic art, cinematic composition, warm amber and deep shadow contrast, expressive character faces, elegant body language, tasteful sensuality implied through atmosphere and pose, non-explicit, rich colour palette, atmospheric environment detail, emotional depth, adult romance illustration style, dramatic lighting, soft painterly texture, sophisticated character art, intimate mood, fantasy romance aesthetic, NOT photographic, NOT photorealistic, NOT photography";

const MOOD_FALLBACK = {
  "Forbidden":       "forbidden longing, charged restraint, forbidden desire",
  "Late Night":      "charged late-night intensity, electric quiet, soft lamplight",
  "Emotional":       "deep emotional connection, tender closeness, bittersweet warmth",
  "Slow Burn":       "simmering tension, restrained desire, aching patience",
  "First Encounter": "electric first meeting, magnetic pull, heightened awareness",
  "Tender":          "tender warmth, soft intimacy, golden light",
  "Playful":         "playful flirtation, light energy, warm smiles",
};

function buildPrompt(brief, mood) {
  const style = brief?.image_style_direction || MOOD_FALLBACK[mood] || "warm intimate atmosphere";
  const palette = (brief?.sensory_palette ?? []).slice(0, 2).join(", ");
  return [
    BASE_STYLE,
    style,
    palette,
    "two figures in close proximity",
    "diverse skin tones, global representation",
    "fully clothed",
    "intimate emotional moment",
    "tasteful romantic composition, no nudity, no explicit content",
  ].filter(Boolean).join(", ");
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const { rows } = await client.query(`
  SELECT id, title, mood, brief, images->>'cover' as cover_url
  FROM generated_stories
  WHERE id LIKE 'lib-%'
  AND images->>'cover' LIKE '/api/images/%'
  ORDER BY id
`);

console.log(`\nRegenerating covers for ${rows.length} library stories...\n`);

let done = 0, failed = 0;

for (const story of rows) {
  const filename = path.basename(story.cover_url);
  const filePath = path.join(IMAGES_DIR, filename);
  const prompt = buildPrompt(story.brief, story.mood);

  process.stdout.write(`[${done + failed + 1}/${rows.length}] ${story.title} (${story.mood})... `);

  let buffer = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
      });
      const base64 = response.data[0]?.b64_json ?? "";
      if (!base64) throw new Error("Empty image data returned");
      buffer = Buffer.from(base64, "base64");
      break;
    } catch (err) {
      if (attempt < 3) {
        process.stdout.write(`retry ${attempt}... `);
        await sleep(1500);
      } else {
        console.log(`FAILED — ${err.message}`);
        failed++;
      }
    }
  }

  if (buffer) {
    fs.writeFileSync(filePath, buffer);
    console.log(`✓`);
    done++;
  }

  await sleep(500);
}

await client.end();
console.log(`\nDone. ${done} regenerated, ${failed} failed.`);
