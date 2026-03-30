import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ArrowLeft, Moon } from "lucide-react";
import { useGenerateFullStory } from "@workspace/api-client-react";
import type { FullGeneratedStory } from "@workspace/api-client-react";
import { useAudioPlayer } from "@/store/use-audio-player";
import { useAuth } from "@/hooks/useAuth";
import { CastingRoom } from "@/components/CastingRoom";
import type { CastingRoomResult } from "@/components/CastingRoom";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ── Types ──────────────────────────────────────────────────────────── */
interface DriftScenario {
  id: string;
  label: string;
  sub: string;
  room: string;
  gradient: string;
  accent: string;
  tags: string[];
}

interface DriftRoom {
  id: string;
  name: string;
  sub: string;
  accent: string;
}

/* ── Rooms ───────────────────────────────────────────────────────────── */
const ROOMS: DriftRoom[] = [
  {
    id: "the_late_night",
    name: "The Late Night",
    sub: "It's past midnight. Someone is still there. The city is quiet and there's nowhere either of them needs to be.",
    accent: "#6366f1",
  },
  {
    id: "come_home",
    name: "Come Home",
    sub: "They came back late and you were almost asleep. Almost.",
    accent: "#0891b2",
  },
  {
    id: "the_long_week",
    name: "The Long Week",
    sub: "Five days of too much. Tonight someone knows what you need without being told.",
    accent: "#7c3aed",
  },
  {
    id: "warm_weight",
    name: "Warm Weight",
    sub: "Just the weight of them next to you. The specific comfort of not being alone.",
    accent: "#d97706",
  },
  {
    id: "last_hour",
    name: "Last Hour",
    sub: "The hour before sleep. Slow and certain. The day is almost over and nothing is required.",
    accent: "#059669",
  },
  {
    id: "the_hour_before",
    name: "The Hour Before",
    sub: "Before either of you has to be anything. Just this — warm, unhurried, and entirely private.",
    accent: "#db2777",
  },
];

