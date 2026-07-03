import type { ExpressScenario } from "@/lib/afterDarkExpress";

type PronounCtx = { sub: string; obj: string; poss: string; refl: string };

function pronounCtx(pronouns: string): PronounCtx {
  if (pronouns === "he/him") return { sub: "He", obj: "him", poss: "his", refl: "himself" };
  if (pronouns === "they/them") return { sub: "They", obj: "them", poss: "their", refl: "themselves" };
  return { sub: "She", obj: "her", poss: "her", refl: "herself" };
}

const ROOM_TAGS: Record<string, (p: PronounCtx) => string[]> = {
  power_exchange: (p) => [
    `${p.sub} wanted to be completely powerless`,
    `${p.sub} wanted to kneel for them`,
    `${p.sub} wanted to be told not to move`,
    `${p.sub} wanted something around ${p.poss} wrists`,
  ],
  the_forbidden: () => [
    "Forbidden",
    "A pull neither can explain",
    "Push & Pull",
    "Unfinished Business",
  ],
  slow_burn: () => [
    "Slow Build",
    "Slow simmer",
    "Desired",
    "The tenderness is the whole thing",
  ],
  dark_territory: (p) => [
    `${p.sub} wanted to be completely powerless`,
    "Mostly sensation",
    "Sharp & direct",
    `${p.sub} wanted to be edged`,
  ],
  more_than_two: (p) => [
    `${p.sub} wanted to be worshipped`,
    "Electric",
    "Consumed",
  ],
  sweet_and_savage: (p) => [
    `${p.sub} wanted to be spanked`,
    "Undone",
    "Breathless",
  ],
  the_edge: (p) => [
    `${p.sub} wanted to be edged`,
    `${p.sub} wanted to have to ask for it`,
    "Vulnerable",
  ],
  eyes_on_us: () => ["Seen", "Electric", "Known"],
  in_character: () => ["Cinematic", "Dialogue-rich", "Instant Chemistry"],
};

const MOOD_TAGS: Record<string, string[]> = {
  Raw: ["Mostly sensation", "Sharp & direct", "Consumed"],
  Emotional: ["Dialogue-rich", "Lyrical", "Held"],
  Playful: ["Electric", "Instant Chemistry", "Push & Pull"],
  Intense: ["Breathless", "Undone", "Overwhelmed"],
};

const DARKNESS_TAGS: Record<string, (p: PronounCtx) => string[]> = {
  "No Limits": (p) => [
    `${p.sub} wanted to be completely powerless`,
    `${p.sub} wanted to beg for it`,
    "Mostly sensation",
  ],
  "Deep Night": (p) => [
    `${p.sub} wanted to be blindfolded`,
    `${p.sub} wanted to be praised`,
    "Slow simmer",
  ],
  "After Hours": () => ["Forbidden", "One night only", "Electric"],
};

export function defaultCategoryForRoom(room: string | undefined): string {
  const map: Record<string, string> = {
    power_exchange: "Restraint & BDSM",
    the_forbidden: "What's between them?",
    slow_burn: "How do you want to feel?",
    dark_territory: "Restraint & BDSM",
    more_than_two: "Submission & Worship",
    sweet_and_savage: "Restraint & BDSM",
    the_edge: "Words & Praise",
    eyes_on_us: "How do you want to feel?",
    in_character: "How do you want it written?",
  };
  return map[room ?? ""] ?? "Restraint & BDSM";
}

export function suggestExpressTags(opts: {
  scenario: ExpressScenario | null;
  chemistry: string;
  mood: string;
  protagonistPronouns: string;
  selectedTags: string[];
  max?: number;
}): string[] {
  const p = pronounCtx(opts.protagonistPronouns);
  const max = opts.max ?? 5;
  const pool: string[] = [];

  if (opts.scenario?.room && ROOM_TAGS[opts.scenario.room]) {
    pool.push(...ROOM_TAGS[opts.scenario.room](p));
  }

  if (opts.scenario?.darkness && DARKNESS_TAGS[opts.scenario.darkness]) {
    pool.push(...DARKNESS_TAGS[opts.scenario.darkness](p));
  }

  if (opts.mood && MOOD_TAGS[opts.mood]) {
    pool.push(...MOOD_TAGS[opts.mood]);
  }

  if (opts.chemistry.includes("Leads")) {
    pool.push(`${p.sub} leads`, `${p.sub} stays in control`);
  } else if (opts.chemistry.includes("Takes Charge")) {
    pool.push(`${p.sub} gives control over completely`, `${p.sub} wanted to kneel for them`);
  } else if (opts.chemistry === "Slow Surrender") {
    pool.push(`${p.sub} gives control over completely`, "Slow Build");
  } else if (opts.chemistry === "Equal Tension") {
    pool.push("Equal desire, equal intensity", "Push & Pull");
  }

  for (const tag of opts.scenario?.tags ?? []) {
    if (tag.includes("in control") || tag.includes("completely in control")) {
      pool.push(`${p.sub} gives control over completely`);
    }
    if (tag.includes("surrender") || tag.includes("Surrender")) {
      pool.push(`${p.sub} wanted to feel completely surrendered to them`);
    }
    if (tag.includes("forbidden") || tag.includes("Forbidden")) {
      pool.push("Forbidden");
    }
    if (tag.includes("worship") || tag.includes("Worship")) {
      pool.push(`${p.sub} wanted to be worshipped`);
    }
    if (tag.includes("praise") || tag.includes("Praise")) {
      pool.push(`${p.sub} wanted to be praised`);
    }
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of pool) {
    if (opts.selectedTags.includes(tag) || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= max) break;
  }
  return out;
}
