import { useEffect, useRef } from "react";
import type { Story } from "@workspace/api-client-react";

const STORAGE_KEY = "homeSampleTeaserPlayed";

/** Play first sample once when #home-samples scrolls into view (per session). */
export function useHomeSampleAutoplay(
  sectionId: string,
  play: (story: Story) => void,
  story: Story | null,
) {
  const triggered = useRef(false);

  useEffect(() => {
    if (!story || triggered.current) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      /* ignore */
    }

    const el = document.getElementById(sectionId);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || triggered.current) return;
        triggered.current = true;
        try {
          sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
          /* ignore */
        }
        play(story);
        observer.disconnect();
      },
      { threshold: 0.42, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionId, play, story]);
}