/* ── Scenarios ──────────────────────────────────────────────────────── */
const SCENARIOS: DriftScenario[] = [
  /* The Late Night ─── */
  {
    id: "two_in_morning",
    label: "Two in the Morning",
    sub: "No plans, no obligations, nowhere to be until the day decides to start again. Just this room and what happens in it.",
    room: "the_late_night",
    gradient: "from-[#04040e] via-[#080814] to-[#020208]",
    accent: "#6366f1",
    tags: ["Warmth with nowhere to go", "The night is private and unhurried"],
  },
  {
    id: "one_who_stayed",
    label: "The One Who Stayed",
    sub: "Everyone else left hours ago. They didn't. Neither did she.",
    room: "the_late_night",
    gradient: "from-[#060612] via-[#0a0a18] to-[#030309]",
    accent: "#818cf8",
    tags: ["Company without performance", "Slow enough to drift"],
  },
  {
    id: "cant_sleep",
    label: "Can't Sleep",
    sub: "She gave up on sleep. They were already awake. Two people who didn't need to explain why.",
    room: "the_late_night",
    gradient: "from-[#04040c] via-[#080810] to-[#020206]",
    accent: "#6366f1",
    tags: ["The quiet kind of wanted", "Warmth with nowhere to go"],
  },

  /* Come Home ─── */
  {
    id: "already_in_bed",
    label: "Already in Bed",
    sub: "She was mostly asleep. They were quiet getting in. They didn't stay quiet for long.",
    room: "come_home",
    gradient: "from-[#001018] via-[#001c26] to-[#000810]",
    accent: "#0891b2",
    tags: ["Warmth interrupted slowly", "Company without performance"],
  },
  {
    id: "sound_of_door",
    label: "The Sound of the Door",
    sub: "She'd been listening for it. They came in and sat on the edge of the bed. Then a little closer.",
    room: "come_home",
    gradient: "from-[#001214] via-[#001e20] to-[#00080c]",
    accent: "#22d3ee",
    tags: ["The quiet kind of wanted", "Slow enough to drift"],
  },
  {
    id: "still_in_clothes",
    label: "Still in Your Clothes",
    sub: "She'd meant to wait up. She had. The rest took care of itself.",
    room: "come_home",
    gradient: "from-[#000e18] via-[#001824] to-[#00070e]",
    accent: "#0891b2",
    tags: ["Company without performance", "Warmth with nowhere to go"],
  },

  /* The Long Week ─── */
  {
    id: "he_knew_without_asking",
    label: "He Knew Without Asking",
    sub: "She hadn't said anything. They saw it anyway. They decided tonight was about exactly one thing: her.",
    room: "the_long_week",
    gradient: "from-[#080010] via-[#10001a] to-[#040008]",
    accent: "#7c3aed",
    tags: ["The quiet kind of wanted", "He knows without asking"],
  },
  {
    id: "everything_later",
    label: "Everything Later",
    sub: "She listed the week. They listened. Then they suggested putting it somewhere else for a while.",
    room: "the_long_week",
    gradient: "from-[#0a0012] via-[#12001e] to-[#06000a]",
    accent: "#8b5cf6",
    tags: ["Company without performance", "Warmth with nowhere to go"],
  },
  {
    id: "one_specific_thing",
    label: "One Specific Thing",
    sub: "She knew what she needed. She didn't have to say it. They'd already decided to give her exactly that.",
    room: "the_long_week",
    gradient: "from-[#060010] via-[#0e0018] to-[#030008]",
    accent: "#a78bfa",
    tags: ["He knows without asking", "Slow enough to drift"],
  },

  /* Warm Weight ─── */
  {
    id: "close",
    label: "Close",
    sub: "No agenda. The specific gravity of another person, warm and real and right there.",
    room: "warm_weight",
    gradient: "from-[#100800] via-[#1c1200] to-[#080500]",
    accent: "#d97706",
    tags: ["Rest that comes from connection", "Warmth, no urgency"],
  },
  {
    id: "this_first",
    label: "This First",
    sub: "Before anything. Just this: the weight of an arm, the sound of breathing, the world reduced to a room.",
    room: "warm_weight",
    gradient: "from-[#0e0800] via-[#1a1000] to-[#060400]",
    accent: "#f59e0b",
    tags: ["Warmth, no urgency", "Slow enough to drift"],
  },
  {
    id: "half_asleep",
    label: "Half Asleep",
    sub: "She was half gone. They didn't need her to be more present than that. They stayed.",
    room: "warm_weight",
    gradient: "from-[#100a00] via-[#1c1400] to-[#080600]",
    accent: "#d97706",
    tags: ["Rest that comes from connection", "The quiet kind of wanted"],
  },

  /* Last Hour ─── */
  {
    id: "voice_in_dark",
    label: "A Voice in the Dark",
    sub: "Low, close, just for tonight. The voice as the whole story: pace, warmth, presence.",
    room: "last_hour",
    gradient: "from-[#001008] via-[#001a10] to-[#000806]",
    accent: "#059669",
    tags: ["A voice that takes its time", "The quiet kind of wanted"],
  },
  {
    id: "weight_of_being_held",
    label: "The Weight of Being Held",
    sub: "The specific weight of not floating away. No explanation needed. Just presence.",
    room: "last_hour",
    gradient: "from-[#000e08] via-[#001610] to-[#000804]",
    accent: "#10b981",
    tags: ["Warmth, no urgency", "Rest that comes from connection"],
  },
  {
    id: "nothing_required",
    label: "Nothing Required",
    sub: "Nothing to perform tonight. They made that clear before anyone said a word.",
    room: "last_hour",
    gradient: "from-[#001008] via-[#001c10] to-[#000806]",
    accent: "#34d399",
    tags: ["Company without performance", "Warmth, no urgency"],
  },

  /* The Hour Before ─── */
  {
    id: "almost_asleep",
    label: "Almost Asleep",
    sub: "The halfway place. Not quite gone, not quite here. Someone stays close through all of it.",
    room: "the_hour_before",
    gradient: "from-[#14000a] via-[#200012] to-[#0c0006]",
    accent: "#db2777",
    tags: ["The quiet kind of wanted", "Rest that comes from connection"],
  },
  {
    id: "morning_before_morning",
    label: "Morning Before It's Morning",
    sub: "Not quite night, not yet day. Warm and quiet and entirely theirs.",
    room: "the_hour_before",
    gradient: "from-[#160008] via-[#220010] to-[#0e0006]",
    accent: "#f472b6",
    tags: ["Warmth with nowhere to go", "Slow enough to drift"],
  },
  {
    id: "dont_go_yet",
    label: "Don't Go Yet",
    sub: "Said quietly. The thing being reached for was put down. They stayed.",
    room: "the_hour_before",
    gradient: "from-[#12000a] via-[#1e0012] to-[#0a0006]",
    accent: "#ec4899",
    tags: ["The quiet kind of wanted", "Company without performance"],
  },
];

