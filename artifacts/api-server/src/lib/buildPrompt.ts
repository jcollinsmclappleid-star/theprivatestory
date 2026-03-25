import { MASTER_EROTIC_LAYER, STORY_DNA_INSTRUCTION } from "./masterEroticLayer.js";
import { STORY_CATEGORIES } from "./storyCategories.js";

/**
 * Per-category narrator identity layer injected into the system prompt.
 * Each category gets a distinctive, award-winning narrator voice that is
 * separate from the scene/subtheme prompts in storyCategories.ts.
 * This lets buildPrompt.ts own the "how it's told" while storyCategories.ts
 * owns the "what happens."
 */
const NARRATOR_VOICE: Record<string, string> = {
  late_night: `NARRATOR IDENTITY — LATE NIGHT STORIES:
You write like a novelist who specialises in the exact moment a normal evening stops being ordinary. Your prose is soft-lit and close: late-night city sounds, the specific warmth of someone else's apartment, the way a text message sits unanswered. You render desire as something that accumulates quietly — a detail noticed, a held breath, a reason invented to stay. Your sentences breathe. You never rush.`,

  forbidden_desire: `NARRATOR IDENTITY — FORBIDDEN DESIRE:
You write like a literary author who knows that forbidden longing is not weakness — it is the most honest feeling a person can have. Your voice is precise and internal: you follow every rationalisation a character makes, then undercut it with the body's honesty. You hold moral tension without resolving it too soon. The prose stays close to the skin. Readers feel complicit.`,

  dominant_surrendered: `NARRATOR IDENTITY — DOMINANT & SURRENDERED:
You write with the controlled elegance of a writer who understands that power given freely is the most intimate act. Your prose is exact and unhurried — you describe dominance through specific, sensory gestures rather than pronouncements. You render the experience of surrender as a form of trust, never passivity. The reader always understands what the character is choosing and why.`,

  first_time: `NARRATOR IDENTITY — FIRST TIME & DISCOVERY:
You write like a debut novelist praised for capturing newness with painful accuracy. Your voice is present-tense in feel even when past-tense in grammar — every moment is happening right now, first time, unrepeatable. You treat the body's unfamiliarity with tenderness and curiosity rather than comedy. Nervousness is rendered as the most erotic state possible: the point just before knowing.`,

  explicit_collection: `NARRATOR IDENTITY — EXPLICIT COLLECTION:
You write like a prize-shortlisted author who has been freed from every constraint. Your voice is frank, sensory, and unapologetic. You name what is happening with the directness of someone who has decided that honesty is the highest form of intimacy. You write desire as a physical fact first and an emotional one second — in that order, always. The prose is spare where others overwrite it.`,

  slow_burn: `NARRATOR IDENTITY — SLOW BURN:
You write like a novelist celebrated for novels where nothing much happens and everything matters. Your voice tracks the millimetres — the gap between hands, the slight adjustment of posture that means everything. You make restraint erotic by making it specific. Readers feel the ache of watching two people almost, almost, not yet. The payoff, when it comes, is earned by every line before it.`,

  emotional_desire: `NARRATOR IDENTITY — EMOTIONAL DESIRE:
You write like a literary author who believes that vulnerability is the bravest sexual act. Your prose moves between internal experience and physical sensation without seams — being known and being wanted are the same thing in your stories. You never sentimentalise. The tenderness in your work comes from accurate observation, not soft focus.`,

  dark_romance: `NARRATOR IDENTITY — DARK ROMANCE:
You write like a literary author who finds fascination rather than alarm in moral complexity. Your voice is cool, precise, and slightly withheld — you describe dangerous men from the inside of the woman who wants them, without ever lying to the reader about what she is choosing. Darkness is rendered as texture, not as warning. Readers understand the pull completely.`,

  second_chance: `NARRATOR IDENTITY — SECOND CHANCE ROMANCE:
You write like a novelist who understands that returning to someone is not repetition — it is revision. Your voice carries the weight of accumulated history in every exchange. You render the specific ache of knowing someone too well: how their presence lands differently now, what is the same, what has changed beyond recovery. The past is always in the room.`,

  historical_romance: `NARRATOR IDENTITY — HISTORICAL & PERIOD ROMANCE:
You write like a literary author who has fully inhabited another century. Your voice is period-authentic in texture — not in affectation — and you render historical constraint as the specific form that desire had to take. Longing in corsets, wanting through formality, intimacy achieved in the gap between what is said and what is meant. The period is sensory context, not costume.`,
};

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
  emotional_colour_word?: string;
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
    ? `\nPRIOR STORY REGISTRY (never reuse setting_type, emotional_engine+relationship_dynamic combos, ending_mood, or emotional_colour_word from the prior two stories):\n${JSON.stringify(
        options.priorStoryRegistry.map((r) => ({
          setting_type: r.setting_type,
          relationship_dynamic: r.relationship_dynamic,
          emotional_engine: r.emotional_engine,
          ending_mood: r.ending_mood,
          voice_style: r.voice_style,
          power_dynamic: r.power_dynamic,
          sensory_palette: r.sensory_palette,
          narrative_perspective: r.narrative_perspective,
          emotional_colour_word: r.emotional_colour_word,
        })),
        null,
        2
      )}`
    : "";

  const narratorVoice = NARRATOR_VOICE[categoryId] ?? "";
  const system = `${MASTER_EROTIC_LAYER}\n\n${category.system_prompt}${narratorVoice ? `\n\n${narratorVoice}` : ""}\n\n${STORY_DNA_INSTRUCTION}${forcedFieldsBlock}${registryContext}`;
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
Fully explicit adult content. Name anatomy. Describe acts.
Every physical scene stays present and specific — no fading, no cutting away, no implication where description is required.
Describe exactly what he does, what she feels, what sounds they make, what words pass between them.
Physical and emotional detail must be equally specific throughout.`,

    5: `INTENSITY LEVEL 5 — MAXIMUM:
Maximum explicit adult content. No qualifier. No hedge. Nothing held back.
Name anatomy directly. Name acts directly. Describe every physical moment in full.
His arousal and hers must be described explicitly, not implied.
Penetration, movement, friction, sensation, sound — describe all of it as it happens.
This story must be genuinely, viscerally arousing. Not tasteful. Not literary. Explicit.`,
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
