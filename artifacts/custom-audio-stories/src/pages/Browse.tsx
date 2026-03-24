import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { StoryCard } from "@/components/StoryCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { MOCK_STORIES } from "@/lib/mockData";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CATEGORIES = [
  { id: "all",                         label: "All" },
  { id: "forbidden_desire",            label: "Forbidden Desire" },
  { id: "dark_romance",                label: "Dark Romance" },
  { id: "slow_burn_romance",           label: "Slow Burn" },
  { id: "roleplay_fantasy",            label: "Roleplay Fantasy" },
  { id: "sensual_intimacy",            label: "Sensual Intimacy" },
  { id: "power_and_surrender",         label: "Power & Surrender" },
  { id: "late_night_encounters",       label: "Late Night" },
  { id: "second_chances",              label: "Second Chances" },
  { id: "first_time_energy",           label: "First Time" },
  { id: "luxury_fantasy",              label: "Luxury & Desire" },
  { id: "voice_and_whisper",           label: "Voice & Whisper" },
  { id: "psychological_thriller_romance", label: "Psychological" },
  { id: "thriller_romance",            label: "Thriller" },
  { id: "sci_fi_romance",              label: "Sci-Fi" },
  { id: "cinematic_moments",           label: "Cinematic" },
  { id: "confessional",                label: "Confessional" },
  { id: "what_if",                     label: "What If" },
  { id: "five_minute_desire",          label: "5 Min Desire" },
];

async function fetchStories(categoryId: string, search?: string) {
  const params = new URLSearchParams();
  if (categoryId !== "all") params.set("category", categoryId);
  if (search) params.set("search", search);
  const url = `${API_BASE}/api/stories?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function Browse() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const { data: dbStories, isLoading, isError } = useQuery({
    queryKey: ["stories", activeCategory, search],
    queryFn: () => fetchStories(activeCategory, search || undefined),
    staleTime: 30_000,
  });

  // Fall back to mock data if API returns nothing
  let stories = dbStories ?? [];
  if (isError || (stories.length === 0 && !isLoading)) {
    stories = MOCK_STORIES as unknown as typeof stories;
    if (search) {
      const q = search.toLowerCase();
      stories = stories.filter((s: any) =>
        s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8"
    >
      <div className="mb-8">
        <p className="text-xs font-medium text-primary uppercase tracking-widest mb-2">Library</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">Browse</h1>
        <p className="text-muted-foreground text-sm">Curated stories, ready to play.</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stories…"
          className="w-full max-w-sm bg-card/50 border border-border/50 rounded-full px-5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-10 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonGrid count={12} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {stories.map((story: any) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          {stories.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-muted-foreground text-lg">No stories yet in this category.</p>
              <p className="text-muted-foreground/60 text-sm mt-2">
                Generate and publish stories from the admin panel to fill the library.
              </p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
