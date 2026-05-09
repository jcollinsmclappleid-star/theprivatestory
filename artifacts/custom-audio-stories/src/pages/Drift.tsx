import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ArrowLeft, Moon, Loader2, Check } from "lucide-react";
import { useGenerateFullStory } from "@workspace/api-client-react";
import type { FullGeneratedStory } from "@workspace/api-client-react";
import { useAudioPlayer } from "@/store/use-audio-player";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { usePricing } from "@/hooks/usePricing";
import { TermsGate } from "@/components/TermsGate";
import { CastingRoom } from "@/components/CastingRoom";
import type { CastingRoomResult } from "@/components/CastingRoom";
import { VOICES } from "@/lib/voices";
import DriftLanding from "@/pages/DriftLanding";

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

/* ── Paywall preview teasers ────────────────────────────────────────── */
const DRIFT_TEASERS: Record<string, string> = {
  the_late_night: "It was past midnight. The city had gone quiet and neither of you had mentioned sleep. The kind of lateness that turns everything unhurried, where nothing is required except being exactly here.",
  come_home: "They came back when the house was almost dark. You were almost asleep. Almost. That word doing a lot of quiet work in the warm air between you.",
  the_long_week: "Five days of too much. And now — someone who knows what you need without having to be told. The long week, finally, releasing its grip.",
  warm_weight: "Just the weight of them beside you. Not dramatic. Not required to be anything. Just the specific, irreplaceable comfort of not being alone in the dark.",
  last_hour: "The last hour before everything stops. Slow and certain, unhurried. The day has nearly finished and all that's left is this — warm, quiet, and entirely your own.",
  the_hour_before: "Before either of you has to be anything. Before the day asks anything back. Just this — unhurried and private, the hour that belongs only to you.",
};

const DRIFT_TITLES: Record<string, string> = {
  the_late_night: "Past midnight, nowhere to be",
  come_home: "When they came back late",
  the_long_week: "The end of too much",
  warm_weight: "The comfort of being beside someone",
  last_hour: "Before you let the day go",
  the_hour_before: "The unhurried hour",
};

/* ── Main Page ──────────────────────────────────────────────────────── */
type Phase = "scenario" | "casting" | "generating" | "result" | "paywall";

