import { Router, type IRouter } from "express";
import crypto from "crypto";
import { storiesStore, seriesStore } from "../lib/storage.js";
import { trackGeneratedStory } from "./library.js";
import {
  planStory,
  writeStoryFromBrief,
  qcStory,
  rewriteStory,
  generateAllImages,
  generateAudioFile,
  buildCoverPromptFromCasting,
  buildCoverPromptFromBrief,
  getCacheKey,
  moderateInput,
  moderateOutput,
  logBlockedRequest,
  checkRiskThreshold,
  ContentModerationError,
  type GenerateStoryRequest,
  type GenerateStoryOptions,
  type StoryBrief,
  type WrittenStory,
  type Scene,
} from "./generate.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const MAX_CHAPTERS = 10;
const SERIES_PIPELINE_TIMEOUT = 300_000;

function buildAutoSeriesName(
  storyTitle: string,
  castingData: Record<string, unknown>,
): string {
  const mood = castingData.mood as string | undefined;
  const setting = castingData.setting as string | undefined;
  const dynamic = castingData.dynamic as string | undefined;

  if (mood && setting) {
    const moodLabel = `The ${mood}`;
    const settingLabel = setting.length <= 30 ? setting : setting.slice(0, 30);
    return `${moodLabel} — ${settingLabel}`;
  }
  if (mood && dynamic) {
    return `${dynamic}: ${mood}`;
  }
  if (storyTitle && storyTitle !== "Untitled") {
    return storyTitle;
  }
  return "My Series";
}

function buildPreviouslySummary(episodes: { scenes: unknown }[]): string {
  const lastEp = episodes[episodes.length - 1];
  if (!lastEp) return "";
  const scenes = lastEp.scenes as Scene[] | undefined;
  if (!scenes || scenes.length === 0) return "";
  const lastScene = scenes[scenes.length - 1];
  const text = (lastScene.text ?? "").trim();
  return text.length > 800 ? text.slice(0, 800) + "…" : text;
}

function buildSeriesLayerForPlan(previouslySummary: string, chapterNumber: number, timeOfDay?: string): string {
  const timeContext = timeOfDay ? `\nTime of day: ${timeOfDay}. Let this shape the atmosphere and sensory palette of the chapter.` : "";
  return `SERIES ARC CONTEXT:
This is Chapter ${chapterNumber} of an ongoing personal series. The story must continue directly from where Chapter ${chapterNumber - 1} ended.
Previously: "${previouslySummary}"
Planning directive: Design the emotional arc as a genuine continuation — no re-introduction of characters, no reset. The story's ESTABLISH phase must pick up immediately from the previous chapter's closing emotional note. The arc should deepen, not restart.${timeContext}`;
}

router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const { storyId, castingData, title } = req.body as {
    storyId?: string;
    castingData?: Record<string, unknown>;
    title?: string;
  };

  if (!storyId) {
    res.status(400).json({ error: "storyId is required" });
    return;
  }

  try {
    const story = await storiesStore.get(storyId) as Record<string, unknown> | undefined;
    if (!story) {
      res.status(404).json({ error: "Story not found" });
      return;
    }

    if (story.ownerUserId !== req.user.id) {
      res.status(403).json({ error: "Not your story" });
      return;
    }

    const seriesId = `series-${crypto.randomUUID()}`;
    const cd = castingData ?? (story.castingData as Record<string, unknown>) ?? {};
    const seriesTitle = title || buildAutoSeriesName((story.title as string) || "", cd);
    const mood = (cd.mood as string) || (story.mood as string) || "Emotional";
    const images = (story.images as Record<string, unknown>) ?? {};
    const coverImage = (images.cover as string) || "";

    await seriesStore.createForUser({
      id: seriesId,
      title: seriesTitle,
      ownerUserId: req.user.id,
      castingData: cd,
      mood,
      coverImage,
    });

    await storiesStore.updateSeriesInfo(storyId, seriesId, 1);
    await seriesStore.incrementEpisodeCount(seriesId);

    res.json({ seriesId, title: seriesTitle });
  } catch (err) {
    logger.error({ err }, "[user-series] Failed to create series");
    res.status(500).json({ error: "Failed to create series" });
  }
});

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const rows = await seriesStore.getAllForUser(req.user.id);
    res.json(rows.map((s) => ({
      id: s.id,
      title: s.title,
      mood: s.mood,
      coverImage: s.coverImage,
      episodeCount: s.episodeCount,
      createdAt: s.createdAt,
    })));
  } catch (err) {
    logger.error({ err }, "[user-series] Failed to list series");
    res.status(500).json({ error: "Failed to list series" });
  }
});

