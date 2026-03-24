import { useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { useStoriesFallback } from "@/hooks/use-api-fallbacks";
import { StoryCard } from "@/components/StoryCard";

export default function Search() {
  const [query, setQuery] = useState("");
  const { data: stories } = useStoriesFallback(query ? { search: query } : undefined);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8"
    >
      <div className="max-w-2xl mx-auto mb-12 relative">
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for stories, moods, or themes..."
          className="w-full bg-card/50 backdrop-blur-md border border-border/50 rounded-full py-5 pl-16 pr-6 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-xl"
        />
      </div>

      {query && (
        <div className="mb-6">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Results for "{query}"
          </h2>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {stories?.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
      
      {stories?.length === 0 && query && (
        <div className="py-20 text-center text-muted-foreground">
          No stories found matching your search.
        </div>
      )}
    </motion.div>
  );
}
