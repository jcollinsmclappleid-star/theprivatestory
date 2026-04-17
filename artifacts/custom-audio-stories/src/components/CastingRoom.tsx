import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Sparkles, ArrowLeft, Search, X, MapPin, Shuffle, ChevronLeft, Moon, Check } from "lucide-react";
import { NAMES } from "../data/names";
import { StoryTagStudio } from "./StoryTagStudio";
import { SITUATIONS, SITUATION_CATEGORIES, getSituationsByCategory, interpolateSituation } from "../data/situations";
import { VOICES, DEFAULT_FEMALE_VOICE_ID, getVoicesForPairing, getDefaultVoiceId } from "../lib/voices";
import { VoiceSamplePlayer } from "./VoiceSamplePlayer";
import { VoiceAvatar } from "./VoiceAvatar";

export interface CastingRoomResult {
  perspective: "her" | "his" | "your" | "their";
  pairing?: string;
  heritage: string;
  archetype: string;
  chemistry: string;
  country?: string;
  city?: string;
  setting: string;
  atmosphere: string;
  intensity: "Subtle" | "Warm" | "Elevated" | "Intense";
  mood: string;
  whoIsHe: string;
  dynamic: string;
  storyMode: string;
  customTags?: string[];
  // Structured appearance fields — individual chip selections (no free text)
  appearBuild?: string;
  appearHeight?: string;
  appearColouring?: string;
  appearEyes?: string;
  appearFeatures?: string[];
  // Name selections — dropdown only, validated server-side against allowlist
  listenerName?: string;
  partnerName?: string;
  // Situation — one of 200 predefined situations from SITUATIONS
  situation?: string;
  /** Machine-readable ID — used for API validation (e.g. "fc_01"). */
  situationId?: string;
  /** ElevenLabs voice ID chosen by the user in the casting flow. */
  voiceId?: string;
}

export interface CastingRoomHandoff {
  pairing?: string;
  chemistry?: string;
  perspective?: "her" | "his" | "your" | "their";
  archetype?: string;
  heritage?: string;
  dynamic?: string;
  whoIsHe?: string;
  mood?: string;
  setting?: string;
  atmosphere?: string;
  country?: string;
  city?: string;
  listenerName?: string;
  partnerName?: string;
  appearBuild?: string;
  appearHeight?: string;
  appearColouring?: string;
  appearEyes?: string;
  appearFeatures?: string[];
  situation?: string;
  situationId?: string;
  customTags?: string[];
  /** When set, the CastingRoom will open directly at this step number. */
  handoffStep?: number;
}

interface Props {
  onComplete: (result: CastingRoomResult) => void;
  onSkip: () => void;
  afterDark?: boolean;
  bedtime?: boolean;
  handoff?: CastingRoomHandoff;
  handoffStep?: number;
  onAfterDark?: () => void;
  scenarioTags?: string[];
}

/* ── Perspective helpers ──────────────────────────────────────────── */
function getValidPerspectiveIds(pairingId: string | undefined): Array<"her" | "his" | "your" | "their"> {
  const pairing = PAIRINGS.find(p => p.id === pairingId);
  if (!pairing) return ["her", "his", "your", "their"];

  // "Your Story" is always available — listener's immersion perspective
  const result: Array<"her" | "his" | "your" | "their"> = ["your"];
  // Show a perspective tile for every pronoun set present in the pairing
  const pronounSets = new Set([pairing.protagonistPronouns, pairing.partnerPronouns]);
  if (pronounSets.has("she/her"))   result.push("her");
  if (pronounSets.has("he/him"))    result.push("his");
  if (pronounSets.has("they/them")) result.push("their");
  return result;
}

