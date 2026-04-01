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

export const AMBIENT_OPTIONS = [
  { id: "rain", label: "Rain", url: "https://cdn.pixabay.com/audio/2022/05/17/audio_d9090b2f7e.mp3" },
  { id: "city_night", label: "City at Night", url: "https://cdn.pixabay.com/audio/2022/03/09/audio_c8c8a73467.mp3" },
  { id: "train", label: "Train", url: "https://cdn.pixabay.com/audio/2021/08/09/audio_ea0e95f1f3.mp3" },
  { id: "firelight", label: "Firelight", url: "https://cdn.pixabay.com/audio/2022/01/18/audio_d0c6ff1bab.mp3" },
  { id: "ocean", label: "Ocean", url: "https://cdn.pixabay.com/audio/2021/09/06/audio_27512d05ea.mp3" },
  { id: "quiet_room", label: "Quiet Room", url: "https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3" },
] as const;

export type AmbientId = (typeof AMBIENT_OPTIONS)[number]["id"];

export const MOOD_TO_AMBIENT: Record<string, AmbientId> = {
  "Late Night": "city_night",
  "Slow Burn": "firelight",
  "Emotional": "rain",
  "Tender": "quiet_room",
  "Forbidden": "city_night",
  "First Encounter": "ocean",
};

interface AudioPlayerState {
  currentStory: Story | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  pendingSeek: number | null;
  ambientMode: AmbientId | null;
  ambientVolume: number;
  play: (story?: Story) => void;
  pause: () => void;
  togglePlay: () => void;
  setProgress: (p: number) => void;
  setCurrentTime: (t: number, sceneIndex?: number) => void;
  setDuration: (d: number) => void;
  seekTo: (t: number) => void;
  clearPendingSeek: () => void;
  close: () => void;
  setAmbientMode: (id: AmbientId | null) => void;
  setAmbientVolume: (v: number) => void;
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
      ambientMode: null,
      ambientVolume: 0.2,

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

            // Auto-suggest ambient based on story mood
            const suggestedAmbient = story.mood ? MOOD_TO_AMBIENT[story.mood] ?? null : null;
            if (suggestedAmbient && !get().ambientMode) {
              set({ ambientMode: suggestedAmbient });
            }
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

      setAmbientMode: (id) => set({ ambientMode: id }),
      setAmbientVolume: (v) => set({ ambientVolume: v }),
    }),
    {
      name: 'cas-audio-storage',
      partialize: (state) => ({
        currentStory: state.currentStory,
        progress: state.progress,
        currentTime: state.currentTime,
        ambientMode: state.ambientMode,
        ambientVolume: state.ambientVolume,
      }),
    }
  )
);
