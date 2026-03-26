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
// Series catalog — 5 pre-defined premium series
// ---------------------------------------------------------------------------

interface SeriesEpisodeDef {
  title: string;
  hook: string;
  scenarioPrompt: string;
  whoIsHe?: string;
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
  episodes: SeriesEpisodeDef[];
}

const SERIES_CATALOG: SeriesDef[] = [
  {
    id: "midnight-authority",
    title: "Midnight Authority",
    description: "A dominant Black CEO meets the one VP who refuses to defer — until the boardroom tension becomes something neither can control. Five episodes of power, heat, and surrender.",
    mood: "Forbidden",
    tags: ["dominant-man", "CEO", "power-play", "office", "series"],
    seriesArc: "Marcus Kane is a Black billionaire CEO — commanding, physically imposing, used to total authority. You are his new VP, brilliant and unmoved by his power. This is the story of two people fighting for control until one of them stops wanting to win.",
    voiceFeel: "Deep Voice",
    episodes: [
      {
        title: "The Interview",
        hook: "He hires you despite himself. The moment your eyes meet, the air changes.",
        scenarioPrompt: "You are in a high-stakes job interview with Marcus Kane, a dominant Black CEO who does not hire people who don't challenge him. He is physically imposing, deeply controlled, and watching you in a way that feels like assessment and something else entirely. You hold your ground. He offers you the job. When you leave his office, neither of you says what was in the room.",
        whoIsHe: "Marcus Kane — dominant Black CEO, physically imposing, deep-voiced, accustomed to total authority, privately drawn to the one person in the room who doesn't seem intimidated",
        dynamic: "power-play, first-meeting tension, mutual assessment",
        intensity: "Heated",
      },
      {
        title: "After Hours",
        hook: "You're both still at the office at midnight. Neither of you has a good excuse.",
        scenarioPrompt: "It's past midnight. The floor is empty except for you and Marcus Kane. You've both been working. He appears in your doorway — just checking the building is locked, he says. Neither of you believes that. The conversation that follows starts as professional and becomes something else. He comes closer than necessary. Neither of you acknowledges it.",
        whoIsHe: "Marcus Kane — dominant Black CEO who has been watching you more carefully than he should since the interview",
        dynamic: "proximity, late-night tension, unspoken desire",
        intensity: "Heated",
      },
      {
        title: "The Vote",
        hook: "You challenge his strategy in front of the board. He says nothing. Until later.",
        scenarioPrompt: "In a boardroom full of executives, you publicly counter Marcus Kane's strategy with a better one. He is smooth, controlled, says nothing in the meeting. Afterward, he calls you into his office and closes the door. What follows is not about the boardroom. He makes clear he is not angry. He is something else entirely. The power dynamic shifts in a direction neither of you planned.",
        whoIsHe: "Marcus Kane — dominant Black CEO who finds your defiance professionally infuriating and personally irresistible",
        dynamic: "power reversal, desire meeting challenge, tension breaking",
        intensity: "Explicit",
      },
      {
        title: "Authority",
        hook: "He makes his intentions clear. For the first time, you don't say no.",
        scenarioPrompt: "Marcus Kane calls you to his apartment under a business pretext. There is no business to discuss. He is direct for the first time: he wants you, he has wanted you since the interview, and he is done pretending otherwise. The choice is yours. You don't say no. What follows is him taking exactly what both of you have wanted since the beginning, with the full authority he's been restraining.",
        whoIsHe: "Marcus Kane — dominant Black CEO who has been perfectly controlled until this moment",
        dynamic: "dominant-surrendered, desire finally acted on, full explicit encounter",
        intensity: "Scorching",
      },
      {
        title: "What This Is",
        hook: "No more pretending. No more distance. Just what this has always been.",
        scenarioPrompt: "The morning after. Marcus Kane is not the kind of man who does this. Neither are you. He makes coffee. You sit across from each other in the early light and for the first time there is no power play, no professional distance, no pretense. He tells you what this is — simply, directly, in his way. The intimacy of the morning becomes its own kind of explicit. This is not an ending. It is the only honest beginning.",
        whoIsHe: "Marcus Kane — dominant Black CEO who is learning that vulnerability is a different kind of authority",
        dynamic: "emotional intimacy, morning-after honesty, heat in the quiet",
        intensity: "Scorching",
      },
    ],
  },
  {
    id: "la-reina",
    title: "La Reina",
    description: "You are Isabella Reyes — heir to a luxury hotel empire, used to commanding every room. When an American architect arrives to redesign your Havana flagship, you decide you want him. Getting him is a different story.",
    mood: "Forbidden",
    tags: ["dominant-woman", "seductive", "power", "hotel", "series"],
    seriesArc: "You ARE Isabella Reyes. A dominant, seductive Latina who inherited a hotel empire and has never wanted for anything she couldn't have. The American architect is the first man who doesn't immediately give you what you want. This is a series told in second person — you are the dominant one, and he is the one who makes you work for it.",
    voiceFeel: "Confident Voice",
    episodes: [
      {
        title: "Arrival",
        hook: "He doesn't know who you are. You decide to keep it that way.",
        scenarioPrompt: "You are Isabella Reyes, daughter of a Caribbean hotel dynasty, and you have just arrived at your Havana flagship incognito. The American architect — tall, serious, unexpectedly beautiful — is already there, measuring walls. He mistakes you for hotel staff. You do not correct him. For the first time in years, someone is speaking to you like you're a person, not an heiress. You decide to stay anonymous a little longer. And you decide you want him.",
        whoIsHe: "An American architect — serious, talented, quietly confident. He doesn't react to beauty the way most men do. This bothers you more than it should.",
        dynamic: "dominant-woman pursuing, anonymous-identity tension, desire starting to form",
        intensity: "Heated",
      },
      {
        title: "The Blueprint",
        hook: "He shows you his plans. You show him yours are completely different.",
        scenarioPrompt: "He has presented his architectural vision for your hotel. It is brilliant and wrong — wrong for Havana, wrong for your family's legacy, wrong in a way you cannot fully articulate but absolutely feel. You reveal who you are in the middle of the review meeting. The shift in his expression — not deferential, not embarrassed, simply recalibrating — tells you everything. You want this man. Now the question is what it will cost you to have him.",
        whoIsHe: "The architect who just discovered you're the owner. He doesn't apologise for anything he said.",
        dynamic: "power-reveal, professional sparring, attraction sharpening",
        intensity: "Heated",
      },
      {
        title: "Negotiation",
        hook: "You always win. He's learning that. Slowly.",
        scenarioPrompt: "You have been circling each other for three weeks. He revises his plans — closer to what you want but not there yet. Every meeting is a negotiation. Every negotiation is something else. Tonight you invite him to dinner in the hotel's closed rooftop restaurant, just the two of you. You are in your element, dressed for a different kind of authority. He sees it. He still doesn't give you everything. You find this unbearable and thrilling in equal measure.",
        whoIsHe: "The architect who has figured out how to hold your attention without giving you what you want",
        dynamic: "seductive dominant woman, slow-burn negotiation, proximity and restraint",
        intensity: "Explicit",
      },
      {
        title: "The Suite",
        hook: "Your hotel. Your rules. Tonight, everything changes.",
        scenarioPrompt: "You bring him to the penthouse suite — the best room in your hotel, yours alone. You tell him this is where you make decisions. He understands what kind of decision this is. For the first time, you are not in pursuit — you are choosing, and the distinction matters enormously to you. What happens in the suite is on your terms, at your pace, with your rules. He discovers exactly what it means to be wanted by a woman who never wants for anything.",
        whoIsHe: "The architect who has finally stopped holding back",
        dynamic: "dominant woman taking what she wants, full explicit encounter on her terms",
        intensity: "Scorching",
      },
      {
        title: "Reina",
        hook: "What you take. What you give. What you keep.",
        scenarioPrompt: "The hotel renovation is complete. He is leaving. You have not asked him to stay — you do not ask for things. But this morning you stand on the rooftop looking at what he built for you, what he changed, and you understand that something was given here that was not in the contract. He finds you there. The conversation is short. What happens after is the most honest thing either of you has done. You get what you want. This time, you also give something back.",
        whoIsHe: "The architect who built something for you that was not on the blueprint",
        dynamic: "dominant woman choosing vulnerability, explicit emotional and physical intimacy",
        intensity: "Scorching",
      },
    ],
  },
  {
    id: "the-arrangement",
    title: "The Arrangement",
    description: "You married James Harrington for the contract. He married you to save his company. One rule: keep your distance. Rules like that never last.",
    mood: "Slow Burn",
    tags: ["billionaire", "arranged-marriage", "slow-burn", "enemies-to-lovers", "series"],
    seriesArc: "A marriage of convenience between you and James Harrington — cold, private, devastatingly handsome. You both agreed to keep this professional. You both meant it. Neither of you counted on actually living together.",
    voiceFeel: "Deep Voice",
    episodes: [
      {
        title: "Signed",
        hook: "The wedding. The deal. The handshake that feels like a verdict.",
        scenarioPrompt: "You marry James Harrington in a civil ceremony with three witnesses and no flowers. He is exactly as advertised: controlled, precise, private — and far more physically present than you expected. You agreed to this arrangement for the financial security. He agreed for the board optics. You shake hands after the ceremony. He holds on a moment too long. Neither of you comments on it.",
        whoIsHe: "James Harrington — cold billionaire, private by nature, devastatingly controlled, secretly watching everything",
        dynamic: "arranged-marriage tension, formal distance covering attraction",
        intensity: "Heated",
      },
      {
        title: "Shared Walls",
        hook: "You live in the same house. You don't speak. You notice everything.",
        scenarioPrompt: "Three weeks into the arrangement. The penthouse is large enough that you shouldn't cross paths — but you do. He makes coffee at 6am. You pass in the hall. He comes home late; you're still awake. Each time, the interaction is brief and professional. Each time, something is added to the quiet inventory you're building of each other. One night the power goes out. You are in the dark together for four minutes. Neither of you reaches for your phone.",
        whoIsHe: "James Harrington who has started leaving the light on in the kitchen after midnight",
        dynamic: "slow-burn cohabitation tension, noticing, restraint",
        intensity: "Heated",
      },
      {
        title: "The Gala",
        hook: "You have to pretend tonight. He makes it feel almost real.",
        scenarioPrompt: "A charity gala. The first public appearance as a couple. James helps you with a clasp at your neckline — necessary, brief, electric in its restraint. All evening he introduces you as his wife with a particular kind of possession in his voice. He touches the small of your back to guide you through the room. On the drive home, you are both silent. He walks you to your bedroom door. He pauses. He does not come in. The pause is significant.",
        whoIsHe: "James Harrington performing for the public and half-convincing himself it isn't a performance",
        dynamic: "public intimacy bleeding into private longing, restraint at the door",
        intensity: "Explicit",
      },
      {
        title: "Breaking Terms",
        hook: "Someone breaks the rule first. You're both pretending it wasn't intentional.",
        scenarioPrompt: "One evening you are working late in the shared study. James sits across from you. It starts as a work conversation. It does not remain one. Something is said. One of you reaches across the desk. What follows is the first breach of the arrangement — heated, consuming, and conducted with the mutual knowledge that this changes everything. Afterward, both of you pretend to be uncertain how it started. Both of you know exactly.",
        whoIsHe: "James Harrington who has been holding this back for weeks",
        dynamic: "first breach, arrangement breaking, explicit heat finally released",
        intensity: "Scorching",
      },
      {
        title: "What We Kept",
        hook: "No arrangement. No rules. Just what's left when everything else is gone.",
        scenarioPrompt: "The contract term is ending. The lawyers have paperwork ready. James asks you to dinner — not a public dinner, not a professional obligation. Just the two of you in the apartment kitchen, him cooking, you watching. He tells you what this has been for him. Not in a speech — in the way he says your name once, differently from every other time. What follows is the most deliberately honest night of the marriage: explicit, intimate, unambiguous about what it has always been.",
        whoIsHe: "James Harrington who has decided to stop pretending this was ever an arrangement",
        dynamic: "arranged-marriage becoming real, explicit intimacy stripped of pretense",
        intensity: "Scorching",
      },
    ],
  },
  {
    id: "serve-and-protect",
    title: "Serve & Protect",
    description: "Ethan Cole is ex-Navy SEAL, hired to protect you from threats you don't take seriously. He has one rule: never touch a client. You have been trying to make him break it since day one.",
    mood: "Forbidden",
    tags: ["bodyguard", "forbidden", "ex-military", "celebrity", "series"],
    seriesArc: "Ethan Cole — ex-Navy SEAL turned private security, disciplined, physically massive, privately principled. His one inviolable rule: never touch a client. You are the client who has been systematically dismantling that rule since day one without quite crossing the line.",
    voiceFeel: "Deep Voice",
    episodes: [
      {
        title: "Assignment",
        hook: "He walks in. He doesn't smile. He's not impressed by anything — including you.",
        scenarioPrompt: "Your new head of security enters your home. Ethan Cole: ex-Navy SEAL, ex-special operations, built like architecture, utterly unmoved by your world. He does a sweep of the apartment while you talk. He answers your questions in complete sentences and asks nothing personal. He's seen everything and is impressed by none of it. You are used to rooms changing when you enter them. He doesn't even look up when you walk in. You find this infuriating and deeply interesting.",
        whoIsHe: "Ethan Cole — ex-Navy SEAL, ex-special operations, the most controlled man you've ever met, professionally calibrated, privately noticing everything",
        dynamic: "celebrity-bodyguard dynamic, woman pursuing man who won't engage, opening tension",
        intensity: "Heated",
      },
      {
        title: "Close Range",
        hook: "Twenty-four-hour protection means twenty-four hours of watching you want him.",
        scenarioPrompt: "Three weeks of Ethan Cole at close range. In the car, in the lobby, outside hotel rooms, at the back of every event. He is always within ten feet of you. You have started doing things specifically to get his attention — wearing things that should make him react, saying things that should break his composure. He reacts to nothing. One evening there is a genuine threat — a man in a parking structure — and Ethan is between you and the danger before you process the situation. Afterward, his hand is on your arm and he doesn't remove it immediately. It's four seconds. You count.",
        whoIsHe: "Ethan Cole who has been noticing everything and showing nothing",
        dynamic: "proximity, denied desire, one moment of genuine contact",
        intensity: "Heated",
      },
      {
        title: "Off Duty",
        hook: "The one night he's technically not your bodyguard. One night is enough.",
        scenarioPrompt: "He is off duty. You run into him at a bar — genuinely accidental, which makes it worse. He is out of his professional uniform. He's in a grey t-shirt. He is even more impossible to ignore. He buys you a drink because he cannot think of a professional reason not to. The conversation is the first real one you've had. He is direct, dry, briefly funny. He walks you to your car. You say: you're not technically my bodyguard right now. He says: I know. Nothing happens — but everything that comes next was decided in that parking lot.",
        whoIsHe: "Ethan Cole off duty and temporarily without his professional armor",
        dynamic: "off-duty encounter, first real conversation, line about to be crossed",
        intensity: "Explicit",
      },
      {
        title: "Breach",
        hook: "Everything he was protecting himself from happens. Neither of you regrets it.",
        scenarioPrompt: "It is after midnight. He has just handled a security situation and comes to your hotel room to confirm you're safe. You open the door. He looks at you once in a way he's never allowed himself before. You say his first name. That's all it takes. What follows is the thing he has been disciplining himself against for weeks — consuming, completely explicit, conducted with the focused intensity of a man who has been waiting and is done waiting. Afterward, he doesn't leave.",
        whoIsHe: "Ethan Cole who has broken the one rule he never breaks",
        dynamic: "forbidden crossing, explicit encounter, full intensity",
        intensity: "Scorching",
      },
      {
        title: "What He Guards Now",
        hook: "The assignment is over. He stays anyway.",
        scenarioPrompt: "The contract ended yesterday. Ethan Cole has no professional reason to be here. He is here. He makes you breakfast without asking what you want — he already knows. You sit at the kitchen counter watching him and something settles in your chest that feels like relief. He turns around and looks at you with the same contained focus he's always had, except now it's entirely yours. He says: I'm not your bodyguard anymore. He says: I'm not leaving. What follows is the most explicit morning either of you has had — and the most honest.",
        whoIsHe: "Ethan Cole who has stopped protecting himself from what this is",
        dynamic: "post-contract intimacy, bodyguard-becomes-lover, explicit morning heat",
        intensity: "Scorching",
      },
    ],
  },
  {
    id: "office-hours",
    title: "Office Hours After Dark",
    description: "Professor Daniel Ashwood — acclaimed author, the most compelling mind you've encountered. You're his research assistant. He has spent two semesters being careful. Carefully failing.",
    mood: "Forbidden",
    tags: ["professor", "forbidden", "academic", "intellectual", "series"],
    seriesArc: "Daniel Ashwood — celebrated author, tenured professor, precisely intelligent and carefully contained. You are his research assistant. The work is real; the situation is becoming impossible. He has been doing everything correctly. It is no longer working.",
    voiceFeel: "Soft Voice",
    episodes: [
      {
        title: "Orientation",
        hook: "You start the job. He shakes your hand exactly once. He doesn't look at you twice. You notice.",
        scenarioPrompt: "Your first day as Professor Ashwood's research assistant. He shakes your hand — once, precisely — and gives you a thorough professional orientation. He is warm in the way academics are warm: attentive to your intelligence, generous with his, completely impersonal. He does not look at you twice. You notice this with unusual precision. The work is genuinely interesting. So is the particular way he focuses when he's reading, the sound of his voice explaining difficult things, the way he holds a pen.",
        whoIsHe: "Professor Daniel Ashwood — celebrated literary author turned academic, privately magnetic, doing everything correctly, the kind of man who looks at you with his full attention when you speak and then looks away the moment it becomes significant",
        dynamic: "academic-assistant forbidden dynamic, attraction beginning, careful professional distance",
        intensity: "Heated",
      },
      {
        title: "Source Material",
        hook: "You're alone in his study. He's standing too close. Neither of you moves.",
        scenarioPrompt: "Late in the semester. You are alone in his faculty study going through research files. He returns earlier than expected. The study is small. He has to reach past you to access something on the shelf. He stays there longer than the task requires — not touching you, precisely not touching you. He says something about the research. You respond. Neither of you moves. When he finally steps back, both of you treat the previous thirty seconds as if they were entirely professional.",
        whoIsHe: "Professor Ashwood who is running out of professional explanations for things",
        dynamic: "proximity, restrained desire, intellectual tension physically manifested",
        intensity: "Heated",
      },
      {
        title: "The Chapter",
        hook: "He reads something he wrote. It's not about you. You know it is.",
        scenarioPrompt: "He is reading from a chapter-in-progress — a fictional scene, he says. Literary research, he says. The passage he reads is about a woman who changes a room by entering it, who is too perceptive to be comfortable around, who makes a specific kind of man aware of his own restraint for the first time in years. He reads it in his academic voice, precisely, to the wall above your head. When he finishes, he asks what you think of the characterisation. You tell him it's very specific. He says it's composite. Neither of you believes this.",
        whoIsHe: "Professor Ashwood who has apparently been writing about you",
        dynamic: "literary revelation, ambiguous acknowledgment of feeling, heat in the admission",
        intensity: "Explicit",
      },
      {
        title: "After Hours",
        hook: "He offers to drive you home. You both know you won't go home.",
        scenarioPrompt: "End of term. You are both staying late to finish a research deadline. He offers to drive you home because it's raining. In the car, something is said — something true, something that cannot be walked back. He parks not at your building but somewhere else — a quiet street, both of you fully aware of what is happening. What begins in the front seat of his car is the thing both of you have been managing for two semesters: explicit, finally honest, conducted with the careful intensity of a man who does very little accidentally.",
        whoIsHe: "Professor Ashwood who has decided that being careful is no longer the point",
        dynamic: "finally crossing the line, explicit encounter, intellectual man releasing control",
        intensity: "Scorching",
      },
      {
        title: "Tenure",
        hook: "Whatever this is, it's no longer a secret — from him, from you, or from anyone.",
        scenarioPrompt: "The semester is over. The research is submitted. The professional reasons to maintain distance are gone. He appears at your door on a Sunday morning with coffee and the manuscript of the thing he's been writing. He hands it to you. Your name — not a composite name, your name — appears in the dedication. He says nothing about it. He comes inside. You spend the morning reading while he sits across from you and watches you discover what he's been making of this time. What follows is the most explicit and the most honest Sunday either of you has spent.",
        whoIsHe: "Professor Ashwood who put your name in his book",
        dynamic: "explicit vulnerable morning, intellectual man with his armor down, final honest intimacy",
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

      const seriesLayer = buildSeriesLayer(epNum, totalEps, seriesDef.seriesArc);

      const intake: GenerateStoryRequest = {
        listenerName: "",
        mood: seriesDef.mood,
        intensity: ep.intensity,
        voiceFeel: seriesDef.voiceFeel,
        storyLength: "10 min",
        scenarioPrompt: ep.scenarioPrompt,
        whoIsHe: ep.whoIsHe,
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

        // Write
        send({ message: `Episode ${epNum}/${totalEps}: Writing narrative…`, episode: epNum });
        let story = await writeStoryFromBrief(brief, "", ep.intensity);

        // QC
        send({ message: `Episode ${epNum}/${totalEps}: Quality review…`, episode: epNum });
        let qcResult = await qcStory(brief, story);

        if (qcResult.score_total < 7.5) {
          send({ message: `Episode ${epNum}/${totalEps}: Regenerating (QC score ${qcResult.score_total.toFixed(1)})…`, episode: epNum });
          brief = await planStory(intake, { seriesLayer });
          story = await writeStoryFromBrief(brief, "", ep.intensity);
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
