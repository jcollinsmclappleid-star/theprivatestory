import { useEffect, useRef } from 'react';
import { useAudioPlayer } from '@/store/use-audio-player';
import { registerAudioElement, registerAudioSeek } from '@/lib/audioSeekRegistry';

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
    narrationVolume,
  } = useAudioPlayer();

  const audioRef = useRef<HTMLAudioElement>(null);
  const setAudioRef = (el: HTMLAudioElement | null) => {
    audioRef.current = el;
    registerAudioElement(el);
  };
  const simulationIntervalRef = useRef<number | null>(null);
  const playCountRef = useRef<Record<string, number>>({});

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

  // Register direct seek callback for skip/scrub controls.
  useEffect(() => {
    registerAudioSeek((t) => {
      const audio = audioRef.current;
      if (!audio) return;
      const apply = () => {
        const dur = audio.duration;
        const clamped =
          dur && Number.isFinite(dur) && dur > 0
            ? Math.max(0, Math.min(t, dur))
            : Math.max(0, t);
        audio.currentTime = clamped;
        setCurrentTime(clamped);
        if (dur && Number.isFinite(dur) && dur > 0) {
          setProgress(clamped / dur);
          setDuration(dur);
        }
      };
      if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
        apply();
      } else {
        const onMeta = () => {
          apply();
          audio.removeEventListener("loadedmetadata", onMeta);
        };
        audio.addEventListener("loadedmetadata", onMeta);
      }
    });
    return () => registerAudioSeek(null);
  }, [setCurrentTime, setDuration, setProgress]);

  // Fallback: apply any pendingSeek that arrived before the registry was ready
  // (e.g. seekTo called during the very first render).
  useEffect(() => {
    if (pendingSeek === null) return;
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = pendingSeek;
      setCurrentTime(pendingSeek);
      const d = audio.duration;
      if (d && isFinite(d) && d > 0) {
        setProgress(pendingSeek / d);
        setDuration(d);
      }
    }
    clearPendingSeek();
  }, [pendingSeek, clearPendingSeek, setCurrentTime, setProgress, setDuration]);

  return (
    <>
      <audio
        ref={setAudioRef}
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
      {children}
    </>
  );
}
