import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

interface GenerateStoryRequest {
  listenerName: string;
  mood: string;
  intensity: string;
  voiceFeel: string;
  storyLength: string;
  scenarioPrompt: string;
  cinematicVisuals?: boolean;
  emotionalFocus?: boolean;
}

interface ScenePlan {
  scene_number: number;
  goal: string;
  emotional_shift: string;
  visual_focus: string;
}

interface StoryBrief {
  emotional_arc: string;
  relationship_dynamic: string;
  conflict_type: string;
  pacing_style: string;
  ending_type: string;
  sensory_palette: string[];
  point_of_view: string;
  voice_tone: string;
  scene_count: number;
  scene_plan: ScenePlan[];
  recurring_motif: string;
  title_direction: string;
  image_style_direction: string;
}

interface Scene {
  id: number;
  heading: string;
  text: string;
  visualPrompt: string;
  durationEstimate: number;
}

interface WrittenStory {
  title: string;
  description: string;
  scenes: Scene[];
}

interface ImagePrompts {
  coverPrompt: string;
  scenePrompts: Array<{ sceneId: number; prompt: string }>;
}

// ---------------------------------------------------------------------------
// Caches
// ---------------------------------------------------------------------------

const briefCache = new Map<string, StoryBrief>();
const storyCache = new Map<string, WrittenStory>();
const imagePromptCache = new Map<string, ImagePrompts>();
const audioCache = new Map<string, string>();
const imageCache = new Map<string, { cover: string; scenes: string[] }>();
const fullStoryCache = new Map<string, object>();

function getCacheKey(data: object): string {
  return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
}

// ---------------------------------------------------------------------------
// Voice IDs
// ---------------------------------------------------------------------------

const voiceIdMap: Record<string, string> = {
  "Soft Voice": "EXAVITQu4vr4xnSDxMaL",
  "Deep Voice": "VR6AewLTigWG4xSOukaG",
  "Breathy Voice": "ThT5KcBeYPX3keUQqHPh",
  "Confident Voice": "pNInz6obpgDQGcFmaJgB",
};

// ---------------------------------------------------------------------------
// Directory helpers
// ---------------------------------------------------------------------------

