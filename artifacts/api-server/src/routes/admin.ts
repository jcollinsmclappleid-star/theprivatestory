import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { openrouter, MISTRAL_MODEL } from "../lib/openrouter.js";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { storiesStore, seriesStore } from "../lib/storage.js";
import { db } from "@workspace/db";
import { generatedStories } from "@workspace/db/schema";
import { eq, like, asc, and, sql } from "drizzle-orm";
import { buildPrompt, buildSeriesLayer, type StoryRegistryEntry } from "../lib/buildPrompt.js";
import { getArcStage } from "../lib/seriesArc.js";
import { getNonCustomSubthemes, STORY_CATEGORIES } from "../lib/storyCategories.js";
import { getStoryName } from "../lib/storyNames.js";
import {
  planStory,
  writeStoryFromBrief,
  qcStory,
  rewriteStory,
  buildImagePrompts,
  generateAllImages,
  getCacheKey,
  type GenerateStoryRequest,
} from "./generate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router: IRouter = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

/**
 * Derives the admin API key from the existing OPENROUTER_API_KEY secret via
 * HMAC-SHA256.  This means no additional plaintext secret lives in source or
 * env files — the key is computable only by anyone who already holds the
 * OPENROUTER_API_KEY.  Scripts can compute the same value with:
 *   node -e "const c=require('crypto');console.log(c.createHmac('sha256',process.env.OPENROUTER_API_KEY).update('private-story-admin-v1').digest('hex'))"
 */
function deriveAdminApiKey(): string {
  const base = process.env.OPENROUTER_API_KEY ?? "";
  if (!base) return "";
  return crypto.createHmac("sha256", base).update("private-story-admin-v1").digest("hex");
}

function isAdmin(req: any): boolean {
  if (!ADMIN_EMAIL) return false;
  // Session-based auth (web UI)
  const user = req.user as { email?: string } | undefined;
  if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return true;
  // Header-based auth for scripts — token must be HMAC-derived, never the email itself
  const token = req.headers["x-admin-token"] as string | undefined;
  if (!token) return false;
  const derived = deriveAdminApiKey();
  if (!derived) return false;
  const tBuf = Buffer.from(token, "utf8");
  const dBuf = Buffer.from(derived, "utf8");
  if (tBuf.length !== dBuf.length) return false;
  return crypto.timingSafeEqual(tBuf, dBuf);
}

function getPublicAudioDir(): string {
  const dir = path.resolve(__dirname, "../public/audio");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ── Robust story text extraction ────────────────────────────────────────────
// GPT wraps the DNA in ```json ... ``` blocks preceded by **STORY DNA** headers.
// This function strips all preamble/metadata and returns only the narrative prose.
function extractStoryParts(rawText: string): {
  cleanText: string;
  description: string;
  dna: Record<string, unknown>;
} {
  let dna: Record<string, unknown> = {};
  let description = "";

  // 1. Extract DNA from ```json ... ``` block
  const codeFencedJson = rawText.match(/```json\s*([\s\S]*?)\s*```/i);
  if (codeFencedJson) {
    try {
      dna = JSON.parse(codeFencedJson[1]);
    } catch {
      // Try the bare JSON fallback below
    }
  }

  // 2. Bare JSON fallback — finds the first {...} block containing "category"
  if (Object.keys(dna).length === 0) {
    // Match a JSON object spanning multiple lines
    const bareJson = rawText.match(/\{\s*"category"\s*:[\s\S]*?\n\}/m);
    if (bareJson) {
      try {
        dna = JSON.parse(bareJson[0]);
      } catch {
        // DNA parse failed — continue without structured DNA
      }
    }
  }

  // 3. Extract [HOOK]...[/HOOK]
  const hookMatch = rawText.match(/\[HOOK\]([\s\S]*?)\[\/HOOK\]/i);
  if (hookMatch) {
    description = hookMatch[1].trim();
  }

  // 4. Strip everything that is not narrative prose
  let clean = rawText;

  // Strip ```json ... ``` blocks (DNA)
  clean = clean.replace(/```json[\s\S]*?```/gi, "");
  // Strip any other code fences
  clean = clean.replace(/```[\s\S]*?```/gi, "");
  // Strip bare JSON DNA blocks — { "category": ... } spanning multiple lines
  clean = clean.replace(/\{\s*"category"\s*:[\s\S]*?\n\}/m, "");
  // Strip bare JSON registry blocks — { "stories": [...] } or similar arrays/objects from prior registry
  clean = clean.replace(/\{\s*"stories"\s*:[\s\S]*?\n\}/m, "");
  // Strip [HOOK] blocks
  clean = clean.replace(/\[HOOK\][\s\S]*?\[\/HOOK\]/gi, "");

  // ── NEW: Strip prompt structural markers echoed back by GPT ──

  // Strip ══ separator lines (any line that is mostly or entirely ═ characters)
  clean = clean.replace(/^[═\s]{3,}$/gm, "");
  // Strip PART 1/2/3 — labels (with or without bold markers)
  clean = clean.replace(/^\s*\*{0,2}PART\s+[123]\s*[—–-][^\n]*\*{0,2}\s*$/gim, "");
  // Strip phase headers: ESTABLISH / SIMMER / CRACK / IGNITE / RESONATE (standalone lines)
  clean = clean.replace(/^\s*\*{0,2}(?:ESTABLISH|SIMMER|CRACK|IGNITE|RESONATE)\s*[:\-—]?\s*\*{0,2}\s*$/gim, "");
  // Strip INTENSITY LEVEL N — lines
  clean = clean.replace(/^\s*\*{0,2}INTENSITY LEVEL\s+\d+\s*[—–\-][^\n]*\*{0,2}\s*$/gim, "");
  // Strip FORCED DNA FIELDS blocks — find the header and strip through the closing brace
  clean = clean.replace(/FORCED DNA FIELDS[\s\S]*?\n\}/gi, "");
  // Strip PRIOR STORY REGISTRY blocks
  clean = clean.replace(/PRIOR STORY REGISTRY[\s\S]*?\n\}/gi, "");
  // Strip WORLD-GROUNDING / VARIETY FORCING / ANTI-REPETITION / SEVEN MANDATORY HOOKS / SCENE ENTRY — section headers
  clean = clean.replace(/^\s*(?:WORLD-GROUNDING|VARIETY FORCING|ANTI-REPETITION|SEVEN MANDATORY|SCENE ENTRY|EROTIC ARCHITECTURE|IMMERSION RULES|SENSORY REQUIREMENTS|EXPLICIT CONTENT|BANNED WORDS|VOICE & DELIVERY)[^\n]*/gim, "");
  // Strip lines that are ALL-CAPS standalone headers (4+ uppercase words with no lowercase, ending in : or —)
  clean = clean.replace(/^\s*[A-Z][A-Z\s\-–—&\/]{8,}(?:[:—–])\s*$/gm, "");

  // ── Existing structural header stripping ──

  // Strip **STORY DNA** and similar markdown section headers
  clean = clean.replace(/\*{1,2}STORY DNA\*{1,2}[^\n]*/gi, "");
  // Strip **FULL STORY:** / **[Story begins...]** / **[Generating DNA...]** headers
  clean = clean.replace(/\*{1,2}\[?(?:FULL STORY|Story begins|Generating DNA)[^\n]*\*{1,2}[^\n]*/gi, "");
  // Strip standalone **STORY TITLE: ...** lines
  clean = clean.replace(/\*{1,2}STORY TITLE[^\n]*\*{1,2}[^\n]*/gi, "");
  // Strip lines that are purely markdown bold headers (e.g. **Something:**)
  clean = clean.replace(/^\s*\*{1,2}[A-Z][^*\n]{0,60}\*{1,2}\s*:?\s*$/gm, "");
  // Strip "Understood. Generating..." or "Generating the STORY DNA first:" preambles
  clean = clean.replace(/^[^\n]*(?:Generating|Understood)[^\n]*(?:DNA|story)[^\n]*/gim, "");
  // Strip --- or === horizontal rules
  clean = clean.replace(/^[-=]{3,}\s*$/gm, "");
  // Collapse excess blank lines
  clean = clean.replace(/\n{3,}/g, "\n\n").trim();

  return { cleanText: clean, description, dna };
}

