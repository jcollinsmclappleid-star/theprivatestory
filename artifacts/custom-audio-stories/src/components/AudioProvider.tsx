import { useEffect, useRef } from 'react';
import { useAudioPlayer } from '@/store/use-audio-player';

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

  useEffect(() => {
    if (!currentStory) return;

    if (currentStory.audioUrl) {
      // Use real audio element
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.play().catch(console.error);
        } else {
          audioRef.current.pause();
        }
      }
    } else {
      // Robust simulation for mock data without real audio files
      if (isPlaying) {
        simulationIntervalRef.current = window.setInterval(() => {
          useAudioPlayer.setState((state) => {
            const nextTime = state.currentTime + 1;
            if (nextTime >= state.duration) {
              clearInterval(simulationIntervalRef.current!);
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
        onEnded={() => pause()}
      />
      {children}
    </>
  );
}
