import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { storiesStore, generatedCacheStore } from "../lib/storage.js";

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
  bypassCache?: boolean;
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
  recommendation_tags?: string[];
  quality_target?: string;
}

interface Scene {
  id: number;
  heading: string;
  text: string;
  visualPrompt: string;
  durationEstimate: number;
  emotionalShift?: string;
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

interface QcSubScores {
  emotional_depth: number;
  specificity: number;
  pacing: number;
  scene_progression: number;
  originality: number;
  sensory_detail: number;
  ending_strength: number;
}

interface QcResult {
  passed: boolean;
  score_total: number;
  sub_scores: QcSubScores;
  issues: string[];
  rewrite_strategy: string | null;
}

// ---------------------------------------------------------------------------
// In-memory caches (ephemeral, for within-request dedup)
// ---------------------------------------------------------------------------

const briefCache = new Map<string, StoryBrief>();
const storyCache = new Map<string, WrittenStory>();
const imagePromptCache = new Map<string, ImagePrompts>();
const audioCache = new Map<string, string>();
const imageCache = new Map<string, { cover: string; scenes: string[] }>();

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
// Validation constants
// ---------------------------------------------------------------------------

const VALID_MOODS = ["Slow Burn", "Late Night", "Emotional", "Forbidden", "First Encounter", "Tender"];
const VALID_INTENSITIES = ["Soft", "Warm", "Magnetic"];
const VALID_VOICES = ["Soft Voice", "Deep Voice", "Breathy Voice", "Confident Voice"];
const VALID_LENGTHS = ["3 min", "5 min", "10 min"];

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
// Input Normalisation
// ---------------------------------------------------------------------------

function normaliseIntake(raw: GenerateStoryRequest): GenerateStoryRequest {
  const mood = VALID_MOODS.includes(raw.mood) ? raw.mood : "Emotional";
  const intensity = VALID_INTENSITIES.includes(raw.intensity) ? raw.intensity : "Warm";
  const voiceFeel = VALID_VOICES.includes(raw.voiceFeel) ? raw.voiceFeel : "Soft Voice";
  const storyLength = VALID_LENGTHS.includes(raw.storyLength) ? raw.storyLength : "5 min";

  const rawScenario = raw.scenarioPrompt?.trim() ?? "";
  const meaningfulWords = rawScenario.split(/\s+/).filter((w) => w.length > 2);
  let scenarioPrompt: string;
  if (meaningfulWords.length === 0) {
    scenarioPrompt = "an unexpected late evening encounter that becomes emotionally charged";
  } else if (meaningfulWords.length < 6) {
    scenarioPrompt = `${rawScenario} — ${mood.toLowerCase()} atmosphere, ${intensity.toLowerCase()} emotional tone`;
  } else {
    scenarioPrompt = rawScenario;
  }

  return {
    listenerName: raw.listenerName?.trim() ?? "",
    mood,
    intensity,
    voiceFeel,
    storyLength,
    scenarioPrompt,
    cinematicVisuals: raw.cinematicVisuals ?? true,
    emotionalFocus: raw.emotionalFocus ?? false,
  };
}

function makeRequestHash(intake: GenerateStoryRequest): string {
  const key = [
    intake.listenerName,
    intake.mood,
    intake.intensity,
    intake.storyLength,
    intake.scenarioPrompt,
    intake.cinematicVisuals ? "1" : "0",
    intake.emotionalFocus ? "1" : "0",
    intake.voiceFeel,
  ].join("|");
  return crypto.createHash("md5").update(key).digest("hex");
}

// ---------------------------------------------------------------------------
// Story Bible (controlled variety pools)
// ---------------------------------------------------------------------------

const STORY_BIBLE = `
CONTROLLED VARIETY POOLS — draw from these intelligently. Rotate them across stories. Do not default to the same arc, dynamic, conflict, or ending every time.

EMOTIONAL ARCS (pick one that fits the user input best):
1. curiosity → trust → longing
2. distance → warmth → ache
3. tension → softness → vulnerability
4. uncertainty → closeness → unresolved pull

RELATIONSHIP DYNAMICS (pick one):
1. old friends reconnecting after time apart
2. strangers with instant, unexpected familiarity
3. former lovers crossing paths again
4. a missed connection finally becoming real
5. one person holding something back
6. an unexpected protector dynamic

CONFLICT TYPES (pick one):
1. too much left unsaid between them
2. wrong timing, right connection
3. fear of closeness despite wanting it
4. emotional hesitation at the edge of something real
5. one night that feels larger than it should
6. the risk of finally saying what is true

ENDING TYPES (pick one):
1. lingering and unresolved — it ends but does not finish
2. soft but hopeful — a gentle opening
3. bittersweet — something gained, something left behind
4. open-hearted pause — suspended in the moment
5. emotionally incomplete in a satisfying way — the story ends, the feeling does not

SENSORY PALETTES (pick one):
1. rain against glass, warm interior light, lowered voices
2. late-night city glow, quiet footsteps, cold air between bodies
3. summer dusk, skin warmth, the held breath before something changes
4. train vibration, passing lights, the intimacy of shared stillness
`;

// ---------------------------------------------------------------------------
// Pipeline helpers
// ---------------------------------------------------------------------------

async function planStory(intake: GenerateStoryRequest): Promise<StoryBrief> {
  const sceneCount = { "3 min": 4, "5 min": 5, "10 min": 7 }[intake.storyLength] ?? 5;

  const systemPrompt = `You are a premium story architect for an intimate, cinematic audio storytelling product.
Your job is to turn short user input into a rich internal story brief that guarantees emotional depth, pacing, and substance.
Do not write the final story yet.
Return only structured JSON — no markdown, no explanation.

${STORY_BIBLE}`;

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
- emotional_arc (from the variety pools above — choose intelligently)
- relationship_dynamic (from the variety pools above)
- conflict_type (from the variety pools above)
- pacing_style
- ending_type (from the variety pools above)
- sensory_palette (from the variety pools above)
- point_of_view
- voice_tone
- scene_count (must be ${sceneCount})
- scene_plan (array of ${sceneCount} scenes)
- recurring_motif
- title_direction
- image_style_direction
- recommendation_tags (array of 3–5 short mood/genre tags for personalisation, e.g. ["Late Night", "Reunion", "Longing", "Bittersweet"])
- quality_target (one sentence describing the emotional quality this story must achieve)

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
  "image_style_direction": "cinematic adult animation, warm oil-painting tones, moody lighting, tasteful sensuality, elegant composition",
  "recommendation_tags": ["Late Night", "Reunion", "Longing"],
  "quality_target": "A story that lingers like the feeling after a conversation you didn't want to end."
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
      "duration_estimate": 60,
      "emotional_shift": "curiosity gives way to something harder to name"
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
    scenes: (parsed.scenes ?? []).map((s: { id: number; heading: string; text: string; duration_estimate: number; emotional_shift?: string }) => ({
      id: s.id,
      heading: s.heading ?? `Scene ${s.id}`,
      text: s.text,
      visualPrompt: "",
      durationEstimate: s.duration_estimate ?? 60,
      emotionalShift: s.emotional_shift ?? "",
    })),
  };
}

