import { useEffect, useMemo, useState } from "react";
import { Moon, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { EXPRESS_CATEGORY_IMAGES, EXPRESS_CATEGORY_SHORT } from "@/lib/expressCategoryImages";
import { HorizontalScrollRow } from "@/components/ScrollRowHint";

export { EXPRESS_CATEGORY_IMAGES, EXPRESS_CATEGORY_SHORT } from "@/lib/expressCategoryImages";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export const TAG_DISPLAY_MAP: Record<string, string> = {
  // Restraint & BDSM — She
  "She wanted to be tied up": "Tied up",
  "She wanted to be blindfolded": "Blindfolded",
  "She wanted to be held down": "Held down",
  "She wanted to be told not to move": "Commanded not to move",
  "She wanted a hand pressed over her mouth": "Hand over the mouth",
  "She wanted to kneel for them": "On her knees for them",
  "She wanted to be completely powerless": "Completely powerless",
  "She wanted something around her wrists": "Restrained at the wrists",
  "She wanted to be kept completely still": "Kept completely still",
  "She wanted to feel completely enclosed": "Fully enclosed, no escape",
  // Restraint & BDSM — He
  "He wanted to be tied up": "Tied up",
  "He wanted to be blindfolded": "Blindfolded",
  "He wanted to be held down": "Held down",
  "He wanted to be told not to move": "Commanded not to move",
  "He wanted a hand pressed over his mouth": "Hand over the mouth",
  "He wanted to kneel for them": "On his knees for them",
  "He wanted to be completely powerless": "Completely powerless",
  "He wanted something around his wrists": "Restrained at the wrists",
  "He wanted to be kept completely still": "Kept completely still",
  "He wanted to feel completely enclosed": "Fully enclosed, no escape",
  // Restraint & BDSM — They
  "They wanted to be tied up": "Tied up",
  "They wanted to be blindfolded": "Blindfolded",
  "They wanted to be held down": "Held down",
  "They wanted to be told not to move": "Commanded not to move",
  "They wanted a hand pressed over their mouth": "Hand over the mouth",
  "They wanted to kneel for them": "On their knees for them",
  "They wanted to be completely powerless": "Completely powerless",
  "They wanted something around their wrists": "Restrained at the wrists",
  "They wanted to be kept completely still": "Kept completely still",
  "They wanted to feel completely enclosed": "Fully enclosed, no escape",
  // Submission & Worship — She
  "She wanted to feel completely surrendered to them": "Complete submission",
  "She wanted to be spanked": "Spanked",
  "She wanted to be edged": "Edged",
  "She wanted to be worshipped": "Worshipped",
  "She wanted to be taken completely — and adored for it": "Taken completely — and adored for it",
  "She wanted to beg for it": "Made to beg",
  // Submission & Worship — He
  "He wanted to feel completely surrendered to them": "Complete submission",
  "He wanted to be spanked": "Spanked",
  "He wanted to be edged": "Edged",
  "He wanted to be worshipped": "Worshipped",
  "He wanted to be taken completely — and adored for it": "Taken completely — and adored for it",
  "He wanted to beg for it": "Made to beg",
  // Submission & Worship — They
  "They wanted to feel completely surrendered to them": "Complete submission",
  "They wanted to be spanked": "Spanked",
  "They wanted to be edged": "Edged",
  "They wanted to be worshipped": "Worshipped",
  "They wanted to be taken completely — and adored for it": "Taken completely — and adored for it",
  "They wanted to beg for it": "Made to beg",
  // What does she/he/they really want? — control side
  "She leads": "She dominates",
  "He leads": "He dominates",
  "They lead": "They dominate",
  "She stays in control": "She holds total control",
  "He stays in control": "He holds total control",
  "They stay in control": "They hold total control",
  "She chooses how far it goes": "She decides every limit",
  "He chooses how far it goes": "He decides every limit",
  "They choose how far it goes": "They decide every limit",
  "She gives control over completely": "She submits completely",
  "He gives control over completely": "He submits completely",
  "They give control over completely": "They submit completely",
  "She doesn't have to think": "She surrenders control",
  "He doesn't have to think": "He surrenders control",
  "They don't have to think": "They surrender control",
  "She lets herself be taken care of": "She lets herself be taken",
  "He lets himself be taken care of": "He lets himself be taken",
  "They let themselves be taken care of": "They let themselves be taken",
  // Her Command / Her Dominance — he/him partner
  "She asked for it and he obliged completely": "She asked — he obeyed completely",
  "He does exactly what she says": "He follows her every instruction",
  "He is on his knees — that is where she wants him and he wants to be": "He's on his knees — exactly where they both want him",
  "She tells him what good behaviour earns — he earns it": "She rewards good behaviour — he earns it",
  // Her Command / Her Dominance — she/her partner (Her & Her)
  "She asked for it and she obliged completely": "She asked — she obeyed completely",
  "She does exactly what she says": "She follows her every instruction",
  "She is on her knees — that is where she wants her and she wants to be": "She's on her knees — exactly where they both want her",
  "She tells her what good behaviour earns — she earns it": "She rewards good behaviour — she earns it",
  "Two women, both completely focused on her": "Two women, both completely focused on her",
  "She watches because she wanted her to": "She watches because she wanted her to",
  // Her Command / Her Dominance — they/them partner
  "She asked for it and they obliged completely": "She asked — they obeyed completely",
  "They do exactly what she says": "They follow her every instruction",
  "They are on their knees — that is where she wants them and they want to be": "On their knees — exactly where they both want to be",
  "She tells them what good behaviour earns — they earn it": "She rewards good behaviour — they earn it",
  "Two people, both completely focused on her": "Two people, both completely focused on her",
  "They watch because she wanted them to": "They watch because she wanted them to",
  // Her Lead — she/her partner (Her & Her)
  "She leads and she follows": "She leads, she follows",
  // Her Lead — they/them partner
  "She leads and they follow": "She leads, they follow",
};

interface TagCategory {
  heading: string;
  sub?: string;
  tags: string[];
  maxSelect?: number;
  /** When true, this category mixes protagonist + partner pronouns — show a role key for same-gender pairings */
  roleKey?: boolean;
}

type PronounCtx = {
  sub: string;
  obj: string;
  poss: string;
  refl: string;
};

function getPronounCtx(pronouns: string): PronounCtx {
  switch (pronouns) {
    case "he/him":    return { sub: "He",   obj: "him",  poss: "his",   refl: "himself"   };
    case "they/them": return { sub: "They", obj: "them", poss: "their", refl: "themselves" };
    case "you":       return { sub: "You",  obj: "you",  poss: "your",  refl: "yourself"  };
    default:          return { sub: "She",  obj: "her",  poss: "her",   refl: "herself"   };
  }
}

/**
 * Returns all pairs of tags that cannot both be selected at once.
 * Checked globally across all categories — not just within a single category.
 */
function buildContradictionPairs(p: PronounCtx): [string, string][] {
  const sub = p.sub;

  // Control-side tags (protagonist in charge)
  const controlTags = [
    sub === "She" ? "She leads"              : sub === "He" ? "He leads"              : "They lead",
    sub === "She" ? "She initiates"          : sub === "He" ? "He initiates"          : "They initiate",
    sub === "She" ? "She sets the terms"     : sub === "He" ? "He sets the terms"     : "They set the terms",
    sub === "She" ? "She stays in control"   : sub === "He" ? "He stays in control"   : "They stay in control",
    sub === "She" ? "She chooses how far it goes" : sub === "He" ? "He chooses how far it goes" : "They choose how far it goes",
    sub === "She" ? "She makes the first move"    : sub === "He" ? "He makes the first move"    : "They make the first move",
  ];

  // Surrender-side tags (protagonist yielding)
  const surrenderTags = [
    sub === "She" ? "She gives control over completely"  : sub === "He" ? "He gives control over completely"  : "They give control over completely",
    sub === "She" ? "She doesn't have to think"          : sub === "He" ? "He doesn't have to think"          : "They don't have to think",
    sub === "She" ? "She lets herself be taken care of"  : sub === "He" ? "He lets himself be taken care of"  : "They let themselves be taken care of",
  ];

  // Every control tag conflicts with every surrender tag
  const powerPairs: [string, string][] = [];
  for (const c of controlTags) {
    for (const s of surrenderTags) {
      powerPairs.push([c, s]);
    }
  }

  return [
    // Writing style opposites
    ["Slow simmer", "Quick burn"],
    ["Dialogue-rich", "Mostly sensation"],
    ["Sharp & direct", "Lyrical"],

    // Pacing vs scene-structure cross-section
    ["Slow simmer", "Skip the tension — we're already there"],

    // Energy opposites
    ["Slow Build", "Instant Chemistry"],
    ["Slow Build", "Skip the tension — we're already there"],

    // "What makes this yours?" opposites
    ["The timing was complicated", "It was always going to happen"],
    ["It happens just once",       "It happens more than once"],

    // "Just the Scene" vs story structure
    ["No backstory — start in the moment", "There's a complication first"],
    ["No backstory — start in the moment", "The obstacle makes the ending better"],
    ["No backstory — start in the moment", "The story earns its ending"],
    ["No plot, no premise — just this",    "There's a complication first"],
    ["No plot, no premise — just this",    "The story earns its ending"],
    ["No plot, no premise — just this",    "The obstacle makes the ending better"],

    // Power dynamic opposites
    ...powerPairs,
  ];
}

export const AFTER_DARK_TAG_CAP = 8;

export type TagBlockReason = {
  message: string;
  solution: string;
};

function buildAfterDarkActiveCategories(
  protagonistPronouns: string,
  partnerPronouns: string,
): TagCategory[] {
  const p = getPronounCtx(protagonistPronouns);
  const partner = getPronounCtx(partnerPronouns);
  const isSheProtagonist = p.sub === "She";
  const sameGender = protagonistPronouns === partnerPronouns;
  const std = buildStandardCategories(p, partner);
  const sheStd = isSheProtagonist ? buildSheOnlyStandardCategories(partner) : [];
  const ad = buildAfterDarkCategories(p);
  const sheAD = isSheProtagonist ? buildSheOnlyAfterDarkCategories(partner, sameGender) : [];
  const adRestraint = ad.filter((c) => c.heading === "Restraint & BDSM");
  const adSubmission = ad.filter((c) => c.heading === "Submission & Worship");
  const adWords = ad.filter((c) => c.heading === "Words & Praise");
  const darkFantasy = ad.filter((c) => c.heading === "Dark Fantasy");
  const adEnd = ad.filter(
    (c) => c.heading === "Just the Scene" || c.heading === "How does it end?",
  );
  return [
    ...adRestraint,
    ...adSubmission,
    ...sheAD,
    ...sheStd,
    std[4],
    std[0],
    ...adWords,
    ...darkFantasy,
    std[1],
    std[2],
    std[3],
    std[5],
    std[6],
    std[7],
    ...adEnd,
  ];
}

const categoryTagMapFrom = (categories: TagCategory[]) =>
  new Map<string, string[]>(categories.map((c) => [c.heading, c.tags]));

function getCategoryExcludedBy(
  heading: string,
  selectedTags: string[],
  categoryTagMap: Map<string, string[]>,
): string | null {
  for (const [a, b] of CATEGORY_EXCLUSION_PAIRS) {
    if (heading === b) {
      const aTags = categoryTagMap.get(a) ?? [];
      if (aTags.some((t) => selectedTags.includes(t))) return a;
    }
    if (heading === a) {
      const bTags = categoryTagMap.get(b) ?? [];
      if (bTags.some((t) => selectedTags.includes(t))) return b;
    }
  }
  return null;
}

/** Why a tag cannot be added (express / After Dark). Returns null if the tag may be selected. */
export function getExpressTagBlockReason(
  tag: string,
  selectedTags: string[],
  protagonistPronouns: string,
  partnerPronouns: string,
): TagBlockReason | null {
  if (selectedTags.includes(tag)) return null;

  if (selectedTags.length >= AFTER_DARK_TAG_CAP) {
    return {
      message: `You've chosen ${AFTER_DARK_TAG_CAP} desires — that's the maximum.`,
      solution: "Remove one of your selections above to add another.",
    };
  }

  const p = getPronounCtx(protagonistPronouns);
  const pairs = buildContradictionPairs(p);
  for (const [a, b] of pairs) {
    if (a === tag && selectedTags.includes(b)) {
      return {
        message: `This conflicts with "${getTagDisplayLabel(b)}".`,
        solution: `Remove "${getTagDisplayLabel(b)}" to select this instead.`,
      };
    }
    if (b === tag && selectedTags.includes(a)) {
      return {
        message: `This conflicts with "${getTagDisplayLabel(a)}".`,
        solution: `Remove "${getTagDisplayLabel(a)}" to select this instead.`,
      };
    }
  }

  const categories = buildAfterDarkActiveCategories(protagonistPronouns, partnerPronouns);
  const categoryTagMap = categoryTagMapFrom(categories);
  for (const cat of categories) {
    if (!cat.tags.includes(tag)) continue;
    const excludedBy = getCategoryExcludedBy(cat.heading, selectedTags, categoryTagMap);
    if (excludedBy) {
      return {
        message: `"${cat.heading}" is locked while "${excludedBy}" is selected.`,
        solution: `Clear your "${excludedBy}" choices to unlock this section.`,
      };
    }
    const catSelectedCount = cat.tags.filter((t) => selectedTags.includes(t)).length;
    if (cat.maxSelect !== undefined && catSelectedCount >= cat.maxSelect) {
      return {
        message: `${cat.heading} allows ${cat.maxSelect} choices — you've reached the limit.`,
        solution: `Remove another tag from "${cat.heading}" to add this one.`,
      };
    }
    break;
  }

  return null;
}

/** Pick the correct pronoun form for the protagonist. */
function pSub(p: PronounCtx, sheV: string, heV: string, theyV: string): string {
  if (p.sub === "He") return heV;
  if (p.sub === "They" || p.sub === "You") return theyV;
  return sheV;
}

function buildStandardCategories(p: PronounCtx, partner: PronounCtx): TagCategory[] {
  const protagonistHeading = pSub(p, "she", "he", "they");
  const partnerS = partner.sub;
  const partnerObj = partner.obj;

  return [
    {
      heading: "How do you want to feel?",
      sub: "The emotional register of this story",
      maxSelect: 4,
      tags: [
        "Desired", "Seen", "Powerful", "Chosen",
        "Adored", "Electric", "Wanted", "Known",
        "Vulnerable", "Held", "Breathless", "Undone",
        "Overwhelmed", "Consumed", "Lit up", "Irreplaceable",
        "Discovered", "Safe",
      ],
    },
    {
      heading: "What's between them?",
      sub: "The energy and tension at the heart of it",
      maxSelect: 5,
      tags: [
        "Slow Build", "Instant Chemistry", "Forbidden", "Push & Pull",
        "A pull neither can explain", "Unfinished Business", "One night only", "Rivals to lovers",
      ],
    },
    {
      heading: "How do you want it written?",
      sub: "The texture and pacing of the writing",
      maxSelect: 5,
      tags: [
        "Slow simmer", "Dialogue-rich", "Mostly sensation",
        "Lyrical", "Cinematic", "Sharp & direct",
      ],
    },
    {
      heading: "What makes this yours?",
      sub: "The personal detail that makes it unmistakable",
      maxSelect: 5,
      tags: [
        "They remind me of someone",
        "It happens just once",
        "The timing was complicated",
        "It was always going to happen",
        "The relationship is complicated",
        "No one gets hurt",
      ],
    },
    {
      heading: `What does ${protagonistHeading} really want?`,
      sub: "The desire at the core of it",
      maxSelect: 5,
      roleKey: true,
      tags: [
        pSub(p, "She leads",                             "He leads",                              "They lead"),
        pSub(p, "She initiates",                         "He initiates",                          "They initiate"),
        pSub(p, "She sets the terms",                    "He sets the terms",                     "They set the terms"),
        pSub(p, "She stays in control",                  "He stays in control",                   "They stay in control"),
        pSub(p, "She chooses how far it goes",           "He chooses how far it goes",            "They choose how far it goes"),
        pSub(p, "She makes the first move",              "He makes the first move",               "They make the first move"),
        pSub(p, "She gives control over completely",     "He gives control over completely",      "They give control over completely"),
        pSub(p, "She lets herself go",                   "He lets himself go",                    "They let themselves go"),
        pSub(p, "She doesn't have to think",             "He doesn't have to think",              "They don't have to think"),
        pSub(p, "She lets herself be taken care of",     "He lets himself be taken care of",      "They let themselves be taken care of"),
        pSub(p, "She's wanted this for a long time",     "He's wanted this for a long time",      "They've wanted this for a long time"),
        pSub(p, "She comes back for more",               "He comes back for more",                "They come back for more"),
        pSub(p, "This is the version she never admits to", "This is the version he never admits to", "This is the version they never admit to"),
        pSub(p, "She doesn't feel guilty",               "He doesn't feel guilty",                "They don't feel guilty"),
        pSub(p, "It changes something in her",           "It changes something in him",           "It changes something in them"),
        pSub(p, "She owns what she wants",               "He owns what he wants",                 "They own what they want"),
      ],
    },
    {
      heading: "Pure Romance",
      sub: "When tenderness is the whole story",
      maxSelect: 5,
      roleKey: true,
      tags: [
        "The tenderness is the whole thing",
        `${partnerS} treats ${p.obj} like the only thing in the room`,
        "Slow hands, full attention",
        `${p.sub} feels adored, not just wanted`,
        "Every gesture deliberate",
        `${partnerS} remembers what ${pSub(p, "she", "he", "they")} said`,
        "Romance that earns what follows",
        "Softness that doesn't break",
      ],
    },
    {
      heading: "Praise & Devotion",
      sub: "When being wanted is its own kind of story",
      maxSelect: 5,
      roleKey: true,
      tags: [
        `${partnerS} can't stop looking at ${p.obj}`,
        `${p.sub} is all ${pSub(p, "she's", "he's", "they're")} thinking about — and ${pSub(p, "she", "he", "they")} knows it`,
        `${partnerS} catalogues everything about ${p.obj}`,
        "Every compliment specific and earned",
        `${partnerS} makes ${p.obj} feel like a revelation`,
        "The devotion is the whole story",
        `${partnerS} names what ${partnerObj === "him" ? "he" : partnerObj === "her" ? "she" : "they"} sees in ${p.obj}`,
        `${p.sub} is everything and ${partnerObj === "him" ? "he" : partnerObj === "her" ? "she" : "they"} tells ${p.obj}`,
      ],
    },
    {
      heading: "Story Arc & Plot",
      sub: "For stories with something more to say",
      maxSelect: 5,
      tags: [
        "There's a complication first",
        "The obstacle makes the ending better",
        "Second chance — different this time",
        "They almost didn't make it",
        "The misunderstanding that almost cost everything",
        "The story earns its ending",
        "Feelings are the whole problem",
        "Something between them that neither will say",
      ],
    },
  ];
}

function buildAfterDarkCategories(p: PronounCtx): TagCategory[] {
  return [
    {
      heading: "Restraint & BDSM",
      sub: "Restraint, BDSM, and the things you rarely say out loud",
      maxSelect: 3,
      tags: [
        `${p.sub} wanted to be tied up`,
        `${p.sub} wanted to be blindfolded`,
        `${p.sub} wanted to be held down`,
        `${p.sub} wanted to be told not to move`,
        `${p.sub} wanted a hand pressed over ${p.poss} mouth`,
        `${p.sub} wanted to be looked at — properly looked at`,
        `${p.sub} wanted to kneel for them`,
        `${p.sub} wanted to be completely powerless`,
        `${p.sub} wanted something around ${p.poss} wrists`,
        `${p.sub} wanted to be undressed very slowly`,
        `${p.sub} wanted to be kept completely still`,
        `${p.sub} wanted to feel completely enclosed`,
      ],
    },
    {
      heading: "Words & Praise",
      sub: "What you want said while it happens",
      maxSelect: 5,
      tags: [
        `${p.sub} wanted to be praised`,
        `${p.sub} wanted to hear what ${p.sub} is`,
        `${p.sub} wanted to be narrated through it`,
        `${p.sub} wanted to have to ask for it`,
        `${p.sub} wanted to say it back — out loud`,
        `${p.sub} wanted to be told ${p.refl} was perfect`,
        `${p.sub} wanted every moment described as it happened`,
        `${p.sub} wanted to hear how much they needed ${p.obj}`,
        `${p.sub} wanted to be called ${p.poss} name when it happened`,
      ],
    },
    {
      heading: "Submission & Worship",
      sub: "Submission, worship, and how deep the surrender goes",
      maxSelect: 2,
      tags: [
        `${p.sub} wanted to feel completely surrendered to them`,
        `${p.sub} wanted to be spanked`,
        `${p.sub} wanted to be edged`,
        `${p.sub} wanted to be worshipped`,
        `${p.sub} wanted to be taken completely — and adored for it`,
        `${p.sub} wanted to beg for it`,
      ],
    },
    {
      heading: "Dark Fantasy",
      sub: "When the fantasy doesn't follow natural rules",
      maxSelect: 5,
      tags: [
        `${p.sub} wanted something that wasn't entirely human`,
        `${p.sub} wanted the rules of this world suspended`,
        `${p.sub} wanted power that couldn't be explained`,
        `${p.sub} wanted to be taken somewhere impossible`,
      ],
    },
    {
      heading: "Just the Scene",
      sub: "No buildup. Start in the middle of it.",
      maxSelect: 1,
      tags: [
        "No backstory — start in the moment",
        "Skip the tension — we're already there",
        "Pure sensation, nothing required before it",
        "Just the part that matters",
        "In medias res — already past the beginning",
        "No plot, no premise — just this",
      ],
    },
    {
      heading: "How does it end?",
      sub: "The final note of your story",
      maxSelect: 2,
      tags: [
        `${p.sub} falls asleep in their arms`,
        "They don't leave until morning",
        `${p.sub} asks for more`,
        "No one speaks afterward",
        "They go again immediately",
        `${p.sub} doesn't want it to be over`,
        `They leave — ${p.sub} doesn't stop them`,
        `They stay and ${p.sub}'s surprised`,
        "Left open — mid-scene",
        `${p.sub}'s still feeling it hours later`,
        `${p.sub} texts them before they reach the door`,
        "They lock the door again",
      ],
    },
  ];
}

function buildSheOnlyStandardCategories(partner: PronounCtx): TagCategory[] {
  const A = partner.sub;
  const a = A.toLowerCase();
  return [
    {
      heading: "Her Lead",
      sub: "How she moves through this story",
      maxSelect: 5,
      tags: [
        `She leads and ${a} follows`,
        "She chooses who touches her",
        "She decides when it ends",
        `${A} gives her what she asks for`,
        "Her pleasure is the whole story",
        "She is worshipped before anything else",
        `${A} would wait as long as she needed`,
        "She feels beautiful and powerful at once",
        `${A} notices everything about her`,
        "She is the centre of everything in this room",
      ],
    },
  ];
}

function buildSheOnlyAfterDarkCategories(partner: PronounCtx, sameGender: boolean): TagCategory[] {
  const A = partner.sub;
  const a = A.toLowerCase();
  const ao = partner.obj;
  const ap = partner.poss;
  const twoPartners = A === "She" ? "Two women" : A === "They" ? "Two people" : "Two men";
  return [
    {
      heading: sameGender ? "Your dominance" : "Her Dominance",
      sub: sameGender ? "When you control everything — your character leads" : "When she controls everything",
      maxSelect: 5,
      tags: [
        `She asked for it and ${a} obliged completely`,
        `${A} does exactly what she says`,
        "She directed them both — they were there for exactly that",
        `${A} watches because she wanted ${ao} to`,
        "She swings on her terms — her choice, her lead, her exit",
        `${twoPartners}, both completely focused on her`,
        `She tells ${ao} what good behaviour earns — ${a} earns it`,
        `${A} is on ${ap} knees — that is where she wants ${ao} and ${a} wants to be`,
        "She told them the rules — they followed them",
      ],
    },
  ];
}

function buildNocturneCategory(): TagCategory {
  return {
    heading: "What do you need tonight?",
    sub: "The specific version of tonight you're carrying into sleep",
    tags: [
      "The day is done and you can finally stop",
      "Company without performance",
      "Warmth, no urgency",
      "Someone present, nothing required",
      "Slow enough to drift",
      "Just enough tension to carry you somewhere else",
      "The quiet kind of wanted",
      "Something to fall into",
      "Rest that comes from connection",
      "A voice that takes its time",
    ],
  };
}

/**
 * Category-group exclusions.
 * If any tag from category A is selected, the entire category B is blocked, and vice versa.
 * Identified by category heading.
 */
const CATEGORY_EXCLUSION_PAIRS: [string, string][] = [
  ["Just the Scene",            "Story Arc & Plot"],
  ["Fantasy & The Impossible",  "Dark Fantasy"],
  ["Pure Romance",              "Submission & Worship"],
  ["Pure Romance",              "Restraint & BDSM"],
  ["Praise & Devotion",         "Submission & Worship"],
];

export function getTagDisplayLabel(tag: string): string {
  return TAG_DISPLAY_MAP[tag] ?? tag;
}

/** Express After Dark — category backdrop imagery for arousal-led UI */
// Primary images live in @/lib/expressCategoryImages (EXPRESS_CATEGORY_GALLERIES)

export const EXPRESS_CATEGORY_ORDER = [
  "Restraint & BDSM",
  "Submission & Worship",
  "Her Dominance",
  "What does she really want?",
  "What does he really want?",
  "What do they really want?",
  "How do you want to feel?",
  "Words & Praise",
  "Dark Fantasy",
  "What's between them?",
  "How do you want it written?",
  "What makes this yours?",
  "Pure Romance",
  "Praise & Devotion",
  "Story Arc & Plot",
  "Just the Scene",
  "How does it end?",
] as const;

interface Props {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  afterDark?: boolean;
  bedtime?: boolean;
  express?: boolean;
  accentColor?: string;
  protagonistPronouns?: string;
  partnerPronouns?: string;
  isSameGender?: boolean;
  onAfterDark?: () => void;
  /** Mobile express: one category at a time with pill nav */
  expressTabbed?: boolean;
  activeCategoryHeading?: string | null;
  onActiveCategoryChange?: (heading: string) => void;
  /** Parent renders category hero — hide pill nav and per-category backdrops */
  expressHeroMode?: boolean;
  hideCategoryNav?: boolean;
  /** Fired when per-category selection counts change (express tabbed mode) */
  onCategoryCountsChange?: (counts: Record<string, number>) => void;
}

export function StoryTagStudio({
  selectedTags,
  onTagToggle,
  afterDark = false,
  bedtime = false,
  express = false,
  expressTabbed = false,
  activeCategoryHeading = null,
  onActiveCategoryChange,
  expressHeroMode = false,
  hideCategoryNav = false,
  onCategoryCountsChange,
  accentColor = "#c9a227",
  protagonistPronouns = "she/her",
  partnerPronouns = "he/him",
  isSameGender = false,
  onAfterDark,
}: Props) {
  const { isAuthenticated } = useAuth();
  const [usualTags, setUsualTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/me/taste`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.tasteProfile) {
          const freq = data.tasteProfile as Record<string, number>;
          const top5 = Object.entries(freq)
            .filter(([, count]) => count > 0)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([tag]) => tag);
          setUsualTags(new Set(top5));
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const p = getPronounCtx(protagonistPronouns);
  const partner = getPronounCtx(partnerPronouns);

  // Role-key legend text shown for same-gender pairings under ambiguous categories
  // e.g. "she = your character · she = your love interest"
  const roleKeyText = isSameGender
    ? `${p.sub.toLowerCase()} = your character · ${p.obj} = your love interest`
    : null;

  const isSheProtagonist = p.sub === "She";

  const activeCategories: TagCategory[] = afterDark
    ? buildAfterDarkActiveCategories(protagonistPronouns, partnerPronouns)
    : bedtime
    ? [buildNocturneCategory()]
    : [
        ...buildStandardCategories(p, partner),
        ...(isSheProtagonist ? buildSheOnlyStandardCategories(partner) : []),
      ];

  const lockedCategories: TagCategory[] = bedtime ? buildStandardCategories(p, partner) : [];

  const contradictionPairs = buildContradictionPairs(p);

  const guardedTagToggle = (tag: string) => {
    if (!selectedTags.includes(tag) && afterDark) {
      const block = getExpressTagBlockReason(
        tag,
        selectedTags,
        protagonistPronouns,
        partnerPronouns,
      );
      if (block) return;
    }
    onTagToggle(tag);
  };

  // Global cap: 10 standard, 8 after dark, 5 nocturne/bedtime
  const totalCap = afterDark ? AFTER_DARK_TAG_CAP : bedtime ? 5 : 10;
  const totalSelected = selectedTags.length;
  const globalAtCap = totalSelected >= totalCap;

  const visibleCategories = expressTabbed && activeCategoryHeading
    ? activeCategories.filter((c) => c.heading === activeCategoryHeading)
    : activeCategories;

  const categorySelectionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const cat of activeCategories) {
      counts.set(cat.heading, cat.tags.filter((t) => selectedTags.includes(t)).length);
    }
    return counts;
  }, [activeCategories, selectedTags]);

  useEffect(() => {
    if (!onCategoryCountsChange) return;
    const record: Record<string, number> = {};
    categorySelectionCounts.forEach((v, k) => {
      record[k] = v;
    });
    onCategoryCountsChange(record);
  }, [categorySelectionCounts, onCategoryCountsChange]);

  // Build a lookup: category heading → all tags in that category (active only)
  const categoryTagMap = new Map<string, string[]>(
    activeCategories.map((c) => [c.heading, c.tags]),
  );

  /** Returns the heading of the category that is blocking this heading, or null. */
  function getExcludedBy(heading: string): string | null {
    for (const [a, b] of CATEGORY_EXCLUSION_PAIRS) {
      if (heading === b) {
        const aTags = categoryTagMap.get(a) ?? [];
        if (aTags.some((t) => selectedTags.includes(t))) return a;
      }
      if (heading === a) {
        const bTags = categoryTagMap.get(b) ?? [];
        if (bTags.some((t) => selectedTags.includes(t))) return b;
      }
    }
    return null;
  }

  function renderTag(
    tag: string,
    catSelectedCount: number,
    maxSelect: number | undefined,
    locked: boolean,
    categoryExcluded: boolean,
    categoryHeading: string,
    excludedBy: string | null,
  ) {
    const selected = !locked && selectedTags.includes(tag);
    const isUsual = !locked && usualTags.has(tag) && !selected;

    // Contradiction check — global across all categories
    const contradictionPartners = contradictionPairs
      .filter(([a, b]) => a === tag || b === tag)
      .map(([a, b]) => (a === tag ? b : a));
    const blockedByContradiction = !selected && contradictionPartners.some(
      (cp) => selectedTags.includes(cp),
    );

    // Per-category cap
    const blockedByCap = !selected && maxSelect !== undefined && catSelectedCount >= maxSelect;

    // Global cap
    const blockedByGlobalCap = !selected && globalAtCap;

    const isDisabled = locked || categoryExcluded || blockedByContradiction || blockedByCap || blockedByGlobalCap;

    const blockingConflict = blockedByContradiction
      ? contradictionPartners.find((cp) => selectedTags.includes(cp))
      : undefined;

    const blockReason: TagBlockReason | null = blockedByContradiction && blockingConflict
      ? {
          message: `Conflicts with "${getTagDisplayLabel(blockingConflict)}".`,
          solution: `Remove "${getTagDisplayLabel(blockingConflict)}" to select this instead.`,
        }
      : blockedByGlobalCap
      ? {
          message: `You've chosen ${totalCap} desires — that's the maximum.`,
          solution: "Remove one of your selections above to add another.",
        }
      : blockedByCap
      ? {
          message: `This section allows ${maxSelect} choices — you've reached the limit.`,
          solution: "Remove another tag from this section to add this one.",
        }
      : categoryExcluded && excludedBy
      ? {
          message: `"${categoryHeading}" is locked while "${excludedBy}" is selected.`,
          solution: `Clear your "${excludedBy}" choices to unlock this section.`,
        }
      : locked
      ? { message: "Not available in Drift mode.", solution: "" }
      : null;

    const titleText = blockReason
      ? blockReason.solution
        ? `${blockReason.message} ${blockReason.solution}`
        : blockReason.message
      : undefined;

    return (
      <span key={tag} className="relative inline-flex flex-col items-start gap-0.5">
        <button
          type="button"
          onClick={() => !isDisabled && guardedTagToggle(tag)}
          disabled={isDisabled}
          title={titleText}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            selected
              ? "border-transparent text-black"
              : isDisabled
              ? "border-white/8 text-muted-foreground/40 cursor-not-allowed"
              : isUsual
              ? "border-primary/40 text-foreground hover:border-primary/60"
              : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
          }`}
          style={
            selected
              ? {
                  background: express
                    ? `linear-gradient(135deg, ${accentColor}, #922b21)`
                    : accentColor,
                  borderColor: accentColor,
                  boxShadow: express ? "0 0 22px rgba(232,121,160,0.45)" : undefined,
                }
              : isUsual && !isDisabled
              ? { background: `${accentColor}14` }
              : express && !isDisabled
              ? { borderColor: "rgba(232,121,160,0.18)" }
              : undefined
          }
        >
          {TAG_DISPLAY_MAP[tag] ?? tag}
        </button>
        {isUsual && !isDisabled && (
          <span
            className="text-[8px] font-semibold uppercase tracking-widest px-1.5 leading-tight"
            style={{ color: accentColor, opacity: 0.85 }}
          >
            Your Usual
          </span>
        )}
        {blockReason && isDisabled && !selected && (
          <span className="text-[9px] text-foreground/55 px-1.5 leading-tight max-w-[220px]">
            {blockReason.message}
            {blockReason.solution ? (
              <span className="block text-foreground/40 italic mt-0.5">{blockReason.solution}</span>
            ) : null}
          </span>
        )}
      </span>
    );
  }

  function renderCategory(cat: TagCategory, locked: boolean) {
    const catSelectedCount = locked
      ? 0
      : cat.tags.filter((t) => selectedTags.includes(t)).length;
    const atCap = cat.maxSelect !== undefined && catSelectedCount >= cat.maxSelect;
    const excludedBy = locked ? null : getExcludedBy(cat.heading);
    const categoryExcluded = excludedBy !== null;

    const catImage = express && !expressHeroMode ? EXPRESS_CATEGORY_IMAGES[cat.heading] : undefined;

    return (
      <div
        key={cat.heading}
        className={`transition-opacity ${locked ? "opacity-45" : categoryExcluded ? "opacity-80" : ""} ${
          express && !expressHeroMode ? "relative rounded-2xl border border-[#e879a0]/12 overflow-hidden mb-10" : ""
        }`}
      >
        {express && catImage && (
          <>
            <img
              src={`${import.meta.env.BASE_URL}${catImage}`}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover opacity-[0.14]"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/75 to-[#1a0008]/80" />
          </>
        )}
        <div className={express && !expressHeroMode ? "relative z-10 p-5 sm:p-6" : express ? "relative z-10" : undefined}>
        {!expressHeroMode && (
        <div className="flex items-baseline justify-between mb-1">
          <p className={`font-semibold text-foreground ${express ? "text-lg font-display" : "text-base"}`}>
            {cat.heading}
          </p>
          <div className="flex items-center gap-3">
            {categoryExcluded && (
              <span className="text-xs text-foreground/80 font-medium">
                Unlocks when "{excludedBy}" is cleared
              </span>
            )}
            {!locked && !categoryExcluded && cat.maxSelect !== undefined && (
              <span
                className={`text-xs tabular-nums transition-colors ${
                  atCap ? "font-semibold" : "text-muted-foreground/50"
                }`}
                style={atCap ? { color: accentColor } : undefined}
              >
                {catSelectedCount}/{cat.maxSelect}
              </span>
            )}
          </div>
        </div>
        )}
        {expressHeroMode && !locked && !categoryExcluded && cat.maxSelect !== undefined && (
          <div className="flex justify-end mb-2">
            <span
              className={`text-xs tabular-nums transition-colors ${
                atCap ? "font-semibold" : "text-muted-foreground/50"
              }`}
              style={atCap ? { color: accentColor } : undefined}
            >
              {catSelectedCount}/{cat.maxSelect} in this section
            </span>
          </div>
        )}
        {cat.sub && !expressHeroMode && (
          <p className="text-xs text-muted-foreground mb-4 leading-snug">{cat.sub}</p>
        )}
        {roleKeyText && cat.roleKey && (
          <p className="text-[10px] text-muted-foreground/45 italic mb-3 leading-snug tracking-wide">
            In these tags: {roleKeyText}
          </p>
        )}
        <div className={`flex flex-wrap gap-2 ${express ? "gap-2.5" : ""}`}>
          {cat.tags.map((tag) =>
            renderTag(tag, catSelectedCount, cat.maxSelect, locked, categoryExcluded, cat.heading, excludedBy),
          )}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className={expressTabbed ? "space-y-4" : "space-y-10"}>
      {expressTabbed && !hideCategoryNav && (
        <div className="sticky top-20 z-20 -mx-1 px-1 py-2 bg-black/80 backdrop-blur-md border-b border-white/10">
          <HorizontalScrollRow className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-hide">
            {activeCategories.map((cat) => {
              const count = categorySelectionCounts.get(cat.heading) ?? 0;
              const active = cat.heading === activeCategoryHeading;
              return (
                <button
                  key={cat.heading}
                  type="button"
                  onClick={() => onActiveCategoryChange?.(cat.heading)}
                  className={`flex-shrink-0 snap-start px-3 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                    active
                      ? "border-[#e879a0]/60 bg-[#e879a0]/15 text-white"
                      : "border-white/12 text-white/55"
                  }`}
                >
                  {EXPRESS_CATEGORY_SHORT[cat.heading] ?? cat.heading}
                  {count > 0 && (
                    <span className="ml-1.5 tabular-nums" style={{ color: active ? "#e879a0" : undefined }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </HorizontalScrollRow>
        </div>
      )}
      {/* Express — always-visible selected desires (tap × to remove) */}
      {express && selectedTags.length > 0 && (
        <div className="sticky top-20 z-20 px-3 py-3 mb-3 rounded-xl border border-[#e879a0]/35 bg-black/90 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#e879a0]">
              Your selections
            </p>
            <span className="text-[10px] text-white/45 tabular-nums">
              Tap × to remove
            </span>
          </div>
          <HorizontalScrollRow className="flex gap-2 overflow-x-auto pb-0.5 snap-x snap-mandatory scrollbar-hide">
            {selectedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => guardedTagToggle(tag)}
                className="flex-shrink-0 snap-start inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs font-semibold text-black border border-transparent"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, #922b21)`,
                  boxShadow: "0 0 16px rgba(232,121,160,0.35)",
                }}
                title="Remove this desire"
              >
                {getTagDisplayLabel(tag)}
                <X className="w-3 h-3 opacity-80" aria-hidden />
              </button>
            ))}
          </HorizontalScrollRow>
        </div>
      )}

      {/* Global tag counter */}
      {!bedtime && (
        <div
          className={`rounded-lg p-4 mb-2 ${
            express
              ? "border border-[#e879a0]/25 bg-gradient-to-br from-[#1a0008]/90 to-black/60 shadow-[0_0_40px_rgba(192,57,43,0.12)]"
              : "border border-white/10 bg-black/20"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className={`font-semibold text-foreground ${express ? "text-base" : "text-sm"}`}>
              {express ? (
                <>
                  Tell us exactly how you want it — up to{" "}
                  <span style={{ color: accentColor }}>{totalCap} desires</span>
                </>
              ) : (
                <>
                  Select up to <span style={{ color: accentColor }}>{totalCap} tags</span>
                </>
              )}
            </p>
            <span
              className={`text-sm tabular-nums font-semibold transition-colors ${
                globalAtCap ? "font-bold" : "text-muted-foreground"
              }`}
              style={globalAtCap ? { color: accentColor } : undefined}
            >
              {totalSelected}/{totalCap} selected
            </span>
          </div>
          <p className={`leading-relaxed ${express ? "text-sm text-white/70 italic" : "text-xs text-muted-foreground"}`}>
            {express
              ? "Every tag you choose is written into your story — explicit, personal, unrestrained."
              : "The more specific your choices, the better we can craft your story. Choose what shapes your experience."}
          </p>
        </div>
      )}
      {visibleCategories.map((cat) => renderCategory(cat, false))}
      {lockedCategories.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(123,143,255,0.10)", border: "1px solid rgba(123,143,255,0.30)" }}
        >
          <Moon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#9baeff" }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9baeff" }}>After Dark exclusive</span>
          <div className="flex-1 h-px" style={{ background: "rgba(123,143,255,0.20)" }} />
          <a
            href={`${import.meta.env.BASE_URL}after-dark`}
            className="text-xs font-bold transition-all hover:opacity-80 whitespace-nowrap"
            style={{ color: "#7b8fff" }}
          >
            Unlock →
          </a>
        </div>
      )}
      {lockedCategories.map((cat) => renderCategory(cat, true))}
      {!afterDark && !bedtime && onAfterDark && (
        <div className="pt-2 pb-1 text-center">
          <button
            type="button"
            onClick={onAfterDark}
            className="text-xs font-medium transition-colors underline-offset-2 hover:underline"
            style={{ color: "#9baeff" }}
          >
            Want fantasy or something more immersive? After Dark takes it further →
          </button>
        </div>
      )}
    </div>
  );
}
