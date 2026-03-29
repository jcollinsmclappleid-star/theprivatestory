import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ArrowLeft, Moon, Check, BookOpen } from "lucide-react";
import { useGenerateFullStory } from "@workspace/api-client-react";
import type { FullGeneratedStory } from "@workspace/api-client-react";
import { useAudioPlayer } from "@/store/use-audio-player";
import { useAuth } from "@/hooks/useAuth";
import { CastingRoom } from "@/components/CastingRoom";
import type { CastingRoomResult } from "@/components/CastingRoom";

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
    id: "power_exchange",
    name: "Power Exchange",
    sub: "Control given. Or taken. Either way, everything changes.",
    accent: "#c0392b",
    image: "images/rooms/power_exchange.png",
  },
  {
    id: "the_forbidden",
    name: "The Forbidden",
    sub: "The reason it's wrong is the reason it's everything.",
    accent: "#8b5cf6",
    image: "images/rooms/the_forbidden.png",
  },
  {
    id: "slow_burn",
    name: "Slow Burn",
    sub: "Weeks of tension. One moment of finally. Everything held back until now.",
    accent: "#e07840",
    image: "images/rooms/slow_burn.png",
  },
  {
    id: "in_character",
    name: "In Character",
    sub: "A role, a premise, a fiction that becomes completely real.",
    accent: "#d97706",
    image: "images/rooms/in_character.png",
  },
  {
    id: "eyes_on_us",
    name: "Eyes On Us",
    sub: "Watched. Watching. Every motion deliberate and felt.",
    accent: "#14b8a6",
    image: "images/rooms/eyes_on_us.png",
  },
  {
    id: "sweet_and_savage",
    name: "Sweet & Savage",
    sub: "Tenderness that turns feral. Softness that breaks into something wilder.",
    accent: "#db2777",
    image: "images/rooms/sweet_and_savage.png",
  },
  {
    id: "more_than_two",
    name: "More Than Two",
    sub: "Desire doesn't always arrive in pairs.",
    accent: "#6366f1",
    image: "images/rooms/more_than_two.png",
  },
  {
    id: "the_edge",
    name: "The Edge",
    sub: "Psychological intensity. Obsession. The kind of wanting that unsettles.",
    accent: "#7c3aed",
    image: "images/rooms/the_edge.png",
  },
  {
    id: "dark_territory",
    name: "Dark Territory",
    sub: "Past the edge. Written without restraint or apology.",
    accent: "#c0392b",
    image: "images/rooms/dark_territory.png",
  },
];