function getPublicImagesDir(): string {
  const dir = path.resolve(__dirname, "../../public/images");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getPublicAudioDir(): string {
  const dir = path.resolve(__dirname, "../../public/audio");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ---------------------------------------------------------------------------
// Pipeline helpers
// ---------------------------------------------------------------------------

async function planStory(intake: GenerateStoryRequest): Promise<StoryBrief> {
  const sceneCount = { "3 min": 4, "5 min": 5, "10 min": 7 }[intake.storyLength] ?? 5;

  const systemPrompt = `You are a premium story architect for an intimate, cinematic audio storytelling product.
Your job is to turn short user input into a rich internal story brief that guarantees emotional depth, pacing, and substance.
Do not write the final story yet.
Return only structured JSON — no markdown, no explanation.`;

  const userPrompt = `Take this user input and turn it into a hidden internal story brief.

User Input:
- Name: ${intake.listenerName || "the listener"}
- Mood: ${intake.mood}
- Intensity: ${intake.intensity}
- Length: ${intake.storyLength}
- Scenario: ${intake.scenarioPrompt || "(none given — infer the most compelling setup)"}
- Visual Emphasis: ${intake.cinematicVisuals ? "high" : "standard"}
- Emotional Emphasis: ${intake.emotionalFocus ? "high" : "standard"}

You must infer and return:
- emotional_arc
- relationship_dynamic
- conflict_type
- pacing_style
- ending_type
- sensory_palette
- point_of_view
- voice_tone
- scene_count (must be ${sceneCount})
- scene_plan (array of ${sceneCount} scenes)
- recurring_motif
- title_direction
- image_style_direction

Rules:
- The story must feel intimate, cinematic, emotionally immersive, and adult in tone.
- Sensual is allowed, but do NOT make it explicit.
- Prioritise emotional tension, atmosphere, vulnerability, and anticipation.
- Avoid generic plots and clichés.
- Ensure the story has depth even if the user input is simple.
- The story should feel like it is happening to the listener.
- If the user input is vague, intelligently infer the most compelling emotional setup.
- image_style_direction must specify a premium adult animation aesthetic (e.g. "cinematic adult animation, warm tones, painterly, moody lighting, tasteful intimacy")

Return JSON in exactly this shape:
{
  "emotional_arc": "curiosity → vulnerability → longing",
  "relationship_dynamic": "old friends reconnecting",
  "conflict_type": "things left unsaid for years",
  "pacing_style": "slow and intimate",
  "ending_type": "lingering and unresolved",
  "sensory_palette": ["warm lamplight", "quiet night air", "close silence"],
  "point_of_view": "second person",
  "voice_tone": "soft, cinematic, intimate",
  "scene_count": ${sceneCount},
  "scene_plan": [
    {
      "scene_number": 1,
      "goal": "hook and atmosphere",
      "emotional_shift": "curiosity begins",
      "visual_focus": "night setting, first glance"
    }
  ],
  "recurring_motif": "the feeling of almost saying too much",
  "title_direction": "poetic, emotionally charged, premium",
  "image_style_direction": "cinematic adult animation, warm oil-painting tones, moody lighting, tasteful sensuality, elegant composition"
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_completion_tokens: 2048,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as StoryBrief;
}

async function writeStoryFromBrief(brief: StoryBrief, listenerName: string): Promise<WrittenStory> {
  const systemPrompt = `You are writing premium, immersive audio stories for a consumer storytelling product.
The story must feel emotionally deep, cinematic, sensual but not explicit, and designed for voice narration.
Write with control, atmosphere, subtext, and elegance.`;

  const userPrompt = `Using the internal story brief below, write the final story.

Internal Brief:
${JSON.stringify(brief, null, 2)}

The listener's name is: ${listenerName || "you"}

Requirements:
- Use ${brief.point_of_view} point of view — address the listener as "you" throughout
- Write exactly ${brief.scene_count} scenes, following the scene_plan precisely
- Match the emotional arc exactly: ${brief.emotional_arc}
- Pacing: ${brief.pacing_style}
- Voice tone: ${brief.voice_tone}
- Include the recurring motif: "${brief.recurring_motif}"
- Each scene must have a clear emotional purpose matching its goal in scene_plan
- Include one strong sensory detail per scene from the palette: ${brief.sensory_palette.join(", ")}
- Include at least one moment of vulnerability
- Include relationship tension: ${brief.relationship_dynamic}
- The ending should feel: ${brief.ending_type}
- Keep it emotionally rich, not generic
- Avoid clichés and rushed pacing
- Avoid explicit sexual detail
- Ideal for intimate voice narration — use pauses, ellipsis, short sentences for breath

Return JSON only in this exact format — no markdown, no explanation:
{
  "title": "...",
  "description": "one compelling sentence hook",
  "scenes": [
    {
      "id": 1,
      "heading": "short evocative scene title",
      "text": "full scene narration text in second person (100-180 words)",
      "duration_estimate": 60
    }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    title: parsed.title,
    description: parsed.description,
    scenes: (parsed.scenes ?? []).map((s: { id: number; heading: string; text: string; duration_estimate: number }) => ({
      id: s.id,
      heading: s.heading ?? `Scene ${s.id}`,
      text: s.text,
      visualPrompt: "",
      durationEstimate: s.duration_estimate ?? 60,
    })),
  };
}

async function buildImagePrompts(brief: StoryBrief, story: WrittenStory): Promise<ImagePrompts> {
  const systemPrompt = `You generate image prompts for premium cinematic adult animation artwork.
The output must be tasteful, intimate, warm, emotionally charged, and visually cohesive across all scenes.
Do not create explicit sexual imagery. Style should be: ${brief.image_style_direction}.`;

  const BASE_STYLE = "cinematic animated illustration, adult romance tone, tasteful intimacy, soft lighting, warm shadows, elegant composition, premium streaming artwork, not explicit";

  const userPrompt = `Using the brief and story below, generate one cover image prompt and one scene image prompt per scene.

Story Brief:
${JSON.stringify({ emotional_arc: brief.emotional_arc, relationship_dynamic: brief.relationship_dynamic, sensory_palette: brief.sensory_palette, image_style_direction: brief.image_style_direction }, null, 2)}

Story:
Title: ${story.title}
Scenes: ${story.scenes.map((s, i) => `Scene ${i + 1} "${s.heading}": ${s.text.slice(0, 120)}...`).join("\n")}

Requirements:
- Style for ALL images: "${BASE_STYLE}, ${brief.image_style_direction}"
- Cinematic composition, soft shadows, warm lighting, emotionally intimate
- Visually cohesive — all images should feel from the same story world
- Characters should feel consistent in style (not in specific appearance details, but in visual treatment)
- Cover should capture the emotional essence, not a specific scene moment
- Each scene prompt should match that scene's emotional shift and visual focus

Return JSON only — no markdown:
{
  "cover_prompt": "...",
  "scene_prompts": [
    { "scene_id": 1, "prompt": "..." }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_completion_tokens: 2048,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    coverPrompt: parsed.cover_prompt,
    scenePrompts: (parsed.scene_prompts ?? []).map((s: { scene_id: number; prompt: string }) => ({
      sceneId: s.scene_id,
      prompt: s.prompt,
    })),
  };
}

async function generateAllImages(
  prompts: ImagePrompts,
  cacheKey: string
): Promise<{ cover: string; scenes: string[] }> {
  const imagesDir = getPublicImagesDir();

  const allBuffers: Buffer[] = await Promise.all([
    generateImageBuffer(prompts.coverPrompt, "1024x1024"),
    ...prompts.scenePrompts.map((sp) => generateImageBuffer(sp.prompt, "1024x1024")),
  ]);

  const coverBuffer = allBuffers[0];
  const sceneBuffers = allBuffers.slice(1);

  const coverFilename = `cover-${cacheKey}.png`;
  fs.writeFileSync(path.join(imagesDir, coverFilename), coverBuffer);
  const coverUrl = `/api/images/${coverFilename}`;

  const sceneUrls: string[] = sceneBuffers.map((buf: Buffer, i: number) => {
    const filename = `scene-${cacheKey}-${i}.png`;
    fs.writeFileSync(path.join(imagesDir, filename), buf);
    return `/api/images/${filename}`;
  });

  return { cover: coverUrl, scenes: sceneUrls };
}

async function generateAudioFile(
  scenes: Scene[],
  voiceFeel: string,
  cacheKey: string
): Promise<string> {
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenLabsApiKey) return "";

  const voiceId = voiceIdMap[voiceFeel] ?? voiceIdMap["Soft Voice"];
  const fullText = scenes.map((s) => s.text).join("\n\n");

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: fullText,
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.6, similarity_boost: 0.7, style: 0.8 },
        }),
      }
    );

    if (!response.ok) throw new Error(`ElevenLabs ${response.status}`);

    const audioDir = getPublicAudioDir();
    const filename = `audio-${cacheKey}.mp3`;
    fs.writeFileSync(path.join(audioDir, filename), Buffer.from(await response.arrayBuffer()));
    return `/api/audio/${filename}`;
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

router.post("/plan-story", async (req, res) => {
  const body = req.body as GenerateStoryRequest;
  const cacheKey = getCacheKey(body);

  if (briefCache.has(cacheKey)) {
    res.json(briefCache.get(cacheKey));
    return;
  }

  try {
    const brief = await planStory(body);
    briefCache.set(cacheKey, brief);
    res.json(brief);
  } catch (err) {
    req.log.error({ err }, "Story planning failed");
    res.status(500).json({ error: "Story planning failed" });
  }
});

router.post("/generate-story", async (req, res) => {
  const { brief, listenerName } = req.body as { brief: StoryBrief; listenerName?: string };
  const cacheKey = getCacheKey({ brief, listenerName });

  if (storyCache.has(cacheKey)) {
    res.json(storyCache.get(cacheKey));
    return;
  }

  try {
    const story = await writeStoryFromBrief(brief, listenerName ?? "");
    storyCache.set(cacheKey, story);
    res.json(story);
  } catch (err) {
    req.log.error({ err }, "Story generation failed");
    res.status(500).json({ error: "Story generation failed" });
  }
});

router.post("/generate-image-prompts", async (req, res) => {
  const { brief, story } = req.body as { brief: StoryBrief; story: WrittenStory };
  const cacheKey = getCacheKey({ brief, story });

  if (imagePromptCache.has(cacheKey)) {
    res.json(imagePromptCache.get(cacheKey));
    return;
  }

  try {
    const prompts = await buildImagePrompts(brief, story);
    imagePromptCache.set(cacheKey, prompts);
    res.json(prompts);
  } catch (err) {
    req.log.error({ err }, "Image prompt generation failed");
    res.status(500).json({ error: "Image prompt generation failed" });
  }
});

router.post("/generate-audio", async (req, res) => {
  const { text, voiceFeel } = req.body as { text: string; voiceFeel: string };
  const cacheKey = getCacheKey({ text, voiceFeel });

  if (audioCache.has(cacheKey)) {
    res.json({ audioUrl: audioCache.get(cacheKey) });
    return;
  }

  try {
    const fakeScene: Scene = { id: 1, heading: "", text, visualPrompt: "", durationEstimate: 0 };
    const audioUrl = await generateAudioFile([fakeScene], voiceFeel, cacheKey);
    audioCache.set(cacheKey, audioUrl);
    res.json({ audioUrl });
  } catch (err) {
    req.log.error({ err }, "Audio generation failed");
    res.status(500).json({ error: "Audio generation failed" });
  }
});

router.post("/generate-images", async (req, res) => {
  const body = req.body as { coverPrompt: string; scenePrompts: string[] };
  const cacheKey = getCacheKey(body);

  if (imageCache.has(cacheKey)) {
    res.json(imageCache.get(cacheKey));
    return;
  }

  try {
    const prompts: ImagePrompts = {
      coverPrompt: body.coverPrompt,
      scenePrompts: body.scenePrompts.map((p, i) => ({ sceneId: i + 1, prompt: p })),
    };
    const result = await generateAllImages(prompts, cacheKey);
    imageCache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Image generation failed");
    res.status(500).json({ error: "Image generation failed" });
  }
});

router.post("/generate-full-story", async (req, res) => {
  const intake = req.body as GenerateStoryRequest;
  const cacheKey = getCacheKey(intake);

  if (fullStoryCache.has(cacheKey)) {
    res.json({ ...fullStoryCache.get(cacheKey), cached: true });
    return;
  }

  const TIMEOUT_MS = 120_000;

  const pipeline = async () => {
    // Step 1: Plan the story (hidden layer)
    const brief = await planStory(intake);
    briefCache.set(cacheKey, brief);

    // Step 2: Write the story from the brief
    const story = await writeStoryFromBrief(brief, intake.listenerName);
    storyCache.set(cacheKey, story);

    // Step 3: Build cohesive image prompts
    const imagePrompts = await buildImagePrompts(brief, story);
    imagePromptCache.set(cacheKey, imagePrompts);

    // Step 4: Generate audio + images in PARALLEL
    const [images, audioUrl] = await Promise.all([
      generateAllImages(imagePrompts, cacheKey),
      generateAudioFile(story.scenes, intake.voiceFeel, cacheKey),
    ]);

    // Step 5: Attach visual prompts from imagePrompts back to scenes
    const scenesWithImages = story.scenes.map((scene, i) => ({
      ...scene,
      visualPrompt: imagePrompts.scenePrompts[i]?.prompt ?? "",
      image: images.scenes[i],
    }));

    const result = {
      id: cacheKey,
      title: story.title,
      description: story.description,
      mood: intake.mood,
      audioUrl,
      duration: intake.storyLength,
      brief,
      scenes: scenesWithImages,
      images: {
        cover: images.cover,
        scenes: images.scenes,
      },
      cached: false,
    };

    fullStoryCache.set(cacheKey, result);
    return result;
  };

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Generation timed out after 120 seconds")), TIMEOUT_MS)
  );

  try {
    const result = await Promise.race([pipeline(), timeoutPromise]);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Full story generation failed");
    const message = err instanceof Error ? err.message : "Full story generation failed";
    res.status(500).json({ error: message });
  }
});

export default router;
