import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Link } from "wouter";
import { RowSlider } from "@/components/RowSlider";
import { SkeletonRow } from "@/components/SkeletonCard";
import { useStoriesFallback } from "@/hooks/use-api-fallbacks";
import { useAudioPlayer } from "@/store/use-audio-player";
import { useAuth } from "@/hooks/useAuth";
import type { Story } from "@workspace/api-client-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function useContinueListening(isAuthenticated: boolean) {
  const [items, setItems] = useState<Story[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/continue-listening`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setItems((data as Story[]).slice(0, 8)))
      .catch(() => {});
  }, [isAuthenticated]);

  return items;
}

function useRecommendations(isAuthenticated: boolean) {
  const [recs, setRecs] = useState<{
    for_you: Story[];
    because_you_liked: Story[];
    because_you_liked_mood: string | null;
    has_taste_profile: boolean;
  }>({ for_you: [], because_you_liked: [], because_you_liked_mood: null, has_taste_profile: false });

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/recommendations`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setRecs(data); })
      .catch(() => {});
  }, [isAuthenticated]);

  return recs;
}

function ContinueCard({ story }: { story: Story & { progress?: Record<string, unknown> } }) {
  const { play } = useAudioPlayer();
  const progressSeconds = (story.progress?.audioProgressSeconds as number) ?? 0;
  const sceneIndex = (story.progress?.sceneIndex as number) ?? 0;
  const sceneCount = story.scenes?.length ?? 1;
  const progressFraction = Math.min(progressSeconds / 300, 1);

  return (
    <Link href={`/story/${story.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative flex-shrink-0 w-52 rounded-2xl overflow-hidden border border-border/30 bg-card/40 cursor-pointer group"
        onClick={(e) => { e.preventDefault(); play(story); }}
      >
        <img
          src={story.coverImage}
          alt={story.title}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-xs text-primary font-medium tracking-widest uppercase mb-0.5">{story.mood}</p>
          <p className="text-sm font-semibold text-white line-clamp-1">{story.title}</p>
          <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${progressFraction * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-white/50">Scene {sceneIndex + 1} of {sceneCount}</p>
            <p className="text-xs text-primary font-medium">Resume →</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Home() {
  const { data: stories, isLoading } = useStoriesFallback();
  const { user, isAuthenticated } = useAuth();
  const continueListening = useContinueListening(isAuthenticated);
  const recs = useRecommendations(isAuthenticated);

  const featured = stories?.[0];
  const tonightPicks = stories?.slice(1, 9) || [];
  const lateNight = stories?.filter(s => s.mood === "Late Night") || [];
  const slowBurn = stories?.filter(s => s.mood === "Slow Burn") || [];

  const showContinue = continueListening.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col"
    >
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-end pb-24">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-background/20" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4">
              Your Romantic Story
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-4 leading-tight drop-shadow-xl">
              {featured?.title || "Stories shaped around you"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 line-clamp-2">
              {featured?.description || "Immersive, cinematic audio experiences crafted for your quietest moments."}
            </p>
            <p className="text-sm text-muted-foreground/60 mb-8 italic">
              Best experienced alone, with headphones.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href={`/story/${featured?.id}`}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-semibold flex items-center gap-2 transition-all hover:scale-105 hover:shadow-glow"
              >
                <Play className="w-5 h-5 fill-current" />
                Listen Now
              </Link>
            </div>

            {/* Trust strip */}
            <div className="mt-8 flex flex-wrap gap-4 text-xs text-muted-foreground/60 tracking-wide">
              {["Personalised", "Audio-first", "Cinematic visuals", "Private library"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary/40 inline-block" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Rows */}
      <div className="relative z-20 -mt-12 space-y-4">

        {/* Continue Listening */}
        {showContinue && (
          <section className="py-4 px-4 md:px-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Continue Listening</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Pick up exactly where you left off.</p>
              </div>
              <Link href="/library?tab=continue" className="text-xs text-primary hover:text-primary/80 transition-colors">
                See all →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {continueListening.map((s) => (
                <ContinueCard key={s.id} story={s as Story & { progress?: Record<string, unknown> }} />
              ))}
            </div>
          </section>
        )}

        {isLoading ? (
          <>
            <SkeletonRow count={5} />
            <SkeletonRow count={5} />
            <SkeletonRow count={5} />
          </>
        ) : (
          <>
            {/* For You row — personalised when taste profile exists */}
            {recs.for_you.length > 0 && (
              <RowSlider
                title="For You"
                subtitle="Picked for tonight"
                stories={recs.for_you as Story[]}
              />
            )}

            <RowSlider
              title="Tonight's Picks"
              subtitle="Curated for this exact mood"
              stories={tonightPicks}
            />

            {/* Because You Liked — only when taste profile exists */}
            {recs.has_taste_profile && recs.because_you_liked.length > 0 && (
              <RowSlider
                title={recs.because_you_liked_mood ? `Because you liked ${recs.because_you_liked_mood}` : "You May Also Like"}
                stories={recs.because_you_liked as Story[]}
              />
            )}

            <RowSlider
              title="Late Night"
              subtitle="Made for after midnight"
              stories={lateNight}
            />
          </>
        )}

        {/* Create CTA Banner */}
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-16 text-center border border-primary/20 bg-card/40 backdrop-blur-md flex flex-col items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1499914485622-a88fac536970?w=1200&q=80"
              alt="Atmosphere"
              className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/40" />

            <div className="relative z-10 max-w-xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-foreground">
                Your story, your voice.
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Craft a completely personalised immersive audio experience in moments — shaped entirely around you.
              </p>
              <Link
                href="/create"
                className="inline-flex bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-4 rounded-full font-semibold items-center gap-2 transition-all hover:scale-105 hover:shadow-glow-lg"
              >
                Create Your Story
              </Link>
            </div>
          </div>
        </section>

        {!isLoading && (
          <RowSlider
            title="Slow Burn"
            subtitle="Languid, layered, and intimate"
            stories={slowBurn}
          />
        )}
      </div>
    </motion.div>
  );
}
