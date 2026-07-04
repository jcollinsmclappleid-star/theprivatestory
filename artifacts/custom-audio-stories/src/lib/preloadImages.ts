import { useEffect, useMemo, useState } from "react";

/** Warm browser cache for image URLs (fire-and-forget). */
export function preloadImages(urls: string[]): void {
  for (const url of urls) {
    if (!url) continue;
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  }
}

/** Preload a set of URLs; resolves when all have loaded or errored. */
export function usePreloadImages(urls: string[]): boolean {
  const key = useMemo(() => urls.filter(Boolean).join("\0"), [urls]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const list = key ? key.split("\0") : [];
    if (list.length === 0) {
      setReady(true);
      return;
    }
    let cancelled = false;
    setReady(false);
    Promise.all(
      list.map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.decoding = "async";
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = url;
          }),
      ),
    ).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return ready;
}

const SLIDE_MS = 3800;

/** Auto-advancing slideshow with tab-visibility pause. */
export function useSlideshow(length: number, intervalMs = SLIDE_MS, enabled = true) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [length]);

  useEffect(() => {
    if (!enabled || length <= 1) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((i) => (i + 1) % length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [length, intervalMs, enabled]);

  return [index, setIndex] as const;
}

export const ACT4_SLIDE_INTERVAL_MS = SLIDE_MS;
