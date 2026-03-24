import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Story } from "@workspace/api-client-react/src/generated/api.schemas";

interface AudioPlayerState {
  currentStory: Story | null;
  isPlaying: boolean;
  progress: number; // 0.0 to 1.0
  currentTime: number;
  duration: number;
  play: (story?: Story) => void;
  pause: () => void;
  togglePlay: () => void;
  setProgress: (p: number) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  close: () => void;
}

export const useAudioPlayer = create<AudioPlayerState>()(
  persist(
    (set, get) => ({
      currentStory: null,
      isPlaying: false,
      progress: 0,
      currentTime: 0,
      duration: 300, // Default 5 mins

      play: (story) => {
        if (story) {
          // If playing a new story, reset progress unless it's the same one
          if (get().currentStory?.id !== story.id) {
            set({ currentStory: story, progress: 0, currentTime: 0, isPlaying: true });
          } else {
            set({ isPlaying: true });
          }
        } else {
          set({ isPlaying: true });
        }
      },
      
      pause: () => set({ isPlaying: false }),
      
      togglePlay: () => {
        const { isPlaying, currentStory } = get();
        if (!currentStory) return;
        set({ isPlaying: !isPlaying });
      },
      
      setProgress: (progress) => set({ progress }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      
      close: () => set({ currentStory: null, isPlaying: false, progress: 0, currentTime: 0 }),
    }),
    {
      name: 'moonlit-audio-storage',
      partialize: (state) => ({ 
        currentStory: state.currentStory, 
        progress: state.progress, 
        currentTime: state.currentTime 
      }), // Persist these fields
    }
  )
);
