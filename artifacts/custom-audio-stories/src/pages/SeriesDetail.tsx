import { motion } from "framer-motion";
import { Play, Lock } from "lucide-react";
import { useParams } from "wouter";
import { useSeriesFallback } from "@/hooks/use-api-fallbacks";

export default function SeriesDetail() {
  const { id } = useParams();
  const { data: seriesList } = useSeriesFallback();
  const series = seriesList?.find(s => s.id === id);

  if (!series) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex-1"
    >
      <div className="relative w-full h-[50vh] min-h-[400px]">
        {/* series cover */}
        <img 
          src={series.coverImage} 
          alt={series.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 w-full p-8 max-w-5xl mx-auto left-0 right-0">
          <p className="text-primary font-medium tracking-wider uppercase mb-2">Series • {series.mood}</p>
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
          {series.episodes.map((ep, index) => (
            <div 
              key={ep.id}
              className={`glass-panel rounded-2xl p-6 flex items-center justify-between group transition-all duration-300 ${ep.isLocked ? 'opacity-75' : 'hover:border-primary/50 cursor-pointer'}`}
            >
              <div className="flex items-center gap-6">
                <div className="text-3xl font-display font-bold text-muted-foreground/30 w-8 text-center">
                  {ep.episodeNumber}
                </div>
                <div>
                  <h4 className={`text-xl font-semibold mb-1 ${ep.isLocked ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary transition-colors'}`}>
                    {ep.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{ep.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 shrink-0">
                <span className="text-sm text-muted-foreground font-mono">{ep.duration}</span>
                {ep.isLocked ? (
                  <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center border border-border">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
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
    </motion.div>
  );
}
