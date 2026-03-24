import { useState } from "react";
import { motion } from "framer-motion";
import { useStoriesFallback } from "@/hooks/use-api-fallbacks";
import { StoryCard } from "@/components/StoryCard";

const MOODS = ["All", "Slow Burn", "Late Night", "Emotional", "Forbidden", "First Encounter", "Tender"];

export default function Browse() {
  const [activeMood, setActiveMood] = useState("All");
  const { data: stories } = useStoriesFallback(activeMood !== "All" ? { mood: activeMood } : undefined);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8"
    >
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">Browse Library</h1>
        
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3">
          {MOODS.map(mood => (
            <button
              key={mood}
              onClick={() => setActiveMood(mood)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeMood === mood 
                  ? 'bg-primary text-primary-foreground shadow-glow' 
                  : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {stories?.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
      
      {stories?.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          No stories found for this mood.
        </div>
      )}
    </motion.div>
  );
}
