import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, FastForward } from "lucide-react";

interface VoiceSamplePlayerProps {
  src: string;
  onPlayStart?: () => void;
}

export function VoiceSamplePlayer({ src, onPlayStart }: VoiceSamplePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(false);
  const rafRef = useRef<number | null>(null);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    rafRef.current = requestAnimationFrame(updateProgress);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePlayPause = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setPlaying(false);
    } else {
      setLoading(true);
      try {
        onPlayStart?.();
        await audio.play();
        rafRef.current = requestAnimationFrame(updateProgress);
        setPlaying(true);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = ratio * duration;
    setProgress(ratio * 100);
    setCurrentTime(ratio * duration);
  };

  const handleSkip = (e: React.MouseEvent, seconds: number) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const formatTime = (t: number) => {
    if (!isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  return (
    <div
      className="mt-3 px-4 py-3 rounded-xl bg-black/30 border border-white/5"
      onClick={(e) => e.stopPropagation()}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={handleEnded}
        onError={() => setError(true)}
      />

      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          type="button"
          onClick={handlePlayPause}
          disabled={error}
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all
            ${error
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-glow"
            }`}
        >
          {loading ? (
            <span className="w-3 h-3 border-2 border-primary-foreground/50 border-t-primary-foreground rounded-full animate-spin" />
          ) : playing ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
          )}
        </button>

        {/* Progress track + times */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div
            className="relative h-1.5 bg-white/10 rounded-full cursor-pointer group/track"
            onClick={handleSeek}
          >
            {/* Filled portion */}
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow opacity-0 group-hover/track:opacity-100 transition-opacity"
              style={{ left: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-muted-foreground/70 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Rewind 5s */}
        <button
          type="button"
          onClick={(e) => handleSkip(e, -5)}
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          title="Back 5s"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Forward 5s */}
        <button
          type="button"
          onClick={(e) => handleSkip(e, 5)}
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          title="Forward 5s"
        >
          <FastForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {error && (
        <p className="text-xs text-muted-foreground/60 mt-1.5 text-center">
          Sample not yet available
        </p>
      )}
    </div>
  );
}
