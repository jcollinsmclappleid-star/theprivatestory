import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Headphones, ChevronRight, Zap, Moon,
  EyeOff, WifiOff, Trash2, Lock, Shield, BookOpen, Star,
  ChevronLeft, Globe, Library,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { RowSlider } from "@/components/RowSlider";
import { SkeletonRow } from "@/components/SkeletonCard";
import { useStoriesFallback } from "@/hooks/use-api-fallbacks";
import { useAuth } from "@/hooks/useAuth";
import type { Story } from "@workspace/api-client-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Data hooks
// ---------------------------------------------------------------------------

function useRecommendations(isAuthenticated: boolean) {
  const [recs, setRecs] = useState<{
    for_you: Story[];
    because_you_liked: Story[];
    because_you_liked_mood: string | null;
    has_taste_profile: boolean;
  }>({ for_you: [], because_you_liked: [], because_you_liked_mood: null, has_taste_profile: false });
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/me/recommendations`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setRecs(data); })
      .catch(() => {});
  }, [isAuthenticated]);
  return recs;
}

function useQuickCreate(isAuthenticated: boolean) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/api/me/taste`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        const sum = (m: Record<string, number>) => Object.values(m).reduce((a, b) => a + b, 0);
        const signals = sum(data.tasteProfile ?? {}) + sum(data.preferredIntensity ?? {});
        setReady(signals >= 5);
      })
      .catch(() => {});
  }, [isAuthenticated]);
  return ready;
}

// ---------------------------------------------------------------------------
// CastingRoom — rich world-building showcase
// ---------------------------------------------------------------------------

const CITIES_LEFT = [
  "Paris", "Havana", "Tokyo", "Santorini", "New York", "Kyoto",
  "Cape Town", "Florence", "Istanbul", "Marrakech", "Venice", "Buenos Aires",
];
const CITIES_RIGHT = [
  "Bali", "Edinburgh", "Monaco", "Dubrovnik", "Bora Bora", "Nairobi",
  "Lisbon", "Vienna", "Rio de Janeiro", "Seoul", "Amalfi Coast", "St Tropez",
];
const ERAS = [
  "Contemporary", "Roaring Twenties", "Victorian London", "Belle Époque Paris",
  "Feudal Japan", "Wartime 1940s", "Renaissance Italy", "Swinging Sixties",
  "Georgian Scotland", "Ancient Mediterranean", "Neon Decade 1980s", "Regency England",
];

