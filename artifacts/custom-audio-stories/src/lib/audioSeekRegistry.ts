/**
 * Module-level registry that lets the Zustand store seek the <audio> element
 * directly and synchronously — without going through React state → re-render →
 * useEffect, which introduces a frame-level delay and can drop seeks under
 * concurrent-mode batching.
 */

let seekCb: ((t: number) => void) | null = null;
let pendingSeekTime: number | null = null;
let audioEl: HTMLAudioElement | null = null;

export function registerAudioElement(el: HTMLAudioElement | null): void {
  audioEl = el;
}

/** Live playback position from the <audio> element (preferred over store state). */
export function getLiveAudioTime(): number | null {
  if (!audioEl) return null;
  const t = audioEl.currentTime;
  return Number.isFinite(t) ? t : 0;
}

export function getLiveAudioDuration(): number | null {
  if (!audioEl) return null;
  const d = audioEl.duration;
  return d && Number.isFinite(d) && d > 0 ? d : null;
}

export function registerAudioSeek(fn: ((t: number) => void) | null): void {
  seekCb = fn;
  if (fn && pendingSeekTime !== null) {
    fn(pendingSeekTime);
    pendingSeekTime = null;
  }
}

/** Returns true if a callback was registered and the seek was dispatched. */
export function directSeek(t: number): boolean {
  if (seekCb) {
    seekCb(t);
    return true;
  }
  pendingSeekTime = t;
  return false;
}
