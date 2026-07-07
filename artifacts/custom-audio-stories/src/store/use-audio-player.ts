import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Story } from "@workspace/api-client-react";
import { directSeek, getLiveAudioDuration, getLiveAudioTime } from "@/lib/audioSeekRegistry";

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
  seekBy: (deltaSeconds: number) => void;
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
                  // seekTo updates currentTime/progress AND moves the audio
                  // element to the resume position so playback resumes from
                  // where the user left off rather than from 0.
                  useAudioPlayer.getState().seekTo(entry.audioProgressSeconds);
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
        const dur = getLiveAudioDuration() ?? duration;
        const clamped = Math.max(0, dur > 0 ? Math.min(t, dur) : t);
        const seeked = directSeek(clamped);
        set({
          currentTime: clamped,
          progress: dur > 0 ? clamped / dur : 0,
          pendingSeek: seeked ? null : clamped,
        });
      },

      seekBy: (deltaSeconds) => {
        const { duration, currentTime } = get();
        const base = getLiveAudioTime() ?? currentTime;
        const dur = getLiveAudioDuration() ?? duration;
        const next =
          dur > 0
            ? Math.max(0, Math.min(base + deltaSeconds, dur))
            : Math.max(0, base + deltaSeconds);
        get().seekTo(next);
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
