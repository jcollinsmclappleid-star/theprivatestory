import { useEffect, useRef } from 'react';
import { useAudioPlayer, getUserId } from '@/store/use-audio-player';

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function trackCompletion(storyId: string, mood: string) {
  const userId = getUserId();
  fetch(`${API_BASE}/api/update-taste`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, mood, event: "completed" }),
  }).catch(() => {});
  // Remove from continue-listening by deleting the progress entry
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
    pause
  } = useAudioPlayer();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const simulationIntervalRef = useRef<number | null>(null);
  const playCountRef = useRef<Record<string, number>>({});

  const handlePlay = (storyId: string, mood: string) => {
    const count = (playCountRef.current[storyId] ?? 0) + 1;
    playCountRef.current[storyId] = count;
    if (count > 1) {
      trackReplay(mood);
    }
  };

  const handleEnded = () => {
    if (currentStory) {
      trackCompletion(currentStory.id, currentStory.mood ?? "");
    }
    pause();
  };

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
      {children}
    </>
  );
}
