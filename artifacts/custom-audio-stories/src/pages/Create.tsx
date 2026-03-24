import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Play, Volume2, ChevronLeft, Headphones, Heart, Shuffle, BookOpen, X, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerateFullStory } from "@workspace/api-client-react";
import type { FullGeneratedStory } from "@workspace/api-client-react";
import { useAudioPlayer } from "@/store/use-audio-player";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const formSchema = z.object({
  listenerName: z.string().optional().default(""),
  mood: z.string().min(1, "Select a mood"),
  intensity: z.string(),
  voiceFeel: z.string(),
  storyLength: z.string(),
  scenarioPrompt: z.string().min(5, "Please provide a brief prompt"),
  cinematicVisuals: z.boolean(),
  emotionalFocus: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

const MOODS = ["Slow Burn", "Late Night", "Emotional", "Forbidden", "First Encounter", "Tender"];
const INTENSITIES = ["Soft", "Warm", "Magnetic"];
const VOICES = ["Soft Voice", "Deep Voice", "Breathy Voice", "Confident Voice"];
const LENGTHS = ["3 min", "5 min", "10 min"];

const SAMPLE_PROMPTS = [
  "A rainy evening in a Tokyo hotel room, waiting for a knock at the door.",
  "A late night drive through empty city streets, the radio low, the air between you electric.",
  "A stolen weekend at a coastal cottage, two people who shouldn't be here.",
  "A chance reunion at a rooftop bar, someone you thought you'd never see again.",
  "An overnight train through mountains, a stranger in the seat across from you.",
];

const LOADING_PHASES = [
  { label: "Architecting your story…", sub: "Building the emotional arc and scene structure" },
  { label: "Writing the narrative…", sub: "Crafting the scenes, tension, and pacing" },
  { label: "Reviewing your story…", sub: "Checking emotional quality and depth" },
  { label: "Refining the ending…", sub: "Ensuring every scene lands the way it should" },
  { label: "Composing the visuals…", sub: "Designing cinematic imagery for each scene" },
  { label: "Rendering the artwork…", sub: "Generating premium visuals in parallel" },
  { label: "Narrating your story…", sub: "Bringing the voice to life" },
];

const VARIATION_OPTIONS = [
  { id: "softer", label: "Softer", description: "More tenderness, less tension." },
  { id: "darker", label: "Darker", description: "Heavier atmosphere, deeper pull." },
  { id: "slower", label: "Slower", description: "Longer pauses, more emotional build." },
  { id: "more_emotional", label: "More Emotional", description: "More vulnerability, more emotional weight." },
  { id: "new_ending", label: "New Ending", description: "Keep the story, change the final note." },
  { id: "new_setting", label: "New Setting", description: "Keep the chemistry, move the world around it." },
  { id: "continue_chemistry", label: "Continue the Chemistry", description: "Carry the emotional thread forward." },
];

const CONTINUATION_OPTIONS = [
  { id: "keep_same_mood", label: "Keep the same mood", description: "Seamlessly pick up where it left off." },
  { id: "raise_stakes", label: "Raise the emotional stakes", description: "Push toward something more intense." },
  { id: "softer_continuation", label: "Softer continuation", description: "Move to a quieter, more intimate register." },
  { id: "unresolved_continuation", label: "Lingering continuation", description: "More unresolved. Even more charged." },
];

function OptionCard<T extends string>({
  option,
  selected,
  onSelect,
}: {
  option: { id: T; label: string; description: string };
  selected: boolean;
  onSelect: (id: T) => void;
}) {
  return (
    <button
      onClick={() => onSelect(option.id)}
      className={`w-full text-left p-4 rounded-2xl border transition-all ${
        selected
          ? "border-primary bg-primary/10 shadow-glow"
          : "border-border/30 bg-card/40 hover:border-primary/30 hover:bg-primary/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground text-sm mb-0.5">{option.label}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{option.description}</p>
        </div>
        {selected && <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />}
      </div>
    </button>
  );
}

export default function Create() {
  const [step, setStep] = useState<"form" | "generating" | "result">("form");
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<FullGeneratedStory | null>(null);
  const [resultSaved, setResultSaved] = useState(false);
  const [savePending, setSavePending] = useState(false);

  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<string>("softer");
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);

  const [continueModalOpen, setContinueModalOpen] = useState(false);
  const [selectedContinuation, setSelectedContinuation] = useState<string>("keep_same_mood");
  const [isGeneratingContinuation, setIsGeneratingContinuation] = useState(false);

  const phaseTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { play, isPlaying, togglePlay, progress, currentStory } = useAudioPlayer();

  const handleResultSave = useCallback(async () => {
    if (!result || savePending) return;
    setSavePending(true);
    const nextSaved = !resultSaved;
    setResultSaved(nextSaved);
    try {
      await fetch(`${API_BASE}/api/save-story`, {
        method: nextSaved ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ storyId: result.id }),
      });
      if (nextSaved) {
        fetch(`${API_BASE}/api/update-taste`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ mood: result.mood, event: "saved" }),
        }).catch(() => {});
      }
    } catch {
      setResultSaved(!nextSaved);
    } finally {
      setSavePending(false);
    }
  }, [result, resultSaved, savePending]);

  const startLoadingPhase = useCallback(() => {
    phaseTimersRef.current.forEach(clearTimeout);
    phaseTimersRef.current = [];
    setLoadingPhase(0);
    const phaseMs = [8000, 20000, 12000, 12000, 12000, 35000, 20000];
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
        setResultSaved(false);
        setStep("result");
        applyResultToPlayer(data);
      },
      onError: () => {
        stopLoadingPhase();
        setStep("form");
      },
    },
  });

  const handleGenerateVariation = useCallback(async () => {
    if (!result || isGeneratingVariation) return;
    setVariationModalOpen(false);
    setIsGeneratingVariation(true);
    setStep("generating");
    startLoadingPhase();

    try {
      const res = await fetch(`${API_BASE}/api/generate-variation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ storyId: result.id, variation_type: selectedVariation }),
      });
      if (!res.ok) throw new Error("Variation generation failed");
      const data = await res.json() as FullGeneratedStory;
      stopLoadingPhase();
      setResult(data);
      setResultSaved(false);
      setStep("result");
      applyResultToPlayer(data);
    } catch {
      stopLoadingPhase();
      setStep("result");
    } finally {
      setIsGeneratingVariation(false);
    }
  }, [result, isGeneratingVariation, selectedVariation, startLoadingPhase, stopLoadingPhase, applyResultToPlayer]);

  const handleGenerateContinuation = useCallback(async () => {
    if (!result || isGeneratingContinuation) return;
    setContinueModalOpen(false);
    setIsGeneratingContinuation(true);
    setStep("generating");
    startLoadingPhase();

    try {
      const res = await fetch(`${API_BASE}/api/continue-story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ storyId: result.id, continuation_mode: selectedContinuation }),
      });
      if (!res.ok) throw new Error("Continuation generation failed");
      const data = await res.json() as FullGeneratedStory;
      stopLoadingPhase();
      setResult(data);
      setResultSaved(false);
      setStep("result");
      applyResultToPlayer(data);
    } catch {
      stopLoadingPhase();
      setStep("result");
    } finally {
      setIsGeneratingContinuation(false);
    }
  }, [result, isGeneratingContinuation, selectedContinuation, startLoadingPhase, stopLoadingPhase, applyResultToPlayer]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listenerName: "",
      mood: "Slow Burn",
      intensity: "Warm",
      voiceFeel: "Soft Voice",
      storyLength: "5 min",
      scenarioPrompt: "",
      cinematicVisuals: true,
      emotionalFocus: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setStep("generating");
    startLoadingPhase();

    try {
      await generateMutation.mutateAsync({
        data: {
          listenerName: data.listenerName ?? "",
          mood: data.mood,
          intensity: data.intensity,
          voiceFeel: data.voiceFeel,
          storyLength: data.storyLength,
          scenarioPrompt: data.scenarioPrompt,
          cinematicVisuals: data.cinematicVisuals,
          emotionalFocus: data.emotionalFocus,
        },
      });
    } finally {
      stopLoadingPhase();
    }
  };

  const OptionPill = ({
    label,
    field,
    value,
  }: {
    label: string;
    field: keyof FormData;
    value: string;
  }) => {
    const isSelected = form.watch(field) === value;
    return (
      <button
        type="button"
        onClick={() => form.setValue(field, value as never)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
          isSelected
            ? "bg-primary text-primary-foreground border-primary shadow-glow"
            : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
        }`}
      >
        {label}
      </button>
    );
  };

  const isThisPlaying = isPlaying && currentStory?.id === result?.id;
  const activeSceneIndex = result
    ? Math.min(Math.floor(progress * result.scenes.length), result.scenes.length - 1)
    : 0;
  const activeSceneImage = result?.images?.scenes?.[activeSceneIndex] ?? result?.images?.cover ?? "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full">
      <AnimatePresence mode="wait">

        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary mb-2">Story Studio</p>
              <h1 className="font-display text-4xl font-bold text-foreground mb-2">Create Your Story</h1>
              <p className="text-muted-foreground">Set the emotional tone and let us craft something intimate and personal.</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Your Name <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  {...form.register("listenerName")}
                  placeholder="How should the story address you?"
                  className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-4">Mood</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((mood) => (
                    <OptionPill key={mood} label={mood} field="mood" value={mood} />
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Intensity</label>
                  <div className="flex gap-2">
                    {INTENSITIES.map((i) => (
                      <OptionPill key={i} label={i} field="intensity" value={i} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Narrator Voice</label>
                  <div className="flex flex-wrap gap-2">
                    {VOICES.map((v) => (
                      <OptionPill key={v} label={v} field="voiceFeel" value={v} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Length</label>
                  <div className="flex gap-2">
                    {LENGTHS.map((l) => (
                      <OptionPill key={l} label={l} field="storyLength" value={l} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-3">Your Scenario</label>
                <textarea
                  {...form.register("scenarioPrompt")}
                  rows={4}
                  placeholder="Describe a setting, a feeling, or a situation…"
                  className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
                {form.formState.errors.scenarioPrompt && (
                  <p className="text-xs text-red-400 mt-1">{form.formState.errors.scenarioPrompt.message}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {SAMPLE_PROMPTS.slice(0, 3).map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => form.setValue("scenarioPrompt", prompt)}
                      className="text-xs text-muted-foreground border border-border/30 rounded-full px-3 py-1.5 hover:border-primary/30 hover:text-foreground transition-all"
                    >
                      {prompt.slice(0, 50)}…
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-4">Enhancements</label>
                <div className="space-y-3">
                  {[
                    { field: "cinematicVisuals" as const, label: "Cinematic Visuals", sub: "AI-generated artwork for each scene" },
                    { field: "emotionalFocus" as const, label: "Emotional Focus", sub: "Prioritise emotional depth and vulnerability" },
                  ].map(({ field, label, sub }) => (
                    <label key={field} className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          {...form.register(field)}
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-6 rounded-full transition-all ${form.watch(field) ? "bg-primary" : "bg-border/50"}`}
                          onClick={() => form.setValue(field, !form.watch(field))}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.watch(field) ? "left-5" : "left-1"}`} />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Wand2 className="w-5 h-5" />
                Generate My Story
              </button>
            </form>
          </motion.div>
        )}

        {step === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="relative mb-10">
              <div className="w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-primary/10"
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
                    opacity: i <= loadingPhase ? 1 : 0.3,
                  }}
                  className={`h-1 rounded-full ${i <= loadingPhase ? "bg-primary" : "bg-border"}`}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-8 max-w-xs">
              Our AI is running a full cinematic pipeline — story planning, writing, visual generation, and narration.
            </p>
          </motion.div>
        )}

        {step === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <button
              onClick={() => setStep("form")}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Create another
            </button>

            {result.variant_type && (
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <Shuffle className="w-3.5 h-3.5" />
                Variation: {VARIATION_OPTIONS.find(v => v.id === result.variant_type)?.label ?? result.variant_type}
              </div>
            )}
            {result.parent_story_id && !result.variant_type && (
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <BookOpen className="w-3.5 h-3.5" />
                Continued story
              </div>
            )}

            <div className="glass-panel rounded-3xl overflow-hidden">
              <div className="relative aspect-video">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeSceneIndex}
                    src={activeSceneImage}
                    alt={`Scene ${activeSceneIndex + 1}`}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

                <div className="absolute bottom-0 left-0 p-8 z-10">
                  <p className="text-primary text-xs font-medium uppercase tracking-widest mb-2">
                    {result.mood} · AI Generated
                  </p>
                  <h1 className="font-display text-4xl font-bold text-foreground mb-3">
                    {result.title}
                  </h1>
                  <p className="text-muted-foreground text-base max-w-xl leading-relaxed">
                    {result.description}
                  </p>
                </div>

                {isThisPlaying && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-primary text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {result.scenes[activeSceneIndex]?.heading ?? `Scene ${activeSceneIndex + 1}`}
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="flex items-center gap-4 mb-8 flex-wrap">
                  {result.audioUrl ? (
                    <button
                      onClick={togglePlay}
                      className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-glow"
                    >
                      {isThisPlaying ? (
                        <Volume2 className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                      {isThisPlaying ? "Playing…" : "Play Story"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 bg-muted/30 text-muted-foreground px-6 py-3 rounded-full border border-border/50 text-sm">
                      <Headphones className="w-4 h-4" />
                      Connect ElevenLabs for audio narration
                    </div>
                  )}
                  <button
                    onClick={handleResultSave}
                    disabled={savePending}
                    className={`p-3 rounded-full border transition-all disabled:opacity-50 ${
                      resultSaved
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                    title={resultSaved ? "Saved to library" : "Save to library"}
                  >
                    <Heart className={`w-5 h-5 ${resultSaved ? "fill-current" : ""}`} />
                  </button>
                  <span className="text-muted-foreground text-sm">
                    {result.duration} · {result.scenes.length} scenes
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
                    Story Scenes
                  </p>
                  {result.scenes.map((scene, i) => {
                    const isActiveScene = currentStory?.id === result.id && activeSceneIndex === i;
                    return (
                      <motion.div
                        key={scene.id}
                        animate={{
                          borderColor: isActiveScene
                            ? "hsl(var(--primary) / 0.5)"
                            : "hsl(var(--border) / 0.3)",
                          backgroundColor: isActiveScene
                            ? "hsl(var(--primary) / 0.05)"
                            : "transparent",
                        }}
                        className="flex gap-4 p-4 rounded-xl border transition-colors"
                      >
                        {result.images.scenes[i] && (
                          <div className="relative flex-shrink-0">
                            <img
                              src={result.images.scenes[i]}
                              alt={scene.heading ?? `Scene ${i + 1}`}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            {isActiveScene && (
                              <div className="absolute inset-0 rounded-lg border-2 border-primary/60 flex items-center justify-center bg-black/30">
                                <Volume2 className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              {i + 1}.
                            </span>
                            <span className="text-sm font-medium text-foreground truncate">
                              {scene.heading ?? `Scene ${i + 1}`}
                            </span>
                            {isActiveScene && (
                              <span className="text-xs text-primary font-medium flex-shrink-0">
                                · Now playing
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {scene.text}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setVariationModalOpen(true)}
                disabled={isGeneratingVariation}
                className="flex items-center justify-center gap-2 border border-border/50 text-foreground py-4 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Shuffle className="w-4 h-4" />
                Regenerate Variation
              </button>
              <button
                onClick={() => setContinueModalOpen(true)}
                disabled={isGeneratingContinuation}
                className="flex items-center justify-center gap-2 bg-card border border-border/50 text-foreground py-4 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <BookOpen className="w-4 h-4" />
                Create Your Next Chapter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Variation Modal */}
      <AnimatePresence>
        {variationModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setVariationModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="w-full max-w-lg bg-card border border-border/40 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-border/30 flex items-start justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Regenerate this story</h2>
                  <p className="text-sm text-muted-foreground mt-1">Keep the emotional core, shift the shape.</p>
                </div>
                <button
                  onClick={() => setVariationModalOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-2 max-h-[60vh] overflow-y-auto">
                {VARIATION_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.id}
                    option={opt}
                    selected={selectedVariation === opt.id}
                    onSelect={setSelectedVariation}
                  />
                ))}
              </div>

              <div className="p-6 border-t border-border/30 flex gap-3">
                <button
                  onClick={() => setVariationModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-border/50 text-muted-foreground text-sm font-medium hover:text-foreground hover:border-primary/30 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateVariation}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-glow"
                >
                  Generate Variation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue Story Modal */}
      <AnimatePresence>
        {continueModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setContinueModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="w-full max-w-lg bg-card border border-border/40 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-border/30 flex items-start justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Create your next chapter</h2>
                  <p className="text-sm text-muted-foreground mt-1">Choose how you want the story to continue.</p>
                </div>
                <button
                  onClick={() => setContinueModalOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-2">
                {CONTINUATION_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.id}
                    option={opt}
                    selected={selectedContinuation === opt.id}
                    onSelect={setSelectedContinuation}
                  />
                ))}
              </div>

              <div className="p-6 border-t border-border/30 flex gap-3">
                <button
                  onClick={() => setContinueModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-border/50 text-muted-foreground text-sm font-medium hover:text-foreground hover:border-primary/30 transition-all"
                >
                  Not now
                </button>
                <button
                  onClick={handleGenerateContinuation}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-glow"
                >
                  Generate Next Chapter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
