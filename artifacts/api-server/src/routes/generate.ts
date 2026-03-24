import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router: IRouter = Router();

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

interface Scene {
  id: number;
  text: string;
  visualPrompt: string;
  durationEstimate: number;
}

interface GeneratedStory {
  title: string;
  description: string;
  scenes: Scene[];
}

const storyCache = new Map<string, GeneratedStory>();
const audioCache = new Map<string, string>();
const imageCache = new Map<string, { cover: string; scenes: string[] }>();
const fullStoryCache = new Map<string, object>();

function getCacheKey(data: object): string {
  return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
}

const sceneCountByLength: Record<string, number> = {
  "3 min": 4,
  "5 min": 5,
  "10 min": 6,
};

const voiceIdMap: Record<string, string> = {
  "Soft Voice": "EXAVITQu4vr4xnSDxMaL",
  "Deep Voice": "VR6AewLTigWG4xSOukaG",
  "Breathy Voice": "ThT5KcBeYPX3keUQqHPh",
  "Confident Voice": "pNInz6obpgDQGcFmaJgB",
};

function getPublicImagesDir(): string {
  const dir = path.resolve(__dirname, "../../public/images");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

router.post("/generate-story", async (req, res) => {
  const body = req.body as GenerateStoryRequest;
  const cacheKey = getCacheKey(body);

  if (storyCache.has(cacheKey)) {
    res.json(storyCache.get(cacheKey));
    return;
  }

  const sceneCount = sceneCountByLength[body.storyLength] ?? 5;

  const systemPrompt = `You are a premium immersive audio storytelling AI. Write an intimate, cinematic, second-person audio story.
Make the listener feel like the story is happening to them personally. Use "you" throughout.
Prioritise atmosphere, emotional subtext, pauses, tension, and anticipation over explicit action.
Avoid generic narration, clumsy exposition, and explicit sexual detail.
The tone should be: intimate, cinematic, emotionally charged, adult, and deeply atmospheric.
${body.emotionalFocus ? "Give extra weight to emotional depth and vulnerability." : ""}
${body.cinematicVisuals ? "Make every scene richly visual — the reader should see it like a film." : ""}`;

  const userPrompt = `Write an immersive audio story for ${body.listenerName}.
Mood/Genre: ${body.mood}
Intensity: ${body.intensity}
Story length: ${body.storyLength} (${sceneCount} scenes, ~${body.storyLength === "3 min" ? "30-40" : body.storyLength === "5 min" ? "45-60" : "80-100"} seconds each)
Scenario: ${body.scenarioPrompt}

Return ONLY valid JSON in this exact shape (no markdown, no explanation):
{
  "title": "story title",
  "description": "one-sentence hook/description",
  "scenes": [
    {
      "id": 1,
      "text": "full scene narration text in second person",
      "visual_prompt": "cinematic image description for scene",
      "duration_estimate": 60
    }
  ]
}

The text for each scene should be 80-150 words. All ${sceneCount} scenes must be present.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(rawContent);

    const story: GeneratedStory = {
      title: parsed.title,
      description: parsed.description,
      scenes: (parsed.scenes ?? []).map((s: { id: number; text: string; visual_prompt: string; duration_estimate: number }) => ({
        id: s.id,
        text: s.text,
        visualPrompt: s.visual_prompt,
        durationEstimate: s.duration_estimate,
      })),
    };

    storyCache.set(cacheKey, story);
    res.json(story);
  } catch (err) {
    req.log.error({ err }, "Story generation failed");
    res.status(500).json({ error: "Story generation failed" });
  }
});

router.post("/generate-audio", async (req, res) => {
  const { text, voiceFeel } = req.body as { text: string; voiceFeel: string };
  const cacheKey = getCacheKey({ text, voiceFeel });

  if (audioCache.has(cacheKey)) {
    res.json({ audioUrl: audioCache.get(cacheKey), duration: 0 });
    return;
  }

  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenLabsApiKey) {
    req.log.warn("No ELEVENLABS_API_KEY set, returning placeholder audio URL");
    const placeholder = "/api/audio/placeholder";
    audioCache.set(cacheKey, placeholder);
    res.json({ audioUrl: placeholder, duration: 0 });
    return;
  }

  const voiceId = voiceIdMap[voiceFeel] ?? voiceIdMap["Soft Voice"];

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
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.7,
            style: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const filename = `audio-${cacheKey}.mp3`;
    const audioDir = path.resolve(__dirname, "../../public/audio");
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    fs.writeFileSync(path.join(audioDir, filename), audioBuffer);
    const audioUrl = `/api/audio/${filename}`;

    audioCache.set(cacheKey, audioUrl);
    res.json({ audioUrl, duration: 0 });
  } catch (err) {
    req.log.error({ err }, "Audio generation failed");
    res.status(500).json({ error: "Audio generation failed" });
  }
});

router.post("/generate-images", async (req, res) => {
  const { coverPrompt, scenePrompts } = req.body as {
    coverPrompt: string;
    scenePrompts: string[];
  };
  const cacheKey = getCacheKey({ coverPrompt, scenePrompts });

  if (imageCache.has(cacheKey)) {
    res.json(imageCache.get(cacheKey));
    return;
  }

  const styleBase =
    "cinematic animated illustration, adult romance tone, tasteful and intimate, soft shadows, realistic lighting, warm tones, elegant composition, premium streaming artwork, not explicit, ";

  try {
    const imagesDir = getPublicImagesDir();

    const coverBuffer = await generateImageBuffer(
      styleBase + coverPrompt,
      "1024x1024"
    );
    const coverFilename = `cover-${cacheKey}.png`;
    fs.writeFileSync(path.join(imagesDir, coverFilename), coverBuffer);
    const coverUrl = `/api/images/${coverFilename}`;

    const sceneUrls: string[] = [];
    for (let i = 0; i < scenePrompts.length; i++) {
      const sceneBuffer = await generateImageBuffer(
        styleBase + scenePrompts[i],
        "1024x1024"
      );
      const sceneFilename = `scene-${cacheKey}-${i}.png`;
      fs.writeFileSync(path.join(imagesDir, sceneFilename), sceneBuffer);
      sceneUrls.push(`/api/images/${sceneFilename}`);
    }

    const result = { cover: coverUrl, scenes: sceneUrls };
    imageCache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Image generation failed");
    res.status(500).json({ error: "Image generation failed" });
  }
});

router.post("/generate-full-story", async (req, res) => {
  const body = req.body as GenerateStoryRequest;
  const cacheKey = getCacheKey(body);

  if (fullStoryCache.has(cacheKey)) {
    res.json({ ...fullStoryCache.get(cacheKey), cached: true });
    return;
  }

  try {
    const sceneCount = sceneCountByLength[body.storyLength] ?? 5;

    const systemPrompt = `You are a premium immersive audio storytelling AI. Write an intimate, cinematic, second-person audio story.
Make the listener feel like the story is happening to them personally. Use "you" throughout.
Prioritise atmosphere, emotional subtext, pauses, tension, and anticipation over explicit action.
Avoid generic narration and explicit sexual detail.
The tone should be: intimate, cinematic, emotionally charged, adult, atmospheric.
${body.emotionalFocus ? "Give extra weight to emotional depth and vulnerability." : ""}
${body.cinematicVisuals ? "Make every scene richly visual — the reader should see it like a film." : ""}`;

    const userPrompt = `Write an immersive audio story for ${body.listenerName}.
Mood/Genre: ${body.mood}
Intensity: ${body.intensity}
Story length: ${body.storyLength} (${sceneCount} scenes)
Scenario: ${body.scenarioPrompt}

Return ONLY valid JSON:
{
  "title": "story title",
  "description": "one-sentence hook",
  "scenes": [
    {
      "id": 1,
      "text": "full scene narration in second person (80-150 words)",
      "visual_prompt": "cinematic description for scene image",
      "duration_estimate": 60
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(rawContent);

    const scenes: Scene[] = (parsed.scenes ?? []).map((s: { id: number; text: string; visual_prompt: string; duration_estimate: number }) => ({
      id: s.id,
      text: s.text,
      visualPrompt: s.visual_prompt,
      durationEstimate: s.duration_estimate,
    }));

    const styleBase =
      "cinematic animated illustration, adult romance tone, tasteful and intimate, soft shadows, warm tones, elegant composition, premium streaming artwork, not explicit, ";

    const imagesDir = getPublicImagesDir();

    const coverBuffer = await generateImageBuffer(
      styleBase + `cover art for story: ${parsed.title}. ${body.mood} mood, intimate atmosphere.`,
      "1024x1024"
    );
    const coverFilename = `cover-full-${cacheKey}.png`;
    fs.writeFileSync(path.join(imagesDir, coverFilename), coverBuffer);
    const coverUrl = `/api/images/${coverFilename}`;

    const sceneImageUrls: string[] = [];
    for (let i = 0; i < scenes.length; i++) {
      const sceneBuffer = await generateImageBuffer(
        styleBase + scenes[i].visualPrompt,
        "1024x1024"
      );
      const sceneFilename = `scene-full-${cacheKey}-${i}.png`;
      fs.writeFileSync(path.join(imagesDir, sceneFilename), sceneBuffer);
      sceneImageUrls.push(`/api/images/${sceneFilename}`);
    }

    const fullText = scenes.map((s) => s.text).join("\n\n");

    let audioUrl = `/api/audio/placeholder`;
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

    if (elevenLabsApiKey) {
      const voiceId = voiceIdMap[body.voiceFeel] ?? voiceIdMap["Soft Voice"];
      try {
        const audioResponse = await fetch(
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
              voice_settings: {
                stability: 0.6,
                similarity_boost: 0.7,
                style: 0.8,
              },
            }),
          }
        );

        if (audioResponse.ok) {
          const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
          const audioDir = path.resolve(__dirname, "../../public/audio");
          if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
          }
          const audioFilename = `audio-full-${cacheKey}.mp3`;
          fs.writeFileSync(path.join(audioDir, audioFilename), audioBuffer);
          audioUrl = `/api/audio/${audioFilename}`;
        }
      } catch (audioErr) {
        req.log.error({ audioErr }, "Audio generation failed, continuing without audio");
      }
    }

    const result = {
      id: cacheKey,
      title: parsed.title,
      description: parsed.description,
      mood: body.mood,
      audioUrl,
      duration: body.storyLength,
      scenes: scenes.map((s, i) => ({ ...s, image: sceneImageUrls[i] })),
      images: {
        cover: coverUrl,
        scenes: sceneImageUrls,
      },
      cached: false,
    };

    fullStoryCache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Full story generation failed");
    res.status(500).json({ error: "Full story generation failed" });
  }
});

export default router;
