import { Link } from "wouter";
import { Lock, Sparkles } from "lucide-react";
import type { Story } from "@workspace/api-client-react/src/generated/api.schemas";

export function StoryCard({ story, className = "" }: { story: Story, className?: string }) {
  return (
    <Link href={`/story/${story.id}`} className={`group relative block overflow-hidden rounded-2xl glass-panel ${className}`}>
      <div className="aspect-[3/4] overflow-hidden relative">
        {/* story card cover image */}
        <img 
          src={story.coverImage} 
          alt={story.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {story.isPremium && (
            <div className="bg-background/80 backdrop-blur-md px-2 py-1 rounded-full border border-primary/20 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-medium text-primary uppercase tracking-wider">Premium</span>
            </div>
          )}
          {story.isNew && (
            <div className="bg-primary/90 text-primary-foreground px-2 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span className="text-[10px] font-medium uppercase tracking-wider">New</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end">
          <p className="text-xs font-medium text-primary mb-1 tracking-wide">{story.mood}</p>
          <h3 className="text-lg font-display font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {story.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
            <span>{story.duration}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{story.tags[0]}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
