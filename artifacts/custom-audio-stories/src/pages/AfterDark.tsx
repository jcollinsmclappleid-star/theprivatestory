import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ArrowLeft, Moon } from "lucide-react";
import { useGenerateFullStory } from "@workspace/api-client-react";
import type { FullGeneratedStory } from "@workspace/api-client-react";
import { useAudioPlayer } from "@/store/use-audio-player";
import { useAuth } from "@/hooks/useAuth";
import { CastingRoom } from "@/components/CastingRoom";
import type { CastingRoomResult } from "@/components/CastingRoom";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const SCENARIOS = [
  {
    id: "power_play",
    label: "Power Play",
    sub: "Control given. Control taken. Both wanted.",
    gradient: "from-[#120000] via-[#200000] to-[#0a0000]",
    accent: "#c0392b",
    storyMode: "forbidden",
    tags: ["He's completely in control", "Control held, then released"],
  },
  {
    id: "off_limits",
    label: "Off Limits",
    sub: "You shouldn't. He shouldn't. You both do.",
    gradient: "from-[#0a0010] via-[#14001c] to-[#070008]",
    accent: "#a855f7",
    storyMode: "forbidden",
    tags: ["He shouldn't, and neither should you", "The risk is part of the pull"],
  },
  {
    id: "role_reversal",
    label: "Role Reversal",
    sub: "She commands. He surrenders. Everything shifts.",
    gradient: "from-[#100010] via-[#180018] to-[#0a000a]",
    accent: "#ec4899",
    storyMode: "unrestrained",
    tags: ["I'm completely in control", "I take what I want"],
  },
  {
    id: "voyeur",
    label: "Voyeur",
    sub: "Watching. Being watched. Every moment deliberate.",
    gradient: "from-[#001010] via-[#001818] to-[#000808]",
    accent: "#14b8a6",
    storyMode: "unrestrained",
    tags: ["Being the only thing he is thinking about"],
  },
  {
    id: "historical",
    label: "Historical",
    sub: "Another era. The same desires. Wilder constraints.",
    gradient: "from-[#100800] via-[#1e1200] to-[#0a0600]",
    accent: "#d97706",
    storyMode: "forbidden",
    tags: ["Something between you that should be forbidden"],
  },
  {
    id: "group_dynamic",
    label: "Group Dynamic",
    sub: "More than two. Desire gets complicated.",
    gradient: "from-[#060010] via-[#0a001a] to-[#04000b]",
    accent: "#8b5cf6",
    storyMode: "unrestrained",
    tags: ["Complete presence, nothing held back"],
  },
];

const LOADING_PHASES = [
  { label: "Setting the scene…", sub: "Building the world behind closed doors" },
  { label: "Writing the story…", sub: "Crafting every moment with full presence" },
  { label: "Adding depth…", sub: "Layering the emotional weight and tension" },
  { label: "Refining the edge…", sub: "Making every scene land exactly right" },
  { label: "Composing imagery…", sub: "Designing cinematic visuals" },
  { label: "Finalizing…", sub: "Your private story is almost ready" },
];

function ScenarioCard({ scenario, selected, onClick }: {
  scenario: typeof SCENARIOS[0];
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden rounded-2xl border transition-all w-full text-left p-5 ${
        selected
          ? "border-[#c0392b]/60 shadow-[0_0_20px_rgba(192,57,43,0.2)]"
          : "border-white/8 hover:border-[#c0392b]/30"
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${scenario.gradient}`} />
      <motion.div
        animate={{ opacity: selected ? [0.4, 0.7, 0.4] : [0.15, 0.3, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 70% 40%, ${scenario.accent}25 0%, transparent 65%)` }}
      />
      <div className="relative z-10">
        <p className="font-bold text-white text-base mb-1">{scenario.label}</p>
        <p className="text-white/55 text-sm leading-snug">{scenario.sub}</p>
      </div>
      {selected && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#c0392b] animate-pulse" />
      )}
    </motion.button>
  );
}

