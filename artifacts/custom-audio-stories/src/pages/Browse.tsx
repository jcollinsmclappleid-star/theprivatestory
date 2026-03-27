import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronLeft, Search, X } from "lucide-react";
import { StoryCard } from "@/components/StoryCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { CategoryTile } from "@/components/CategoryTile";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CATEGORIES = [
  { id: "forbidden_desire",    label: "Forbidden Desire" },
  { id: "dominant_surrendered", label: "Power & Surrender" },
  { id: "late_night",          label: "Late Night" },
  { id: "explicit_collection", label: "Explicit" },
  { id: "slow_burn",           label: "Slow Burn" },
  { id: "emotional_desire",    label: "Emotional Desire" },
  { id: "second_chance",       label: "Second Chances" },
  { id: "dark_romance",        label: "Dark Romance" },
  { id: "historical_romance",  label: "Historical Romance" },
  { id: "first_time",          label: "First Time" },
];

const BROWSE_SECTIONS = [
  {
    label: "Tonight's Heat",
    categoryIds: ["forbidden_desire", "dominant_surrendered", "late_night", "explicit_collection"],
  },
  {
    label: "Deep Romance",
    categoryIds: ["slow_burn", "emotional_desire", "second_chance", "dark_romance"],
  },
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

function StoryRow({ categoryId, label }: { categoryId: string; label: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["stories-row", categoryId],
    queryFn: () => fetchStories(categoryId),
    staleTime: 60_000,
  });

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  };

  if (!isLoading && stories.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <h3 className="font-display text-lg font-semibold text-foreground">{label}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pl-4 sm:pl-6 lg:pl-8 pr-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 sm:w-44 aspect-[3/4] rounded-2xl bg-card/40 animate-pulse" />
            ))
          : stories.slice(0, 10).map((story: any) => (
              <div key={story.id} className="flex-shrink-0 w-36 sm:w-44" style={{ scrollSnapAlign: "start" }}>
                <StoryCard story={story} />
              </div>
            ))}
      </div>
    </div>
  );
}

export default function Browse() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const { data: filteredStories = [], isLoading: filteredLoading } = useQuery({
    queryKey: ["stories-filtered", activeCategory ?? "all", search],
    queryFn: () => fetchStories(activeCategory ?? "all", search || undefined),
    staleTime: 30_000,
    enabled: !!(activeCategory || search),
  });

  const isFiltering = !!(activeCategory || search);

  const activeCategoryLabel = activeCategory
    ? CATEGORIES.find(c => c.id === activeCategory)?.label ?? activeCategory
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 pt-8">
        <p className="text-xs font-medium text-primary uppercase tracking-widest mb-2">Library</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">Browse</h1>
        <p className="text-muted-foreground text-sm">Curated stories, ready to play.</p>
      </div>

      {/* Search bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories…"
            className="w-full bg-card/50 border border-border/50 rounded-full pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category tab strip */}
      <div className="mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 sm:px-6 lg:px-8 min-w-max">
          <button
            onClick={() => { setActiveCategory(null); setSearch(""); }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              !activeCategory && !search
                ? "bg-primary text-primary-foreground border-primary shadow-glow"
                : "border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(activeCategory === cat.id ? null : cat.id); setSearch(""); }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-glow"
                  : "border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter badge */}
      <AnimatePresence>
        {isFiltering && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {search ? `Searching: "${search}"` : `Category: ${activeCategoryLabel}`}
              </span>
              <button
                onClick={() => { setActiveCategory(null); setSearch(""); }}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors border border-primary/30 rounded-full px-2.5 py-1"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isFiltering ? (
          /* Filtered Results Grid */
          <motion.div
            key="filtered"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            {filteredLoading ? (
              <SkeletonGrid count={12} />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {filteredStories.map((story: any) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
                {filteredStories.length === 0 && (
                  <div className="py-24 text-center">
                    <p className="text-muted-foreground text-lg">No stories found.</p>
                    <p className="text-muted-foreground/60 text-sm mt-2">Try a different search or category.</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          /* Section-based browse */
          <motion.div key="sections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* Mood sections */}
            {BROWSE_SECTIONS.map((section) => (
              <div key={section.label} className="mb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold text-foreground">{section.label}</h2>
                    <button
                      onClick={() => {
                        if (activeSection === section.label) {
                          setActiveSection(null);
                        } else {
                          setActiveSection(section.label);
                        }
                      }}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {activeSection === section.label ? "Close" : "See all"}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Category tiles */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {section.categoryIds.map((catId) => {
                      const cat = CATEGORIES.find(c => c.id === catId);
                      if (!cat) return null;
                      return (
                        <CategoryTile
                          key={catId}
                          id={catId}
                          label={cat.label}
                          isActive={activeCategory === catId}
                          onClick={() => setActiveCategory(activeCategory === catId ? null : catId)}
                          compact
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Story row for expanded section */}
                <AnimatePresence>
                  {activeSection === section.label && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      {section.categoryIds.map((catId) => {
                        const cat = CATEGORIES.find(c => c.id === catId);
                        if (!cat) return null;
                        return (
                          <StoryRow key={catId} categoryId={catId} label={cat.label} />
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* All Categories Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">All Categories</h2>
                <p className="text-muted-foreground text-sm">Browse every collection in our library.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12">
                {CATEGORIES.map((cat) => (
                  <CategoryTile
                    key={cat.id}
                    id={cat.id}
                    label={cat.label}
                    isActive={activeCategory === cat.id}
                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                    compact
                  />
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
