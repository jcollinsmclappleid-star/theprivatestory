import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Story } from "@workspace/api-client-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

let progressTimer: ReturnType<typeof setInterval> | null = null;

const syncProgress = (storyId: string, currentTime: number, sceneIndex: number) => {
  fetch(`${API_BASE}/api/update-progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ storyId, audioProgressSeconds: Math.floor(currentTime), sceneIndex }),
  }).catch(() => {});
};

interface AudioPlayerState {
  currentStory: Story | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  pendingSeek: number | null;
  narrationVolume: number;
  play: (story?: Story) => void;
  pause: () => void;
  togglePlay: () => void;
  setProgress: (p: number) => void;
  setCurrentTime: (t: number, sceneIndex?: number) => void;
  setDuration: (d: number) => void;
  seekTo: (t: number) => void;
  clearPendingSeek: () => void;
  close: () => void;
  setNarrationVolume: (v: number) => void;
}

export const useAudioPlayer = create<AudioPlayerState>()(
  persist(
    (set, get) => ({
      currentStory: null,
      isPlaying: false,
      progress: 0,
      currentTime: 0,
      duration: 0,
      pendingSeek: null,
      narrationVolume: 1,

      play: (story) => {
        if (story) {
          if (get().currentStory?.id !== story.id) {
            set({ currentStory: story, progress: 0, currentTime: 0, duration: 0, isPlaying: true });

            fetch(`${API_BASE}/api/progress?storyId=${encodeURIComponent(story.id)}`, {
              credentials: "include",
            })
              .then((r) => r.ok ? r.json() : null)
              .then((entry: { audioProgressSeconds?: number } | null) => {
                if (entry && entry.audioProgressSeconds && entry.audioProgressSeconds > 5) {
                  const dur = useAudioPlayer.getState().duration || 300;
                  useAudioPlayer.setState({
                    currentTime: entry.audioProgressSeconds,
                    progress: Math.min(entry.audioProgressSeconds / dur, 1),
                  });
                }
              })
              .catch(() => {});
          } else {
            set({ isPlaying: true });
          }
        } else {
          set({ isPlaying: false });
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

      seekTo: (t) => {
        const { duration } = get();
        const clamped = Math.max(0, duration > 0 ? Math.min(t, duration) : t);
        set({
          currentTime: clamped,
          progress: duration > 0 ? clamped / duration : 0,
          pendingSeek: clamped,
        });
      },

      clearPendingSeek: () => set({ pendingSeek: null }),

      close: () => {
        if (progressTimer) {
          clearInterval(progressTimer);
          progressTimer = null;
        }
        set({ currentStory: null, isPlaying: false, progress: 0, currentTime: 0 });
      },

      setNarrationVolume: (v) => set({ narrationVolume: v }),
    }),
    {
      name: 'cas-audio-storage',
      partialize: (state) => ({
        currentStory: state.currentStory,
        progress: state.progress,
        currentTime: state.currentTime,
        narrationVolume: state.narrationVolume,
      }),
    }
  )
);