router.get("/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const s = await seriesStore.getForUser(req.params.id, req.user.id);
    if (!s) {
      res.status(404).json({ error: "Series not found" });
      return;
    }

    const episodes = await seriesStore.getEpisodes(req.params.id);

    res.json({
      id: s.id,
      title: s.title,
      mood: s.mood,
      coverImage: s.coverImage,
      episodeCount: s.episodeCount,
      castingData: s.castingData,
      createdAt: s.createdAt,
      episodes: episodes.map((ep) => {
        const epRaw = ep as Record<string, unknown>;
        const images = (epRaw.images as Record<string, unknown>) ?? {};
        return {
          id: epRaw.id as string,
          episodeNumber: epRaw.seriesEpisode as number,
          title: epRaw.title as string,
          description: epRaw.description as string,
          duration: epRaw.duration as string,
          audioUrl: epRaw.audioUrl as string,
          coverImage: (images.cover as string) || "",
          scenes: (epRaw.scenes as Scene[]) ?? [],
        };
      }),
    });
  } catch (err) {
    logger.error({ err }, "[user-series] Failed to get series");
    res.status(500).json({ error: "Failed to get series" });
  }
});

router.patch("/:id/rename", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const { title } = req.body as { title?: string };
  if (!title || title.trim().length === 0) {
    res.status(400).json({ error: "title is required" });
    return;
  }

  try {
    const s = await seriesStore.getForUser(req.params.id, req.user.id);
    if (!s) {
      res.status(404).json({ error: "Series not found" });
      return;
    }

    await seriesStore.renameForUser(req.params.id, req.user.id, title.trim());
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "[user-series] Failed to rename series");
    res.status(500).json({ error: "Failed to rename series" });
  }
});