// ── TTS: Split long text into ≤4096-char chunks, narrate each, concatenate ──
// Splits on sentence boundaries so the narrator doesn't cut off mid-sentence.
function splitIntoTtsChunks(text: string, maxChars = 4000): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining);
      break;
    }

    // Try to split at a sentence end within the window
    const window = remaining.slice(0, maxChars);
    const lastBreak = Math.max(
      window.lastIndexOf(". "),
      window.lastIndexOf(".\n"),
      window.lastIndexOf("! "),
      window.lastIndexOf("?\n"),
      window.lastIndexOf("? ")
    );

    const splitAt = lastBreak > maxChars * 0.5 ? lastBreak + 1 : maxChars;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  return chunks;
}

// Prepare story text for TTS — strip all markdown formatting
function prepareForTts(text: string): string {
  return text
    .replace(/^#{1,6}\s*/gm, "")  // Strip heading markers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")  // Strip bold/italic, keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")   // Strip links, keep label
    .replace(/^\s*[-*+]\s+/gm, "")            // Strip bullet points
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function generateFullAudio(text: string): Promise<Buffer> {
  const prepared = prepareForTts(text);
  const chunks = splitIntoTtsChunks(prepared, 4000);

  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const response = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "nova",
      input: chunk,
      response_format: "mp3",
      speed: 0.92,
    });
    buffers.push(Buffer.from(await response.arrayBuffer()));
  }

  return Buffer.concat(buffers);
}

// ---------------------------------------------------------------------------
// GET /admin/categories — all non-custom subthemes for batch queue
// ---------------------------------------------------------------------------

router.get("/categories", (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const items = getNonCustomSubthemes().map(({ category, subtheme }) => ({
    categoryId: category.id,
    categoryName: category.name,
    categoryIcon: category.icon,
    subthemeId: subtheme.id,
    subthemeName: subtheme.name,
    intensity: subtheme.intensity,
    tags: subtheme.tags,
  }));
  res.json({ items, total: items.length });
});

// ---------------------------------------------------------------------------
// GET /admin/verify-library — live verification of 40-story library invariants
// ---------------------------------------------------------------------------

