import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronLeft, Search, X, Lock, BookOpen, Headphones, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { StoryCard } from "@/components/StoryCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { CategoryTile } from "@/components/CategoryTile";
import { useSubscription } from "@/hooks/useSubscription";
import { AgeGate, hasConfirmedAge } from "@/components/AgeGate";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CATEGORIES = [
  { id: "forbidden_complicated",   label: "Forbidden & Complicated" },
  { id: "power_tension",           label: "Power & Tension" },
  { id: "dark_dangerous",          label: "Dark & Dangerous" },
  { id: "psychological_obsessive", label: "Psychological & Obsessive" },
  { id: "reunion_return",          label: "Reunion & Return" },
  { id: "first_unknown",           label: "First & Unknown" },
  { id: "circumstance_proximity",  label: "Circumstance & Proximity" },
  { id: "secrets_unspoken",        label: "Secrets & Unspoken" },
  { id: "slow_burn_patience",      label: "Slow Burn & Patience" },
  { id: "professional_crossing_lines", label: "Professional & Crossing Lines" },
];

const BROWSE_SECTIONS = [
  {
    label: "Heat & Tension",
    categoryIds: ["forbidden_complicated", "power_tension", "dark_dangerous", "psychological_obsessive"],
  },
  {
    label: "Heart & Longing",
    categoryIds: ["reunion_return", "first_unknown", "circumstance_proximity", "secrets_unspoken", "slow_burn_patience", "professional_crossing_lines"],
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

function StoryRow({ categoryId, label, isPaid, onGated }: { categoryId: string; label: string; isPaid: boolean; onGated: () => void }) {
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
              <div key={story.id} className="relative flex-shrink-0 w-36 sm:w-44" style={{ scrollSnapAlign: "start" }}>
                <StoryCard story={story} />
                {!isPaid && (
                  <button
                    className="absolute inset-0 z-10 flex items-end justify-center pb-3 bg-black/10 rounded-2xl group"
                    onClick={onGated}
                    aria-label="Subscribe to read"
                  >
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-white/80 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <Lock className="w-2.5 h-2.5" /> Subscribe
                    </span>
                  </button>
                )}
              </div>
            ))}
      </div>
    </div>
  );
}

function CollectionGate() {
  const [, navigate] = useLocation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 pt-8">
        <p className="text-xs font-medium text-primary uppercase tracking-widest mb-2">Library</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">Browse</h1>
        <p className="text-muted-foreground text-sm">Curated stories, ready to play.</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">Collection access</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The curated collection — original audio stories with new releases every month — is included with every subscription.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <button
            onClick={() => navigate("/pricing")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-glow"
          >
            <Sparkles className="w-4 h-4" />
            View plans — from £29/month
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { icon: <BookOpen className="w-4 h-4 text-primary" />, label: "Curated collection", desc: "Original stories across every mood and category." },
            { icon: <Headphones className="w-4 h-4 text-primary" />, label: "Premium narration", desc: "ElevenLabs voices, chosen for intimacy and clarity." },
            { icon: <Sparkles className="w-4 h-4 text-primary" />, label: "Monthly releases", desc: "New stories added every month, automatically." },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="bg-card/40 border border-border/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">{icon}<span className="text-sm font-semibold text-foreground">{label}</span></div>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Browse() {
  const [ageConfirmed, setAgeConfirmed] = useState(() => hasConfirmedAge());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { isPaid } = useSubscription();
  const [, navigate] = useLocation();

  const { data: filteredStories = [], isLoading: filteredLoading } = useQuery({
    queryKey: ["stories-filtered", activeCategory ?? "all", search],
    queryFn: () => fetchStories(activeCategory ?? "all", search || undefined),
    staleTime: 30_000,
    enabled: isPaid && !!(activeCategory || search),
  });

  const isFiltering = !!(activeCategory || search);

  if (!ageConfirmed) {
    return <AgeGate onConfirmed={() => setAgeConfirmed(true)} />;
  }

  if (!isPaid) return <CollectionGate />;

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
                    <div key={story.id} className="relative">
                      <StoryCard story={story} />
                      {!isPaid && (
                        <button
                          className="absolute inset-0 z-10 flex items-end justify-center pb-3 bg-black/10 rounded-2xl group"
                          onClick={() => navigate("/pricing")}
                          aria-label="Subscribe to read"
                        >
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-white/80 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            <Lock className="w-2.5 h-2.5" /> Subscribe
                          </span>
                        </button>
                      )}
                    </div>
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
                          window.scrollTo({ top: 0, behavior: "smooth" });
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
                          onClick={() => {
                            setActiveCategory(activeCategory === catId ? null : catId);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
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
                          <StoryRow key={catId} categoryId={catId} label={cat.label} isPaid={isPaid} onGated={() => navigate("/pricing")} />
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
                    onClick={() => {
                      setActiveCategory(activeCategory === cat.id ? null : cat.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
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