/* ── Loading Phases ─────────────────────────────────────────────────── */
const LOADING_PHASES = [
  { label: "Settling in…",       sub: "Finding the right pace for tonight" },
  { label: "Setting the scene…", sub: "The room, the hour, the quiet" },
  { label: "Writing it…",        sub: "Words that slow you down" },
  { label: "Almost ready…",      sub: "One last thing, then it's yours" },
];

const ACCENT = "#6366f1";

/* ── ScenarioCard ────────────────────────────────────────────────────── */
function ScenarioCard({
  scenario,
  selected,
  onClick,
}: {
  scenario: DriftScenario;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-56 flex-shrink-0 rounded-2xl border p-4 text-left transition-all overflow-hidden ${
        selected ? "border-opacity-80" : "border-white/8 hover:border-white/20"
      }`}
      style={
        selected
          ? { borderColor: `${scenario.accent}66`, boxShadow: `0 0 20px ${scenario.accent}28` }
          : undefined
      }
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${scenario.gradient} opacity-80`}
      />
      {selected && (
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 30% 30%, ${scenario.accent}12 0%, transparent 60%)` }}
        />
      )}
      <div className="relative">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: scenario.accent }}
        >
          Drift
        </p>
        <p className="text-sm font-semibold text-foreground mb-2 leading-snug">{scenario.label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{scenario.sub}</p>
      </div>
    </button>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────── */
type Phase = "scenario" | "casting" | "generating" | "result";

export default function Drift() {
  const { isLoading: authLoading } = useAuth();
  const [phase, setPhase] = useState<Phase>("scenario");
  const [selectedScenario, setSelectedScenario] = useState<DriftScenario | null>(null);
  const [result, setResult] = useState<FullGeneratedStory | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);

  const play = useAudioPlayer((s) => s.play);

  const generateMutation = useGenerateFullStory({
    mutation: {
      onSuccess: (data) => {
        stopLoadingPhase();
        setResult(data);
        play(data);
        setPhase("result");
      },
      onError: () => {
        stopLoadingPhase();
        setPhase("casting");
      },
    },
  });

  const startLoadingPhase = useCallback(() => {
    setLoadingPhase(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      if (i < LOADING_PHASES.length - 1) {
        setLoadingPhase(i);
      } else {
        clearInterval(timer);
      }
    }, 3500);
    return timer;
  }, []);

  const stopLoadingPhase = useCallback(() => {
    setLoadingPhase(LOADING_PHASES.length - 1);
  }, []);

  const handleCastingComplete = useCallback(
    async (casting: CastingRoomResult) => {
      if (!selectedScenario) return;
      setPhase("generating");
      const timer = startLoadingPhase();

      const apiPerspective =
        casting.perspective === "your" ? "you"
        : casting.perspective === "their" ? "they"
        : casting.perspective;

      const allTags = [...selectedScenario.tags, ...(casting.customTags ?? [])];

      try {
        await generateMutation.mutateAsync({
          data: {
            mood: "Late Night",
            intensity: "Sensual",
            voiceFeel: "Soft Voice",
            storyLength: "10 min",
            perspective: apiPerspective,
            cinematicVisuals: true,
            emotionalFocus: true,
            whoIsHe: casting.archetype || undefined,
            dynamic: casting.dynamic || undefined,
            storyMode: "nocturne",
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
            scenarioRoom: selectedScenario.room,
          },
        });
      } finally {
        clearInterval(timer);
        stopLoadingPhase();
      }
    },
    [selectedScenario, generateMutation, startLoadingPhase, stopLoadingPhase]
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: ACCENT, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen"
      style={{ background: "linear-gradient(180deg, #020206 0%, #03030a 60%, #04040c 100%)" }}
    >
      <AnimatePresence mode="wait">

        {/* ── Scenario Selection ───────────────────────────────────────── */}
        {phase === "scenario" && (
          <motion.div
            key="scenario"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="max-w-3xl mx-auto px-4 py-12"
          >
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.28)" }}
                >
                  <Moon className="w-4 h-4" style={{ color: ACCENT }} />
                </motion.div>
                <span className="text-xs font-medium uppercase tracking-widest" style={{ color: ACCENT }}>
                  Drift
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Where do you want to be tonight?
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                Bedtime stories for adults. Unhurried, drift-tolerant, written to slow you down.
                Nothing here leaves this room.
              </p>
            </div>

            <div className="space-y-10 mb-10">
              {ROOMS.map((room) => {
                const roomScenarios = SCENARIOS.filter((s) => s.room === room.id);
                return (
                  <div key={room.id}>
                    <div
                      className="mb-4 relative overflow-hidden rounded-xl border"
                      style={{ borderColor: `${room.accent}20` }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, ${room.accent}0e 0%, transparent 70%)` }}
                      />
                      <div className="relative flex items-center gap-3 px-4 py-3">
                        <motion.div
                          animate={{ opacity: [0.4, 0.85, 0.4] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                          className="w-1 h-4 rounded-full flex-shrink-0"
                          style={{ background: room.accent }}
                        />
                        <div>
                          <h2 className="font-display text-lg font-bold" style={{ color: room.accent }}>
                            {room.name}
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">{room.sub}</p>
                        </div>
                      </div>
                    </div>

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

            <div className="sticky bottom-6">
              <button
                onClick={() => {
                  if (selectedScenario) {
                    window.scrollTo({ top: 0 });
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
                        background: `linear-gradient(135deg, ${ACCENT}, #4338ca)`,
                        boxShadow: `0 0 32px ${ACCENT}28`,
                      }
                    : { background: "#1a1a1a" }
                }
              >
                <Moon className="w-5 h-5" />
                {selectedScenario ? `Continue with "${selectedScenario.label}"` : "Choose a scenario above"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Casting Room ─────────────────────────────────────────────── */}
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
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: ACCENT }}
                  />
                  <span className="text-xs font-medium" style={{ color: `${ACCENT}cc` }}>
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
                  chemistry: selectedScenario?.tags[0] ?? "Warmth, no urgency",
                  setting: "",
                  atmosphere: "",
                  intensity: "Sensual",
                  mood: "Tender",
                  whoIsHe: "",
                  dynamic: selectedScenario?.tags[0] ?? "",
                  storyMode: "nocturne",
                })
              }
              afterDark={false}
              bedtime={true}
            />
          </motion.div>
        )}

        {/* ── Generating ──────────────────────────────────────────────── */}
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
                style={{ border: `1px solid ${ACCENT}30` }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Moon className="w-8 h-8" style={{ color: ACCENT }} />
                </motion.div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.4, 0.15] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 rounded-full"
                style={{ border: `1px solid ${ACCENT}18` }}
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
                  style={{ background: i <= loadingPhase ? ACCENT : "#333" }}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-8 max-w-xs">
              Slow enough to carry you somewhere else. Nothing here leaves this room.
            </p>
          </motion.div>
        )}

        {/* ── Result ──────────────────────────────────────────────────── */}
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
              <ChevronLeft className="w-4 h-4" /> Another story
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
                    style={{ color: ACCENT }}
                  >
                    Drift · Private
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
                        style={{ color: ACCENT }}
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
                setResult(null);
              }}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white border transition-all"
              style={{ background: `${ACCENT}0e`, border: `1px solid ${ACCENT}25` }}
            >
              <Sparkles className="w-4 h-4" />
              Write Another Story
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