const STEP_CARDS = [
  {
    step: "01",
    category: "The Pairing",
    label: "Who's in your story",
    sub: "Six pairings. You choose the dynamic — and we write to it.",
    accent: "#e879a0",
    gradient: "from-[#1a0810] via-[#250f1a] to-[#100508]",
    options: ["Her & Him", "Her & Her", "Him & Him", "Her & Them", "He & Them", "Them & Them"],
    selected: "Her & Him",
    example: null,
    isSetting: false,
    isFinal: false,
    isIntensity: false,
  },
  {
    step: "02",
    category: "The Chemistry",
    label: "The energy between you",
    sub: "Nine chemistries. The tension, the power, the pull — choose how it feels.",
    accent: "#c9a227",
    gradient: "from-[#1a0d00] via-[#251500] to-[#100800]",
    options: ["Push & Pull", "Slow Surrender", "Power Play", "Forbidden Pull", "Worship", "Rivals", "Inevitable", "First & Last", "Equal Tension"],
    selected: "Forbidden Pull",
    example: "They shouldn't. They've been trying not to. They can't stop.",
    isSetting: false,
    isFinal: false,
    isIntensity: false,
  },
  {
    step: "03",
    category: "The Archetype",
    label: "Cast him exactly as you want",
    sub: "14 archetypes. Name him, describe him, make him entirely yours.",
    accent: "#6b8cce",
    gradient: "from-[#040a1a] via-[#081228] to-[#020610]",
    options: ["The Executive", "The Stranger", "The Artist", "The Bad One", "The Professor", "The Wanderer", "The Detective", "The Old Friend"],
    selected: "The Executive",
    example: "Measured control. Understated power. He never raises his voice — and never needs to.",
    isSetting: false,
    isFinal: false,
    isIntensity: false,
  },
  {
    step: "04",
    category: "The Setting",
    label: "Set it anywhere in the world",
    sub: "50+ countries, 12 historical eras, or an After Dark world entirely your own.",
    accent: "#34d399",
    gradient: "from-[#001008] via-[#001a12] to-[#000a06]",
    options: null,
    selected: "Victorian London",
    example: "1880s — fog, corsets, and everything that cannot be said aloud. Only felt.",
    isSetting: true,
    isFinal: false,
    isIntensity: false,
    settingCategories: {
      contemporary: ["Luxury Hotel", "Private Yacht", "Rooftop Bar", "Mountain Retreat", "European Villa", "Private Estate"],
      historical: ["Victorian London", "Roaring Twenties", "Belle Époque Paris", "Regency England", "Feudal Japan", "Wartime 1940s"],
      afterDark: ["Private Club", "Rooftop, 3am", "Locked Room", "The Glass House", "VIP Suite", "Penthouse Pool"],
    },
  },
  {
    step: "05",
    category: "The Intensity",
    label: "You set the temperature",
    sub: "From slow burn to scorching. We write exactly to the level you choose.",
    accent: "#f97316",
    gradient: "from-[#1a0800] via-[#250f00] to-[#100500]",
    options: ["Tender", "Heated", "Explicit", "Scorching"],
    optionSubs: ["Emotional, slow burn", "Desire building, charged", "Fully rendered", "No limits"],
    selected: "Heated",
    example: null,
    isSetting: false,
    isFinal: false,
    isIntensity: true,
  },
  {
    step: "06",
    category: "The Mood",
    label: "The emotional register",
    sub: "28 moods to tune exactly how you want to feel inside the story.",
    accent: "#a78bfa",
    gradient: "from-[#0a0018] via-[#100025] to-[#060010]",
    options: ["Forbidden", "Urgent", "Dark", "Desperate", "Decadent", "Wicked", "Breathless", "Possessive", "Burning", "Reckless"],
    selected: "Forbidden",
    example: null,
    isSetting: false,
    isFinal: false,
    isIntensity: false,
  },
  {
    step: "07",
    category: "Your Story",
    label: "Written. Narrated. Yours alone.",
    sub: "Your story written, a voice selected, cover art created — private from the very first word.",
    accent: "#c9a227",
    gradient: "from-[#100c00] via-[#1a1500] to-[#0a0800]",
    options: null,
    selected: null,
    example: null,
    isSetting: false,
    isFinal: true,
    isIntensity: false,
  },
] as const;

type StepCard = typeof STEP_CARDS[number];

