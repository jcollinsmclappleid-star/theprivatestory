/* @refresh reset */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ArrowLeft, Moon, Check } from "lucide-react";
import { useGenerateFullStory } from "@workspace/api-client-react";
import type { FullGeneratedStory } from "@workspace/api-client-react";
import { useAudioPlayer } from "@/store/use-audio-player";
import { useAuth } from "@/hooks/useAuth";
import { CastingRoom, PAIRINGS } from "@/components/CastingRoom";
import type { CastingRoomResult, CastingRoomHandoff } from "@/components/CastingRoom";
import { AgeGate, hasConfirmedAge } from "@/components/AgeGate";
import { VOICES } from "@/lib/voices";
import AfterDarkLanding from "@/pages/AfterDarkLanding";

/* ── Pronoun adaptation for scenario text ────────────────────────── */
type PCtxFull = {
  sub: string; subL: string; objCap: string; obj: string;
  possCap: string; poss: string; refl: string;
  contr: string; contrL: string; dep: string; depL: string;
};
function getPCtxFull(pronouns: string): PCtxFull {
  switch (pronouns) {
    case "he/him":    return { sub:"He",   subL:"he",   objCap:"Him",  obj:"him",  possCap:"His",   poss:"his",   refl:"himself",    contr:"He's",    contrL:"he's",    dep:"He'd",    depL:"he'd"   };
    case "they/them": return { sub:"They", subL:"they", objCap:"Them", obj:"them", possCap:"Their", poss:"their", refl:"themselves", contr:"They're", contrL:"they're", dep:"They'd",  depL:"they'd" };
    default:          return { sub:"She",  subL:"she",  objCap:"Her",  obj:"her",  possCap:"Her",   poss:"her",   refl:"herself",    contr:"She's",   contrL:"she's",   dep:"She'd",   depL:"she'd"  };
  }
}
/**
 * Adapt scenario sub/label/tag text written for the default She(prot)+He(partner) pairing
 * to any other pairing. Uses a three-phase placeholder approach so partner and protagonist
 * replacements never collide.
 */
function adaptScenarioText(
  text: string,
  protagonistPronouns: string,
  partnerPronouns: string,
): string {
  if (protagonistPronouns === "she/her" && partnerPronouns === "he/him") return text;
  const P = getPCtxFull(protagonistPronouns);
  const A = getPCtxFull(partnerPronouns);

  // Phase 1 — mask the original partner (He/him/his) as placeholders
  let t = text
    .replace(/\bHe's\b/g, "%%AC%%").replace(/\bhe's\b/g, "%%ac%%")
    .replace(/\bHe'd\b/g, "%%AD%%").replace(/\bhe'd\b/g, "%%ad%%")
    .replace(/\bHe\b/g,   "%%AS%%").replace(/\bhe\b/g,   "%%as%%")
    .replace(/\bhimself\b/g,"%%AR%%")
    .replace(/\bHim\b/g,  "%%AO%%").replace(/\bhim\b/g,  "%%ao%%")
    .replace(/\bHis\b/g,  "%%AP%%").replace(/\bhis\b/g,  "%%ap%%");

  // Phase 2 — replace the original protagonist (She/her) with target protagonist pronouns
  t = t
    .replace(/\bShe's\b/g, P.contr).replace(/\bshe's\b/g, P.contrL)
    .replace(/\bShe'd\b/g, P.dep  ).replace(/\bshe'd\b/g, P.depL  )
    .replace(/\bShe\b/g,   P.sub  ).replace(/\bshe\b/g,   P.subL  )
    .replace(/\bherself\b/g, P.refl)
    // "Her/her" before a word → possessive; otherwise → object
    .replace(/\bHer(?= \w)/g, P.possCap).replace(/\bher(?= \w)/g, P.poss)
    .replace(/\bHer\b/g, P.objCap       ).replace(/\bher\b/g, P.obj      );

  // Phase 3 — restore partner placeholders as correct partner pronouns
  t = t
    .replace(/%%AC%%/g, A.contr).replace(/%%ac%%/g, A.contrL)
    .replace(/%%AD%%/g, A.dep  ).replace(/%%ad%%/g, A.depL  )
    .replace(/%%AS%%/g, A.sub  ).replace(/%%as%%/g, A.subL  )
    .replace(/%%AR%%/g, A.refl )
    .replace(/%%AO%%/g, A.objCap).replace(/%%ao%%/g, A.obj  )
    .replace(/%%AP%%/g, A.possCap).replace(/%%ap%%/g, A.poss );

  return t;
}

/* ── Types ──────────────────────────────────────────────────────────── */
type DarknessLevel = "After Dark" | "Deep Night" | "No Limits";

interface Scenario {
  id: string;
  label: string;
  sub: string;
  room: string;
  darkness: DarknessLevel;
  gradient: string;
  accent: string;
  storyMode: string;
  tags: string[];
  allowedPairings?: string[];
}

interface Room {
  id: string;
  name: string;
  sub: string;
  accent: string;
  image?: string;
}

/* ── Fantasy Rooms ──────────────────────────────────────────────────── */
const ROOMS: Room[] = [
  {
    id: "dark_territory",
    name: "Dark Territory",
    sub: "Fully explicit. Every detail written. Nothing implied, softened, or left out.",
    accent: "#c0392b",
    image: "images/rooms/dark_territory.webp",
  },
  {
    id: "the_edge",
    name: "The Edge",
    sub: "Psychological intensity. Obsession. The wanting that unsettles and won't let go.",
    accent: "#7c3aed",
    image: "images/rooms/the_edge.webp",
  },
  {
    id: "power_exchange",
    name: "Power Exchange",
    sub: "Dominance and submission. BDSM on your terms — you write the rules, the depth, and how far.",
    accent: "#c0392b",
    image: "images/rooms/power_exchange.webp",
  },
  {
    id: "the_forbidden",
    name: "The Forbidden",
    sub: "The reason it's wrong is exactly the reason you're here.",
    accent: "#8b5cf6",
    image: "images/rooms/the_forbidden.webp",
  },
  {
    id: "more_than_two",
    name: "More Than Two",
    sub: "Threesome, group, or more. Desire multiplies — this room holds all of it.",
    accent: "#6366f1",
    image: "images/rooms/more_than_two.webp",
  },
  {
    id: "sweet_and_savage",
    name: "Sweet & Savage",
    sub: "Tenderness that turns. Softness that breaks into something unmistakably wilder.",
    accent: "#db2777",
    image: "images/rooms/sweet_and_savage.webp",
  },
  {
    id: "eyes_on_us",
    name: "Eyes On Us",
    sub: "Exhibitionism or voyeurism. The specific electricity of watching — or being watched.",
    accent: "#14b8a6",
    image: "images/rooms/eyes_on_us.webp",
  },
  {
    id: "her_power",
    name: "Her Power",
    sub: "She dominates. Every detail, every decision, every moment — entirely on her terms.",
    accent: "#e879a0",
  },
  {
    id: "dark_fantasy",
    name: "Dark Fantasy",
    sub: "Fantasy scenarios, fetish elements, the kind of wanting that doesn't need justification.",
    accent: "#7c3aed",
  },
  {
    id: "just_the_scene",
    name: "Just the Scene",
    sub: "No backstory. No buildup. Start in the moment that matters.",
    accent: "#db2777",
  },
  {
    id: "in_character",
    name: "In Character",
    sub: "Roleplay. A power dynamic, a character, a fiction that becomes completely real.",
    accent: "#d97706",
    image: "images/rooms/in_character.webp",
  },
  {
    id: "slow_burn",
    name: "Slow Burn",
    sub: "Weeks of tension. One moment of finally. Everything held back until now.",
    accent: "#e07840",
    image: "images/rooms/slow_burn.webp",
  },
  {
    id: "all_of_them",
    name: "All of Them",
    sub: "Power, presence, desire. The specific wanting that comes from more than one of them.",
    accent: "#d4a017",
  },
  {
    id: "the_praise_room",
    name: "The Praise Room",
    sub: "Praise kink. Every word chosen to make you feel exactly what you came here to feel.",
    accent: "#d97706",
  },
  {
    id: "novel_arc",
    name: "Novel Arc",
    sub: "Obstacles, complications, the twist before it finally breaks. A story with weight.",
    accent: "#0891b2",
  },
];

/* ── Scenario tag display labels ────────────────────────────────────── */
const SCENARIO_TAG_DISPLAY: Record<string, string> = {
  "He's completely in control": "He's dominant",
  "Total surrender": "Full submission",
  "Control held, then released": "D/s power exchange",
  "Nothing off limits": "No limits — fully explicit",
  "Power fully exchanged": "BDSM power exchange",
  "Nothing implied where it can be named": "Explicitly written throughout",
  "Being the only thing he is thinking about": "Obsession — she's all he sees",
  "A line that keeps moving": "Escalating intensity",
};