/* ── Abstract art tiles ───────────────────────────────────────────── */
function gradientCSS(tailwindGrad: string): string {
  const colors = tailwindGrad.match(/#[a-fA-F0-9]{6}/g) ?? [];
  if (!colors.length) return "transparent";
  if (colors.length === 1) return colors[0];
  if (colors.length === 2) return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
  return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
}

function ArtTile({ gradient, accent, children, selected, onClick, image }: {
  gradient: string; accent: string; children: React.ReactNode;
  selected?: boolean; onClick?: () => void; image?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="relative overflow-hidden rounded-2xl border transition-all w-full text-left"
      style={selected
        ? { borderColor: `${accent}80`, boxShadow: `0 0 16px ${accent}25, inset 0 0 20px ${accent}08` }
        : { borderColor: "rgba(255,255,255,0.08)" }
      }
    >
      {image && (
        <img
          src={`${import.meta.env.BASE_URL}${image}`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={600}
          height={600}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
        style={image ? { opacity: 0.65 } : undefined}
      />
      <motion.div
        animate={{ opacity: selected ? [0.5, 0.85, 0.5] : [0.15, 0.3, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 60% 30%, ${accent}40 0%, transparent 65%)` }}
      />
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center z-20"
          style={{ background: accent }}>
          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-black/80"><path d="M2 6l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      )}
      <div className="relative z-10 p-4">
        {children}
      </div>
    </motion.button>
  );
}

/* ── Step data ────────────────────────────────────────────────────── */
const PERSPECTIVES = [
  { id: "her" as const,   label: "Her Story",   sub: "She feels it. She decides.",    gradient: "from-[#1a0810] via-[#2a1020] to-[#120508]", accent: "#e879a0" },
  { id: "your" as const,  label: "Your Story",  sub: "You're the one in this world.", gradient: "from-[#100d00] via-[#1e1900] to-[#0c0a00]", accent: "#c9a227" },
  { id: "his" as const,   label: "His Story",   sub: "Follow him. Feel everything.",  gradient: "from-[#050a1a] via-[#0a1428] to-[#030810]", accent: "#6b8cce" },
  { id: "their" as const, label: "Their Story", sub: "Follow them. Feel everything.", gradient: "from-[#0a0a0a] via-[#141414] to-[#060606]",  accent: "#9ca3af" },
];

interface PairingOption {
  id: string;
  label: string;
  sub: string;
  gradient: string;
  accent: string;
  protagonistPronouns: string;
  partnerPronouns: string;
}

const PAIRINGS: PairingOption[] = [
  { id: "Her & Him",   label: "Her & Him",   sub: "Woman + man",              gradient: "from-[#1a0810] via-[#0a0818] to-[#060310]", accent: "#e879a0",  protagonistPronouns: "she/her",   partnerPronouns: "he/him"   },
  { id: "Her & Her",   label: "Her & Her",   sub: "Woman + woman",            gradient: "from-[#180010] via-[#280020] to-[#100008]", accent: "#f472b6",  protagonistPronouns: "she/her",   partnerPronouns: "she/her"  },
  { id: "Him & Him",   label: "Him & Him",   sub: "Man + man",                gradient: "from-[#050a1a] via-[#0a1428] to-[#030810]", accent: "#6b8cce",  protagonistPronouns: "he/him",    partnerPronouns: "he/him"   },
  { id: "Her & Them",  label: "Her & Them",  sub: "Woman + non-binary",       gradient: "from-[#0a0800] via-[#181200] to-[#060500]", accent: "#c9a227",  protagonistPronouns: "she/her",   partnerPronouns: "they/them"},
  { id: "Him & Them",  label: "Him & Them",  sub: "Man + non-binary",         gradient: "from-[#001000] via-[#001a00] to-[#000a00]", accent: "#34d399",  protagonistPronouns: "he/him",    partnerPronouns: "they/them"},
  { id: "Them & Them", label: "Them & Them", sub: "Non-binary + non-binary",  gradient: "from-[#0a0a0a] via-[#141414] to-[#060606]", accent: "#9ca3af",  protagonistPronouns: "they/them", partnerPronouns: "they/them"},
];

/* ── Pronoun helpers ─────────────────────────────────────────────── */
interface PronounSet { subject: string; object: string; possessive: string; reflexive: string; }

function getPronounSet(pronounString: string): PronounSet {
  switch (pronounString) {
    case "she/her": return { subject: "She", object: "her", possessive: "her", reflexive: "herself" };
    case "he/him":  return { subject: "He",  object: "him", possessive: "his", reflexive: "himself" };
    default:        return { subject: "They", object: "them", possessive: "their", reflexive: "themselves" };
  }
}

function derivePronouns(pairingId: string | undefined): { partner: PronounSet; protagonist: PronounSet } {
  const cfg = PAIRINGS.find(p => p.id === pairingId);
  return {
    partner:     getPronounSet(cfg?.partnerPronouns     ?? "he/him"),
    protagonist: getPronounSet(cfg?.protagonistPronouns ?? "she/her"),
  };
}

function getGenderedNoun(pronounString: string): string {
  switch (pronounString) {
    case "she/her": return "woman";
    case "he/him":  return "man";
    default:        return "person";
  }
}

function conjugateTakes(subject: string) { return subject === "They" ? "They Take" : `${subject} Takes`; }
function conjugateLeads(subject: string) { return subject === "They" ? "They Lead" : `${subject} Leads`; }
function conjugateBreaks(subject: string) { return subject === "They" ? "they break" : `${subject.toLowerCase()} breaks`; }

/* ── Chemistries — built dynamically with pronoun awareness ──────── */
interface ChemistryOption {
  id: string; label: string; sub: string; dynamic: string;
  gradient: string; accent: string; image?: string;
}

function buildChemistries(pairingId: string | undefined): ChemistryOption[] {
  const { partner: P, protagonist: ME } = derivePronouns(pairingId);
  return [
    {
      id: `${P.subject} Takes Charge`,
      label: `${P.subject} Dominates`,
      sub: `${P.subject} takes control. Certain of what ${P.possessive} want. Patient enough to take their time.`,
      dynamic: "They pursue, I decide",
      gradient: "from-[#100800] via-[#201000] to-[#080500]", accent: "#c9a227",
      image: "images/chemistry/takes_charge.webp",
    },
    {
      id: "Equal Tension",
      label: "Equal Tension",
      sub: "Neither one yields. That's the whole story.",
      dynamic: "Equal desire, equal intensity",
      gradient: "from-[#080010] via-[#100020] to-[#040008]", accent: "#818cf8",
      image: "images/chemistry/equal_tension.webp",
    },
    {
      id: `${ME.subject} Leads`,
      label: `${ME.subject} Dominates`,
      sub: `${ME.subject} takes the lead. Sets the terms. ${P.subject} follows ${ME.possessive} pace entirely.`,
      dynamic: "I take what I want",
      gradient: "from-[#180010] via-[#280020] to-[#100008]", accent: "#f472b6",
      image: "images/chemistry/leads.webp",
    },
    {
      id: "Push & Pull",
      label: "Push & Pull",
      sub: `Back and forth. Who ${conjugateBreaks(P.subject)} first?`,
      dynamic: "Equal desire, equal intensity",
      gradient: "from-[#100000] via-[#200000] to-[#080000]", accent: "#fb923c",
      image: "images/chemistry/push_pull.webp",
    },
    {
      id: "Slow Surrender",
      label: "Slow Surrender",
      sub: "The tension holds until it can't. Both of them know exactly how this ends.",
      dynamic: "They pursue, I decide",
      gradient: "from-[#000a10] via-[#001420] to-[#000508]", accent: "#38bdf8",
      image: "images/chemistry/slow_surrender.webp",
    },
    {
      id: "Charged Dynamic",
      label: "Dominance & Submission",
      sub: `${P.subject} holds the power. ${ME.subject} chose to give it. That's what makes everything that follows possible.`,
      dynamic: "Leading and following",
      gradient: "from-[#0a0000] via-[#140000] to-[#050000]", accent: "#dc2626",
      image: "images/chemistry/power_play.webp",
    },
    {
      id: "Forbidden Pull",
      label: "Forbidden Pull",
      sub: "They shouldn't. They've been trying not to. They can't stop.",
      dynamic: "Forbidden desire",
      gradient: "from-[#08000a] via-[#120014] to-[#040008]", accent: "#9333ea",
      image: "images/chemistry/forbidden_pull.webp",
    },
    {
      id: "Pure Devotion",
      label: "Pure Devotion",
      sub: `${P.subject} makes ${ME.object} feel like the only thing in the room. The world.`,
      dynamic: "Adoration and devotion",
      gradient: "from-[#001010] via-[#001e1e] to-[#000a0a]", accent: "#2dd4bf",
      image: "images/chemistry/worship.webp",
    },
    {
      id: "Rivals",
      label: "Rivals",
      sub: "They've always been at each other's throats. This is what that was.",
      dynamic: "Equal desire, equal intensity",
      gradient: "from-[#0a0800] via-[#121000] to-[#050600]", accent: "#84cc16",
      image: "images/chemistry/rivals.webp",
    },
    {
      id: "Lovers",
      label: "Lovers",
      sub: "Two people who chose each other. The familiarity only makes it better.",
      dynamic: "Equal desire, equal intensity",
      gradient: "from-[#0a0010] via-[#120018] to-[#060009]", accent: "#e879a0",
      image: "images/chemistry/lovers.webp",
    },
    {
      id: "Playful",
      label: "Playful",
      sub: "It starts with a joke. Ends somewhere neither of them expected.",
      dynamic: "Equal desire, equal intensity",
      gradient: "from-[#001808] via-[#002810] to-[#000e04]", accent: "#34d399",
      image: "images/chemistry/playful.webp",
    },
    {
      id: "Romantic",
      label: "Romantic",
      sub: "Deliberate. Everything intentional. This kind of attention is rare.",
      dynamic: "Adoration and surrender",
      gradient: "from-[#0a0600] via-[#180e00] to-[#060300]", accent: "#f59e0b",
      image: "images/chemistry/romantic.webp",
    },
    {
      id: "The Best Friend",
      label: "The Best Friend",
      sub: "Known each other too long to pretend. Not long enough to stop feeling this.",
      dynamic: "Equal desire, equal intensity",
      gradient: "from-[#000a14] via-[#001020] to-[#00050c]", accent: "#7dd3fc",
      image: "images/chemistry/the_best_friend.webp",
    },
    {
      id: "Sweet & Tender",
      label: "Sweet & Tender",
      sub: "No games, no strategy. Two people being honest with each other.",
      dynamic: "Adoration and surrender",
      gradient: "from-[#0c0008] via-[#180010] to-[#080005]", accent: "#f0abfc",
      image: "images/chemistry/sweet_tender.webp",
    },
    {
      id: "Nervous Energy",
      label: "Nervous Energy",
      sub: "First time together. Neither is sure what comes next. That's the whole thing.",
      dynamic: "They pursue, I decide",
      gradient: "from-[#080800] via-[#141400] to-[#050500]", accent: "#fde68a",
      image: "images/chemistry/nervous_energy.webp",
    },
  ];
}

const HERITAGES = [
  { id: "Latina",         label: "Latina",         sub: "Warm, magnetic, fire beneath calm",         gradient: "from-[#1a0800] via-[#2e1200] to-[#120600]", accent: "#e07840", image: "images/heritage/latina.webp" },
  { id: "Black",          label: "Black",           sub: "Radiant, commanding presence",              gradient: "from-[#0a0510] via-[#160a20] to-[#080310]", accent: "#c084fc", image: "images/heritage/black.webp" },
  { id: "South Asian",    label: "South Asian",     sub: "Layered beauty, quiet intensity",           gradient: "from-[#0e0a00] via-[#1e1400] to-[#0a0800]", accent: "#fbbf24", image: "images/heritage/south_asian.webp" },
  { id: "European",       label: "European",        sub: "Refined edges, complicated wanting",        gradient: "from-[#040814] via-[#081220] to-[#02060e]", accent: "#94a3b8", image: "images/heritage/european.webp" },
  { id: "East Asian",     label: "East Asian",      sub: "Elegant, precise, quietly devastating",     gradient: "from-[#001414] via-[#001e1e] to-[#000f0f]", accent: "#2dd4bf", image: "images/heritage/east_asian.webp" },
  { id: "Middle Eastern", label: "Middle Eastern",  sub: "Striking depth, magnetic gravity",          gradient: "from-[#0a0600] via-[#160e00] to-[#060400]", accent: "#f59e0b", image: "images/heritage/middle_eastern.webp" },
  { id: "Indigenous",     label: "Indigenous",      sub: "Rooted, fierce, unapologetically present",  gradient: "from-[#060e02] via-[#0e1a04] to-[#030800]", accent: "#86efac", image: "images/heritage/indigenous.webp" },
  { id: "Ambiguous",      label: "Ambiguous",       sub: "Leave it open. Let imagination fill it.",   gradient: "from-[#0a0a0a] via-[#141414] to-[#060606]", accent: "#9ca3af", image: "images/heritage/ambiguous.webp" },
];

/* ── Archetypes — pronoun-aware, 21 options ───────────────────────── */
function buildArchetypes(pairingId: string | undefined) {
  const { partner: P, protagonist: ME } = derivePronouns(pairingId);
  const s = P.subject; const o = P.object; const p = P.possessive;
  const me = ME.subject;
  return [
    { id: "The Executive",   label: "The Executive",   sub: `Measured control. Understated power. ${s} never raises ${p} voice.`,                           gradient: "from-[#0a0800] via-[#181200] to-[#060500]", accent: "#c9a227", image: "images/energy/executive.webp" },
    { id: "The Stranger",    label: "The Stranger",    sub: `No backstory. No promises. Only this moment.`,                                                  gradient: "from-[#040408] via-[#080810] to-[#020206]", accent: "#6b7280", image: "images/energy/stranger.webp" },
    { id: "The Artist",      label: "The Artist",      sub: `${s} sees everything. Says very little. That's what makes ${o} dangerous.`,                     gradient: "from-[#0a0010] via-[#140020] to-[#080008]", accent: "#a78bfa", image: "images/energy/artist.webp" },
    { id: "The Protector",   label: "The Protector",   sub: `Steady, watchful. There's one thing that undoes ${o} completely.`,                               gradient: "from-[#001000] via-[#001a00] to-[#000a00]", accent: "#34d399", image: "images/energy/protector.webp" },
    { id: "The Risk",        label: "The Risk",        sub: `Everything says this is complicated. Impossible to walk away from.`,                                           gradient: "from-[#150000] via-[#250000] to-[#0f0000]", accent: "#ef4444", image: "images/energy/bad_one.webp" },
    { id: "The Professor",   label: "The Professor",   sub: `Brilliant, reserved. ${s} comes apart slowly, then all at once.`,                                gradient: "from-[#000810] via-[#001020] to-[#000408]", accent: "#60a5fa", image: "images/energy/professor.webp" },
    { id: "The Wanderer",    label: "The Wanderer",    sub: `${s} doesn't stay. That's exactly what makes this hurt.`,                                        gradient: "from-[#080004] via-[#10000a] to-[#040002]", accent: "#fb7185", image: "images/energy/wanderer.webp" },
    { id: "The Old Friend",  label: "The Old Friend",  sub: `Years of knowing each other. Tonight something finally breaks.`,                                 gradient: "from-[#000810] via-[#000c18] to-[#000408]", accent: "#fcd34d", image: "images/energy/old_friend.webp" },
    { id: "The Detective",   label: "The Detective",   sub: `${s} notices everything. Nothing slips past ${o}. That attention has a cost.`,                   gradient: "from-[#040808] via-[#081010] to-[#020404]", accent: "#67e8f9", image: "images/energy/detective.webp" },
    { id: "The Doctor",      label: "The Doctor",      sub: `Clinical precision. Unshakeable calm. Until ${s} isn't.`,                                        gradient: "from-[#00080a] via-[#000c10] to-[#000406]", accent: "#a3e635", image: "images/energy/doctor.webp" },
    { id: "The Musician",    label: "The Musician",    sub: `${s} plays like ${s.toLowerCase()} already knows how this ends. ${s} might.`,                    gradient: "from-[#0a0002] via-[#140004] to-[#050001]", accent: "#f9a8d4", image: "images/energy/musician.webp" },
    { id: "The Athlete",     label: "The Athlete",     sub: `Physical command. Total focus. That discipline doesn't stop here.`,                              gradient: "from-[#001400] via-[#002000] to-[#000c00]", accent: "#4ade80", image: "images/energy/athlete.webp" },
    { id: "The Chef",        label: "The Chef",        sub: `${s} works with ${p} hands. Takes pride in making something perfect.`,                           gradient: "from-[#080400] via-[#0e0800] to-[#040200]", accent: "#fb923c", image: "images/energy/chef.webp" },
    { id: "The Soldier",     label: "The Soldier",     sub: `Discipline runs through ${o}. So does something much harder to control.`,                        gradient: "from-[#040600] via-[#080c00] to-[#020300]", accent: "#bef264", image: "images/energy/soldier.webp" },
    { id: "The Charmer",     label: "The Charmer",     sub: `Effortless with people. ${s} could have anyone. Somehow ${p} focus on ${o} is the whole point.`, gradient: "from-[#0a0008] via-[#160010] to-[#060005]", accent: "#f472b6", image: "images/energy/charmer.webp" },
    { id: "The Good One",    label: "The Good One",    sub: `No games, no pretence. This is genuinely who ${s} is. You keep waiting for the catch.`,          gradient: "from-[#001208] via-[#001e10] to-[#000a04]", accent: "#6ee7b7", image: "images/energy/good_one.webp" },
    { id: "The Funny One",   label: "The Funny One",   sub: `Makes ${o} laugh first. Then does something that makes laughing impossible.`,                    gradient: "from-[#0a0800] via-[#160e00] to-[#050500]", accent: "#fbbf24", image: "images/energy/funny_one.webp" },
    { id: "The Refined One", label: "The Refined One", sub: `Old-fashioned in the best ways. ${s} notices the small things and means everything behind them.`, gradient: "from-[#060008] via-[#0e0012] to-[#030005]", accent: "#c4b5fd", image: "images/energy/refined_one.webp" },
    { id: "The Introvert",   label: "The Introvert",   sub: `Quiet until ${s} isn't. You didn't expect the person underneath.`,                              gradient: "from-[#000810] via-[#001018] to-[#000408]", accent: "#93c5fd", image: "images/energy/introvert.webp" },
    { id: "The Softie",      label: "The Softie",      sub: `Looks one way. Is entirely another. You figure it out before ${s} admits it.`,                  gradient: "from-[#0a0002] via-[#140004] to-[#060001]", accent: "#fda4af", image: "images/energy/softie.webp" },
    { id: "The Adventurer",  label: "The Adventurer",  sub: `Always somewhere new. This time ${s} wants ${o} to see it too.`,                                gradient: "from-[#001006] via-[#001a0a] to-[#000803]", accent: "#86efac", image: "images/energy/adventurer.webp" },
  ];
}

/* ── Settings — tile data ─────────────────────────────────────────── */
const CONTEMPORARY_SETTINGS = [
  { id: "Late Night City",          label: "Late Night City",          sub: "Streets wet, lights low, anything goes",           gradient: "from-[#02050e] via-[#040a18] to-[#010308]", accent: "#6b8cce", image: "images/settings/late_night_city.webp" },
  { id: "Luxury Hotel",             label: "Luxury Hotel",             sub: "A room for one night only",                        gradient: "from-[#100d00] via-[#1e1900] to-[#0a0800]", accent: "#c9a227", image: "images/settings/luxury_hotel.webp" },
  { id: "European Villa",           label: "European Villa",           sub: "Heat, terraces, and no schedule",                  gradient: "from-[#0a0500] via-[#180c00] to-[#060300]", accent: "#d97706", image: "images/settings/european_villa.webp" },
  { id: "Private Yacht",            label: "Private Yacht",            sub: "Open water. No escape. No reason to leave",        gradient: "from-[#001220] via-[#001e35] to-[#000a14]", accent: "#0ea5e9", image: "images/settings/private_yacht.webp" },
  { id: "Mountain Retreat",         label: "Mountain Retreat",         sub: "Snowbound. Firelit. Nowhere else to be",           gradient: "from-[#060e06] via-[#0c160c] to-[#040804]", accent: "#4ade80", image: "images/settings/mountain_retreat.webp" },
  { id: "Penthouse Suite",          label: "Penthouse Suite",          sub: "City below. Nothing between you and glass",        gradient: "from-[#060408] via-[#0e0812] to-[#030204]", accent: "#c084fc", image: "images/settings/penthouse_suite.webp" },
  { id: "Art Gallery After Hours",  label: "Art Gallery After Hours",  sub: "Empty rooms. Something priceless at stake",        gradient: "from-[#04080a] via-[#080e12] to-[#020406]", accent: "#94a3b8", image: "images/settings/art_gallery.webp" },
  { id: "Office After Hours",       label: "Office After Hours",       sub: "Everyone else has gone. The door is locked.",      gradient: "from-[#060406] via-[#0c080c] to-[#030203]", accent: "#818cf8", image: "images/settings/office_after_hours.webp" },
  { id: "Rooftop Bar",              label: "Rooftop Bar",              sub: "City spread out below. Drinks. A decision.",       gradient: "from-[#050208] via-[#0a040e] to-[#030104]", accent: "#e879a0", image: "images/settings/rooftop_bar.webp" },
  { id: "Beach House",              label: "Beach House",              sub: "Salt air. No phone signal. Nowhere to hide.",      gradient: "from-[#001018] via-[#001c28] to-[#000810]", accent: "#38bdf8", image: "images/settings/beach_house.webp" },
  { id: "Private Members Club",     label: "Private Members Club",     sub: "Velvet booths. Whispered conversations. Power.",   gradient: "from-[#0a0800] via-[#160e00] to-[#060500]", accent: "#fcd34d", image: "images/settings/private_members_club.webp" },
  { id: "Orient Express Style",     label: "Orient Express Style",     sub: "Moving through the night. No way off until dawn.", gradient: "from-[#080506] via-[#100a0c] to-[#040304]", accent: "#fb923c", image: "images/settings/orient_express.webp" },
  { id: "Concert Backstage",        label: "Concert Backstage",        sub: "The adrenaline hasn't faded. Neither have they.",  gradient: "from-[#050008] via-[#090010] to-[#030005]", accent: "#d946ef", image: "images/settings/concert_backstage.webp" },
  { id: "Ski Chalet",               label: "Ski Chalet",               sub: "Snowstorm outside. Nowhere to go until morning.",  gradient: "from-[#030812] via-[#060e1c] to-[#020509]", accent: "#7dd3fc", image: "images/settings/ski_chalet.webp" },
  { id: "Private Estate",           label: "Private Estate",           sub: "Countryside house. Acres. Locked gates.",         gradient: "from-[#040a04] via-[#081208] to-[#020502]", accent: "#86efac" },
  { id: "Casino High-Stakes Room",  label: "Casino — High Stakes",     sub: "Chips down. Everyone's watching. Except them.",    gradient: "from-[#0a0800] via-[#181200] to-[#050400]", accent: "#fbbf24" },
];

const HISTORICAL_SETTINGS = [
  { id: "Regency England (1810s)",    label: "Regency England",       sub: "1810s — letters never sent, country house urgency",  gradient: "from-[#0a0600] via-[#160e00] to-[#060400]", accent: "#fcd34d", image: "images/settings/regency_england.webp" },
  { id: "Victorian London (1880s)",   label: "Victorian London",      sub: "1880s — fog, corsets, what's unspeakable and felt",  gradient: "from-[#040408] via-[#0a0a10] to-[#020206]", accent: "#9ca3af", image: "images/settings/victorian_london.webp" },
  { id: "Belle Époque Paris (1900s)", label: "Belle Époque Paris",    sub: "1900s — absinthe, salons, decadent evenings",        gradient: "from-[#080400] via-[#140800] to-[#040200]", accent: "#f59e0b", image: "images/settings/belle_epoque.webp" },
  { id: "Roaring Twenties (1920s)",   label: "Roaring Twenties",      sub: "1920s — speakeasies, jazz, smoke and consequence",   gradient: "from-[#080004] via-[#12000a] to-[#040002]", accent: "#f472b6", image: "images/settings/roaring_twenties.webp" },
  { id: "Wartime (1940s)",            label: "Wartime",               sub: "1940s — last night together, everything at stake",   gradient: "from-[#050802] via-[#0a1004] to-[#020400]", accent: "#86efac", image: "images/settings/wartime.webp" },
  { id: "Swinging Sixties (1960s)",   label: "Swinging Sixties",      sub: "1960s — revolution, hotel rooms, free desire",       gradient: "from-[#000a10] via-[#001020] to-[#000408]", accent: "#38bdf8" },
  { id: "Disco & Velvet (1970s)",     label: "Disco & Velvet",        sub: "1970s — heat, mirror balls, all night long",         gradient: "from-[#100010] via-[#200020] to-[#080008]", accent: "#e879a0", image: "images/settings/disco_velvet.webp" },
  { id: "Neon Decade (1980s)",        label: "Neon Decade",           sub: "1980s — excess, power, after hours at the top",      gradient: "from-[#060010] via-[#0c0020] to-[#030008]", accent: "#818cf8" },
  { id: "Ancient Mediterranean",     label: "Ancient Mediterranean",  sub: "Marble, olives, conquest, and the gods watching",   gradient: "from-[#0a0800] via-[#181400] to-[#050600]", accent: "#fbbf24", image: "images/settings/ancient_mediterranean.webp" },
  { id: "Renaissance Italy",         label: "Renaissance Italy",      sub: "Florence, 1490s — art, ambition, private chambers",  gradient: "from-[#0c0600] via-[#1a0e00] to-[#060300]", accent: "#f59e0b", image: "images/settings/renaissance_italy.webp" },
  { id: "Feudal Japan",              label: "Feudal Japan",           sub: "Silk screens, silence, honour at risk",              gradient: "from-[#080010] via-[#10001a] to-[#040008]", accent: "#c084fc", image: "images/settings/feudal_japan.webp" },
  { id: "Georgian Scotland",         label: "Georgian Scotland",      sub: "Highland estate, candlelight, a storm coming",       gradient: "from-[#020a04] via-[#041208] to-[#010502]", accent: "#6ee7b7", image: "images/settings/georgian_scotland.webp" },
];

const AFTER_DARK_SETTINGS = [
  { id: "Private Club",          label: "Private Club",             sub: "Invitation only. No cameras.",                       gradient: "from-[#0e0002] via-[#1a0004] to-[#080002]", accent: "#fb7185", image: "images/settings/private_club.webp" },
  { id: "VIP Suite",             label: "VIP Suite",                sub: "No names. No history. No morning.",                  gradient: "from-[#0a0002] via-[#180004] to-[#060001]", accent: "#f43f5e", image: "images/settings/vip_suite.webp" },
  { id: "The Back Room",         label: "The Back Room",            sub: "Velvet curtains. Low light. No questions.",           gradient: "from-[#0c0004] via-[#180008] to-[#060002]", accent: "#e11d48" },
  { id: "Moving Elevator",       label: "Moving Elevator",          sub: "Thirty floors of anticipation.",                     gradient: "from-[#08000a] via-[#130010] to-[#040005]", accent: "#c026d3" },
  { id: "Private Cinema",        label: "Private Cinema",           sub: "The film is not what they're watching.",             gradient: "from-[#080004] via-[#120008] to-[#040002]", accent: "#dc2626" },
  { id: "Hotel Balcony",         label: "Hotel Balcony",            sub: "Floor above the party. No one can see them.",        gradient: "from-[#06000a] via-[#0e0012] to-[#030005]", accent: "#9333ea" },
  { id: "Dressing Room",         label: "Dressing Room",            sub: "After the show ends. The adrenaline hasn't.",        gradient: "from-[#0a0002] via-[#160004] to-[#050001]", accent: "#e11d48" },
  { id: "Locked Room",           label: "Locked Room",              sub: "House full of people. Only they know.",              gradient: "from-[#0c0003] via-[#1a0005] to-[#060002]", accent: "#f43f5e" },
  { id: "Rooftop 3am",           label: "Rooftop, 3am",             sub: "City below. No witnesses.",                          gradient: "from-[#02020a] via-[#04041a] to-[#010108]", accent: "#6366f1", image: "images/settings/rooftop_3am.webp" },
  { id: "First-Class Cabin",     label: "First-Class Cabin",        sub: "Overnight. No names. Nowhere to go.",                gradient: "from-[#02050a] via-[#040a16] to-[#010306]", accent: "#3b82f6" },
  { id: "The Glass House",       label: "The Glass House",          sub: "Floor-to-ceiling windows. No curtains.",             gradient: "from-[#04080a] via-[#080e14] to-[#020406]", accent: "#0ea5e9" },
  { id: "Yacht Cabin",           label: "Yacht Cabin",              sub: "Open water. No escape. No reason to want one.",      gradient: "from-[#001018] via-[#001a26] to-[#000810]", accent: "#38bdf8" },
  { id: "Penthouse Pool",        label: "Penthouse Pool",           sub: "Midnight. No neighbours. No one coming.",            gradient: "from-[#020010] via-[#04001e] to-[#010008]", accent: "#a855f7" },
  { id: "Private Spa Suite",     label: "Private Spa Suite",        sub: "Late booking. No other guests.",                     gradient: "from-[#080008] via-[#100012] to-[#040006]", accent: "#c084fc" },
];

/* ── Setting geography rules ─────────────────────────────────────── */

const HISTORICAL_SETTING_IDS = new Set([
  "Regency England (1810s)", "Victorian London (1880s)", "Belle Époque Paris (1900s)",
  "Roaring Twenties (1920s)", "Wartime (1940s)", "Swinging Sixties (1960s)",
  "Disco & Velvet (1970s)", "Neon Decade (1980s)", "Ancient Mediterranean",
  "Renaissance Italy", "Feudal Japan", "Georgian Scotland",
]);
const ORIENT_EXPRESS_ID = "Orient Express Style";
const MOUNTAIN_SETTING_IDS = new Set(["Ski Chalet", "Mountain Retreat"]);
const EUROPEAN_VILLA_ID = "European Villa";

const EUROPEAN_COUNTRIES = new Set([
  "France", "United Kingdom", "Italy", "Spain", "Monaco", "Greece", "Turkey",
  "Portugal", "Switzerland", "Austria", "Germany", "Netherlands", "Denmark",
  "Sweden", "Norway", "Finland", "Belgium", "Poland", "Croatia", "Czechia",
  "Hungary", "Ireland", "Iceland",
]);
const ORIENT_EXPRESS_COUNTRIES = new Set([
  "France", "Belgium", "Germany", "Austria", "Hungary", "Romania", "Turkey",
  "Switzerland", "Greece", "Serbia",
]);
const MOUNTAIN_COUNTRIES = new Set([
  "France", "Switzerland", "Austria", "Norway", "Sweden", "Iceland", "Germany",
  "Italy", "Spain", "Greece", "Turkey", "Portugal", "Peru", "Argentina",
  "USA", "New Zealand", "Japan", "South Korea", "India",
  "Morocco", "Ethiopia", "Jordan", "Oman", "South Africa", "Kenya", "Tanzania",
]);

/* ── Country / City data ──────────────────────────────────────────── */
const COUNTRY_FLAGS: Record<string, string> = {
  "France": "🇫🇷", "United Kingdom": "🇬🇧", "Italy": "🇮🇹", "Spain": "🇪🇸",
  "Monaco": "🇲🇨", "Greece": "🇬🇷", "Turkey": "🇹🇷", "Portugal": "🇵🇹",
  "Switzerland": "🇨🇭", "Austria": "🇦🇹", "Germany": "🇩🇪", "Netherlands": "🇳🇱",
  "Denmark": "🇩🇰", "Sweden": "🇸🇪", "Norway": "🇳🇴", "Finland": "🇫🇮",
  "Belgium": "🇧🇪", "Poland": "🇵🇱", "Croatia": "🇭🇷", "Czechia": "🇨🇿",
  "Hungary": "🇭🇺", "Ireland": "🇮🇪", "Iceland": "🇮🇸",
  "USA": "🇺🇸", "Mexico": "🇲🇽", "Cuba": "🇨🇺", "Argentina": "🇦🇷",
  "Brazil": "🇧🇷", "Colombia": "🇨🇴", "Peru": "🇵🇪",
  "Jamaica": "🇯🇲", "Barbados": "🇧🇧", "Trinidad & Tobago": "🇹🇹",
  "St. Lucia": "🇱🇨", "Bahamas": "🇧🇸", "Antigua & Barbuda": "🇦🇬",
  "Cayman Islands": "🇰🇾", "St. Barths": "🇧🇱", "Turks & Caicos": "🇹🇨",
  "Grenada": "🇬🇩", "Martinique": "🇲🇶", "Guadeloupe": "🇬🇵",
  "South Africa": "🇿🇦", "Morocco": "🇲🇦", "Egypt": "🇪🇬",
  "Kenya": "🇰🇪", "Tanzania": "🇹🇿", "Nigeria": "🇳🇬", "Ghana": "🇬🇭",
  "Senegal": "🇸🇳", "Ethiopia": "🇪🇹", "Rwanda": "🇷🇼", "Ivory Coast": "🇨🇮",
  "Mozambique": "🇲🇿", "Mauritius": "🇲🇺", "Seychelles": "🇸🇨", "Réunion": "🇷🇪",
  "UAE": "🇦🇪", "Saudi Arabia": "🇸🇦", "Jordan": "🇯🇴", "Lebanon": "🇱🇧",
  "Oman": "🇴🇲", "Qatar": "🇶🇦",
  "India": "🇮🇳", "Thailand": "🇹🇭", "Japan": "🇯🇵", "South Korea": "🇰🇷",
  "Vietnam": "🇻🇳", "Bali": "🇮🇩", "Sri Lanka": "🇱🇰", "Singapore": "🇸🇬",
  "Hong Kong": "🇭🇰",
  "Australia": "🇦🇺", "New Zealand": "🇳🇿", "Maldives": "🇲🇻",
  "French Polynesia": "🇵🇫", "Fiji": "🇫🇯",
};

const COUNTRY_CITIES: Record<string, string[]> = {
  // Europe
  "France":             ["Paris", "Nice", "Cannes", "Bordeaux", "Biarritz", "Antibes", "Saint-Tropez", "Lyon", "Marseille"],
  "United Kingdom":     ["London", "Edinburgh", "Bath", "Oxford", "Brighton", "Glasgow", "Manchester", "Bristol", "Liverpool"],
  "Italy":              ["Rome", "Milan", "Florence", "Venice", "Positano", "Amalfi Coast", "Capri", "Sardinia", "Turin", "Naples"],
  "Spain":              ["Barcelona", "Madrid", "Ibiza", "Seville", "Valencia", "Marbella", "San Sebastián", "Bilbao", "Granada"],
  "Monaco":             ["Monte Carlo"],
  "Greece":             ["Santorini", "Mykonos", "Athens", "Rhodes", "Corfu", "Thessaloniki", "Crete"],
  "Turkey":             ["Istanbul", "Bodrum", "Cappadocia", "Antalya", "Izmir"],
  "Portugal":           ["Lisbon", "Porto", "Algarve", "Cascais", "Funchal", "Sintra"],
  "Switzerland":        ["Geneva", "Zürich", "St. Moritz", "Lucerne", "Basel", "Interlaken"],
  "Austria":            ["Vienna", "Salzburg", "Innsbruck", "Graz", "Hallstatt"],
  "Germany":            ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Dresden"],
  "Netherlands":        ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
  "Denmark":            ["Copenhagen", "Aarhus", "Odense", "Aalborg"],
  "Sweden":             ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Visby"],
  "Norway":             ["Oslo", "Bergen", "Tromsø", "Trondheim", "Stavanger"],
  "Finland":            ["Helsinki", "Tampere", "Turku", "Rovaniemi"],
  "Belgium":            ["Brussels", "Bruges", "Ghent", "Antwerp", "Liège"],
  "Poland":             ["Warsaw", "Kraków", "Gdańsk", "Wrocław", "Poznań"],
  "Croatia":            ["Dubrovnik", "Split", "Hvar", "Rovinj", "Zagreb"],
  "Czechia":            ["Prague", "Brno", "Karlovy Vary", "Český Krumlov", "Olomouc"],
  "Hungary":            ["Budapest", "Eger", "Pécs", "Debrecen", "Győr"],
  "Ireland":            ["Dublin", "Galway", "Cork", "Killarney", "Doolin"],
  "Iceland":            ["Reykjavik", "Akureyri", "Keflavik"],
  // Americas
  "USA":                ["New York", "Los Angeles", "Miami", "Chicago", "New Orleans", "San Francisco", "Las Vegas", "Washington DC", "Boston", "Nashville"],
  "Mexico":             ["Mexico City", "Tulum", "Cancún", "Oaxaca", "San Miguel de Allende"],
  "Cuba":               ["Havana", "Trinidad", "Varadero", "Santiago de Cuba"],
  "Argentina":          ["Buenos Aires", "Mendoza", "Bariloche", "Córdoba", "Salta"],
  "Brazil":             ["Rio de Janeiro", "São Paulo", "Salvador", "Florianópolis", "Búzios"],
  "Colombia":           ["Cartagena", "Bogotá", "Medellín", "Santa Marta"],
  "Peru":               ["Lima", "Cusco", "Machu Picchu"],
  // Caribbean
  "Jamaica":            ["Kingston", "Montego Bay", "Negril", "Ocho Rios", "Port Antonio"],
  "Barbados":           ["Bridgetown", "St. James", "Bathsheba", "Speightstown"],
  "Trinidad & Tobago":  ["Port of Spain", "Tobago", "Scarborough", "San Fernando"],
  "St. Lucia":          ["Castries", "Rodney Bay", "Soufrière", "Marigot Bay"],
  "Bahamas":            ["Nassau", "Paradise Island", "Harbour Island", "Exuma"],
  "Antigua & Barbuda":  ["St. John's", "English Harbour", "Jolly Harbour", "Barbuda"],
  "Cayman Islands":     ["George Town", "Seven Mile Beach", "Rum Point"],
  "St. Barths":         ["Gustavia", "St. Jean", "Flamands"],
  "Turks & Caicos":     ["Providenciales", "Grace Bay", "Grand Turk"],
  "Grenada":            ["St. George's", "Grand Anse", "Carriacou"],
  "Martinique":         ["Fort-de-France", "Les Trois-Îlets", "Le Diamant"],
  "Guadeloupe":         ["Pointe-à-Pitre", "Basse-Terre", "Saint-François"],
  // Africa
  "South Africa":       ["Cape Town", "Johannesburg", "Durban", "Stellenbosch", "Franschhoek", "Knysna"],
  "Morocco":            ["Marrakech", "Casablanca", "Fez", "Essaouira", "Tangier", "Chefchaouen"],
  "Egypt":              ["Cairo", "Luxor", "Aswan", "Alexandria", "Sharm El-Sheikh", "Hurghada"],
  "Kenya":              ["Nairobi", "Mombasa", "Malindi", "Lamu", "Diani Beach"],
  "Tanzania":           ["Dar es Salaam", "Zanzibar", "Arusha", "Stone Town", "Serengeti"],
  "Nigeria":            ["Lagos", "Abuja", "Port Harcourt", "Ibadan"],
  "Ghana":              ["Accra", "Cape Coast", "Kumasi", "Takoradi"],
  "Senegal":            ["Dakar", "Saint-Louis", "Saly", "Mbour"],
  "Ethiopia":           ["Addis Ababa", "Lalibela", "Gondar", "Bahir Dar"],
  "Rwanda":             ["Kigali", "Musanze", "Gisenyi"],
  "Ivory Coast":        ["Abidjan", "Yamoussoukro", "Grand-Bassam"],
  "Mozambique":         ["Maputo", "Inhambane", "Vilanculos", "Pemba"],
  "Mauritius":          ["Port Louis", "Grand Baie", "Flic en Flac", "Mahébourg"],
  "Seychelles":         ["Mahé", "Praslin", "La Digue", "Victoria"],
  "Réunion":            ["Saint-Denis", "Saint-Gilles-les-Bains", "Cilaos"],
  // Middle East
  "UAE":                ["Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah", "Fujairah"],
  "Saudi Arabia":       ["Riyadh", "Jeddah", "AlUla", "NEOM", "Diriyah"],
  "Jordan":             ["Amman", "Petra", "Wadi Rum", "Aqaba"],
  "Lebanon":            ["Beirut", "Byblos", "Batroun"],
  "Oman":               ["Muscat", "Nizwa", "Salalah", "Wahiba Sands"],
  "Qatar":              ["Doha", "Al Wakrah", "Lusail"],
  // Asia
  "India":              ["Mumbai", "Goa", "Jaipur", "Delhi", "Udaipur", "Pondicherry", "Kolkata", "Kochi"],
  "Thailand":           ["Bangkok", "Koh Samui", "Chiang Mai", "Phuket", "Koh Lanta"],
  "Japan":              ["Tokyo", "Kyoto", "Osaka", "Hakone", "Nara", "Hiroshima"],
  "South Korea":        ["Seoul", "Busan", "Jeju Island", "Gyeongju"],
  "Vietnam":            ["Hanoi", "Ho Chi Minh City", "Hội An", "Đà Nẵng", "Phú Quốc"],
  "Bali":               ["Seminyak", "Ubud", "Canggu", "Nusa Dua", "Uluwatu"],
  "Sri Lanka":          ["Colombo", "Galle", "Sigiriya", "Kandy"],
  "Singapore":          ["Singapore City"],
  "Hong Kong":          ["Hong Kong Island", "Kowloon", "Lantau Island"],
  // Pacific & Oceania
  "Australia":          ["Sydney", "Melbourne", "Brisbane", "Gold Coast", "Byron Bay", "Perth"],
  "New Zealand":        ["Auckland", "Queenstown", "Wellington", "Christchurch"],
  "Maldives":           ["North Malé Atoll", "Baa Atoll", "Ari Atoll", "South Malé Atoll"],
  "French Polynesia":   ["Bora Bora", "Moorea", "Papeete", "Rangiroa"],
  "Fiji":               ["Nadi", "Suva", "Mamanuca Islands", "Yasawa Islands"],
};

const COUNTRY_CULTURAL_PREVIEW: Record<string, string> = {
  // Europe
  "France":           "Wine-dark afternoons, café tables at dusk, and a city that has always known desire.",
  "United Kingdom":   "Rain on Georgian stone, pub warmth after midnight, and a restraint that breaks slowly.",
  "Italy":            "Heat on terracotta, voices spilling from every window, and passion worn openly.",
  "Spain":            "Late dinners, flamenco after midnight, and a heat that never quite fades.",
  "Monaco":           "Old money, salt air off the harbour, and the intimacy of a very small world.",
  "Greece":           "Whitewashed walls, cobalt water, and afternoons that stretch until they become evenings.",
  "Turkey":           "Bosphorus light, spice-market air, and the collision of two continents in one city.",
  "Portugal":         "Fado somewhere below, golden tram-light, and a melancholy that turns tender.",
  "Switzerland":      "Alpine quiet, precision and luxury, and the tension of things unsaid in beautiful rooms.",
  "Austria":          "Imperial grandeur, café culture, and Viennese waltzes that feel like a slow seduction.",
  "Germany":          "Berlin's electric underground or Munich's baroque weight — intensity, differently expressed.",
  "Netherlands":      "Canal reflections at night, a frankness that is its own kind of intimacy.",
  "Denmark":          "Hygge and candlelight — Nordic cool that runs warm underneath.",
  "Sweden":           "Midnight sun or polar dark — Swedish restraint masking deep feeling.",
  "Norway":           "Fjord silence, raw nature, and long evenings where the light doesn't leave.",
  "Finland":          "Sauna heat and forest quiet — honesty worn like a second skin.",
  "Belgium":          "Chocolate-and-rain afternoons in Brussels, medieval stillness in Bruges.",
  "Poland":           "Kraków's old squares at golden hour — Slavic warmth held carefully close.",
  "Croatia":          "Adriatic blue, Dalmatian stone, and long summer evenings on the water.",
  "Czechia":          "Prague's Gothic spires at dusk, beer halls and baroque intimacy.",
  "Hungary":          "Budapest's thermal baths, the Danube lit from both banks, and romance bordering on melancholy.",
  "Ireland":          "Green against grey sky, pub storytelling, and warmth disguised as wit.",
  "Iceland":          "Geothermal heat against the cold, northern lights, and utter solitude.",
  // Americas
  "USA":              "A continent of contrasts — New York's electricity, New Orleans' heat, LA's golden hour.",
  "Mexico":           "Tequila and ancient cities, Tulum's jungle cenotes — full-colour desire.",
  "Cuba":             "Havana's crumbling grandeur, rum and son cubano, heat that never sleeps.",
  "Argentina":        "Buenos Aires' tango and steak dinners, and a Latin passion worn without apology.",
  "Brazil":           "Rio's carnival rhythm, caipirinha afternoons, and a sensuality that is cultural.",
  "Colombia":         "Cartagena's colonial walls, cumbia at night, and Caribbean warmth.",
  "Peru":             "Lima's Pacific mist, Incan history, and ancient flavour in everything.",
  // Caribbean
  "Jamaica":          "Reggae rhythms, rum punch on white sand, and island warmth that moves slow and sure.",
  "Barbados":         "Bajan rum, coral sand, and the particular ease of a beautiful island at rest.",
  "Trinidad & Tobago":"Carnival energy, calypso and soca, and the spice of a dual-island culture.",
  "St. Lucia":        "Piton silhouettes, volcanic heat, and a lushness that feels almost indecent.",
  "Bahamas":          "Turquoise and coral, Nassau's colonial elegance, island light that makes everything golden.",
  "Antigua & Barbuda":"Reefs and rum, English Harbour's yachting world, and 365 beaches for 365 days.",
  "Cayman Islands":   "Reef-calm water and the quiet wealth of a world that knows exactly what pleasure means.",
  "St. Barths":       "French sophistication in the tropics — Gustavia's yachts, rosé on white sand.",
  "Turks & Caicos":   "Grace Bay's translucent water and the privacy that comes with serious luxury.",
  "Grenada":          "Nutmeg and cocoa, Grand Anse's curved shore, and the warmth of a spice island.",
  "Martinique":       "French Antilles creole — rhum agricole and beaches where Europe meets the tropics.",
  "Guadeloupe":       "Butterfly island — mangroves, rum, and Creole cuisine at the edge of the Caribbean.",
  // Africa
  "South Africa":     "Cape's mountains and oceans, vineyard evenings in Stellenbosch, the charge of the continent's edge.",
  "Morocco":          "Marrakech's labyrinth, riad courtyards, lantern light and spice — the Orient at Africa's edge.",
  "Egypt":            "Nile at dusk, incense and antiquity — a civilisation pressing into every stone.",
  "Kenya":            "Savanna at dawn, Lamu's Swahili coast, and a landscape that dwarfs everything.",
  "Tanzania":         "Zanzibar's clove air and Swahili architecture, Serengeti's primal scale.",
  "Nigeria":          "Lagos' energy — one of Africa's most vital cities, fast, loud, and impossible to ignore.",
  "Ghana":            "Accra's coastal heat, Ashanti gold, and the warmth of West African hospitality.",
  "Senegal":          "Dakar's Teranga spirit — hospitality as culture, and the Atlantic horizon off Ngor.",
  "Ethiopia":         "Addis Ababa's highland cool, ancient churches, and coffee at its origin.",
  "Rwanda":           "Kigali's surprising modernity, gorillas in the mist, a country rebuilding with dignity.",
  "Ivory Coast":      "Abidjan's cosmopolitan energy and the pulse of Francophone West Africa.",
  "Mozambique":       "Indian Ocean coast, dhow-sailing culture, and a beach world barely discovered.",
  "Mauritius":        "Lagoon blue and sugar cane, French Creole culture, and the luxury of a perfect island.",
  "Seychelles":       "Primordial granite and coral — the most beautiful beaches on earth, with absolute privacy.",
  "Réunion":          "French island of volcanoes — cirque valleys and a Creole culture that burns.",
  // Middle East
  "UAE":              "Dubai's vertical excess and Abu Dhabi's cultural ambition — desert luxury at its limit.",
  "Saudi Arabia":     "AlUla's ancient Nabataean rock, Jeddah's Red Sea coral, a country opening from within.",
  "Jordan":           "Petra's rose-red city, Wadi Rum's silence at night, and Bedouin hospitality in the desert.",
  "Lebanon":          "Cedar and nightlife, Beirut's resilience — a city that always comes back dressed in beauty.",
  "Oman":             "Muscat's incense and Nizwa's forts — Arabia before the skyscrapers, still warm and itself.",
  "Qatar":            "Doha's Museum of Islamic Art at dusk — where old and new negotiate over the water.",
  // Asia
  "India":            "Goa's Portuguese spice, Udaipur's lake palace, Mumbai's monsoon — sensation in every direction.",
  "Thailand":         "Bangkok's temple-and-traffic charge, island evenings where sea and firelight meet.",
  "Japan":            "Kyoto's wabi-sabi restraint, Tokyo's neon overstimulation — precision masking feeling.",
  "South Korea":      "Seoul's layered modernity and Korean han — a particular, beautiful kind of sadness.",
  "Vietnam":          "Hội An's lantern evenings, Hanoi's old-quarter coffee, a country with ancient bones.",
  "Bali":             "Ubud's rice-terrace quiet and a Hindu-Balinese spirituality woven into everything.",
  "Sri Lanka":        "Ceylon tea and spice, Galle's Dutch fort walls — a tropical island running a thousand years deep.",
  "Singapore":        "The most ordered city in Asia — and underneath the precision, a heat that never fully left.",
  "Hong Kong":        "Harbour neon at night, Cantonese intensity, a city that never decided if it was East or West.",
  // Pacific & Oceania
  "Australia":        "Sydney's harbour drama, Byron Bay's coast — a country-sized confidence by the water.",
  "New Zealand":      "Queenstown's adrenaline, landscape so overwhelming it changes how you breathe.",
  "Maldives":         "Overwater bungalows and bioluminescent lagoons — the world reduced to water, light, and privacy.",
  "French Polynesia": "Bora Bora at sunrise, black pearls and vanilla — paradise before it became a word.",
  "Fiji":             "Fijian warmth — 'bula' is more than hello — and the South Pacific's unhurried sweetness.",
};

const ATMOSPHERES = [
  "Stormy", "Candlelit", "Midnight", "Golden Hour",
  "Rain", "Sun-Soaked", "Foggy", "Firelit", "Electric", "Languid",
];

const INTENSITIES: { id: CastingRoomResult["intensity"]; label: string; desc: string; color: string }[] = [
  { id: "Subtle",   label: "Subtle",   desc: "Something building beneath the surface",  color: "#60a5fa" },
  { id: "Warm",     label: "Warm",     desc: "Presence, attention, and what comes next", color: "#c9a227" },
  { id: "Elevated", label: "Elevated", desc: "Nothing left unspoken",                   color: "#f97316" },
  { id: "Intense",  label: "Intense",  desc: "Full immersion — every moment felt",      color: "#ef4444" },
];

const MOODS = [
  "Forbidden", "Raw", "Burning", "Reckless", "Charged", "Decadent",
  "Surrender", "Breathless", "Urgent", "Aching", "Yearning", "Electric",
  "Magnetic", "Unravelling", "Slow Burn", "Restless", "Late Night",
  "Playful", "Bittersweet", "Complicated", "Romantic", "Emotional",
  "Nostalgic", "Quiet Intensity", "Vulnerable", "Healing", "Luminous",
  "Quiet", "Certain", "Lingering", "Unspoken", "Emotional Tension",
];

/* ── Appearance options (pronoun-aware) ───────────────────────────── */
const BUILD_OPTIONS = ["Lean", "Athletic", "Broad", "Muscular", "Tall & lean", "Stocky", "Slight"];
const FEMALE_BUILD_OPTIONS = ["Petite", "Slim", "Curvy", "Athletic", "Full-figured", "Hourglass", "Tall and lean"];
const HEIGHT_OPTIONS = ["Tall", "Very tall", "Average height", "Shorter than me"];
const COLOURING_OPTIONS = ["Dark", "Olive", "Fair", "Tanned", "Deep brown", "Medium brown"];
const EYE_OPTIONS = ["Dark brown", "Light brown", "Green", "Blue", "Grey", "Hazel", "Deep black"];

function buildFeatureOptions(pronouns: string): string[] {
  if (pronouns === "she/her") {
    return [
      // Face & hair
      "Long lashes", "Full lips", "High cheekbones", "Sharp features",
      "Delicate features", "Natural glow", "Freckles", "Dimples",
      "Elegant hands", "Tattoos", "A scar", "Piercing eyes",
      "Long hair", "Short hair", "Curls", "Soft curls",
      // Body
      "Hourglass figure", "Curvy", "Petite frame", "Full-figured",
      "Long legs", "Narrow waist", "Full chest", "Peach shape", "Large curves",
    ];
  }
  if (pronouns === "they/them") {
    return [
      "Stubble", "Strong jaw", "Soft features", "High cheekbones",
      "Full lips", "Dimples", "Broad shoulders", "Lean frame",
      "Long lashes", "Elegant hands", "Tattoos", "A scar",
      "Piercing eyes", "Long hair", "Short hair", "Curls",
      "Silver at the temples", "Freckles",
    ];
  }
  return [
    "Stubble", "Full beard", "Clean-shaven", "Strong jaw", "Dimples",
    "Broad shoulders", "Large hands", "Tattoos", "A scar", "Piercing eyes",
    "Long hair", "Short hair", "Curls", "Silver at the temples",
  ];
}

/* ── Progress bar ─────────────────────────────────────────────────── */
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: i <= current ? 1 : 0.25 }}
          className="h-0.5 flex-1 rounded-full bg-primary"
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}

/* ── Live preview sentence ────────────────────────────────────────── */
function buildPreview(data: Partial<CastingRoomResult>): string {
  const parts: string[] = [];
  if (data.pairing) parts.push(data.pairing);
  const archetype = data.archetype;
  const setting   = data.setting;
  const heritage  = data.heritage;

  if (heritage && heritage !== "Ambiguous" && archetype) {
    parts.push(`featuring a ${heritage} ${archetype.replace(/^The\s+/i, "").toLowerCase()}`);
  } else if (heritage && heritage !== "Ambiguous") {
    parts.push(`featuring a ${heritage} love interest`);
  } else if (archetype) {
    parts.push(`featuring ${archetype.toLowerCase()}`);
  }

  const locationStr = [data.city, data.country].filter(Boolean).join(", ");
  if (locationStr) parts.push(`in ${locationStr}`);
  if (setting) parts.push(`set in ${setting.toLowerCase()}`);
  if (data.atmosphere) parts.push(`at ${data.atmosphere.toLowerCase()}`);
  if (data.intensity) parts.push(`— ${data.intensity.toLowerCase()} intensity`);

  return parts.length === 0
    ? "Your story is taking shape…"
    : parts.join(", ") + ".";
}

/* ── Main component ───────────────────────────────────────────────── */
const CASTING_STORAGE_KEY = "casting-room-session";
const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function CastingRoom({ onComplete, onSkip, afterDark = false, bedtime = false, handoff, handoffStep, onAfterDark, scenarioTags }: Props) {
  const initialHandoff = handoff ?? null;

  // Restore previous session from localStorage when there is no handoff.
  // This preserves progress if the user navigates away and returns.
  const savedSession = (() => {
    if (initialHandoff) return null;
    try {
      const raw = localStorage.getItem(CASTING_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    } catch { return null; }
  })();

  const [step, setStep] = useState<number>(
    (savedSession?.handoffStep as number) ?? initialHandoff?.handoffStep ?? handoffStep ?? 0
  );
  const [data, setData] = useState<Partial<CastingRoomResult>>(() => {
    const base: Partial<CastingRoomResult> = {
      perspective: "her",
      intensity: afterDark ? "Elevated" : bedtime ? "Subtle" : "Warm",
      mood: "Emotional",
    };
    if (savedSession) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { handoffStep: _hs, listenerName: _ln, partnerName: _pn, appearBuild: _ab, appearHeight: _ah, appearColouring: _ac, appearEyes: _ae, appearFeatures: _af, situation: _sit, situationId: _sid, customTags: _ct, ...castData } = savedSession;
      return { ...base, ...(castData as Partial<CastingRoomResult>) };
    }
    if (initialHandoff) {
      // Intensity excluded so After Dark users must re-confirm
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { listenerName: _ln, partnerName: _pn, appearBuild: _ab, appearHeight: _ah, appearColouring: _ac, appearEyes: _ae, appearFeatures: _af, situation: _sit, situationId: _sid, customTags: _ct, ...castData } = initialHandoff;
      return { ...base, ...castData };
    }
    return base;
  });
  const [customTags, setCustomTags] = useState<string[]>(
    (savedSession?.customTags as string[]) ?? initialHandoff?.customTags ?? []
  );
  const [listenerName, setListenerName] = useState<string>(
    (savedSession?.listenerName as string) ?? initialHandoff?.listenerName ?? ""
  );
  const [partnerName, setPartnerName] = useState<string>(
    (savedSession?.partnerName as string) ?? initialHandoff?.partnerName ?? ""
  );
  // Appearance
  const [appearBuild, setAppearBuild] = useState<string>(
    (savedSession?.appearBuild as string) ?? initialHandoff?.appearBuild ?? ""
  );
  const [appearHeight, setAppearHeight] = useState<string>(
    (savedSession?.appearHeight as string) ?? initialHandoff?.appearHeight ?? ""
  );
  const [appearColouring, setAppearColouring] = useState<string>(
    (savedSession?.appearColouring as string) ?? initialHandoff?.appearColouring ?? ""
  );
  const [appearEyes, setAppearEyes] = useState<string>(
    (savedSession?.appearEyes as string) ?? initialHandoff?.appearEyes ?? ""
  );
  const [appearFeatures, setAppearFeatures] = useState<string[]>(
    (savedSession?.appearFeatures as string[]) ?? initialHandoff?.appearFeatures ?? []
  );

  const [showAfterDarkTeaser, setShowAfterDarkTeaser] = useState(false);

  // Situation step state
  const [situationLabel, setSituationLabel] = useState<string>(
    (savedSession?.situation as string) ?? initialHandoff?.situation ?? ""
  );
  const [situationId, setSituationId] = useState<string>(
    (savedSession?.situationId as string) ?? initialHandoff?.situationId ?? ""
  );

  // Voice selection — step 11
  const [voiceId, setVoiceId] = useState<string>(() => {
    try {
      return localStorage.getItem("preferred_voice_id") ?? DEFAULT_FEMALE_VOICE_ID;
    } catch {
      return DEFAULT_FEMALE_VOICE_ID;
    }
  });
  const [situationCategory, setSituationCategory] = useState<string>("");

  // Save casting state to localStorage whenever any field changes
  useEffect(() => {
    const sessionData = {
      handoffStep: step,
      ...data,
      customTags,
      listenerName,
      partnerName,
      appearBuild,
      appearHeight,
      appearColouring,
      appearEyes,
      appearFeatures,
      situation: situationLabel,
      situationId,
    };
    try {
      localStorage.setItem(CASTING_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {
      // localStorage quota exceeded or unavailable — silently fail
    }
  }, [step, data, customTags, listenerName, partnerName, appearBuild, appearHeight, appearColouring, appearEyes, appearFeatures, situationLabel, situationId]);
  const [cfmMode, setCfmMode] = useState<"none" | "cfm">("none");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Scroll to top whenever the step changes
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const TOTAL_STEPS = 12;

  const update = (key: keyof CastingRoomResult, value: string) => {
    setData(d => {
      const next = { ...d, [key]: value };
      // When pairing changes, clear perspective if it's no longer valid
      // and reset the step-8 role note so it reappears for the new pairing context
      if (key === "pairing") {
        const valid = getValidPerspectiveIds(value);
        if (d.perspective && !valid.includes(d.perspective)) {
          delete next.perspective;
        }
        setStep8NoteDismissed(false);
        setVoiceId(prev => {
          const allowedVoices = getVoicesForPairing(value);
          const stillValid = allowedVoices.some(v => v.id === prev);
          return stillValid ? prev : getDefaultVoiceId(value);
        });
      }
      // When a historically-fixed or transit-route setting is chosen, country/city
      // are irrelevant — auto-clear them so they don't reach the prompt
      if (key === "setting" && (HISTORICAL_SETTING_IDS.has(value) || value === ORIENT_EXPRESS_ID)) {
        delete next.country;
        delete next.city;
      }
      return next;
    });
  };

  const toggleTag = (tag: string) => {
    setCustomTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const canProceed = () => {
    switch (step) {
      case 0: return !!data.pairing;
      case 1: return !!data.chemistry;
      case 2: return !!data.perspective && getValidPerspectiveIds(data.pairing).includes(data.perspective as "her" | "his" | "your" | "their");
      case 3: return !!data.heritage && !!data.archetype;
      case 4: return true;
      case 5: return !!data.setting;
      case 6: return !!data.intensity && !!data.mood;
      case 7: return true; // Situation — optional
      case 8: return true; // Tag Studio
      case 9: return true; // Your Name
      case 10: return true; // Partner Name
      default: return true;
    }
  };

  const handleFinish = () => {
    const chemistryCfg = buildChemistries(data.pairing).find(c => c.id === data.chemistry);
    const pairingCfg   = PAIRINGS.find(p => p.id === data.pairing);

    const archetype  = data.archetype  ?? "";
    const setting    = data.setting    ?? "";
    const heritage   = data.heritage   ?? "";
    const atmosphere = data.atmosphere ?? "";
    const country    = data.country    ?? "";
    const city       = data.city       ?? "";

    const whoIsHe = archetype;
    const dynamic = chemistryCfg?.dynamic ?? "";

    const result: CastingRoomResult = {
      perspective: data.perspective ?? "her",
      pairing: data.pairing,
      heritage,
      archetype,
      chemistry: data.chemistry ?? "",
      country: country || undefined,
      city: city || undefined,
      setting,
      atmosphere,
      intensity: data.intensity ?? "Warm",
      mood: data.mood ?? "Emotional",
      whoIsHe,
      dynamic,
      storyMode: afterDark ? "unrestrained" : bedtime ? "nocturne" : (data.intensity === "Subtle" || data.intensity === "Warm" ? "passionate" : "unrestrained"),
      customTags,
      // Structured appearance fields — sent individually to the API, reconstructed server-side
      appearBuild: appearBuild || undefined,
      appearHeight: appearHeight || undefined,
      appearColouring: appearColouring || undefined,
      appearEyes: appearEyes || undefined,
      appearFeatures: appearFeatures.length > 0 ? appearFeatures : undefined,
      // Name selections — validated server-side against allowlist
      listenerName: listenerName || undefined,
      partnerName: partnerName || undefined,
      // Situation — the selected situation label (one of 200 predefined)
      situation: situationLabel || undefined,
      situationId: situationId || undefined,
      // Voice selected in step 11 — persist to localStorage for next session
      voiceId: voiceId || undefined,
    };
    try { localStorage.setItem("preferred_voice_id", voiceId); } catch { /* ignore */ }
    // Clear saved session so the room always opens at step 0 next time
    try { localStorage.removeItem(CASTING_STORAGE_KEY); } catch { /* ignore */ }
    try { sessionStorage.removeItem("afterDarkHandoff"); } catch { /* ignore */ }
    onComplete(result);
    setStep(0);
  };

  const accentColor = afterDark ? "#c0392b" : "#c9a227";

  const [listenerSearch, setListenerSearch] = useState("");
  const [partnerSearch, setPartnerSearch] = useState("");
  const [step8NoteDismissed, setStep8NoteDismissed] = useState(false);
  const listenerInputRef = useRef<HTMLInputElement>(null);
  const partnerInputRef = useRef<HTMLInputElement>(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [heritageDropdownOpen, setHeritageDropdownOpen] = useState(false);
  const [energyDropdownOpen, setEnergyDropdownOpen] = useState(false);
  const [appearanceDropdownOpen, setAppearanceDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const heritageDropdownRef = useRef<HTMLDivElement>(null);
  const energyDropdownRef = useRef<HTMLDivElement>(null);
  const appearanceDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!countryDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
        setCountrySearch("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [countryDropdownOpen]);

  useEffect(() => {
    if (!heritageDropdownOpen) return;
    const handle = (e: MouseEvent) => {
      if (heritageDropdownRef.current && !heritageDropdownRef.current.contains(e.target as Node)) {
        setHeritageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [heritageDropdownOpen]);

  useEffect(() => {
    if (!energyDropdownOpen) return;
    const handle = (e: MouseEvent) => {
      if (energyDropdownRef.current && !energyDropdownRef.current.contains(e.target as Node)) {
        setEnergyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [energyDropdownOpen]);

  useEffect(() => {
    if (!appearanceDropdownOpen) return;
    const handle = (e: MouseEvent) => {
      if (appearanceDropdownRef.current && !appearanceDropdownRef.current.contains(e.target as Node)) {
        setAppearanceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [appearanceDropdownOpen]);

  const filteredListenerNames = listenerSearch.trim().length >= 1
    ? NAMES.filter(n => n.toLowerCase().startsWith(listenerSearch.toLowerCase())).slice(0, 8)
    : [];
  const filteredPartnerNames = partnerSearch.trim().length >= 1
    ? NAMES.filter(n => n.toLowerCase().startsWith(partnerSearch.toLowerCase())).slice(0, 8)
    : [];

  const { partner: partnerP, protagonist: protagonistP } = derivePronouns(data.pairing);
  const activePairing = PAIRINGS.find(p => p.id === data.pairing);

  const rawPartnerPronouns     = activePairing?.partnerPronouns     ?? "he/him";
  const rawProtagonistPronouns = activePairing?.protagonistPronouns ?? "she/her";

  // Helper: return the interpolated situation label for display, given current pairing pronouns.
  const interpSit = (sit: { id: string; label: string; template: string; category: string }) =>
    interpolateSituation(sit, rawProtagonistPronouns, rawPartnerPronouns);
  // The currently-selected situation's display label (pronoun-substituted for the active pairing).
  const displayedSitLabel = (() => {
    if (!situationId) return situationLabel;
    const found = SITUATIONS.find(s => s.id === situationId);
    return found ? interpSit(found) : situationLabel;
  })();
  const partnerHeadingVerb = partnerP.subject === "They" ? "Who are they?" : `Who is ${partnerP.object}?`;

  // Appearance step always describes the love interest from the active perspective's viewpoint.
  // When following the protagonist the love interest = partner; when following the partner it inverts.
  const perspectivePronounMap: Record<string, string> = { her: "she/her", his: "he/him", their: "they/them" };
  const activePerspectivePronoun = perspectivePronounMap[data.perspective ?? "her"] ?? null;
  const appearancePronouns = activePerspectivePronoun && activePerspectivePronoun !== rawProtagonistPronouns
    ? rawProtagonistPronouns
    : rawPartnerPronouns;
  const loveInterestP = appearancePronouns === rawPartnerPronouns ? partnerP : protagonistP;

  // Same-gender helpers — when both characters share pronouns, labels become ambiguous
  const isSameGender = rawProtagonistPronouns === rawPartnerPronouns;
  const partnerRoleLabel = rawPartnerPronouns === "she/her" ? "the other woman"
    : rawPartnerPronouns === "he/him" ? "the other man"
    : "the other person";
  // The "character story" perspective label depends on protagonist pronouns
  const characterStoryLabel = rawProtagonistPronouns === "he/him" ? "His Story"
    : rawProtagonistPronouns === "they/them" ? "Their Story"
    : "Her Story";

  const chemistries = buildChemistries(data.pairing);
  const archetypes  = buildArchetypes(data.pairing);

  const isChemistryRestricted = useCallback((chemId: string) => {
    if (!scenarioTags || scenarioTags.length === 0) return false;
    if (scenarioTags.some(t => t === "I'm completely in control" || t === "I take what I want")) {
      if (chemId.includes("Takes Charge") || chemId === "Charged Dynamic") return true;
    }
    if (scenarioTags.some(t => t === "He's completely in control" || t === "Total surrender")) {
      if (chemId.includes("Leads")) return true;
    }
    return false;
  }, [scenarioTags]);

  const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div ref={topRef} className="max-w-2xl mx-auto px-4 py-8 pb-28 w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          {step > 0 ? (
            <button
              onClick={back}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}
        </div>

        <StepBar current={step} total={TOTAL_STEPS} />

        <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: accentColor }}>
          {afterDark ? "After Dark" : "The Creation Room"} · Step {step + 1} of {TOTAL_STEPS}
        </p>
      </div>

      {/* Handoff banner — shown when carrying selections from standard casting */}
      {handoff && (
        <div className="mx-4 mb-4 rounded-xl px-4 py-2.5 flex items-center gap-2.5 border border-[#c0392b]/25 bg-[#c0392b]/5">
          <Moon className="w-3.5 h-3.5 shrink-0" style={{ color: "#c0392b" }} />
          <p className="text-xs text-muted-foreground">
            Your selections are carried across. Just confirm these final steps.
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* ── Step 0 — Pairing ─────────────────────────────────────── */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Who's in the story?</h2>
            <p className="text-muted-foreground text-sm mb-6">Choose the pairing — this shapes everything that follows.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PAIRINGS.map(p => (
                <ArtTile key={p.id} gradient={p.gradient} accent={p.accent} selected={data.pairing === p.id} onClick={() => { update("pairing", p.id); setTimeout(next, 350); }}>
                  <p className="font-semibold text-white text-base">{p.label}</p>
                  <p className="text-white/75 text-sm mt-0.5">{p.sub}</p>
                </ArtTile>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Step 1 — Chemistry / Dynamic ─────────────────────────── */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Between {protagonistP.object} and {partnerP.object}.
            </h2>
            <p className="text-muted-foreground text-sm mb-6">How does the power sit? Who moves first?</p>
            <div className="grid gap-3">
              {chemistries
                .filter(c =>
                  !bedtime
                    ? true
                    : ["Lovers", "Slow Surrender", "Romantic", "Sweet & Tender", "Pure Devotion", "The Best Friend", "Nervous Energy", "Playful", "Equal Tension", "Push & Pull"].includes(c.label)
                )
                .map(c => {
                  const restricted = isChemistryRestricted(c.id);
                  return (
                    <div key={c.id} className={restricted ? "opacity-35 cursor-not-allowed pointer-events-none" : ""} title={restricted ? "Not compatible with your chosen scenario" : undefined}>
                      <ArtTile gradient={c.gradient} accent={c.accent} image={c.image} selected={!restricted && data.chemistry === c.id} onClick={restricted ? () => {} : () => { update("chemistry", c.id); setTimeout(next, 350); }}>
                        <p className="font-semibold text-white text-base">{c.label}</p>
                        <p className="text-white/75 text-sm mt-0.5">{c.sub}</p>
                        {restricted && <p className="text-white/50 text-xs mt-1.5 italic">Not available with your scenario</p>}
                      </ArtTile>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* ── Step 2 — Perspective ─────────────────────────────────── */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Whose story?</h2>
            <p className="text-muted-foreground text-sm mb-2">Choose who the story follows.</p>
            {isSameGender && (
              <p className="text-xs text-muted-foreground/55 italic mb-5">
                "{characterStoryLabel}" follows your character throughout. "Your Story" puts you there as yourself, in the moment.
              </p>
            )}
            <div className="grid gap-3">
              {PERSPECTIVES.filter(p => getValidPerspectiveIds(data.pairing).includes(p.id)).map(p => (
                <ArtTile key={p.id} gradient={p.gradient} accent={p.accent} selected={data.perspective === p.id} onClick={() => { update("perspective", p.id); setTimeout(next, 350); }}>
                  <p className="font-semibold text-white text-base">{p.label}</p>
                  <p className="text-white/75 text-sm mt-0.5">{p.sub}</p>
                </ArtTile>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Step 3 — Character ───────────────────────────────────── */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {isSameGender ? "Your love interest." : partnerHeadingVerb}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {isSameGender
                ? `${capFirst(partnerRoleLabel)} in your story — ${partnerP.possessive} heritage and the energy ${partnerP.subject === "They" ? "they bring" : `${partnerP.subject.toLowerCase()} brings`}.`
                : `Choose ${partnerP.possessive} heritage and the energy ${partnerP.subject === "They" ? "they bring" : `${partnerP.subject.toLowerCase()} brings`}.`}
            </p>

            {/* Heritage dropdown */}
            {(() => {
              const selectedHeritage = HERITAGES.find(h => h.id === data.heritage);
              return (
                <div className="mb-5 relative" ref={heritageDropdownRef}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-2">Heritage</p>
                  <button
                    type="button"
                    onClick={() => { setHeritageDropdownOpen(o => !o); setEnergyDropdownOpen(false); setAppearanceDropdownOpen(false); }}
                    className="w-full rounded-2xl border text-left flex items-center gap-3 focus:outline-none transition-all cursor-pointer relative overflow-hidden"
                    style={selectedHeritage
                      ? { borderColor: `${selectedHeritage.accent}60`, background: `linear-gradient(135deg, ${selectedHeritage.accent}18 0%, transparent 55%)` }
                      : { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }
                    }
                  >
                    {selectedHeritage && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: gradientCSS(selectedHeritage.gradient) }} />
                    )}
                    <div className="flex items-center gap-3 flex-1 min-w-0 px-5 py-4">
                      {selectedHeritage ? (
                        <div className="w-9 h-9 rounded-xl flex-shrink-0 border border-white/15 shadow-sm"
                          style={{ background: gradientCSS(selectedHeritage.gradient) }} />
                      ) : (
                        <div className="w-9 h-9 rounded-xl flex-shrink-0 border border-dashed border-white/20 bg-white/3 flex items-center justify-center">
                          <span className="text-white/30 text-lg">+</span>
                        </div>
                      )}
                      <span className="flex-1 min-w-0">
                        <span className={`block text-sm font-semibold ${selectedHeritage ? "text-foreground" : "text-muted-foreground/60"}`}>
                          {selectedHeritage ? selectedHeritage.label : "Choose heritage…"}
                        </span>
                        {selectedHeritage && (
                          <span className="block text-xs truncate mt-0.5" style={{ color: `${selectedHeritage.accent}99` }}>{selectedHeritage.sub}</span>
                        )}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 mr-4 transition-transform duration-200 ${heritageDropdownOpen ? "rotate-180" : ""}`}
                      style={{ color: selectedHeritage ? selectedHeritage.accent : "rgba(255,255,255,0.3)" }}
                    />
                  </button>
                  {heritageDropdownOpen && (
                    <div className="absolute z-50 top-full mt-2 left-0 right-0 rounded-2xl shadow-2xl overflow-hidden"
                      style={{ background: "#0c0c0f", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div className="max-h-[45vh] sm:max-h-[360px] overflow-y-auto p-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {HERITAGES.map(h => (
                            <ArtTile key={h.id} gradient={h.gradient} accent={h.accent} image={h.image} selected={data.heritage === h.id}
                              onClick={() => { update("heritage", h.id); setHeritageDropdownOpen(false); }}
                            >
                              <p className="font-semibold text-white text-sm">{h.label}</p>
                              <p className="text-white/75 text-xs mt-0.5 leading-snug">{h.sub}</p>
                            </ArtTile>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Energy dropdown */}
            {(() => {
              const energyOptions = archetypes.filter(a =>
                !bedtime ? true : ["The Old Friend", "The Refined One", "The Protector", "The Good One", "The Softie", "The Charmer", "The Introvert"].includes(a.label)
              );
              const selectedEnergy = energyOptions.find(a => a.id === data.archetype);
              return (
                <div className="mb-6 relative" ref={energyDropdownRef}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-2">
                    {capFirst(partnerP.possessive)} Energy
                  </p>
                  <button
                    type="button"
                    onClick={() => { setEnergyDropdownOpen(o => !o); setHeritageDropdownOpen(false); setAppearanceDropdownOpen(false); }}
                    className="w-full rounded-2xl border text-left flex items-center gap-3 focus:outline-none transition-all cursor-pointer relative overflow-hidden"
                    style={selectedEnergy
                      ? { borderColor: `${selectedEnergy.accent}60`, background: `linear-gradient(135deg, ${selectedEnergy.accent}18 0%, transparent 55%)` }
                      : { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }
                    }
                  >
                    {selectedEnergy && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: gradientCSS(selectedEnergy.gradient) }} />
                    )}
                    <div className="flex items-center gap-3 flex-1 min-w-0 px-5 py-4">
                      {selectedEnergy ? (
                        <div className="w-9 h-9 rounded-xl flex-shrink-0 border border-white/15 shadow-sm"
                          style={{ background: gradientCSS(selectedEnergy.gradient) }} />
                      ) : (
                        <div className="w-9 h-9 rounded-xl flex-shrink-0 border border-dashed border-white/20 bg-white/3 flex items-center justify-center">
                          <span className="text-white/30 text-lg">+</span>
                        </div>
                      )}
                      <span className="flex-1 min-w-0">
                        <span className={`block text-sm font-semibold ${selectedEnergy ? "text-foreground" : "text-muted-foreground/60"}`}>
                          {selectedEnergy ? selectedEnergy.label : "Choose energy…"}
                        </span>
                        {selectedEnergy && (
                          <span className="block text-xs truncate mt-0.5" style={{ color: `${selectedEnergy.accent}99` }}>{selectedEnergy.sub}</span>
                        )}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 mr-4 transition-transform duration-200 ${energyDropdownOpen ? "rotate-180" : ""}`}
                      style={{ color: selectedEnergy ? selectedEnergy.accent : "rgba(255,255,255,0.3)" }}
                    />
                  </button>
                  {energyDropdownOpen && (
                    <div className="absolute z-50 bottom-full mb-2 left-0 right-0 rounded-2xl shadow-2xl overflow-hidden"
                      style={{ background: "#0c0c0f", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div className="max-h-[45vh] sm:max-h-[400px] overflow-y-auto p-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {energyOptions.map(a => (
                            <ArtTile key={a.id} gradient={a.gradient} accent={a.accent} image={a.image} selected={data.archetype === a.id}
                              onClick={() => { update("archetype", a.id); setEnergyDropdownOpen(false); }}
                            >
                              <p className="font-semibold text-white text-sm">{a.label}</p>
                              <p className="text-white/75 text-xs mt-0.5 leading-snug">{a.sub}</p>
                            </ArtTile>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── Appearance dropdown (optional) ───────────────────── */}
            {(() => {
              const accentGold = "#c9a227";
              const appearParts = [appearBuild, appearHeight, appearColouring, appearEyes, ...appearFeatures].filter(Boolean);
              const hasAppear = appearParts.length > 0;
              const appearSummary = hasAppear ? appearParts.join(" · ") : null;
              return (
                <div className="mb-2 relative" ref={appearanceDropdownRef}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-2">
                    {isSameGender
                      ? (partnerName ? `${partnerName}'s Appearance` : "Appearance")
                      : `${capFirst(loveInterestP.possessive)} Appearance`}
                    <span className="font-normal text-primary/40 normal-case tracking-normal ml-2">(optional)</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => { setAppearanceDropdownOpen(o => !o); setHeritageDropdownOpen(false); setEnergyDropdownOpen(false); }}
                    className="w-full rounded-2xl border text-left flex items-center gap-3 focus:outline-none transition-all cursor-pointer relative overflow-hidden"
                    style={hasAppear
                      ? { borderColor: `${accentGold}60`, background: `linear-gradient(135deg, ${accentGold}15 0%, transparent 55%)` }
                      : { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }
                    }
                  >
                    {hasAppear && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                        style={{ background: `linear-gradient(to bottom, ${accentGold}, ${accentGold}44)` }} />
                    )}
                    <div className="flex items-center gap-3 flex-1 min-w-0 px-5 py-4">
                      <div className="w-9 h-9 rounded-xl flex-shrink-0 border flex items-center justify-center"
                        style={hasAppear
                          ? { borderColor: `${accentGold}40`, background: `${accentGold}20` }
                          : { borderColor: "rgba(255,255,255,0.15)", borderStyle: "dashed", background: "rgba(255,255,255,0.02)" }
                        }
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke={hasAppear ? accentGold : "rgba(255,255,255,0.25)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="3.5"/>
                          <path d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"/>
                        </svg>
                      </div>
                      <span className="flex-1 min-w-0">
                        <span className={`block text-sm font-semibold ${hasAppear ? "text-foreground" : "text-muted-foreground/60"}`}>
                          {hasAppear ? "Appearance set" : "Add appearance details…"}
                        </span>
                        {appearSummary && (
                          <span className="block text-xs truncate mt-0.5" style={{ color: `${accentGold}90` }}>{appearSummary}</span>
                        )}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 mr-4 transition-transform duration-200 ${appearanceDropdownOpen ? "rotate-180" : ""}`}
                      style={{ color: hasAppear ? accentGold : "rgba(255,255,255,0.3)" }}
                    />
                  </button>
                  {appearanceDropdownOpen && (
                    <div className="absolute z-50 bottom-full mb-2 left-0 right-0 rounded-2xl shadow-2xl overflow-hidden"
                      style={{ background: "#0c0c0f", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div className="max-h-[45vh] sm:max-h-[500px] overflow-y-auto p-5 space-y-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: `${accentGold}80` }}>Build</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(appearancePronouns === "she/her" ? FEMALE_BUILD_OPTIONS : BUILD_OPTIONS).map(opt => (
                              <button key={opt} type="button"
                                onClick={() => setAppearBuild(prev => prev === opt ? "" : opt)}
                                className="px-3 py-1.5 rounded-full text-xs border transition-all"
                                style={appearBuild === opt
                                  ? { borderColor: `${accentGold}70`, background: `${accentGold}20`, color: accentGold }
                                  : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)" }
                                }
                              >{opt}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: `${accentGold}80` }}>Height</p>
                          <div className="flex flex-wrap gap-1.5">
                            {HEIGHT_OPTIONS.map(opt => (
                              <button key={opt} type="button"
                                onClick={() => setAppearHeight(prev => prev === opt ? "" : opt)}
                                className="px-3 py-1.5 rounded-full text-xs border transition-all"
                                style={appearHeight === opt
                                  ? { borderColor: `${accentGold}70`, background: `${accentGold}20`, color: accentGold }
                                  : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)" }
                                }
                              >{opt}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: `${accentGold}80` }}>Colouring</p>
                          <div className="flex flex-wrap gap-1.5">
                            {COLOURING_OPTIONS.map(opt => (
                              <button key={opt} type="button"
                                onClick={() => setAppearColouring(prev => prev === opt ? "" : opt)}
                                className="px-3 py-1.5 rounded-full text-xs border transition-all"
                                style={appearColouring === opt
                                  ? { borderColor: `${accentGold}70`, background: `${accentGold}20`, color: accentGold }
                                  : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)" }
                                }
                              >{opt}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: `${accentGold}80` }}>Eye Colour</p>
                          <div className="flex flex-wrap gap-1.5">
                            {EYE_OPTIONS.map(opt => (
                              <button key={opt} type="button"
                                onClick={() => setAppearEyes(prev => prev === opt ? "" : opt)}
                                className="px-3 py-1.5 rounded-full text-xs border transition-all"
                                style={appearEyes === opt
                                  ? { borderColor: `${accentGold}70`, background: `${accentGold}20`, color: accentGold }
                                  : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)" }
                                }
                              >{opt}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: `${accentGold}80` }}>Distinguishing Features</p>
                          <div className="flex flex-wrap gap-1.5">
                            {buildFeatureOptions(appearancePronouns).map(opt => (
                              <button key={opt} type="button"
                                onClick={() => setAppearFeatures(prev =>
                                  prev.includes(opt) ? prev.filter(f => f !== opt) : [...prev, opt]
                                )}
                                className="px-3 py-1.5 rounded-full text-xs border transition-all"
                                style={appearFeatures.includes(opt)
                                  ? { borderColor: `${accentGold}70`, background: `${accentGold}20`, color: accentGold }
                                  : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)" }
                                }
                              >{opt}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

          </motion.div>
        )}

        {/* ── Step 4 — Location ────────────────────────────────────── */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: accentColor }} />
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Where in the world?</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              A real country and city weave genuine cultural texture into your story — its sounds, its light, its customs. Entirely optional.
            </p>

            {/* Setting-geography advisory */}
            {data.setting && (HISTORICAL_SETTING_IDS.has(data.setting) || data.setting === ORIENT_EXPRESS_ID) && (
              <div className="mb-6 px-4 py-3 rounded-xl text-xs text-muted-foreground/80 leading-relaxed"
                style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)" }}>
                <span className="font-semibold" style={{ color: accentColor }}>Setting note — </span>
                {HISTORICAL_SETTING_IDS.has(data.setting)
                  ? "Your chosen setting carries its own era and geography. A country or city selection won't apply to this story."
                  : "The Orient Express travels its own fixed route. A country or city selection won't apply to this story."}
              </div>
            )}
            {data.setting && (MOUNTAIN_SETTING_IDS.has(data.setting) || data.setting === EUROPEAN_VILLA_ID || data.setting === ORIENT_EXPRESS_ID) && !HISTORICAL_SETTING_IDS.has(data.setting ?? "") && (
              <div className="mb-6 px-4 py-3 rounded-xl text-xs text-muted-foreground/80 leading-relaxed"
                style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.15)" }}>
                <span className="font-semibold" style={{ color: accentColor }}>Location filter active — </span>
                {MOUNTAIN_SETTING_IDS.has(data.setting)
                  ? "Only countries with mountain regions are shown below."
                  : data.setting === EUROPEAN_VILLA_ID
                  ? "Only European countries are shown below."
                  : "Only Orient Express route countries are shown below."}
              </div>
            )}

            {/* Country */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accentColor, opacity: 0.7 }}>Country</p>
              <div className="relative" ref={countryDropdownRef}>
                <button
                  type="button"
                  onClick={() => { setCountryDropdownOpen(o => !o); setCountrySearch(""); }}
                  className="w-full bg-card/50 border border-border/40 rounded-2xl px-5 py-4 text-base text-foreground text-left flex items-center justify-between gap-3 focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {data.country && COUNTRY_FLAGS[data.country] && (
                      <span className="text-xl leading-none">{COUNTRY_FLAGS[data.country]}</span>
                    )}
                    <span className={data.country ? "text-foreground" : "text-muted-foreground"}>
                      {data.country || "Choose a country…"}
                    </span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${countryDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {countryDropdownOpen && (
                  <div className="mt-2 bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-2 border-b border-border/40">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search countries…"
                          value={countrySearch}
                          onChange={e => setCountrySearch(e.target.value)}
                          className="w-full bg-background/50 rounded-xl pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {Object.keys(COUNTRY_CITIES)
                        .sort()
                        .filter(c => {
                          if (countrySearch && !c.toLowerCase().includes(countrySearch.toLowerCase())) return false;
                          if (data.setting === ORIENT_EXPRESS_ID) return ORIENT_EXPRESS_COUNTRIES.has(c);
                          if (data.setting && MOUNTAIN_SETTING_IDS.has(data.setting)) return MOUNTAIN_COUNTRIES.has(c);
                          if (data.setting === EUROPEAN_VILLA_ID) return EUROPEAN_COUNTRIES.has(c);
                          return true;
                        })
                        .map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              update("country", c);
                              update("city", "");
                              setCountryDropdownOpen(false);
                              setCountrySearch("");
                            }}
                            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${data.country === c ? "text-primary" : "text-foreground"}`}
                          >
                            <span className="text-xl leading-none w-7 text-center">{COUNTRY_FLAGS[c] || "🌍"}</span>
                            <span>{c}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Country confirmed badge */}
              {data.country && (
                <motion.div
                  key={data.country}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 flex items-center gap-2"
                >
                  {COUNTRY_FLAGS[data.country] && (
                    <span className="text-2xl leading-none">{COUNTRY_FLAGS[data.country]}</span>
                  )}
                  <span className="text-sm font-semibold text-foreground">{data.country}</span>
                  <span className="text-xs text-muted-foreground/60">selected</span>
                  <button
                    type="button"
                    onClick={() => { update("country", ""); update("city", ""); }}
                    className="ml-1 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                  >
                    <X size={11} /> Clear
                  </button>
                </motion.div>
              )}
            </div>

            {/* City — shown only when country selected */}
            {data.country && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor, opacity: 0.7 }}>City</p>
                  {data.city && (
                    <span className="text-xs text-muted-foreground/60 italic">
                      {COUNTRY_FLAGS[data.country] && `${COUNTRY_FLAGS[data.country]} `}{data.city}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={data.city ?? ""}
                    onChange={e => update("city", e.target.value)}
                    className={`w-full bg-card/50 border rounded-2xl px-5 py-4 text-base text-foreground appearance-none focus:outline-none transition-all cursor-pointer pr-10 ${
                      data.city ? "border-primary/50 bg-primary/5" : "border-border/40 focus:border-primary/50"
                    }`}
                    style={{ colorScheme: "dark" }}
                  >
                    <option value="">Any city in {data.country}…</option>
                    {(COUNTRY_CITIES[data.country] ?? []).map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {!data.city && (
                  <p className="mt-2 text-xs text-muted-foreground/50 italic">Optional — leave as "any city" to let the story choose.</p>
                )}
              </motion.div>
            )}

            {/* Cultural preview — hero treatment */}
            {data.country && COUNTRY_CULTURAL_PREVIEW[data.country] && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8 border-l-2 pl-5"
                style={{ borderColor: `${accentColor}50` }}
              >
                <p className="font-display text-xl italic leading-relaxed" style={{ color: accentColor }}>
                  "{COUNTRY_CULTURAL_PREVIEW[data.country]}"
                </p>
              </motion.div>
            )}

            {!data.country && (
              <p className="text-xs text-muted-foreground/40 mt-10 italic">Skip this step — your story works beautifully without a real location.</p>
            )}
          </motion.div>
        )}

        {/* ── Step 5 — Setting ─────────────────────────────────────── */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">What's the world of this story?</h2>
            <p className="text-muted-foreground text-sm mb-6">The setting shapes what's possible — and how everything feels.</p>

            {/* ── Scenario (required) ── */}
            {afterDark && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">After Dark Exclusive</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                  {AFTER_DARK_SETTINGS.map(s => (
                    <ArtTile key={s.id} gradient={s.gradient} accent={s.accent} image={(s as {image?: string}).image} selected={data.setting === s.id} onClick={() => { update("setting", s.id); next(); }}>
                      <p className="font-semibold text-white text-base">{s.label}</p>
                      <p className="text-white/75 text-sm mt-0.5 leading-snug">{s.sub}</p>
                    </ArtTile>
                  ))}
                </div>
              </>
            )}

            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">Contemporary</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {CONTEMPORARY_SETTINGS.map(s => (
                <ArtTile key={s.id} gradient={s.gradient} accent={s.accent} image={(s as {image?: string}).image} selected={data.setting === s.id} onClick={() => { update("setting", s.id); next(); }}>
                  <p className="font-semibold text-white text-base">{s.label}</p>
                  <p className="text-white/75 text-sm mt-0.5 leading-snug">{s.sub}</p>
                </ArtTile>
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">Historical Eras</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {HISTORICAL_SETTINGS.map(s => (
                <ArtTile key={s.id} gradient={s.gradient} accent={s.accent} image={(s as {image?: string}).image} selected={data.setting === s.id} onClick={() => { update("setting", s.id); next(); }}>
                  <p className="font-semibold text-white text-base">{s.label}</p>
                  <p className="text-white/75 text-sm mt-0.5 leading-snug">{s.sub}</p>
                </ArtTile>
              ))}
            </div>

            {/* Setting-geography advisory in step 5 */}
            {data.setting && (HISTORICAL_SETTING_IDS.has(data.setting) || data.setting === ORIENT_EXPRESS_ID || MOUNTAIN_SETTING_IDS.has(data.setting) || data.setting === EUROPEAN_VILLA_ID) && (
              <div className="mb-5 px-4 py-3 rounded-xl text-xs text-muted-foreground/70 leading-relaxed"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {HISTORICAL_SETTING_IDS.has(data.setting)
                  ? "This setting carries its own era and world — your country and city choices won't apply to this story."
                  : data.setting === ORIENT_EXPRESS_ID
                  ? "Your location selection has been cleared — the Orient Express travels its own route."
                  : MOUNTAIN_SETTING_IDS.has(data.setting)
                  ? "This setting works best with mountainous countries — only compatible locations will appear in the location step."
                  : "This setting is European by nature — only European countries will appear in the location step."}
              </div>
            )}

          </motion.div>
        )}

        {/* ── Step 6 — Intensity + Mood ────────────────────────────── */}
        {step === 6 && (
          <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {bedtime ? (
              <>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">How gentle?</h2>
                <p className="text-muted-foreground text-sm mb-6">Drift stories stay calm and unhurried. Set the warmth of this one.</p>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">How far?</h2>
                <p className="text-muted-foreground text-sm mb-6">Set the intensity and the feeling of this story.</p>
              </>
            )}

            <div className="glass-panel rounded-2xl p-5 border border-white/8 mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">Intensity</p>
              <div className="grid grid-cols-2 gap-2.5">
                {INTENSITIES.filter(i => afterDark ? ["Elevated", "Intense"].includes(i.id) : true).map(i => {
                  const isGateway = !afterDark && !bedtime && i.id === "Intense";
                  const isDriftLocked = bedtime && (i.id === "Elevated" || i.id === "Intense");
                  return (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => {
                        if (isGateway) {
                          setShowAfterDarkTeaser(v => !v);
                        } else if (!isDriftLocked) {
                          setShowAfterDarkTeaser(false);
                          update("intensity", i.id);
                        }
                      }}
                      disabled={isDriftLocked}
                      title={isDriftLocked ? "Not available in Drift mode" : undefined}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isDriftLocked
                          ? "border-white/5 bg-white/2 opacity-30 cursor-not-allowed"
                          : isGateway
                          ? showAfterDarkTeaser
                            ? "border-[#7b8fff]/50 bg-[#7b8fff]/10 opacity-90"
                            : "border-[#7b8fff]/35 bg-[#7b8fff]/8 opacity-80 hover:opacity-100 hover:border-[#7b8fff]/55"
                          : data.intensity === i.id
                            ? "border-primary bg-primary/10 shadow-glow"
                            : "border-border/30 bg-card/30 hover:border-primary/30 hover:bg-primary/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isGateway ? (
                          <Moon className="w-3 h-3 shrink-0" style={{ color: "#9baeff" }} />
                        ) : (
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: isDriftLocked ? "#444" : i.color }} />
                        )}
                        <p className={`font-semibold text-sm ${
                          isDriftLocked ? "text-muted-foreground/40" : isGateway ? "text-[#9baeff]" : data.intensity === i.id ? "text-primary" : "text-foreground"
                        }`}>{i.label}</p>
                        {isGateway && (
                          <span className="ml-auto text-[9px] font-bold uppercase tracking-widest" style={{ color: "#7b8fff" }}>After Dark</span>
                        )}
                        {isDriftLocked && (
                          <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Drift</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{i.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* After Dark gateway teaser */}
              {showAfterDarkTeaser && !afterDark && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-2xl p-4"
                  style={{ background: "rgba(123,143,255,0.10)", border: "1px solid rgba(123,143,255,0.35)" }}
                >
                  <div className="flex items-start gap-3">
                    <Moon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#9baeff" }} />
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: "#c8d4ff" }}>After Dark — where your deepest fantasies live</p>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(155,174,255,0.75)" }}>
                        After Dark is a separate world: unrestrained intensity, fully written scenarios, and every casting option fully unlocked. Nothing held back, nothing left unwritten.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = `${import.meta.env.BASE_URL}after-dark`;
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all hover:opacity-80"
                        style={{ color: "#7b8fff" }}
                      >
                        Continue your selections in After Dark <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Drift intensity note */}
            {bedtime && (
              <div
                className="flex items-start gap-3 px-4 py-3 rounded-2xl mb-5"
                style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.18)" }}
              >
                <Moon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#6366f1" }} />
                <div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">Drift stays warm</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Elevated and Intense are exclusive to{" "}
                    <a
                      href={`${import.meta.env.BASE_URL}after-dark`}
                      className="font-semibold underline underline-offset-2"
                      style={{ color: "#9baeff" }}
                    >
                      After Dark
                    </a>
                    {" "}— a separate, fully unrestrained experience.
                  </p>
                </div>
              </div>
            )}

            <div className="glass-panel rounded-2xl p-5 border border-white/8 mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">Mood</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.filter(m =>
                  !bedtime
                    ? true
                    : ["Romantic", "Emotional", "Tender", "Vulnerable", "Healing", "Quiet", "Nostalgic", "Aching", "Yearning", "Bittersweet"].includes(m)
                ).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => update("mood", m)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      data.mood === m
                        ? "bg-primary text-primary-foreground border-primary shadow-glow"
                        : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Story preview */}
            <div className="glass-panel rounded-2xl p-5 mb-4 border border-primary/20">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-2">Your story</p>
              <p className="text-foreground text-sm leading-relaxed italic">"{buildPreview(data)}"</p>
            </div>
          </motion.div>
        )}

        {/* ── Step 7 — The Situation ───────────────────────────────── */}
        {step === 7 && (
          <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">What's the situation?</h2>
                <p className="text-muted-foreground text-sm">Choose the engine of your story — or let us pick one for you.</p>
              </div>
              <button
                type="button"
                onClick={next}
                className="text-xs text-muted-foreground hover:text-primary transition-colors whitespace-nowrap ml-4 mt-1 flex-shrink-0"
              >
                Skip →
              </button>
            </div>

            {/* Choose For Me — always prominent at top */}
            <div className="glass-panel rounded-2xl p-4 border border-white/8 mb-4">
              {situationLabel && cfmMode === "cfm" ? (
                /* Selected via CFM — show selected + re-roll + clear */
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accentColor }}>
                      {situationCategory}
                    </p>
                    <p className="font-semibold text-foreground text-sm leading-snug">{displayedSitLabel}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const eligible = SITUATIONS.filter(s => !s.allowedPairings || s.allowedPairings.includes(data.pairing ?? ""));
                        const pool = eligible.length > 0 ? eligible : SITUATIONS.filter(s => !s.allowedPairings);
                        const pick = pool[Math.floor(Math.random() * pool.length)];
                        setSituationLabel(pick.label);
                        setSituationId(pick.id);
                        setSituationCategory(pick.category);
                        setExpandedCategories(prev => { const n = new Set(prev); n.add(pick.category); return n; });
                      }}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      <Shuffle size={12} /> Re-roll
                    </button>
                    <span className="text-border/40">·</span>
                    <button
                      type="button"
                      onClick={() => { setSituationLabel(""); setSituationId(""); setSituationCategory(""); setCfmMode("none"); }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={12} /> Clear
                    </button>
                  </div>
                </div>
              ) : situationLabel ? (
                /* Selected via tab browse — show selected + clear */
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accentColor }}>
                      {situationCategory}
                    </p>
                    <p className="font-semibold text-foreground text-sm leading-snug">{displayedSitLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSituationLabel(""); setSituationId(""); setSituationCategory(""); setCfmMode("none"); }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1"
                  >
                    <X size={12} /> Clear
                  </button>
                </div>
              ) : (
                /* Nothing selected — show CFM button */
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">Choose For Me</p>
                  <button
                    type="button"
                    onClick={() => {
                      const eligible = SITUATIONS.filter(s => !s.allowedPairings || s.allowedPairings.includes(data.pairing ?? ""));
                      const pool = eligible.length > 0 ? eligible : SITUATIONS.filter(s => !s.allowedPairings);
                      const pick = pool[Math.floor(Math.random() * pool.length)];
                      setSituationLabel(pick.label);
                      setSituationId(pick.id);
                      setSituationCategory(pick.category);
                      setExpandedCategories(prev => { const n = new Set(prev); n.add(pick.category); return n; });
                      setCfmMode("cfm");
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-primary/30 bg-primary/5 text-sm font-semibold text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
                  >
                    <Shuffle size={15} />
                    Surprise me — pick one for me
                  </button>
                </div>
              )}
            </div>

            {/* Accordion — one collapsible section per category */}
            <div className="space-y-2">
              {SITUATION_CATEGORIES.map(cat => {
                const situations = getSituationsByCategory(cat);
                const isOpen = expandedCategories.has(cat);
                const hasSelected = situations.some(s => s.id === situationId);
                return (
                  <div
                    key={cat}
                    className={`rounded-xl border overflow-hidden transition-colors ${
                      hasSelected ? "border-primary/40" : "border-border/25"
                    }`}
                  >
                    {/* Section header */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCategories(prev => {
                          const n = new Set(prev);
                          if (n.has(cat)) n.delete(cat);
                          else n.add(cat);
                          return n;
                        })
                      }
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {hasSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        )}
                        <span className={`text-sm font-semibold ${hasSelected ? "text-primary" : "text-foreground"}`}>
                          {cat}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground/60">{situations.length}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>

                    {/* Situation list */}
                    {isOpen && (
                      <div className="border-t border-border/20 divide-y divide-border/10">
                        {situations.map(sit => {
                          const isSelected = situationId === sit.id;
                          const isLocked = !!(sit.allowedPairings && data.pairing && !sit.allowedPairings.includes(data.pairing));
                          return (
                            <button
                              key={sit.id}
                              type="button"
                              disabled={isLocked}
                              onClick={() => {
                                if (isLocked) return;
                                if (isSelected) {
                                  setSituationLabel("");
                                  setSituationId("");
                                  setSituationCategory("");
                                  setCfmMode("none");
                                } else {
                                  setSituationLabel(sit.label);
                                  setSituationId(sit.id);
                                  setSituationCategory(sit.category);
                                  setCfmMode("none");
                                }
                              }}
                              className={`w-full text-left px-4 py-3 text-sm leading-snug transition-all ${
                                isLocked
                                  ? "opacity-35 cursor-not-allowed"
                                  : isSelected
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                              }`}
                            >
                              <span className={isLocked ? "text-muted-foreground/50" : ""}>{interpSit(sit)}</span>
                              {isLocked && (
                                <span className="ml-2 text-[10px] font-medium text-primary/40 align-middle">Her stories only</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Skip link at the bottom */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={next}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Skip — no specific situation
              </button>
            </div>

            {/* Drift upsell — more situations on other modes */}
            {bedtime && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <a
                  href={`${import.meta.env.BASE_URL}create`}
                  className="flex flex-col gap-1.5 px-3.5 py-3 rounded-2xl transition-all hover:opacity-80"
                  style={{ background: "rgba(201,162,39,0.07)", border: "1px solid rgba(201,162,39,0.22)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#c9a227" }} />
                    <p className="text-xs font-bold text-foreground">Private Story</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">More situations, full casting, any intensity</p>
                </a>
                <a
                  href={`${import.meta.env.BASE_URL}after-dark`}
                  className="flex flex-col gap-1.5 px-3.5 py-3 rounded-2xl transition-all hover:opacity-80"
                  style={{ background: "rgba(123,143,255,0.10)", border: "1px solid rgba(123,143,255,0.35)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <Moon className="w-2.5 h-2.5" style={{ color: "#9baeff" }} />
                    <p className="text-xs font-bold" style={{ color: "#c8d4ff" }}>After Dark</p>
                  </div>
                  <p className="text-[11px] leading-snug" style={{ color: "rgba(155,174,255,0.70)" }}>Unrestrained — nothing held back</p>
                </a>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Step 8 — Tag Studio ──────────────────────────────────── */}
        {step === 8 && (
          <motion.div key="step8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Make it yours.</h2>
                <p className="text-muted-foreground text-sm">Select only what feels right — everything you choose shapes the story.</p>
                {!afterDark && onAfterDark && (
                  <button
                    type="button"
                    onClick={onAfterDark}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-[1.02]"
                    style={{ background: "rgba(123,143,255,0.10)", border: "1px solid rgba(123,143,255,0.35)", color: "#9baeff" }}
                  >
                    <Moon className="w-3 h-3" />
                    After Dark has more choices here →
                  </button>
                )}
                {isSameGender && !step8NoteDismissed && (
                  <div className="flex items-start gap-2 mt-2">
                    <p className="text-xs text-muted-foreground/50 italic flex-1">
                      Where tags use {protagonistP.subject.toLowerCase()} / {protagonistP.object}: {protagonistP.subject.toLowerCase()} = your character, {protagonistP.object} = your love interest.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep8NoteDismissed(true)}
                      className="text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors flex-shrink-0 mt-0.5"
                      aria-label="Dismiss note"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={next}
                className="text-xs text-muted-foreground hover:text-primary transition-colors whitespace-nowrap ml-4 mt-1 flex-shrink-0"
              >
                Skip →
              </button>
            </div>

            <StoryTagStudio
              selectedTags={customTags}
              onTagToggle={toggleTag}
              afterDark={afterDark}
              bedtime={bedtime}
              accentColor={accentColor}
              protagonistPronouns={rawProtagonistPronouns}
              partnerPronouns={rawPartnerPronouns}
              isSameGender={isSameGender}
              onAfterDark={!afterDark && onAfterDark ? () => {
                onAfterDark();
              } : undefined}
            />
          </motion.div>
        )}

        {/* ── Step 9 — Your Name ───────────────────────────────────── */}
        {step === 9 && (
          <motion.div key="step9" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Your name.</h2>
            <p className="text-muted-foreground text-sm mb-2">
              The narrator will call you by it. Choose from 6,000+ names — or skip and you'll be addressed as "you."
            </p>
            {!afterDark && onAfterDark && (
              <button
                type="button"
                onClick={onAfterDark}
                className="mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-[1.02]"
                style={{ background: "rgba(123,143,255,0.10)", border: "1px solid rgba(123,143,255,0.35)", color: "#9baeff" }}
              >
                <Moon className="w-3 h-3" />
                After Dark has more choices here →
              </button>
            )}
            <p className="text-xs text-muted-foreground/50 mb-5">
              This is you — the character you inhabit.{isSameGender ? ` Not ${partnerRoleLabel} — you'll name them next.` : ""}
            </p>

            {listenerName ? (
              <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-2xl border border-primary/40 bg-primary/8">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base font-semibold text-foreground flex-1">{listenerName}</span>
                <button
                  type="button"
                  onClick={() => { setListenerName(""); setListenerSearch(""); setTimeout(() => listenerInputRef.current?.focus(), 50); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={12} /> Change
                </button>
              </div>
            ) : (
              <div className="relative mb-6">
                {/* Skip reassurance — shown when no name is selected and not searching */}
                {!listenerSearch && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15">
                    <p className="text-xs text-foreground/70 leading-relaxed">
                      <span className="font-semibold text-primary/90">Skip and the experience is seamless.</span>{" "}
                      The narrator addresses you as "you" — which many listeners prefer. You won't miss a thing.
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 border border-border/40 rounded-xl px-4 py-3 bg-white/5 focus-within:border-primary/50 transition-colors">
                  <Search size={14} className="text-muted-foreground shrink-0" />
                  <input
                    ref={listenerInputRef}
                    type="text"
                    value={listenerSearch}
                    onChange={e => setListenerSearch(e.target.value)}
                    placeholder="Start typing your name…"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {listenerSearch && (
                    <button type="button" onClick={() => setListenerSearch("")}>
                      <X size={12} className="text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                {filteredListenerNames.length > 0 && (
                  <>
                    <p className="mt-3 mb-2 text-xs text-muted-foreground/60">Tap a name to select it</p>
                    <div className="flex flex-wrap gap-2">
                      {filteredListenerNames.map(name => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => { setListenerName(name); setListenerSearch(""); }}
                          className="px-4 py-2 rounded-full text-sm font-medium border border-primary/25 text-foreground bg-primary/5 hover:border-primary/60 hover:bg-primary/15 transition-all"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {listenerSearch.trim().length >= 1 && filteredListenerNames.length === 0 && (
                  <div className="mt-3 px-4 py-3 rounded-xl bg-card/60 border border-border/40">
                    <p className="text-sm font-semibold text-foreground mb-1">"{listenerSearch}" isn't in our library yet.</p>
                    <p className="text-xs text-muted-foreground/70 mb-3 leading-relaxed">
                      You can request it — we add names within 48 hours. Or continue now — skipping gives you a fully immersive experience.
                    </p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-all"
                    >
                      Request this name →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Step 10 — Partner Name ───────────────────────────────── */}
        {step === 10 && (
          <motion.div key="step10" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {isSameGender ? "Your love interest's name." : "Their name."}
            </h2>
            <p className="text-muted-foreground text-sm mb-2">
              Give them a name, or leave it — the narrator will choose one that suits them.
            </p>
            <p className="text-xs text-muted-foreground/50 mb-5">
              {isSameGender
                ? `This is ${partnerRoleLabel} — not you. Your name was the step before.`
                : `This is the ${rawPartnerPronouns === "she/her" ? "woman" : rawPartnerPronouns === "he/him" ? "man" : "person"} in your story.`}
            </p>

            {partnerName ? (
              <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-2xl border border-primary/40 bg-primary/8">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base font-semibold text-foreground flex-1">{partnerName}</span>
                <button
                  type="button"
                  onClick={() => { setPartnerName(""); setPartnerSearch(""); setTimeout(() => partnerInputRef.current?.focus(), 50); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={12} /> Change
                </button>
              </div>
            ) : (
              <div className="relative mb-6">
                {/* Skip reassurance — shown when no name is selected and not searching */}
                {!partnerSearch && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15">
                    <p className="text-xs text-foreground/70 leading-relaxed">
                      <span className="font-semibold text-primary/90">Skipping is completely fine.</span>{" "}
                      The narrator will choose a name that fits the character and tone — the story works beautifully either way.
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 border border-border/40 rounded-xl px-4 py-3 bg-white/5 focus-within:border-primary/50 transition-colors">
                  <Search size={14} className="text-muted-foreground shrink-0" />
                  <input
                    ref={partnerInputRef}
                    type="text"
                    value={partnerSearch}
                    onChange={e => setPartnerSearch(e.target.value)}
                    placeholder="Start typing their name…"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {partnerSearch && (
                    <button type="button" onClick={() => setPartnerSearch("")}>
                      <X size={12} className="text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                {filteredPartnerNames.length > 0 && (
                  <>
                    <p className="mt-3 mb-2 text-xs text-muted-foreground/60">Tap a name to select it</p>
                    <div className="flex flex-wrap gap-2">
                      {filteredPartnerNames.map(name => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => { setPartnerName(name); setPartnerSearch(""); }}
                          className="px-4 py-2 rounded-full text-sm font-medium border border-primary/25 text-foreground bg-primary/5 hover:border-primary/60 hover:bg-primary/15 transition-all"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {partnerSearch.trim().length >= 1 && filteredPartnerNames.length === 0 && (
                  <div className="mt-3 px-4 py-3 rounded-xl bg-card/60 border border-border/40">
                    <p className="text-sm font-semibold text-foreground mb-1">"{partnerSearch}" isn't in our library yet.</p>
                    <p className="text-xs text-muted-foreground/70 mb-3 leading-relaxed">
                      You can request it — we add names within 48 hours. Or continue now — the narrator will choose a name that fits perfectly.
                    </p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-all"
                    >
                      Request this name →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {step === 11 && (
          <motion.div key="step11" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Voice</h2>
            <p className="text-muted-foreground text-sm mb-1">
              Choose who tells your story.
            </p>
            <p className="text-xs text-muted-foreground/50 mb-6">
              Most people start with Eleanor for their first story.
            </p>

            {(() => {
              const voicesToShow = getVoicesForPairing(data.pairing);
              const renderVoiceCard = (voice: typeof VOICES[0]) => {
                const isSelected = voiceId === voice.id;
                const displayTitle = voice.displayName
                  ? `${voice.displayName} — ${voice.label}`
                  : voice.label;
                return (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => setVoiceId(voice.id)}
                    className={`w-full p-4 rounded-2xl transition-all text-left ${
                      isSelected
                        ? "border-2 border-primary bg-gradient-to-b from-primary/20 to-primary/5 shadow-[0_0_32px_rgba(201,162,39,0.25),inset_0_1px_0_rgba(201,162,39,0.15)]"
                        : "border-2 border-border/30 bg-card/40 hover:border-primary/50 hover:bg-card/60"
                    }`}
                    style={isSelected ? { transitionDuration: "150ms", transitionTimingFunction: "ease" } : {}}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground leading-tight">{displayTitle}</span>
                            {voice.recommended && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold tracking-wide uppercase">
                                Recommended
                              </span>
                            )}
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />}
                        </div>
                        <span className="text-[11px] text-muted-foreground/60 font-medium tracking-wide">{voice.accentLabel || voice.accent}</span>
                        {voice.presence && (
                          <p className="text-xs text-muted-foreground/65 mt-1 leading-snug">{voice.presence}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <VoiceAvatar voiceId={voice.id} size="md" />
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{voice.desc}</p>

                    {voice.bestFor && (
                      <div className="mb-4 pt-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-primary/60 mb-1.5">Best for this mood</p>
                        <p className="text-[11px] text-primary/75 font-medium leading-relaxed">{voice.bestFor}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-black/30 border border-white/5 flex items-center justify-center">
                        <VoiceAvatar voiceId={voice.id} size="md" />
                      </div>
                      <div className="flex-1">
                        <VoiceSamplePlayer
                          src={`${API_BASE}/api/voice-samples/${voice.id}`}
                        />
                      </div>
                    </div>
                  </button>
                );
              };
              return (
                <div className="space-y-4">
                  {voicesToShow.map(renderVoiceCard)}
                </div>
              );
            })()}

            {/* ── Your cast at a glance ── */}
            <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/[0.03] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">Your cast at a glance</p>
              <div className="space-y-0">
                {([
                  { label: "Chemistry",   value: chemistries.find(c => c.id === data.chemistry)?.label,                                                      goTo: 1,  fallback: "—" },
                  { label: "Heritage",    value: data.heritage && data.heritage !== "Ambiguous" ? data.heritage : undefined,                                  goTo: 3,  fallback: "Ambiguous" },
                  { label: "Archetype",   value: data.archetype,                                                                                              goTo: 3,  fallback: "—" },
                  { label: "Setting",     value: data.setting,                                                                                                goTo: 5,  fallback: "—" },
                  { label: "Intensity",   value: data.intensity,                                                                                              goTo: 6,  fallback: "—" },
                  { label: "Situation",   value: data.situation,                                                                                              goTo: 7,  fallback: "We'll choose for you" },
                  { label: "Your name",   value: listenerName || undefined,                                                                                   goTo: 9,  fallback: "Addressed as 'you'" },
                  { label: "Their name",  value: partnerName || undefined,                                                                                    goTo: 10, fallback: "Narrator will choose" },
                  { label: "Voice",       value: (() => { const v = VOICES.find(v => v.id === voiceId); return v ? (v.displayName || v.label) : undefined; })(), goTo: 11, fallback: "—" },
                ] as { label: string; value: string | undefined; goTo: number; fallback: string }[]).map(({ label, value, goTo, fallback }) => (
                  <div key={label} className="flex items-center justify-between gap-3 py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-[11px] text-muted-foreground/50 w-24 flex-shrink-0 uppercase tracking-wide font-medium">{label}</span>
                    <span className={`text-sm flex-1 leading-snug ${value ? "text-foreground font-medium" : "text-muted-foreground/35 italic"}`}>
                      {value || fallback}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(goTo)}
                      className="text-[11px] text-muted-foreground/40 hover:text-primary transition-colors flex-shrink-0 font-medium"
                    >
                      Change
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* Navigation — always above dropdown panels (z-[60] > z-50) */}
      <div className="mt-8 flex gap-3 relative z-[60]">
        {step > 0 && (
          <button
            onClick={back}
            className="flex items-center justify-center gap-1.5 px-5 py-4 rounded-2xl font-semibold text-sm border border-border/40 text-muted-foreground hover:text-foreground hover:border-border/70 transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={next}
            disabled={!canProceed()}
            className={`flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              canProceed()
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 shadow-glow"
                : "bg-card/40 text-muted-foreground cursor-not-allowed border border-border/30"
            }`}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 shadow-glow"
            style={afterDark ? { background: "linear-gradient(135deg, #c0392b, #922b21)", boxShadow: "0 0 30px rgba(192,57,43,0.3)" } : {}}
          >
            <Sparkles className="w-5 h-5" />
            Write My Story
          </button>
        )}
      </div>
    </div>
  );
}
