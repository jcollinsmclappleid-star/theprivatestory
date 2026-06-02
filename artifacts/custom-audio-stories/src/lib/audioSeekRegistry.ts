/**
 * Module-level registry that lets the Zustand store seek the <audio> element
 * directly and synchronously — without going through React state → re-render →
 * useEffect, which introduces a frame-level delay and can drop seeks under
 * concurrent-mode batching.
 *
 * AudioProvider registers its seek function on mount and removes it on unmount.
 * The store's seekTo() calls directSeek() first; it falls back to pendingSeek
 * state only when the registry has no callback (e.g. server-side or before mount).
 */

let seekCb: ((t: number) => void) | null = null;

export function registerAudioSeek(fn: ((t: number) => void) | null): void {
  seekCb = fn;
}

/** Returns true if a callback was registered and the seek was dispatched. */
export function directSeek(t: number): boolean {
  if (seekCb) {
    seekCb(t);
    return true;
  }
  return false;
}
