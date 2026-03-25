import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ArrowLeft, Moon } from "lucide-react";
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
}

/* ── Fantasy Rooms ──────────────────────────────────────────────────── */
const ROOMS: Room[] = [
  {
    id: "power_exchange",
    name: "Power Exchange",
    sub: "Control given. Or taken. Either way, everything changes.",
    accent: "#c0392b",
  },
  {
    id: "the_forbidden",
    name: "The Forbidden",
    sub: "The reason it's wrong is the reason it's everything.",
    accent: "#8b5cf6",
  },
  {
    id: "in_character",
    name: "In Character",
    sub: "A role, a premise, a fiction that becomes completely real.",
    accent: "#d97706",
  },
  {
    id: "eyes_on_us",
    name: "Eyes On Us",
    sub: "Watched. Watching. Every motion deliberate and felt.",
    accent: "#14b8a6",
  },
  {
    id: "more_than_two",
    name: "More Than Two",
    sub: "Desire doesn't always arrive in pairs.",
    accent: "#6366f1",
  },
  {
    id: "dark_territory",
    name: "Dark Territory",
    sub: "Past the edge. Written without restraint or apology.",
    accent: "#c0392b",
  },
];

/* ── 20 Scenarios ───────────────────────────────────────────────────── */
const SCENARIOS: Scenario[] = [
  /* Power Exchange ─── */
  {
    id: "he_decides",
    label: "He Decides Everything",
    sub: "Total dominance. Her only role is to feel. He's precise about every instruction.",
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
    tags: ["Something between you that should be forbidden", "The danger makes it real"],
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
    sub: "He makes her look. She can't. He waits. He makes her look again. She does.",
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

  /* Dark Territory ─── */
  {
    id: "completely_undone",
    label: "Completely Undone",
    sub: "He takes her past every boundary she thought she had. She finds edges she didn't know existed.",
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
    sub: "Everything she'd never say out loud. He makes her say it. Then he makes it true.",
    room: "dark_territory",
    darkness: "No Limits",
    gradient: "from-[#140000] via-[#200000] to-[#0c0000]",
    accent: "#b91c1c",
    storyMode: "unrestrained",
    tags: ["He's completely in control", "Nothing implied where it can be named", "Total surrender"],
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
      animate={{ width: selected ? 260 : 220 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl border text-left flex-shrink-0 transition-colors ${
        selected
          ? "border-white/30 shadow-[0_0_24px_rgba(192,57,43,0.22)]"
          : "border-white/6 hover:border-white/16"
      }`}
      style={{ minHeight: "140px" }}
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
              className="text-white/45 text-xs leading-snug line-clamp-2"
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

/* ── Main component ─────────────────────────────────────────────────── */
export default function AfterDark() {
  const { isAuthenticated, isLoading: authLoading, openSignIn } = useAuth();
  const [phase, setPhase] = useState<"scenario" | "seed" | "casting" | "generating" | "result">("scenario");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [scenarioSeed, setScenarioSeed] = useState<string>("");
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<FullGeneratedStory | null>(null);
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

  const handleCastingComplete = useCallback(
    async (casting: CastingRoomResult) => {
      if (!selectedScenario) return;
      setPhase("generating");
      startLoadingPhase();

      const scenarioContext = `${selectedScenario.label}: ${selectedScenario.sub}`;
      const fullPrompt = [scenarioContext, scenarioSeed, casting.scenarioPrompt, casting.freeText]
        .filter(Boolean)
        .join(". ");
      const allTags = [...selectedScenario.tags, ...(casting.customTags ?? [])];

      try {
        await generateMutation.mutateAsync({
          data: {
            listenerName: "",
            mood: "Late Night",
            intensity: casting.intensity,
            voiceFeel: "Deep Voice",
            storyLength: "10 min",
            scenarioPrompt: fullPrompt,
            cinematicVisuals: true,
            emotionalFocus: false,
            whoIsHe: casting.archetype || undefined,
            dynamic: casting.dynamic || selectedScenario.tags[0] || undefined,
            storyMode: selectedScenario.storyMode,
            experienceTags: allTags,
          },
        });
      } finally {
        stopLoadingPhase();
      }
    },
    [selectedScenario, scenarioSeed, generateMutation, startLoadingPhase, stopLoadingPhase]
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
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Private access only</h2>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            You're in the right place. Nothing here leaves this room.
            Sign in to continue — your stories stay completely private.
          </p>
        </div>
        <button
          onClick={openSignIn}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #c0392b, #922b21)", boxShadow: "0 0 24px rgba(192,57,43,0.3)" }}
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

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
                    {/* Room heading */}
                    <div className="mb-4 flex items-baseline gap-3">
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

                    {/* Horizontal scroll row */}
                    <div className="overflow-x-auto pb-2 -mx-4 px-4">
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
                    setScenarioSeed("");
                    setPhase("seed");
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

        {/* ── Scenario Seed ─────────────────────────────────────────────── */}
        {phase === "seed" && selectedScenario && (
          <motion.div
            key="seed"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto px-4 py-12"
          >
            <button
              onClick={() => setPhase("scenario")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Selected scenario summary */}
            <div
              className="relative overflow-hidden rounded-2xl p-5 mb-8 border"
              style={{ border: "1px solid rgba(192,57,43,0.2)", background: "rgba(192,57,43,0.04)" }}
            >
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `radial-gradient(ellipse at 70% 30%, ${selectedScenario.accent}15 0%, transparent 65%)`,
                }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-bold text-foreground text-lg">{selectedScenario.label}</p>
                  <DarknessBadge level={selectedScenario.darkness} />
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{selectedScenario.sub}</p>
              </div>
            </div>

            {/* Seed prompt */}
            <div className="mb-10">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                In one line — what are you imagining right now?
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Give the story a personal detail before it begins. Optional — skip if you'd rather let us decide.
              </p>
              <textarea
                value={scenarioSeed}
                onChange={(e) => setScenarioSeed(e.target.value.slice(0, 120))}
                rows={3}
                maxLength={120}
                placeholder={`e.g. He's been watching me across the room for an hour and still hasn't moved…`}
                className="w-full rounded-2xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/40 px-4 py-3 resize-none focus:outline-none focus:border-white/20 transition-colors leading-relaxed"
              />
              {scenarioSeed.length > 0 && (
                <p className="text-xs text-muted-foreground/40 mt-1 text-right">{scenarioSeed.length}/120</p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setPhase("casting")}
                className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #c0392b, #7f1d1d)",
                  boxShadow: "0 0 28px rgba(192,57,43,0.24)",
                }}
              >
                <Sparkles className="w-5 h-5" />
                {scenarioSeed.trim() ? "Set the Scene" : "Begin the Fantasy"}
              </button>
              <button
                onClick={() => { setScenarioSeed(""); setPhase("casting"); }}
                className="w-full py-3 rounded-2xl text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip this step →
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
                  scenarioPrompt: selectedScenario?.sub ?? "",
                  whoIsHe: "",
                  dynamic: selectedScenario?.tags[0] ?? "",
                  storyMode: selectedScenario?.storyMode ?? "unrestrained",
                })
              }
              afterDark={true}
            />
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
                setPhase("scenario");
                setSelectedScenario(null);
                setScenarioSeed("");
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