/* ── Scenarios ──────────────────────────────────────────────────────── */
const SCENARIOS: Scenario[] = [
  /* Power Exchange ─── */
  {
    id: "he_decides",
    label: "He Decides Everything",
    sub: "She surrendered control completely. He made every second of it count — and she felt every one.",
    room: "power_exchange",
    darkness: "Deep Night",
    gradient: "from-[#140000] via-[#220000] to-[#0a0000]",
    accent: "#c0392b",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Nothing implied where it can be named"],
  },
  {
    id: "she_takes_the_reins",
    label: "She Takes the Reins",
    sub: "She doesn't ask. She tells. He discovers what it means to want, and wait.",
    room: "power_exchange",
    darkness: "After Dark",
    gradient: "from-[#180010] via-[#280018] to-[#100008]",
    accent: "#ec4899",
    storyMode: "unrestrained",
    tags: ["I'm completely in control", "I take what I want"],
  },
  {
    id: "the_contract",
    label: "The Contract",
    sub: "Rules written. Rules bent. What's agreed upon makes everything that follows permitted.",
    room: "power_exchange",
    darkness: "No Limits",
    gradient: "from-[#160000] via-[#240000] to-[#0c0000]",
    accent: "#c0392b",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Control held, then released", "Nothing off limits"],
  },
  {
    id: "the_negotiation",
    label: "The Negotiation",
    sub: "Before the wanting, there were terms. Now the only negotiation is pacing.",
    room: "power_exchange",
    darkness: "Deep Night",
    gradient: "from-[#100008] via-[#1a0010] to-[#080005]",
    accent: "#e879a0",
    storyMode: "unrestrained",
    tags: ["Power fully exchanged", "Control held, then released"],
  },
  {
    id: "the_punishment",
    label: "The Punishment",
    sub: "They had an agreement. She pushed it. He remembered. Both of them were counting on exactly this.",
    room: "power_exchange",
    darkness: "No Limits",
    gradient: "from-[#180000] via-[#260000] to-[#0e0000]",
    accent: "#dc2626",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Nothing implied where it can be named", "Total surrender"],
  },
  {
    id: "owned",
    label: "Owned",
    sub: "She said it first. He asked her to say it again, slower. Neither of them wanted to stop.",
    room: "power_exchange",
    darkness: "No Limits",
    gradient: "from-[#120000] via-[#1e0000] to-[#0a0000]",
    accent: "#b91c1c",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Total surrender", "Nothing off limits"],
  },
  {
    id: "the_lesson",
    label: "The Lesson",
    sub: "She wanted to learn. He understood exactly how to show her. Neither of them was in a hurry.",
    room: "power_exchange",
    darkness: "Deep Night",
    gradient: "from-[#100005] via-[#1c000a] to-[#080003]",
    accent: "#e11d48",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Control held, then released"],
  },

  /* The Forbidden ─── */
  {
    id: "the_colleague",
    label: "The Colleague",
    sub: "Months of professionalism. One after-hours moment. Everything between them shifts.",
    room: "the_forbidden",
    darkness: "After Dark",
    gradient: "from-[#0a0010] via-[#14001c] to-[#070008]",
    accent: "#a855f7",
    storyMode: "forbidden",
    tags: ["He shouldn't, and neither should you", "The risk is part of the pull"],
  },
  {
    id: "the_ex",
    label: "The Ex",
    sub: "He was supposed to be finished. Both of them thought so. He isn't.",
    room: "the_forbidden",
    darkness: "Deep Night",
    gradient: "from-[#0c0014] via-[#180020] to-[#08000e]",
    accent: "#9333ea",
    storyMode: "forbidden",
    tags: ["Something between you that should be forbidden", "Unfinished business"],
  },
  {
    id: "wrong_room",
    label: "Wrong Room",
    sub: "She walked into the wrong hotel room. He didn't ask her to leave. Neither did she.",
    room: "the_forbidden",
    darkness: "After Dark",
    gradient: "from-[#080010] via-[#100018] to-[#050008]",
    accent: "#a78bfa",
    storyMode: "forbidden",
    tags: ["Something between you that should be forbidden", "The risk is part of the pull"],
  },
  {
    id: "what_she_shouldnt_want",
    label: "What She Shouldn't Want",
    sub: "The reason she can't have him is the exact reason she can't stop thinking about him.",
    room: "the_forbidden",
    darkness: "Deep Night",
    gradient: "from-[#100008] via-[#1c0012] to-[#090005]",
    accent: "#c084fc",
    storyMode: "forbidden",
    tags: ["Complicated wanting", "A line that keeps moving"],
  },
  {
    id: "the_best_friends_brother",
    label: "Best Friend's Brother",
    sub: "She'd met him a hundred times. He'd always known exactly what she was to him.",
    room: "the_forbidden",
    darkness: "After Dark",
    gradient: "from-[#070010] via-[#10001a] to-[#040008]",
    accent: "#9333ea",
    storyMode: "forbidden",
    tags: ["He shouldn't, and neither should you", "Something between you that should be forbidden"],
  },
  {
    id: "the_client",
    label: "The Client",
    sub: "Strictly professional. Until he asked her to stay. Once. That was enough.",
    room: "the_forbidden",
    darkness: "Deep Night",
    gradient: "from-[#0c0014] via-[#16001e] to-[#08000e]",
    accent: "#7c3aed",
    storyMode: "forbidden",
    tags: ["The risk is part of the pull", "Complicated wanting"],
  },
  {
    id: "the_boss",
    label: "The Boss",
    sub: "She noticed him watching. She kept walking. That was her first decision.",
    room: "the_forbidden",
    darkness: "After Dark",
    gradient: "from-[#0a000e] via-[#140018] to-[#06000a]",
    accent: "#a855f7",
    storyMode: "forbidden",
    tags: ["He shouldn't, and neither should you", "He's completely in control"],
  },

  /* Slow Burn ─── */
  {
    id: "finally",
    label: "Finally",
    sub: "It took months of almost. One look across a room. Then nothing between them held.",
    room: "slow_burn",
    darkness: "After Dark",
    gradient: "from-[#140800] via-[#201200] to-[#0a0600]",
    accent: "#e07840",
    storyMode: "passionate",
    tags: ["Unfinished business", "Being the only thing he is thinking about"],
  },
  {
    id: "the_confession",
    label: "The Confession",
    sub: "She said it without meaning to. He put down everything and crossed the room.",
    room: "slow_burn",
    darkness: "After Dark",
    gradient: "from-[#120600] via-[#1e0e00] to-[#0a0400]",
    accent: "#f97316",
    storyMode: "passionate",
    tags: ["Complicated wanting", "Unfinished business"],
  },
  {
    id: "seven_years",
    label: "Seven Years",
    sub: "Everything they didn't say in seven years. Said now. In a language with no words.",
    room: "slow_burn",
    darkness: "Deep Night",
    gradient: "from-[#100a00] via-[#1c1400] to-[#080600]",
    accent: "#d97706",
    storyMode: "passionate",
    tags: ["Unfinished business", "Complete presence, nothing held back"],
  },
  {
    id: "the_long_flight",
    label: "The Long Flight",
    sub: "Fourteen hours. No distractions. He's been sitting next to her for three of them.",
    room: "slow_burn",
    darkness: "After Dark",
    gradient: "from-[#0e0800] via-[#181200] to-[#080600]",
    accent: "#ea580c",
    storyMode: "passionate",
    tags: ["Anonymous desire", "Complete presence, nothing held back"],
  },
  {
    id: "the_last_night",
    label: "The Last Night",
    sub: "She's leaving in the morning. He came to say goodbye. Neither of them mentions it.",
    room: "slow_burn",
    darkness: "Deep Night",
    gradient: "from-[#120600] via-[#1c1000] to-[#0a0400]",
    accent: "#c2410c",
    storyMode: "passionate",
    tags: ["Unfinished business", "Complicated wanting"],
  },

  /* In Character ─── */
  {
    id: "the_stranger_on_the_train",
    label: "The Stranger",
    sub: "He boards at midnight. They'll never meet again after this. Both of them know.",
    room: "in_character",
    darkness: "After Dark",
    gradient: "from-[#100800] via-[#1e1200] to-[#0a0600]",
    accent: "#d97706",
    storyMode: "unrestrained",
    tags: ["Complete presence, nothing held back", "Anonymous desire"],
  },
  {
    id: "the_bodyguard",
    label: "The Bodyguard",
    sub: "Protect. Don't touch. He's failing at one of those instructions. Deliberately.",
    room: "in_character",
    darkness: "After Dark",
    gradient: "from-[#0e0a00] via-[#1a1200] to-[#080600]",
    accent: "#f59e0b",
    storyMode: "forbidden",
    tags: ["He pursues, I decide", "Something between you that should be forbidden"],
  },
  {
    id: "historical",
    label: "The Historical Lord",
    sub: "Another century. The same desire. Wilder constraints and far fewer words.",
    room: "in_character",
    darkness: "Deep Night",
    gradient: "from-[#120800] via-[#201200] to-[#0c0600]",
    accent: "#d97706",
    storyMode: "forbidden",
    tags: ["Something between you that should be forbidden", "The risk is part of the pull"],
  },
  {
    id: "the_artist",
    label: "The Artist",
    sub: "He studies her the way he studies his subjects. Eventually he asks to capture more.",
    room: "in_character",
    darkness: "After Dark",
    gradient: "from-[#0c0800] via-[#180e00] to-[#080500]",
    accent: "#f97316",
    storyMode: "passionate",
    tags: ["Being completely seen", "His total attention"],
  },
  {
    id: "the_personal_trainer",
    label: "The Personal Trainer",
    sub: "Discipline. Correction. Two bodies in close proximity. Something had to give eventually.",
    room: "in_character",
    darkness: "After Dark",
    gradient: "from-[#0a0600] via-[#160e00] to-[#060400]",
    accent: "#fbbf24",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Complete presence, nothing held back"],
  },
  {
    id: "the_billionaire",
    label: "The Billionaire",
    sub: "He asked. That was the only thing that mattered. She took her time deciding.",
    room: "in_character",
    darkness: "Deep Night",
    gradient: "from-[#0e0a00] via-[#1a1400] to-[#070600]",
    accent: "#c9a227",
    storyMode: "unrestrained",
    tags: ["He pursues, I decide", "Being the only thing he is thinking about"],
  },
  {
    id: "the_detective_scenario",
    label: "The Detective",
    sub: "He's been asking questions for an hour. She just answered the one he was actually asking.",
    room: "in_character",
    darkness: "Deep Night",
    gradient: "from-[#060810] via-[#0c1018] to-[#040608]",
    accent: "#60a5fa",
    storyMode: "forbidden",
    tags: ["He pursues, I decide", "The risk is part of the pull"],
  },
  {
    id: "the_rival",
    label: "The Rival",
    sub: "They've been competing for the same thing for two years. Tonight one of them concedes.",
    room: "in_character",
    darkness: "After Dark",
    gradient: "from-[#0c0800] via-[#161000] to-[#080600]",
    accent: "#f59e0b",
    storyMode: "passionate",
    tags: ["Equal desire, equal intensity", "Unfinished business"],
  },

  /* Eyes On Us ─── */
  {
    id: "watched",
    label: "Watched",
    sub: "Someone is watching. She knows. She doesn't slow down. She gets slower.",
    room: "eyes_on_us",
    darkness: "Deep Night",
    gradient: "from-[#001010] via-[#001a1a] to-[#000808]",
    accent: "#14b8a6",
    storyMode: "unrestrained",
    tags: ["Being the only thing he is thinking about", "Being completely seen"],
  },
  {
    id: "the_mirror",
    label: "The Mirror",
    sub: "She wanted to look. Something in her resisted. He held the space. When she finally did, it was entirely her choice.",
    room: "eyes_on_us",
    darkness: "No Limits",
    gradient: "from-[#001414] via-[#001e1e] to-[#000c0c]",
    accent: "#0d9488",
    storyMode: "unrestrained",
    tags: ["Nothing off limits", "He's completely in control"],
  },
  {
    id: "semi_public",
    label: "Semi-Public",
    sub: "The risk of being discovered is the only point. Both of them are counting on it.",
    room: "eyes_on_us",
    darkness: "Deep Night",
    gradient: "from-[#001018] via-[#001820] to-[#000810]",
    accent: "#06b6d4",
    storyMode: "unrestrained",
    tags: ["The risk is part of the pull", "Complete presence, nothing held back"],
  },
  {
    id: "live_performance",
    label: "Live Performance",
    sub: "There's an audience. Only two of them know exactly what they're really watching.",
    room: "eyes_on_us",
    darkness: "No Limits",
    gradient: "from-[#001018] via-[#001c20] to-[#000c10]",
    accent: "#0891b2",
    storyMode: "unrestrained",
    tags: ["The risk is part of the pull", "Being completely seen"],
  },
  {
    id: "the_window",
    label: "The Window",
    sub: "The curtains are open. She doesn't close them. He notices. Neither of them moves to change it.",
    room: "eyes_on_us",
    darkness: "Deep Night",
    gradient: "from-[#00080e] via-[#001018] to-[#000508]",
    accent: "#22d3ee",
    storyMode: "unrestrained",
    tags: ["Being completely seen", "The risk is part of the pull"],
  },

  /* Sweet & Savage ─── */
  {
    id: "gentle_then_not",
    label: "Gentle, Then Not",
    sub: "He started soft. Deliberate. Patient. Then something in him decided the patience was over.",
    room: "sweet_and_savage",
    darkness: "Deep Night",
    gradient: "from-[#180010] via-[#240018] to-[#100008]",
    accent: "#db2777",
    storyMode: "unrestrained",
    tags: ["Equal desire, equal intensity", "Nothing implied where it can be named"],
  },
  {
    id: "ruin_me",
    label: "Ruin Me",
    sub: "She said it and meant every word. He took his time making sure she knew it.",
    room: "sweet_and_savage",
    darkness: "No Limits",
    gradient: "from-[#1a0012] via-[#28001a] to-[#10000c]",
    accent: "#be185d",
    storyMode: "unrestrained",
    tags: ["Total surrender", "Nothing implied where it can be named", "Nothing off limits"],
  },
  {
    id: "after_everything",
    label: "After Everything",
    sub: "Everything that came before this. And then the tenderness caught her more off guard than any of it.",
    room: "sweet_and_savage",
    darkness: "After Dark",
    gradient: "from-[#140010] via-[#200018] to-[#0c0008]",
    accent: "#ec4899",
    storyMode: "passionate",
    tags: ["Adoration and surrender", "Complicated wanting"],
  },
  {
    id: "the_sweet_spot",
    label: "The Sweet Spot",
    sub: "She knew what she needed. He knew how to listen. Everything that followed was the answer.",
    room: "sweet_and_savage",
    darkness: "After Dark",
    gradient: "from-[#160010] via-[#220018] to-[#0e0008]",
    accent: "#f472b6",
    storyMode: "unrestrained",
    tags: ["He knows exactly what you need", "His total attention"],
  },
  {
    id: "say_it",
    label: "Say It",
    sub: "She's been holding it back. He makes it safe to let go. The moment she does is the whole story.",
    room: "sweet_and_savage",
    darkness: "Deep Night",
    gradient: "from-[#180012] via-[#26001c] to-[#10000a]",
    accent: "#db2777",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Nothing implied where it can be named"],
  },

  /* More Than Two ─── */
  {
    id: "the_other_one",
    label: "The Other One",
    sub: "There's someone else in the room. Everything just became more complicated and more wanted.",
    room: "more_than_two",
    darkness: "Deep Night",
    gradient: "from-[#050010] via-[#0a001a] to-[#030008]",
    accent: "#6366f1",
    storyMode: "unrestrained",
    tags: ["Complete presence, nothing held back", "Nothing off limits"],
  },
  {
    id: "two_of_him",
    label: "Two of Him",
    sub: "She didn't plan for this. Neither did they. All three agreed without speaking a word.",
    room: "more_than_two",
    darkness: "No Limits",
    gradient: "from-[#080010] via-[#0e001c] to-[#04000a]",
    accent: "#818cf8",
    storyMode: "unrestrained",
    tags: ["Nothing off limits", "Desire without apology"],
  },
  {
    id: "her_choosing",
    label: "Her Choosing",
    sub: "Both of them want her. She takes her time deciding exactly what that means for tonight.",
    room: "more_than_two",
    darkness: "Deep Night",
    gradient: "from-[#060010] via-[#0c001a] to-[#040008]",
    accent: "#a5b4fc",
    storyMode: "unrestrained",
    tags: ["I take what I want", "I'm completely in control"],
  },
  {
    id: "she_invited_someone",
    label: "She Invited Someone",
    sub: "She didn't tell him. He wasn't angry. He was the opposite of angry.",
    room: "more_than_two",
    darkness: "No Limits",
    gradient: "from-[#07000e] via-[#0e0018] to-[#04000a]",
    accent: "#7c3aed",
    storyMode: "unrestrained",
    tags: ["Nothing off limits", "Desire without apology"],
  },
  {
    id: "the_weekend",
    label: "The Weekend",
    sub: "Three days. No schedule. Three people who have decided not to waste a single hour.",
    room: "more_than_two",
    darkness: "No Limits",
    gradient: "from-[#060012] via-[#0a001c] to-[#040008]",
    accent: "#6366f1",
    storyMode: "unrestrained",
    tags: ["Nothing off limits", "Complete presence, nothing held back"],
  },

  /* The Edge ─── */
  {
    id: "obsession",
    label: "Obsession",
    sub: "He notices everything about her. She's started doing things just to see if he's still watching. He always is.",
    room: "the_edge",
    darkness: "Deep Night",
    gradient: "from-[#080010] via-[#10001e] to-[#04000a]",
    accent: "#7c3aed",
    storyMode: "unrestrained",
    tags: ["Being the only thing he is thinking about", "He pursues, I decide"],
  },
  {
    id: "mind_games",
    label: "Mind Games",
    sub: "She thought she had the upper hand. He let her think that. Right up until the moment he didn't.",
    room: "the_edge",
    darkness: "No Limits",
    gradient: "from-[#0a000e] via-[#14001a] to-[#060008]",
    accent: "#6d28d9",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "A line that keeps moving", "Nothing off limits"],
  },
  {
    id: "the_test",
    label: "The Test",
    sub: "He gave her a choice. She made it. He rewarded her in exactly the way she'd been hoping.",
    room: "the_edge",
    darkness: "No Limits",
    gradient: "from-[#090012] via-[#12001e] to-[#04000c]",
    accent: "#7c3aed",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Total surrender"],
  },
  {
    id: "fixation",
    label: "Fixation",
    sub: "He can't stop. She's started counting on it. Neither of them wants this to end.",
    room: "the_edge",
    darkness: "Deep Night",
    gradient: "from-[#060010] via-[#0c001a] to-[#030008]",
    accent: "#8b5cf6",
    storyMode: "unrestrained",
    tags: ["Being the only thing he is thinking about", "Desire without apology"],
  },
  {
    id: "the_arrangement_edge",
    label: "The Arrangement",
    sub: "Clear terms. No feelings. They both broke the rules. Only one of them admitted it.",
    room: "the_edge",
    darkness: "Deep Night",
    gradient: "from-[#080010] via-[#0e001c] to-[#04000a]",
    accent: "#7c3aed",
    storyMode: "forbidden",
    tags: ["Complicated wanting", "A line that keeps moving"],
  },

  /* Dark Territory ─── */
  {
    id: "completely_undone",
    label: "Completely Undone",
    sub: "He takes her further than she expected. She discovers she wanted to go there all along.",
    room: "dark_territory",
    darkness: "No Limits",
    gradient: "from-[#180000] via-[#280000] to-[#0e0000]",
    accent: "#991b1b",
    storyMode: "unrestrained",
    tags: ["Nothing off limits", "Total surrender", "Nothing implied where it can be named"],
  },
  {
    id: "nothing_off_limits",
    label: "Nothing Off Limits",
    sub: "The arrangement: no hesitation, no restraint, no pretending. Everything that follows is permitted.",
    room: "dark_territory",
    darkness: "No Limits",
    gradient: "from-[#1a0000] via-[#2a0000] to-[#100000]",
    accent: "#7f1d1d",
    storyMode: "unrestrained",
    tags: ["Nothing off limits", "Desire without apology", "He knows exactly what you need"],
  },
  {
    id: "past_midnight",
    label: "Past Midnight",
    sub: "Everything she'd never say out loud. He waits until she's ready to say it. Then he makes every word true.",
    room: "dark_territory",
    darkness: "No Limits",
    gradient: "from-[#140000] via-[#200000] to-[#0c0000]",
    accent: "#b91c1c",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Nothing implied where it can be named", "Total surrender"],
  },
  {
    id: "claimed",
    label: "Claimed",
    sub: "One word. Spoken once. He spent the rest of the night making it absolutely true.",
    room: "dark_territory",
    darkness: "No Limits",
    gradient: "from-[#160000] via-[#240000] to-[#0e0000]",
    accent: "#c0392b",
    storyMode: "unrestrained",
    tags: ["Total surrender", "Nothing off limits", "He's completely in control"],
  },
  {
    id: "no_mercy",
    label: "No Mercy",
    sub: "She asked him not to stop. He didn't. Not once. Not for anything.",
    room: "dark_territory",
    darkness: "No Limits",
    gradient: "from-[#180000] via-[#2a0000] to-[#100000]",
    accent: "#991b1b",
    storyMode: "unrestrained",
    tags: ["Nothing off limits", "Total surrender", "Desire without apology"],
  },
  {
    id: "every_limit",
    label: "Every Limit",
    sub: "She thought she knew where her edges were. He made it his mission to find every single one.",
    room: "dark_territory",
    darkness: "No Limits",
    gradient: "from-[#1a0000] via-[#280000] to-[#120000]",
    accent: "#7f1d1d",
    storyMode: "unrestrained",
    tags: ["Nothing off limits", "Nothing implied where it can be named", "Total surrender"],
  },

  /* All of Them ─── */
  {
    id: "three_of_them",
    label: "Three of Them",
    sub: "No one planned this many. Not a single one of them. They all understood the same moment.",
    room: "all_of_them",
    darkness: "No Limits",
    gradient: "from-[#1a1400] via-[#261e00] to-[#100c00]",
    accent: "#d4a017",
    storyMode: "unrestrained",
    tags: ["Multiple men, undivided attention", "Black masculine dominance", "Nothing implied where it can be named"],
  },
  {
    id: "the_one_who_sent_others",
    label: "The One Who Sent the Others",
    sub: "He arranged it. Nothing was asked for. He knew exactly what hadn't been said out loud.",
    room: "all_of_them",
    darkness: "No Limits",
    gradient: "from-[#1c1600] via-[#281e00] to-[#120e00]",
    accent: "#b8860b",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Black masculine dominance", "Nothing off limits"],
  },
  {
    id: "the_two_he_brought",
    label: "The Two He Brought",
    sub: "He said he was bringing someone. He brought two. A decision was made in the doorway, quickly.",
    room: "all_of_them",
    darkness: "Deep Night",
    gradient: "from-[#181200] via-[#221a00] to-[#0e0a00]",
    accent: "#d4a017",
    storyMode: "unrestrained",
    tags: ["Multiple men, undivided attention", "Black masculine dominance", "Nothing implied where it can be named"],
  },
  {
    id: "their_terms",
    label: "Their Terms",
    sub: "They had specific ideas about how tonight would go. One answer to all of it: yes.",
    room: "all_of_them",
    darkness: "No Limits",
    gradient: "from-[#1a1200] via-[#261c00] to-[#100a00]",
    accent: "#c9a227",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Black masculine dominance", "The object of all their wanting"],
  },
  {
    id: "room_end_of_hall",
    label: "The Room at the End of the Hall",
    sub: "The briefing had been clear. They made sure every second was felt as exactly that.",
    room: "all_of_them",
    darkness: "No Limits",
    gradient: "from-[#160e00] via-[#221600] to-[#0c0800]",
    accent: "#d4a017",
    storyMode: "unrestrained",
    tags: ["Multiple men, undivided attention", "Black masculine dominance", "Nothing off limits"],
  },

  /* Dark Fantasy ─── */
  {
    id: "the_creature",
    label: "The Creature",
    sub: "He'd been watching from somewhere she couldn't see. When he finally appeared, she understood the watching had been permission-seeking.",
    room: "dark_fantasy",
    darkness: "Deep Night",
    gradient: "from-[#080010] via-[#10001a] to-[#040008]",
    accent: "#7c3aed",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Something not entirely human", "Desire without apology"],
  },
  {
    id: "the_bargain",
    label: "The Bargain",
    sub: "She made a deal. She knew exactly what she was agreeing to. She had wanted to agree for some time.",
    room: "dark_fantasy",
    darkness: "No Limits",
    gradient: "from-[#0a000e] via-[#14001a] to-[#060008]",
    accent: "#6d28d9",
    storyMode: "unrestrained",
    tags: ["Power fully exchanged", "Ancient claiming", "Nothing off limits"],
  },
  {
    id: "the_god_noticed",
    label: "The God Who Noticed Her",
    sub: "He shouldn't have looked. She shouldn't have looked back. Neither of them has any intention of stopping.",
    room: "dark_fantasy",
    darkness: "After Dark",
    gradient: "from-[#060010] via-[#0e001c] to-[#030008]",
    accent: "#8b5cf6",
    storyMode: "unrestrained",
    tags: ["He pursues, I decide", "Something not entirely human", "He's completely in control"],
  },
  {
    id: "the_dream_wasnt",
    label: "The Dream That Wasn't",
    sub: "She'd been dreaming the same thing for weeks. Tonight it follows her out of sleep.",
    room: "dark_fantasy",
    darkness: "Deep Night",
    gradient: "from-[#080012] via-[#10001e] to-[#04000c]",
    accent: "#7c3aed",
    storyMode: "unrestrained",
    tags: ["Something not entirely human", "Nothing implied where it can be named", "Being completely seen"],
  },

  /* The Praise Room ─── */
  {
    id: "every_specific_thing",
    label: "Every Specific Thing",
    sub: "He named them all. He'd been composing the list for months. He delivered it without stopping.",
    room: "the_praise_room",
    darkness: "After Dark",
    gradient: "from-[#100800] via-[#1c1000] to-[#080500]",
    accent: "#d97706",
    storyMode: "passionate",
    tags: ["Every word of praise named specifically", "Being completely seen", "His total attention"],
  },
  {
    id: "the_way_he_said_it",
    label: "The Way He Said It",
    sub: "It was only words. She understood why people write poetry about this.",
    room: "the_praise_room",
    darkness: "After Dark",
    gradient: "from-[#0e0800] via-[#1a1000] to-[#060400]",
    accent: "#f59e0b",
    storyMode: "passionate",
    tags: ["She is described and adored as it happens", "He knows exactly what you need"],
  },
  {
    id: "worship",
    label: "Worship",
    sub: "He took his time. He had prepared what he wanted to say. She had not prepared for the effect.",
    room: "the_praise_room",
    darkness: "Deep Night",
    gradient: "from-[#120a00] via-[#201400] to-[#0a0600]",
    accent: "#d97706",
    storyMode: "passionate",
    tags: ["Every word of praise named specifically", "He catalogues what she is", "He's completely in control"],
  },
  {
    id: "out_loud",
    label: "Out Loud",
    sub: "She'd only ever thought it. He said it. All of it. In specific terms.",
    room: "the_praise_room",
    darkness: "Deep Night",
    gradient: "from-[#100800] via-[#1c1000] to-[#080500]",
    accent: "#fbbf24",
    storyMode: "passionate",
    tags: ["She is described and adored as it happens", "The words are part of the act", "He knows exactly what you need"],
  },

  /* Just the Scene ─── */
  {
    id: "already",
    label: "Already",
    sub: "No before. No how they got there. Just this, from the first word.",
    room: "just_the_scene",
    darkness: "After Dark",
    gradient: "from-[#18000e] via-[#260018] to-[#100008]",
    accent: "#db2777",
    storyMode: "unrestrained",
    tags: ["Nothing implied where it can be named", "Complete presence, nothing held back"],
  },
  {
    id: "the_continuation",
    label: "The Continuation",
    sub: "Something had already happened before this. They weren't stopping to discuss it.",
    room: "just_the_scene",
    darkness: "Deep Night",
    gradient: "from-[#1a0012] via-[#28001c] to-[#10000c]",
    accent: "#be185d",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Nothing off limits"],
  },
  {
    id: "scene_two",
    label: "Scene Two",
    sub: "Skip the first part. Start where the tension breaks. End somewhere she didn't expect.",
    room: "just_the_scene",
    darkness: "Deep Night",
    gradient: "from-[#160010] via-[#220018] to-[#0e0008]",
    accent: "#ec4899",
    storyMode: "unrestrained",
    tags: ["Nothing implied where it can be named", "Desire without apology"],
  },
  {
    id: "pure",
    label: "Pure",
    sub: "Nothing to explain. Nothing to justify. Just the moment and what happens in it.",
    room: "just_the_scene",
    darkness: "After Dark",
    gradient: "from-[#14000e] via-[#1e0016] to-[#0c0008]",
    accent: "#f472b6",
    storyMode: "unrestrained",
    tags: ["Complete presence, nothing held back", "Desire without apology"],
  },

  /* Novel Arc ─── */
  {
    id: "novel_misunderstanding",
    label: "The Misunderstanding",
    sub: "She thought she knew. She was wrong about the most important part. He had to find a way to show her.",
    room: "novel_arc",
    darkness: "After Dark",
    gradient: "from-[#001018] via-[#001820] to-[#000810]",
    accent: "#0891b2",
    storyMode: "passionate",
    tags: ["Complicated wanting", "Unfinished business", "Equal desire, equal intensity"],
  },
  {
    id: "novel_last_chance",
    label: "The Last Chance",
    sub: "She was leaving. He had one conversation to change her mind. Neither of them mentioned what the conversation was actually about.",
    room: "novel_arc",
    darkness: "After Dark",
    gradient: "from-[#001214] via-[#001c1e] to-[#000a0c]",
    accent: "#06b6d4",
    storyMode: "passionate",
    tags: ["Unfinished business", "He pursues, I decide", "Complete presence, nothing held back"],
  },
  {
    id: "novel_return",
    label: "The Return",
    sub: "Years ago, something stopped. Tonight they're in the same room again. Both of them are pretending they don't know why.",
    room: "novel_arc",
    darkness: "Deep Night",
    gradient: "from-[#000e18] via-[#001420] to-[#000810]",
    accent: "#0891b2",
    storyMode: "passionate",
    tags: ["Unfinished business", "Complicated wanting", "A line that keeps moving"],
  },
  {
    id: "novel_obstacle",
    label: "The Obstacle",
    sub: "There's a reason this shouldn't happen. The reason is still there. Neither of them can stop.",
    room: "novel_arc",
    darkness: "Deep Night",
    gradient: "from-[#001018] via-[#001820] to-[#000810]",
    accent: "#22d3ee",
    storyMode: "forbidden",
    tags: ["Something between you that should be forbidden", "A line that keeps moving", "Complicated wanting"],
  },

  /* Her Power ─── */
  {
    id: "her_devoted",
    label: "Devoted",
    sub: "She asked. They gave her everything — and then more than she asked for.",
    room: "her_power",
    darkness: "After Dark",
    gradient: "from-[#1a0810] via-[#280015] to-[#100508]",
    accent: "#e879a0",
    storyMode: "unrestrained",
    allowedPairings: ["Her & Him", "Her & Her"],
    tags: ["She asked for it and he obliged completely", "She is worshipped before anything else"],
  },
  {
    id: "her_on_command",
    label: "On Command",
    sub: "She gives the instructions. They follow each one without hesitation. Both of them know exactly what they're doing.",
    room: "her_power",
    darkness: "After Dark",
    gradient: "from-[#180810] via-[#260015] to-[#100810]",
    accent: "#ec4899",
    storyMode: "unrestrained",
    allowedPairings: ["Her & Him", "Her & Her"],
    tags: ["He does exactly what she says", "She decides when it ends"],
  },
  {
    id: "her_all_eyes",
    label: "All Eyes On Her",
    sub: "Two of them. Both for her. She directed everything, and neither of them minded at all.",
    room: "her_power",
    darkness: "Deep Night",
    gradient: "from-[#1a0612] via-[#28081a] to-[#12040e]",
    accent: "#f472b6",
    storyMode: "unrestrained",
    allowedPairings: ["Her & Him", "Her & Her"],
    tags: ["She directed them both — they were there for exactly that", "Two men, both completely focused on her"],
  },
  {
    id: "her_chose_this",
    label: "She Chose This",
    sub: "They watch. That is their role tonight, because she decided it. It's the most attentive they've ever been.",
    room: "her_power",
    darkness: "After Dark",
    gradient: "from-[#1a0810] via-[#240010] to-[#100508]",
    accent: "#e879a0",
    storyMode: "unrestrained",
    allowedPairings: ["Her & Him", "Her & Her"],
    tags: ["He watches because she wanted him to", "She leads and he follows"],
  },
  {
    id: "her_terms",
    label: "Her Terms",
    sub: "Her choice of who. Her choice of when. Her exit whenever she decides. No part of this evening belongs to anyone but her.",
    room: "her_power",
    darkness: "Deep Night",
    gradient: "from-[#180a08] via-[#260e0c] to-[#100606]",
    accent: "#fb7185",
    storyMode: "unrestrained",
    allowedPairings: ["Her & Him", "Her & Her"],
    tags: ["She swings on her terms — her choice, her lead, her exit", "She chooses who touches her"],
  },
  {
    id: "her_kneeling",
    label: "Kneeling",
    sub: "They are on their knees. Not in surrender. In devotion. She has not asked them to move and they have no intention of it.",
    room: "her_power",
    darkness: "After Dark",
    gradient: "from-[#1c0810] via-[#2a0e18] to-[#12060c]",
    accent: "#e11d48",
    storyMode: "unrestrained",
    allowedPairings: ["Her & Him", "Her & Her"],
    tags: ["He is on his knees — that is where she wants him and he wants to be", "She is worshipped before anything else"],
  },
  {
    id: "her_rules",
    label: "Her Rules",
    sub: "She told them what was and wasn't permitted. She told them what good behaviour looked like. They followed every instruction.",
    room: "her_power",
    darkness: "No Limits",
    gradient: "from-[#1a0810] via-[#300015] to-[#110508]",
    accent: "#be185d",
    storyMode: "unrestrained",
    allowedPairings: ["Her & Him", "Her & Her"],
    tags: ["She told them the rules — they followed them", "She tells him what good behaviour earns — he earns it"],
  },
  {
    id: "her_first",
    label: "Her First",
    sub: "The rule, which she stated plainly and they agreed to, is that her pleasure comes first. This is a story about following that rule to the letter.",
    room: "her_power",
    darkness: "After Dark",
    gradient: "from-[#160810] via-[#220015] to-[#0e0508]",
    accent: "#db2777",
    storyMode: "unrestrained",
    allowedPairings: ["Her & Him", "Her & Her"],
    tags: ["Her pleasure is the whole story", "He gives her what she asks for"],
  },
];

