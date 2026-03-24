import { useEffect, useRef } from 'react';
import { useAudioPlayer, getUserId, AMBIENT_OPTIONS } from '@/store/use-audio-player';

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function trackCompletion(storyId: string, mood: string) {
  const userId = getUserId();
  fetch(`${API_BASE}/api/update-taste`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, mood, event: "completed" }),
  }).catch(() => {});
  fetch(`${API_BASE}/api/progress`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, storyId }),
  }).catch(() => {});
}

function trackReplay(mood: string) {
  const userId = getUserId();
  fetch(`${API_BASE}/api/update-taste`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, mood, event: "replayed" }),
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
    if (!currentStory) return;

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
            const nextTime = state.currentTime + 1;
            if (nextTime >= state.duration) {
              clearInterval(simulationIntervalRef.current!);
              if (state.currentStory) {
                trackCompletion(state.currentStory.id, state.currentStory.mood ?? "");
              }
              return { currentTime: state.duration, progress: 1, isPlaying: false };
            }
            return { currentTime: nextTime, progress: nextTime / state.duration };
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

  // Ambient audio control — loops INDEPENDENTLY of narration
  // Ambient plays whenever an ambientMode is selected, regardless of narration state.
  // It only stops if the user removes ambient mode entirely.
  useEffect(() => {
    const el = ambientRef.current;
    if (!el) return;

    const option = AMBIENT_OPTIONS.find((o) => o.id === ambientMode);

    if (!option) {
      // No ambient selected — stop and clear
      el.pause();
      el.removeAttribute("src");
      el.load();
      ambientStartedRef.current = false;
      return;
    }

    const newUrl = option.url;

    if (el.src !== newUrl) {
      el.src = newUrl;
      el.loop = true;
      el.volume = ambientVolume;
      el.load();
      ambientStartedRef.current = false;
    }

    // Play immediately (ambient loops regardless of narration state)
    if (!ambientStartedRef.current) {
      el.play()
        .then(() => { ambientStartedRef.current = true; })
        .catch(() => {
          // Autoplay may be blocked; will retry on next user gesture
          ambientStartedRef.current = false;
        });
    }
  }, [ambientMode]);

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
        src={currentStory?.audioUrl}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          const d = e.currentTarget.duration || duration;
          setCurrentTime(t);
          setProgress(t / d);
        }}
        onLoadedMetadata={(e) => {
          if (e.currentTarget.duration !== Infinity) {
            setDuration(e.currentTarget.duration);
          }
        }}
        onEnded={handleEnded}
      />
      <audio ref={ambientRef} loop />
      {children}
    </>
  );
}