function WorldIntroCard() {
  const allCities = [...CITIES_LEFT, ...CITIES_RIGHT];
  const allCitiesDup = [...allCities, ...allCities];
  const allEras = [...ERAS, ...ERAS];

  return (
    <div className="flex-shrink-0 w-80 snap-start">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 flex flex-col h-full" style={{ background: "linear-gradient(135deg, #04100a 0%, #060a14 50%, #0a0614 100%)" }}>
        <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(ellipse at 30% 20%, #34d39922 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, #6b8cce18 0%, transparent 50%)" }} />

        <div className="relative z-10 p-5 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-3.5 h-3.5 text-[#34d399]/70" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#34d399]/70">Your World</span>
          </div>
          <p className="text-base font-bold text-white/90 mb-1 leading-snug">Place your story anywhere on earth.</p>
          <p className="text-xs text-white/40 leading-relaxed mb-4">50+ countries · 12 historical eras · or a world entirely your own</p>

          <div className="overflow-hidden mb-2 -mx-1">
            <div
              className="flex gap-2"
              style={{ animation: "ticker-left 22s linear infinite", width: "max-content" }}
            >
              {allCitiesDup.map((city, i) => (
                <span
                  key={`city-${i}`}
                  className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border"
                  style={{ borderColor: "#34d39928", color: "#34d39999", background: "#34d3990a" }}
                >
                  {city}
                </span>
              ))}
            </div>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">Or step into another era entirely</p>
          <div className="overflow-hidden -mx-1">
            <div
              className="flex gap-2"
              style={{ animation: "ticker-left 35s linear infinite", width: "max-content" }}
            >
              {allEras.map((era, i) => (
                <span
                  key={`era-${i}`}
                  className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border"
                  style={{ borderColor: "#6b8cce28", color: "#6b8cce99", background: "#6b8cce0a" }}
                >
                  {era}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-4 mb-4 mt-3 rounded-xl border p-3" style={{ borderColor: "#34d39920", background: "#34d3990a" }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "#34d39966" }}>The scene you chose</p>
          <p className="text-xs text-white/60 leading-relaxed italic">"The Amalfi Coast, August. Heat, a private terrace, and nothing to do until morning."</p>
        </div>

        <div className="relative z-10 flex justify-center py-3 mt-auto border-t" style={{ borderColor: "#34d39915" }}>
          <ChevronRight className="w-4 h-4 rotate-90" style={{ color: "#34d39950" }} />
        </div>
      </div>
    </div>
  );
}

function SettingCard({ s }: { s: StepCard & { isSetting: true } }) {
  const cats = s.settingCategories;
  return (
    <div className={`relative overflow-hidden rounded-2xl border flex flex-col border-white/10`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
      <div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(ellipse at 70% 25%, ${s.accent}28 0%, transparent 60%)` }} />

      <div className="relative z-10 p-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[9px] font-bold tracking-[0.25em] uppercase px-2 py-0.5 rounded-full border"
            style={{ color: s.accent, borderColor: `${s.accent}30`, background: `${s.accent}0d` }}
          >
            {s.category}
          </span>
          <span className="text-[9px] text-white/20 tracking-widest">{s.step}</span>
        </div>
        <p className="text-base font-bold text-white/90 mb-1 leading-snug">{s.label}</p>
        <p className="text-xs text-white/45 leading-relaxed">{s.sub}</p>
      </div>

      <div className="relative z-10 px-5 pb-3 space-y-3">
        {[
          { label: "Contemporary", items: cats.contemporary, color: "#34d399" },
          { label: "Historical", items: cats.historical, color: "#fcd34d" },
          { label: "After Dark", items: cats.afterDark, color: "#fb7185" },
        ].map(({ label, items, color }) => (
          <div key={label}>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: `${color}70` }}>{label}</p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((item) => {
                const isSel = item === s.selected;
                return (
                  <span
                    key={item}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                    style={isSel
                      ? { borderColor: color, color: "#0a0a0a", background: color, fontWeight: 700 }
                      : { borderColor: `${color}25`, color: `${color}85`, background: `${color}0a` }
                    }
                  >
                    {item}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {s.example && (
        <div className="relative z-10 mx-4 mb-3 mt-1 rounded-xl border p-3" style={{ borderColor: `${s.accent}22`, background: `${s.accent}0a` }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: `${s.accent}70` }}>Selected · Victorian London</p>
          <p className="text-xs italic leading-relaxed" style={{ color: `${s.accent}cc` }}>{s.example}</p>
        </div>
      )}

      <div className="relative z-10 flex justify-center py-3 mt-auto border-t" style={{ borderColor: `${s.accent}15` }}>
        <ChevronRight className="w-4 h-4 rotate-90" style={{ color: `${s.accent}50` }} />
      </div>
    </div>
  );
}

function IntensityCard({ s }: { s: StepCard & { isIntensity: true } }) {
  const subs = (s as { optionSubs?: string[] }).optionSubs ?? [];
  return (
    <div className={`relative overflow-hidden rounded-2xl border flex flex-col border-white/10`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
      <div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(ellipse at 70% 25%, ${s.accent}28 0%, transparent 60%)` }} />

      <div className="relative z-10 p-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[9px] font-bold tracking-[0.25em] uppercase px-2 py-0.5 rounded-full border"
            style={{ color: s.accent, borderColor: `${s.accent}30`, background: `${s.accent}0d` }}
          >
            {s.category}
          </span>
          <span className="text-[9px] text-white/20 tracking-widest">{s.step}</span>
        </div>
        <p className="text-base font-bold text-white/90 mb-1 leading-snug">{s.label}</p>
        <p className="text-xs text-white/45 leading-relaxed mb-4">{s.sub}</p>

        <div className="space-y-2">
          {(s.options as readonly string[]).map((opt, idx) => {
            const isSel = opt === s.selected;
            return (
              <div
                key={opt}
                className="flex items-center gap-3 px-3 py-2 rounded-xl border"
                style={isSel
                  ? { borderColor: s.accent, background: `${s.accent}18` }
                  : { borderColor: `${s.accent}18`, background: `${s.accent}06` }
                }
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isSel ? s.accent : `${s.accent}30` }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: isSel ? s.accent : `${s.accent}80` }}>{opt}</p>
                  <p className="text-[10px]" style={{ color: `${s.accent}50` }}>{subs[idx]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 flex justify-center py-3 mt-auto border-t" style={{ borderColor: `${s.accent}15` }}>
        <ChevronRight className="w-4 h-4 rotate-90" style={{ color: `${s.accent}50` }} />
      </div>
    </div>
  );
}

function FinalOutputCard({ s }: { s: StepCard }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/40 flex flex-col">
      <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20" />
      <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(ellipse at 70% 25%, #c9a22728 0%, transparent 60%)" }} />

      <div className="relative z-10 p-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[9px] font-bold tracking-[0.25em] uppercase px-2 py-0.5 rounded-full border"
            style={{ color: "#c9a227", borderColor: "#c9a22730", background: "#c9a2270d" }}
          >
            {s.category}
          </span>
          <span className="text-[9px] text-white/20 tracking-widest">✦ Your result</span>
        </div>
        <p className="text-base font-bold text-white/90 mb-1 leading-snug">{s.label}</p>
        <p className="text-xs text-white/45 leading-relaxed">{s.sub}</p>
      </div>

      {/* Mock story output card */}
      <div className="relative z-10 mx-4 mb-3 rounded-2xl overflow-hidden border border-white/10">
        <div className="h-28 relative" style={{ background: "linear-gradient(135deg, #1a0810 0%, #0a0514 50%, #060a18 100%)" }}>
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 40% 30%, #c9a22720 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, #6b8cce18 0%, transparent 50%)" }} />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border border-[#e879a0]/40 bg-[#e879a0]/10 text-[#e879a0]">Forbidden</span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-medium border border-white/10 bg-white/5 text-white/40">Victorian London</span>
          </div>
        </div>
        <div className="bg-[#0c0a08] px-3 py-2.5">
          <p className="text-sm font-bold text-white/90 mb-0.5">The Fog Between Us</p>
          <p className="text-[10px] text-white/40 italic leading-relaxed">"He shouldn't be in her study. She should have locked the door."</p>
        </div>
      </div>

      <div className="relative z-10 mx-4 mb-4 space-y-1.5">
        {[
          "Narrated — ready to listen immediately",
          "Original cover art generated for this story",
          "Saved privately — visible only to you",
          "No record shared with anyone, ever",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full border border-primary/60 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
            <span className="text-xs text-white/60">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StandardCard({ s }: { s: StepCard }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border flex flex-col border-white/10`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
      <div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(ellipse at 70% 25%, ${s.accent}28 0%, transparent 60%)` }} />

      <div className="relative z-10 p-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[9px] font-bold tracking-[0.25em] uppercase px-2 py-0.5 rounded-full border"
            style={{ color: s.accent, borderColor: `${s.accent}30`, background: `${s.accent}0d` }}
          >
            {s.category}
          </span>
          <span className="text-[9px] text-white/20 tracking-widest">{s.step}</span>
        </div>
        <p className="text-base font-bold text-white/90 mb-1 leading-snug">{s.label}</p>
        <p className="text-xs text-white/45 leading-relaxed">{s.sub}</p>
      </div>

      <div className="relative z-10 px-5 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {(s.options as readonly string[]).map((chip) => {
            const isSel = chip === s.selected;
            return (
              <span
                key={chip}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all"
                style={isSel
                  ? { borderColor: s.accent, color: "#0a0a0a", background: s.accent, fontWeight: 700 }
                  : { borderColor: `${s.accent}28`, color: `${s.accent}99`, background: `${s.accent}0a` }
                }
              >
                {chip}
              </span>
            );
          })}
        </div>
      </div>

      {s.example && s.selected && (
        <div className="relative z-10 mx-4 mb-3 mt-2 rounded-xl border p-3" style={{ borderColor: `${s.accent}25`, background: `${s.accent}0d` }}>
          <p className="text-[9px] font-semibold uppercase tracking-widest mb-1.5 opacity-60" style={{ color: s.accent }}>{s.selected}</p>
          <p className="text-xs italic leading-relaxed" style={{ color: `${s.accent}cc` }}>{s.example}</p>
        </div>
      )}

      {!s.example && s.selected && (
        <div className="relative z-10 mx-4 mb-3 mt-2 rounded-xl border p-3" style={{ borderColor: `${s.accent}25`, background: `${s.accent}0d` }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.accent }} />
            <p className="text-sm font-semibold" style={{ color: s.accent }}>{s.selected}</p>
          </div>
        </div>
      )}

      <div className="relative z-10 flex justify-center py-3 mt-auto border-t" style={{ borderColor: `${s.accent}15` }}>
        <ChevronRight className="w-4 h-4 rotate-90" style={{ color: `${s.accent}50` }} />
      </div>
    </div>
  );
}

function CastingPreview() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
      <style>{`
        @keyframes ticker-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4">
            The Casting Room
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Every detail is yours to write.
          </h2>
          <p className="text-muted-foreground mt-2 text-base max-w-xl leading-relaxed">
            Cast who he is, set the chemistry between you, choose your world and exactly how far it goes. This is your story — built choice by choice, before a word is written.
          </p>
          <div className="flex items-center gap-3 mt-3">
            {[
              { n: "50+", label: "Countries" },
              { n: "12", label: "Historical eras" },
              { n: "14", label: "Archetypes" },
              { n: "9", label: "Chemistries" },
              { n: "6,100+", label: "Names" },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <p className="text-sm font-bold text-primary">{n}</p>
                <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/35 mt-2.5">
            Your name not listed?{" "}
            <Link href="/name-club" className="text-primary/55 hover:text-primary transition-colors underline-offset-2 hover:underline">
              Submit it to the Name Club →
            </Link>
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 transition-all disabled:opacity-20"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            className="w-9 h-9 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 transition-all disabled:opacity-20"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScroll}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
      >
        {/* World intro card — shown first */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.5 }}
          className="flex-shrink-0 w-80 snap-start"
        >
          <WorldIntroCard />
        </motion.div>

        {STEP_CARDS.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 1) * 0.06, duration: 0.5 }}
            className="flex-shrink-0 w-80 snap-start"
          >
            {s.isFinal ? (
              <FinalOutputCard s={s} />
            ) : s.isSetting ? (
              <SettingCard s={s as StepCard & { isSetting: true }} />
            ) : s.isIntensity ? (
              <IntensityCard s={s as StepCard & { isIntensity: true }} />
            ) : (
              <StandardCard s={s} />
            )}
          </motion.div>
        ))}

        {/* CTA card */}
        <div className="flex-shrink-0 w-72 snap-start flex items-center justify-center px-4">
          <Link href="/create" className="flex flex-col items-center gap-4 text-center group w-full">
            <div className="w-16 h-16 rounded-full bg-primary/12 border border-primary/25 flex items-center justify-center group-hover:bg-primary/22 group-hover:scale-105 transition-all group-hover:shadow-[0_0_32px_rgba(201,162,39,0.2)]">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                Begin your story
              </p>
              <p className="text-xs text-muted-foreground/45 mt-1.5 leading-relaxed max-w-[180px] mx-auto">
                Written for you. Narrated. Private from the first word.
              </p>
            </div>
            <span className="text-xs text-primary/50 group-hover:text-primary/80 transition-colors tracking-widest uppercase">
              Create My Story →
            </span>
          </Link>
        </div>
      </div>

      {/* Scroll hint — mobile */}
      <p className="md:hidden text-center text-xs text-muted-foreground/30 mt-2 tracking-widest">Swipe to explore →</p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Library Promo — replaces Continue Listening
// ---------------------------------------------------------------------------

function LibraryPromo({ stories }: { stories: Story[] }) {
  if (stories.length === 0) return null;
  const preview = stories.slice(0, 6);

  return (
    <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
      <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-card/20">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex items-start justify-between gap-6 mb-6 flex-col sm:flex-row">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Library className="w-4 h-4 text-primary/60" />
                <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest">
                  The Library
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#34d399]/40 bg-[#34d399]/10 text-[#34d399]">
                  New this week
                </span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                New stories, every week.
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-md">
                We write and release new stories weekly — every one available to full members the moment it drops. Browse what's waiting for you.
              </p>
            </div>
            <Link
              href="/browse"
              className="flex-shrink-0 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              Browse the library
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {preview.map((story) => (
              <Link key={story.id} href={`/story/${story.id}`} className="flex-shrink-0 group">
                <div className="w-36 rounded-xl overflow-hidden border border-border/20 bg-card/40 hover:border-primary/30 transition-all">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-2">
                    <p className="text-[10px] text-primary/70 font-medium tracking-widest uppercase mb-0.5">{story.mood}</p>
                    <p className="text-xs font-semibold text-foreground/80 line-clamp-2 leading-snug">{story.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <p className="text-xs text-muted-foreground/40 mt-4">
            Included with full access · New stories added every week ·{" "}
            <Link href="/browse" className="hover:text-primary transition-colors">Browse all →</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

export default function Home() {
  const { data: stories, isLoading } = useStoriesFallback();
  const { isAuthenticated } = useAuth();
  const recs = useRecommendations(isAuthenticated);
  const quickCreateReady = useQuickCreate(isAuthenticated);
  const [, navigate] = useLocation();
  const [quickCreateLoading, setQuickCreateLoading] = useState(false);

  const handleQuickCreate = useCallback(async () => {
    setQuickCreateLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/me/quick-create-params`, { credentials: "include" });
      if (!r.ok) return;
      const params = await r.json();
      if (params.eligible === false) return;
      sessionStorage.setItem("quickCreateParams", JSON.stringify(params));
      navigate("/create");
    } finally {
      setQuickCreateLoading(false);
    }
  }, [navigate]);

  const handleAfterDarkClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("after-dark-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const tonightPicks = (isAuthenticated && recs.for_you.length > 0)
    ? (recs.for_you as Story[])
    : (stories?.slice(1, 9) || []);
  const lateNight = stories?.filter(s => s.mood === "Late Night") || [];
  const slowBurn = stories?.filter(s => s.mood === "Slow Burn") || [];
  const libraryStories = stories?.slice(0, 12) || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative w-full h-[90vh] min-h-[760px] flex items-end pb-16">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-transparent" />
          <div className="absolute inset-0 bg-background/15" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
              Written for the parts of you nobody else gets to know
            </span>

            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-5 leading-tight drop-shadow-xl">
              A story built<br className="hidden md:block" /> exactly as you<br className="hidden md:block" />
              <span className="text-primary">want it.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
              You choose who he is, the chemistry between you, where it happens and how far it goes. We write it, narrate it, and keep it entirely private — heard only by you.
            </p>

            <div className="flex items-center gap-4 flex-wrap mb-4">
              <Link
                href="/create"
                className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-base hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-glow"
              >
                <Sparkles className="w-5 h-5" />
                Begin your story
              </Link>

              <a
                href="#after-dark-section"
                onClick={handleAfterDarkClick}
                className="flex items-center gap-2 px-6 py-4 rounded-full border border-[#4a4fff]/40 text-[#8b9dff] hover:text-[#aab4ff] hover:border-[#4a4fff]/70 hover:bg-[#4a4fff]/8 transition-all font-medium cursor-pointer"
              >
                <Moon className="w-4 h-4" />
                The Private Story After Dark
              </a>
            </div>

            {quickCreateReady && (
              <div className="mb-4">
                <button
                  onClick={handleQuickCreate}
                  disabled={quickCreateLoading}
                  className="flex items-center gap-1.5 text-xs text-primary/60 hover:text-primary transition-colors disabled:opacity-50"
                >
                  {quickCreateLoading ? (
                    <span className="w-3 h-3 rounded-full border border-primary/40 border-t-primary animate-spin" />
                  ) : (
                    <Zap className="w-3 h-3" />
                  )}
                  Write one for me based on my taste
                </button>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-sm">
                <Lock className="w-3 h-3 inline-block mr-1.5 text-primary/40 -mt-0.5" />
                Built so we can't share it — not even if asked. Your stories are yours alone.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground/40 tracking-wide">
                {["No feeds", "No history", "No trace", "Heard only by you"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary/30 inline-block" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="relative z-20 -mt-12 space-y-0">

        {/* ---------------------------------------------------------------- */}
        {/* Privacy Trust Strip                                               */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative py-10 px-4 md:px-8 max-w-7xl mx-auto w-full overflow-hidden">
          <div
            className="absolute inset-y-0 right-0 w-1/3 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage: `url(${import.meta.env.BASE_URL}images/home-visual-1.png)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              maskImage: "linear-gradient(to left, rgba(0,0,0,0.12) 0%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.12) 0%, transparent 100%)",
            }}
          />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10">
            {[
              { icon: <EyeOff className="w-4 h-4" />, text: "Visible only to you" },
              { icon: <WifiOff className="w-4 h-4" />, text: "No social features, no feeds" },
              { icon: <Lock className="w-4 h-4" />, text: "Built so we can't share it" },
              { icon: <Headphones className="w-4 h-4" />, text: "Designed for private listening" },
              { icon: <Trash2 className="w-4 h-4" />, text: "Delete everything, anytime" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex flex-col items-center text-center gap-2 px-3 py-4 rounded-2xl border border-border/20 bg-card/20 hover:border-primary/20 hover:bg-primary/5 transition-all"
              >
                <span className="text-primary/60">{item.icon}</span>
                <span className="text-xs text-muted-foreground/70 leading-snug">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* CastingRoom preview                                               */}
        {/* ---------------------------------------------------------------- */}
        <CastingPreview />

        {/* ---------------------------------------------------------------- */}
        {/* Create Your Story — for novelists & romantics                     */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-card/30 backdrop-blur-md p-10 md:p-16">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-background/60 pointer-events-none" />
            <div
              className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
              aria-hidden="true"
              style={{
                backgroundImage: `url(${import.meta.env.BASE_URL}images/home-visual-2.png)`,
                backgroundSize: "cover",
                backgroundPosition: "center left",
                maskImage: "linear-gradient(to left, rgba(0,0,0,0.09) 0%, transparent 75%)",
                WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.09) 0%, transparent 75%)",
              }}
            />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start">
              <div className="flex-1 max-w-xl">
                <div className="flex items-center gap-2 mb-5">
                  <BookOpen className="w-4 h-4 text-primary/70" />
                  <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest">
                    Create Your Story
                  </span>
                </div>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                  Every detail exactly<br className="hidden md:block" />
                  <span className="text-primary">as you want it.</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  Cast who he is. Name him. Set where it happens and exactly how far it goes. Choose the tension, the tone, the feeling you want to be left with. This story is built entirely around you.
                </p>
                <p className="text-muted-foreground/60 text-sm leading-relaxed mb-8">
                  Written for the moment you're in right now — then narrated and kept private, heard only by you. Yours from the very first word.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                  {[
                    { label: "Your mood", desc: "The emotional register. How you want to feel." },
                    { label: "Your world", desc: "The person, the setting, the chemistry." },
                    { label: "Your voice", desc: "Narrated in the tone that fits tonight." },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-background/40 border border-border/20 p-4">
                      <p className="font-semibold text-foreground text-sm mb-1">{item.label}</p>
                      <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  Begin your story
                </Link>
                <p className="text-xs text-muted-foreground/40 mt-3">60 seconds to begin. Private from the first moment.</p>
              </div>

              <div className="hidden md:flex flex-col gap-3 flex-shrink-0 w-56 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-1">
                  Stories waiting to be written
                </p>
                {[
                  "The one she never should have wanted",
                  "A reunion 10 years too long",
                  "Forbidden — and she knew it from the start",
                  "Slow burn. It finally broke.",
                  "The night she stopped pretending",
                  "He knew exactly what she wanted",
                ].map((label) => (
                  <div
                    key={label}
                    className="px-4 py-2.5 rounded-xl border border-primary/15 bg-primary/5 text-xs text-foreground/70 leading-snug hover:border-primary/30 hover:text-foreground transition-all cursor-default"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* After Dark — premium marketing block (anchor target)              */}
        {/* ---------------------------------------------------------------- */}
        <section
          id="after-dark-section"
          className="py-8 px-4 md:px-8 max-w-7xl mx-auto w-full scroll-mt-24"
        >
          <Link href="/after-dark" className="block group">
            <div className="relative overflow-hidden rounded-3xl border border-[#1a1a3e]/80 bg-[#060610]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#08081a] via-[#060610] to-[#0a0a1e] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/30 via-transparent to-violet-950/20 pointer-events-none" />
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-900/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-950/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-[#3b3bff]/5 rounded-full blur-3xl pointer-events-none" />
              <div
                className="absolute inset-y-0 right-0 w-2/5 pointer-events-none"
                aria-hidden="true"
                style={{
                  backgroundImage: `url(${import.meta.env.BASE_URL}images/home-visual-3.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  maskImage: "linear-gradient(to left, rgba(0,0,0,0.13) 0%, transparent 80%)",
                  WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.13) 0%, transparent 80%)",
                }}
              />

              <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-16">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <Moon className="w-4 h-4 text-[#7b8fff]" />
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#7b8fff]/70">
                      The Private Story · After Dark
                    </span>
                  </div>
                  <h2 className="font-display text-3xl md:text-5xl font-bold text-white/90 mb-5 leading-tight">
                    Where the story<br className="hidden md:block" />
                    <span className="text-[#7b8fff]"> has no bounds.</span>
                  </h2>
                  <p className="text-white/50 text-base leading-relaxed mb-3 max-w-md">
                    For those who want to write their ideal fantasy — without restraint, without compromise. Every detail yours. Every limit yours to set.
                  </p>
                  <p className="text-white/30 text-sm leading-relaxed mb-8 max-w-md">
                    The same Casting Room depth — the same 50+ countries, 12 eras, 14 archetypes, 9 chemistries — but the intensity dial goes further. A world with no bounds.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {[
                      "Power Exchange",
                      "The Forbidden",
                      "Your fantasy, exactly",
                      "No limits, no apology",
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-[#7b8fff]/20 bg-[#7b8fff]/8 text-[#7b8fff]/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-[#7b8fff] group-hover:text-[#9baeff] transition-colors">
                    <Star className="w-4 h-4 fill-current opacity-60" />
                    <span className="text-sm font-semibold tracking-wide">Enter After Dark</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="hidden md:flex flex-col gap-3 flex-shrink-0 w-56">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-1">
                    Scenarios waiting for you
                  </p>
                  {[
                    { label: "The one who takes control", opacity: "opacity-70" },
                    { label: "Everything forbidden", opacity: "opacity-50" },
                    { label: "Your fantasy, from the first line", opacity: "opacity-30" },
                    { label: "A world with no rules", opacity: "opacity-15" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`px-4 py-2.5 rounded-xl border border-white/6 bg-white/3 ${item.opacity}`}
                    >
                      <span className="text-xs text-white/70 leading-snug">{item.label}</span>
                    </div>
                  ))}
                  <div className="px-4 py-2.5 rounded-xl border border-white/4 bg-white/2 opacity-8">
                    <span className="text-xs text-white/50 blur-[3px] select-none">•••••••••••••••</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Library Promo                                                     */}
        {/* ---------------------------------------------------------------- */}
        <LibraryPromo stories={libraryStories} />

        {/* ---------------------------------------------------------------- */}
        {/* Story rows                                                        */}
        {/* ---------------------------------------------------------------- */}
        {isLoading ? (
          <>
            <SkeletonRow count={5} />
            <SkeletonRow count={5} />
          </>
        ) : (
          <>
            <RowSlider
              title={isAuthenticated && recs.has_taste_profile ? "For You" : "For tonight"}
              subtitle={isAuthenticated && recs.has_taste_profile ? "Picked from what you love" : "Stories that know what tonight calls for"}
              stories={tonightPicks}
            />
            {recs.has_taste_profile && recs.because_you_liked.length > 0 && (
              <RowSlider
                title={recs.because_you_liked_mood ? `Because you liked ${recs.because_you_liked_mood}` : "You May Also Like"}
                stories={recs.because_you_liked as Story[]}
              />
            )}
            <RowSlider
              title="After midnight"
              subtitle="When the evening has its own kind of quiet"
              stories={lateNight}
            />
          </>
        )}

        {!isLoading && (
          <RowSlider
            title="Slow burn"
            subtitle="Patience before the moment — languid, layered, intimate"
            stories={slowBurn}
          />
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Final CTA                                                          */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-card/60 to-background p-10 md:p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Your world. Your story. Kept entirely yours.</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              A story built for you.<br className="hidden md:block" />
              <span className="text-muted-foreground font-normal">Heard only by you.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8 leading-relaxed">
              Tell us your world, your moment, the feeling you're after. We write it, narrate it, and keep it private — from the very first word.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 hover:-translate-y-0.5 shadow-[0_0_48px_-12px_hsl(37_42%_68%_/_0.45)]"
            >
              <Sparkles className="w-5 h-5" />
              Begin your story
            </Link>
            <p className="text-xs text-muted-foreground/40 mt-4">
              60 seconds to begin. Private from the first moment.{" "}
              <Link href="/privacy" className="hover:text-primary transition-colors">How we protect it →</Link>
            </p>
          </div>
        </section>

      </div>
    </motion.div>
  );
}
