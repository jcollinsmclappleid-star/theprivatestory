import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Link } from "wouter";
import { RowSlider } from "@/components/RowSlider";
import { useStoriesFallback } from "@/hooks/use-api-fallbacks";
import { useAudioPlayer } from "@/store/use-audio-player";

export default function Home() {
  const { data: stories } = useStoriesFallback();
  const { currentStory } = useAudioPlayer();

  const featured = stories?.[0];
  const tonightPicks = stories?.slice(1, 9) || [];
  const lateNight = stories?.filter(s => s.mood === "Late Night") || [];
  const slowBurn = stories?.filter(s => s.mood === "Slow Burn") || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex-1 flex flex-col"
    >
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-end pb-24">
        {/* dark cinematic hero background */}
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
              Featured Premiere
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-4 leading-tight drop-shadow-xl">
              {featured?.title || "Midnight Whispers"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 line-clamp-2">
              {featured?.description}
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
          </motion.div>
        </div>
      </section>

      {/* Content Rows */}
      <div className="relative z-20 -mt-12 space-y-4">
        {currentStory && (
          <RowSlider title="Continue Listening" stories={[currentStory]} />
        )}
        <RowSlider title="Tonight's Picks" stories={tonightPicks} />
        <RowSlider title="Late Night Intimacy" stories={lateNight} />
        
        {/* Create CTA Banner */}
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-16 text-center border border-primary/20 bg-card/40 backdrop-blur-md flex flex-col items-center justify-center">
            {/* abstract warm light stock */}
            <img 
              src="https://images.unsplash.com/photo-1499914485622-a88fac536970?w=1200&q=80" 
              alt="Atmosphere"
              className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/40" />
            
            <div className="relative z-10 max-w-xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-foreground">
                Your desires, narrated.
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Craft a completely personalized immersive audio experience in seconds using our premium AI models.
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

        <RowSlider title="Slow Burn" stories={slowBurn} />
      </div>
    </motion.div>
  );
}
