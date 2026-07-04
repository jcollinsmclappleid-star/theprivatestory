import { useCallback, useMemo } from "react";
import { Link } from "wouter";
import { Play, Pause, Headphones, ChevronRight } from "lucide-react";
import { EDITORS_PICKS, formatRuntime } from "@/data/editorsPicks";
import { useAudioPlayer } from "@/store/use-audio-player";
import { SAMPLE_ID_PREFIX, isSampleId } from "@/data/sampleId";
import type { Story } from "@workspace/api-client-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const TEASER_SLUG = "02-adjoining-suites";

function pickToStory(slug: string): Story | null {
  const pick = EDITORS_PICKS.find((p) => p.slug === slug);
  if (!pick) return null;
  return {
    id: `${SAMPLE_ID_PREFIX}${pick.slug}`,
    title: pick.title,
    description: pick.tagline,
    mood: pick.tags[0] ?? "sample",
    tags: pick.tags,
    duration: formatRuntime(pick.runtimeSec),
    coverImage: `${API_BASE}/voice-samples/editors-picks/covers/${pick.slug}.webp`,
    audioUrl: `${API_BASE}/voice-samples/editors-picks/${pick.slug}.mp3`,
    isPremium: false,
    isNew: false,
  };
}

/** Compact proof — sample craft vs personalised heat */
export function PricingSampleTeaser() {
  const pick = EDITORS_PICKS.find((p) => p.slug === TEASER_SLUG)!;
  const { currentStory, isPlaying, play, togglePlay } = useAudioPlayer();
  const story = useMemo(() => pickToStory(TEASER_SLUG), []);

  const isCurrent = useMemo(
    () =>
      !!currentStory &&
      isSampleId(currentStory.id) &&
      currentStory.id.slice(SAMPLE_ID_PREFIX.length) === TEASER_SLUG,
    [currentStory],
  );
  const playing = isCurrent && isPlaying;

  const onPlay = useCallback(() => {
    if (!story) return;
    if (isCurrent) togglePlay();
    else play(story);
  }, [isCurrent, togglePlay, play, story]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-[#0c0a10]">
      <div className="absolute inset-0 opacity-40 pointer-events-none" aria-hidden>
        <img
          src={`${API_BASE}/voice-samples/editors-picks/covers/${TEASER_SLUG}.webp`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a10] via-[#0c0a10]/85 to-[#0c0a10]/50" />
      </div>
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary mb-2">
            Still deciding? Hear the craft
          </p>
          <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-1">{pick.title}</h3>
          <p className="text-sm text-white/80 italic mb-2">&ldquo;{pick.excerpt}&rdquo;</p>
          <p className="text-xs text-white/55">
            Full cast — {pick.castLabel}. Samples name the fantasy, then stop.{" "}
            <span className="text-white/75">Yours keeps going — as explicit as you choose.</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onPlay}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-[0_0_24px_-6px_rgba(201,162,39,0.45)]"
          >
            {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            {playing ? "Pause" : "Play opening"}
          </button>
          <Link
            href="/samples"
            className="inline-flex items-center justify-center gap-1.5 text-xs text-white/70 hover:text-primary transition-colors py-2"
          >
            <Headphones className="w-3.5 h-3.5" />
            More samples
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
