import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Play, Volume2, ChevronLeft, Headphones, Heart, Shuffle, BookOpen, X, Check, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerateFullStory } from "@workspace/api-client-react";
import type { FullGeneratedStory } from "@workspace/api-client-react";
import { useAudioPlayer } from "@/store/use-audio-player";
import { useAuth } from "@/hooks/useAuth";
import { CastingRoom } from "@/components/CastingRoom";
import type { CastingRoomResult } from "@/components/CastingRoom";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const formSchema = z.object({
  listenerName: z.string().optional().default(""),
  partnerName: z.string().optional().default(""),
  mood: z.string().min(1),
  intensity: z.string(),
  voiceFeel: z.string(),
  storyLength: z.string(),
  scenarioPrompt: z.string().min(5, "Please describe a scenario"),
  cinematicVisuals: z.boolean(),
  emotionalFocus: z.boolean(),
  whoIsHe: z.string().optional().default(""),
  dynamic: z.string().optional().default(""),
  ending: z.string().optional().default(""),
  setting: z.string().optional().default(""),
  storyMode: z.string().default("romance"),
  experienceTags: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

const STORY_PATHS = [
  {
    id: "romance",
    label: "Romance",
    tagline: "Connection before everything",
    description: "A story led by feeling. Intimacy is a natural consequence of chemistry — unhurried and real.",
    suggestedIntensity: "Tender",
    highlightIntensities: ["Tender", "Heated"],
    mood: "Emotional",
  },
  {
    id: "slow_burn",
    label: "Slow Burn",
    tagline: "The almost is everything",
    description: "What is held back matters as much as what is given. The space between you is the story.",
    suggestedIntensity: "Tender",
    highlightIntensities: ["Tender", "Heated"],
    mood: "Slow Burn",
  },
  {
    id: "passionate",
    label: "Passionate",
    tagline: "Feeling and desire, equally",
    description: "Emotion doesn't restrain desire — it deepens it. Both are fully, unapologetically present.",
    suggestedIntensity: "Heated",
    highlightIntensities: ["Heated", "Explicit"],
    mood: "Emotional",
  },
  {
    id: "forbidden",
    label: "Forbidden",
    tagline: "The wanting is complicated",
    description: "There are reasons you shouldn't. None of them are persuasive enough.",
    suggestedIntensity: "Heated",
    highlightIntensities: ["Heated", "Explicit", "Scorching"],
    mood: "Forbidden",
  },
  {
    id: "unrestrained",
    label: "Unrestrained",
    tagline: "Nothing withheld",
    description: "Desire as the complete story. Every moment written with full presence and no restraint.",
    suggestedIntensity: "Explicit",
    highlightIntensities: ["Explicit", "Scorching"],
    mood: "Late Night",
  },
];

const PATH_EXPERIENCE_TAGS: Record<string, string[]> = {
  romance: [
    "Old feelings finding new words",
    "Chemistry without agenda",
    "Vulnerable and completely seen",
    "Tenderness as the whole story",
    "A love forming in the quiet",
    "Safe enough to want",
    "Two people who finally say it",
    "Closeness that took a long time coming",
  ],
  slow_burn: [
    "The anticipation is everything",
    "Restraint as a form of desire",
    "Every glance carries meaning",
    "The patience before the moment",
    "He waits for you to decide",
    "Wanting without reaching yet",
    "A tension that keeps building",
    "Almost — again and again",
  ],
  passionate: [
    "The moment it finally tips",
    "Something real between you",
    "No longer holding back",
    "Equal wanting, equal intensity",
    "Deep attraction breaking open",
    "A feeling that becomes physical",
    "Raw and completely present",
    "Desire that surprises you both",
  ],
  forbidden: [
    "He shouldn't, and neither should you",
    "Power alive in the room",
    "Something with edges",
    "The risk is part of the pull",
    "Control held, then released",
    "Complicated wanting",
    "A line that keeps moving",
    "The danger makes it real",
  ],
  unrestrained: [
    "Complete presence, nothing held back",
    "He knows exactly what you need",
    "Pure, unmediated desire",
    "Every moment fully written",
    "Total surrender",
    "The space between wanting and having, erased",
    "Nothing implied where it can be named",
    "Desire without apology",
  ],
};

const INTENSITIES = [
  { id: "Tender", label: "Tender", desc: "Emotional, slow burn, almost-touch" },
  { id: "Heated", label: "Heated", desc: "Desire building, physical presence" },
  { id: "Explicit", label: "Explicit", desc: "Fully rendered, nothing held back" },
  { id: "Scorching", label: "Scorching", desc: "Maximum intensity, no restraint" },
];

const WHO_IS_HE_OPTIONS = [
  "A stranger I'll never see again",
  "Someone I've wanted for a long time",
  "My ex",
  "Someone I shouldn't want",
  "My boss",
  "A bodyguard with orders not to touch me",
  "An old friend who finally says it",
  "Someone who wants only me",
];

const DYNAMIC_OPTIONS = [
  "He pursues, I decide",
  "I take what I want",
  "Equal desire, equal intensity",
  "He's completely in control",
  "I'm completely in control",
];

const ENDING_OPTIONS = [
  "Left wanting more",
  "Fully satisfied",
  "Tender afterglow",
  "Unresolved and open",
];

const VOICES = ["Soft Voice", "Deep Voice", "Breathy Voice", "Confident Voice"];
const LENGTHS = ["3 min", "5 min", "10 min"];

const SCENARIO_GROUPS = [
  {
    heading: "Settings & Places",
    items: [
      "A Tokyo hotel room, midnight, rain on the window",
      "A private members' club in Mayfair, after hours",
      "The last carriage of a night train through the Alps",
      "A borrowed beach house in January, nobody else for miles",
      "A rooftop apartment in Paris at 2am",
      "A Chateau Marmont suite, West Hollywood, past midnight",
      "A late-night raw bar in lower Manhattan",
      "A flooded piazza in Venice in November",
      "A glass-walled apartment in Singapore, city lights below",
      "A hillside villa terrace above Positano at dusk",
      "A boutique hotel in Marrakech, the city noise below",
      "A private charter cabin on a transatlantic flight",
    ],
  },
  {
    heading: "Who He Is",
    items: [
      "Your ex, here without warning or explanation",
      "Your boss who has been watching you for weeks",
      "A stranger on a flight you almost missed",
      "Someone you were specifically warned about",
      "A bodyguard with strict orders not to touch you",
      "An old friend who finally says what he means",
      "Someone who makes you want things you don't say aloud",
      "A man who has known you longer than you've known yourself",
      "Someone famous who has no business looking at you like that",
    ],
  },
  {
    heading: "The Situation",
    items: [
      "One last night before everything changes between you",
      "You've been pretending not to want each other for months",
      "Weeks of messages and this is the first time you've actually met",
      "You walked into the wrong room, and he was already in it",
      "A work trip that became something neither of you planned",
      "A dare that went further than either of you intended",
      "A reunion that was supposed to be simple and uncomplicated",
      "Stuck together by circumstance with nowhere else to go",
    ],
  },
  {
    heading: "The Tension",
    items: [
      "Something between you that should be forbidden",
      "He has a specific kind of power over you and both of you know it",
      "Years of unfinished business, one night to settle it",
      "He knows exactly what you want and is making you wait",
      "A secret you've both been keeping about how you feel",
      "He's seen something in you that no one else has noticed",
      "A boundary that has been bending for months",
    ],
  },
  {
    heading: "The Feeling",
    items: [
      "Being completely undone by someone who knows how",
      "Feeling safe enough to want what you actually want",
      "The specific pleasure of giving in, completely",
      "Being wanted without any reservation or condition",
      "The surrender of being truly seen by someone",
      "Being the only thing he is thinking about",
      "A boundary you didn't know you had, slowly dissolving",
    ],
  },
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

function ScenarioDropdown({ onSelect }: { onSelect: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-colors font-medium"
      >
        <Shuffle className="w-3.5 h-3.5" />
        Browse inspiration
      </button>
      {open && (
        <div className="absolute z-30 left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-border/60 bg-background/98 backdrop-blur-sm shadow-2xl">
          <div className="p-4 space-y-5">
            {SCENARIO_GROUPS.map((group) => (
              <div key={group.heading}>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-2 px-1">
                  {group.heading}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        onSelect(item);
                        setOpen(false);
                      }}
                      className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 px-3 py-2 rounded-xl transition-colors leading-snug"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const { isAuthenticated, isLoading: authLoading, openSignIn } = useAuth();
  const [step, setStep] = useState<"casting" | "preset-prompt" | "form" | "generating" | "result">("casting");
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<FullGeneratedStory | null>(null);
  const [resultSaved, setResultSaved] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [lastCastingData, setLastCastingData] = useState<Record<string, unknown> | null>(null);
  const [presetSaved, setPresetSaved] = useState(false);

  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<string>("softer");
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);

  const [continueModalOpen, setContinueModalOpen] = useState(false);
  const [selectedContinuation, setSelectedContinuation] = useState<string>("keep_same_mood");
  const [isGeneratingContinuation, setIsGeneratingContinuation] = useState(false);

  const [presetNameDraft, setPresetNameDraft] = useState("");
  const [pendingCastingData, setPendingCastingData] = useState<Record<string, unknown> | null>(null);
  const [perspective, setPerspective] = useState<"your" | "her" | "his">("your");
  const [castingPairing, setCastingPairing] = useState<string | undefined>();
  const [castingPartnerName, setCastingPartnerName] = useState<string | undefined>();
  const [castingHeritage, setCastingHeritage] = useState<string | undefined>();
  const [castingAtmosphere, setCastingAtmosphere] = useState<string | undefined>();
  const [castingChemistry, setCastingChemistry] = useState<string | undefined>();

  const phaseTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { play, isPlaying, togglePlay, progress, currentStory } = useAudioPlayer();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listenerName: "",
      partnerName: "",
      mood: "Emotional",
      intensity: "Tender",
      voiceFeel: "Soft Voice",
      storyLength: "5 min",
      scenarioPrompt: "",
      cinematicVisuals: true,
      emotionalFocus: false,
      whoIsHe: "",
      dynamic: "",
      ending: "",
      setting: "",
      storyMode: "romance",
      experienceTags: [],
    },
  });

  const handleSavePreset = useCallback(async () => {
    if (!lastCastingData || !isAuthenticated) return;
    const archetype = lastCastingData.archetype as string ?? "";
    const dynamic = lastCastingData.dynamic as string ?? "";
    const name = [archetype, dynamic].filter(Boolean).join(" · ") || "My Cast";
    try {
      await fetch(`${API_BASE}/api/me/presets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, castingData: lastCastingData }),
      });
      setPresetSaved(true);
    } catch { /* ignore */ }
  }, [lastCastingData, isAuthenticated]);

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

  // Pick up quickCreateParams or castingPreset injected by Profile page (runs once on mount)
  useEffect(() => {
    const qcp = sessionStorage.getItem("quickCreateParams");
    if (qcp) {
      sessionStorage.removeItem("quickCreateParams");
      try {
        const params = JSON.parse(qcp) as FormData;
        Object.entries(params).forEach(([k, v]) => form.setValue(k as keyof FormData, v as never));
        setStep("generating");
        startLoadingPhase();
        generateMutation.mutateAsync({ data: params }).finally(() => stopLoadingPhase());
      } catch { /* ignore */ }
      return;
    }
    const cp = sessionStorage.getItem("castingPreset");
    if (cp) {
      sessionStorage.removeItem("castingPreset");
      try {
        const casting = JSON.parse(cp) as Record<string, string>;
        form.setValue("whoIsHe", casting.archetype ?? "");
        form.setValue("dynamic", casting.dynamic ?? "");
        form.setValue("intensity", casting.intensity ?? "");
        form.setValue("mood", casting.mood ?? "Emotional");
        form.setValue("storyMode", casting.storyMode ?? "romance");
        if (casting.pairing) setCastingPairing(casting.pairing);
        if (casting.partnerName) setCastingPartnerName(casting.partnerName);
        setStep("form");
      } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleCastingComplete = useCallback((casting: CastingRoomResult) => {
    const allTags = [...(casting.customTags ?? [])];
    const scenarioWithFreeText = [casting.scenarioPrompt, casting.freeText]
      .filter(Boolean)
      .join(". ");

    const castingSnapshot = {
      archetype: casting.archetype,
      dynamic: casting.dynamic,
      setting: casting.setting,
      intensity: casting.intensity,
      mood: casting.mood,
      storyMode: casting.storyMode,
      pairing: casting.pairing,
      partnerName: casting.partnerName,
    };

    form.setValue("listenerName", casting.listenerName ?? "");

    setLastCastingData(castingSnapshot);
    setPendingCastingData(castingSnapshot);
    setCastingPairing(casting.pairing);
    setCastingPartnerName(casting.partnerName);
    setCastingHeritage(casting.heritage || undefined);
    setCastingAtmosphere(casting.atmosphere || undefined);
    setCastingChemistry(casting.chemistry || undefined);
    setPresetSaved(false);

    form.setValue("scenarioPrompt", scenarioWithFreeText);
    form.setValue("whoIsHe", casting.archetype);
    form.setValue("dynamic", casting.dynamic);
    form.setValue("setting", casting.setting);
    form.setValue("intensity", casting.intensity);
    form.setValue("mood", casting.mood);
    form.setValue("storyMode", casting.storyMode);
    form.setValue("experienceTags", allTags);

    const suggestedName = [casting.archetype, casting.dynamic].filter(Boolean).join(" · ") || "My Cast";
    setPresetNameDraft(suggestedName);

    if (isAuthenticated) {
      setStep("preset-prompt");
    } else {
      setStep("generating");
      startLoadingPhase();
      generateMutation.mutateAsync({
        data: {
          listenerName: form.getValues("listenerName") ?? "",
          mood: casting.mood,
          intensity: casting.intensity,
          voiceFeel: form.getValues("voiceFeel"),
          storyLength: form.getValues("storyLength"),
          scenarioPrompt: scenarioWithFreeText,
          cinematicVisuals: true,
          emotionalFocus: casting.mood === "Emotional",
          whoIsHe: casting.archetype || undefined,
          dynamic: casting.dynamic || undefined,
          setting: casting.setting || undefined,
          storyMode: casting.storyMode || undefined,
          experienceTags: allTags.length ? allTags : undefined,
          pairing: casting.pairing || undefined,
          partnerName: casting.partnerName || undefined,
          heritage: casting.heritage || undefined,
          atmosphere: casting.atmosphere || undefined,
          chemistry: casting.chemistry || undefined,
        },
      }).finally(() => stopLoadingPhase());
    }
  }, [form, generateMutation, isAuthenticated, startLoadingPhase, stopLoadingPhase]);

  const buildPerspectiveOverrides = useCallback((baseScenario: string) => {
    const povPrefix =
      perspective === "her"
        ? "[Third-person close: write from her perspective using she/her throughout — never 'you'] "
        : perspective === "his"
        ? "[Third-person close: write from his perspective using he/him throughout — never 'you'] "
        : "";
    const pairing =
      perspective === "his" ? "Him & Her" : "Her & Him";
    return {
      scenarioPrompt: (povPrefix + baseScenario).trim(),
      pairing,
    };
  }, [perspective]);

  const handleStartGenerating = useCallback(async (savePreset: boolean, presetName: string) => {
    if (savePreset && pendingCastingData && presetName.trim()) {
      fetch(`${API_BASE}/api/me/presets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: presetName.trim(), castingData: pendingCastingData }),
      }).then(() => setPresetSaved(true)).catch(() => {});
    }

    setStep("generating");
    startLoadingPhase();

    const { scenarioPrompt: scenarioWithPov, pairing: perspectivePairing } = buildPerspectiveOverrides(form.getValues("scenarioPrompt"));

    try {
      await generateMutation.mutateAsync({
        data: {
          listenerName: form.getValues("listenerName") ?? "",
          mood: form.getValues("mood"),
          intensity: form.getValues("intensity"),
          voiceFeel: form.getValues("voiceFeel"),
          storyLength: form.getValues("storyLength"),
          scenarioPrompt: scenarioWithPov,
          cinematicVisuals: true,
          emotionalFocus: form.getValues("mood") === "Emotional",
          whoIsHe: form.getValues("whoIsHe") || undefined,
          dynamic: form.getValues("dynamic") || undefined,
          setting: form.getValues("setting") || undefined,
          storyMode: form.getValues("storyMode") || undefined,
          experienceTags: form.getValues("experienceTags")?.length ? form.getValues("experienceTags") : undefined,
          pairing: castingPairing || perspectivePairing,
          partnerName: castingPartnerName || form.getValues("partnerName") || undefined,
          heritage: castingHeritage || undefined,
          atmosphere: castingAtmosphere || undefined,
          chemistry: castingChemistry || undefined,
        },
      });
    } finally {
      stopLoadingPhase();
    }
  }, [form, generateMutation, pendingCastingData, startLoadingPhase, stopLoadingPhase, castingPairing, castingPartnerName, castingHeritage, castingAtmosphere, castingChemistry, buildPerspectiveOverrides]);

  const selectedMode = form.watch("storyMode");
  const selectedTags = form.watch("experienceTags") ?? [];

  const handlePathSelect = (pathId: string) => {
    const path = STORY_PATHS.find(p => p.id === pathId);
    if (!path) return;
    form.setValue("storyMode", pathId);
    form.setValue("intensity", path.suggestedIntensity);
    form.setValue("mood", path.mood);
    form.setValue("experienceTags", []);
  };

  const toggleExperienceTag = (tag: string) => {
    const current = form.getValues("experienceTags") ?? [];
    const next = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    form.setValue("experienceTags", next);
  };

  const onSubmit = async (data: FormData) => {
    setStep("generating");
    startLoadingPhase();

    const { scenarioPrompt: scenarioWithPov, pairing: perspectivePairing } = buildPerspectiveOverrides(data.scenarioPrompt);

    try {
      await generateMutation.mutateAsync({
        data: {
          listenerName: data.listenerName ?? "",
          mood: data.mood,
          intensity: data.intensity,
          voiceFeel: data.voiceFeel,
          storyLength: data.storyLength,
          scenarioPrompt: scenarioWithPov,
          cinematicVisuals: data.cinematicVisuals,
          emotionalFocus: data.emotionalFocus,
          whoIsHe: data.whoIsHe || undefined,
          dynamic: data.dynamic || undefined,
          ending: data.ending || undefined,
          setting: data.setting || undefined,
          storyMode: data.storyMode || undefined,
          experienceTags: data.experienceTags?.length ? data.experienceTags : undefined,
          pairing: castingPairing || perspectivePairing,
          partnerName: castingPartnerName || data.partnerName || undefined,
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

  const OptionalPill = ({
    label,
    field,
    value,
  }: {
    label: string;
    field: keyof FormData;
    value: string;
  }) => {
    const current = form.watch(field) as string;
    const isSelected = current === value;
    return (
      <button
        type="button"
        onClick={() => form.setValue(field, (isSelected ? "" : value) as never)}
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

  const currentPath = STORY_PATHS.find(p => p.id === selectedMode) ?? STORY_PATHS[0];
  const currentTags = PATH_EXPERIENCE_TAGS[selectedMode] ?? [];

  const isThisPlaying = isPlaying && currentStory?.id === result?.id;
  const activeSceneIndex = result
    ? Math.min(Math.floor(progress * result.scenes.length), result.scenes.length - 1)
    : 0;
  const activeSceneImage = result?.images?.scenes?.[activeSceneIndex] ?? result?.images?.cover ?? "";

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Sign in to create a story</h2>
          <p className="text-muted-foreground max-w-sm">
            Your romantic story is crafted just for you and saved to your private library.
          </p>
        </div>
        <button
          onClick={openSignIn}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Sign In to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">

        {step === "casting" && (
          <motion.div
            key="casting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CastingRoom
              onComplete={handleCastingComplete}
              onSkip={() => setStep("form")}
            />
          </motion.div>
        )}

        {step === "preset-prompt" && (
          <motion.div
            key="preset-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 max-w-md mx-auto"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Wand2 className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Save this casting?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Give your combination a name so you can reuse it in one tap from your profile.
              </p>
            </div>
            <div className="w-full space-y-3">
              <input
                type="text"
                value={presetNameDraft}
                onChange={(e) => setPresetNameDraft(e.target.value)}
                maxLength={80}
                placeholder="e.g. CEO · Slow Burn"
                className="w-full px-4 py-3 rounded-xl border border-border/40 bg-card/60 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
              />
              <button
                onClick={() => handleStartGenerating(true, presetNameDraft)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-glow text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Save &amp; Write My Story
              </button>
              <button
                onClick={() => handleStartGenerating(false, "")}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Skip — just write it
              </button>
            </div>
          </motion.div>
        )}

        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-3xl mx-auto px-4 py-8 space-y-8"
          >
            <div>
              <button
                onClick={() => setStep("casting")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Casting Room
              </button>
              <p className="text-xs font-medium uppercase tracking-widest text-primary mb-2">Story Studio</p>
              <h1 className="font-display text-4xl font-bold text-foreground mb-2">Create Your Story</h1>
              <p className="text-muted-foreground">Choose your experience, then shape the details.</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Whose Story? — Perspective selector + name fields */}
              <div className="glass-panel rounded-2xl p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Whose story is this?</label>
                  <p className="text-xs text-muted-foreground mb-4">Choose the perspective the story is written from.</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["your", "her", "his"] as const).map((p) => {
                      const labels = { your: "Your Story", her: "Her Story", his: "His Story" };
                      const descs = { your: "Written as you", her: "Written as her", his: "Written as him" };
                      const isSelected = perspective === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPerspective(p)}
                          className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border text-center transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-glow"
                              : "border-border/30 bg-card/30 hover:border-primary/30 hover:bg-primary/5"
                          }`}
                        >
                          <span className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                            {labels[p]}
                          </span>
                          <span className="text-xs text-muted-foreground">{descs[p]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      {perspective === "your" ? "Your name" : perspective === "her" ? "Her name" : "His name"}
                      <span className="font-normal"> (optional)</span>
                    </label>
                    <input
                      {...form.register("listenerName")}
                      placeholder={
                        perspective === "your"
                          ? "How should the story address you?"
                          : perspective === "her"
                          ? "What is her name?"
                          : "What is his name?"
                      }
                      className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      {perspective === "his" ? "Her name" : "His name"}
                      <span className="font-normal"> — the love interest (optional)</span>
                    </label>
                    <input
                      {...form.register("partnerName")}
                      placeholder={
                        perspective === "his"
                          ? "What is her name?"
                          : "What is his name?"
                      }
                      className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Story Experience — Path Selector */}
              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-1">Your Experience</label>
                <p className="text-xs text-muted-foreground mb-5">What kind of story do you want to step into?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {STORY_PATHS.map((path) => {
                    const isSelected = selectedMode === path.id;
                    return (
                      <button
                        key={path.id}
                        type="button"
                        onClick={() => handlePathSelect(path.id)}
                        className={`text-left p-4 rounded-2xl border transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-glow"
                            : "border-border/30 bg-card/30 hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className={`font-bold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                            {path.label}
                          </p>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />}
                        </div>
                        <p className={`text-xs font-medium mb-1.5 ${isSelected ? "text-primary/70" : "text-muted-foreground"}`}>
                          {path.tagline}
                        </p>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed">
                          {path.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Experience Tags — path-specific multi-select */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedMode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="glass-panel rounded-2xl p-6"
                >
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Shape this story
                  </label>
                  <p className="text-xs text-muted-foreground mb-4">
                    Select the feelings and elements you want woven into the narrative — choose as many as resonate.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleExperienceTag(tag)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-glow"
                              : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                  {selectedTags.length > 0 && (
                    <p className="text-xs text-primary/60 mt-3">
                      {selectedTags.length} {selectedTags.length === 1 ? "element" : "elements"} selected
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Your Scenario */}
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
                <ScenarioDropdown onSelect={(text) => form.setValue("scenarioPrompt", text)} />

                <div className="mt-5 pt-5 border-t border-border/20">
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Where does it take place? <span className="text-muted-foreground/60 font-normal">(optional)</span>
                  </label>
                  <input
                    {...form.register("setting")}
                    placeholder="e.g. Tokyo, Paris, a private yacht…"
                    className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              {/* Who is He? */}
              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-1">Who is He?</label>
                <p className="text-xs text-muted-foreground mb-4">Optional — tap to select, tap again to clear</p>
                <div className="flex flex-wrap gap-2">
                  {WHO_IS_HE_OPTIONS.map((opt) => (
                    <OptionalPill key={opt} label={opt} field="whoIsHe" value={opt} />
                  ))}
                </div>
              </div>

              {/* The Dynamic */}
              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-1">The Dynamic</label>
                <p className="text-xs text-muted-foreground mb-4">Optional — how does the power sit between you?</p>
                <div className="flex flex-wrap gap-2">
                  {DYNAMIC_OPTIONS.map((opt) => (
                    <OptionalPill key={opt} label={opt} field="dynamic" value={opt} />
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-1">Intensity</label>
                <p className="text-xs text-muted-foreground mb-4">
                  How far does the story go?
                  {currentPath.highlightIntensities.length < 4 && (
                    <span className="text-primary/60"> · Suggested for {currentPath.label}: {currentPath.highlightIntensities.join(", ")}</span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {INTENSITIES.map((item) => {
                    const isSelected = form.watch("intensity") === item.id;
                    const isHighlighted = currentPath.highlightIntensities.includes(item.id);
                    const isMuted = !isHighlighted;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => form.setValue("intensity", item.id)}
                        className={`p-4 rounded-2xl border transition-all text-left relative ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-glow"
                            : isMuted
                              ? "border-border/20 bg-card/20 hover:border-primary/20 hover:bg-primary/3 opacity-60 hover:opacity-80"
                              : "border-border/40 bg-card/40 hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        <p className={`font-semibold text-sm mb-0.5 ${isSelected ? "text-primary" : isMuted ? "text-muted-foreground" : "text-foreground"}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground leading-snug">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* How does it end? */}
              <div className="glass-panel rounded-2xl p-6">
                <label className="block text-sm font-medium text-foreground mb-1">How does it end?</label>
                <p className="text-xs text-muted-foreground mb-4">Optional — tap to select, tap again to clear</p>
                <div className="flex flex-wrap gap-2">
                  {ENDING_OPTIONS.map((opt) => (
                    <OptionalPill key={opt} label={opt} field="ending" value={opt} />
                  ))}
                </div>
              </div>

              {/* Voice, Length, Enhancements */}
              <div className="glass-panel rounded-2xl p-6 space-y-6">
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
                <div>
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
            className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh] text-center"
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
            className="max-w-3xl mx-auto px-4 py-8 space-y-8"
          >
            <button
              onClick={() => setStep("casting")}
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

                {/* Save casting combo as a preset */}
                {isAuthenticated && lastCastingData && (
                  <div className="flex items-center gap-2">
                    {presetSaved ? (
                      <p className="text-xs text-primary flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Casting saved — find it in your profile
                      </p>
                    ) : (
                      <button
                        onClick={handleSavePreset}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 underline-offset-2 hover:underline"
                      >
                        Save this casting combination
                      </button>
                    )}
                  </div>
                )}

                {isThisPlaying && (
                  <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                    <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
                      Reading Along
                    </p>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap font-light">
                        {result.scenes[activeSceneIndex]?.text ?? ""}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Scene {activeSceneIndex + 1} of {result.scenes.length} · {result.scenes[activeSceneIndex]?.heading}
                    </p>
                  </div>
                )}

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

            {/* Full Story Read-Along Section */}
            {result.images?.cover && (
              <div className="rounded-2xl overflow-hidden border border-border/30">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/20 bg-card/60">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    Full Story
                  </p>
                  <p className="text-xs text-muted-foreground">{result.scenes.length} scenes</p>
                </div>
                <div
                  className="relative max-h-[70vh] overflow-y-auto"
                  style={{
                    backgroundImage: `url(${result.images.cover})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "local",
                  }}
                >
                  <div className="p-8 space-y-10 bg-black/75">
                    {result.scenes.map((scene, i) => (
                      <div key={scene.id ?? i}>
                        <p className="text-xs font-medium text-primary/70 uppercase tracking-widest mb-3">
                          {scene.heading ?? `Scene ${i + 1}`}
                        </p>
                        <p className="text-base leading-[1.9] text-white/90 font-light whitespace-pre-wrap">
                          {scene.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Write Episode 2 — single tap continuation */}
            <button
              onClick={handleGenerateContinuation}
              disabled={isGeneratingContinuation}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGeneratingContinuation ? (
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4" />
              )}
              Write Episode 2 →
            </button>

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
                More Continuation Options
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
