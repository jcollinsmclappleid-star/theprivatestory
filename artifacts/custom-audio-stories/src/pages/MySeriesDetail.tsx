import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Layers, BookOpen, Check, Pencil, X, Volume2, Lock } from "lucide-react";
import { useAudioPlayer } from "@/store/use-audio-player";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  duration: string;
  audioUrl: string;
  coverImage: string;
  scenes: { id?: string; heading?: string; text: string }[];
}

interface SeriesDetail {
  id: string;
  title: string;
  mood: string;
  coverImage: string;
  episodeCount: number;
  castingData: Record<string, unknown>;
  createdAt: string;
  episodes: Episode[];
}

const VALID_MOODS = ["Forbidden", "Tender", "Playful", "Steamy", "Emotional", "Dark", "Whimsical"];
const VALID_INTENSITIES = ["Soft", "Heated", "Explicit"];
const VALID_VOICES = ["Soft Voice", "Deep Voice", "Breathy Voice", "Confident Voice"];
const VALID_LENGTHS = ["3 min", "5 min", "10 min"];

export default function MySeriesDetail({ seriesId }: { seriesId: string }) {
  const { user } = useAuth();
  const { play, currentStory, isPlaying } = useAudioPlayer();

  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renamePending, setRenamePending] = useState(false);

  const [generatingNext, setGeneratingNext] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [nextMood, setNextMood] = useState("Emotional");
  const [nextIntensity, setNextIntensity] = useState("Heated");
  const [nextVoice, setNextVoice] = useState("Soft Voice");
  const [nextLength, setNextLength] = useState("5 min");
  const [nextScenario, setNextScenario] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);

  const fetchSeries = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/user/series/${seriesId}`, { credentials: "include" });
      if (!resp.ok) throw new Error("Failed to load series");
      const data = await resp.json() as SeriesDetail;
      setSeries(data);
      setNextMood(data.mood || "Emotional");
      const cd = data.castingData as Record<string, unknown>;
      if (cd?.voiceFeel && typeof cd.voiceFeel === "string") setNextVoice(cd.voiceFeel);
      if (cd?.storyLength && typeof cd.storyLength === "string") setNextLength(cd.storyLength);
      if (cd?.intensity && typeof cd.intensity === "string") setNextIntensity(cd.intensity);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [seriesId]);

  useEffect(() => { fetchSeries(); }, [fetchSeries]);

  const handleRename = useCallback(async () => {
    if (!series || renamePending || !renameValue.trim()) return;
    setRenamePending(true);
    try {
      await fetch(`${API_BASE}/api/user/series/${series.id}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: renameValue.trim() }),
      });
      setSeries((s) => s ? { ...s, title: renameValue.trim() } : s);
      setRenaming(false);
    } finally {
      setRenamePending(false);
    }
  }, [series, renamePending, renameValue]);

  const handleGenerateNext = useCallback(async () => {
    if (!series || generatingNext) return;
    if (series.episodes.length >= 10) {
      setGenError("This series has reached its 10-chapter limit.");
      return;
    }
    setGeneratingNext(true);
    setGenError(null);
    try {
      const resp = await fetch(`${API_BASE}/api/user/series/${series.id}/next-chapter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          scenarioPrompt: nextScenario || undefined,
          mood: nextMood,
          intensity: nextIntensity,
          voiceFeel: nextVoice,
          storyLength: nextLength,
        }),
      });
      if (!resp.ok) {
        const body = await resp.json() as { error?: string };
        throw new Error(body.error ?? "Generation failed");
      }
      await fetchSeries();
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGeneratingNext(false);
    }
  }, [series, generatingNext, nextScenario, nextMood, nextIntensity, nextVoice, nextLength, fetchSeries]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Sign in to view your series.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <p className="text-muted-foreground">{error ?? "Series not found."}</p>
      </div>
    );
  }

  const maxChapters = series.episodes.length >= 10;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Back */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/20 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <Layers className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">My Series</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-8">
        {/* Cover + Title */}
        <div className="flex gap-5 items-start">
          {series.coverImage ? (
            <img
              src={series.coverImage}
              alt={series.title}
              className="w-28 h-28 rounded-2xl object-cover flex-shrink-0 shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-card flex items-center justify-center flex-shrink-0">
              <Layers className="w-10 h-10 text-muted-foreground/40" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {renaming ? (
              <div className="flex items-center gap-2">
                <input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setRenaming(false); }}
                  className="flex-1 bg-card border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  autoFocus
                />
                <button
                  onClick={handleRename}
                  disabled={renamePending}
                  className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRenaming(false)}
                  className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <h1 className="font-display text-2xl font-bold text-foreground leading-tight">{series.title}</h1>
                <button
                  onClick={() => { setRenameValue(series.title); setRenaming(true); }}
                  className="mt-1 p-1 rounded-lg hover:bg-white/5 text-muted-foreground/60 hover:text-muted-foreground transition-colors flex-shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{series.mood}</span>
              <span>·</span>
              <span>{series.episodes.length} / 10 chapters</span>
            </div>
          </div>
        </div>

        {/* Episodes */}
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest px-1">Chapters</h2>

          {series.episodes.length === 0 ? (
            <p className="text-sm text-muted-foreground px-1">No chapters yet — the first chapter is the story that started this series.</p>
          ) : (
            series.episodes.map((ep) => {
              const isCurrentlyPlaying = isPlaying && currentStory?.id === ep.id;
              const isExpanded = expandedEpisode === ep.id;

              return (
                <motion.div
                  key={ep.id}
                  layout
                  className="bg-card rounded-2xl border border-border/30 overflow-hidden"
                >
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setExpandedEpisode(isExpanded ? null : ep.id)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{ep.episodeNumber}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ep.title || `Chapter ${ep.episodeNumber}`}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ep.duration} · {ep.scenes.length} scenes</p>
                    </div>

                    {ep.audioUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          play({
                            id: ep.id,
                            title: ep.title,
                            audioUrl: ep.audioUrl,
                            coverImage: ep.coverImage || series.coverImage,
                            scenes: ep.scenes as never,
                            mood: series.mood,
                            description: ep.description,
                            tags: [],
                            duration: ep.duration,
                            isPremium: false,
                            isNew: false,
                          });
                        }}
                        className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
                      >
                        {isCurrentlyPlaying ? (
                          <Volume2 className="w-4 h-4" />
                        ) : (
                          <BookOpen className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && ep.scenes.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="p-6 space-y-6 border-t border-border/20 max-h-[60vh] overflow-y-auto"
                          style={ep.coverImage ? {
                            backgroundImage: `url(${ep.coverImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          } : {}}
                        >
                          <div className={`space-y-6 ${ep.coverImage ? "bg-black/75 p-4 rounded-xl" : ""}`}>
                            {ep.scenes.map((scene, i) => (
                              <div key={scene.id ?? i}>
                                <p className="text-xs font-medium text-primary/70 uppercase tracking-widest mb-2">
                                  {scene.heading ?? `Scene ${i + 1}`}
                                </p>
                                <p className="text-sm leading-relaxed text-white/90 font-light whitespace-pre-wrap">
                                  {scene.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Next Chapter Generator */}
        <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/20 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {maxChapters ? "Series complete" : `Write Chapter ${series.episodes.length + 1}`}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {maxChapters ? "You've reached the 10-chapter limit." : "Continue the story, pick up right where it ended."}
              </p>
            </div>
          </div>

          {!maxChapters && (
            <div className="p-6 space-y-5">
              {/* Mood */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-2">Mood</label>
                <div className="flex flex-wrap gap-2">
                  {VALID_MOODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setNextMood(m)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${nextMood === m ? "bg-primary text-primary-foreground" : "border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced options toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAdvanced ? "Hide" : "Show"} advanced options
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4"
                  >
                    {/* Intensity */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-2">Intensity</label>
                      <div className="flex gap-2">
                        {VALID_INTENSITIES.map((v) => (
                          <button
                            key={v}
                            onClick={() => setNextIntensity(v)}
                            className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${nextIntensity === v ? "bg-primary text-primary-foreground" : "border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Voice */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-2">Narrator voice</label>
                      <div className="flex flex-wrap gap-2">
                        {VALID_VOICES.map((v) => (
                          <button
                            key={v}
                            onClick={() => setNextVoice(v)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${nextVoice === v ? "bg-primary text-primary-foreground" : "border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Length */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-2">Length</label>
                      <div className="flex gap-2">
                        {VALID_LENGTHS.map((v) => (
                          <button
                            key={v}
                            onClick={() => setNextLength(v)}
                            className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${nextLength === v ? "bg-primary text-primary-foreground" : "border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scenario hint */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-2">Chapter direction (optional)</label>
                      <textarea
                        value={nextScenario}
                        onChange={(e) => setNextScenario(e.target.value)}
                        placeholder="e.g. the tension finally breaks, they're alone again…"
                        rows={2}
                        className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {genError && (
                <p className="text-sm text-red-400">{genError}</p>
              )}

              <button
                onClick={handleGenerateNext}
                disabled={generatingNext}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {generatingNext ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Writing chapter {series.episodes.length + 1}…
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Write Chapter {series.episodes.length + 1} →
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
