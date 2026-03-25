import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { storiesStore } from "../lib/storage.js";
import { buildPrompt, type StoryRegistryEntry } from "../lib/buildPrompt.js";
import { getNonCustomSubthemes, STORY_CATEGORIES } from "../lib/storyCategories.js";
import { getStoryName } from "../lib/storyNames.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router: IRouter = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

function isAdmin(req: any): boolean {
  if (!ADMIN_EMAIL) return false;
  const user = req.user as { email?: string } | undefined;
  return user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
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
  // Strip [HOOK] blocks
  clean = clean.replace(/\[HOOK\][\s\S]*?\[\/HOOK\]/gi, "");
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
  // Strip --- horizontal rules
  clean = clean.replace(/^-{3,}\s*$/gm, "");
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

    // ── Step 1: Write story text ──────────────────────────────────────────
    send("status", { phase: "writing_story", message: "GPT-4o writing story…" });

    const storyCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.9,
      max_tokens: 8000,
      messages: [
        { role: "system", content: systemWithTitle },
        { role: "user", content: prompt.user },
      ],
    });

    const rawStoryText = storyCompletion.choices[0]?.message?.content ?? "";

    // Extract DNA, description (HOOK), and clean story text
    const { cleanText: cleanStoryText, description: extractedDescription, dna: storyDna } =
      extractStoryParts(rawStoryText);

    // Fall back description if GPT didn't emit a [HOOK] block
    const description = extractedDescription || `A ${categoryName.toLowerCase()} story. Press play.`;

    send("status", { phase: "story_written", title, description, dna: storyDna });

    // ── Step 2: Cover image ───────────────────────────────────────────────
    send("status", { phase: "generating_cover", message: "Generating cover image…" });

    let coverImageUrl = "";
    try {
      const coverPromptText = [
        "Cinematic, photographic cover image for a premium adult audio romance story.",
        `Category: ${prompt.metadata.category}.`,
        `Subtheme: ${prompt.metadata.subtheme}.`,
        storyDna.setting_type ? `Setting: ${String(storyDna.setting_type)}.` : "",
        storyDna.visual_motif ? `Visual motif: ${String(storyDna.visual_motif)}.` : "",
        storyDna.time_of_day ? `Time of day: ${String(storyDna.time_of_day)}.` : "",
        "Style: moody atmospheric premium editorial photography.",
        "No nudity. Evocative, sophisticated, cinematic.",
        "Dark rich colour palette. High production value.",
      ]
        .filter(Boolean)
        .join(" ");

      const imageRes = await openai.images.generate({
        model: "dall-e-3",
        prompt: coverPromptText,
        n: 1,
        size: "1792x1024",
        quality: "standard",
      });
      coverImageUrl = imageRes.data[0]?.url ?? "";
    } catch {
      send("warning", { message: "Cover image failed, continuing without it" });
    }

    // ── Step 3: Audio (TTS) — chunked for full-length stories ────────────
    send("status", { phase: "generating_audio", message: "Generating audio narration…" });

    let audioUrl = "";
    try {
      const audioDir = getPublicAudioDir();
      const filename = `audio-${storyId}.mp3`;

      const audioBuffer = await generateFullAudio(cleanStoryText);
      fs.writeFileSync(path.join(audioDir, filename), audioBuffer);
      audioUrl = `/api/audio/${filename}`;
    } catch (err) {
      send("warning", { message: `Audio generation failed: ${err instanceof Error ? err.message : "unknown error"}` });
    }

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

export default router;
