import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Story } from "@workspace/api-client-react";

const getUserId = () => {
  let id = localStorage.getItem("cas-user-id");
  if (!id) {
    id = `guest-${crypto.randomUUID()}`;
    localStorage.setItem("cas-user-id", id);
  }
  return id;
};

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

let progressTimer: ReturnType<typeof setInterval> | null = null;

const syncProgress = (storyId: string, currentTime: number, sceneIndex: number) => {
  const userId = getUserId();
  fetch(`${API_BASE}/api/update-progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, storyId, audioProgressSeconds: Math.floor(currentTime), sceneIndex }),
  }).catch(() => {});
};

interface AudioPlayerState {
  currentStory: Story | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  play: (story?: Story) => void;
  pause: () => void;
  togglePlay: () => void;
  setProgress: (p: number) => void;
  setCurrentTime: (t: number, sceneIndex?: number) => void;
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
      duration: 300,

      play: (story) => {
        if (story) {
          if (get().currentStory?.id !== story.id) {
            set({ currentStory: story, progress: 0, currentTime: 0, isPlaying: true });
          } else {
            set({ isPlaying: true });
          }
        } else {
          set({ isPlaying: true });
        }

        if (!progressTimer) {
          progressTimer = setInterval(() => {
            const state = get();
            if (state.isPlaying && state.currentStory) {
              const sceneCount = state.currentStory.scenes?.length ?? 1;
              const sceneIndex = Math.min(Math.floor(state.progress * sceneCount), sceneCount - 1);
              syncProgress(state.currentStory.id, state.currentTime, sceneIndex);
            }
          }, 10_000);
        }
      },

      pause: () => set({ isPlaying: false }),

      togglePlay: () => {
        const { isPlaying, currentStory } = get();
        if (!currentStory) return;
        set({ isPlaying: !isPlaying });
      },

      setProgress: (progress) => set({ progress }),

      setCurrentTime: (currentTime, sceneIndex) => {
        set({ currentTime });
        const state = get();
        if (state.currentStory && sceneIndex !== undefined) {
          syncProgress(state.currentStory.id, currentTime, sceneIndex);
        }
      },

      setDuration: (duration) => set({ duration }),

      close: () => {
        if (progressTimer) {
          clearInterval(progressTimer);
          progressTimer = null;
        }
        set({ currentStory: null, isPlaying: false, progress: 0, currentTime: 0 });
      },
    }),
    {
      name: 'cas-audio-storage',
      partialize: (state) => ({
        currentStory: state.currentStory,
        progress: state.progress,
        currentTime: state.currentTime,
      }),
    }
  )
);

export { getUserId };
