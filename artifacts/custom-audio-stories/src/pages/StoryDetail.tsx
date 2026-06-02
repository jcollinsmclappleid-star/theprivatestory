import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "wouter";
import { Play, Pause, FastForward, Rewind, Heart, Flag, Lock } from "lucide-react";
import { useStoryFallback } from "@/hooks/use-api-fallbacks";
import { useAudioPlayer } from "@/store/use-audio-player";
import { useSubscription } from "@/hooks/useSubscription";
import { Slider } from "@/components/ui/slider";
import { ReportModal } from "@/components/ReportModal";
import { CastSituation } from "@/components/CastSituation";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function StoryDetail() {
  const { id } = useParams();
  const { data: story } = useStoryFallback(id || "");
  const { currentStory, isPlaying, progress, currentTime, duration, play, togglePlay, setProgress, seekTo } = useAudioPlayer();
  const { hasFullAccess, isLoading: subLoading } = useSubscription();
  const [saved, setSaved] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Auto-play on mount if it's a new story
  useEffect(() => {
    if (story && currentStory?.id !== story.id) {
      setTimeout(() => play(story), 500);
    }
  }, [story, currentStory?.id, play]);

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

  // Gate access — only paid subscribers can listen
  if (!subLoading && !hasFullAccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8"
      >
        <button
          onClick={() => window.history.back()}
          className="absolute top-8 right-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Close
        </button>
        <div className="text-center max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">Members only</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Stories in the collection are available exclusively to members. Join to listen to the full library.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105"
          >
            See membership options
          </Link>
        </div>
      </motion.div>
    );
  }

  const isCurrent = currentStory?.id === story.id;
  const activePlaying = isCurrent && isPlaying;

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Parse "9 min 59 sec" / "10 min" strings to seconds for the total-duration display.
  // Used as a fallback before the <audio> element reports its actual loaded duration.
  const parseDurationToSeconds = (str: string): number => {
    if (!str) return 0;
    const min = str.match(/(\d+)\s*min/);
    const sec = str.match(/(\d+)\s*sec/);
    return (min ? parseInt(min[1], 10) : 0) * 60 + (sec ? parseInt(sec[1], 10) : 0);
  };
  const storyDurationSeconds = parseDurationToSeconds(story.duration ?? "");

  const handleScrub = (val: number[]) => {
    if (!isCurrent) return;
    const displayDuration = duration > 0 ? duration : storyDurationSeconds;
    seekTo((val[0] / 100) * displayDuration);
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
              <span>{isCurrent && duration > 0 ? formatTime(duration) : storyDurationSeconds > 0 ? formatTime(storyDurationSeconds) : '–:––'}</span>
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
              onClick={() => setReportOpen(true)}
              className="p-3 rounded-full text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              title="Report this content"
            >
              <Flag className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => isCurrent && seekTo(currentTime - 15)}
              disabled={!isCurrent}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
              title="Back 15 seconds"
            >
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

            <button
              onClick={() => isCurrent && seekTo(currentTime + 30)}
              disabled={!isCurrent}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
              title="Forward 30 seconds"
            >
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

        {/* Cast & Situation — visible only when casting data is present */}
        <CastSituation data={story.castingData} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Report content modal */}
      {/* ------------------------------------------------------------------ */}
      {reportOpen && (
        <ReportModal storyId={id} onClose={() => setReportOpen(false)} />
      )}
    </motion.div>
  );
}
