import { useState } from "react";
import { Link } from "wouter";
import { Lock, Sparkles } from "lucide-react";
import type { Story } from "@workspace/api-client-react";
import { PremiumModal } from "./PremiumModal";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface StoryCardProps {
  story: Story;
  className?: string;
  showProgress?: boolean;
  progress?: Record<string, unknown>;
}

/** Parse a duration string like "12 min", "10-15 min", "Short Story" into seconds */
function parseDurationToSeconds(duration: string | null | undefined): number {
  if (!duration) return 600; // fallback 10 min
  const single = duration.match(/^(\d+)\s*min/i);
  if (single) return parseInt(single[1], 10) * 60;
  const range = duration.match(/^(\d+)\s*[-–]\s*(\d+)\s*min/i);
  if (range) return Math.round((parseInt(range[1], 10) + parseInt(range[2], 10)) / 2) * 60;
  return 600;
}

export function StoryCard({ story, className = "", showProgress, progress }: StoryCardProps) {
  const [premiumOpen, setPremiumOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (story.isPremium) {
      e.preventDefault();
      setPremiumOpen(true);
    }
  };

  return (
    <>
      <Link
        href={`/story/${story.id}`}
        onClick={handleClick}
        className={`group relative block overflow-hidden rounded-2xl glass-panel ${className} ${
          story.isPremium ? "opacity-75 ring-1 ring-amber-400/20" : ""
        }`}
      >
        <div className="aspect-[3/4] overflow-hidden relative">
          <img
            src={story.coverImage || `${BASE}/cover-slow-burn.png`}
            alt={story.title}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              story.isPremium ? "brightness-75" : ""
            }`}
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = `${BASE}/cover-slow-burn.png`; }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            {story.isPremium && (
              <div className="bg-background/80 backdrop-blur-md px-2 py-1 rounded-full border border-amber-400/40 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">Premium</span>
              </div>
            )}
            {story.isNew && !story.isPremium && (
              <div className="bg-primary/90 text-primary-foreground px-2 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span className="text-[10px] font-medium uppercase tracking-wider">New</span>
              </div>
            )}
          </div>

          {/* Title & Description Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end">
            <p className="text-xs font-medium text-primary mb-1 tracking-wide">{story.mood}</p>
            <h3 className="text-lg font-display font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {story.title}
            </h3>
            
            {/* Hooking Description - Shows on hover */}
            {story.description && (
              <p className="text-xs text-foreground/70 mt-2 line-clamp-2 group-hover:line-clamp-3 transition-all">
                {story.description}
              </p>
            )}
            
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
              <span>{story.duration}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{story.tags?.[0]}</span>
            </p>

            {showProgress && progress && (
              <div className="mt-2">
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${Math.min(
                        ((progress.audioProgressSeconds as number) ?? 0) /
                          parseDurationToSeconds(story.duration),
                        1
                      ) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </>
  );
}
