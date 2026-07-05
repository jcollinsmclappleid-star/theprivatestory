/**
 * Generate Act IV category hero art.
 * Style: approved restraint-bdsm + tension (painterly, NOT cartoon, NOT photo).
 * Characters: UNIQUE per category — never reuse faces from other Act IV images.
 *
 * Run: node scripts/generateExpressAct4Images.mjs [slug...]
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const apiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("ERROR: Set AI_INTEGRATIONS_OPENAI_API_KEY or OPENAI_API_KEY.");
  process.exit(1);
}

const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined;
const openai = new OpenAI({ apiKey, ...(baseUrl ? { baseURL: baseUrl } : {}) });

const STYLE =
  "cinematic adult animation, premium streaming-quality illustration, stylised digital illustration, painterly romantic art, emotionally driven After Dark erotica, soft cinematic lighting, warm amber and deep crimson shadow contrast, filmic composition, visible brushstroke texture, soft painterly edges, expressive illustrated faces with realistic proportions, premium romance novel cover illustration, mature sophisticated character art, intimate mood, hand-painted digital illustration with depth and texture, NOT cartoon, NOT flat animation, NOT anime, NOT photographic, NOT photorealistic";

const RULES =
  "Never depict Him & Him. Fully clothed, non-explicit, tasteful sensuality through atmosphere and expression. CRITICAL: use completely NEW and DIFFERENT characters — unique faces, hair, skin tones, and outfits; do not copy or reuse any person from restraint-bdsm or tension reference images.";

/** Unique cast per slug — keep in sync with src/lib/expressAct4Casts.ts */
const BRIEFS = {
  "restraint-bdsm": {
    cast: "Her & Him",
    skip: true,
    characters: "Black woman, natural coiled updo, gold earrings, red dress; shadowed man in dark suit",
    scene: "candlelit private club, crimson silk cord loosely at wrists, power exchange through gaze",
  },
  tension: {
    cast: "Her & Him",
    skip: true,
    characters: "Black woman, coiled updo, red backless gown; white man, dark hair, charcoal suit",
    scene: "art gallery after hours, inches apart, champagne, forbidden electricity",
  },
  "submission-worship": {
    cast: "Her & Him",
    characters: "East Asian woman, sleek black bob, ivory silk robe; Arab man, trimmed beard, white open-collar shirt",
    scene: "penthouse window at night, adoring gaze, her hand on his cheek",
  },
  "her-dominance": {
    cast: "Her & Him",
    characters: "South Asian woman, long dark hair, emerald black dress; Nordic man, blond stubble, grey suit",
    scene: "leather chair private study, she holds his chin, violet candlelight",
  },
  "desire-she": {
    cast: "Her solo",
    characters: "Latina woman, wavy chestnut hair, copper silk robe",
    scene: "vanity mirror candlelit bedroom, private longing expression",
  },
  "desire-he": {
    cast: "Her & Him",
    characters: "West African man, close-cropped hair, white shirt open at collar",
    scene: "rain-streaked window at night, restrained hunger, city neon",
  },
  "desire-they": {
    cast: "Her & Her",
    characters: "Indigenous woman, long black hair, copper gown; blonde woman, chignon, navy dress",
    scene: "rooftop bar after hours, close conversation, champagne, no men",
  },
  feel: {
    cast: "Her & Her",
    characters: "East Asian woman, short black hair; Black woman, shoulder-length locs",
    scene: "sun-flooded bedroom, forehead to forehead, soft linens, morning light",
  },
  "praise-words": {
    cast: "Her & Him",
    characters: "Middle Eastern woman, dark curls pinned up; Mediterranean man, olive skin",
    scene: "candlelit dinner, whisper near her ear, eyes closed, formal wear",
  },
  "dark-fantasy": {
    cast: "Her & Him",
    skip: true,
    characters: "White woman, blonde, black dress; white man, brown hair, open shirt",
    scene: "penthouse hotel suite city night, forbidden tension, no text",
  },
  "after-gala": {
    cast: "Her & Her",
    skip: true,
    characters: "Black woman, emerald gown; South Asian woman, midnight blue dress",
    scene: "hotel corridor after gala, champagne, stolen glance, no door text",
  },
  "penthouse-hotel-mf": {
    cast: "Her & Him",
    skip: true,
    characters: "White woman blonde black dress; white man brown hair open shirt",
    scene: "Luxury Hotel penthouse skyline night champagne",
  },
  "london-townhouse-mf": {
    cast: "Her & Him",
    skip: true,
    characters: "White woman auburn burgundy dress; white man dark hair shirtsleeves",
    scene: "London Chelsea townhouse rain study doorway reunion",
  },
  "private-yacht-mf": {
    cast: "Her & Him",
    skip: true,
    characters: "White woman blonde ivory dress; white man dark hair linen shirt",
    scene: "Private Yacht Monaco harbor night sundeck",
  },
  "office-after-hours-mf": {
    cast: "Her & Him",
    skip: true,
    characters: "White woman navy blazer dress; white man loosened tie seated",
    scene: "Office After Hours glass boardroom city night",
  },
  "adjoining-suites-mfm": {
    cast: "MFM",
    skip: true,
    characters: "White woman emerald dress; two white men tuxedos",
    scene: "Luxury Hotel adjoining doors corridor",
  },
  "caribbean-mfm": {
    cast: "MFM",
    skip: true,
    characters: "Tall Black man linen; white woman sundress; second man background",
    scene: "Caribbean beach house veranda sunset",
  },
  "her-her-bw": {
    cast: "Her & Her",
    skip: true,
    characters: "Black woman curls emerald slip; white woman auburn cream robe",
    scene: "hotel suite balcony night F+F closeness",
  },
  "elevator-mf": {
    cast: "Her & Him",
    skip: true,
    characters: "Ambiguous woman olive skin red dress; ambiguous man brown skin black shirt",
    scene: "glass elevator night city lights proximity",
  },
  "style-written": {
    cast: "Her & Him",
    characters: "Freckled auburn-haired woman; South Asian man with glasses, rolled shirtsleeves",
    scene: "four-poster bed, scattered books and pages, burgundy bedding, candlelight",
  },
  yours: {
    cast: "Her & Her",
    characters: "Afro-Latina woman, natural afro, gold hoops; Korean woman, straight black hair, cream slip",
    scene: "vanity mirror, pearl necklace, companion close behind, candlelight",
  },
  romance: {
    cast: "Her & Her",
    characters: "Black woman, box braids, linen dress; white woman, strawberry blonde updo, sage dress",
    scene: "villa terrace golden hour, seated close, olive trees, amber haze",
  },
  devotion: {
    cast: "MFM",
    characters: "Golden-brown woman, curly hair, emerald gown; bald Black man in tux; silver-haired white man in tux",
    scene: "candlelit club table, champagne, she commands attention, men not a couple",
  },
  plot: {
    cast: "Her & Him",
    characters: "Indigenous woman, rain-damp hair, wool coat; East Asian man, dark coat",
    scene: "rain-wet doorstep at night, recognition, hands almost touching, amber streetlamp",
  },
  scene: {
    cast: "MFM",
    characters: "Latina woman, dark ponytail, crimson dress; Middle Eastern man in tux; Black man in tux",
    scene: "VIP suite, city skyline, champagne, formal sophistication, attention on her",
  },
  ending: {
    cast: "Her & Him",
    characters: "White woman, red hair on pillow; Black man, soft fade haircut",
    scene: "dawn through curtains, facing each other in bed, tender smiles, intertwined fingers",
  },
};

