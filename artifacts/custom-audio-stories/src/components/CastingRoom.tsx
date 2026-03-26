import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles, ArrowLeft } from "lucide-react";
import { StoryTagStudio } from "./StoryTagStudio";

export interface CastingRoomResult {
  perspective: "her" | "his" | "your";
  pairing?: string;
  partnerName?: string;
  heritage: string;
  archetype: string;
  chemistry: string;
  setting: string;
  atmosphere: string;
  intensity: "Tender" | "Heated" | "Explicit" | "Scorching";
  mood: string;
  scenarioPrompt: string;
  whoIsHe: string;
  dynamic: string;
  storyMode: string;
  customTags?: string[];
  freeText?: string;
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

/* ── Archetypes with pronoun-aware descriptions ─────────────────── */
function buildArchetypes(pairingId: string | undefined) {
  const { partner: P } = derivePronouns(pairingId);
  const s = P.subject; const o = P.object; const p = P.possessive;
  return [
    { id: "The Executive",   label: "The Executive",   sub: `Measured control. Understated power. ${s} never raises ${p} voice.`,           gradient: "from-[#0a0800] via-[#181200] to-[#060500]", accent: "#c9a227" },
    { id: "The Stranger",    label: "The Stranger",    sub: `No backstory. No promises. Only this moment.`,                                    gradient: "from-[#040408] via-[#080810] to-[#020206]", accent: "#6b7280" },
    { id: "The Artist",      label: "The Artist",      sub: `${s} sees everything. Says very little. That's what makes ${o} dangerous.`,      gradient: "from-[#0a0010] via-[#140020] to-[#080008]", accent: "#a78bfa" },
    { id: "The Protector",   label: "The Protector",   sub: `Steady, watchful. There's one thing that undoes ${o} completely.`,               gradient: "from-[#001000] via-[#001a00] to-[#000a00]", accent: "#34d399" },
    { id: "The Bad One",     label: "The Bad One",     sub: `Dangerous to want. Impossible not to. ${s} knows it.`,                           gradient: "from-[#150000] via-[#250000] to-[#0f0000]", accent: "#ef4444" },
    { id: "The Professor",   label: "The Professor",   sub: `Brilliant, reserved. ${s} comes apart slowly, then all at once.`,                gradient: "from-[#000810] via-[#001020] to-[#000408]", accent: "#60a5fa" },
    { id: "The Wanderer",    label: "The Wanderer",    sub: `${s} doesn't stay. That's exactly what makes this hurt.`,                        gradient: "from-[#080004] via-[#10000a] to-[#040002]", accent: "#fb7185" },
    { id: "The Old Friend",  label: "The Old Friend",  sub: `Years of knowing each other. Tonight something finally breaks.`,                  gradient: "from-[#000810] via-[#000c18] to-[#000408]", accent: "#fcd34d" },
  ];
}

/* ── Settings ─────────────────────────────────────────────────────── */
const CONTEMPORARY_SETTINGS = [
  { id: "Late Night City",         label: "Late Night City",         sub: "Streets wet, lights low, anything goes",  gradient: "from-[#02050e] via-[#040a18] to-[#010308]", accent: "#6b8cce" },
  { id: "Luxury Hotel",            label: "Luxury Hotel",            sub: "A room for one night only",                gradient: "from-[#100d00] via-[#1e1900] to-[#0a0800]", accent: "#c9a227" },
  { id: "European Villa",          label: "European Villa",          sub: "Heat, terraces, and no schedule",          gradient: "from-[#0a0500] via-[#180c00] to-[#060300]", accent: "#d97706" },
  { id: "Private Yacht",           label: "Private Yacht",           sub: "Open water. No escape. No reason to leave", gradient: "from-[#001220] via-[#001e35] to-[#000a14]", accent: "#0ea5e9" },
  { id: "Mountain Retreat",        label: "Mountain Retreat",        sub: "Snowbound. Firelit. Nowhere else to be",   gradient: "from-[#060e06] via-[#0c160c] to-[#040804]", accent: "#4ade80" },
  { id: "Penthouse Suite",         label: "Penthouse Suite",         sub: "City below. Nothing between you and glass", gradient: "from-[#060408] via-[#0e0812] to-[#030204]", accent: "#c084fc" },
  { id: "Art Gallery After Hours", label: "Art Gallery After Hours", sub: "Empty rooms. Something priceless at stake",  gradient: "from-[#04080a] via-[#080e12] to-[#020406]", accent: "#94a3b8" },
];

const HISTORICAL_SETTINGS = [
  { id: "Regency England (1810s)", label: "Regency England", sub: "1810s — letters never sent, country house urgency",     gradient: "from-[#0a0600] via-[#160e00] to-[#060400]", accent: "#fcd34d" },
  { id: "Victorian London (1880s)", label: "Victorian London", sub: "1880s — fog, corsets, what's unspeakable and felt",   gradient: "from-[#040408] via-[#0a0a10] to-[#020206]", accent: "#9ca3af" },
  { id: "Belle Époque Paris (1900s)", label: "Belle Époque Paris", sub: "1900s — absinthe, salons, decadent evenings",   gradient: "from-[#080400] via-[#140800] to-[#040200]", accent: "#f59e0b" },
  { id: "Roaring Twenties (1920s)", label: "Roaring Twenties", sub: "1920s — speakeasies, jazz, smoke and consequence",  gradient: "from-[#080004] via-[#12000a] to-[#040002]", accent: "#f472b6" },
  { id: "Wartime (1940s)", label: "Wartime", sub: "1940s — last night together, everything at stake",                     gradient: "from-[#050802] via-[#0a1004] to-[#020400]", accent: "#86efac" },
  { id: "Swinging Sixties (1960s)", label: "Swinging Sixties", sub: "1960s — revolution, hotel rooms, free desire",       gradient: "from-[#000a10] via-[#001020] to-[#000408]", accent: "#38bdf8" },
  { id: "Disco & Velvet (1970s)", label: "Disco & Velvet", sub: "1970s — heat, mirror balls, all night long",             gradient: "from-[#100010] via-[#200020] to-[#080008]", accent: "#e879a0" },
  { id: "Neon Decade (1980s)", label: "Neon Decade", sub: "1980s — excess, power, after hours at the top",               gradient: "from-[#060010] via-[#0c0020] to-[#030008]", accent: "#818cf8" },
  { id: "Ancient Mediterranean", label: "Ancient Mediterranean", sub: "Marble, olives, conquest, and the gods watching", gradient: "from-[#0a0800] via-[#181400] to-[#050600]", accent: "#fbbf24" },
];

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
  if (data.chemistry) parts.push(data.chemistry.toLowerCase());
  if (data.heritage && data.archetype) parts.push(`featuring ${data.heritage.toLowerCase()} ${data.archetype.toLowerCase()}`);
  else if (data.heritage) parts.push(`featuring a ${data.heritage.toLowerCase()} lead`);
  else if (data.archetype) parts.push(`featuring ${data.archetype.toLowerCase()}`);
  if (data.setting) parts.push(`set in ${data.setting.toLowerCase()}`);
  if (data.atmosphere) parts.push(`at ${data.atmosphere.toLowerCase()}`);
  if (data.intensity) parts.push(`— ${data.intensity.toLowerCase()} intensity`);

