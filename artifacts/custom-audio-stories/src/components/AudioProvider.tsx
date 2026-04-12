import { useEffect, useRef } from 'react';
import { useAudioPlayer, AMBIENT_OPTIONS } from '@/store/use-audio-player';

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function trackCompletion(storyId: string, mood: string) {
  fetch(`${API_BASE}/api/update-taste`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mood, event: "completed" }),
  }).catch(() => {});
  fetch(`${API_BASE}/api/progress`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ storyId }),
  }).catch(() => {});
}

function trackReplay(mood: string) {
  fetch(`${API_BASE}/api/update-taste`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mood, event: "replayed" }),
  }).catch(() => {});
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const {
    currentStory,
    isPlaying,
    setProgress,
    setCurrentTime,
    setDuration,
    duration,
    pendingSeek,
    clearPendingSeek,
    pause,
    ambientMode,
    narrationVolume,
    ambientVolume,
  } = useAudioPlayer();

  const audioRef = useRef<HTMLAudioElement>(null);
  const ambientRef = useRef<HTMLAudioElement>(null);
  const simulationIntervalRef = useRef<number | null>(null);
  const playCountRef = useRef<Record<string, number>>({});
  // Always-current volume ref so effects don't need ambientVolume in their dep arrays
  const ambientVolRef = useRef(ambientVolume);

  const handlePlay = (storyId: string, mood: string) => {
    const count = (playCountRef.current[storyId] ?? 0) + 1;
    playCountRef.current[storyId] = count;
    if (count > 1) trackReplay(mood);
  };

  const handleEnded = () => {
    if (currentStory) trackCompletion(currentStory.id, currentStory.mood ?? "");
    pause();
  };

  // Narration audio control
  useEffect(() => {
    if (!currentStory) {
      // Player was closed — stop narration immediately
      if (audioRef.current) {
        audioRef.current.volume = narrationVolume;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      return;
    }

    if (currentStory.audioUrl) {
      if (audioRef.current) {
        audioRef.current.volume = narrationVolume;
        if (isPlaying) {
          handlePlay(currentStory.id, currentStory.mood ?? "");
          audioRef.current.play().catch(console.error);
        } else {
          audioRef.current.pause();
        }
      }
    } else {
      if (isPlaying) {
        handlePlay(currentStory.id, currentStory.mood ?? "");
        simulationIntervalRef.current = window.setInterval(() => {
          useAudioPlayer.setState((state) => {
            const dur = state.duration > 0 ? state.duration : 300;
            const nextTime = state.currentTime + 1;
            if (nextTime >= dur) {
              clearInterval(simulationIntervalRef.current!);
              if (state.currentStory) {
                trackCompletion(state.currentStory.id, state.currentStory.mood ?? "");
              }
              return { currentTime: dur, progress: 1, isPlaying: false };
            }
            return { currentTime: nextTime, progress: nextTime / dur };
          });
        }, 1000);
      } else if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    }

    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, [isPlaying, currentStory, narrationVolume]);

  // Apply pending seek requests to the real audio element
  useEffect(() => {
    if (pendingSeek === null) return;
    if (audioRef.current) {
      audioRef.current.currentTime = pendingSeek;
    }
    clearPendingSeek();
  }, [pendingSeek, clearPendingSeek]);

  // Ambient: track switching.
  // When ambientMode changes, load the new track. If narration is playing,
  // wait for canplay before playing (avoids silent failure immediately after load()).
  useEffect(() => {
    const el = ambientRef.current;
    if (!el) return;

    const option = AMBIENT_OPTIONS.find((o) => o.id === ambientMode);

    if (!option) {
      el.pause();
      el.src = "";
      el.load();
      return;
    }

    const newUrl = option.url;
    const currentSrc = el.currentSrc || el.src || "";
    const needsLoad  = !currentSrc.includes(`${option.id}.mp3`);

    let onCanPlay: (() => void) | null = null;

    if (needsLoad) {
      el.pause();
      el.src  = newUrl;
      el.loop = true;
      el.load();
      // Only start playing if narration is already running
      if (useAudioPlayer.getState().isPlaying) {
        onCanPlay = () => {
          el.volume = ambientVolRef.current;
          el.play().catch(() => {});
        };
        el.addEventListener("canplay", onCanPlay, { once: true });
      }
    } else if (isPlaying) {
      // Same track, narration is running — resume ambient
      el.volume = ambientVolRef.current;
      el.play().catch(() => {});
    }

    return () => {
      if (onCanPlay) el.removeEventListener("canplay", onCanPlay);
    };
  }, [ambientMode]);

  // Ambient: play/pause in sync with narration and story state.
  useEffect(() => {
    const el = ambientRef.current;
    if (!el) return;

    if (!isPlaying || !currentStory || !ambientMode) {
      el.pause();
      return;
    }

    // Narration started (or unpaused) — start ambient if it has a src
    if (el.src) {
      el.volume = ambientVolRef.current;
      el.play().catch(() => {});
    }
  }, [isPlaying, currentStory, ambientMode]);

  // Ambient volume sync — updates the ref AND the live element.
  // Kept separate so slider changes never restart the track.
  useEffect(() => {
    ambientVolRef.current = ambientVolume;
    if (ambientRef.current) ambientRef.current.volume = ambientVolume;
  }, [ambientVolume]);

  return (
    <>
      <audio
        ref={audioRef}
        src={currentStory?.audioUrl || undefined}
        volume={narrationVolume as never}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          const d = e.currentTarget.duration;
          setCurrentTime(t);
          if (d && isFinite(d) && d > 0) {
            setProgress(t / d);
          }
        }}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (d && isFinite(d) && d > 0) setDuration(d);
        }}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration;
          if (d && isFinite(d) && d > 0) setDuration(d);
        }}
        onEnded={handleEnded}
      />
      <audio ref={ambientRef} loop />
      {children}
    </>
  );
}
