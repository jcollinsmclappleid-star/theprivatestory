/**
 * One-time script: generate atmospheric cover images for all browse categories.
 * Saves to dist/public/images/category-{id}.png (served via /api/images/category-{id}.png).
 *
 * Run from the api-server directory:
 *   node scripts/generateCategoryImages.mjs
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const apiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("ERROR: No OpenAI API key found. Set AI_INTEGRATIONS_OPENAI_API_KEY or OPENAI_API_KEY.");
  process.exit(1);
}

const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined;
const openai = new OpenAI({ apiKey, ...(baseUrl ? { baseURL: baseUrl } : {}) });

const CATEGORY_IMAGE_PROMPTS = {
  forbidden_desire:
    "cinematic adult animation, premium streaming-quality illustration, emotionally driven romance, soft cinematic lighting, warm amber and deep shadow contrast, filmic composition, non-explicit, romantic realism — a Black woman in elegant office attire and a dark-suited man reflected together in rain-drenched floor-to-ceiling glass high above a city at night, their eyes meeting in the reflection, forbidden longing etched into every inch of restrained space between them, deep crimson ambient glow from the city below, neither touching, fully clothed, charged silence",
  dark_romance:
    "cinematic adult animation, premium streaming-quality illustration, emotionally driven romance, soft cinematic lighting, filmic composition, non-explicit, romantic realism — a South Asian woman in a long dark dress standing in profile at a fog-lit window, a shadowed male silhouette approaching through deep violet mist behind her, psychological intensity rendered in deep indigo and near-black, soft gaslight barely catching the curve of her jaw, haunting stillness, fully clothed",
  slow_burn:
    "cinematic adult animation, premium streaming-quality illustration, emotionally driven romance, golden-hour warmth, shallow depth of field, non-explicit, romantic realism — a Latina woman and a man with warm brown skin sitting close but not touching on a sun-bleached terrace in golden evening light, olive trees in soft blur behind them, amber haze, years of unspoken words visible in the charged inch of air between their hands on the stone table, fully clothed, tender restraint",
  emotional_desire:
    "cinematic adult animation, premium streaming-quality illustration, emotionally driven romance, soft morning light, filmic composition, non-explicit, romantic realism — two women in a sun-flooded bedroom, one with deep mahogany skin and natural coils, one with warm olive skin and dark hair, in a tender embrace, soft tears caught in morning light through sheer curtains, emotional vulnerability, clothed in soft linens, forehead to forehead",
  dominant_surrendered:
    "cinematic adult animation, premium streaming-quality illustration, emotionally driven romance, dramatic candlelit lighting, deep shadow contrast, non-explicit, romantic realism — a tall commanding Nigerian man in a tailored dark suit, standing in a candlelit room with strong overhead shadows, a woman looking up at him with unmistakable tension, clear power dynamic rendered through body language and light, no touching, charged emotional atmosphere, fully clothed, gold and ebony tones",
  late_night:
    "cinematic adult animation, premium streaming-quality illustration, emotionally driven romance, midnight blue lighting, neon reflections, non-explicit, romantic realism — a Middle Eastern man and an East Asian woman as near-silhouettes on a city rooftop at 3am, neon signs reflected in puddles far below, one looking at the other who looks at the skyline, electric quiet between them, city hum, fully clothed in dark coats, deep blue and magenta ambient light",
  second_chance:
    "cinematic adult animation, premium streaming-quality illustration, emotionally driven romance, autumn amber light, rain, non-explicit, romantic realism — an Indigenous woman and a man with warm medium-brown skin standing facing each other on a rain-wet doorstep after years apart, autumn leaves on wet stone, recognition flooding both their faces, hands not yet touching, amber street light catching rain on their faces, fully clothed, the weight of years between them",
  first_time:
    "cinematic adult animation, premium streaming-quality illustration, emotionally driven romance, warm indoor light, electric anticipation, non-explicit, romantic realism — a young Black woman with luminous deep brown skin and a man with golden-brown complexion meeting eyes across a warmly lit room for the first time, nervous electricity visible in their posture, other guests blurred in soft bokeh behind them, a glass held mid-air forgotten, fully clothed in evening wear, golden ambient warmth",
  explicit_collection:
    "cinematic film still, premium illustration, adult romantic drama — a woman with golden-brown skin in a luxurious penthouse suite at night, standing at a floor-to-ceiling window overlooking a glittering city, a dark-silhouetted figure of a man standing nearby, warm amber lamp light from behind, tension in the air, sophisticated and stylish, fully clothed in evening wear, non-explicit, atmospheric noir romance, deep shadows and warm highlights",
  historical_romance:
    "cinematic adult animation, premium streaming-quality illustration, period romance, Regency-era setting, candlelit ballroom, non-explicit, romantic realism — a Black woman in an exquisite ivory Regency gown with pearls and a high waist, standing in a candlelit ballroom, stealing a glance across the room at a tall man in dark Regency dress, period architecture and chandeliers in soft bokeh behind her, golden candlelight on her skin, fully clothed in period costume",
};

// Save to public/images/ — this is the SAME directory the server serves from
// at runtime (publicDir = path.resolve(__dirname_dist, "../public") which
// resolves to artifacts/api-server/public/).  This directory is NOT inside
// dist/ and is NOT wiped by the build.
const imagesDir = path.resolve(__dirname, "../public/images");
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const entries = Object.entries(CATEGORY_IMAGE_PROMPTS);
console.log(`Generating ${entries.length} category images...`);

let done = 0;
let failed = 0;

for (const [categoryId, prompt] of entries) {
  const filename = `category-${categoryId}.png`;
  const filepath = path.join(imagesDir, filename);

  process.stdout.write(`  [${done + failed + 1}/${entries.length}] ${categoryId}... `);

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const b64 = response.data?.[0]?.b64_json;
    const url = response.data?.[0]?.url;

    if (b64) {
      fs.writeFileSync(filepath, Buffer.from(b64, "base64"));
    } else if (url) {
      const fetch = (await import("node-fetch")).default;
      const imgRes = await fetch(url);
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync(filepath, buffer);
    } else {
      throw new Error("No image data in response");
    }

    done++;
    console.log(`✓ saved ${filename}`);
  } catch (err) {
    failed++;
    console.log(`✗ FAILED: ${err.message}`);
  }
}

console.log(`\nDone: ${done} generated, ${failed} failed.`);
