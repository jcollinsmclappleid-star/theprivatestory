import { MASTER_EROTIC_LAYER, STORY_DNA_INSTRUCTION } from "./masterEroticLayer.js";
import { STORY_CATEGORIES } from "./storyCategories.js";

export interface PromptResult {
  system: string;
  user: string;
  metadata: {
    category: string;
    subtheme: string;
    mood: string;
    explicitLevel: string;
    intensity: number | "variable";
    tags: string[];
    isCustom: boolean;
  };
}

export interface BuildPromptOptions {
  intensity?: number;
  episodeNumber?: number;
  totalEpisodes?: number;
  seriesArc?: string;
  priorStoryRegistry?: StoryRegistryEntry[];
}

export interface StoryRegistryEntry {
  title: string;
  category: string;
  subtheme: string;
  setting_type: string;
  relationship_dynamic: string;
  emotional_engine: string;
  tension_style: string;
  narrative_perspective: string;
  pacing_style: string;
  ending_mood: string;
  visual_motif: string;
  signature_object: string;
}

export function buildPrompt(
  categoryId: string,
  subthemeId: string,
  userInput: string | null = null,
  options: BuildPromptOptions = {}
): PromptResult | null {
  const category = STORY_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return null;

  const subtheme = category.subthemes.find((s) => s.id === subthemeId);
  if (!subtheme) return null;

  let storyPrompt = subtheme.prompt;
  if (subtheme.is_custom && userInput) {
    storyPrompt = storyPrompt.replace("[USER_INPUT]", userInput.slice(0, 500));
  }

  const intensity = options.intensity ?? (typeof subtheme.intensity === "number" ? subtheme.intensity : 3);
  const intensityLayer = buildIntensityLayer(intensity);
  const seriesLayer = options.episodeNumber
    ? buildSeriesLayer(options.episodeNumber, options.totalEpisodes ?? 3, options.seriesArc ?? "")
    : "";

  const registryContext = options.priorStoryRegistry?.length
    ? `\n\nPRIOR STORY REGISTRY (avoid repeating these combinations):\n${JSON.stringify(options.priorStoryRegistry, null, 2)}`
    : "";

  const system = `${MASTER_EROTIC_LAYER}\n\n${category.system_prompt}\n\n${STORY_DNA_INSTRUCTION}${registryContext}`;
  const user = `${storyPrompt}\n\n${intensityLayer}${seriesLayer ? `\n\n${seriesLayer}` : ""}`;

  return {
    system,
    user,
    metadata: {
      category: category.name,
      subtheme: subtheme.name,
      mood: category.mood,
      explicitLevel: category.explicit_level,
      intensity: subtheme.intensity,
      tags: subtheme.tags ?? [],
      isCustom: subtheme.is_custom ?? false,
    },
  };
}

export function buildIntensityLayer(intensity: number): string {
  const layers: Record<number, string> = {
    1: `INTENSITY LEVEL 1 — TENDER:
Keep content romantic and emotionally charged.
Physical content implied rather than explicit.
Focus on longing, proximity, and almost-touch.`,

    2: `INTENSITY LEVEL 2 — WARM:
Allow suggestive content with clear physical awareness.
Kisses, touch, closeness — described with sensory detail.
Leave the most explicit moments to imagination but don't shy from heat.`,

    3: `INTENSITY LEVEL 3 — HOT:
Explicit emotional and physical content.
Describe desire and physical response clearly and specifically.
The story should feel genuinely arousing as well as emotionally engaging.`,

    4: `INTENSITY LEVEL 4 — EXPLICIT:
Fully explicit adult content.
Physical scenes described with literary precision and genuine heat.
Do not fade to black — stay present through explicit moments.
Emotional depth must match physical explicitness.`,

    5: `INTENSITY LEVEL 5 — MAXIMUM:
Unapologetically explicit adult content.
Every physical scene fully rendered with complete sensory and emotional presence.
The story should be genuinely, powerfully arousing from first paragraph to last.
No restraint — only literary quality and emotional truth as limits.`,
  };

  const clamped = Math.max(1, Math.min(5, Math.round(intensity)));
  return layers[clamped] ?? layers[3];
}

export function buildSeriesLayer(episodeNum: number, totalEpisodes: number, seriesArc: string): string {
  return `
SERIES POSITION: Episode ${episodeNum} of ${totalEpisodes}
${seriesArc ? `SERIES ARC: ${seriesArc}` : ""}

EPISODE REQUIREMENTS:
- Open with a direct callback to something unresolved from the previous episode
- This episode must shift the relationship dynamic in one specific, irreversible way
- Introduce one new dimension of the male lead that recontextualises what came before
- The explicit content in this episode should go one degree further than the previous episode
- End on an unresolved moment — emotional, physical, or psychological
- The final line must make the listener immediately need the next episode

EPISODE ${episodeNum} SPECIFIC TENSION: ${getEpisodeTension(episodeNum, totalEpisodes)}`;
}

function getEpisodeTension(n: number, total: number): string {
  const position = n / total;
  if (position <= 0.2)
    return "Establishment episode. Plant three unresolved threads. The attraction should feel inevitable but not yet acted on. End with the first moment something almost happens.";
  if (position <= 0.4)
    return "Escalation episode. One thread from episode one pays off partially. Introduce a complication that makes the central desire more complicated. End with the first moment of genuine physical connection.";
  if (position <= 0.6)
    return "Turning point episode. Something irrevocable happens. The relationship cannot go back to what it was. This is the most explicitly charged episode so far. End with an emotional revelation that reframes everything.";
  if (position <= 0.8)
    return "Crisis episode. The central desire is both most fulfilled and most threatened. Maximum explicit content with maximum emotional stakes. End with genuine uncertainty about whether this continues.";
  return "Resolution episode. Every thread pays off. The most explicit and emotionally complete episode of the series. End with satisfaction but leave one door open — the listener should want a sequel series.";
}

export function getCategoryById(categoryId: string) {
  return STORY_CATEGORIES.find((c) => c.id === categoryId) ?? null;
}

export function getSubthemeById(categoryId: string, subthemeId: string) {
  const category = getCategoryById(categoryId);
  return category?.subthemes.find((s) => s.id === subthemeId) ?? null;
}
