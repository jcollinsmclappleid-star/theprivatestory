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
  power_dynamic?: string;
  voice_style?: string;
  sensory_palette?: string;
  romantic_arc?: string;
  dialogue_density?: string;
}

// ── All available options for each forced DNA field ────────────────────────────
const DNA_OPTIONS: Record<string, string[]> = {
  power_dynamic: [
    "balanced chemistry",
    "soft dominance",
    "teasing control",
    "mutual restraint",
    "emotionally guarded",
    "confident pursuit",
    "forbidden pull",
    "delayed surrender",
  ],
  voice_style: [
    "soft and luxurious",
    "intense and breathless",
    "emotionally restrained",
    "playful and teasing",
    "dark and magnetic",
    "warm and aching",
    "elegant and slow",
  ],
  pacing_style: [
    "slow burn",
    "immediate tension then slow build",
    "emotionally heavy build",
    "flirtation-heavy build",
    "fast external action slow intimate payoff",
    "reunion build with delayed release",
  ],
  emotional_engine: [
    "longing",
    "temptation",
    "jealousy",
    "curiosity",
    "reunion ache",
    "emotional surrender",
    "first-time nervousness",
    "obsession held in restraint",
    "comfort turning dangerous",
    "playful temptation",
    "regret and return",
    "one-night intensity",
  ],
  narrative_perspective: [
    "second person (you)",
    "close third person",
    "alternating close perspective",
  ],
  sensory_palette: [
    "rain and cold glass",
    "silk and warm skin",
    "candlelight and shadows",
    "perfume and velvet",
    "city lights and night air",
    "salt air and bare feet",
    "leather seats and low music",
    "snow wool and warmth",
    "marble champagne and quiet footsteps",
    "coffee morning light and softness",
  ],
  romantic_arc: [
    "temptation to surrender",
    "reunion to reconnection",
    "emotional walls to softness",
    "flirtation to intimacy",
    "distance to closeness",
    "denial to confession",
    "power tension to vulnerability",
    "ache to release",
  ],
  dialogue_density: [
    "minimal dialogue",
    "moderate dialogue",
    "dialogue-led chemistry",
  ],
};

// ── Pick options that haven't been used in recent stories ─────────────────────
function selectForcedDnaFields(registry: StoryRegistryEntry[]): Record<string, string> {
  const recent = registry.slice(-5);
  const forced: Record<string, string> = {};

  for (const [field, options] of Object.entries(DNA_OPTIONS)) {
    const recentlyUsed = new Set(
      recent
        .map((r) => r[field as keyof StoryRegistryEntry] as string | undefined)
        .filter((v): v is string => !!v)
    );

    // Filter out recently used options; fall back to full list if all used
    const available = options.filter((opt) => !recentlyUsed.has(opt));
    const pool = available.length > 0 ? available : options;

    // Weighted random — slightly prefer options not seen in last 10
    const allRecent = new Set(
      registry.slice(-10)
        .map((r) => r[field as keyof StoryRegistryEntry] as string | undefined)
        .filter((v): v is string => !!v)
    );
    const preferred = pool.filter((opt) => !allRecent.has(opt));
    const finalPool = preferred.length > 0 ? preferred : pool;

    forced[field] = finalPool[Math.floor(Math.random() * finalPool.length)];
  }

  return forced;
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

  // ── Force-rotate DNA fields based on what's been used recently ────────────
  const forcedFields = selectForcedDnaFields(options.priorStoryRegistry ?? []);
  const forcedFieldsBlock = `
FORCED DNA FIELDS — you MUST use these exact values in the DNA block and throughout the story:
${JSON.stringify(forcedFields, null, 2)}

These are not suggestions. They are locked. The story must be built around them.
If "narrative_perspective" is "close third person", refer to the protagonist as "she" throughout.
If "narrative_perspective" is "alternating close perspective", begin in third person then shift to second person at the CRACK moment.
`;

  // ── Registry context for anti-repetition ─────────────────────────────────
  const registryContext = options.priorStoryRegistry?.length
    ? `\nPRIOR STORY REGISTRY (never reuse setting_type, emotional_engine+relationship_dynamic combos, or ending_mood from these):\n${JSON.stringify(
        options.priorStoryRegistry.map((r) => ({
          setting_type: r.setting_type,
          relationship_dynamic: r.relationship_dynamic,
          emotional_engine: r.emotional_engine,
          ending_mood: r.ending_mood,
          voice_style: r.voice_style,
          power_dynamic: r.power_dynamic,
          sensory_palette: r.sensory_palette,
          narrative_perspective: r.narrative_perspective,
        })),
        null,
        2
      )}`
    : "";

  const system = `${MASTER_EROTIC_LAYER}\n\n${category.system_prompt}\n\n${STORY_DNA_INSTRUCTION}${forcedFieldsBlock}${registryContext}`;
  const user = `${storyPrompt}\n\n${intensityLayer}${seriesLayer ? `\n\n${seriesLayer}` : ""}

REMINDER: Write at least 2,000 words of story text. Do not stop early. Complete all five structural phases fully.`;

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
