import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { openrouter, MISTRAL_MODEL } from "../lib/openrouter.js";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { storiesStore } from "../lib/storage.js";
import { db } from "@workspace/db";
import { generatedStories } from "@workspace/db/schema";
import { eq, like, asc, and, sql } from "drizzle-orm";
import { buildPrompt, type StoryRegistryEntry } from "../lib/buildPrompt.js";
import { getNonCustomSubthemes, STORY_CATEGORIES } from "../lib/storyCategories.js";
import { getStoryName } from "../lib/storyNames.js";

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

export default router;
