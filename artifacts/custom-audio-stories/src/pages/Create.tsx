import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Play, Volume2, ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAudioPlayer } from "@/store/use-audio-player";

const formSchema = z.object({
  listenerName: z.string().min(1, "Name is required"),
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
];

interface GeneratedResult {
  id: string;
  title: string;
  description: string;
  mood: string;
  audioUrl: string;
  duration: string;
  scenes: Array<{ id: number; text: string; visualPrompt: string; durationEstimate: number; image?: string }>;
  images: { cover: string; scenes: string[] };
  cached: boolean;
}

const LOADING_PHASES = [
  "Crafting your story…",
  "Weaving the narrative…",
  "Synthesising the voice…",
  "Rendering the visuals…",
  "Polishing the final experience…",
];

export default function Create() {
  const [step, setStep] = useState<'form' | 'generating' | 'result'>('form');
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { play, isPlaying, togglePlay } = useAudioPlayer();

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
    }
  });

  const onSubmit = async (data: FormData) => {
    setStep('generating');
    setError(null);
    setLoadingPhase(0);

    const phaseIntervals = LOADING_PHASES.map((_, i) =>
      setTimeout(() => setLoadingPhase(i), i * 8000 / LOADING_PHASES.length)
    );

    try {
      const response = await fetch('/api/generate-full-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listenerName: data.listenerName,
          mood: data.mood,
          intensity: data.intensity,
          voiceFeel: data.voiceFeel,
          storyLength: data.storyLength,
          scenarioPrompt: data.scenarioPrompt,
          cinematicVisuals: data.cinematicVisuals,
          emotionalFocus: data.emotionalFocus,
        }),
      });

      phaseIntervals.forEach(clearTimeout);

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const generated: GeneratedResult = await response.json();
      setResult(generated);
      setStep('result');

      const storyForPlayer = {
        id: generated.id,
        title: generated.title,
        description: generated.description,
        mood: generated.mood,
        tags: [generated.mood],
        duration: generated.duration,
        coverImage: generated.images.cover,
        audioUrl: generated.audioUrl,
        isPremium: false,
        isNew: true,
        scenes: generated.scenes.map((s, i) => ({
          ...s,
          image: generated.images.scenes[i],
        })),
      };

      setTimeout(() => play(storyForPlayer as Parameters<typeof play>[0]), 300);
    } catch (err) {
      phaseIntervals.forEach(clearTimeout);
      setError(err instanceof Error ? err.message : 'Story generation failed. Please try again.');
      setStep('form');
    }
  };

  const OptionPill = ({ label, field, value }: { label: string, field: keyof FormData, value: string }) => {
    const isSelected = form.watch(field) === value;
    return (
      <button
        type="button"
        onClick={() => form.setValue(field, value as never)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
          isSelected
            ? 'bg-primary text-primary-foreground shadow-glow border-primary'
            : 'bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <AnimatePresence mode="wait">

        {step === 'form' && (
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
              <h1 className="text-4xl font-display font-bold text-foreground mb-4">Create Your Story</h1>
              <p className="text-muted-foreground text-lg">Direct the narrative, mood, and voice. We'll craft the experience.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 relative z-10">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3 uppercase tracking-wider">Listener Name</label>
                <input
                  {...form.register("listenerName")}
                  placeholder="What should the narrator call you?"
                  className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {form.formState.errors.listenerName && (
                  <p className="text-destructive text-xs mt-1">{form.formState.errors.listenerName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3 uppercase tracking-wider">Genre & Mood</label>
                <div className="flex flex-wrap gap-3">
                  {MOODS.map(m => <OptionPill key={m} label={m} field="mood" value={m} />)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3 uppercase tracking-wider">Emotional Intensity</label>
                <div className="flex flex-wrap gap-3">
                  {INTENSITIES.map(m => <OptionPill key={m} label={m} field="intensity" value={m} />)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3 uppercase tracking-wider">Voice Feel</label>
                <div className="flex flex-wrap gap-3">
                  {VOICES.map(m => <OptionPill key={m} label={m} field="voiceFeel" value={m} />)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3 uppercase tracking-wider">Duration</label>
                <div className="flex flex-wrap gap-3">
                  {LENGTHS.map(m => <OptionPill key={m} label={m} field="storyLength" value={m} />)}
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-foreground mb-3 uppercase tracking-wider">
                  <span>Scenario Prompt</span>
                  <button
                    type="button"
                    onClick={() => form.setValue("scenarioPrompt", SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)])}
                    className="text-primary hover:underline text-xs flex items-center gap-1 normal-case"
                  >
                    <Wand2 className="w-3 h-3" /> Use sample
                  </button>
                </label>
                <textarea
                  {...form.register("scenarioPrompt")}
                  placeholder="Describe the setting, the dynamic, the tension you want to feel…"
                  rows={4}
                  className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                />
                {form.formState.errors.scenarioPrompt && (
                  <p className="text-destructive text-xs mt-1">{form.formState.errors.scenarioPrompt.message}</p>
                )}
              </div>

              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...form.register("cinematicVisuals")}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">More cinematic visuals</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...form.register("emotionalFocus")}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">More emotional focus</span>
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
              </div>
            </form>
          </motion.div>
        )}

        {step === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="relative w-40 h-40 mb-10">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-4 rounded-full border-2 border-primary/50 animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary opacity-60" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.h2
                key={loadingPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-3xl font-display font-bold text-foreground mb-4"
              >
                {LOADING_PHASES[loadingPhase]}
              </motion.h2>
            </AnimatePresence>

            <p className="text-muted-foreground max-w-sm">
              Our AI models are weaving together narrative, voice, and visuals for your personal experience.
            </p>

            <div className="mt-8 flex gap-1.5">
              {LOADING_PHASES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-700 ${i <= loadingPhase ? 'bg-primary w-8' : 'bg-border w-4'}`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setStep('form')}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Create another
              </button>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={result.images.cover}
                  alt={result.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">{result.mood}</p>
                  <h1 className="font-display text-4xl font-bold text-foreground mb-3">{result.title}</h1>
                  <p className="text-muted-foreground text-lg max-w-xl">{result.description}</p>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-glow"
                  >
                    {isPlaying ? <Volume2 className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isPlaying ? 'Playing…' : 'Play Story'}
                  </button>
                  <span className="text-muted-foreground text-sm">{result.duration} · AI generated</span>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground uppercase tracking-wider">Scenes</p>
                  {result.scenes.map((scene, i) => (
                    <div key={scene.id} className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/20 transition-colors">
                      {result.images.scenes[i] && (
                        <img
                          src={result.images.scenes[i]}
                          alt={`Scene ${i + 1}`}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Scene {i + 1} · ~{scene.durationEstimate}s</p>
                        <p className="text-sm text-foreground line-clamp-2">{scene.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('form')}
              className="w-full border border-border/50 text-muted-foreground py-4 rounded-2xl hover:border-primary/30 hover:text-foreground transition-all"
            >
              Create a new story
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
