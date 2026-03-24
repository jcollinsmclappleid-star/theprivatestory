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

    send("status", {
      phase: "prompt_ready",
      storyId,
      system_prompt: prompt.system,
      user_prompt: prompt.user,
      metadata: prompt.metadata,
    });

    // ── Step 1: Write story text ──────────────────────────────────────────
    send("status", { phase: "writing_story", message: "GPT-4o writing story…" });

    const storyCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.9,
      max_tokens: 4000,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
    });

    const rawStoryText = storyCompletion.choices[0]?.message?.content ?? "";

    // Extract STORY DNA JSON block
    let storyDna: Record<string, unknown> = {};
    const dnaMatch = rawStoryText.match(/\{[^{}]*"category"[^{}]*\}/s);
    if (dnaMatch) {
      try {
        storyDna = JSON.parse(dnaMatch[0]);
      } catch {
        // DNA parse failed — continue without structured DNA
      }
    }

    // Use predefined story name, fallback to generated name if not found
    const categoryName = STORY_CATEGORIES.find(c => c.id === categoryId)?.name ?? prompt.metadata.category;
    const title = getStoryName(categoryId, subthemeId, categoryName);

    // Extract description — first non-heading paragraph
    const paragraphs = rawStoryText.split(/\n\n+/).filter((p) => p.trim().length > 30);
    const description =
      paragraphs
        .find((p) => !p.startsWith("#") && !p.startsWith("{"))
        ?.replace(/[*_`]/g, "")
        .slice(0, 220) ?? "";

    send("status", { phase: "story_written", title, dna: storyDna });

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

    // ── Step 3: Audio (TTS) ───────────────────────────────────────────────
    send("status", { phase: "generating_audio", message: "Generating audio narration…" });

    let audioUrl = "";
    try {
      const audioText = rawStoryText
        .replace(/\{[\s\S]*?\}/g, "")
        .replace(/^#{1,6}.*/gm, "")
        .replace(/\*+/g, "")
        .trim()
        .slice(0, 4096);

      const speechResponse = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: "nova",
        input: audioText,
        response_format: "mp3",
        speed: 0.92,
      });

      const audioDir = getPublicAudioDir();
      const filename = `audio-${storyId}.mp3`;
      const buffer = Buffer.from(await speechResponse.arrayBuffer());
      fs.writeFileSync(path.join(audioDir, filename), buffer);
      audioUrl = `/api/audio/${filename}`;
    } catch {
      send("warning", { message: "Audio generation failed, continuing without it" });
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
          text: rawStoryText,
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
    send("error", { message });
  }

  res.end();
});

export default router;