/* ── Scenarios ──────────────────────────────────────────────────────── */
const SCENARIOS: Scenario[] = [
  /* Power Exchange ─── */
  {
    id: "he_decides",
    label: "He Decides Everything",
    sub: "She wanted to feel everything. She gave him that permission. He made it worth every second.",
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
  onClick,
}: {
  scenario: Scenario;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: selected ? 1 : 1.02 }}
      whileTap={{ scale: 0.97 }}
      animate={{ width: selected ? 300 : 255 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl border text-left flex-shrink-0 transition-colors ${
        selected
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
          {selected && (
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
              className="text-white/70 text-xs leading-relaxed"
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
              className="text-white/45 text-xs leading-snug line-clamp-3"
            >
              {scenario.sub}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="mt-auto">
          <DarknessBadge level={scenario.darkness} />
        </div>
      </div>
    </motion.button>
  );
}

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ── Main component ─────────────────────────────────────────────────── */
export default function AfterDark() {
  const { isAuthenticated, isLoading: authLoading, openSignIn } = useAuth();
  const [phase, setPhase] = useState<"scenario" | "casting" | "preset-prompt" | "generating" | "result">("scenario");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<FullGeneratedStory | null>(null);
  const [lastCastingData, setLastCastingData] = useState<Record<string, unknown> | null>(null);
  const [presetSaved, setPresetSaved] = useState(false);
  const [isGeneratingEp2, setIsGeneratingEp2] = useState(false);
  const [presetNameDraft, setPresetNameDraft] = useState("");
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
      onError: () => {
        stopLoadingPhase();
        setPhase("casting");
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

  const handleWriteEpisode2 = useCallback(async () => {
    if (!result || isGeneratingEp2) return;
    setIsGeneratingEp2(true);
    setPhase("generating");
    startLoadingPhase();
    try {
      const res = await fetch(`${API_BASE}/api/continue-story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ storyId: result.id, continuation_mode: "keep_same_mood" }),
      });
      if (!res.ok) throw new Error("Episode 2 failed");
      const data = await res.json() as FullGeneratedStory;
      stopLoadingPhase();
      setResult(data);
      setPhase("result");
      applyResultToPlayer(data);
    } catch {
      stopLoadingPhase();
      setPhase("result");
    } finally {
      setIsGeneratingEp2(false);
    }
  }, [result, isGeneratingEp2, startLoadingPhase, stopLoadingPhase, applyResultToPlayer]);

  const handleCastingComplete = useCallback(
    (casting: CastingRoomResult) => {
      if (!selectedScenario) return;

      const castingSnapshot = {
        archetype: casting.archetype,
        dynamic: casting.dynamic,
        intensity: casting.intensity,
        storyMode: selectedScenario.storyMode,
      };

      setLastCastingData(castingSnapshot);
      setPresetSaved(false);

      const allTags = [...selectedScenario.tags, ...(casting.customTags ?? [])];
      setPendingAfterDarkCast({ casting, allTags });

      const suggestedName = [casting.archetype, casting.dynamic].filter(Boolean).join(" · ") || "After Dark Cast";
      setPresetNameDraft(suggestedName);
      setPhase("preset-prompt");
    },
    [selectedScenario]
  );

  const handleAfterDarkStartGenerating = useCallback(
    async (savePreset: boolean, presetName: string) => {
      if (!pendingAfterDarkCast || !selectedScenario) return;
      const { casting, allTags } = pendingAfterDarkCast;

      if (savePreset && presetName.trim() && lastCastingData) {
        fetch(`${API_BASE}/api/me/presets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: presetName.trim(), castingData: lastCastingData }),
        }).then(() => setPresetSaved(true)).catch(() => {});
      }

      setPhase("generating");
      startLoadingPhase();

      // perspective: CastingRoom uses "your"/"her"/"his"/"their" but API uses "you"/"her"/"his"/"they"
      const apiPerspective = casting.perspective === "your" ? "you" : casting.perspective === "their" ? "they" : casting.perspective;

      try {
        await generateMutation.mutateAsync({
          data: {
            mood: "Late Night",
            intensity: casting.intensity,
            voiceFeel: "Deep Voice",
            storyLength: "10 min",
            // scenarioCard omitted — AfterDark scenarios are not in the 50-card set;
            // context is carried via experienceTags, dynamic, storyMode, and chemistry.
            perspective: apiPerspective,
            cinematicVisuals: true,
            emotionalFocus: false,
            whoIsHe: casting.archetype || undefined,
            dynamic: casting.dynamic || selectedScenario.tags[0] || undefined,
            storyMode: selectedScenario.storyMode,
            experienceTags: allTags,
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
            scenarioRoom: selectedScenario.room,
          },
        });
      } finally {
        stopLoadingPhase();
      }
    },
    [pendingAfterDarkCast, selectedScenario, lastCastingData, generateMutation, startLoadingPhase, stopLoadingPhase]
  );

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

        {/* ── Scenario Selection ────────────────────────────────────────── */}
        {phase === "scenario" && (
          <motion.div
            key="scenario"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="max-w-3xl mx-auto px-4 py-12"
          >
            {/* Header */}
            <div className="mb-12">
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
                        {roomScenarios.map((scenario) => (
                          <ScenarioCard
                            key={scenario.id}
                            scenario={scenario}
                            selected={selectedScenario?.id === scenario.id}
                            onClick={() =>
                              setSelectedScenario(
                                selectedScenario?.id === scenario.id ? null : scenario
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue CTA */}
            <div className="sticky bottom-6">
              <button
                onClick={() => {
                  if (selectedScenario) {
                    setPhase("casting");
                  }
                }}
                disabled={!selectedScenario}
                className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all text-white ${
                  selectedScenario ? "hover:-translate-y-0.5" : "opacity-35 cursor-not-allowed"
                }`}
                style={
                  selectedScenario
                    ? {
                        background: "linear-gradient(135deg, #c0392b, #7f1d1d)",
                        boxShadow: "0 0 32px rgba(192,57,43,0.28)",
                      }
                    : { background: "#1a1a1a" }
                }
              >
                <Sparkles className="w-5 h-5" />
                {selectedScenario ? `Continue with "${selectedScenario.label}"` : "Choose a fantasy above"}
              </button>
            </div>
          </motion.div>
        )}


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
                onClick={() => setPhase("seed")}
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
                  intensity: "Explicit",
                  mood: "Raw",
                  whoIsHe: "",
                  dynamic: selectedScenario?.tags[0] ?? "",
                  storyMode: selectedScenario?.storyMode ?? "unrestrained",
                })
              }
              afterDark={true}
            />
          </motion.div>
        )}

        {/* ── Preset Name Prompt ──────────────────────────────────────── */}
        {phase === "preset-prompt" && (
          <motion.div
            key="preset-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 max-w-md mx-auto"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.35)" }}
            >
              <Moon className="w-7 h-7" style={{ color: "#c0392b" }} />
            </div>
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Save this casting?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Give your combination a name so you can return to this energy in one tap.
              </p>
            </div>
            <div className="w-full space-y-3">
              <input
                type="text"
                value={presetNameDraft}
                onChange={(e) => setPresetNameDraft(e.target.value)}
                maxLength={80}
                placeholder="e.g. CEO · Takes Charge"
                className="w-full px-4 py-3 rounded-xl border bg-black/40 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "rgba(192,57,43,0.3)", "--tw-ring-color": "rgba(192,57,43,0.4)" } as React.CSSProperties}
              />
              <button
                onClick={() => handleAfterDarkStartGenerating(true, presetNameDraft)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-white text-sm transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #c0392b, #922b21)", boxShadow: "0 0 20px rgba(192,57,43,0.3)" }}
              >
                <Moon className="w-4 h-4" />
                Save &amp; Write My Story
              </button>
              <button
                onClick={() => handleAfterDarkStartGenerating(false, "")}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Skip — just write it
              </button>
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
              onClick={() => setPhase("scenario")}
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

            {/* Episode 2 CTA */}
            <button
              onClick={handleWriteEpisode2}
              disabled={isGeneratingEp2}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white border transition-all hover:border-[#c0392b]/60 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.4)" }}
            >
              {isGeneratingEp2 ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4" />
              )}
              Write Episode 2 →
            </button>

            <button
              onClick={() => {
                setPhase("scenario");
                setSelectedScenario(null);
                setResult(null);
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
