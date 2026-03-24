import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Lock } from "lucide-react";
import { useParams } from "wouter";
import { useSeriesFallback } from "@/hooks/use-api-fallbacks";
import { PremiumModal } from "@/components/PremiumModal";

export default function SeriesDetail() {
  const { id } = useParams();
  const { data: seriesList } = useSeriesFallback();
  const series = seriesList?.find(s => s.id === id);
  const [premiumOpen, setPremiumOpen] = useState(false);

  if (!series) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1"
    >
      <div className="relative w-full h-[50vh] min-h-[400px]">
        <img
          src={series.coverImage}
          alt={series.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="absolute bottom-0 w-full p-8 max-w-5xl mx-auto left-0 right-0">
          <p className="text-primary font-medium tracking-wider uppercase mb-2">Series · {series.mood}</p>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground mb-4">
            {series.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            {series.description}
          </p>
          <div className="flex gap-2">
            {series.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        <h3 className="text-2xl font-display font-semibold mb-6">Episodes</h3>
        <div className="space-y-4">
          {series.episodes.map((ep) => (
            <div
              key={ep.id}
              className={`glass-panel rounded-2xl p-6 flex items-center justify-between group transition-all duration-300 ${
                ep.isLocked
                  ? "opacity-70 ring-1 ring-amber-400/15 cursor-pointer"
                  : "hover:border-primary/50 cursor-pointer"
              }`}
              onClick={() => { if (ep.isLocked) setPremiumOpen(true); }}
            >
              <div className="flex items-center gap-6">
                <div className="text-3xl font-display font-bold text-muted-foreground/30 w-8 text-center">
                  {ep.episodeNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-xl font-semibold ${ep.isLocked ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary transition-colors'}`}>
                      {ep.title}
                    </h4>
                    {ep.isLocked && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-medium text-amber-400 uppercase tracking-wider">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{ep.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <span className="text-sm text-muted-foreground font-mono">{ep.duration}</span>
                {ep.isLocked ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); setPremiumOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-medium hover:bg-amber-400/20 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Locked
                  </button>
                ) : (
                  <button className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-glow">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </motion.div>
  );
}
