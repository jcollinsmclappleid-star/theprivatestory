import type { CastingRoomResult } from "@/components/CastingRoom";

export type StoryRevealScenario = {
  label: string;
  sub: string;
  room: string;
  darkness: string;
  accent: string;
  storyMode: string;
};

export type StoryRevealChoice = {
  label: string;
  value: string;
  accent: string;
};

export type StoryRevealContent = {
  title: string;
  snippet: string;
  roomLabel: string;
  choices: StoryRevealChoice[];
};

const INTENSITY_SNIPPET: Record<string, string> = {
  Subtle: "Something has been building between you for weeks. Tonight neither of you is pretending not to notice.",
  Warm: "He shouldn't be in your space. You should have locked the door. Neither of you is leaving.",
  Elevated: "The restraint is over. Every rule you set is about to be tested — and you already know how this ends.",
  Intense: "Nothing held back. Every detail written. This is the version where you stop choosing safe.",
};

const MODE_SNIPPET: Record<string, string> = {
  unrestrained: "Two people who've run out of reasons to wait. The story goes as far as you chose.",
  forbidden: "You both know why this is wrong. That's exactly why you haven't stopped.",
  passionate: "Feeling and desire finally in the same room. No one is apologising for either.",
};

function roomDisplayName(roomId: string): string {
  return roomId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildStoryRevealContent(
  casting: Partial<CastingRoomResult> & Record<string, unknown>,
  scenario: StoryRevealScenario | null,
): StoryRevealContent {
  const archetype = (casting.archetype as string) || "";
  const dynamic = (casting.dynamic as string) || (casting.chemistry as string) || "";
  const intensity = (casting.intensity as string) || "Warm";
  const pairing = (casting.pairing as string) || "";
  const setting = (casting.setting as string) || "";
  const mood = (casting.mood as string) || "";
  const heritage = (casting.heritage as string) || "";
  const situation = (casting.situation as string) || "";
  const voiceName = (casting.voiceName as string) || "";

  const storyMode = (casting.storyMode as string) || scenario?.storyMode || "unrestrained";

  let title = scenario?.label ?? "Your private story";
  if (archetype && scenario?.label) {
    title = `${scenario.label}`;
  } else if (archetype) {
    title = `${archetype.replace(/^The\s+/i, "")} — yours alone`;
  }

  const snippet =
    scenario?.sub?.trim() ||
    INTENSITY_SNIPPET[intensity] ||
    MODE_SNIPPET[storyMode] ||
    MODE_SNIPPET.unrestrained;

  const choices: StoryRevealChoice[] = [];
  const push = (label: string, value: string | undefined, accent: string) => {
    if (value?.trim()) choices.push({ label, value: value.trim(), accent });
  };

  push("Pairing", pairing, "#e879a0");
  push("Fantasy", scenario?.label, scenario?.accent ?? "#c0392b");
  push("Intensity", intensity, "#f97316");
  push("Dynamic", dynamic, "#c9a227");
  push("Archetype", archetype, "#6b8cce");
  if (heritage) push("Heritage", heritage, "#fbbf24");
  push("Setting", setting, "#34d399");
  if (casting.country) push("Country", casting.country as string, "#fbbf24");
  if (casting.city) push("City", casting.city as string, "#fcd34d");
  push("Mood", mood, "#a78bfa");
  push("Situation", situation, "#e11d48");
  push("Narrator", voiceName, "#c9a227");
  if (casting.listenerName) push("Your name", casting.listenerName as string, "#e879a0");
  if (casting.partnerName) push("Their name", casting.partnerName as string, "#6b8cce");

  return {
    title,
    snippet,
    roomLabel: scenario ? roomDisplayName(scenario.room) : "After Dark",
    choices,
  };
}

export function getScenarioRoomImage(roomId: string | undefined, baseUrl: string): string | null {
  if (!roomId) return null;
  const map: Record<string, string> = {
    dark_territory: "images/rooms/dark_territory.webp",
    the_edge: "images/rooms/the_edge.webp",
    power_exchange: "images/rooms/power_exchange.webp",
    the_forbidden: "images/rooms/the_forbidden.webp",
    slow_burn: "images/rooms/slow_burn.webp",
    eyes_on_us: "images/rooms/eyes_on_us.webp",
    more_than_two: "images/rooms/more_than_two.webp",
    sweet_and_savage: "images/rooms/sweet_and_savage.webp",
    in_character: "images/rooms/in_character.webp",
  };
  const path = map[roomId];
  return path ? `${baseUrl}${path}` : null;
}

export const PENDING_CAST_KEY = "afterDarkPendingCast";

export type PendingAfterDarkCast = {
  casting: CastingRoomResult;
  allTags: string[];
  scenarioId?: string;
};
