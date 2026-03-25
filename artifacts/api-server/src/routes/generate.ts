import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import { openrouter, MISTRAL_MODEL } from "../lib/openrouter.js";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { storiesStore, generatedCacheStore } from "../lib/storage.js";
import { trackGeneratedStory } from "./library.js";

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
  whoIsHe?: string;
  dynamic?: string;
  ending?: string;
  setting?: string;
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

interface SceneVisual {
  scene_subject: string;
  scene_action: string;
  environment: string;
  lighting: string;
  emotion: string;
  composition: string;
  key_visual_details: string;
}

const BASE_STYLE =
  "cinematic adult animation, premium streaming-quality illustration, emotionally driven romance, tasteful sensuality, soft cinematic lighting, warm amber and deep shadow contrast, shallow depth of field, filmic composition, high-detail character rendering, subtle skin texture, expressive eyes, elegant body language, non-explicit, cohesive color palette, consistent character design, soft film grain, romantic realism, intimate atmosphere, tension-filled stillness, signature warm vs cool cinematic contrast, dramatic romantic lighting identity, consistent lens style (50mm cinematic), soft background bokeh, foreground subject focus";

function buildFinalPrompt(visual: SceneVisual): string {
  return [
    BASE_STYLE,
    `${visual.scene_subject}, ${visual.scene_action}`,
    visual.environment,
    visual.lighting,
    visual.emotion,
    visual.composition,
    visual.key_visual_details,
  ].join(", ");
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

const voiceMap: Record<string, "nova" | "onyx" | "shimmer" | "echo"> = {
  "Soft Voice": "nova",
  "Deep Voice": "onyx",
  "Breathy Voice": "shimmer",
  "Confident Voice": "echo",
};

// ---------------------------------------------------------------------------
// Validation constants
// ---------------------------------------------------------------------------

const VALID_MOODS = ["Slow Burn", "Late Night", "Emotional", "Forbidden", "First Encounter", "Tender"];
const VALID_INTENSITIES = ["Tender", "Heated", "Explicit", "Scorching"];
const VALID_VOICES = ["Soft Voice", "Deep Voice", "Breathy Voice", "Confident Voice"];
const VALID_LENGTHS = ["3 min", "5 min", "10 min"];

function buildCustomIntensityGuidance(intensity: string): string {
  const map: Record<string, string> = {
    Tender: `CONTENT LEVEL — TENDER: Focus on emotional tension, longing, and almost-touch. Physical content is poetic and implied. The body is present but desire is expressed through restraint, proximity, and anticipation rather than explicit description.`,
    Heated: `CONTENT LEVEL — HEATED: Desire should feel physically real and building. Describe physical awareness, warmth, closeness, and kisses with heat and specificity. The most intimate moments have clear physical presence — touching, holding, wanting — and are written with genuine heat without clinical detail.`,
    Explicit: `CONTENT LEVEL — EXPLICIT: This story requires fully explicit adult content. Name anatomy. Describe physical acts as they happen. Do not fade to black or summarise intimate moments — describe them in full. His desire and hers must both be rendered specifically and physically. Stay present through intimate scenes from first moment to last.`,
    Scorching: `CONTENT LEVEL — SCORCHING: Maximum explicit adult content. No qualifier. No restraint. Name anatomy directly. Name acts directly. Describe penetration, movement, friction, sensation as they occur. His arousal and hers must be described explicitly throughout. The story must be viscerally, physically arousing from its first scene to its last. Nothing euphemistic. Nothing implied where it can be named.`,
  };
  return map[intensity] ?? map["Heated"];
}

// ---------------------------------------------------------------------------
// Directory helpers
// ---------------------------------------------------------------------------

function getPublicImagesDir(): string {
  const dir = path.resolve(__dirname, "../public/images");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getPublicAudioDir(): string {
  const dir = path.resolve(__dirname, "../public/audio");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ---------------------------------------------------------------------------
// Input Normalisation
// ---------------------------------------------------------------------------

function normaliseIntake(raw: GenerateStoryRequest): GenerateStoryRequest {
  const mood = VALID_MOODS.includes(raw.mood) ? raw.mood : "Emotional";
  const intensity = VALID_INTENSITIES.includes(raw.intensity) ? raw.intensity : "Heated";
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
    whoIsHe: raw.whoIsHe?.trim() || undefined,
    dynamic: raw.dynamic?.trim() || undefined,
    ending: raw.ending?.trim() || undefined,
    setting: raw.setting?.trim() || undefined,
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

  const intensityGuidance = buildCustomIntensityGuidance(intake.intensity);

  const userPrompt = `Take this user input and turn it into a hidden internal story brief.

User Input:
- Name: ${intake.listenerName || "the listener"}
- Mood: ${intake.mood}
- Intensity: ${intake.intensity}
- Length: ${intake.storyLength}
- Scenario: ${intake.scenarioPrompt || "(none given — infer the most compelling setup)"}
- Setting Preference: ${intake.setting || "(not specified — choose based on scenario)"}
- Who He Is: ${intake.whoIsHe || "(not specified — infer from scenario and mood)"}
- Power Dynamic: ${intake.dynamic || "(not specified — infer from scenario)"}
- Preferred Ending: ${intake.ending || "(not specified — choose from variety pools)"}
- Visual Emphasis: ${intake.cinematicVisuals ? "high" : "standard"}
- Emotional Emphasis: ${intake.emotionalFocus ? "high" : "standard"}

${intensityGuidance}

You must infer and return:
- emotional_arc (from the variety pools above — choose intelligently)
- relationship_dynamic (from the variety pools above — honour "Who He Is" and "Power Dynamic" if specified)
- conflict_type (from the variety pools above)
- pacing_style
- ending_type (from the variety pools above — honour "Preferred Ending" if specified)
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
- Honour the intensity level directive above — it determines how explicit the final story will be.
- Prioritise specificity over abstraction: name the setting, name the dynamic, name the feeling.
- Avoid generic plots and clichés.
- Ensure the story has depth even if the user input is simple.
- The story should feel like it is happening to the listener.
- If the user input is vague, intelligently infer the most compelling emotional setup.
- image_style_direction: a one-line mood note for internal use only (e.g. "warm oil-painting tones, moody late-night lighting, amber shadows")

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

async function writeStoryFromBrief(brief: StoryBrief, listenerName: string, intensity = "Heated"): Promise<WrittenStory> {
  const intensityGuidance = buildCustomIntensityGuidance(intensity);

  const systemPrompt = `You are writing premium, immersive audio stories for a consumer storytelling product.
The story must feel emotionally deep, cinematic, and designed for voice narration.
Write with control, atmosphere, subtext, and elegance.
${intensityGuidance}`;

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
- Honour the intensity level in the system prompt — this determines how explicit each intimate scene must be
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

  const completion = await openrouter.chat.completions.create({
    model: MISTRAL_MODEL,
    max_tokens: 8192,
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

  // Hard rules for targeted rewrite strategies — applied independently of pass status.
  // The pipeline decides whether to regenerate (score_total < 7.5) or targeted-rewrite.
  // "regenerate" is intentionally NOT a valid rewrite_strategy value here; it is
  // handled as pipeline control logic in generate-full-story based on score_total.
  let rewriteStrategy: string | null = null;
  if (subScores.ending_strength < 7) {
    rewriteStrategy = "rewrite_ending";
  } else if (subScores.specificity < 7) {
    rewriteStrategy = "increase_specificity";
  } else if (subScores.originality < 6.5) {
    rewriteStrategy = "rotate_dynamic_or_setting";
  } else if (!passed) {
    rewriteStrategy = parsed.rewrite_strategy ?? "rewrite_ending";
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

  const completion = await openrouter.chat.completions.create({
    model: MISTRAL_MODEL,
    max_tokens: 8192,
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
  const systemPrompt = `Extract the scene visually from the story. Be specific and cinematic. Avoid generic words like 'beautiful', 'cinematic', or 'high quality'. Focus on physical details, lighting, motion, and emotion. The output must describe what is visibly happening in the scene.

Return only JSON — no markdown, no explanation. Every image entry must have exactly these fields:
- scene_subject: who is in the scene (specific, physical)
- scene_action: what they are physically doing (active, precise)
- environment: the physical location with specific sensory details
- lighting: specific light sources, direction, color temperature, contrast
- emotion: the felt emotional state — tension, longing, urgency, restraint, etc.
- composition: camera angle, framing, depth cues
- key_visual_details: 3–5 specific physical details that make this scene distinct

Do NOT output style instructions, quality descriptors, or vague words. Only describe what is physically, visibly happening.`;

  const userPrompt = `Story: "${story.title}"
Emotional arc: ${brief.emotional_arc}
Relationship: ${brief.relationship_dynamic}
Sensory palette: ${brief.sensory_palette?.join(", ")}

Generate a structured visual extraction for:
1. A COVER image that captures the emotional essence of the whole story (not a single scene moment — a symbolic or atmospheric composition)
${story.scenes.map((s, i) => `${i + 2}. Scene ${i + 1} — "${s.heading}": ${s.text.slice(0, 220)}`).join("\n")}

Return JSON only in exactly this shape:
{
  "cover": {
    "scene_subject": "",
    "scene_action": "",
    "environment": "",
    "lighting": "",
    "emotion": "",
    "composition": "",
    "key_visual_details": ""
  },
  "scenes": [
    {
      "scene_id": 1,
      "scene_subject": "",
      "scene_action": "",
      "environment": "",
      "lighting": "",
      "emotion": "",
      "composition": "",
      "key_visual_details": ""
    }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_completion_tokens: 3000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  const coverVisual = parsed.cover as SceneVisual;
  const sceneVisuals = (parsed.scenes ?? []) as Array<SceneVisual & { scene_id: number }>;

  return {
    coverPrompt: buildFinalPrompt(coverVisual),
    scenePrompts: sceneVisuals.map((s) => ({
      sceneId: s.scene_id,
      prompt: buildFinalPrompt(s),
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
  const voice = voiceMap[voiceFeel] ?? voiceMap["Soft Voice"];
  const fullText = scenes.map((s) => s.text).join("\n\n");

  try {
    const speechResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: fullText,
      response_format: "mp3",
    });

    const audioDir = getPublicAudioDir();
    const filename = `audio-${cacheKey}.mp3`;
    const buffer = Buffer.from(await speechResponse.arrayBuffer());
    fs.writeFileSync(path.join(audioDir, filename), buffer);
    return `/api/audio/${filename}`;
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Variation + Continuation helpers
// ---------------------------------------------------------------------------

async function rewriteStoryAsVariation(
  brief: StoryBrief,
  story: WrittenStory,
  variationType: string
): Promise<WrittenStory> {
  const variationInstructions: Record<string, string> = {
    softer:
      "Soften the emotional atmosphere throughout. More tenderness, less tension. Preserve the relationship and setting but make every exchange feel gentler and warmer.",
    darker:
      "Deepen the atmosphere. Add heavier emotional undertones, more unresolved pull, and deeper longing. The air should feel denser, the silences heavier.",
    slower:
      "Slow the pacing significantly. Expand the sensory dwelling. Add longer pauses between moments, more emotional build, more time in each scene before moving forward.",
    more_emotional:
      "Amplify the emotional vulnerability throughout. More interiority, more unspoken feeling, more weight in every exchange. Make the connection feel rawer and more exposed.",
    new_ending:
      "Preserve all scenes EXCEPT the final one exactly as written. Rewrite ONLY the ending scene with a completely different emotional resolution — different final note, different feeling to close on.",
    new_setting:
      "Move the entire story to a completely different physical location while preserving the characters, chemistry, emotional arc, and all dialogue beats exactly.",
    continue_chemistry:
      "Carry the emotional thread forward naturally, as if the story has one more secret chapter that was always there. Deepen the connection without resolving it. Leave them closer but still reaching.",
  };

  const instruction = variationInstructions[variationType] ?? variationInstructions.softer;

  const systemPrompt = `You are rewriting a premium cinematic audio story to apply a specific variation.
Preserve the emotional core of the story while applying the variation instruction.
Keep the writing premium, cinematic, and emotionally coherent.
Return a full new story JSON in the same schema as the original.
No markdown, no explanation — JSON only.`;

  const userPrompt = `Apply this variation to the story: "${instruction}"

Original Story Brief (preserve these elements):
${JSON.stringify({ emotional_arc: brief.emotional_arc, relationship_dynamic: brief.relationship_dynamic, ending_type: brief.ending_type, sensory_palette: brief.sensory_palette, recurring_motif: brief.recurring_motif }, null, 2)}

Original Story to vary:
${JSON.stringify({ title: story.title, description: story.description, scenes: story.scenes.map(s => ({ id: s.id, heading: s.heading, text: s.text })) }, null, 2)}

Return the varied story in this exact JSON shape (same number of scenes as original):
{
  "title": "...",
  "description": "one compelling sentence hook",
  "scenes": [
    {
      "id": 1,
      "heading": "short evocative scene title",
      "text": "full scene narration text in second person (100-180 words)",
      "duration_estimate": 60,
      "emotional_shift": "..."
    }
  ]
}`;

  const completion = await openrouter.chat.completions.create({
    model: MISTRAL_MODEL,
    max_tokens: 8192,
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

async function writeStoryContinuation(
  brief: StoryBrief,
  story: WrittenStory,
  continuationMode: string
): Promise<WrittenStory> {
  const modeInstructions: Record<string, string> = {
    keep_same_mood:
      "Continue at the exact same emotional temperature. Same mood, same atmosphere, seamlessly picking up where the story ended. Do not raise or lower the stakes.",
    raise_stakes:
      "The next chapter should push toward a more intense emotional moment. The connection deepens, the tension sharpens, something shifts that cannot be undone.",
    softer_continuation:
      "The next chapter moves to a softer, more tender register. Like the quiet after something significant — more intimate, more settled, more honest.",
    unresolved_continuation:
      "Continue but do not resolve. Leave everything still charged, even more saturated with what hasn't been said. End the chapter more unresolved than the original.",
  };

  const instruction = modeInstructions[continuationMode] ?? modeInstructions.keep_same_mood;
  const sceneCount = brief.scene_count ?? 5;

  const systemPrompt = `You are writing the next chapter of a premium cinematic audio story.
Do not restart from zero. This is a direct continuation.
Preserve the emotional logic, relationship dynamic, and tonal atmosphere of the original.
Make the continuation feel earned and inevitable — not random.
Return only JSON, no markdown, no explanation.`;

  const userPrompt = `Continue this story as the next chapter. ${instruction}

Original Story Brief:
${JSON.stringify({ emotional_arc: brief.emotional_arc, relationship_dynamic: brief.relationship_dynamic, conflict_type: brief.conflict_type, ending_type: brief.ending_type, sensory_palette: brief.sensory_palette, recurring_motif: brief.recurring_motif }, null, 2)}

Original Story (the chapter that just ended):
Title: ${story.title}
${story.scenes.map((s, i) => `Scene ${i + 1} — "${s.heading}":\n${s.text}`).join("\n\n")}

Write the NEXT CHAPTER as a completely new story with ${sceneCount} scenes.
Requirements:
- Do not repeat what already happened
- Pick up naturally from where the original story ended
- Use the same recurring motif: "${brief.recurring_motif}"
- Keep the same sensory palette
- Use second person point of view throughout
- The continuation should feel like it belongs in the same world

Return JSON only:
{
  "title": "...",
  "description": "one compelling sentence hook for this chapter",
  "scenes": [
    {
      "id": 1,
      "heading": "short evocative scene title",
      "text": "full scene narration text in second person (100-180 words)",
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
    title: parsed.title ?? `${story.title} — Continued`,
    description: parsed.description ?? story.description,
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

// ---------------------------------------------------------------------------
// Shared pipeline for variation + continuation (skips planStory — uses existing brief)
// ---------------------------------------------------------------------------

async function runDerivedPipeline(
  brief: StoryBrief,
  story: WrittenStory,
  voiceFeel: string,
  mood: string,
  duration: string,
  storyId: string,
  parentStoryId: string,
  variantType: string | null,
  userId: string | undefined
): Promise<Record<string, unknown>> {
  // QC + targeted rewrite pass
  let finalStory = story;
  let qcResult = await qcStory(brief, finalStory);
  if (qcResult.score_total < 7.5) {
    // One regeneration attempt isn't useful for derived stories — do targeted rewrite instead
    if (qcResult.rewrite_strategy) {
      finalStory = await rewriteStory(brief, finalStory, qcResult.rewrite_strategy);
    }
    qcResult = await qcStory(brief, finalStory);
  } else if (qcResult.rewrite_strategy) {
    finalStory = await rewriteStory(brief, finalStory, qcResult.rewrite_strategy);
    qcResult = await qcStory(brief, finalStory);
  }

  // Image prompts
  const imagePrompts = await buildImagePrompts(brief, finalStory);

  // Images + audio in parallel
  const pipelineKey = getCacheKey({ storyId, ts: Date.now() });
  const [images, audioUrl] = await Promise.all([
    generateAllImages(imagePrompts, pipelineKey),
    generateAudioFile(finalStory.scenes, voiceFeel, pipelineKey),
  ]);

  // Assemble scenes
  const scenesWithImages = finalStory.scenes.map((scene, i) => ({
    ...scene,
    visualPrompt: imagePrompts.scenePrompts[i]?.prompt ?? "",
    image: images.scenes[i],
  }));

  const result: Record<string, unknown> = {
    id: storyId,
    title: finalStory.title,
    description: finalStory.description,
    mood,
    audioUrl,
    duration,
    brief,
    scenes: scenesWithImages,
    images: { cover: images.cover, scenes: images.scenes },
    qc: qcResult,
    recommendation_tags: brief.recommendation_tags ?? [mood],
    cached: false,
    parent_story_id: parentStoryId,
    ...(variantType ? { variant_type: variantType } : {}),
  };

  await storiesStore.set(storyId, { ...result, ownerUserId: userId ?? null });

  if (userId) {
    await trackGeneratedStory(userId, storyId, mood, "Warm", voiceFeel, variantType);
  }

  return result;
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
  const { brief, listenerName, intensity } = req.body as { brief: StoryBrief; listenerName?: string; intensity?: string };
  const cacheKey = getCacheKey({ brief, listenerName });

  if (storyCache.has(cacheKey)) {
    res.json(storyCache.get(cacheKey));
    return;
  }

  try {
    const story = await writeStoryFromBrief(brief, listenerName ?? "", intensity ?? "Heated");
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
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const rawIntake = req.body as GenerateStoryRequest;

  // Step 1: Normalise input
  const intake = normaliseIntake(rawIntake);

  // Step 2: Create request hash and check persistent cache (bypass for variations/continuations)
  const requestHash = makeRequestHash(intake);
  if (!rawIntake.bypassCache) {
    const cachedStoryId = await generatedCacheStore.get(requestHash);
    if (cachedStoryId) {
      const cachedStory = await storiesStore.get(cachedStoryId);
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
    let story = await writeStoryFromBrief(brief, intake.listenerName, intake.intensity);

    // Step 5: QC evaluation
    let qcResult = await qcStory(brief, story);

    // Step 6: Apply hard rules — max one correction pass.
    // Hard rules (per spec):
    //   score_total < 7.5           → full regeneration (re-plan + re-write)
    //   ending_strength < 7         → targeted rewrite_ending
    //   specificity < 7             → targeted increase_specificity
    //   originality < 6.5           → targeted rotate_dynamic_or_setting
    // All four rules are checked independently (not only when story "fails").
    const needsRegenerate = qcResult.score_total < 7.5;
    const needsTargetedFix = !needsRegenerate && qcResult.rewrite_strategy !== null;

    if (needsRegenerate || needsTargetedFix) {
      if (needsRegenerate) {
        // Full regeneration: fresh plan + fresh write from scratch
        brief = await planStory(intake);
        story = await writeStoryFromBrief(brief, intake.listenerName, intake.intensity);
      } else {
        // Targeted rewrite of the weakest dimension only
        story = await rewriteStory(brief, story, qcResult.rewrite_strategy!);
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

    // Step 10: Persist to database.
    // bypassCache (variation/continuation) requests get a unique story ID so they
    // never overwrite an existing story stored under the same normalised hash.
    const storyId = rawIntake.bypassCache
      ? `${requestHash}-var-${Date.now()}`
      : requestHash;
    await storiesStore.set(storyId, { ...result as unknown as Record<string, unknown>, ownerUserId: req.user.id });
    if (!rawIntake.bypassCache) {
      await generatedCacheStore.set(requestHash, storyId);
    }

    // Step 11: Track in user profile (taste + generated stories list)
    await trackGeneratedStory(req.user.id, storyId, intake.mood, intake.intensity, intake.voiceFeel);

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

// ---------------------------------------------------------------------------
// POST /generate-variation
// ---------------------------------------------------------------------------

router.post("/generate-variation", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const { storyId, variation_type } = req.body as {
    storyId: string;
    variation_type: string;
  };
  const userId = req.user.id;

  if (!storyId || !variation_type) {
    res.status(400).json({ error: "storyId and variation_type are required" });
    return;
  }

  const VALID_VARIATION_TYPES = ["softer", "darker", "slower", "more_emotional", "new_ending", "new_setting", "continue_chemistry"];
  if (!VALID_VARIATION_TYPES.includes(variation_type)) {
    res.status(400).json({ error: `variation_type must be one of: ${VALID_VARIATION_TYPES.join(", ")}` });
    return;
  }

  const original = await storiesStore.get(storyId) as Record<string, unknown> | undefined;
  if (!original) {
    res.status(404).json({ error: "Story not found" });
    return;
  }

  const brief = original.brief as StoryBrief;
  const originalScenes = (original.scenes as Scene[]) ?? [];
  const originalStory: WrittenStory = {
    title: original.title as string,
    description: original.description as string,
    scenes: originalScenes,
  };
  const mood = (original.mood as string) ?? "Emotional";
  const duration = (original.duration as string) ?? "5 min";
  const voiceFeel = (brief?.voice_tone?.includes("deep") ? "Deep Voice" : "Soft Voice");

  const newStoryId = `${storyId}-var-${variation_type}-${Date.now()}`;

  const TIMEOUT_MS = 150_000;

  const pipeline = async () => {
    const variedStory = await rewriteStoryAsVariation(brief, originalStory, variation_type);
    return runDerivedPipeline(brief, variedStory, voiceFeel, mood, duration, newStoryId, storyId, variation_type, userId);
  };

  try {
    const result = await Promise.race([
      pipeline(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Generation timed out")), TIMEOUT_MS)),
    ]);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Variation generation failed");
    const message = err instanceof Error ? err.message : "Variation generation failed";
    res.status(500).json({ error: message });
  }
});

// ---------------------------------------------------------------------------
// POST /continue-story
// ---------------------------------------------------------------------------

router.post("/continue-story", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const { storyId, continuation_mode } = req.body as {
    storyId: string;
    continuation_mode: string;
  };
  const userId = req.user.id;

  if (!storyId || !continuation_mode) {
    res.status(400).json({ error: "storyId and continuation_mode are required" });
    return;
  }

  const VALID_MODES = ["keep_same_mood", "raise_stakes", "softer_continuation", "unresolved_continuation"];
  if (!VALID_MODES.includes(continuation_mode)) {
    res.status(400).json({ error: `continuation_mode must be one of: ${VALID_MODES.join(", ")}` });
    return;
  }

  const original = await storiesStore.get(storyId) as Record<string, unknown> | undefined;
  if (!original) {
    res.status(404).json({ error: "Story not found" });
    return;
  }

  const brief = original.brief as StoryBrief;
  const originalScenes = (original.scenes as Scene[]) ?? [];
  const originalStory: WrittenStory = {
    title: original.title as string,
    description: original.description as string,
    scenes: originalScenes,
  };
  const mood = (original.mood as string) ?? "Emotional";
  const duration = (original.duration as string) ?? "5 min";
  const voiceFeel = (brief?.voice_tone?.includes("deep") ? "Deep Voice" : "Soft Voice");

  const newStoryId = `${storyId}-cont-${continuation_mode}-${Date.now()}`;

  const TIMEOUT_MS = 150_000;

  const pipeline = async () => {
    const continuation = await writeStoryContinuation(brief, originalStory, continuation_mode);
    return runDerivedPipeline(brief, continuation, voiceFeel, mood, duration, newStoryId, storyId, null, userId);
  };

  try {
    const result = await Promise.race([
      pipeline(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Generation timed out")), TIMEOUT_MS)),
    ]);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Story continuation failed");
    const message = err instanceof Error ? err.message : "Story continuation failed";
    res.status(500).json({ error: message });
  }
});

export default router;
