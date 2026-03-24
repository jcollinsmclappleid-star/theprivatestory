import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Play, Volume2, ChevronLeft, Headphones } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerateFullStory } from "@workspace/api-client-react";
import type { FullGeneratedStory } from "@workspace/api-client-react";
import { useAudioPlayer } from "@/store/use-audio-player";

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
  { label: "Composing the visuals…", sub: "Designing cinematic imagery for each scene" },
  { label: "Rendering the artwork…", sub: "Generating premium visuals in parallel" },
  { label: "Narrating your story…", sub: "Bringing the voice to life" },
];

export default function Create() {
  const [step, setStep] = useState<"form" | "generating" | "result">("form");
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<FullGeneratedStory | null>(null);
  const { play, isPlaying, togglePlay, progress, currentStory } = useAudioPlayer();

  const generateMutation = useGenerateFullStory({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
        setStep("result");

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
      onError: () => {
        setStep("form");
      },
    },
  });

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
    setLoadingPhase(0);

    const phaseMs = [8000, 25000, 15000, 40000, 25000];
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulativeMs = 0;
    phaseMs.forEach((ms, i) => {
      cumulativeMs += ms;
      timers.push(setTimeout(() => setLoadingPhase(Math.min(i + 1, LOADING_PHASES.length - 1)), cumulativeMs));
    });

    try {
      await generateMutation.mutateAsync({
        listenerName: data.listenerName ?? "",
        mood: data.mood,
        intensity: data.intensity,
        voiceFeel: data.voiceFeel,
        storyLength: data.storyLength,
        scenarioPrompt: data.scenarioPrompt,
        cinematicVisuals: data.cinematicVisuals,
        emotionalFocus: data.emotionalFocus,
      });
    } finally {
      timers.forEach(clearTimeout);
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
        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
          isSelected
            ? "bg-primary text-primary-foreground shadow-glow border-primary"
            : "bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
      </button>
    );
  };

  const activeSceneIndex =
    result && currentStory?.id === result.id
      ? Math.min(Math.floor(progress * result.scenes.length), result.scenes.length - 1)
      : 0;

  const activeSceneImage =
    result?.images.scenes[activeSceneIndex] ?? result?.images.cover ?? "";

  const isThisPlaying = isPlaying && currentStory?.id === result?.id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-32 h-32 text-primary" />
            </div>

            <div className="mb-10 relative z-10">
              <h1 className="text-4xl font-display font-bold text-foreground mb-4">
                Create Your Story
              </h1>
              <p className="text-muted-foreground text-lg">
                Set the mood. We'll architect everything else.
              </p>
            </div>

            {generateMutation.isError && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {generateMutation.error instanceof Error
                  ? generateMutation.error.message
                  : "Story generation failed. Please try again."}
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 relative z-10">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3 uppercase tracking-wider">
                  Your Name{" "}
                  <span className="normal-case text-muted-foreground font-normal tracking-normal">
                    (optional)
                  </span>
                </label>
                <input
                  {...form.register("listenerName")}
                  placeholder="What should the narrator call you?"
                  className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3 uppercase tracking-wider">
                  Genre & Mood
                </label>
                <div className="flex flex-wrap gap-3">
                  {MOODS.map((m) => (
                    <OptionPill key={m} label={m} field="mood" value={m} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3 uppercase tracking-wider">
                  Intensity
                </label>
                <div className="flex flex-wrap gap-3">
                  {INTENSITIES.map((m) => (
                    <OptionPill key={m} label={m} field="intensity" value={m} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3 uppercase tracking-wider">
                  Narrator Voice
                </label>
                <div className="flex flex-wrap gap-3">
                  {VOICES.map((m) => (
                    <OptionPill key={m} label={m} field="voiceFeel" value={m} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3 uppercase tracking-wider">
                  Duration
                </label>
                <div className="flex flex-wrap gap-3">
                  {LENGTHS.map((m) => (
                    <OptionPill key={m} label={m} field="storyLength" value={m} />
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-foreground mb-3 uppercase tracking-wider">
                  <span>Scenario</span>
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue(
                        "scenarioPrompt",
                        SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)]
                      )
                    }
                    className="text-primary hover:underline text-xs flex items-center gap-1 normal-case"
                  >
                    <Wand2 className="w-3 h-3" /> Inspire me
                  </button>
                </label>
                <textarea
                  {...form.register("scenarioPrompt")}
                  placeholder="Describe the feeling, the tension, the moment you want to inhabit…"
                  rows={4}
                  className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                />
                {form.formState.errors.scenarioPrompt && (
                  <p className="text-destructive text-xs mt-1">
                    {form.formState.errors.scenarioPrompt.message}
                  </p>
                )}
              </div>

              <div className="flex gap-6 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...form.register("cinematicVisuals")}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    More cinematic visuals
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...form.register("emotionalFocus")}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Deeper emotional focus
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-border/50">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-5 rounded-2xl font-bold text-lg hover:shadow-glow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  Create My Story
                </button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Takes 1–2 minutes to craft your personalised story
                </p>
              </div>
            </form>
          </motion.div>
        )}

        {step === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[70vh] text-center"
          >
            <div className="relative w-40 h-40 mb-10">
              <div
                className="absolute inset-0 rounded-full border border-primary/20 animate-ping"
                style={{ animationDuration: "3s" }}
              />
              <div
                className="absolute inset-4 rounded-full border border-primary/40 animate-ping"
                style={{ animationDuration: "2s" }}
              />
              <div
                className="absolute inset-8 rounded-full border border-primary/60 animate-ping"
                style={{ animationDuration: "1.2s" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={loadingPhase}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
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
                onClick={() => setStep("form")}
                className="border border-border/50 text-muted-foreground py-4 rounded-2xl hover:border-primary/30 hover:text-foreground transition-all text-sm font-medium"
              >
                Create a new story
              </button>
              <button
                onClick={() => {
                  if (!result.audioUrl) return;
                  const storyForPlayer = {
                    id: result.id,
                    title: result.title,
                    description: result.description,
                    mood: result.mood,
                    tags: [result.mood],
                    duration: result.duration,
                    coverImage: result.images.cover,
                    audioUrl: result.audioUrl,
                    isPremium: false,
                    isNew: true,
                    scenes: result.scenes.map((s, i) => ({
                      ...s,
                      image: result.images.scenes[i],
                    })),
                  };
                  play(storyForPlayer as Parameters<typeof play>[0]);
                }}
                disabled={!result.audioUrl}
                className="bg-card border border-border/50 text-foreground py-4 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Play in full player
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