export default function Drift() {
  const { monthly, annual, currency } = usePricing();
  useSEO({
    title: "Drift — Calm bedtime audio stories — The Private Story",
    description:
      "Slow, sensory bedtime audio stories written to let you settle. Choose your scenario, listen with eyes closed. Premium narration, private to your account.",
    ogImage: "https://theprivatestory.com/og/drift.jpg",
  });
  const { isLoading: authLoading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [phase, setPhase] = useState<Phase>("scenario");
  const [selectedScenario, setSelectedScenario] = useState<DriftScenario | null>(null);
  const [result, setResult] = useState<FullGeneratedStory | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [paywallCapture, setPaywallCapture] = useState<{ scenarioLabel: string; roomId?: string; accent?: string; archetype?: string; dynamic?: string; voiceId?: string; pairing?: string; heritage?: string } | null>(null);
  const [paywallLoadingPlan, setPaywallLoadingPlan] = useState<"monthly" | "annual" | null>(null);
  const [paywallCoverUrl, setPaywallCoverUrl] = useState<string | null>(null);
  const [paywallImageLoading, setPaywallImageLoading] = useState(false);

  useEffect(() => {
    const handler = (e: PageTransitionEvent) => {
      if (e.persisted) setPaywallLoadingPlan(null);
    };
    window.addEventListener("pageshow", handler);
    return () => window.removeEventListener("pageshow", handler);
  }, []);

  useEffect(() => {
    if (phase !== "paywall" || !paywallCapture) {
      setPaywallCoverUrl(null);
      return;
    }
    setPaywallImageLoading(true);
    (async () => {
      const body = JSON.stringify({
        mood: "Late Night",
        intensity: "Sensual",
        pairing: paywallCapture.pairing,
        heritage: paywallCapture.heritage,
      });
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const r = await fetch(`${API_BASE}/api/preview-cover`, {
            method: "POST", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body,
          });
          if (r.ok) {
            const d: { url?: string } | null = await r.json();
            if (d?.url) { setPaywallCoverUrl(d.url); setPaywallImageLoading(false); return; }
          }
        } catch {}
        if (attempt < 1) await new Promise(res => setTimeout(res, 1500));
      }
      setPaywallImageLoading(false);
    })();
  }, [phase, paywallCapture]);

  const lastCastingRef = useRef<{ archetype?: string; dynamic?: string; voiceId?: string; pairing?: string; heritage?: string } | null>(null);
  const lastScenarioRef = useRef<DriftScenario | null>(null);
  const lastGenDataRef = useRef<Record<string, unknown> | null>(null);

  const play = useAudioPlayer((s) => s.play);

  const generateMutation = useGenerateFullStory({
    mutation: {
      onSuccess: (data) => {
        stopLoadingPhase();
        setResult(data);
        play(data);
        setPhase("result");
      },
      onError: (err: unknown) => {
        stopLoadingPhase();
        const status = (err as { status?: number }).status;
        if (status === 401 || status === 402) {
          setPaywallCapture({
            scenarioLabel: lastScenarioRef.current?.label ?? "Drift",
            roomId: lastScenarioRef.current?.room,
            accent: lastScenarioRef.current?.accent,
            archetype: lastCastingRef.current?.archetype,
            dynamic: lastCastingRef.current?.dynamic,
            voiceId: lastCastingRef.current?.voiceId,
            pairing: lastCastingRef.current?.pairing,
            heritage: lastCastingRef.current?.heritage,
          });
          setPhase("paywall");
        } else {
          setPhase("casting");
        }
      },
    },
  });


  const startDriftCheckout = async (plan: "monthly" | "annual") => {
    setPaywallLoadingPlan(plan);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, currency, returnPath: window.location.pathname }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
    } catch { /* silent */ }
    setPaywallLoadingPlan(null);
  };

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
      lastCastingRef.current = { archetype: casting.archetype, dynamic: casting.dynamic, voiceId: casting.voiceId, pairing: casting.pairing, heritage: casting.heritage };
      lastScenarioRef.current = selectedScenario;
      setPhase("generating");
      const timer = startLoadingPhase();

      const apiPerspective =
        casting.perspective === "your" ? "you"
        : casting.perspective === "their" ? "they"
        : casting.perspective;

      const allTags = [...selectedScenario.tags, ...(casting.customTags ?? [])];

      const genData: Record<string, unknown> = {
        mood: "Late Night",
        intensity: "Sensual",
        voiceFeel: "UK Voice",
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
      };
      lastGenDataRef.current = genData;

      try {
        await generateMutation.mutateAsync({ data: genData as never });
      } finally {
        clearInterval(timer);
        stopLoadingPhase();
      }
    },
    [selectedScenario, generateMutation, startLoadingPhase, stopLoadingPhase]
  );

  if (showLanding) {
    return (
      <AnimatePresence mode="wait">
        <DriftLanding key="drift-landing" onEnter={() => setShowLanding(false)} />
      </AnimatePresence>
    );
  }

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
    <>
      <TermsGate />
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

        {/* ── Paywall ─────────────────────────────────────────────────── */}
        {phase === "paywall" && (
          <motion.div
            key="paywall"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Cinematic deep-indigo background */}
            <div className="absolute inset-0">
              <img
                src={`${import.meta.env.BASE_URL}images/drift-hero-woman.webp`}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover object-center opacity-25"
              />
            </div>
            <div
              className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 50% 0%, #08051480 0%, #03021088 55%, #000 100%)" }}
            />
            <div className="absolute inset-0" style={{
              background: "linear-gradient(0deg, #000 0%, #000a 30%, transparent 70%)",
            }} />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md mx-auto px-4 py-10 flex flex-col items-center gap-5 overflow-y-auto max-h-screen text-center">

              {/* Moon icon */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.35)" }}
              >
                <Moon className="w-7 h-7" style={{ color: ACCENT }} />
              </div>

              {/* Personalised headline */}
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-2xl font-bold text-foreground leading-tight">
                  {paywallCapture?.scenarioLabel ?? "Drift"} — your story is ready.
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  One step. Then it's written and playing.
                </p>
                {/* Casting detail pill */}
                {paywallCapture && (paywallCapture.archetype || paywallCapture.dynamic) && (
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full self-center text-xs font-medium"
                    style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}
                  >
                    {[paywallCapture.archetype, paywallCapture.dynamic].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>

              {/* Story preview card */}
              {(() => {
                const roomId = paywallCapture?.roomId ?? selectedScenario?.room ?? "the_late_night";
                const accentHex = paywallCapture?.accent ?? selectedScenario?.accent ?? "#6366f1";
                const excerpt = DRIFT_TEASERS[roomId] ?? DRIFT_TEASERS.the_late_night;
                const titleLine = DRIFT_TITLES[roomId] ?? paywallCapture?.scenarioLabel ?? "Your story";
                const voiceId = paywallCapture?.voiceId;
                const voice = voiceId ? VOICES.find(v => v.id === voiceId) : null;
                const voiceName = voice?.displayName ?? voice?.label ?? null;
                return (
                  <div className="w-full rounded-2xl overflow-hidden" style={{ border: `1px solid ${accentHex}25`, background: "transparent" }}>
                    <div className="relative h-44 flex items-end p-4 overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${accentHex}22 0%, ${accentHex}08 60%, transparent 100%)` }}>
                      {paywallImageLoading && !paywallCoverUrl ? (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/40">
                          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
                        </div>
                      ) : (
                        <img
                          src={paywallCoverUrl ?? `${import.meta.env.BASE_URL}images/drift-hero-woman.webp`}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover object-center"
                          style={{ opacity: paywallCoverUrl ? 0.55 : 0.35 }}
                          onError={(e) => { (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}images/drift-hero-woman.webp`; }}
                        />
                      )}
                      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 70% 30%, ${accentHex}28 0%, transparent 65%)` }} />
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="relative z-10 text-left">
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: accentHex }}>
                          {roomId.replace(/_/g, " ")}
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
                        <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)", color: "#a5b4fc", border: "1px solid rgba(165,180,252,0.2)" }}>
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
                  "Bedtime audio stories, written to slow you down",
                  "Every voice, fully personalised to your cast",
                  "Complete privacy — nothing stored, nothing shared",
                ].map(benefit => (
                  <div key={benefit} className="flex items-center gap-2.5 text-sm" style={{ color: "#a5b4fc" }}>
                    <Check className="w-3.5 h-3.5 flex-shrink-0 opacity-70" style={{ color: ACCENT }} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Personalised bridge copy */}
              <p className="text-center text-xs text-muted-foreground/80 leading-relaxed">
                Your casting is saved. Subscribe and your story writes immediately.
              </p>

              {/* Primary CTAs */}
              <div className="w-full flex flex-col gap-2">
                {/* Annual — primary hero */}
                <button
                  disabled={!!paywallLoadingPlan}
                  onClick={() => void startDriftCheckout("annual")}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-white text-base transition-all hover:-translate-y-0.5 disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #4338ca)`, boxShadow: `0 0 28px rgba(99,102,241,0.3)` }}
                >
                  <span className="flex items-center gap-2">
                    {paywallLoadingPlan === "annual" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Hear my story — <span className="tabular-nums">{annual.equivalentMonthlyDisplay}</span>/mo</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-white/80 text-[9px] font-bold uppercase tracking-wider">Best value</span>
                  </span>
                  <span className="text-xs text-white/80">billed annually</span>
                </button>

                {/* Monthly — secondary */}
                <button
                  disabled={!!paywallLoadingPlan}
                  onClick={() => void startDriftCheckout("monthly")}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                  style={{ border: `1px solid rgba(99,102,241,0.35)`, color: "#a5b4fc" }}
                >
                  {paywallLoadingPlan === "monthly" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  Monthly — <span className="tabular-nums">{monthly.display}</span>/month
                </button>
              </div>

              {/* Privacy signal + start over */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-[11px] text-muted-foreground/80">
                  Nothing stored. No history. Heard only by you.
                </p>
                <button
                  type="button"
                  onClick={() => { setPhase("scenario"); setSelectedScenario(null); setPaywallCapture(null); }}
                  className="text-xs text-muted-foreground/80 hover:text-muted-foreground transition-colors underline underline-offset-2"
                >
                  Start over
                </button>
              </div>
            </div>
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
    </>
  );
}