/* ── Loading phases ─────────────────────────────────────────────────── */
const LOADING_PHASES = [
  { label: "Setting the scene…", sub: "Building the world behind closed doors" },
  { label: "Writing the story…", sub: "Crafting every moment with full presence" },
  { label: "Adding depth…", sub: "Layering the emotional weight and tension" },
  { label: "Refining the edge…", sub: "Making every scene land exactly right" },
  { label: "Composing imagery…", sub: "Designing cinematic visuals" },
  { label: "Finalizing…", sub: "Your private story is almost ready" },
];

/* ── Paywall preview teasers ────────────────────────────────────────── */
const AFTER_DARK_TEASERS: Record<string, string> = {
  unrestrained: "The restraint was over. Everything you'd been circling — the charge, the tension, the specific wanting — had reached its end. He was looking at you with the kind of certainty that meant there was nothing left to negotiate. This story holds nothing back.",
  forbidden: "You both knew the rules. Had been following them with a precision that felt increasingly like a kind of foreplay. This was the version where the rules stopped mattering. Where the reason it's wrong becomes the reason it's everything.",
  passionate: "The feeling and the desire had stopped taking turns. Both were fully present — neither reining the other in, neither making apologies. He was looking at you like you were the answer to a question he'd stopped pretending not to ask.",
};