router.post("/:id/next-chapter", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const riskError = checkRiskThreshold(req, true);
  if (riskError) {
    res.status(403).json({ error: riskError });
    return;
  }

  const { mood: rawMood, timeOfDay: rawTimeOfDay } = req.body as {
    mood?: string;
    timeOfDay?: string;
  };

  const VALID_MOODS_SERIES = ["Slow Burn", "Late Night", "Emotional", "Forbidden", "First Encounter", "Tender",
    "Romantic", "Raw", "Playful", "Dark", "Nostalgic", "Urgent", "Possessive", "Electric", "Bittersweet",
    "Vulnerable", "Healing", "Complicated", "Obsessive", "Desperate", "Fevered", "Wicked", "Decadent",
    "Dangerous", "Hungry", "Savage", "Aching", "Burning", "Shameless", "Breathless", "Primal", "Reckless"];
  const VALID_TOD = ["Dawn", "Morning", "Afternoon", "Evening", "Midnight"];

  const mood = rawMood && VALID_MOODS_SERIES.includes(rawMood.trim()) ? rawMood.trim() : undefined;
  const timeOfDay = rawTimeOfDay && VALID_TOD.includes(rawTimeOfDay.trim()) ? rawTimeOfDay.trim() : undefined;

  try {
    const s = await seriesStore.getForUser(req.params.id, req.user.id);
    if (!s) {
      res.status(404).json({ error: "Series not found" });
      return;
    }

    const episodes = await seriesStore.getEpisodes(req.params.id);
    const currentCount = episodes.length;

    if (currentCount >= MAX_CHAPTERS) {
      res.status(400).json({ error: `This series has reached the maximum of ${MAX_CHAPTERS} chapters.` });
      return;
    }

    const casting = (s.castingData as Record<string, unknown>) ?? {};
    const chapterNumber = currentCount + 1;

    const previouslySummary = buildPreviouslySummary(episodes as { scenes: unknown }[]);
    const seriesLayer = previouslySummary
      ? buildSeriesLayerForPlan(previouslySummary, chapterNumber, timeOfDay)
      : timeOfDay
      ? `TIME OF DAY: This chapter takes place at ${timeOfDay}. Use this to set the atmosphere and sensory palette.`
      : undefined;

    const intake: GenerateStoryRequest = {
      listenerName: (casting.listenerName as string) || "",
      partnerName: (casting.partnerName as string) || undefined,
      whoIsHe: (casting.whoIsHe as string) || undefined,
      dynamic: (casting.dynamic as string) || undefined,
      setting: (casting.setting as string) || undefined,
      pairing: (casting.pairing as string) || undefined,
      heritage: (casting.heritage as string) || undefined,
      atmosphere: (casting.atmosphere as string) || undefined,
      chemistry: (casting.chemistry as string) || undefined,
      partnerAppearance: (casting.partnerAppearance as string) || undefined,
      storyMode: (casting.storyMode as string) || "romance",
      mood: mood || (casting.mood as string) || (s.mood as string) || "Emotional",
      intensity: (casting.intensity as string) || "Heated",
      voiceFeel: (casting.voiceFeel as string) || "Soft Voice",
      storyLength: (casting.storyLength as string) || "5 min",
      scenarioPrompt: timeOfDay
        ? `Setting: ${timeOfDay}. The story continues from where we left off.`
        : "The story continues from where we left off.",
      cinematicVisuals: true,
      emotionalFocus: true,
    };

    const pipeline = async () => {
      const planOpts: GenerateStoryOptions | undefined = seriesLayer ? { seriesLayer } : undefined;
      const brief = await planStory(intake, planOpts);

      const originalInput = {
        scenarioPrompt: intake.scenarioPrompt,
        whoIsHe: intake.whoIsHe,
        setting: intake.setting,
        dynamic: intake.dynamic,
        mood: intake.mood,
        pairing: intake.pairing,
        partnerName: intake.partnerName,
        partnerAppearance: intake.partnerAppearance,
        previousChapterSummary: previouslySummary || undefined,
        chapterNumber,
      };

      let story: WrittenStory = await writeStoryFromBrief(brief, intake.listenerName, intake.intensity, originalInput);

      let qcResult = await qcStory(brief, story);
      if (qcResult.score_total < 7.5) {
        if (qcResult.rewrite_strategy) {
          story = await rewriteStory(brief, story, qcResult.rewrite_strategy);
        }
        qcResult = await qcStory(brief, story);
      } else if (qcResult.rewrite_strategy) {
        story = await rewriteStory(brief, story, qcResult.rewrite_strategy);
        qcResult = await qcStory(brief, story);
      }

      const outputText = story.scenes.map((sc) => sc.text).join(" ");
      if (outputText.trim()) {
        const outputMod = await moderateOutput(outputText);
        if (outputMod.blocked) {
          logBlockedRequest(req.user.id, undefined, `output:${outputMod.source ?? "openai"}`, outputMod.reason ?? "output_flagged", outputText.slice(0, 500));
          throw new ContentModerationError(`Generated content did not pass safety review (${outputMod.reason})`);
        }
      }

      const isCastingBased = !!(intake.heritage || intake.atmosphere || intake.chemistry);
      const coverPrompt = isCastingBased
        ? buildCoverPromptFromCasting(intake)
        : buildCoverPromptFromBrief(brief);

      const pipelineKey = getCacheKey({ seriesId: s.id, chapter: chapterNumber, ts: Date.now() });
      const [images, audioUrl] = await Promise.all([
        generateAllImages({ coverPrompt, scenePrompts: [] }, pipelineKey),
        generateAudioFile(story.scenes, intake.voiceFeel, pipelineKey),
      ]);

      const newStoryId = `series-${s.id}-ch${chapterNumber}-${Date.now()}`;

      const result = {
        id: newStoryId,
        title: story.title,
        description: story.description,
        mood: intake.mood,
        audioUrl,
        duration: intake.storyLength,
        brief,
        scenes: story.scenes,
        images: { cover: images.cover, scenes: images.scenes },
        qc: qcResult,
        recommendation_tags: brief.recommendation_tags ?? [intake.mood],
        cached: false,
        seriesId: s.id,
        seriesEpisode: chapterNumber,
      };

      await storiesStore.set(newStoryId, { ...result as unknown as Record<string, unknown>, ownerUserId: req.user.id });
      await seriesStore.incrementEpisodeCount(s.id);

      if (images.cover && chapterNumber === 1) {
        await seriesStore.updateCoverImageForUser(s.id, req.user.id, images.cover);
      }

      await trackGeneratedStory(
        req.user.id,
        newStoryId,
        intake.mood,
        intake.intensity,
        intake.voiceFeel,
        null,
        undefined,
        { whoIsHe: intake.whoIsHe, dynamic: intake.dynamic },
      );

      return result;
    };

    try {
      const result = await Promise.race([
        pipeline(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Generation timed out")), SERIES_PIPELINE_TIMEOUT)
        ),
      ]);
      res.json(result);
    } catch (err) {
      if (err instanceof ContentModerationError) {
        res.status(422).json({ error: "Generated content did not pass safety review." });
        return;
      }
      logger.error({ err }, "[user-series] Chapter generation failed");
      const message = err instanceof Error ? err.message : "Chapter generation failed";
      res.status(500).json({ error: message });
    }
  } catch (err) {
    logger.error({ err }, "[user-series] Failed to generate next chapter");
    res.status(500).json({ error: "Failed to generate next chapter" });
  }
});

export default router;