function buildPrompt(brief) {
  return `${STYLE} — ${RULES} [${brief.cast}] Characters: ${brief.characters}. Scene: ${brief.scene}.`;
}

const imagesDir = path.resolve(__dirname, "../public/images");
const viteImagesDir = path.resolve(__dirname, "../../custom-audio-stories/public/images");

async function writeWebpCopies(pngPath, basename) {
  const webpName = basename.replace(/\.png$/i, ".webp");
  const buf = await sharp(pngPath).webp({ quality: 82, effort: 4 }).toBuffer();
  for (const dir of [imagesDir, viteImagesDir]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, webpName), buf);
  }
}

if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const filter = process.argv.slice(2);
const entries = Object.entries(BRIEFS).filter(
  ([slug]) => filter.length === 0 || filter.includes(slug),
);

console.log(`Generating ${entries.length} Act IV images (unique characters each)...`);

let done = 0;
let failed = 0;

for (const [slug, brief] of entries) {
  const filename = `express-act4-${slug}.png`;
  const filepath = path.join(imagesDir, filename);

  if (brief.skip && fs.existsSync(filepath)) {
    console.log(`  skip ${slug} (${brief.cast}) — approved asset`);
    try {
      await writeWebpCopies(filepath, filename);
    } catch { /* webp optional on skip */ }
    done++;
    continue;
  }

  process.stdout.write(`  [${done + failed + 1}/${entries.length}] ${slug} (${brief.cast})... `);

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: buildPrompt(brief),
      n: 1,
      size: "1536x1024",
    });

    const b64 = response.data?.[0]?.b64_json;
    const url = response.data?.[0]?.url;

    if (b64) {
      fs.writeFileSync(filepath, Buffer.from(b64, "base64"));
    } else if (url) {
      const res = await fetch(url);
      fs.writeFileSync(filepath, Buffer.from(await res.arrayBuffer()));
    } else {
      throw new Error("No image data in response");
    }

    if (!fs.existsSync(viteImagesDir)) fs.mkdirSync(viteImagesDir, { recursive: true });
    fs.copyFileSync(filepath, path.join(viteImagesDir, filename));
    await writeWebpCopies(filepath, filename);

    done++;
    console.log(`✓ ${filename} + .webp`);
  } catch (err) {
    failed++;
    console.log(`✗ ${err.message}`);
  }
}

console.log(`\nDone: ${done} ok, ${failed} failed.`);