export default function AfterDark() {
  const { isAuthenticated, isLoading: authLoading, openSignIn } = useAuth();
  const [phase, setPhase] = useState<"scenario" | "casting" | "generating" | "result">("scenario");
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null);
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
      phaseTimersRef.current.push(setTimeout(() => setLoadingPhase(Math.min(i + 1, LOADING_PHASES.length - 1)), cumulativeMs));
    });
  }, []);

  const stopLoadingPhase = useCallback(() => {
    phaseTimersRef.current.forEach(clearTimeout);
    phaseTimersRef.current = [];
  }, []);

  const applyResultToPlayer = useCallback((data: FullGeneratedStory) => {
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
  }, [play]);

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

  const handleCastingComplete = useCallback(async (casting: CastingRoomResult) => {
    if (!selectedScenario) return;
    setPhase("generating");
    startLoadingPhase();

    const scenarioContext = `${selectedScenario.label}: ${selectedScenario.sub}`;
    const fullPrompt = [scenarioContext, casting.scenarioPrompt].filter(Boolean).join(" ");

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
          experienceTags: selectedScenario.tags,
        },
      });
    } finally {
      stopLoadingPhase();
    }
  }, [selectedScenario, generateMutation, startLoadingPhase, stopLoadingPhase]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#c0392b] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "radial-gradient(ellipse, rgba(192,57,43,0.15) 0%, transparent 70%)", border: "1px solid rgba(192,57,43,0.3)" }}>
          <Moon className="w-7 h-7" style={{ color: "#c0392b" }} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "#c0392b" }}>After Dark</p>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Private access only</h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            Sign in to access the After Dark collection. Your stories stay completely private.
          </p>
        </div>
        <button
          onClick={openSignIn}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white transition-all"
          style={{ background: "linear-gradient(135deg, #c0392b, #922b21)" }}
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen" style={{ background: "linear-gradient(180deg, #050505 0%, #0a0305 100%)" }}>
      <AnimatePresence mode="wait">

        {/* Scenario Selection */}
        {phase === "scenario" && (
          <motion.div
            key="scenario"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="max-w-2xl mx-auto px-4 py-12"
          >
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)" }}>
                  <Moon className="w-4 h-4" style={{ color: "#c0392b" }} />
                </div>
                <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "#c0392b" }}>After Dark</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
                What's your fantasy?
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                Choose your scenario. Everything that follows is written without restraint.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {SCENARIOS.map(scenario => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  selected={selectedScenario?.id === scenario.id}
                  onClick={() => setSelectedScenario(scenario)}
                />
              ))}
            </div>

            <button
              onClick={() => { if (selectedScenario) setPhase("casting"); }}
              disabled={!selectedScenario}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all text-white ${
                selectedScenario
                  ? "hover:-translate-y-0.5"
                  : "opacity-40 cursor-not-allowed"
              }`}
              style={selectedScenario ? {
                background: "linear-gradient(135deg, #c0392b, #922b21)",
                boxShadow: "0 0 30px rgba(192,57,43,0.3)",
              } : { background: "#1a1a1a" }}
            >
              <Sparkles className="w-5 h-5" />
              Continue
            </button>
          </motion.div>
        )}

        {/* Casting Room (After Dark mode) */}
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
                  <span className="text-xs font-medium text-[#c0392b]/80">{selectedScenario.label}</span>
                </div>
              )}
            </div>
            <CastingRoom
              onComplete={handleCastingComplete}
              onSkip={() => handleCastingComplete({
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
              })}
              afterDark={true}
            />
          </motion.div>
        )}

        {/* Generating */}
        {phase === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="relative mb-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ border: "1px solid rgba(192,57,43,0.3)" }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Moon className="w-8 h-8" style={{ color: "#c0392b" }} />
                </motion.div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full"
                style={{ border: "1px solid rgba(192,57,43,0.15)" }}
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
                <p className="text-muted-foreground text-sm">{LOADING_PHASES[loadingPhase].sub}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex gap-2 items-center">
              {LOADING_PHASES.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === loadingPhase ? 32 : i < loadingPhase ? 16 : 8,
                    opacity: i <= loadingPhase ? 1 : 0.25,
                  }}
                  className="h-1 rounded-full"
                  style={{ background: i <= loadingPhase ? "#c0392b" : "#333" }}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-8 max-w-xs">
              Your story is written with full presence and complete privacy.
            </p>
          </motion.div>
        )}

        {/* Result */}
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
                  <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "#c0392b" }}>
                    After Dark · Private
                  </p>
                  <h1 className="font-display text-4xl font-bold text-foreground mb-2">{result.title}</h1>
                  <p className="text-muted-foreground text-sm max-w-xl">{result.description}</p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="prose prose-invert max-w-none">
                  {result.scenes.map((scene, i) => (
                    <div key={scene.id ?? i} className="mb-8">
                      <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "#c0392b" }}>
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
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white border border-[#c0392b]/30 hover:border-[#c0392b]/60 transition-all"
              style={{ background: "rgba(192,57,43,0.08)" }}
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
