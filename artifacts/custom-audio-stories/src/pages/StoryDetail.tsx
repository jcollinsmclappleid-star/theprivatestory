import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "wouter";
import { Play, Pause, FastForward, Rewind, Heart, Flag } from "lucide-react";
import { useStoryFallback } from "@/hooks/use-api-fallbacks";
import { useAudioPlayer } from "@/store/use-audio-player";
import { Slider } from "@/components/ui/slider";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const REPORT_CATEGORIES = [
  { value: "csam", label: "This content involves a minor" },
  { value: "non-consent", label: "This content is non-consensual" },
  { value: "real-person", label: "This content involves a real person without consent" },
  { value: "harassment", label: "This content is illegal or harmful" },
  { value: "other", label: "Other safety concern" },
];

export default function StoryDetail() {
  const { id } = useParams();
  const { data: story } = useStoryFallback(id || "");
  const { currentStory, isPlaying, progress, currentTime, duration, play, togglePlay, setProgress } = useAudioPlayer();
  const [saved, setSaved] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  // Auto-play on mount if it's a new story
  useEffect(() => {
    if (story && currentStory?.id !== story.id) {
      setTimeout(() => play(story), 500);
    }
  }, [story, currentStory?.id, play]);

  const handleSubmitReport = useCallback(async () => {
    if (!reportCategory || reportSubmitting) return;
    setReportSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/safety-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category: reportCategory,
          description: `Story ID: ${id ?? "unknown"}. ${reportDescription}`,
        }),
      });
      setReportDone(true);
    } catch {
      setReportDone(true);
    } finally {
      setReportSubmitting(false);
    }
  }, [reportCategory, reportDescription, reportSubmitting, id]);

  const handleSave = useCallback(async () => {
    if (!story || savePending) return;
    setSavePending(true);
    const nextSaved = !saved;
    setSaved(nextSaved);
    try {
      await fetch(`${API_BASE}/api/save-story`, {
        method: nextSaved ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ storyId: story.id }),
      });
      if (nextSaved) {
        fetch(`${API_BASE}/api/update-taste`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ mood: story.mood, event: "saved" }),
        }).catch(() => {});
      }
    } catch {
      setSaved(!nextSaved);
    } finally {
      setSavePending(false);
    }
  }, [story, saved, savePending]);

  if (!story) return null;

  const isCurrent = currentStory?.id === story.id;
  const activePlaying = isCurrent && isPlaying;

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleScrub = (val: number[]) => {
    setProgress(val[0] / 100);
    // In a real app with audio ref, updating state triggers onTimeUpdate which handles this,
    // but we'd normally want to seek the actual audio ref here.
    // Our robust AudioProvider syncs this fairly well.
  };

  // Calculate which scene image to show based on progress
  const sceneCount = story.scenes?.length || 1;
  const activeSceneIndex = Math.min(Math.floor((isCurrent ? progress : 0) * sceneCount), sceneCount - 1);
  const activeImage = story.scenes?.[activeSceneIndex]?.image || story.coverImage;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col md:flex-row"
    >
      {/* Visual Panel (Left side on desktop, background on mobile) */}
      <div className="relative w-full md:w-3/5 h-[50vh] md:h-screen bg-black">
        <AnimatePresence mode="popLayout">
          <motion.img 
            key={activeImage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            src={activeImage}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 md:bg-gradient-to-r md:from-transparent md:to-background to-transparent" />
      </div>

      {/* Controls & Read-Along Panel */}
      <div className="relative w-full md:w-2/5 h-[50vh] md:h-screen flex flex-col md:justify-center p-8 md:p-16 z-10 overflow-y-auto">
        <button 
          onClick={() => window.history.back()} 
          className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          Close
        </button>

        {/* Header & Controls */}
        <div className="max-w-md w-full mx-auto flex-shrink-0 mb-8">
          <div className="mb-8">
            <span className="text-primary font-medium tracking-widest uppercase text-xs mb-3 block">
              {story.mood}
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
              {story.title}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mb-6">
              {story.description}
            </p>
          </div>

          {/* Waveform Visualization */}
          <div className="flex items-end justify-center gap-1.5 h-16 mb-8 opacity-70">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-primary rounded-full"
                animate={activePlaying ? { 
                  height: ['20%', '100%', '40%', '80%', '20%'] 
                } : { height: '20%' }}
                transition={activePlaying ? { 
                  repeat: Infinity, 
                  duration: 1.5, 
                  ease: 'easeInOut', 
                  delay: i * 0.1 
                } : {}}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <Slider 
              value={[isCurrent ? progress * 100 : 0]} 
              max={100} 
              step={0.1}
              onValueChange={handleScrub}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
              <span>{isCurrent ? formatTime(currentTime) : "0:00"}</span>
              <span>{isCurrent ? formatTime(duration) : story.duration}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8">
            <button 
              onClick={handleSave}
              disabled={savePending}
              className={`p-3 rounded-full transition-colors ${saved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} disabled:opacity-50`}
              title={saved ? "Unsave story" : "Save story"}
            >
              <Heart className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => { setReportOpen(true); setReportDone(false); setReportCategory(""); setReportDescription(""); }}
              className="p-3 rounded-full text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              title="Report this content"
            >
              <Flag className="w-5 h-5" />
            </button>
            
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Rewind className="w-6 h-6" />
            </button>
            
            <button 
              onClick={() => isCurrent ? togglePlay() : play(story)}
              className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground shadow-glow-lg hover:scale-105 transition-all"
            >
              {activePlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </button>

            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <FastForward className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Read-Along Text */}
        {story.scenes && story.scenes.length > 0 && (
          <div className="flex-1 mt-12 pt-8 border-t border-white/10">
            <div className="text-xs font-medium text-primary uppercase tracking-widest mb-6">
              Read Along
            </div>
            <div className="rounded-xl overflow-hidden">
              <div
                className="max-h-[50vh] overflow-y-auto"
                style={story.coverImage ? {
                  backgroundImage: `url(${story.coverImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundAttachment: "local",
                } : {}}
              >
                <div className="p-6 space-y-8 bg-black/80">
                  {story.scenes.map((scene: { id?: number; heading?: string; text?: string }, i: number) => (
                    <div key={scene.id ?? i}>
                      <p className="text-xs font-medium text-primary/70 uppercase tracking-widest mb-2">
                        {scene.heading ?? `Scene ${i + 1}`}
                      </p>
                      <p className="text-sm leading-[1.9] text-white/90 font-light whitespace-pre-wrap">
                        {scene.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Report content modal */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {reportOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-6"
            onClick={() => setReportOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-border rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {reportDone ? (
                <div className="text-center py-4">
                  <div className="text-2xl mb-3">✓</div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">Report Received</h3>
                  <p className="text-muted-foreground text-sm">
                    Thank you. Our safety team will review this within 24 hours. Reports are anonymous.
                  </p>
                  <button
                    onClick={() => setReportOpen(false)}
                    className="mt-5 px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display font-bold text-lg text-foreground">Report Content</h3>
                    <button onClick={() => setReportOpen(false)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    Select a reason and we'll review this immediately. Reports are anonymous.
                  </p>
                  <div className="space-y-2 mb-5">
                    {REPORT_CATEGORIES.map((cat) => (
                      <label key={cat.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-transparent hover:border-primary/30 hover:bg-primary/5 transition-colors">
                        <input
                          type="radio"
                          name="report-category"
                          value={cat.value}
                          checked={reportCategory === cat.value}
                          onChange={() => setReportCategory(cat.value)}
                          className="mt-0.5 accent-primary"
                        />
                        <span className="text-sm text-foreground">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    placeholder="Additional details (optional)"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none mb-4 focus:outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={handleSubmitReport}
                    disabled={!reportCategory || reportSubmitting}
                    className="w-full py-3 bg-destructive text-destructive-foreground rounded-full text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {reportSubmitting ? "Submitting…" : "Submit Report"}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