router.get("/verify-library", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const rows = await db
    .select({
      id: generatedStories.id,
      categoryId: generatedStories.categoryId,
      subthemeId: generatedStories.subthemeId,
      title: generatedStories.title,
      status: generatedStories.status,
      storyDna: generatedStories.storyDna,
      sceneChars: sql<number>`length(${generatedStories.scenes}::text)`,
    })
    .from(generatedStories)
    .where(and(like(generatedStories.id, "lib-%"), eq(generatedStories.isLibraryStory, true)))
    .orderBy(asc(generatedStories.categoryId), asc(generatedStories.subthemeId));

  const expected = getNonCustomSubthemes();
  const foundSubthemes = new Set(rows.map(r => `${r.categoryId}/${r.subthemeId}`));
  const missingSubthemes = expected
    .filter(e => !foundSubthemes.has(`${e.category.id}/${e.subtheme.id}`))
    .map(e => `${e.category.id}/${e.subtheme.id}`);

  const allPublished = rows.every(r => r.status === "published");

  const MIN_CHARS = 10_000;
  const underMinLength = rows.filter(r => r.sceneChars < MIN_CHARS).map(r => ({
    id: r.id, chars: r.sceneChars,
  }));

  let dnaAdjacencyViolations = 0;
  const violations: Array<{ a: string; b: string; dna: string }> = [];
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i], b = rows[i + 1];
    const aDna = a.storyDna as Record<string, string> | null;
    const bDna = b.storyDna as Record<string, string> | null;
    const aPD = aDna?.power_dynamic, aEE = aDna?.emotional_engine;
    const bPD = bDna?.power_dynamic, bEE = bDna?.emotional_engine;
    if (aPD && bPD && aPD === bPD && aEE === bEE) {
      dnaAdjacencyViolations++;
      violations.push({ a: a.id, b: b.id, dna: `${aPD}+${aEE}` });
    }
  }

  const pass = rows.length === expected.length && allPublished && missingSubthemes.length === 0
    && underMinLength.length === 0 && dnaAdjacencyViolations === 0;

  res.json({
    pass,
    totalStories: rows.length,
    expectedStories: expected.length,
    allPublished,
    missingSubthemes,
    underMinLength,
    dnaAdjacencyViolations,
    violations,
    verifiedAt: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// GET /admin/library — list library stories with optional status filter
// ---------------------------------------------------------------------------

router.get("/library", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const status = (req.query.status as string) || undefined;
  try {
    const stories = await storiesStore.getLibraryStories(status);
    res.json({ stories, total: stories.length });
  } catch {
    res.status(500).json({ error: "Failed to fetch library stories" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /admin/stories/:id/status — approve or skip a draft story
// ---------------------------------------------------------------------------

router.patch("/stories/:id/status", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { id } = req.params;
  const { status } = req.body as { status: "published" | "skipped" };
  if (!["published", "skipped"].includes(status)) {
    res.status(400).json({ error: "status must be published or skipped" });
    return;
  }
  try {
    await storiesStore.updateStatus(id, status as "published" | "skipped");
    res.json({ ok: true, id, status });
  } catch {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// ---------------------------------------------------------------------------
// POST /admin/generate-one — generate one library story, streamed via SSE
// ---------------------------------------------------------------------------

router.post("/generate-one", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { categoryId, subthemeId, intensity } = req.body as {
    categoryId: string;
    subthemeId: string;
    intensity?: number;
  };

  if (!categoryId || !subthemeId) {
    res.status(400).json({ error: "categoryId and subthemeId are required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const priorDna = await storiesStore.getRecentDna(20);
    const storyId = `lib-${categoryId}-${subthemeId}-${crypto.randomBytes(6).toString("hex")}`;

    const prompt = buildPrompt(categoryId, subthemeId, null, {
      intensity: intensity ?? 3,
      priorStoryRegistry: priorDna as StoryRegistryEntry[],
    });

    if (!prompt) {
      send("error", { message: "Invalid category or subtheme" });
      res.end();
      return;
    }

    // Look up title BEFORE generation so GPT writes a story that earns it
    const categoryName = STORY_CATEGORIES.find(c => c.id === categoryId)?.name ?? prompt.metadata.category;
    const title = getStoryName(categoryId, subthemeId, categoryName);

    // Inject title into system prompt so the story is written to match it
    const systemWithTitle = `${prompt.system}\n\nSTORY TITLE: "${title}"\nYou are writing a story with this exact title. Every scene, character choice, and emotional beat must earn this title. The story should feel like it could only ever have this name.`;

    send("status", {
      phase: "prompt_ready",
      storyId,
      system_prompt: systemWithTitle,
      user_prompt: prompt.user,
      metadata: prompt.metadata,
    });

    // ── Step 1: Write story text via Mistral (OpenRouter — avoids Azure content filter) ──
    send("status", { phase: "writing_story", message: "Mistral writing story…" });

    const storyCompletion = await openrouter.chat.completions.create({
      model: MISTRAL_MODEL,
      temperature: 0.9,
      max_tokens: 8000,
      messages: [
        { role: "system", content: systemWithTitle },
        { role: "user", content: prompt.user },
      ],
    });

    const rawStoryText = storyCompletion.choices[0]?.message?.content ?? "";
    const finishReason = storyCompletion.choices[0]?.finish_reason;
    const usage = storyCompletion.usage;
    console.error(`[GENERATION] finish_reason=${finishReason} | input=${usage?.prompt_tokens} tokens | output=${usage?.completion_tokens} tokens | chars=${rawStoryText.length}`);
    console.error(`[GENERATION] Raw preview (first 300 chars): ${rawStoryText.slice(0, 300)}`);

    // ── Detect content filter refusals ────────────────────────────────────
    const isRefusal =
      (usage?.completion_tokens ?? 0) < 30 &&
      /^(I'?m sorry|I'?m unable|I cannot|I can'?t|Unfortunately,?\s+I)/i.test(rawStoryText.trim());

    if (isRefusal) {
      console.error(`[GENERATION] Content filter refusal detected for ${categoryId}/${subthemeId}`);
      send("error", {
        phase: "content_refused",
        message: `OpenAI declined to generate this story category. Try a different subtheme, or retry — refusals are sometimes intermittent.`,
        categoryId,
        subthemeId,
        storyId,
      });
      return;
    }

    // ── Guard against very short / failed outputs ─────────────────────────
    if (rawStoryText.length < 500) {
      console.error(`[GENERATION] Story too short (${rawStoryText.length} chars) — likely a partial failure`);
      send("error", {
        phase: "generation_incomplete",
        message: `Story generation returned incomplete content (${rawStoryText.length} chars). Please retry.`,
        categoryId,
        subthemeId,
        storyId,
      });
      return;
    }

    // Extract DNA, description (HOOK), and clean story text
    const { cleanText: cleanStoryText, description: extractedDescription, dna: storyDna } =
      extractStoryParts(rawStoryText);

    // Fall back description if GPT didn't emit a [HOOK] block
    const description = extractedDescription || `A ${categoryName.toLowerCase()} story. Press play.`;

    send("status", { phase: "story_written", title, description, dna: storyDna });

    // ── Step 2: Cover image — skipped during draft generation ────────────
    // Images are generated only when a story is published (saves ~$0.08/story)
    const coverImageUrl = "";

    // ── Step 3: Audio — skipped during draft generation ──────────────────
    // Audio is generated only when a story is published (saves ~$0.40/story)
    const audioUrl = "";

    // ── Step 4: Persist as draft ──────────────────────────────────────────
    send("status", { phase: "saving", message: "Saving draft…" });

    await storiesStore.set(storyId, {
      id: storyId,
      title,
      description,
      mood: prompt.metadata.mood,
      duration: "15-25 min",
      audioUrl,
      scenes: [
        {
          id: 1,
          heading: title,
          text: cleanStoryText,
          visualPrompt: "",
          durationEstimate: 0,
        },
      ],
      images: { cover: coverImageUrl, scenes: [] },
      brief: {},
      recommendation_tags: prompt.metadata.tags,
      categoryId,
      subthemeId,
      isLibraryStory: true,
      status: "draft",
      storyDna,
      ownerUserId: null,
    });

    send("complete", {
      storyId,
      title,
      description,
      coverImageUrl,
      hasAudio: !!audioUrl,
      categoryId,
      subthemeId,
      dna: storyDna,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    console.error("[generate-one] Fatal error:", err);
    send("error", { message });
  }

  res.end();
});

// ---------------------------------------------------------------------------
// POST /admin/generate-one-sync — generate one story, return JSON (for scripts)
// ---------------------------------------------------------------------------

router.post("/generate-one-sync", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { categoryId, subthemeId, intensity } = req.body as {
    categoryId: string;
    subthemeId: string;
    intensity?: number;
  };

  if (!categoryId || !subthemeId) {
    res.status(400).json({ error: "categoryId and subthemeId are required" });
    return;
  }

  try {
    const priorDna = await storiesStore.getRecentDna(20);
    const storyId = `lib-${categoryId}-${subthemeId}-${crypto.randomBytes(6).toString("hex")}`;

    const prompt = buildPrompt(categoryId, subthemeId, null, {
      intensity: intensity ?? 3,
      priorStoryRegistry: priorDna as StoryRegistryEntry[],
    });

    if (!prompt) {
      res.status(400).json({ error: "Invalid category or subtheme" });
      return;
    }

    const categoryName = STORY_CATEGORIES.find(c => c.id === categoryId)?.name ?? prompt.metadata.category;
    const title = getStoryName(categoryId, subthemeId, categoryName);

    const systemWithTitle = `${prompt.system}\n\nSTORY TITLE: "${title}"\nYou are writing a story with this exact title. Every scene, character choice, and emotional beat must earn this title. The story should feel like it could only ever have this name.`;

    const MIN_WORDS = 2000;
    const MAX_ATTEMPTS = 3;

    let cleanStoryText = "";
    let extractedDescription = "";
    let storyDna: unknown = {};

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      console.error(`[seed] Attempt ${attempt}/${MAX_ATTEMPTS}: ${categoryId}/${subthemeId} — "${title}"`);

      const lengthReminder = attempt === 1
        ? "\n\nYour story MUST be at least 2,000 words of narrative prose. Do not stop before completing all five phases."
        : `\n\nCRITICAL: Your previous attempt was too short. This story MUST be 2,000+ words. Write each phase in full. Do not summarise or compress. Write slowly and fully.`;

      const storyCompletion = await openrouter.chat.completions.create({
        model: MISTRAL_MODEL,
        temperature: 0.9,
        max_tokens: 10000,
        messages: [
          { role: "system", content: systemWithTitle },
          { role: "user", content: prompt.user + lengthReminder },
        ],
      });

      const rawStoryText = storyCompletion.choices[0]?.message?.content ?? "";
      const finishReason = storyCompletion.choices[0]?.finish_reason;
      const words = rawStoryText.split(/\s+/).filter(Boolean).length;
      console.error(`[seed] attempt=${attempt} finish_reason=${finishReason} words=${words}`);

      const parts = extractStoryParts(rawStoryText);
      const partWords = parts.cleanText.split(/\s+/).filter(Boolean).length;

      if (partWords >= MIN_WORDS) {
        cleanStoryText = parts.cleanText;
        extractedDescription = parts.description;
        storyDna = parts.dna;
        break;
      }

      console.error(`[seed] attempt=${attempt} too short (${partWords}w < ${MIN_WORDS}w), retrying...`);

      if (attempt === MAX_ATTEMPTS) {
        console.error(`[seed] Hard fail: still under ${MIN_WORDS}w after ${MAX_ATTEMPTS} attempts (${partWords}w)`);
        res.status(500).json({
          error: `Story too short after ${MAX_ATTEMPTS} attempts`,
          finalWords: partWords,
          minRequired: MIN_WORDS,
        });
        return;
      }
    }

    if (!cleanStoryText || cleanStoryText.length < 200) {
      res.status(500).json({ error: "Story generation failed", chars: cleanStoryText.length });
      return;
    }

    const description = extractedDescription || `A ${categoryName.toLowerCase()} story. Press play.`;

    await storiesStore.set(storyId, {
      id: storyId,
      title,
      description,
      mood: prompt.metadata.mood,
      duration: "15-25 min",
      audioUrl: "",
      scenes: [{ id: 1, heading: title, text: cleanStoryText, visualPrompt: "", durationEstimate: 0 }],
      images: { cover: "", scenes: [] },
      brief: {},
      recommendation_tags: prompt.metadata.tags,
      categoryId,
      subthemeId,
      isLibraryStory: true,
      status: "published",
      storyDna,
      ownerUserId: null,
    });

    console.error(`[seed] Saved: ${storyId}`);
    res.json({ ok: true, storyId, title, categoryId, subthemeId, chars: cleanStoryText.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    console.error("[generate-one-sync] Fatal error:", err);
    res.status(500).json({ error: message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /admin/story/:id — delete a story by ID
// ---------------------------------------------------------------------------

router.delete("/story/:id", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { id } = req.params;
  await db.delete(generatedStories).where(eq(generatedStories.id, id));
  res.json({ ok: true, deleted: id });
});

// ---------------------------------------------------------------------------
// Series catalog — 5 pre-defined premium series (named characters, third-person)
// ---------------------------------------------------------------------------

interface SeriesEpisodeDef {
  title: string;
  hook: string;
  scenarioPrompt: string;
  characterContext?: string;
  dynamic?: string;
  intensity: string;
}

interface SeriesDef {
  id: string;
  title: string;
  description: string;
  mood: string;
  tags: string[];
  seriesArc: string;
  voiceFeel: string;
  femaleLead: string;
  maleLead: string;
  episodes: SeriesEpisodeDef[];
}

const SERIES_CATALOG: SeriesDef[] = [
  // ─── MIDNIGHT AUTHORITY ────────────────────────────────────────────────────
  {
    id: "midnight-authority",
    title: "Midnight Authority",
    description: "Marcus Kane has never met resistance he could not dismantle. Naomi Clarke arrives as his new VP and refuses to be managed. Five episodes of boardroom power, slow heat, and the specific surrender of two people who are used to winning.",
    mood: "Forbidden",
    tags: ["dominant-man", "CEO", "power-play", "office", "series"],
    femaleLead: "Naomi Clarke — 34, new VP at Kane Industries, Manhattan. Spent her career being underestimated and using it. Did not come here to be managed. She surrenders when she chooses to — and that choice feels like the most powerful thing either of them has ever done.",
    maleLead: "Marcus Kane — 42, Black CEO of Kane Industries, 6ft3in, custom-tailored suits, close-cut beard. Low unhurried voice. A stillness that makes rooms reorganise around him. Dominant but never cruel. Precise. Signature line: I don't chase. But I will make it impossible for you to walk away.",
    seriesArc: "Naomi Clarke is Marcus Kane's new VP — the first person to walk through his walls without asking permission. A slow dismantling of two people used to winning. By episode five the question isn't who has the power — it's whether power matters at all when you're this lost in someone.",
    voiceFeel: "Deep Voice",
    episodes: [
      {
        title: "The New Variable",
        hook: "He's already in the room when Naomi arrives. Standing at the window, not watching the door — and somehow that's worse.",
        scenarioPrompt: "Write Episode 1 of Midnight Authority in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Naomi Clarke, 34, new VP at Kane Industries. SETTING: 40th floor boardroom, Manhattan morning. EPISODE: Naomi's first board meeting. Marcus doesn't acknowledge her arrival — the deliberate non-acknowledgement is its own kind of attention. During the meeting he challenges her presentation precisely, not rudely. She matches him point for point. The room notices he's smiling. When everyone files out he doesn't. A single exchange — professional on the surface, charged beneath. She leaves. In the elevator her hands aren't steady. END: Cut before she finishes the thought about what just happened.",
        characterContext: "NAOMI CLARKE protagonist. Follow her interiority: what she notices about Marcus Kane, what she files away, what she tries not to notice. His desire shown through subtext — attention, precision, the way he occupies space near her. No physical contact. The tension IS the explicit content.",
        dynamic: "boardroom power play, first-meeting psychological tension, no physical contact",
        intensity: "Heated",
      },
      {
        title: "After Hours",
        hook: "His assistant sends the dinner invitation at 6pm for 8pm. No question mark. Naomi spends forty minutes deciding whether to be insulted.",
        scenarioPrompt: "Write Episode 2 of Midnight Authority in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Naomi Clarke. CALLBACK: Open with her replaying the unfinished thought from episode one's elevator. EPISODE: A dinner invitation phrased as a statement. Private dining room — he ordered for both of them. He asks questions about her, not her work. She answers more than she means to. Walking out: his hand at the small of her back — standard, social, except the pressure is slightly more than necessary. His car, city at night. Something he says makes clear she's been occupying his thoughts specifically. Inside her apartment, coat still on, back against the door — she can still feel exactly where his hand was.",
        characterContext: "NAOMI CLARKE protagonist. The hand at her back: minimum 100 words on this single moment — location, pressure, warmth, intention. His professional mask slipping briefly then back. Her body remembering what her mind is still negotiating.",
        dynamic: "first physical contact, sensory rendering of touch, proximity and restrained desire",
        intensity: "Heated",
      },
      {
        title: "The Terms",
        hook: "He calls at 11pm. Naomi picks up on the second ring.",
        scenarioPrompt: "Write Episode 3 of Midnight Authority in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Naomi Clarke. CALLBACK: Open with her carrying the physical memory of his hand from episode two. EPISODE: He calls at 11pm and says exactly what he wants — not a question, a declaration, delivered with complete calm. She doesn't surrender — she negotiates. Her terms, his terms. She goes to his office at midnight. Empty building. City lights. He doesn't move toward her — he lets her cross to him. The first real kiss — long, deliberate. Then he stops. He wants her to come back tomorrow and choose this again in daylight. This is the most dominant thing he's done. She takes the elevator alone. Her mouth still has the memory of him. He said: tomorrow. Like it was already decided.",
        characterContext: "NAOMI CLARKE protagonist. The kiss: 300 words minimum, fully sensory. His reason for stopping must feel like power not rejection — must increase rather than decrease desire. One moment his composure almost breaks — she sees it. END: She has made the decision. She hasn't acted on it yet.",
        dynamic: "explicit phone negotiation, first kiss fully rendered, stop that increases desire",
        intensity: "Explicit",
      },
      {
        title: "Full Authority",
        hook: "Naomi told herself last night was enough. She stopped telling herself things when she walked into his building.",
        scenarioPrompt: "Write Episode 4 of Midnight Authority in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Naomi Clarke. CALLBACK: Open at the moment of crossing — she decided in episode three; episode four is execution, no second-guessing. EPISODE: She came back. He's waiting. What he says when he sees her earns her being there. His penthouse. City below. Full payoff of everything held back. He is exactly what the tension promised — dominant, precise, completely focused on Naomi specifically. Not a woman. Her. Afterward he holds her — this is the most dangerous thing, the softness under the authority. She's awake in the dark, his arm across her, calculating. The math keeps coming out the same way. She doesn't move. That's new.",
        characterContext: "NAOMI CLARKE protagonist. Full explicit content — his desire for Naomi specifically must be stated and demonstrated. The surrender must feel empowering not diminishing. The after — him holding her — minimum 200 words. Plant one thing in the after that creates episode five's tension.",
        dynamic: "full explicit payoff, dominant-surrendered, emotional revelation in the aftermath",
        intensity: "Scorching",
      },
      {
        title: "The Real Terms",
        hook: "Three weeks. Neither of them has named it. Naomi has been telling herself that's fine.",
        scenarioPrompt: "Write Episode 5 of Midnight Authority in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Naomi Clarke. CALLBACK: Open in the aftermath of episode four — time has passed; something has changed; neither has named it. EPISODE: Three weeks of this — professional in public, everything else in private, nothing defined. She forces the definition. He gives his real answer for the first time — not the strategic one, the true one. First time she's seen him unmanaged. A second intimate scene: slower, more equal than episode four, the dynamic shifted toward partnership. After — new terms. Neither uses the word but both know what they're agreeing to. He says her name — just Naomi — like it's the only negotiation that ever mattered. END: Leave one door open. Final line must make the listener want a second series.",
        characterContext: "NAOMI CLARKE protagonist. His real answer: first genuinely uncontrolled moment — it must cost him visibly. The intimate scene different in quality from episode four — slower, more equal, intimate rather than dominant. His desire for her specifically — use her name, her specific qualities.",
        dynamic: "emotional peak, vulnerable revelation, intimate explicit scene, relationship named without the word",
        intensity: "Scorching",
      },
    ],
  },

  // ─── LA REINA ──────────────────────────────────────────────────────────────
  {
    id: "la-reina",
    title: "La Reina",
    description: "Isabella Reyes runs a hotel empire with complete authority. When American architect Daniel Cole arrives in Havana, she decides she wants him. Getting him is a different story. Five episodes of strategic seduction, unexpected resistance, and a dominant woman undone.",
    mood: "Forbidden",
    tags: ["dominant-woman", "seductive", "power", "hotel", "series"],
    femaleLead: "Isabella Reyes — 38, heir to Grupo Reyes hotel empire, Havana. Dominant, strategic, accustomed to getting what she decides she wants. Her desire has always been an extension of her authority. Daniel is the first thing that doesn't move on schedule.",
    maleLead: "Daniel Cole — 36, American architect, hired to restore Hotel Palacio Reyes. Quiet, unhurried. Looks at her buildings like he loves them. Responds rather than initiates — until episode four, when he initiates with a completeness that rewrites everything.",
    seriesArc: "Isabella Reyes has run everything she has ever wanted. Daniel Cole is the first thing that refuses to be run. A series about a dominant woman encountering genuine stillness — and what happens when she stops managing.",
    voiceFeel: "Confident Voice",
    episodes: [
      {
        title: "The Architect Arrives",
        hook: "He's in her courtyard with his hands on the original tilework, completely absorbed. Isabella watches from above before going down.",
        scenarioPrompt: "Write Episode 1 of La Reina in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Isabella Reyes, 38. SETTING: Hotel Palacio Reyes, Havana, 1920s architecture, salt air, bougainvillea. EPISODE: His arrival. Isabella watches from her office window before introducing herself — descending to him rather than summoning him up. First conversation: professional, but she's already assessing. He doesn't perform for her. She finds this, against expectation, compelling. END: Isabella at her desk alone, a decision forming that she would describe as practical and is not. She opens his file. She looks at his photograph. She closes it. She thinks: straightforward. Cut.",
        characterContext: "ISABELLA REYES protagonist — she is the aggressor, the one deciding. Write her desire from the inside, with full authority. Her physical assessment of him, the specific things she notices, the moment categorisation stops working. No contact.",
        dynamic: "dominant woman assessing, psychological desire without contact, decision forming",
        intensity: "Heated",
      },
      {
        title: "The First Move",
        hook: "Isabella invited him to dinner at her home. He came. He didn't perform. This was the problem.",
        scenarioPrompt: "Write Episode 2 of La Reina in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Isabella Reyes. CALLBACK: Open with Isabella carrying the decision formed at end of episode one. EPISODE: She invites him to dinner — a statement, and he knows it. He brings wine that shows he paid attention to something she mentioned in passing. She deploys every tool — the setting, deliberate casual dress, conversation she controls. He engages without being managed. He disagrees with her about something architectural and is completely correct and doesn't soften it. She finds this unexpectedly the most attractive thing all week. She touches his hand across the table — deliberate, a test. He looks at her hand, then at her face, and says: Isabella. Just her name. Not a question. He leaves at midnight. She stands in her hallway in the dark and thinks about how he said her name.",
        characterContext: "ISABELLA REYES protagonist. Her interiority during the hand touch: the expectation that he'd respond to her move and the disorientation of being met with stillness instead. First touch: 100 words minimum on her physical experience.",
        dynamic: "dominant woman pursuing, first contact and its redirection, desire complicated by resistance",
        intensity: "Heated",
      },
      {
        title: "La Reina's Terms",
        hook: "Isabella is done with subtlety. She goes to the site — workers gone, the half-restored ballroom.",
        scenarioPrompt: "Write Episode 3 of La Reina in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Isabella Reyes. CALLBACK: Open with Isabella carrying the specific disorientation from the end of episode two — how he said her name. EPISODE: She tells him directly what she wants. He listens to everything. He puts down his drawings. He crosses to her — slowly, unhurried. Stops close enough she has to manage her breathing. He says: I know what you want, Isabella. Then: but I finish what I start. He touches her face — one hand at her jaw, tilting her face up — and says: I'm not finished with this building yet. He steps back. He picks up his drawings. Isabella stands in the ballroom of her own hotel and genuinely does not know what just happened. END: He's still looking at his drawings. She's still standing there. She will come back tomorrow. She hasn't left yet.",
        characterContext: "ISABELLA REYES protagonist. The moment he touches her face: 300 words minimum, complete sensory rendering. Her interiority during his response: disorientation, want, the specific experience of a dominant woman encountering genuine resistance for the first time. END: She has made the decision. She hasn't told him yet.",
        dynamic: "power inversion, first significant physical contact fully rendered, dominant woman encountering stillness",
        intensity: "Explicit",
      },
      {
        title: "His Move",
        hook: "He finished the ballroom. Then he came for her.",
        scenarioPrompt: "Write Episode 4 of La Reina in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Isabella Reyes. CALLBACK: Open at the moment of crossing — Isabella decided in episode three; episode four is execution. EPISODE: He comes to her office at end of day — unannounced. The ballroom is finished. Now he's finished with the building. He crosses to her desk. Takes her hand and brings her to stand. Leads her to the window — her city, her view. Stands behind her, close, and describes what he sees. Not the city — her. What he's observed. What he wants. He is explicit and unhurried and completely certain. When she turns to face him he is already there. Full payoff. He leads. Isabella Reyes lets him lead — and it is the most powerful thing she has ever done. After: he is asleep in her bed, her room, her empire around him, and he looks completely at home.",
        characterContext: "ISABELLA REYES protagonist. Full explicit content. His desire for Isabella specifically — overwhelming and personal. Her experience of surrender as expansion not diminishment. Fully rendered, completely sensory, emotionally complex. Plant one thing in the after that creates episode five's tension.",
        dynamic: "full explicit payoff, power dynamic shift, dominant woman choosing surrender",
        intensity: "Scorching",
      },
      {
        title: "What La Reina Keeps",
        hook: "His last morning. Isabella has a speech prepared — gracious, warm, final.",
        scenarioPrompt: "Write Episode 5 of La Reina in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Isabella Reyes. CALLBACK: Open in the aftermath of episode four — time has passed; something has been decided that has not been spoken. EPISODE: His last morning. She has a gracious, warm, final speech prepared. He comes for coffee and doesn't behave like someone leaving. She gives him the speech. He listens. He pours more coffee. He says: that was a good speech. He asks her one question the speech didn't account for. She doesn't answer for a long time. A final intimate scene — different from episode four, entirely led by Isabella, on her terms, in her space, with full knowledge of what she's choosing. After: she says one thing. He stays. END: He puts his passport back in her drawer. Such a small gesture. She watches from the doorway and thinks: I have kept everything I have ever decided to keep. I have decided. Final line must make the listener want a second series.",
        characterContext: "ISABELLA REYES protagonist. The final intimate scene led entirely by Isabella — her authority fully reclaimed but transformed. Not control for its own sake but desire chosen consciously. Final line must make the listener want a second series.",
        dynamic: "dominant woman reclaiming authority through choice, intimate explicit scene, open ending",
        intensity: "Scorching",
      },
    ],
  },

  // ─── THE ARRANGEMENT ───────────────────────────────────────────────────────
  {
    id: "the-arrangement",
    title: "The Arrangement",
    description: "Sophia Voss married Ethan Blackwell to save her family's company. He married her to close a deal. The arrangement was clean and professional — until they had to share a house.",
    mood: "Slow Burn",
    tags: ["billionaire", "arranged-marriage", "slow-burn", "enemies-to-lovers", "series"],
    femaleLead: "Sophia Voss — 32, made this choice with her eyes open. She didn't know what it would feel like to live at close range with someone who looks at her like that when he thinks she isn't looking. She doesn't want to want him. This makes her wanting him considerably worse.",
    maleLead: "Ethan Blackwell — 40, Anglo-American, 6ft2in. Precise, economical — says less than he means. Married strategically because he married young for love and it was the worst decision of his life. Sophia is a variable his model didn't account for. Restrained to the point of pain — and then, in episode four, not restrained at all.",
    seriesArc: "A marriage of convenience. Two people who meant to keep it professional, actually living together, discovering the person they married is inconveniently impossible to ignore. By episode five the contract is irrelevant.",
    voiceFeel: "Deep Voice",
    episodes: [
      {
        title: "The Terms of the Marriage",
        hook: "Moving in day. They have a protocol. Sophia has memorised the protocol.",
        scenarioPrompt: "Write Episode 1 of The Arrangement in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Sophia Voss, 32. SETTING: Kensington house, London — large enough for two people not to see each other and somehow never manages it. EPISODE: Moving in day. Protocol: separate rooms, shared public appearances, no questions about private lives. He shows her the house room by room. When he shows her the kitchen he makes coffee without asking how she takes it and gets it exactly right. She doesn't comment. At dinner — contractual — he asks her one question about something other than business. She answers. He listens in a way that makes her feel like the only information source in the world. She asks why he really did this. He tells her the partial truth. She recognises it as partial. That night, across the house from him, she thinks about the coffee. About how he knew. END: That thought — she doesn't finish it. Cut.",
        characterContext: "SOPHIA VOSS protagonist. Domestic intimacy as psychological charge. The specific details she notices, the inventory she's building of him without meaning to. No contact — intimacy entirely in the specificity of shared space.",
        dynamic: "arranged-marriage tension, domestic intimacy, psychological attraction with no acknowledgement",
        intensity: "Heated",
      },
      {
        title: "Public Property",
        hook: "A charity gala. Black tie, industry crowd. This is what they're for.",
        scenarioPrompt: "Write Episode 2 of The Arrangement in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Sophia Voss. CALLBACK: Open with Sophia carrying the unfinished thought from episode one. EPISODE: A charity gala. In public he's attentive in exactly the way a husband should be — hand at her back, leaning down to speak privately, laughing at the right moments. Sophia knows it's performance and her body doesn't care. In the car home: silence. He says something honest about the evening she wasn't expecting. She responds honestly. He takes her hand — ostensibly because they pass a photographer, but the photographer is gone before he releases it. At the door of her room he stops. Looks at her for three seconds longer than the situation requires. Says goodnight. Goes to his room. She stands at her closed door for a long time.",
        characterContext: "SOPHIA VOSS protagonist. His hand at her back: fully sensory. The hand-holding in the car. The three seconds at her door. Minimum 100 words on the physical experience of his hand she's still feeling after the door closes.",
        dynamic: "public performance bleeding into private contact, proximity, restrained desire",
        intensity: "Heated",
      },
      {
        title: "A Breach of Contract",
        hook: "She finds him in the library at midnight. She couldn't sleep either. Neither comments.",
        scenarioPrompt: "Write Episode 3 of The Arrangement in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Sophia Voss. CALLBACK: Open with Sophia carrying the physical memory of his hand from episode two. EPISODE: Library at midnight. They talk for two hours about things neither has talked about with anyone. Around 2am he moves to sit beside her rather than across. She doesn't move away. He says: this isn't in the contract. She says: no. He kisses her — slow, deliberate, a question and a statement at once. She kisses him back. He stops before it goes further. He says: I need you to be sure. Not tonight. She understands he's protecting the arrangement — and her — and finds this, infuriatingly, the most attractive thing he's done. She leaves. She carries the physical memory and the psychological weight of what's coming. END: She has made the decision. She hasn't acted on it yet.",
        characterContext: "SOPHIA VOSS protagonist. The kiss: 300 words minimum, fully sensory. Building awareness before it. His stopping: must feel like power not rejection, must increase rather than decrease desire.",
        dynamic: "first kiss fully rendered, stop that increases desire, both characters revealed",
        intensity: "Explicit",
      },
      {
        title: "The Real Agreement",
        hook: "Morning. Sophia finds him before he leaves for the office. She says: I'm sure.",
        scenarioPrompt: "Write Episode 4 of The Arrangement in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Sophia Voss. CALLBACK: Open at the moment of crossing — she decided in episode three; episode four is execution. EPISODE: Morning. She says: I'm sure. He looks at her for a long moment. He cancels his morning — significant, she knows his schedule. They spend it in the house that's theirs, together, without performance or protocol. Full payoff: not just physical but the specific intimacy of two private people letting their privacy down with each other. He is not cold. He is the opposite of cold. She files this away as information that changes the entire picture.",
        characterContext: "SOPHIA VOSS protagonist. Full explicit content. Ethan without his reserve — his desire for Sophia specifically, detailed, overwhelming. The emotional revelation of who he is when he stops being managed. Complete sensory rendering.",
        dynamic: "full explicit payoff, arranged-marriage barrier broken, emotional revelation",
        intensity: "Scorching",
      },
      {
        title: "Renegotiating",
        hook: "A month later. The arrangement is the same on paper. Everything else has changed.",
        scenarioPrompt: "Write Episode 5 of The Arrangement in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Sophia Voss. CALLBACK: Open in the aftermath of episode four — something has been decided that has not been spoken. EPISODE: A month later. She has the exit date in her calendar — four months. She has stopped looking at it. At dinner at home, she mentions the exit date without planning to. He goes still. He asks: is that what you want? She says: is it what you want? He says what he actually wants for the first time and means it. A final intimate scene: completely equal, completely known to each other, nothing performed. After — the contract question sits between them. He moves it by action rather than word. He reaches across the table and turns her calendar face-down. END: Neither mentions the contract. That is the only conversation that matters. Final line must make the listener want a second series.",
        characterContext: "SOPHIA VOSS protagonist. His real answer: first genuinely vulnerable moment — must cost him visibly. Intimate scene different in quality from episode four — equal, knowing. Final gesture instead of words.",
        dynamic: "emotional peak, contract question resolved through action, relationship named without words",
        intensity: "Scorching",
      },
    ],
  },

  // ─── SERVE & PROTECT ───────────────────────────────────────────────────────
  {
    id: "serve-and-protect",
    title: "Serve & Protect",
    description: "Pop star Zara Cole has one new security chief: ex-Navy SEAL Caleb Reeves. He has one rule — never touch a client. She has been trying to make him break it since day one. Five episodes of deliberate provocation, absolute control, and the moment control becomes something else.",
    mood: "Forbidden",
    tags: ["bodyguard", "forbidden", "ex-military", "celebrity", "series"],
    femaleLead: "Zara Cole — 29, pop music's most wanted. Knows exactly how people look at her. Cannot read Caleb Reeves — the most interesting thing that has happened to her in years. She provokes not maliciously but because she needs to find the crack. She finds it in episode four and it is nothing like she expected.",
    maleLead: "Caleb Reeves — 35, ex-Navy SEAL, 6ft4in. Physical presence that makes rooms recalculate. Suppressed to the point of physical tension — and then, when it breaks, completely overwhelming. Signature line: My job is to keep you safe, Ms Cole. From everything.",
    seriesArc: "Caleb Reeves has one rule that has never been tested the way Zara Cole tests it. Five episodes of the most principled man Zara has ever met — and the specific moment principles become irrelevant.",
    voiceFeel: "Deep Voice",
    episodes: [
      {
        title: "New Security",
        hook: "First day. He briefs Zara on security protocol — thorough, professional, impersonal.",
        scenarioPrompt: "Write Episode 1 of Serve & Protect in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Zara Cole, 29. WORLD: Tour — hotel suites, arenas, beautiful temporary places. EPISODE: First day. He briefs her on protocol. She tests him immediately — pushes back on a restriction, watches his response. He doesn't move. He doesn't raise his voice. He makes clear the restriction stands. She tries charm. He's unmoved — not performed immunity, actual. At sound check she looks up and he's watching the room, not her. She's used to being watched. His not-watching her is oddly, infuriatingly compelling. That night she tries to slip a detail that would require conversation. He closes it without engaging personally. She thinks: interesting. END: Close on that thought — cut before she finishes it.",
        characterContext: "ZARA COLE protagonist. Her physical assessment of Caleb Reeves. The specific frustration of someone who can read everyone not being able to read him. His professional distance rendered through her experience of it.",
        dynamic: "celebrity-bodyguard tension, attraction through resistance, professional distance as charge",
        intensity: "Heated",
      },
      {
        title: "The Provocation",
        hook: "Week two. Zara has been testing him daily. He has been professionally immovable. Tonight she goes further.",
        scenarioPrompt: "Write Episode 2 of Serve & Protect in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Zara Cole. CALLBACK: Open with Zara carrying the specific frustration from episode one — the interesting she noted. EPISODE: After a show — adrenaline high, hotel suite, still in stage clothes. She pushes past every professional boundary — too close, language that isn't ambiguous. He remains completely still. He says quietly: I know what you're doing. She says: do you? He says: yes. He takes one step toward her — controlled, deliberate — and says: I know exactly what you're doing, and I know exactly why I'm not doing anything about it. His proximity. The way his control is clearly not indifference. She is against the wall of her own suite and he hasn't touched her and she has never been this aware of space between two people. He steps back. Goes to his post. She doesn't sleep.",
        characterContext: "ZARA COLE protagonist. His proximity: fully sensory — the near-touch that doesn't happen. Minimum 100 words on her physical experience of his proximity without contact. His control as the erotic event.",
        dynamic: "proximity without contact, explicit denial as charge, control as power",
        intensity: "Heated",
      },
      {
        title: "Rule One",
        hook: "A quiet night — tour break, real hotel with a garden. Zara finds him outside. Not on duty.",
        scenarioPrompt: "Write Episode 3 of Serve & Protect in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Zara Cole. CALLBACK: Open with Zara carrying the physical memory of his proximity from episode two — the space between them she can still feel. EPISODE: He's off shift. She finds him in the garden. She asks: what's the rule? He tells her. She asks: does it cost you anything? Long pause. He says: yes. She asks: how much? He looks at her for the first time without the professional layer. He says: more than you should be comfortable with. They talk for two hours — not about the dynamic, about real things. She knows three things about him no one knows. He knows something about her she hasn't told anyone. He stands to leave. She says his name: Caleb. He stops. Doesn't turn. She says: I understand the rule. He says: good. He doesn't move for ten seconds. Then he goes. She sits in the garden and feels the ten seconds. END: She has made the decision. She hasn't told him yet.",
        characterContext: "ZARA COLE protagonist. Emotional intimacy as erotic charge. His honest answer. The ten-second pause. Write his back, not turning, as fully sensory as a kiss.",
        dynamic: "emotional intimacy as charge, rule named and acknowledged, charged restraint",
        intensity: "Explicit",
      },
      {
        title: "The Breaking Point",
        hook: "A fan breaches security. Hands on Zara, close, frightening for a moment.",
        scenarioPrompt: "Write Episode 4 of Serve & Protect in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Zara Cole. CALLBACK: Open at the moment of crossing — the fan breach, the check, the moment his control breaks. EPISODE: A fan breaches security — not dangerous, but hands on her, close, frightening. Caleb removes the situation. Then he checks her — hands on her shoulders, her face, looking at her to assess damage. She's completely fine. He knows she's fine. His hands stay. He says: are you hurt? She says: no. He says: are you sure? She says his name — Caleb. He kisses her. Not tentative — completely certain, like the rule never existed, like this was always where this ended. Hotel suite. The rule is gone. What remains is the man who spent six weeks not touching her and now has absolutely no interest in stopping.",
        characterContext: "ZARA COLE protagonist. Full explicit content. His desire — specifically for Zara, accumulated over six weeks — must feel overwhelming and specific. The emotional release of chosen control finally releasing. His physicality fully described.",
        dynamic: "full explicit payoff, rule broken by circumstance, six weeks of accumulation released",
        intensity: "Scorching",
      },
      {
        title: "New Terms of Service",
        hook: "Zara finds out he requested reassignment. She is furious.",
        scenarioPrompt: "Write Episode 5 of Serve & Protect in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Zara Cole. CALLBACK: Open in the aftermath of episode four — something has changed that cannot be unchanged. EPISODE: She finds out he requested reassignment — removing himself from the conflict of interest. She finds him and asks why he didn't tell her. He says: because it was the right thing and I knew you'd make it hard. She says: it is hard. He says: I know. The argument is the most honest conversation of the series. Resolution: he's not her bodyguard anymore. He's something without a professional classification. A final intimate scene — different from episode four, no urgency, completely aware of each other, equal. After: she has tour dates in three cities. He has no professional obligation to be on that tour. He picks up her itinerary from the table. Looks at it. Puts it in his jacket pocket. END: That gesture. She thinks: that's not his job anymore. She thinks: no. It's not. She thinks: good. Final line must make the listener want a second series.",
        characterContext: "ZARA COLE protagonist. His real answer must cost him visibly. The intimate scene different in quality from episode four — equal, aware, intimate. Final gesture: the itinerary in his pocket says what neither of them says out loud.",
        dynamic: "relationship renegotiated, intimate explicit scene, wordless commitment",
        intensity: "Scorching",
      },
    ],
  },

  // ─── OFFICE HOURS AFTER DARK ───────────────────────────────────────────────
  {
    id: "office-hours",
    title: "Office Hours After Dark",
    description: "Dr James Alderton is three months from the most important peer review of his career. Claire Navarro is the research assistant who has completely dismantled his concentration. Five episodes of academic tension and the specific destruction of a man who knows better.",
    mood: "Forbidden",
    tags: ["professor", "forbidden", "academic", "intellectual", "series"],
    femaleLead: "Claire Navarro — 26, research assistant. Noticed him noticing her at end of week one and made the professional decision to ignore it. She is currently failing at the professional decision. Not a provocateur — she simply exists at close intellectual range and this turns out to be sufficient.",
    maleLead: "Dr James Alderton — 39, 6ft1in. Academic with residual physicality. Careful, precise — speaks like every word is referenced. Has spent his career in the life of the mind because it is safer. Claire makes the alternative seem, for the first time, worth the risk. Signature line: This is categorically a terrible idea. Said immediately before kissing her.",
    seriesArc: "Dr James Alderton has done everything correctly for fifteen years. Claire Navarro is the first variable that makes doing everything correctly feel insufficient. Five episodes of a brilliant, careful man coming apart at the sentence level.",
    voiceFeel: "Soft Voice",
    episodes: [
      {
        title: "The Research Question",
        hook: "First week. The work is genuine. The research is interesting and Claire is good at it.",
        scenarioPrompt: "Write Episode 1 of Office Hours After Dark in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Claire Navarro, 26. SETTING: His office, floor-to-ceiling books, two adjacent desks, late evenings, building emptying around them. EPISODE: First week. He's professional, thorough, appropriately distant. On the fourth day she asks a question about his thesis that shows she's read his first paper from fifteen years ago. He looks at her over his glasses. He answers. The conversation runs forty minutes past necessary. He visibly pulls back to professional. She notices. She says goodnight. He says goodnight and then says: the question you asked about the third chapter — he doesn't finish it. She says: I'll be in at nine. He says: yes. She walks home thinking about a man coming apart at the sentence level over a research question. END: Cut before she finishes the thought.",
        characterContext: "CLAIRE NAVARRO protagonist. The specific eroticism of being found genuinely interesting by someone brilliant. His unfinished sentence as charged as any touch. Follow her interiority on the walk home.",
        dynamic: "intellectual tension as erotic charge, attraction through being truly seen, restraint beginning",
        intensity: "Heated",
      },
      {
        title: "Late Submission",
        hook: "He stayed late to review her work. He was there when she came back for her bag.",
        scenarioPrompt: "Write Episode 2 of Office Hours After Dark in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Claire Navarro. CALLBACK: Open with Claire carrying the unfinished sentence from episode one. EPISODE: Three weeks in. She left something at the office and comes back late. He's still there. The work is excellent — he tells her directly. They fall into conversation. At some point they're sitting on the same side of his desk going through the same document. He leans across to point at something — stays there a moment longer than necessary. Neither mentions it. She asks him something personal — real. He answers. She sees briefly who he is when not performing Professor Alderton. He reaches past her to get something — his hand brushes hers. One second. He says: sorry. Moves to the other side of the desk. She stays forty more minutes. So does he.",
        characterContext: "CLAIRE NAVARRO protagonist. The moment his hand brushes hers: 100 words minimum, complete sensory rendering. Her experience of watching him manage himself back to professional distance.",
        dynamic: "proximity, accidental contact rendered in full, intellectual man managing himself",
        intensity: "Heated",
      },
      {
        title: "The Chapter",
        hook: "He's reading from a chapter-in-progress. A fictional scene, he says. Literary research, he says.",
        scenarioPrompt: "Write Episode 3 of Office Hours After Dark in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Claire Navarro. CALLBACK: Open with Claire carrying the physical memory of his hand from episode two. EPISODE: He reads from a chapter-in-progress. The passage is about a woman who changes a room by entering it, who is too perceptive to be comfortable around, who makes a specific kind of man aware of his own restraint for the first time. He reads it in his academic voice, precisely, to the wall above her head. He asks what she thinks of the characterisation. She tells him it's very specific. He says it's composite. Neither believes this. She says: James. Not Dr Alderton — James. He looks at her. Something is decided. He says: this is categorically a terrible idea. He doesn't move away. First significant physical escalation follows — fully rendered. Then he stops. His reason must feel like power not rejection. END: She leaves carrying the physical memory and the psychological certainty of what's coming. She has already made the decision.",
        characterContext: "CLAIRE NAVARRO protagonist. The moment she says his name — what it costs her and what it does to him. First significant physical escalation: 300 words minimum. His stopping must increase rather than decrease desire.",
        dynamic: "literary confession, first significant physical escalation, stop that increases desire",
        intensity: "Explicit",
      },
      {
        title: "After Hours",
        hook: "He offers to drive Claire home. It's raining. They both know she won't go home.",
        scenarioPrompt: "Write Episode 4 of Office Hours After Dark in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Claire Navarro. CALLBACK: Open at the moment of crossing — she decided in episode three; episode four is execution. EPISODE: End of term. Both staying late to finish a deadline. He offers to drive her home because it's raining. In the car, something is said — true, unable to be walked back. He parks not at her building but somewhere else — a quiet street, both fully aware of what is happening. What begins in the front seat of his car is the thing both have been managing for months: explicit, finally honest, conducted with the careful intensity of a man who does very little accidentally. The years of suppressed attention released into something completely specific to her. His desire for Claire specifically — use her name, her specific qualities, what he's been observing.",
        characterContext: "CLAIRE NAVARRO protagonist. Full explicit content. His desire for Claire specifically — the accumulated attention of months focused entirely on her. His physicality fully described. The specific experience of a careful man applying that specificity to her body and her pleasure.",
        dynamic: "full explicit payoff, intellectual man releasing control, accumulated desire released",
        intensity: "Scorching",
      },
      {
        title: "Tenure",
        hook: "The semester is over. The research is submitted. He appears at Claire's door on a Sunday morning.",
        scenarioPrompt: "Write Episode 5 of Office Hours After Dark in THIRD-PERSON CLOSE perspective (she/her — never 'you'). PROTAGONIST: Claire Navarro. CALLBACK: Open in the aftermath of episode four — something has changed that cannot be unchanged; neither has named it. EPISODE: The semester is over. He appears at her door on Sunday morning with coffee and the manuscript of something he's been writing. He hands it to her. Her name — not a composite name, her name, Claire — appears in the dedication. He says nothing about it. He comes inside. She spends the morning reading while he sits across from her and watches her discover what he's been making of this time. She finishes. She looks up. He says: I know. She says: James. He says: I know. What follows is the most explicit and honest Sunday either has spent — intimate rather than urgent, equal, the dynamic transformed. END: He looks at her the way he looks at nothing else — without the armour, without the strategy. Final line must make the listener want a second series.",
        characterContext: "CLAIRE NAVARRO protagonist. The dedication: what it costs her when she finds it. His answer said twice, meaning two different things. Final intimate scene different in quality from episode four: slower, more equal, more known to each other.",
        dynamic: "dedication as confession, intimate explicit scene, relationship finally real",
        intensity: "Scorching",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// GET /admin/series-catalog — list all defined series and their DB status
// ---------------------------------------------------------------------------

router.get("/series-catalog", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const dbSeries = await seriesStore.getAll();
    const dbMap = new Map(dbSeries.map((s) => [s.id, s]));

    const catalog = SERIES_CATALOG.map((s) => {
      const db = dbMap.get(s.id);
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        mood: s.mood,
        tags: s.tags,
        episodeCount: s.episodes.length,
        dbStatus: db?.status ?? "not_generated",
        coverImage: db?.coverImage ?? "",
        createdAt: db?.createdAt?.toISOString() ?? null,
      };
    });

    res.json({ catalog });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load catalog";
    res.status(500).json({ error: message });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/series/:seriesId/episodes — list episodes for a series
// ---------------------------------------------------------------------------

router.get("/series/:seriesId/episodes", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { seriesId } = req.params;
  try {
    const episodes = await seriesStore.getEpisodes(seriesId);
    res.json({
      episodes: episodes.map((ep) => ({
        id: ep.id,
        title: ep.title,
        description: ep.description,
        seriesEpisode: ep.seriesEpisode,
        coverImage: (ep.images as Record<string, unknown>)?.cover ?? "",
        status: ep.status,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load episodes";
    res.status(500).json({ error: message });
  }
});

// ---------------------------------------------------------------------------
// POST /admin/generate-series — generate all episodes of a series via SSE
// ---------------------------------------------------------------------------

router.post("/generate-series", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { seriesKey } = req.body as { seriesKey: string };
  const seriesDef = SERIES_CATALOG.find((s) => s.id === seriesKey);
  if (!seriesDef) {
    res.status(400).json({ error: `Unknown series key: ${seriesKey}` });
    return;
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const emit = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const send = (data: unknown) => emit("progress", data);
  const done = (data: unknown) => emit("complete", data);
  const fail = (error: string) => emit("error", { error });

  send({ message: `Starting generation for "${seriesDef.title}"`, series: seriesDef.id });

  try {
    // Upsert series record
    await seriesStore.set({
      id: seriesDef.id,
      title: seriesDef.title,
      description: seriesDef.description,
      mood: seriesDef.mood,
      tags: seriesDef.tags,
      coverImage: "",
      episodeCount: seriesDef.episodes.length,
      seriesArc: seriesDef.seriesArc,
      status: "generating",
    });

    let firstEpisodeCover = "";

    for (let i = 0; i < seriesDef.episodes.length; i++) {
      const ep = seriesDef.episodes[i];
      const epNum = i + 1;
      const totalEps = seriesDef.episodes.length;

      send({ message: `Episode ${epNum}/${totalEps}: Planning "${ep.title}"…`, episode: epNum });

      // Derive intensity from arc stage (overrides per-episode definition for precision)
      const arcStage = getArcStage(epNum);
      const arcIntensityMap: Record<number, string> = {
        1: "Heated",
        2: "Heated",
        3: "Explicit",
        4: "Scorching",
        5: "Explicit",
      };
      const resolvedIntensity = arcIntensityMap[epNum] ?? ep.intensity;

      // Build the full series layer including character context and arc stage
      const characterBlock = [
        seriesDef.femaleLead ? `FEMALE PROTAGONIST: ${seriesDef.femaleLead}` : "",
        seriesDef.maleLead ? `MALE LEAD: ${seriesDef.maleLead}` : "",
        ep.characterContext ? `CHARACTER NOTES: ${ep.characterContext}` : "",
      ].filter(Boolean).join("\n\n");

      const seriesLayer = `${buildSeriesLayer(epNum, totalEps, seriesDef.seriesArc)}\n\nCHARACTERS:\n${characterBlock}`;

      const intake: GenerateStoryRequest = {
        listenerName: "",
        mood: seriesDef.mood,
        intensity: resolvedIntensity,
        voiceFeel: seriesDef.voiceFeel,
        storyLength: "10 min",
        scenarioPrompt: ep.scenarioPrompt,
        whoIsHe: seriesDef.maleLead,
        dynamic: ep.dynamic,
        cinematicVisuals: true,
        emotionalFocus: true,
        bypassCache: true,
        storyMode: "series",
        experienceTags: ["series", seriesDef.id, `episode-${epNum}`],
      };

      try {
        // Plan
        send({ message: `Episode ${epNum}/${totalEps}: Building story architecture…`, episode: epNum });
        let brief = await planStory(intake, { seriesLayer });

        // Build the original input anchor for writing — includes hook, word count, and series flag
        const seriesOriginalInput = {
          scenarioPrompt: ep.scenarioPrompt,
          whoIsHe: seriesDef.maleLead,
          dynamic: ep.dynamic,
          hookSentence: ep.hook,
          wordCountTarget: arcStage?.word_count,
          isSeries: true,
        };

        // Write
        send({ message: `Episode ${epNum}/${totalEps}: Writing narrative…`, episode: epNum });
        let story = await writeStoryFromBrief(brief, "", resolvedIntensity, seriesOriginalInput);

        // QC
        send({ message: `Episode ${epNum}/${totalEps}: Quality review…`, episode: epNum });
        let qcResult = await qcStory(brief, story);

        if (qcResult.score_total < 7.5) {
          send({ message: `Episode ${epNum}/${totalEps}: Regenerating (QC score ${qcResult.score_total.toFixed(1)})…`, episode: epNum });
          brief = await planStory(intake, { seriesLayer });
          story = await writeStoryFromBrief(brief, "", resolvedIntensity, seriesOriginalInput);
          qcResult = await qcStory(brief, story);
        } else if (qcResult.rewrite_strategy) {
          send({ message: `Episode ${epNum}/${totalEps}: Refining (${qcResult.rewrite_strategy})…`, episode: epNum });
          story = await rewriteStory(brief, story, qcResult.rewrite_strategy);
          qcResult = await qcStory(brief, story);
        }

        // Images
        send({ message: `Episode ${epNum}/${totalEps}: Generating cover image…`, episode: epNum });
        const imagePrompts = await buildImagePrompts(brief, story);
        const storyHash = getCacheKey({ seriesId: seriesDef.id, epNum, title: story.title });
        const images = await generateAllImages(imagePrompts, storyHash);

        // Assemble
        const scenesWithImages = story.scenes.map((scene, idx) => ({
          ...scene,
          visualPrompt: imagePrompts.scenePrompts[idx]?.prompt ?? "",
          image: images.scenes[idx],
        }));

        const episodeId = `${seriesDef.id}-ep${epNum}`;
        const storyRecord = {
          id: episodeId,
          title: story.title,
          description: story.description,
          mood: seriesDef.mood,
          duration: "10 min",
          audioUrl: "",
          scenes: scenesWithImages,
          images: { cover: images.cover, scenes: images.scenes },
          brief,
          qc: qcResult,
          recommendation_tags: [...(brief.recommendation_tags ?? [seriesDef.mood]), ...seriesDef.tags],
          isLibraryStory: true,
          status: "published",
          seriesId: seriesDef.id,
          seriesEpisode: epNum,
          ownerUserId: null,
        };

        await storiesStore.set(episodeId, storyRecord);

        // Use first episode cover as the series cover
        if (epNum === 1 && images.cover) {
          firstEpisodeCover = images.cover;
          await seriesStore.updateCoverImage(seriesDef.id, images.cover);
        }

        send({
          message: `Episode ${epNum}/${totalEps}: Complete — "${story.title}"`,
          episode: epNum,
          episodeId,
          title: story.title,
          coverImage: images.cover,
          qcScore: qcResult.score_total,
        });
      } catch (epErr) {
        const message = epErr instanceof Error ? epErr.message : "Episode generation failed";
        send({ message: `Episode ${epNum}/${totalEps}: Failed — ${message}`, episode: epNum, error: message });
      }
    }

    // Mark series as published
    await seriesStore.updateStatus(seriesDef.id, "published");

    done({
      message: `Series "${seriesDef.title}" generation complete`,
      seriesId: seriesDef.id,
      coverImage: firstEpisodeCover,
    });
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Series generation failed";
    fail(message);
    res.end();
    await seriesStore.updateStatus(seriesDef.id, "error").catch(() => {});
  }
});

export default router;
