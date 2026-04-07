import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useEffect } from "react";
import { MiniDoorCTA } from "@/components/ThreeDoors";

const CLUSTERS = [
  {
    heading: "Personalised & Private",
    description: "Stories created around you — not chosen from a library, not written for a general audience. Yours, tonight.",
    pages: [
      { label: "Personalised audio stories", href: "/personalised-audio-stories", tagline: "Audio stories written entirely around how you want to feel" },
      { label: "Private audio stories", href: "/private-audio-stories", tagline: "Your listening is no one else's business" },
      { label: "Create your own audio story", href: "/create-your-own-audio-story", tagline: "Build the story you've always been looking for" },
      { label: "AI audio story generator", href: "/ai-audio-story-generator", tagline: "An AI that writes your story, not just a story" },
    ],
  },
  {
    heading: "Relaxation & Sleep",
    description: "Stories for the end of the day. Literary, unhurried, and shaped around the specific quality of quiet hours.",
    pages: [
      { label: "Bedtime audio stories", href: "/bedtime-audio-stories", tagline: "Something to listen to as the world gets quiet" },
      { label: "Relaxing audio stories", href: "/relaxing-audio-stories", tagline: "Stories that help you slow down and feel held" },
      { label: "Sleep audio stories", href: "/sleep-audio-stories", tagline: "Audio stories that ease you gently toward sleep" },
    ],
  },
  {
    heading: "Romantic & Emotional",
    description: "Stories about connection — the kind that finds something true in you, rather than performing at you.",
    pages: [
      { label: "Romantic audio stories", href: "/romantic-audio-stories", tagline: "Romantic stories that feel written for tonight" },
      { label: "Love stories audio", href: "/love-stories-audio", tagline: "Love stories that actually sound like love" },
      { label: "Emotional audio stories", href: "/emotional-audio-stories", tagline: "The kind of story that finds something true in you" },
    ],
  },
  {
    heading: "Intimate & Mood",
    description: "Stories for the specific emotional frequency you're at tonight — close, aware, and honest about desire.",
    pages: [
      { label: "Intimate audio stories", href: "/intimate-audio-stories", tagline: "Private, personal, written for the space you're in" },
      { label: "Late night audio stories", href: "/late-night-audio-stories", tagline: "For when the world is quiet and you're still awake" },
      { label: "Slow burn audio stories", href: "/slow-burn-audio-stories", tagline: "The tension that builds before anything is said" },
      { label: "Confident energy stories", href: "/confident-energy-stories", tagline: "Stories that feel like being chosen — and knowing it" },
      { label: "Quiet intensity stories", href: "/quiet-intensity-stories", tagline: "The kind of feeling that doesn't need to be loud" },
    ],
  },
  {
    heading: "Genre & Audience",
    description: "Stories shaped by the specific genre textures and character dynamics you're drawn to.",
    pages: [
      { label: "Dark romance audio stories", href: "/dark-romance-audio-stories", tagline: "Morally complex desire — the shadow side of wanting" },
      { label: "Forbidden romance audio stories", href: "/forbidden-romance-audio-stories", tagline: "The pull that exists precisely because it shouldn't" },
      { label: "Enemies to lovers audio stories", href: "/enemies-to-lovers-audio-stories", tagline: "From friction to something else entirely" },
      { label: "Adult audio stories", href: "/adult-audio-stories", tagline: "Literary, private, created for adults" },
      { label: "Audio stories for women", href: "/audio-stories-for-women", tagline: "Written with you at the centre" },
    ],
  },
  {
    heading: "Compare & Explore",
    description: "Understanding what makes audio stories different — and why The Private Story is unlike anything else.",
    pages: [
      { label: "Audio stories vs audiobooks", href: "/audio-stories-vs-audiobooks", tagline: "What makes them fundamentally different" },
      { label: "Audio stories vs podcasts", href: "/audio-stories-vs-podcasts", tagline: "The distinction that matters for listeners" },
      { label: "Best audio story app for adults", href: "/best-audio-story-app-for-adults", tagline: "What to look for — and what sets us apart" },
      { label: "Alternatives to romance audiobooks", href: "/alternatives-to-romance-audiobooks", tagline: "What exists beyond the fixed catalogue" },
    ],
  },
];

export default function Discover() {
  useSEO({
    title: "Discover All Audio Story Types | The Private Story",
    description: "Explore every type of personalised audio story at The Private Story — romantic, intimate, slow burn, dark romance, bedtime, and more. Private, created for adults.",
  });

  useEffect(() => {
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "The Private Story", "item": "https://theprivatestory.com" },
        { "@type": "ListItem", "position": 2, "name": "Discover All Story Types", "item": "https://theprivatestory.com/discover" },
      ],
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "discover-breadcrumb-schema";
    script.textContent = JSON.stringify(breadcrumb);
    document.head.appendChild(script);
    return () => { document.getElementById("discover-breadcrumb-schema")?.remove(); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-3xl mx-auto px-4 py-16">

        <div className="mb-14">
          <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
            All Story Types
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Every Story Type — Find What You're Looking For Tonight
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed mb-8">
            Twenty-four ways into a story that was made for you. Private, narrated, created in under two minutes. Choose the category that fits tonight.
          </p>
          <MiniDoorCTA />
        </div>

        <div className="space-y-14">
          {CLUSTERS.map((cluster, ci) => (
            <section key={ci}>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2 leading-snug">
                {cluster.heading}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">{cluster.description}</p>
              <div className="space-y-3">
                {cluster.pages.map((page, pi) => (
                  <Link
                    key={pi}
                    href={page.href}
                    className="group flex items-start justify-between gap-4 rounded-xl border border-border/30 bg-white/[0.02] hover:border-primary/30 hover:bg-primary/[0.03] p-5 transition-all duration-200"
                  >
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                        {page.label}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{page.tagline}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 flex-shrink-0 mt-1 transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border/40 bg-white/[0.02] p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Ready to create yours?
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed max-w-md mx-auto">
            Every story type starts from the same place — a question about how you want to feel tonight. The story builds from your answer.
          </p>
          <MiniDoorCTA />
        </div>

      </div>
    </motion.div>
  );
}
