import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Sparkles, ArrowLeft } from "lucide-react";
import { StoryTagStudio } from "./StoryTagStudio";
import { NamePicker } from "./NamePicker";

export interface CastingRoomResult {
  perspective: "her" | "his" | "your";
  pairing?: string;
  heritage: string;
  archetype: string;
  chemistry: string;
  country?: string;
  city?: string;
  setting: string;
  atmosphere: string;
  intensity: "Tender" | "Heated" | "Explicit" | "Scorching";
  mood: string;
  scenarioPrompt: string;
  whoIsHe: string;
  dynamic: string;
  storyMode: string;
  customTags?: string[];
  partnerAppearance?: string;
}

interface Props {
  onComplete: (result: CastingRoomResult) => void;
  onSkip: () => void;
  afterDark?: boolean;
}

/* ── Abstract art tiles ───────────────────────────────────────────── */
function ArtTile({ gradient, accent, children, selected, onClick }: {
  gradient: string; accent: string; children: React.ReactNode;
  selected?: boolean; onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden rounded-2xl border transition-all w-full text-left ${
        selected
          ? "border-primary shadow-glow ring-1 ring-primary/40"
          : "border-white/10 hover:border-primary/40"
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <motion.div
        animate={{ opacity: selected ? [0.4, 0.7, 0.4] : [0.2, 0.35, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 60% 40%, ${accent}30 0%, transparent 60%)` }}
      />
      <div className="relative z-10 p-4">
        {children}
      </div>
    </motion.button>
  );
}

/* ── Step data ────────────────────────────────────────────────────── */
const PERSPECTIVES = [
  { id: "her" as const, label: "Her Story", sub: "She feels it. She decides.", gradient: "from-[#1a0810] via-[#2a1020] to-[#120508]", accent: "#e879a0" },
  { id: "your" as const, label: "Your Story", sub: "You're the one in this world.", gradient: "from-[#100d00] via-[#1e1900] to-[#0c0a00]", accent: "#c9a227" },
  { id: "his" as const, label: "His Story", sub: "Follow him. Feel everything.", gradient: "from-[#050a1a] via-[#0a1428] to-[#030810]", accent: "#6b8cce" },
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
  gradient: string; accent: string;
}

function buildChemistries(pairingId: string | undefined): ChemistryOption[] {
  const { partner: P, protagonist: ME } = derivePronouns(pairingId);
  return [
    {
      id: `${P.subject} Takes Charge`,
      label: `${conjugateTakes(P.subject)} Charge`,
      sub: `${P.subject} knows what ${P.possessive} wanting. Patient. Inevitable.`,
      dynamic: "They pursue, I decide",
      gradient: "from-[#100800] via-[#201000] to-[#080500]", accent: "#c9a227",
    },
    {
      id: "Equal Tension",
      label: "Equal Tension",
      sub: "Neither one yields. That's the whole story.",
      dynamic: "Equal desire, equal intensity",
      gradient: "from-[#080010] via-[#100020] to-[#040008]", accent: "#818cf8",
    },
    {
      id: `${ME.subject} Leads`,
      label: `${conjugateLeads(ME.subject)}`,
      sub: `${ME.subject} decides the pace. ${P.subject} stays exactly where ${P.subject === "They" ? "they're" : `${P.subject.toLowerCase()}'s`} told.`,
      dynamic: "I take what I want",
      gradient: "from-[#180010] via-[#280020] to-[#100008]", accent: "#f472b6",
    },
    {
      id: "Push & Pull",
      label: "Push & Pull",
      sub: `Back and forth. Who ${conjugateBreaks(P.subject)} first?`,
      dynamic: "Equal desire, equal intensity",
      gradient: "from-[#100000] via-[#200000] to-[#080000]", accent: "#fb923c",
    },
    {
      id: "Slow Surrender",
      label: "Slow Surrender",
      sub: "Resistance is part of the pleasure. It always was.",
      dynamic: "They pursue, I decide",
      gradient: "from-[#000a10] via-[#001420] to-[#000508]", accent: "#38bdf8",
    },
    {
      id: "Power Play",
      label: "Power Play",
      sub: `${P.subject} holds the advantage. Tonight ${P.subject === "They" ? "they use it" : `${P.possessive} using it`}.`,
      dynamic: "Dominant and yielding",
      gradient: "from-[#0a0000] via-[#140000] to-[#050000]", accent: "#dc2626",
    },
    {
      id: "Forbidden Pull",
      label: "Forbidden Pull",
      sub: "They shouldn't. They've been trying not to. They can't stop.",
      dynamic: "Forbidden desire",
      gradient: "from-[#08000a] via-[#120014] to-[#040008]", accent: "#9333ea",
    },
    {
      id: "Worship",
      label: "Worship",
      sub: `${P.subject} makes ${ME.object} feel like the only thing in the room. The world.`,
      dynamic: "Adoration and surrender",
      gradient: "from-[#001010] via-[#001e1e] to-[#000a0a]", accent: "#2dd4bf",
    },
    {
      id: "Rivals",
      label: "Rivals",
      sub: "They've always been at each other's throats. This is what that was.",
      dynamic: "Equal desire, equal intensity",
      gradient: "from-[#0a0800] via-[#121000] to-[#050600]", accent: "#84cc16",
    },
  ];
}

const HERITAGES = [
  { id: "Latina", label: "Latina", sub: "Warm, magnetic, fire beneath calm", gradient: "from-[#1a0800] via-[#2e1200] to-[#120600]", accent: "#e07840" },
  { id: "Black", label: "Black", sub: "Radiant, commanding presence", gradient: "from-[#0a0510] via-[#160a20] to-[#080310]", accent: "#c084fc" },
  { id: "South Asian", label: "South Asian", sub: "Layered beauty, quiet intensity", gradient: "from-[#0e0a00] via-[#1e1400] to-[#0a0800]", accent: "#fbbf24" },
  { id: "European", label: "European", sub: "Refined edges, complicated wanting", gradient: "from-[#040814] via-[#081220] to-[#02060e]", accent: "#94a3b8" },
  { id: "East Asian", label: "East Asian", sub: "Elegant, precise, quietly devastating", gradient: "from-[#001414] via-[#001e1e] to-[#000f0f]", accent: "#2dd4bf" },
  { id: "Middle Eastern", label: "Middle Eastern", sub: "Striking depth, magnetic gravity", gradient: "from-[#0a0600] via-[#160e00] to-[#060400]", accent: "#f59e0b" },
  { id: "Indigenous", label: "Indigenous", sub: "Rooted, fierce, unapologetically present", gradient: "from-[#060e02] via-[#0e1a04] to-[#030800]", accent: "#86efac" },
  { id: "Ambiguous", label: "Ambiguous", sub: "Leave it open. Let imagination fill it.", gradient: "from-[#0a0a0a] via-[#141414] to-[#060606]", accent: "#9ca3af" },
];

/* ── Archetypes — pronoun-aware, 14 options ───────────────────────── */
function buildArchetypes(pairingId: string | undefined) {
  const { partner: P } = derivePronouns(pairingId);
  const s = P.subject; const o = P.object; const p = P.possessive;
  return [
    { id: "The Executive",    label: "The Executive",    sub: `Measured control. Understated power. ${s} never raises ${p} voice.`,                      gradient: "from-[#0a0800] via-[#181200] to-[#060500]", accent: "#c9a227" },
    { id: "The Stranger",     label: "The Stranger",     sub: `No backstory. No promises. Only this moment.`,                                               gradient: "from-[#040408] via-[#080810] to-[#020206]", accent: "#6b7280" },
    { id: "The Artist",       label: "The Artist",       sub: `${s} sees everything. Says very little. That's what makes ${o} dangerous.`,                  gradient: "from-[#0a0010] via-[#140020] to-[#080008]", accent: "#a78bfa" },
    { id: "The Protector",    label: "The Protector",    sub: `Steady, watchful. There's one thing that undoes ${o} completely.`,                            gradient: "from-[#001000] via-[#001a00] to-[#000a00]", accent: "#34d399" },
    { id: "The Bad One",      label: "The Bad One",      sub: `Dangerous to want. Impossible not to. ${s} knows it.`,                                        gradient: "from-[#150000] via-[#250000] to-[#0f0000]", accent: "#ef4444" },
    { id: "The Professor",    label: "The Professor",    sub: `Brilliant, reserved. ${s} comes apart slowly, then all at once.`,                             gradient: "from-[#000810] via-[#001020] to-[#000408]", accent: "#60a5fa" },
    { id: "The Wanderer",     label: "The Wanderer",     sub: `${s} doesn't stay. That's exactly what makes this hurt.`,                                    gradient: "from-[#080004] via-[#10000a] to-[#040002]", accent: "#fb7185" },
    { id: "The Old Friend",   label: "The Old Friend",   sub: `Years of knowing each other. Tonight something finally breaks.`,                              gradient: "from-[#000810] via-[#000c18] to-[#000408]", accent: "#fcd34d" },
    { id: "The Detective",    label: "The Detective",    sub: `${s} notices everything. Nothing slips past ${o}. That attention has a cost.`,                gradient: "from-[#040808] via-[#081010] to-[#020404]", accent: "#67e8f9" },
    { id: "The Doctor",       label: "The Doctor",       sub: `Clinical precision. Unshakeable calm. Until ${s} isn't.`,                                    gradient: "from-[#00080a] via-[#000c10] to-[#000406]", accent: "#a3e635" },
    { id: "The Musician",     label: "The Musician",     sub: `${s} plays like ${s.toLowerCase()} already knows how this ends. ${s} might.`,                 gradient: "from-[#0a0002] via-[#140004] to-[#050001]", accent: "#f9a8d4" },
    { id: "The Athlete",      label: "The Athlete",      sub: `Physical command. Total focus. That discipline doesn't stop here.`,                           gradient: "from-[#001400] via-[#002000] to-[#000c00]", accent: "#4ade80" },
    { id: "The Chef",         label: "The Chef",         sub: `${s} works with ${p} hands. Takes pride in making something perfect.`,                        gradient: "from-[#080400] via-[#0e0800] to-[#040200]", accent: "#fb923c" },
    { id: "The Soldier",      label: "The Soldier",      sub: `Discipline runs through ${o}. So does something much harder to control.`,                    gradient: "from-[#040600] via-[#080c00] to-[#020300]", accent: "#bef264" },
  ];
}

/* ── Settings — tile data ─────────────────────────────────────────── */
const CONTEMPORARY_SETTINGS = [
  { id: "Late Night City",          label: "Late Night City",          sub: "Streets wet, lights low, anything goes",           gradient: "from-[#02050e] via-[#040a18] to-[#010308]", accent: "#6b8cce" },
  { id: "Luxury Hotel",             label: "Luxury Hotel",             sub: "A room for one night only",                        gradient: "from-[#100d00] via-[#1e1900] to-[#0a0800]", accent: "#c9a227" },
  { id: "European Villa",           label: "European Villa",           sub: "Heat, terraces, and no schedule",                  gradient: "from-[#0a0500] via-[#180c00] to-[#060300]", accent: "#d97706" },
  { id: "Private Yacht",            label: "Private Yacht",            sub: "Open water. No escape. No reason to leave",        gradient: "from-[#001220] via-[#001e35] to-[#000a14]", accent: "#0ea5e9" },
  { id: "Mountain Retreat",         label: "Mountain Retreat",         sub: "Snowbound. Firelit. Nowhere else to be",           gradient: "from-[#060e06] via-[#0c160c] to-[#040804]", accent: "#4ade80" },
  { id: "Penthouse Suite",          label: "Penthouse Suite",          sub: "City below. Nothing between you and glass",        gradient: "from-[#060408] via-[#0e0812] to-[#030204]", accent: "#c084fc" },
  { id: "Art Gallery After Hours",  label: "Art Gallery After Hours",  sub: "Empty rooms. Something priceless at stake",        gradient: "from-[#04080a] via-[#080e12] to-[#020406]", accent: "#94a3b8" },
  { id: "Office After Hours",       label: "Office After Hours",       sub: "Everyone else has gone. The door is locked.",      gradient: "from-[#060406] via-[#0c080c] to-[#030203]", accent: "#818cf8" },
  { id: "Rooftop Bar",              label: "Rooftop Bar",              sub: "City spread out below. Drinks. A decision.",       gradient: "from-[#050208] via-[#0a040e] to-[#030104]", accent: "#e879a0" },
  { id: "Beach House",              label: "Beach House",              sub: "Salt air. No phone signal. Nowhere to hide.",      gradient: "from-[#001018] via-[#001c28] to-[#000810]", accent: "#38bdf8" },
  { id: "Private Members Club",     label: "Private Members Club",     sub: "Velvet booths. Whispered conversations. Power.",   gradient: "from-[#0a0800] via-[#160e00] to-[#060500]", accent: "#fcd34d" },
  { id: "Orient Express Style",     label: "Orient Express Style",     sub: "Moving through the night. No way off until dawn.", gradient: "from-[#080506] via-[#100a0c] to-[#040304]", accent: "#fb923c" },
  { id: "Concert Backstage",        label: "Concert Backstage",        sub: "The adrenaline hasn't faded. Neither have they.",  gradient: "from-[#050008] via-[#090010] to-[#030005]", accent: "#d946ef" },
  { id: "Ski Chalet",               label: "Ski Chalet",               sub: "Snowstorm outside. Nowhere to go until morning.",  gradient: "from-[#030812] via-[#060e1c] to-[#020509]", accent: "#7dd3fc" },
  { id: "Private Estate",           label: "Private Estate",           sub: "Countryside house. Acres. Locked gates.",         gradient: "from-[#040a04] via-[#081208] to-[#020502]", accent: "#86efac" },
  { id: "Casino High-Stakes Room",  label: "Casino — High Stakes",     sub: "Chips down. Everyone's watching. Except them.",    gradient: "from-[#0a0800] via-[#181200] to-[#050400]", accent: "#fbbf24" },
];

const HISTORICAL_SETTINGS = [
  { id: "Regency England (1810s)",    label: "Regency England",       sub: "1810s — letters never sent, country house urgency",  gradient: "from-[#0a0600] via-[#160e00] to-[#060400]", accent: "#fcd34d" },
  { id: "Victorian London (1880s)",   label: "Victorian London",      sub: "1880s — fog, corsets, what's unspeakable and felt",  gradient: "from-[#040408] via-[#0a0a10] to-[#020206]", accent: "#9ca3af" },
  { id: "Belle Époque Paris (1900s)", label: "Belle Époque Paris",    sub: "1900s — absinthe, salons, decadent evenings",        gradient: "from-[#080400] via-[#140800] to-[#040200]", accent: "#f59e0b" },
  { id: "Roaring Twenties (1920s)",   label: "Roaring Twenties",      sub: "1920s — speakeasies, jazz, smoke and consequence",   gradient: "from-[#080004] via-[#12000a] to-[#040002]", accent: "#f472b6" },
  { id: "Wartime (1940s)",            label: "Wartime",               sub: "1940s — last night together, everything at stake",   gradient: "from-[#050802] via-[#0a1004] to-[#020400]", accent: "#86efac" },
  { id: "Swinging Sixties (1960s)",   label: "Swinging Sixties",      sub: "1960s — revolution, hotel rooms, free desire",       gradient: "from-[#000a10] via-[#001020] to-[#000408]", accent: "#38bdf8" },
  { id: "Disco & Velvet (1970s)",     label: "Disco & Velvet",        sub: "1970s — heat, mirror balls, all night long",         gradient: "from-[#100010] via-[#200020] to-[#080008]", accent: "#e879a0" },
  { id: "Neon Decade (1980s)",        label: "Neon Decade",           sub: "1980s — excess, power, after hours at the top",      gradient: "from-[#060010] via-[#0c0020] to-[#030008]", accent: "#818cf8" },
  { id: "Ancient Mediterranean",     label: "Ancient Mediterranean",  sub: "Marble, olives, conquest, and the gods watching",   gradient: "from-[#0a0800] via-[#181400] to-[#050600]", accent: "#fbbf24" },
  { id: "Renaissance Italy",         label: "Renaissance Italy",      sub: "Florence, 1490s — art, ambition, private chambers",  gradient: "from-[#0c0600] via-[#1a0e00] to-[#060300]", accent: "#f59e0b" },
  { id: "Feudal Japan",              label: "Feudal Japan",           sub: "Silk screens, silence, honour at risk",              gradient: "from-[#080010] via-[#10001a] to-[#040008]", accent: "#c084fc" },
  { id: "Georgian Scotland",         label: "Georgian Scotland",      sub: "Highland estate, candlelight, a storm coming",       gradient: "from-[#020a04] via-[#041208] to-[#010502]", accent: "#6ee7b7" },
];

const AFTER_DARK_SETTINGS = [
  { id: "Private Club",          label: "Private Club",             sub: "Invitation only. No cameras.",                       gradient: "from-[#0e0002] via-[#1a0004] to-[#080002]", accent: "#fb7185" },
  { id: "VIP Suite",             label: "VIP Suite",                sub: "No names. No history. No morning.",                  gradient: "from-[#0a0002] via-[#180004] to-[#060001]", accent: "#f43f5e" },
  { id: "The Back Room",         label: "The Back Room",            sub: "Velvet curtains. Low light. No questions.",           gradient: "from-[#0c0004] via-[#180008] to-[#060002]", accent: "#e11d48" },
  { id: "Moving Elevator",       label: "Moving Elevator",          sub: "Thirty floors of anticipation.",                     gradient: "from-[#08000a] via-[#130010] to-[#040005]", accent: "#c026d3" },
  { id: "Private Cinema",        label: "Private Cinema",           sub: "The film is not what they're watching.",             gradient: "from-[#080004] via-[#120008] to-[#040002]", accent: "#dc2626" },
  { id: "Hotel Balcony",         label: "Hotel Balcony",            sub: "Floor above the party. No one can see them.",        gradient: "from-[#06000a] via-[#0e0012] to-[#030005]", accent: "#9333ea" },
  { id: "Dressing Room",         label: "Dressing Room",            sub: "After the show ends. The adrenaline hasn't.",        gradient: "from-[#0a0002] via-[#160004] to-[#050001]", accent: "#e11d48" },
  { id: "Locked Room",           label: "Locked Room",              sub: "House full of people. Only they know.",              gradient: "from-[#0c0003] via-[#1a0005] to-[#060002]", accent: "#f43f5e" },
  { id: "Rooftop 3am",           label: "Rooftop, 3am",             sub: "City below. No witnesses.",                          gradient: "from-[#02020a] via-[#04041a] to-[#010108]", accent: "#6366f1" },
  { id: "First-Class Cabin",     label: "First-Class Cabin",        sub: "Overnight. No names. Nowhere to go.",                gradient: "from-[#02050a] via-[#040a16] to-[#010306]", accent: "#3b82f6" },
  { id: "The Glass House",       label: "The Glass House",          sub: "Floor-to-ceiling windows. No curtains.",             gradient: "from-[#04080a] via-[#080e14] to-[#020406]", accent: "#0ea5e9" },
  { id: "Yacht Cabin",           label: "Yacht Cabin",              sub: "Open water. No escape. No reason to want one.",      gradient: "from-[#001018] via-[#001a26] to-[#000810]", accent: "#38bdf8" },
  { id: "Penthouse Pool",        label: "Penthouse Pool",           sub: "Midnight. No neighbours. No one coming.",            gradient: "from-[#020010] via-[#04001e] to-[#010008]", accent: "#a855f7" },
  { id: "Private Spa Suite",     label: "Private Spa Suite",        sub: "Late booking. No other guests.",                     gradient: "from-[#080008] via-[#100012] to-[#040006]", accent: "#c084fc" },
];

/* ── Country / City data ──────────────────────────────────────────── */
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

const ATMOSPHERES = [
  "Stormy", "Candlelit", "Midnight", "Golden Hour",
  "Rain", "Sun-Soaked", "Foggy", "Firelit", "Electric", "Languid",
];

const INTENSITIES: { id: CastingRoomResult["intensity"]; label: string; desc: string; color: string }[] = [
  { id: "Tender",    label: "Tender",    desc: "Emotional, slow burn",     color: "#60a5fa" },
  { id: "Heated",    label: "Heated",    desc: "Desire building, charged", color: "#c9a227" },
  { id: "Explicit",  label: "Explicit",  desc: "Fully rendered",           color: "#f97316" },
  { id: "Scorching", label: "Scorching", desc: "Maximum intensity",        color: "#ef4444" },
];

const MOODS = [
  "Romantic", "Emotional", "Raw", "Playful", "Dark",
  "Nostalgic", "Urgent", "Possessive", "Electric", "Bittersweet",
  "Forbidden", "Vulnerable", "Healing", "Complicated", "Obsessive",
  "Desperate", "Fevered", "Wicked", "Decadent", "Dangerous",
  "Hungry", "Savage", "Aching", "Burning", "Shameless",
  "Breathless", "Primal", "Reckless",
];

/* ── Appearance options (pronoun-aware) ───────────────────────────── */
const BUILD_OPTIONS = ["Lean", "Athletic", "Broad", "Muscular", "Tall & lean", "Stocky", "Slight"];
const HEIGHT_OPTIONS = ["Tall", "Very tall", "Average height", "Shorter than me"];
const COLOURING_OPTIONS = ["Dark", "Olive", "Fair", "Tanned", "Deep brown", "Medium brown"];
const EYE_OPTIONS = ["Dark brown", "Light brown", "Green", "Blue", "Grey", "Hazel", "Deep black"];

function buildFeatureOptions(partnerPronouns: string): string[] {
  if (partnerPronouns === "she/her") {
    return [
      "Long lashes", "Full lips", "High cheekbones", "Sharp features",
      "Delicate features", "Natural glow", "Freckles", "Dimples",
      "Elegant hands", "Tattoos", "A scar", "Piercing eyes",
      "Long hair", "Short hair", "Curls", "Soft curls",
    ];
  }
  if (partnerPronouns === "they/them") {
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

const CASTING_API_BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

/* ── Main component ───────────────────────────────────────────────── */
export function CastingRoom({ onComplete, onSkip, afterDark = false }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<CastingRoomResult>>({
    perspective: "her",
    intensity: afterDark ? "Explicit" : "Heated",
    mood: "Emotional",
  });
  // Local name state — used for UI display only.
  // On "Next", names are submitted to POST /api/me/name-submissions for admin review.
  // Only admin-approved names reach generation via req.user (never from the request body).
  const [listenerName, setListenerName] = useState<string>("");
  const [partnerName, setPartnerName] = useState<string>("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  // Appearance
  const [appearBuild, setAppearBuild] = useState<string>("");
  const [appearHeight, setAppearHeight] = useState<string>("");
  const [appearColouring, setAppearColouring] = useState<string>("");
  const [appearEyes, setAppearEyes] = useState<string>("");
  const [appearFeatures, setAppearFeatures] = useState<string[]>([]);

  const TOTAL_STEPS = 9;

  const update = (key: keyof CastingRoomResult, value: string) => {
    setData(d => ({ ...d, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    setCustomTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  // Submit custom names for admin review before advancing from name steps.
  // Fire-and-forget — only admin-approved names are written to the user profile.
  const handleNext = () => {
    if (step === 2 && listenerName.trim()) {
      fetch(`${CASTING_API_BASE}/api/me/name-submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: listenerName.trim(), nameType: "listener" }),
      }).catch(() => {});
    }
    if (step === 3 && partnerName.trim()) {
      fetch(`${CASTING_API_BASE}/api/me/name-submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: partnerName.trim(), nameType: "partner" }),
      }).catch(() => {});
    }
    next();
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!data.pairing;
      case 1: return !!data.chemistry;
      case 2: return true;
      case 3: return true;
      case 4: return !!data.perspective;
      case 5: return !!data.heritage && !!data.archetype;
      case 6: return !!data.setting;
      case 7: return !!data.intensity && !!data.mood;
      case 8: return true;
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
    const name       = partnerName.trim();

    const whoIsHe = archetype;
    const dynamic = chemistryCfg?.dynamic ?? "";

    // Natural, respectful heritage phrasing with gendered noun from pairing pronouns
    const partnerPronouns = pairingCfg?.partnerPronouns ?? "he/him";
    const genderedNoun    = getGenderedNoun(partnerPronouns);
    const heritagePhrase  = (() => {
      if (!heritage) return "";
      if (heritage === "Ambiguous") {
        const energyClause = archetype ? ` who carries the presence of ${archetype}` : "";
        return `The love interest is someone${energyClause}. Write them as genuinely, specifically attractive — not reliant on stereotypes or clichés.`;
      }
      const energyClause = archetype ? ` who carries the presence of ${archetype}` : "";
      return `The love interest is a ${heritage} ${genderedNoun}${energyClause}. Write them as genuinely, specifically attractive — not reliant on stereotypes or clichés.`;
    })();

    const locationPhrase = (() => {
      if (city && country) return `The story takes place in ${city}, ${country}.`;
      if (city) return `The story takes place in ${city}.`;
      if (country) return `The story takes place in ${country}.`;
      return "";
    })();

    const fullScenario = [
      pairingCfg ? `This is a ${pairingCfg.id} story. Protagonist pronouns: ${pairingCfg.protagonistPronouns}. Love interest pronouns: ${pairingCfg.partnerPronouns}.` : "",
      heritagePhrase,
      locationPhrase,
      setting ? `The physical setting is ${setting}${atmosphere ? `, with a ${atmosphere.toLowerCase()} atmosphere` : ""}.` : "",
      data.chemistry ? `The dynamic between them: ${data.chemistry}.` : "",
    ].filter(Boolean).join(" ");

    // Build appearance description if any fields are set
    const appearParts: string[] = [];
    if (appearBuild) appearParts.push(`Build: ${appearBuild}`);
    if (appearHeight) appearParts.push(`Height: ${appearHeight}`);
    if (appearColouring) appearParts.push(`Colouring: ${appearColouring}`);
    if (appearEyes) appearParts.push(`Eyes: ${appearEyes}`);
    if (appearFeatures.length > 0) appearParts.push(`Distinguishing features: ${appearFeatures.join(", ")}`);
    const partnerAppearance = appearParts.length > 0 ? appearParts.join(". ") : undefined;

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
      intensity: data.intensity ?? "Heated",
      mood: data.mood ?? "Emotional",
      scenarioPrompt: fullScenario,
      whoIsHe,
      dynamic,
      storyMode: afterDark ? "unrestrained" : (data.intensity === "Tender" || data.intensity === "Heated" ? "passionate" : "unrestrained"),
      customTags,
      partnerAppearance,
    };
    onComplete(result);
  };

  const accentColor = afterDark ? "#c0392b" : "#c9a227";

  const { partner: partnerP, protagonist: protagonistP } = derivePronouns(data.pairing);
  const activePairing = PAIRINGS.find(p => p.id === data.pairing);
  const rawPartnerPronouns    = activePairing?.partnerPronouns    ?? "he/him";
  const rawProtagonistPronouns = activePairing?.protagonistPronouns ?? "she/her";
  const partnerHeadingVerb = partnerP.subject === "They" ? "Who are they?" : `Who is ${partnerP.object}?`;
  const chemistries = buildChemistries(data.pairing);
  const archetypes  = buildArchetypes(data.pairing);

  const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
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
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Use classic form →
          </button>
        </div>

        <StepBar current={step} total={TOTAL_STEPS} />

        <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: accentColor }}>
          {afterDark ? "After Dark" : "The Casting Room"} · Step {step + 1} of {TOTAL_STEPS}
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Step 0 — Pairing ─────────────────────────────────────── */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Who's in the story?</h2>
            <p className="text-muted-foreground text-sm mb-6">Choose the pairing — this shapes everything that follows.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PAIRINGS.map(p => (
                <ArtTile key={p.id} gradient={p.gradient} accent={p.accent} selected={data.pairing === p.id} onClick={() => update("pairing", p.id)}>
                  <p className="font-semibold text-white text-base">{p.label}</p>
                  <p className="text-white/60 text-sm mt-0.5">{p.sub}</p>
                </ArtTile>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Step 1 — Chemistry / Dynamic ─────────────────────────── */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Between {protagonistP.object} and {partnerP.object}.
            </h2>
            <p className="text-muted-foreground text-sm mb-6">How does the power sit? Who moves first?</p>
            <div className="grid gap-3">
              {chemistries.map(c => (
                <ArtTile key={c.id} gradient={c.gradient} accent={c.accent} selected={data.chemistry === c.id} onClick={() => update("chemistry", c.id)}>
                  <p className="font-semibold text-white text-base">{c.label}</p>
                  <p className="text-white/60 text-sm mt-0.5">{c.sub}</p>
                </ArtTile>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Step 2 — Your name ───────────────────────────────────── */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Your name</h2>
            <p className="text-muted-foreground text-sm mb-6">
              We'll weave it into the story — so it feels like it was written just for you.
            </p>
            <NamePicker
              value={listenerName}
              onChange={setListenerName}
              placeholder="Your name…"
            />
            <p className="text-xs text-muted-foreground mt-3">Optional — skip ahead if you prefer.</p>
          </motion.div>
        )}

        {/* ── Step 3 — Their name ──────────────────────────────────── */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Their name</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Add a name for your love interest, or leave it blank — they'll be unforgettable either way.
            </p>
            <NamePicker
              value={partnerName}
              onChange={setPartnerName}
              placeholder="Their name…"
            />
            <p className="text-xs text-muted-foreground mt-3">Leave blank and they'll simply remain nameless.</p>
          </motion.div>
        )}

        {/* ── Step 4 — Perspective ─────────────────────────────────── */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Whose story?</h2>
            <p className="text-muted-foreground text-sm mb-6">Choose who the story follows.</p>
            <div className="grid gap-3">
              {PERSPECTIVES.map(p => (
                <ArtTile key={p.id} gradient={p.gradient} accent={p.accent} selected={data.perspective === p.id} onClick={() => update("perspective", p.id)}>
                  <p className="font-semibold text-white text-base">{p.label}</p>
                  <p className="text-white/60 text-sm mt-0.5">{p.sub}</p>
                </ArtTile>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Step 5 — Character ───────────────────────────────────── */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">{partnerHeadingVerb}</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Choose {partnerP.possessive} heritage and the energy {partnerP.subject === "They" ? "they bring" : `${partnerP.subject.toLowerCase()} brings`}.
            </p>

            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">Heritage</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {HERITAGES.map(h => (
                <ArtTile key={h.id} gradient={h.gradient} accent={h.accent} selected={data.heritage === h.id} onClick={() => update("heritage", h.id)}>
                  <p className="font-semibold text-white text-base">{h.label}</p>
                  <p className="text-white/60 text-sm mt-0.5 leading-snug">{h.sub}</p>
                </ArtTile>
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">
              {capFirst(partnerP.possessive)} Energy
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {archetypes.map(a => (
                <ArtTile
                  key={a.id}
                  gradient={a.gradient}
                  accent={a.accent}
                  selected={data.archetype === a.id}
                  onClick={() => update("archetype", a.id)}
                >
                  <p className="font-semibold text-white text-base">{a.label}</p>
                  <p className="text-white/60 text-sm mt-0.5 leading-snug">{a.sub}</p>
                </ArtTile>
              ))}
            </div>

            {/* ── Appearance (all optional) ─────────────────────── */}
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-1">
              {capFirst(partnerP.possessive)} Appearance{" "}
              <span className="font-normal text-muted-foreground normal-case tracking-normal">(optional)</span>
            </p>
            <p className="text-xs text-muted-foreground mb-4">Describe how they look — as much or as little as you want.</p>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Build</p>
                <div className="flex flex-wrap gap-1.5">
                  {BUILD_OPTIONS.map(opt => (
                    <button key={opt} type="button"
                      onClick={() => setAppearBuild(prev => prev === opt ? "" : opt)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${
                        appearBuild === opt ? "border-primary/60 bg-primary/15 text-primary" : "border-border/30 bg-card/20 text-muted-foreground hover:border-primary/30"
                      }`}
                    >{opt}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Height</p>
                <div className="flex flex-wrap gap-1.5">
                  {HEIGHT_OPTIONS.map(opt => (
                    <button key={opt} type="button"
                      onClick={() => setAppearHeight(prev => prev === opt ? "" : opt)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${
                        appearHeight === opt ? "border-primary/60 bg-primary/15 text-primary" : "border-border/30 bg-card/20 text-muted-foreground hover:border-primary/30"
                      }`}
                    >{opt}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Colouring</p>
                <div className="flex flex-wrap gap-1.5">
                  {COLOURING_OPTIONS.map(opt => (
                    <button key={opt} type="button"
                      onClick={() => setAppearColouring(prev => prev === opt ? "" : opt)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${
                        appearColouring === opt ? "border-primary/60 bg-primary/15 text-primary" : "border-border/30 bg-card/20 text-muted-foreground hover:border-primary/30"
                      }`}
                    >{opt}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Eye Colour</p>
                <div className="flex flex-wrap gap-1.5">
                  {EYE_OPTIONS.map(opt => (
                    <button key={opt} type="button"
                      onClick={() => setAppearEyes(prev => prev === opt ? "" : opt)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${
                        appearEyes === opt ? "border-primary/60 bg-primary/15 text-primary" : "border-border/30 bg-card/20 text-muted-foreground hover:border-primary/30"
                      }`}
                    >{opt}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Distinguishing Features</p>
                <div className="flex flex-wrap gap-1.5">
                  {buildFeatureOptions(rawPartnerPronouns).map(opt => (
                    <button key={opt} type="button"
                      onClick={() => setAppearFeatures(prev =>
                        prev.includes(opt) ? prev.filter(f => f !== opt) : [...prev, opt]
                      )}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${
                        appearFeatures.includes(opt) ? "border-primary/60 bg-primary/15 text-primary" : "border-border/30 bg-card/20 text-muted-foreground hover:border-primary/30"
                      }`}
                    >{opt}</button>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* ── Step 6 — World ───────────────────────────────────────── */}
        {step === 6 && (
          <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Your world.</h2>
            <p className="text-muted-foreground text-sm mb-6">Where — and when — does this happen?</p>

            {/* ── Country & City (optional specificity) ── */}
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">
              Country &amp; City <span className="font-normal text-muted-foreground normal-case tracking-normal">(optional — adds real-world specificity)</span>
            </p>
            <div className="grid grid-cols-2 gap-3 mb-7">
              {/* Country */}
              <div className="relative">
                <select
                  value={data.country ?? ""}
                  onChange={e => {
                    update("country", e.target.value);
                    update("city", "");
                  }}
                  className="w-full bg-card/60 border border-border/40 rounded-xl px-3 py-3 text-sm text-foreground appearance-none focus:outline-none focus:border-primary/50 transition-all cursor-pointer pr-8"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="">Country…</option>
                  {Object.keys(COUNTRY_CITIES).sort().map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
              {/* City — filtered by country */}
              <div className="relative">
                <select
                  value={data.city ?? ""}
                  onChange={e => update("city", e.target.value)}
                  disabled={!data.country}
                  className="w-full bg-card/60 border border-border/40 rounded-xl px-3 py-3 text-sm text-foreground appearance-none focus:outline-none focus:border-primary/50 transition-all cursor-pointer pr-8 disabled:opacity-35 disabled:cursor-not-allowed"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="">City…</option>
                  {(data.country ? (COUNTRY_CITIES[data.country] ?? []) : []).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* ── Scenario (required) ── */}
            {afterDark && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">After Dark Exclusive</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                  {AFTER_DARK_SETTINGS.map(s => (
                    <ArtTile key={s.id} gradient={s.gradient} accent={s.accent} selected={data.setting === s.id} onClick={() => update("setting", s.id)}>
                      <p className="font-semibold text-white text-base">{s.label}</p>
                      <p className="text-white/60 text-sm mt-0.5 leading-snug">{s.sub}</p>
                    </ArtTile>
                  ))}
                </div>
              </>
            )}

            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">Contemporary</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {CONTEMPORARY_SETTINGS.map(s => (
                <ArtTile key={s.id} gradient={s.gradient} accent={s.accent} selected={data.setting === s.id} onClick={() => update("setting", s.id)}>
                  <p className="font-semibold text-white text-base">{s.label}</p>
                  <p className="text-white/60 text-sm mt-0.5 leading-snug">{s.sub}</p>
                </ArtTile>
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">Historical Eras</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {HISTORICAL_SETTINGS.map(s => (
                <ArtTile key={s.id} gradient={s.gradient} accent={s.accent} selected={data.setting === s.id} onClick={() => update("setting", s.id)}>
                  <p className="font-semibold text-white text-base">{s.label}</p>
                  <p className="text-white/60 text-sm mt-0.5 leading-snug">{s.sub}</p>
                </ArtTile>
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">
              Atmosphere <span className="font-normal text-muted-foreground normal-case tracking-normal">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {ATMOSPHERES.map(atm => (
                <button
                  key={atm}
                  type="button"
                  onClick={() => update("atmosphere", data.atmosphere === atm ? "" : atm)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    data.atmosphere === atm
                      ? "bg-primary text-primary-foreground border-primary shadow-glow"
                      : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {atm}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Step 7 — Intensity + Mood ────────────────────────────── */}
        {step === 7 && (
          <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">How far?</h2>
            <p className="text-muted-foreground text-sm mb-6">Set the intensity and the feeling of this story.</p>

            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {INTENSITIES.filter(i => afterDark ? ["Explicit", "Scorching"].includes(i.id) : true).map(i => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => update("intensity", i.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    data.intensity === i.id
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border/30 bg-card/30 hover:border-primary/30 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: i.color }} />
                    <p className={`font-semibold text-sm ${data.intensity === i.id ? "text-primary" : "text-foreground"}`}>{i.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{i.desc}</p>
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">Mood</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {MOODS.map(m => (
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

            {/* Story preview */}
            <div className="glass-panel rounded-2xl p-5 mb-4 border border-primary/20">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-2">Your story</p>
              <p className="text-foreground text-sm leading-relaxed italic">"{buildPreview(data)}"</p>
            </div>
          </motion.div>
        )}

        {/* ── Step 8 — Tag Studio ──────────────────────────────────── */}
        {step === 8 && (
          <motion.div key="step8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">Your story, your way.</h2>
                <p className="text-muted-foreground text-sm">Shape the details. Select as many or as few as you like.</p>
              </div>
              <button
                type="button"
                onClick={handleFinish}
                className="text-xs text-muted-foreground hover:text-primary transition-colors whitespace-nowrap ml-4 mt-1 flex-shrink-0"
              >
                Skip this step →
              </button>
            </div>

            <StoryTagStudio
              selectedTags={customTags}
              onTagToggle={toggleTag}
              afterDark={afterDark}
              accentColor={accentColor}
              protagonistPronouns={rawProtagonistPronouns}
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8">
        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
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
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 shadow-glow"
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
