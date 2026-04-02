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
    ambientVolume,
  } = useAudioPlayer();

  const audioRef = useRef<HTMLAudioElement>(null);
  const ambientRef = useRef<HTMLAudioElement>(null);
  const simulationIntervalRef = useRef<number | null>(null);
  const playCountRef = useRef<Record<string, number>>({});
  const ambientStartedRef = useRef(false);

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
  }, [isPlaying, currentStory]);

  // Apply pending seek requests to the real audio element
  useEffect(() => {
    if (pendingSeek === null) return;
    if (audioRef.current) {
      audioRef.current.currentTime = pendingSeek;
    }
    clearPendingSeek();
  }, [pendingSeek, clearPendingSeek]);

  // Attempt to start ambient audio — only when narration is actively playing
  const tryStartAmbient = () => {
    const el = ambientRef.current;
    if (!el || ambientStartedRef.current) return;
    // Never auto-start ambient without active narration (prevents music on page load)
    if (!useAudioPlayer.getState().isPlaying) return;
    const src = el.getAttribute("data-src");
    if (!src) return;
    if (!el.src || !el.src.endsWith(src)) {
      el.src = src;
      el.loop = true;
      el.volume = useAudioPlayer.getState().ambientVolume;
    }
    el.play()
      .then(() => { ambientStartedRef.current = true; })
      .catch(() => { ambientStartedRef.current = false; });
  };

  // Ambient audio control — loops INDEPENDENTLY of narration
  useEffect(() => {
    const el = ambientRef.current;
    if (!el) return;

    const option = AMBIENT_OPTIONS.find((o) => o.id === ambientMode);

    if (!option) {
      el.pause();
      el.removeAttribute("src");
      el.removeAttribute("data-src");
      el.load();
      ambientStartedRef.current = false;
      return;
    }

    const newUrl = option.url;
    el.setAttribute("data-src", newUrl);

    if (!el.src || !el.src.endsWith(newUrl)) {
      el.src = newUrl;
      el.loop = true;
      el.volume = ambientVolume;
      el.load();
      ambientStartedRef.current = false;
    }

    tryStartAmbient();
  }, [ambientMode]);

  // Retry ambient start on narration play/pause (user gesture unblocks autoplay)
  useEffect(() => {
    if (isPlaying && !ambientStartedRef.current) {
      tryStartAmbient();
    }
    // When narration stops or player is closed, stop ambient too
    if (!isPlaying || !currentStory) {
      const el = ambientRef.current;
      if (el) {
        el.pause();
        ambientStartedRef.current = false;
      }
    }
  }, [isPlaying, currentStory]);

  // Ambient volume sync (independent effect so it doesn't restart the track)
  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.volume = ambientVolume;
    }
  }, [ambientVolume]);

  return (
    <>
      <audio
        ref={audioRef}
        src={currentStory?.audioUrl || undefined}
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
          if (d && isFinite(d) && d > 0) {
            setDuration(d);
          }
        }}
        onEnded={handleEnded}
      />
      <audio ref={ambientRef} loop />
      {children}
    </>
  );
}
