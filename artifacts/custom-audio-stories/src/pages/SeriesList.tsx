import { motion } from "framer-motion";
import { Link } from "wouter";
import { Layers } from "lucide-react";
import { useSeriesFallback } from "@/hooks/use-api-fallbacks";

export default function SeriesList() {
  const { data: seriesList } = useSeriesFallback();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8"
    >
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Premium Series</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Multi-part episodic journeys that unfold over time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {seriesList?.map(series => (
          <Link key={series.id} href={`/series/${series.id}`} className="group relative block overflow-hidden rounded-3xl glass-panel aspect-[4/3]">
            {/* series cover */}
            <img 
              src={series.coverImage} 
              alt={series.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            
            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/20 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground">{series.episodeCount} Parts</span>
            </div>

            <div className="absolute bottom-0 w-full p-6">
              <p className="text-primary text-sm font-medium mb-2">{series.mood}</p>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {series.title}
              </h2>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {series.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