async function qcStory(brief: StoryBrief, story: WrittenStory): Promise<QcResult> {
  const systemPrompt = `You are a quality controller for a premium audio storytelling product.
Evaluate stories against strict quality standards.
Return only JSON — no explanation, no markdown.`;

  const userPrompt = `Score this story on the following 7 dimensions (1-10 each):

1. emotional_depth — real emotional resonance, vulnerability, and weight
2. specificity — concrete, precise details vs vague or generic writing
3. pacing — appropriate rhythm and flow, not rushed or stagnant
4. scene_progression — scenes build on each other meaningfully, not repetitive
5. originality — fresh and distinctive, not clichéd or formulaic
6. sensory_detail — strong grounding sensory images present in each scene
7. ending_strength — the ending lands emotionally and feels earned

Story Brief Context:
${JSON.stringify({ emotional_arc: brief.emotional_arc, relationship_dynamic: brief.relationship_dynamic, ending_type: brief.ending_type }, null, 2)}

Story to evaluate:
Title: ${story.title}
${story.scenes.map((s, i) => `Scene ${i + 1} — "${s.heading}":\n${s.text}`).join("\n\n")}

Return JSON only:
{
  "score_total": 8.2,
  "sub_scores": {
    "emotional_depth": 8,
    "specificity": 8,
    "pacing": 8,
    "scene_progression": 8,
    "originality": 7,
    "sensory_detail": 9,
    "ending_strength": 8
  },
  "issues": ["list any specific problems here, or empty array if none"],
  "rewrite_strategy": null
}

rewrite_strategy must be one of: "rewrite_ending", "increase_specificity", "tighten_scene_flow", "increase_vulnerability", "rotate_dynamic_or_setting", or null.
Set it to the single most impactful fix needed, or null if the story passes.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_completion_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  const scoreTotal: number = parsed.score_total ?? 0;
  const subScores: QcSubScores = parsed.sub_scores ?? {
    emotional_depth: 0, specificity: 0, pacing: 0,
    scene_progression: 0, originality: 0, sensory_detail: 0, ending_strength: 0,
  };

  const passed = scoreTotal >= 7.5 && subScores.ending_strength >= 7;

  let rewriteStrategy: string | null = null;
  if (!passed) {
    if (scoreTotal < 6.0) {
      // Story is fundamentally weak — full regeneration required
      rewriteStrategy = "regenerate";
    } else if (subScores.originality < 6.5) {
      rewriteStrategy = "rotate_dynamic_or_setting";
    } else if (subScores.specificity < 7) {
      rewriteStrategy = "increase_specificity";
    } else if (subScores.ending_strength < 7) {
      rewriteStrategy = "rewrite_ending";
    } else {
      rewriteStrategy = parsed.rewrite_strategy ?? "rewrite_ending";
    }
  }

  return {
    passed,
    score_total: scoreTotal,
    sub_scores: subScores,
    issues: parsed.issues ?? [],
    rewrite_strategy: rewriteStrategy,
  };
}

async function rewriteStory(brief: StoryBrief, story: WrittenStory, strategy: string): Promise<WrittenStory> {
  const strategyInstructions: Record<string, string> = {
    rewrite_ending:
      "Keep everything except the final scene. Rewrite only the ending to be more emotionally resonant, earned, and true to the brief's ending_type. The final scene should linger.",
    increase_specificity:
      "Find all generic or vague lines and replace them with specific, concrete sensory details and precise observations. Preserve the emotional arc and plot entirely.",
    tighten_scene_flow:
      "Restructure scene transitions so they flow more naturally. Preserve all content and the emotional arc — just improve how scenes connect and build.",
    increase_vulnerability:
      "Add at least one moment of emotional vulnerability to the weakest scene. Do not change the plot or setting. Make one character reveal more emotional truth.",
    rotate_dynamic_or_setting:
      "Introduce a fresh angle on the relationship dynamic or shift one element of the setting slightly to add originality. Preserve the core emotional arc entirely.",
  };

  const instruction = strategyInstructions[strategy] ?? strategyInstructions.rewrite_ending;

  const systemPrompt = `You are rewriting a premium audio story to improve it on one specific quality dimension.
Apply the targeted improvement instruction precisely. Do not change what is not specified.
Return only valid JSON in the same schema as the input story — no markdown, no explanation.`;

  const userPrompt = `Apply this targeted improvement to the story:

IMPROVEMENT INSTRUCTION: ${instruction}

Original Brief Context:
${JSON.stringify({ emotional_arc: brief.emotional_arc, relationship_dynamic: brief.relationship_dynamic, ending_type: brief.ending_type, sensory_palette: brief.sensory_palette, recurring_motif: brief.recurring_motif }, null, 2)}

Original Story:
${JSON.stringify({ title: story.title, description: story.description, scenes: story.scenes.map(s => ({ id: s.id, heading: s.heading, text: s.text })) }, null, 2)}

Return the improved story in this exact JSON shape:
{
  "title": "...",
  "description": "...",
  "scenes": [
    {
      "id": 1,
      "heading": "...",
      "text": "...",
      "duration_estimate": 60,
      "emotional_shift": "..."
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
    title: parsed.title ?? story.title,
    description: parsed.description ?? story.description,
    scenes: (parsed.scenes ?? story.scenes).map((s: { id: number; heading: string; text: string; duration_estimate: number; emotional_shift?: string }) => ({
      id: s.id,
      heading: s.heading ?? `Scene ${s.id}`,
      text: s.text,
      visualPrompt: "",
      durationEstimate: s.duration_estimate ?? 60,
      emotionalShift: s.emotional_shift ?? "",
    })),
  };
}

async function buildImagePrompts(brief: StoryBrief, story: WrittenStory): Promise<ImagePrompts> {
  const systemPrompt = `You generate image prompts for premium cinematic adult animation artwork.
The output must be tasteful, intimate, warm, emotionally charged, and visually cohesive across all scenes.
Do not create explicit sexual imagery. Style should be: ${brief.image_style_direction}.`;

  const BASE_STYLE =
    "cinematic animated illustration, adult romance tone, tasteful intimacy, soft lighting, warm shadows, elegant composition, premium streaming artwork, not explicit";

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
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
    });

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

router.post("/qc-story", async (req, res) => {
  const { brief, story } = req.body as { brief: StoryBrief; story: WrittenStory };

  if (!brief || !story) {
    res.status(400).json({ error: "brief and story are required" });
    return;
  }

  try {
    const qcResult = await qcStory(brief, story);
    res.json(qcResult);
  } catch (err) {
    req.log.error({ err }, "QC evaluation failed");
    res.status(500).json({ error: "QC evaluation failed" });
  }
});

router.post("/rewrite-story", async (req, res) => {
  const { brief, story, strategy } = req.body as {
    brief: StoryBrief;
    story: WrittenStory;
    strategy: string;
  };

  if (!brief || !story || !strategy) {
    res.status(400).json({ error: "brief, story, and strategy are required" });
    return;
  }

  try {
    const improved = await rewriteStory(brief, story, strategy);
    res.json(improved);
  } catch (err) {
    req.log.error({ err }, "Story rewrite failed");
    res.status(500).json({ error: "Story rewrite failed" });
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
  const rawIntake = req.body as GenerateStoryRequest;

  // Step 1: Normalise input
  const intake = normaliseIntake(rawIntake);

  // Step 2: Create request hash and check persistent cache (bypass for variations/continuations)
  const requestHash = makeRequestHash(intake);
  if (!rawIntake.bypassCache) {
    const cachedStoryId = generatedCacheStore.get(requestHash);
    if (cachedStoryId) {
      const cachedStory = storiesStore.get(cachedStoryId);
      if (cachedStory) {
        res.json({ ...cachedStory, cached: true });
        return;
      }
    }
  }

  const TIMEOUT_MS = 150_000;

  const pipeline = async () => {
    // Step 3: Plan
    let brief = await planStory(intake);
    const planKey = getCacheKey({ intake });
    briefCache.set(planKey, brief);

    // Step 4: Write story
    let story = await writeStoryFromBrief(brief, intake.listenerName);

    // Step 5: QC evaluation
    let qcResult = await qcStory(brief, story);

    // Step 6: Fix QC failures — max one correction pass
    if (!qcResult.passed && qcResult.rewrite_strategy) {
      if (qcResult.rewrite_strategy === "regenerate") {
        // Full regeneration: re-plan with a fresh brief and re-write from scratch
        brief = await planStory(intake);
        story = await writeStoryFromBrief(brief, intake.listenerName);
      } else {
        // Targeted rewrite of the weakest dimension only
        story = await rewriteStory(brief, story, qcResult.rewrite_strategy);
      }
      // Re-run QC once after correction (result reflects final quality)
      qcResult = await qcStory(brief, story);
    }

    // Step 7: Image prompts
    const imagePrompts = await buildImagePrompts(brief, story);

    // Step 8: Images + audio in parallel
    const storyHash = getCacheKey({ brief, story });
    const [images, audioUrl] = await Promise.all([
      generateAllImages(imagePrompts, storyHash),
      generateAudioFile(story.scenes, intake.voiceFeel, storyHash),
    ]);

    // Step 9: Assemble final result
    const scenesWithImages = story.scenes.map((scene, i) => ({
      ...scene,
      visualPrompt: imagePrompts.scenePrompts[i]?.prompt ?? "",
      image: images.scenes[i],
    }));

    const result = {
      id: requestHash,
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
      qc: qcResult,
      recommendation_tags: brief.recommendation_tags ?? [intake.mood],
      cached: false,
    };

    // Step 10: Persist to JSON storage
    storiesStore.set(requestHash, result as unknown as Record<string, unknown>);
    generatedCacheStore.set(requestHash, requestHash);

    return result;
  };

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Generation timed out after 150 seconds")), TIMEOUT_MS)
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