  return parts.length === 0
    ? "Your story is taking shape…"
    : parts.join(", ") + ".";
}

/* ── Main component ───────────────────────────────────────────────── */
export function CastingRoom({ onComplete, onSkip, afterDark = false }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<CastingRoomResult>>({
    perspective: "her",
    intensity: afterDark ? "Explicit" : "Heated",
    mood: "Emotional",
  });
  const [partnerName, setPartnerName] = useState<string>("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [freeText, setFreeText] = useState<string>("");

  const TOTAL_STEPS = 7;

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

  const canProceed = () => {
    switch (step) {
      case 0: return !!data.perspective;
      case 1: return !!data.pairing;
      case 2: return !!data.heritage && !!data.archetype;
      case 3: return !!data.chemistry;
      case 4: return !!data.setting;
      case 5: return !!data.intensity && !!data.mood;
      case 6: return true;
      default: return true;
    }
  };

  const handleFinish = () => {
    const chemistryCfg = buildChemistries(data.pairing).find(c => c.id === data.chemistry);
    const pairingCfg = PAIRINGS.find(p => p.id === data.pairing);
    const archetype = data.archetype ?? "";
    const heritage = data.heritage ?? "";
    const setting = data.setting ?? "";
    const atmosphere = data.atmosphere ?? "";
    const name = partnerName.trim();

    const whoIsHe = archetype ? `${archetype}` : "";
    const dynamic = chemistryCfg?.dynamic ?? "";

    const fullScenario = [
      pairingCfg ? `This is a ${pairingCfg.id} story. Protagonist pronouns: ${pairingCfg.protagonistPronouns}. Love interest pronouns: ${pairingCfg.partnerPronouns}.` : "",
      archetype && heritage ? `The love interest is ${heritage} and embodies the energy of ${archetype}.` : "",
      name ? `The love interest's name is ${name}.` : "",
      setting ? `The setting is ${setting}${atmosphere ? ` during ${atmosphere}` : ""}.` : "",
      data.chemistry ? `The dynamic between them: ${data.chemistry}.` : "",
    ].filter(Boolean).join(" ");

    const result: CastingRoomResult = {
      perspective: data.perspective ?? "her",
      pairing: data.pairing,
      partnerName: name || undefined,
      heritage,
      archetype,
      chemistry: data.chemistry ?? "",
      setting,
      atmosphere,
      intensity: data.intensity ?? "Heated",
      mood: data.mood ?? "Emotional",
      scenarioPrompt: fullScenario,
      whoIsHe,
      dynamic,
      storyMode: afterDark ? "unrestrained" : (data.intensity === "Tender" || data.intensity === "Heated" ? "passionate" : "unrestrained"),
      customTags,
      freeText,
    };
    onComplete(result);
  };

  const accentColor = afterDark ? "#c0392b" : "#c9a227";

  // Derive pronouns from selected pairing for use in step headings / descriptions
  const { partner: partnerP, protagonist: protagonistP } = derivePronouns(data.pairing);

  // Partner heading pronoun: "Who is he?" / "Who is she?" / "Who are they?"
  const partnerHeadingVerb = partnerP.subject === "They" ? "Who are they?" : `Who is ${partnerP.object}?`;

  // Build dynamic lists
  const chemistries = buildChemistries(data.pairing);
  const archetypes  = buildArchetypes(data.pairing);

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

        <p className="text-xs font-medium uppercase tracking-widest mb-2"
          style={{ color: accentColor }}
        >
          {afterDark ? "After Dark" : "The Casting Room"} · Step {step + 1} of {TOTAL_STEPS}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0 — Perspective */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
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

        {/* Step 1 — Pairing */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Who's in the story?</h2>
            <p className="text-muted-foreground text-sm mb-6">Choose the pairing. This is hardcoded into your story.</p>
            <div className="grid grid-cols-2 gap-2.5">
              {PAIRINGS.map(p => (
                <ArtTile key={p.id} gradient={p.gradient} accent={p.accent} selected={data.pairing === p.id} onClick={() => update("pairing", p.id)}>
                  <p className="font-semibold text-white text-base">{p.label}</p>
                  <p className="text-white/50 text-xs mt-0.5">{p.sub}</p>
                </ArtTile>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2 — Character (pronoun-aware heading) */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">{partnerHeadingVerb}</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Choose {partnerP.possessive} heritage and the energy {partnerP.subject === "They" ? "they bring" : `${partnerP.subject.toLowerCase()} brings`}.
            </p>

            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">Heritage</p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {HERITAGES.map(h => (
                <ArtTile key={h.id} gradient={h.gradient} accent={h.accent} selected={data.heritage === h.id} onClick={() => update("heritage", h.id)}>
                  <p className="font-semibold text-white text-sm">{h.label}</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-snug">{h.sub}</p>
                </ArtTile>
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">
              {partnerP.possessive.charAt(0).toUpperCase() + partnerP.possessive.slice(1)} Energy
            </p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {archetypes.map(a => (
                <ArtTile key={a.id} gradient={a.gradient} accent={a.accent} selected={data.archetype === a.id} onClick={() => update("archetype", a.id)}>
                  <p className="font-semibold text-white text-sm">{a.label}</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-snug">{a.sub}</p>
                </ArtTile>
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-2">
              {partnerP.possessive.charAt(0).toUpperCase() + partnerP.possessive.slice(1)} Name{" "}
              <span className="font-normal text-muted-foreground normal-case tracking-normal">(optional)</span>
            </p>
            <input
              type="text"
              value={partnerName}
              onChange={e => setPartnerName(e.target.value)}
              placeholder="Give them a name…"
              maxLength={40}
              className="w-full bg-card/40 border border-border/40 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </motion.div>
        )}

        {/* Step 3 — Chemistry (pronoun-aware, 9 options) */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
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

        {/* Step 4 — World (contemporary + historical eras) */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">Your world.</h2>
            <p className="text-muted-foreground text-sm mb-6">Where — and when — does this happen?</p>

            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">Contemporary</p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {CONTEMPORARY_SETTINGS.map(s => (
                <ArtTile key={s.id} gradient={s.gradient} accent={s.accent} selected={data.setting === s.id} onClick={() => update("setting", s.id)}>
                  <p className="font-semibold text-white text-sm">{s.label}</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-snug">{s.sub}</p>
                </ArtTile>
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-3">Historical Eras</p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {HISTORICAL_SETTINGS.map(s => (
                <ArtTile key={s.id} gradient={s.gradient} accent={s.accent} selected={data.setting === s.id} onClick={() => update("setting", s.id)}>
                  <p className="font-semibold text-white text-sm">{s.label}</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-snug">{s.sub}</p>
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

        {/* Step 5 — Intensity + Mood (expanded) */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
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

        {/* Step 6 — Tag Studio */}
        {step === 6 && (
          <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">Your story, your way.</h2>
                <p className="text-muted-foreground text-sm">
                  Shape the details. Select as many or as few as you like.
                </p>
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
              freeText={freeText}
              onFreeTextChange={setFreeText}
              afterDark={afterDark}
              accentColor={accentColor}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8">
        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={next}
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
