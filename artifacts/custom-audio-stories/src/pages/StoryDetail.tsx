import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "wouter";
import { Play, Pause, FastForward, Rewind, Heart } from "lucide-react";
import { useStoryFallback } from "@/hooks/use-api-fallbacks";
import { useAudioPlayer } from "@/store/use-audio-player";
import { Slider } from "@/components/ui/slider";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function StoryDetail() {
  const { id } = useParams();
  const { data: story } = useStoryFallback(id || "");
  const { currentStory, isPlaying, progress, currentTime, duration, play, togglePlay, setProgress } = useAudioPlayer();
  const [saved, setSaved] = useState(false);
  const [savePending, setSavePending] = useState(false);

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

      {/* Controls Panel (Right side on desktop, bottom on mobile) */}
      <div className="relative w-full md:w-2/5 h-[50vh] md:h-screen flex flex-col justify-end md:justify-center p-8 md:p-16 z-10">
        <button 
          onClick={() => window.history.back()} 
          className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          Close
        </button>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <span className="text-primary font-medium tracking-widest uppercase text-xs mb-3 block">
              {story.mood}
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
              {story.title}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mb-6 line-clamp-3">
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
      </div>
    </motion.div>
  );
}