const AFTER_DARK_TITLES: Record<string, string> = {
  unrestrained: "Nothing held back",
  forbidden: "The moment the rules stopped",
  passionate: "Feeling and desire, both",
};

/* ── Darkness badge ─────────────────────────────────────────────────── */
const DARKNESS_STYLES: Record<DarknessLevel, { text: string; border: string; bg: string }> = {
  "After Dark":  { text: "#e88", border: "rgba(192,57,43,0.3)",  bg: "rgba(192,57,43,0.06)" },
  "Deep Night":  { text: "#f55", border: "rgba(192,57,43,0.55)", bg: "rgba(192,57,43,0.1)"  },
  "No Limits":   { text: "#ff4040", border: "rgba(220,38,38,0.7)", bg: "rgba(220,38,38,0.14)" },
};

function DarknessBadge({ level }: { level: DarknessLevel }) {
  const s = DARKNESS_STYLES[level];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
      style={{ color: s.text, border: `1px solid ${s.border}`, background: s.bg }}
    >
      {level}
    </span>
  );
}

/* ── Scenario card ──────────────────────────────────────────────────── */
function ScenarioCard({
  scenario,
  selected,
  locked,
  onClick,
}: {
  scenario: Scenario;
  selected?: boolean;
  locked?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      whileHover={{ scale: (selected || locked) ? 1 : 1.02 }}
      whileTap={{ scale: locked ? 1 : 0.97 }}
      animate={{ width: selected ? 300 : 255 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl border text-left flex-shrink-0 transition-colors ${
        locked
          ? "border-white/6 opacity-40 cursor-not-allowed"
          : selected
          ? "border-white/30 shadow-[0_0_24px_rgba(192,57,43,0.22)]"
          : "border-white/6 hover:border-white/16"
      }`}
      style={{ minHeight: "185px" }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${scenario.gradient}`} />
      <motion.div
        animate={{ opacity: selected ? [0.4, 0.7, 0.4] : [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at 70% 35%, ${scenario.accent}35 0%, transparent 65%)`,
        }}
      />
      <div className="relative z-10 p-4 flex flex-col gap-2 h-full">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-white text-sm leading-snug flex-1">
            {scenario.label}
          </p>
          {selected && !locked && (
            <div className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse flex-shrink-0 mt-1" />
          )}
        </div>
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.p
              key="full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-white/80 text-xs leading-relaxed"
            >
              {scenario.sub}
            </motion.p>
          ) : (
            <motion.p
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-white/80 text-xs leading-snug line-clamp-3"
            >
              {scenario.sub}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="mt-auto flex items-center gap-2 flex-wrap">
          <DarknessBadge level={scenario.darkness} />
          {scenario.allowedPairings && (
            <span
              className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border"
              style={{ color: scenario.accent, borderColor: `${scenario.accent}44`, background: `${scenario.accent}11` }}
            >
              Her stories only
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ── Main component ─────────────────────────────────────────────────── */
export default function AfterDark() {
  const { isAuthenticated, isLoading: authLoading, openSignIn } = useAuth();
  const [ageConfirmed, setAgeConfirmed] = useState(() => hasConfirmedAge());
  const [showLanding, setShowLanding] = useState(true);
  const [phase, setPhase] = useState<"pairing" | "scenario" | "casting" | "generating" | "result" | "paywall">("pairing");
  const [selectedPairing, setSelectedPairing] = useState<string | null>(null);
  const [paywallLoadingPlan, setPaywallLoadingPlan] = useState<string | null>(null);
  const [paywallCoverUrl, setPaywallCoverUrl] = useState<string | null>(null);
  const [paywallImageLoading, setPaywallImageLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    const handler = (e: PageTransitionEvent) => {
      if (e.persisted) setPaywallLoadingPlan(null);
    };
    window.addEventListener("pageshow", handler);
    return () => window.removeEventListener("pageshow", handler);
  }, []);

  // castingHandoff is built when the user selects a scenario, pre-loading the pairing
  const [castingHandoff, setCastingHandoff] = useState<CastingRoomHandoff | null>(null);
  // confirmedPairing: the most recently known pairing — set from handoff on load,
  // then updated after each casting completion so locking is always current.
  const [confirmedPairing, setConfirmedPairing] = useState<string | null>(null);

  const lastGenDataRef = useRef<Record<string, unknown> | null>(null);

  // Pre-generate the paywall cover image as soon as the scenario is selected,
  // so by the time the paywall appears it's already fetched.
  const preGenCoverPromise = useRef<Promise<string | null> | null>(null);

  const fetchPreviewCover = useCallback(async (pairing?: string): Promise<string | null> => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetch(`${API_BASE}/api/preview-cover`, {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood: "After Dark", intensity: "Unrestrained", pairing }),
        });
        if (r.ok) {
          const d = await r.json() as { url?: string };
          if (d?.url) return d.url;
        }
      } catch { /* ignore — will retry or fallback */ }
      if (attempt < 1) await new Promise(res => setTimeout(res, 2000));
    }
    return null;
  }, []);

  // Always start fresh — no handoff from regular casting room

  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<FullGeneratedStory | null>(null);
  const [lastCastingData, setLastCastingData] = useState<Record<string, unknown> | null>(null);

  // Guard: if the user somehow reaches the scenario screen without a pairing selected
  // (e.g. state preserved across HMR, or navigating via browser history), send them
  // back to pairing so they always choose their pairing first.
  useEffect(() => {
    if (phase === "scenario" && !selectedPairing) {
      setPhase("pairing");
    }
  }, [phase, selectedPairing]);

  useEffect(() => {
    if (phase !== "paywall") {
      if (phase === "pairing") {
        // Full reset — user navigated all the way back
        preGenCoverPromise.current = null;
        setPaywallCoverUrl(null);
      }
      return;
    }
    setPaywallImageLoading(true);
    (async () => {
      // Use pre-generated image if available (started when scenario was selected)
      if (preGenCoverPromise.current) {
        const url = await preGenCoverPromise.current;
        if (url) { setPaywallCoverUrl(url); setPaywallImageLoading(false); return; }
      }
      // Fallback: generate now (no pre-gen started, or it failed)
      const pairing = (lastCastingData?.pairing as string | undefined) ?? selectedPairing ?? undefined;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const r = await fetch(`${API_BASE}/api/preview-cover`, {
            method: "POST", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mood: "After Dark", intensity: "Unrestrained", pairing }),
          });
          if (r.ok) {
            const d = await r.json() as { url?: string };
            if (d?.url) { setPaywallCoverUrl(d.url); setPaywallImageLoading(false); return; }
          }
        } catch {}
        if (attempt < 1) await new Promise(res => setTimeout(res, 1500));
      }
      setPaywallImageLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const [presetSaved, setPresetSaved] = useState(false);
  const [pendingAfterDarkCast, setPendingAfterDarkCast] = useState<{
    casting: CastingRoomResult;
    allTags: string[];
  } | null>(null);
  const phaseTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { play } = useAudioPlayer();

  const startLoadingPhase = useCallback(() => {
    phaseTimersRef.current.forEach(clearTimeout);
    phaseTimersRef.current = [];
    setLoadingPhase(0);
    const phaseMs = [8000, 20000, 12000, 12000, 12000, 35000];
    let cumulativeMs = 0;
    phaseMs.forEach((ms, i) => {
      cumulativeMs += ms;
      phaseTimersRef.current.push(
        setTimeout(() => setLoadingPhase(Math.min(i + 1, LOADING_PHASES.length - 1)), cumulativeMs)
      );
    });
  }, []);

  const stopLoadingPhase = useCallback(() => {
    phaseTimersRef.current.forEach(clearTimeout);
    phaseTimersRef.current = [];
  }, []);

  const applyResultToPlayer = useCallback(
    (data: FullGeneratedStory) => {
      if (data.audioUrl) {
        const storyForPlayer = {
          id: data.id,
          title: data.title,
          description: data.description,
          mood: data.mood,
          tags: [data.mood],
          duration: data.duration,
          coverImage: data.images.cover,
          audioUrl: data.audioUrl,
          isPremium: false,
          isNew: true,
          scenes: data.scenes.map((s, i) => ({
            ...s,
            image: data.images.scenes[i],
          })),
        };
        setTimeout(() => play(storyForPlayer as Parameters<typeof play>[0]), 300);
      }
    },
    [play]
  );

  const generateMutation = useGenerateFullStory({
    mutation: {
      onSuccess: (data) => {
        stopLoadingPhase();
        setResult(data);
        setPhase("result");
        applyResultToPlayer(data);
      },
      onError: (err: unknown) => {
        stopLoadingPhase();
        const status = (err as { status?: number }).status;
        if (status === 401 || status === 402) {
          setPhase("paywall");
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setPhase("casting");
        }
      },
    },
  });

  const handleSavePreset = useCallback(async () => {
    if (!lastCastingData || !isAuthenticated) return;
    const archetype = lastCastingData.archetype as string ?? "";
    const dynamic = lastCastingData.dynamic as string ?? "";
    const name = [archetype, dynamic].filter(Boolean).join(" · ") || "My After Dark Cast";
    try {
      await fetch(`${API_BASE}/api/me/presets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, castingData: lastCastingData }),
      });
      setPresetSaved(true);
    } catch { /* ignore */ }
  }, [lastCastingData, isAuthenticated]);

  // Launches Stripe checkout from the paywall phase
  const startAfterDarkCheckout = useCallback(async (plan: "monthly" | "annual") => {
    setPaywallLoadingPlan(plan);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, returnPath: window.location.pathname }),
      });
      const data = await res.json() as { url?: string };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
    } catch { /* silent */ }
    setPaywallLoadingPlan(null);
  }, []);



  // Generates immediately from casting data — avoids stale React state reads
  const handleAutoGenerateAfterDark = useCallback(
    async (casting: CastingRoomResult, allTags: string[]) => {
      setPhase("generating");
      startLoadingPhase();
      const apiPerspective =
        casting.perspective === "your" ? "you"
        : casting.perspective === "their" ? "they"
        : casting.perspective;
      const genData: Record<string, unknown> = {
        mood: "Late Night",
        intensity: casting.intensity,
        voiceFeel: casting.voiceId ?? "RILOU7YmBhvwJGDGjNmP",
        storyLength: "10 min",
        perspective: apiPerspective,
        cinematicVisuals: true,
        emotionalFocus: false,
        whoIsHe: casting.archetype || undefined,
        dynamic: casting.dynamic || selectedScenario?.tags[0] || undefined,
        storyMode: selectedScenario?.storyMode ?? "unrestrained",
        experienceTags: allTags,
        pairing: casting.pairing || undefined,
        heritage: casting.heritage || undefined,
        atmosphere: casting.atmosphere || undefined,
        chemistry: casting.chemistry || undefined,
        setting: casting.setting || undefined,
        appearBuild: casting.appearBuild || undefined,
        appearHeight: casting.appearHeight || undefined,
        appearColouring: casting.appearColouring || undefined,
        appearEyes: casting.appearEyes || undefined,
        appearFeatures: casting.appearFeatures?.length ? casting.appearFeatures : undefined,
        listenerName: casting.listenerName || undefined,
        partnerName: casting.partnerName || undefined,
        country: casting.country || undefined,
        city: casting.city || undefined,
        scenarioRoom: selectedScenario?.room,
        situationId: casting.situationId || undefined,
      };
      lastGenDataRef.current = genData;
      try {
        await generateMutation.mutateAsync({ data: genData as never });
      } finally {
        stopLoadingPhase();
      }
    },
    [generateMutation, startLoadingPhase, stopLoadingPhase, selectedScenario]
  );

  const handleCastingComplete = useCallback(
    (casting: CastingRoomResult) => {
      // Update confirmed pairing so scenario lock state reflects this cast.
      if (casting.pairing) setConfirmedPairing(casting.pairing);

      // Guard: if the selected scenario requires specific pairings and the
      // chosen pairing doesn't qualify, send the user back to scenario selection.
      if (
        selectedScenario?.allowedPairings &&
        casting.pairing &&
        !selectedScenario.allowedPairings.includes(casting.pairing)
      ) {
        setSelectedScenario(null);
        setPhase("scenario");
        return;
      }

      const storyMode = selectedScenario?.storyMode ?? "unrestrained";

      const castingSnapshot = {
        archetype: casting.archetype,
        dynamic: casting.dynamic,
        intensity: casting.intensity,
        storyMode,
        voiceId: casting.voiceId,
        pairing: casting.pairing || selectedPairing || undefined,
      };

      setLastCastingData(castingSnapshot);
      setPresetSaved(false);

      const allTags = [...(selectedScenario?.tags ?? []), ...(casting.customTags ?? [])];
      setPendingAfterDarkCast({ casting, allTags });

      // Skip the preset-prompt step — go straight to generation.
      void handleAutoGenerateAfterDark(casting, allTags);
    },
    [selectedScenario, handleAutoGenerateAfterDark]
  );

  if (!ageConfirmed) {
    return <AgeGate onConfirmed={() => setAgeConfirmed(true)} />;
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#c0392b", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (showLanding) {
    return (
      <AnimatePresence mode="wait">
        <AfterDarkLanding key="after-dark-landing" onEnter={() => setShowLanding(false)} />
      </AnimatePresence>
    );
  }

  /* AUTH_GATE_DISABLED — restore before launch
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(ellipse, rgba(192,57,43,0.15) 0%, transparent 70%)",
            border: "1px solid rgba(192,57,43,0.3)",
          }}
        >
          <Moon className="w-7 h-7" style={{ color: "#c0392b" }} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "#c0392b" }}>
            After Dark
          </p>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Everything here is completely private. Always.
          </h2>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            Nothing you read or listen to here is visible to anyone else.
            No social features, no history shared. Sign in to enter.
          </p>
        </div>
        <button
          onClick={openSignIn}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #c0392b, #922b21)", boxShadow: "0 0 24px rgba(192,57,43,0.3)" }}
        >
          Enter your private library
        </button>
      </div>
    );
  }
  */

  return (
    <div
      className="w-full min-h-screen"
      style={{ background: "linear-gradient(180deg, #030303 0%, #070205 60%, #0a0205 100%)" }}
    >
      <AnimatePresence mode="wait">

        {/* ── Pairing Selection (first step in After Dark) ───────────────── */}
        {phase === "pairing" && (
          <motion.div
            key="pairing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="max-w-xl mx-auto px-4 py-12"
          >
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.35)" }}
                >
                  <Moon className="w-4 h-4" style={{ color: "#c0392b" }} />
                </motion.div>
                <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "#c0392b" }}>
                  After Dark
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
                Who's in your story?
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                This shapes everything — the pronouns, the energy, the writing. Choose the pairing.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAIRINGS.map(p => {
                const selected = selectedPairing === p.id;
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    whileHover={{ scale: selected ? 1 : 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedPairing(p.id);
                      setTimeout(() => setPhase("scenario"), 280);
                    }}
                    className={`relative overflow-hidden rounded-2xl border text-left p-5 transition-colors ${
                      selected
                        ? "border-white/30 shadow-[0_0_20px_rgba(192,57,43,0.2)]"
                        : "border-white/8 hover:border-white/20"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${p.accent}18 0%, transparent 70%)`,
                    }}
                  >
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ background: p.accent, opacity: selected ? 1 : 0.3 }} />
                    <p className="font-bold text-white text-base mb-0.5">{p.label}</p>
                    <p className="text-white/65 text-sm">{p.sub}</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Scenario Selection ────────────────────────────────────────── */}
        {phase === "scenario" && (() => {
          const activePairingCfg = PAIRINGS.find(p => p.id === selectedPairing);
          const partnerPronouns = activePairingCfg?.partnerPronouns ?? "he/him";
          const protagonistPronouns = activePairingCfg?.protagonistPronouns ?? "she/her";
          return (
          <motion.div
            key="scenario"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="max-w-3xl mx-auto px-4 py-12"
          >
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setPhase("pairing")}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change pairing
                </button>
                {selectedPairing && (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                    style={{ background: `${activePairingCfg?.accent ?? "#c0392b"}18`, color: activePairingCfg?.accent ?? "#e8a09a", border: `1px solid ${activePairingCfg?.accent ?? "#c0392b"}30` }}
                  >
                    {selectedPairing}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(192,57,43,0.12)",
                    border: "1px solid rgba(192,57,43,0.35)",
                  }}
                >
                  <Moon className="w-4 h-4" style={{ color: "#c0392b" }} />
                </motion.div>
                <span
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: "#c0392b" }}
                >
                  After Dark
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                What are you imagining?
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                You're in the right place. Nothing here leaves this room.{" "}
                Choose your fantasy — everything that follows is written without restraint.
              </p>
            </div>

            {/* Fantasy Rooms */}
            <div className="space-y-10 mb-10">
              {ROOMS.map((room) => {
                const roomScenarios = SCENARIOS.filter((s) => s.room === room.id);
                return (
                  <div key={room.id}>
                    {/* Room heading — image-backed banner */}
                    <div className="mb-4 relative overflow-hidden rounded-xl border" style={{ borderColor: `${room.accent}22` }}>
                      {room.image && (
                        <img
                          src={`${import.meta.env.BASE_URL}${room.image}`}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          width={600}
                          height={600}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ opacity: 0.22 }}
                        />
                      )}
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${room.accent}12 0%, transparent 70%)` }} />
                      <div className="relative flex items-center gap-3 px-4 py-3">
                        <motion.div
                          animate={{ opacity: [0.5, 0.9, 0.5] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="w-1 h-4 rounded-full flex-shrink-0"
                          style={{ background: room.accent }}
                        />
                        <div>
                          <h2
                            className="font-display text-lg font-bold"
                            style={{ color: room.accent }}
                          >
                            {room.name}
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">{room.sub}</p>
                        </div>
                      </div>
                    </div>

                    {/* Horizontal scroll row */}
                    <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-brand">
                      <div className="flex gap-3 w-max">
                        {roomScenarios.map((scenario) => {
                          const isLockedByPairing = !!(
                            scenario.allowedPairings &&
                            confirmedPairing &&
                            !scenario.allowedPairings.includes(confirmedPairing)
                          );
                          const adaptedScenario = {
                            ...scenario,
                            label: adaptScenarioText(scenario.label, protagonistPronouns, partnerPronouns),
                            sub:   adaptScenarioText(scenario.sub,   protagonistPronouns, partnerPronouns),
                            tags:  scenario.tags.map(t => adaptScenarioText(t, protagonistPronouns, partnerPronouns)),
                          };
                          return (
                            <ScenarioCard
                              key={scenario.id}
                              scenario={adaptedScenario}
                              selected={selectedScenario?.id === scenario.id}
                              locked={isLockedByPairing}
                              onClick={() => {
                                if (isLockedByPairing) return;
                                const next = selectedScenario?.id === scenario.id ? null : scenario;
                                setSelectedScenario(next);
                                if (next) {
                                  // Start generating the cover image immediately — it'll be ready by the time the paywall appears
                                  preGenCoverPromise.current = fetchPreviewCover(selectedPairing ?? undefined);
                                  // Pre-load pairing into CastingRoom so step 0 is skipped
                                  if (selectedPairing) {
                                    setCastingHandoff({ pairing: selectedPairing, handoffStep: 1 });
                                    setConfirmedPairing(selectedPairing);
                                  }
                                  window.scrollTo({ top: 0 });
                                  setPhase("casting");
                                }
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </motion.div>
          );
        })()}


        {/* ── Casting Room ──────────────────────────────────────────────── */}
        {phase === "casting" && (
          <motion.div
            key="casting"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="max-w-2xl mx-auto px-4 pt-6">
              <button
                onClick={() => setPhase("scenario")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              {selectedScenario && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c0392b] animate-pulse" />
                  <span className="text-xs font-medium text-[#c0392b]/80">
                    {selectedScenario.label}
                  </span>
                </div>
              )}
            </div>
            <CastingRoom
              onComplete={handleCastingComplete}
              onSkip={() =>
                handleCastingComplete({
                  perspective: "her",
                  heritage: "",
                  archetype: "",
                  chemistry: selectedScenario?.tags[0] ?? "He Takes Charge",
                  setting: "",
                  atmosphere: "",
                  intensity: "Unrestrained",
                  mood: "Raw",
                  whoIsHe: "",
                  dynamic: selectedScenario?.tags[0] ?? "",
                  storyMode: selectedScenario?.storyMode ?? "unrestrained",
                  pairing: selectedPairing || "Her & Him",
                })
              }
              afterDark={true}
              handoff={castingHandoff ?? undefined}
              handoffStep={castingHandoff?.handoffStep}
              scenarioTags={selectedScenario?.tags}
            />
          </motion.div>
        )}

        {/* ── Paywall ──────────────────────────────────────────────────── */}
        {phase === "paywall" && (
          <motion.div
            key="paywall"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Cinematic dark-crimson background */}
            <div className="absolute inset-0">
              <img
                src={`${import.meta.env.BASE_URL}images/creation-room-hero.png?v=4`}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover object-top opacity-30"
                style={{ objectPosition: "center top" }}
              />
            </div>
            <div
              className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 50% 0%, #1a050580 0%, #0a020288 55%, #000 100%)" }}
            />
            <div className="absolute inset-0" style={{
              background: "linear-gradient(0deg, #000 0%, #000a 30%, transparent 70%)",
            }} />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-5 text-center">

              {/* Moon icon */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.4)" }}
              >
                <Moon className="w-7 h-7" style={{ color: "#c0392b" }} />
              </div>

              {/* Personalised headline */}
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-2xl font-bold text-foreground leading-tight">
                  {selectedScenario?.label ?? "After Dark"} — your story is ready.
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  One step. Then your story writes itself.
                </p>
                {/* Casting detail pill */}
                {lastCastingData && (lastCastingData.archetype as string || lastCastingData.dynamic as string) && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full self-center text-xs font-medium"
                    style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.3)", color: "#e8a09a" }}
                  >
                    {[lastCastingData.archetype as string, lastCastingData.dynamic as string].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>

              {/* Story preview card */}
              {(() => {
                const storyMode = selectedScenario?.storyMode ?? "unrestrained";
                const excerpt = AFTER_DARK_TEASERS[storyMode] ?? AFTER_DARK_TEASERS.unrestrained;
                const titleLine = AFTER_DARK_TITLES[storyMode] ?? selectedScenario?.label ?? "Your story";
                const accentHex = selectedScenario?.accent ?? "#c0392b";
                const voiceId = lastCastingData?.voiceId as string | undefined;
                const voice = voiceId ? VOICES.find(v => v.id === voiceId) : null;
                const voiceName = voice?.displayName ?? voice?.label ?? null;
                return (
                  <div className="w-full rounded-2xl overflow-hidden" style={{ border: `1px solid ${accentHex}25`, background: "#08010100" }}>
                    <div className="relative h-44 flex items-end p-4 overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${accentHex}22 0%, ${accentHex}08 60%, transparent 100%)` }}>
                      <img
                        src={paywallCoverUrl ?? `${import.meta.env.BASE_URL}images/creation-room-hero.png?v=4`}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
                        style={{ opacity: paywallCoverUrl ? 0.55 : (paywallImageLoading ? 0.18 : 0.35) }}
                        onError={(e) => { (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}images/creation-room-hero.png?v=4`; }}
                      />
                      {paywallImageLoading && !paywallCoverUrl && (
                        <div className="absolute top-3 right-3">
                          <div className="w-4 h-4 rounded-full border border-white/20 border-t-white/60 animate-spin" />
                        </div>
                      )}
                      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 70% 30%, ${accentHex}28 0%, transparent 65%)` }} />
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="relative z-10 text-left">
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: accentHex }}>
                          {selectedScenario?.room?.replace(/_/g, " ") ?? "After Dark"}
                        </p>
                        <h3 className="font-display text-base font-bold text-foreground leading-tight">{titleLine}</h3>
                      </div>
                    </div>
                    <div className="px-4 py-3 relative" style={{ borderTop: `1px solid ${accentHex}15`, background: "rgba(0,0,0,0.3)" }}>
                      <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-4">"{excerpt}"</p>
                      <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)" }} />
                    </div>
                    {(voiceName) && (
                      <div className="px-4 pb-3 flex flex-wrap gap-1.5 mt-1">
                        <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: `${accentHex}18`, color: accentHex, border: `1px solid ${accentHex}30` }}>
                          {voiceName}
                        </span>
                        <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)", color: "#e8a09a", border: "1px solid rgba(232,160,154,0.2)" }}>
                          Audio ready to write
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Value bullets */}
              <div className="w-full flex flex-col gap-2 text-left">
                {[
                  "Unrestrained stories — nothing held back",
                  "Full casting unlocked — every option",
                  "Complete privacy — nothing stored, nothing shared",
                ].map(benefit => (
                  <div key={benefit} className="flex items-center gap-2.5 text-sm" style={{ color: "#e8a09a" }}>
                    <Moon className="w-3.5 h-3.5 flex-shrink-0 opacity-70" style={{ color: "#c0392b" }} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="w-full flex flex-col gap-3">
                {/* Annual — primary */}
                <button
                  disabled={!!paywallLoadingPlan}
                  onClick={() => void startAfterDarkCheckout("annual")}
                  className="w-full flex flex-col items-center justify-center gap-0.5 px-6 py-4 rounded-2xl font-semibold text-white text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #c0392b, #7b241c)", boxShadow: "0 0 28px rgba(192,57,43,0.35)" }}
                >
                  <span className="flex items-center gap-2">
                    {paywallLoadingPlan === "annual" ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Write my story — £12.42/mo
                    <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-white/80 text-[9px] font-bold uppercase tracking-wider">Best value</span>
                  </span>
                  <span className="text-[11px] text-white/80 font-normal">billed annually · cancel renewal anytime</span>
                </button>

                {/* Monthly — secondary */}
                <button
                  disabled={!!paywallLoadingPlan}
                  onClick={() => void startAfterDarkCheckout("monthly")}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-medium transition-all disabled:opacity-60"
                  style={{ border: "1px solid rgba(192,57,43,0.4)", color: "#e8a09a" }}
                >
                  {paywallLoadingPlan === "monthly" ? (
                    <span className="w-4 h-4 rounded-full border-2 border-current/40 border-t-current animate-spin" />
                  ) : null}
                  Monthly — £19.99/month
                </button>
              </div>

              {/* Privacy signal + start over */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-[11px] text-muted-foreground/80">
                  Billed discreetly · Nothing stored · Heard only by you.
                </p>
                <button
                  type="button"
                  onClick={() => { setPhase("scenario"); setSelectedScenario(null); }}
                  className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline underline-offset-2"
                >
                  Start over
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Generating ────────────────────────────────────────────────── */}
        {phase === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="relative mb-10">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ border: "1px solid rgba(192,57,43,0.3)" }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                >
                  <Moon className="w-8 h-8" style={{ color: "#c0392b" }} />
                </motion.div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-full"
                style={{ border: "1px solid rgba(192,57,43,0.12)" }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={loadingPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                  {LOADING_PHASES[loadingPhase].label}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {LOADING_PHASES[loadingPhase].sub}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex gap-2 items-center">
              {LOADING_PHASES.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === loadingPhase ? 32 : i < loadingPhase ? 16 : 8,
                    opacity: i <= loadingPhase ? 1 : 0.2,
                  }}
                  className="h-1 rounded-full"
                  style={{ background: i <= loadingPhase ? "#c0392b" : "#333" }}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-8 max-w-xs">
              Your story is written with full presence and complete privacy.
              Nothing here leaves this room.
            </p>
          </motion.div>
        )}

        {/* ── Result ────────────────────────────────────────────────────── */}
        {phase === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto px-4 py-8 space-y-8"
          >
            <button
              onClick={() => { setPhase("scenario"); setSelectedScenario(null); setResult(null); setCastingHandoff(null); }}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Start another fantasy
            </button>

            <div className="glass-panel rounded-3xl overflow-hidden">
              <div className="relative aspect-video">
                {result.images?.cover && (
                  <img
                    src={result.images.cover}
                    alt={result.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 z-10">
                  <p
                    className="text-xs font-medium uppercase tracking-widest mb-2"
                    style={{ color: "#c0392b" }}
                  >
                    After Dark · Private
                  </p>
                  <h1 className="font-display text-4xl font-bold text-foreground mb-2">
                    {result.title}
                  </h1>
                  <p className="text-muted-foreground text-sm max-w-xl">{result.description}</p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Preset save */}
                {isAuthenticated && lastCastingData && (
                  <div>
                    {presetSaved ? (
                      <p className="text-xs flex items-center gap-1.5" style={{ color: "#c0392b" }}>
                        <Check className="w-3.5 h-3.5" />
                        Casting saved to your profile
                      </p>
                    ) : (
                      <button
                        onClick={handleSavePreset}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                      >
                        Save this casting combination
                      </button>
                    )}
                  </div>
                )}

                <div className="prose prose-invert max-w-none">
                  {result.scenes.map((scene, i) => (
                    <div key={scene.id ?? i} className="mb-8">
                      <p
                        className="text-xs font-medium uppercase tracking-widest mb-3"
                        style={{ color: "#c0392b" }}
                      >
                        {scene.heading ?? `Scene ${i + 1}`}
                      </p>
                      <p className="text-base leading-[1.9] text-foreground/90 font-light whitespace-pre-wrap">
                        {scene.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setPhase("pairing");
                setSelectedPairing(null);
                setSelectedScenario(null);
                setResult(null);
                setCastingHandoff(null);
                preGenCoverPromise.current = null;
                setPaywallCoverUrl(null);
                window.scrollTo({ top: 0 });
              }}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white border transition-all hover:border-[#c0392b]/50"
              style={{ background: "rgba(192,57,43,0.07)", border: "1px solid rgba(192,57,43,0.25)" }}
            >
              <Sparkles className="w-4 h-4" />
              Write Another Fantasy
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
