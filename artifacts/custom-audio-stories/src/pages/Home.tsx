import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Headphones, ChevronRight, Moon,
  EyeOff, WifiOff, Lock,
  ChevronLeft, Globe, Shuffle, Check, Loader2, Clock,
  Play, Pause,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useSEO } from "@/hooks/useSEO";
import { usePricing } from "@/hooks/usePricing";
import type { Story } from "@workspace/api-client-react";
import { ThreeDoors, MiniDoorCTA } from "@/components/ThreeDoors";
import { TrustBar } from "@/components/TrustBar";
import { EDITORS_PICKS, type EditorsPick } from "@/data/editorsPicks";
import { useAudioPlayer } from "@/store/use-audio-player";
import { SAMPLE_ID_PREFIX, isSampleId } from "@/data/sampleId";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Editor's Pick → global audio store adapter (mirror of Samples.tsx)
// ---------------------------------------------------------------------------

const sampleAudioUrl = (slug: string) =>
  `${API_BASE}/voice-samples/editors-picks/${slug}.mp3`;
const sampleCoverUrl = (slug: string) =>
  `${API_BASE}/voice-samples/editors-picks/covers/${slug}.png`;

function pickToStory(pick: EditorsPick): Story {
  return {
    id: `${SAMPLE_ID_PREFIX}${pick.slug}`,
    title: pick.title,
    description: pick.tagline,
    mood: pick.tags[0] ?? "sample",
    tags: pick.tags,
    duration: "2 min",
    coverImage: sampleCoverUrl(pick.slug),
    audioUrl: sampleAudioUrl(pick.slug),
    isPremium: false,
    isNew: false,
  };
}

/** The three picks featured in the home "Listening Room" — one per voice
 *  (Clara · Kayla · James) so visitors hear the breadth in 30 seconds.
 *  Maya is reserved for the After Dark teaser below to keep all four voices
 *  present on the home page without repeating any single narrator. */
const LISTENING_ROOM_SLUGS = ["01-last-one", "04-driver", "09-neighbour"] as const;

/** The single pick that fronts the After Dark teaser — Maya's power-play
 *  bodyguard piece sits in the deeper register the section is selling. */
const AFTER_DARK_SLUG = "07-bodyguard";

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
    sub: "Five pairings. You choose the dynamic — and we write to it.",
    accent: "#e879a0",
    gradient: "from-[#1a0810] via-[#250f1a] to-[#100508]",
    options: ["Her & Him", "Her & Her", "Him & Him", "Her & Them", "Him & Them"],
    selected: "Her & Him",
    example: null,
    isSetting: false,
    isFinal: false,
    isIntensity: false,
    isSituation: false,
  },
  {
    step: "02",
    category: "The Chemistry",
    label: "The energy between you",
    sub: "Nine chemistries. The tension, the power, the pull — choose how it feels.",
    accent: "#c9a227",
    gradient: "from-[#1a0d00] via-[#251500] to-[#100800]",
    options: ["Push & Pull", "Slow Surrender", "Charged Dynamic", "Forbidden Pull", "Pure Devotion", "Rivals", "Inevitable", "First & Last", "Equal Tension"],
    selected: "Forbidden Pull",
    example: "They shouldn't. They've been trying not to. They can't stop.",
    isSetting: false,
    isFinal: false,
    isIntensity: false,
    isSituation: false,
  },
  {
    step: "03",
    category: "The Archetype",
    label: "Cast him exactly as you want",
    sub: "14 archetypes. Name him, describe him, make him entirely yours.",
    accent: "#6b8cce",
    gradient: "from-[#040a1a] via-[#081228] to-[#020610]",
    options: ["The Executive", "The Stranger", "The Artist", "The Risk", "The Professor", "The Wanderer", "The Detective", "The Old Friend"],
    selected: "The Executive",
    example: "Measured control. Understated power. He never raises his voice — and never needs to.",
    isSetting: false,
    isFinal: false,
    isIntensity: false,
    isSituation: false,
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
    isSituation: false,
    settingCategories: {
      contemporary: ["Luxury Hotel", "Private Yacht", "Rooftop Bar", "Mountain Retreat", "European Villa", "Private Estate"],
      historical: ["Victorian London", "Roaring Twenties", "Belle Époque Paris", "Regency England", "Feudal Japan", "Wartime 1940s"],
      afterDark: ["Private Club", "Rooftop, 3am", "Private Terrace", "The Glass House", "VIP Suite", "Penthouse Pool"],
    },
  },
  {
    step: "05",
    category: "The Intensity",
    label: "You set the temperature",
    sub: "From tender and romantic to deeply intimate and unrestrained. You set exactly how far it goes.",
    accent: "#f97316",
    gradient: "from-[#1a0800] via-[#250f00] to-[#100500]",
    options: ["Tender", "Warm", "Elevated", "Deep"],
    optionSubs: ["Soft, emotional, slow burn", "More charged, desire building", "Richer, more immersive", "At its most intense"],
    selected: "Warm",
    example: null,
    isSetting: false,
    isFinal: false,
    isIntensity: true,
    isSituation: false,
  },
  {
    step: "06",
    category: "The Mood",
    label: "The emotional tone",
    sub: "Choose the emotional tone you want the story to carry.",
    accent: "#a78bfa",
    gradient: "from-[#0a0018] via-[#100025] to-[#060010]",
    options: ["Slow Burn", "Magnetic", "Quiet Intensity", "Late Night", "Lingering", "Charged", "Unspoken", "Emotional Tension"],
    selected: "Slow Burn",
    example: null,
    isSetting: false,
    isFinal: false,
    isIntensity: false,
    isSituation: false,
  },
  {
    step: "07",
    category: "The Situation",
    label: "The story behind the story",
    sub: "200+ starting points across 10 categories — or one chosen for you. The context that gives every story its own energy.",
    accent: "#e11d48",
    gradient: "from-[#1a0008] via-[#250010] to-[#100006]",
    options: null,
    selected: null,
    example: null,
    isSetting: false,
    isFinal: false,
    isIntensity: false,
    isSituation: true,
  },
  {
    step: "08",
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
    isSituation: false,
  },
] as const;

type StepCard = typeof STEP_CARDS[number];

function WorldIntroCard() {
  const allCities = [...CITIES_LEFT, ...CITIES_RIGHT];
  const allCitiesDup = [...allCities, ...allCities];
  const allEras = [...ERAS, ...ERAS];

  return (
    <div className="flex-shrink-0 w-80 snap-start">
      <div className="relative overflow-hidden rounded-2xl border flex flex-col h-full" style={{ background: "linear-gradient(135deg, #04100a 0%, #060a14 50%, #0a0614 100%)", borderColor: "#34d39935", boxShadow: "inset 0 0 50px #34d39914, 0 0 22px #34d39930, 0 4px 16px rgba(0,0,0,0.6)" }}>
        <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(ellipse at 30% 20%, #34d39922 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, #6b8cce18 0%, transparent 50%)" }} />

        <div className="relative z-10 p-5 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-3.5 h-3.5 text-[#34d399]/70" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#34d399]/70">Your World</span>
          </div>
          <p className="text-base font-bold text-white/90 mb-1 leading-snug">Place your story anywhere on earth.</p>
          <p className="text-xs text-white/80 leading-relaxed mb-4">50+ countries · 12 historical eras · or a world entirely your own</p>

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

          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80 mb-2">Or step into another era entirely</p>
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
          <p className="text-xs text-white/80 leading-relaxed italic">"The Amalfi Coast, August. Heat, a private terrace, and nothing to do until morning."</p>
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
    <div className={`relative overflow-hidden rounded-2xl border flex flex-col`} style={{ borderColor: `${s.accent}35`, boxShadow: `inset 0 0 50px ${s.accent}0e, 0 0 22px ${s.accent}30, 0 4px 16px rgba(0,0,0,0.6)` }}>
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
          <span className="text-[9px] text-white/80 tracking-widest">{s.step}</span>
        </div>
        <p className="text-base font-bold text-white/90 mb-1 leading-snug">{s.label}</p>
        <p className="text-xs text-white/80 leading-relaxed">{s.sub}</p>
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
    <div className={`relative overflow-hidden rounded-2xl border flex flex-col`} style={{ borderColor: `${s.accent}35`, boxShadow: `inset 0 0 50px ${s.accent}0e, 0 0 22px ${s.accent}30, 0 4px 16px rgba(0,0,0,0.6)` }}>
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
          <span className="text-[9px] text-white/80 tracking-widest">{s.step}</span>
        </div>
        <p className="text-base font-bold text-white/90 mb-1 leading-snug">{s.label}</p>
        <p className="text-xs text-white/80 leading-relaxed mb-4">{s.sub}</p>

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

const SITUATION_CATEGORIES = [
  "Unexpected Reunion",
  "First & Unknown",
  "Close Quarters",
  "Slow Burn & Patience",
  "Secrets & Unspoken",
  "Circumstance & Proximity",
  "Complicated Timing",
  "Emotional Distance",
];

const SITUATION_EXAMPLES = [
  "They were never meant to meet again. Then he walked back into the room.",
  "The night was supposed to be simple. It stopped feeling that way the moment he arrived.",
  "Nothing had been said yet, but the energy had already shifted.",
];

function SituationCard({ s }: { s: StepCard }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border flex flex-col" style={{ borderColor: `${s.accent}35`, boxShadow: `inset 0 0 50px ${s.accent}0e, 0 0 22px ${s.accent}30, 0 4px 16px rgba(0,0,0,0.6)` }}>
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
          <span className="text-[9px] text-white/80 tracking-widest">{s.step}</span>
        </div>
        <p className="text-base font-bold text-white/90 mb-1 leading-snug">{s.label}</p>
        <p className="text-xs text-white/80 leading-relaxed mb-3">{s.sub}</p>

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border mb-3"
          style={{ borderColor: `${s.accent}30`, background: `${s.accent}10` }}
        >
          <Shuffle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.accent }} />
          <span className="text-xs font-semibold" style={{ color: s.accent }}>Choose For Me</span>
          <span className="text-[10px] text-white/80 ml-auto">or pick yours →</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {SITUATION_CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
              style={{ borderColor: `${s.accent}25`, color: `${s.accent}80`, background: `${s.accent}0a` }}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-4 mb-4 rounded-xl border p-3" style={{ borderColor: `${s.accent}20`, background: `${s.accent}08` }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: `${s.accent}60` }}>Example situations</p>
        {SITUATION_EXAMPLES.map((ex) => (
          <p key={ex} className="text-xs italic leading-relaxed mb-1 last:mb-0" style={{ color: `${s.accent}b0` }}>
            "{ex}"
          </p>
        ))}
      </div>

      <div className="relative z-10 flex justify-center py-3 mt-auto border-t" style={{ borderColor: `${s.accent}15` }}>
        <ChevronRight className="w-4 h-4 rotate-90" style={{ color: `${s.accent}50` }} />
      </div>
    </div>
  );
}

function FinalOutputCard({ s }: { s: StepCard }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border flex flex-col" style={{ borderColor: "#c9a22740", boxShadow: "inset 0 0 50px #c9a2270e, 0 0 28px #c9a22732, 0 4px 16px rgba(0,0,0,0.6)" }}>
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
          <span className="text-[9px] text-white/80 tracking-widest">✦ Your result</span>
        </div>
        <p className="text-base font-bold text-white/90 mb-1 leading-snug">{s.label}</p>
        <p className="text-xs text-white/80 leading-relaxed">{s.sub}</p>
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
            <span className="px-2 py-0.5 rounded-full text-[9px] font-medium border border-white/10 bg-white/5 text-white/80">Victorian London</span>
          </div>
        </div>
        <div className="bg-[#0c0a08] px-3 py-2.5">
          <p className="text-sm font-bold text-white/90 mb-0.5">The Fog Between Us</p>
          <p className="text-[10px] text-white/80 italic leading-relaxed">"He shouldn't be in her study. She should have locked the door."</p>
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
            <span className="text-xs text-white/80">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StandardCard({ s }: { s: StepCard }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border flex flex-col`} style={{ borderColor: `${s.accent}35`, boxShadow: `inset 0 0 50px ${s.accent}0e, 0 0 22px ${s.accent}30, 0 4px 16px rgba(0,0,0,0.6)` }}>
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
          <span className="text-[9px] text-white/80 tracking-widest">{s.step}</span>
        </div>
        <p className="text-base font-bold text-white/90 mb-1 leading-snug">{s.label}</p>
        <p className="text-xs text-white/80 leading-relaxed">{s.sub}</p>
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
            The Creation Room
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
            The version of them<br className="hidden md:block" /> that's been in your head.
          </h2>
          <p className="text-muted-foreground mt-2 text-base max-w-xl leading-relaxed">
            Choose who they are, how they make you feel, the charge between you, and where it takes you. Every detail set before a word is written — so nothing has to be left to someone else's imagination.
          </p>
          <div className="flex items-center gap-3 mt-3">
            {[
              { n: "50+", label: "Countries" },
              { n: "12", label: "Historical eras" },
              { n: "14", label: "Archetypes" },
              { n: "9", label: "Chemistries" },
              { n: "200+", label: "Situations" },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <p className="text-sm font-bold text-primary">{n}</p>
                <p className="text-[9px] text-muted-foreground/80 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/80 mt-2.5">
            Your name not listed?{" "}
            <Link href="/me" className="text-primary/70 hover:text-primary transition-colors underline-offset-2 hover:underline">
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
        className="flex gap-4 overflow-x-auto py-4 scrollbar-hide snap-x snap-mandatory"
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
            ) : s.isSituation ? (
              <SituationCard s={s} />
            ) : (
              <StandardCard s={s} />
            )}
          </motion.div>
        ))}

        {/* CTA card */}
        <div className="flex-shrink-0 w-72 snap-start flex items-center justify-center px-4">
          <Link href="/the-three-doors" className="flex flex-col items-center gap-4 text-center group w-full">
            <div className="w-16 h-16 rounded-full bg-primary/12 border border-primary/25 flex items-center justify-center group-hover:bg-primary/22 group-hover:scale-105 transition-all group-hover:shadow-[0_0_32px_rgba(201,162,39,0.2)]">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                Begin your story
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1.5 leading-relaxed max-w-[180px] mx-auto">
                Written for you. Narrated. Private from the first word.
              </p>
            </div>
            <span className="text-xs text-primary/70 group-hover:text-primary/80 transition-colors tracking-widest uppercase">
              Create My Story →
            </span>
          </Link>
        </div>
      </div>

      {/* Scroll hint — mobile */}
      <p className="md:hidden text-center text-xs text-muted-foreground/80 mt-2 tracking-widest">Swipe to explore →</p>
    </section>
  );
}


// ---------------------------------------------------------------------------
// SamplePlayCard — used by The Listening Room (3 cards) and the After Dark
// teaser (1 card). Plays through the central useAudioPlayer store so the
// FloatingPlayer takes over once a card starts playing, exactly like /samples.
// ---------------------------------------------------------------------------

interface SamplePlayCardProps {
  pick: EditorsPick;
  /** "gold" for The Listening Room, "indigo" for the After Dark teaser. */
  tone: "gold" | "indigo";
  /** Highlight + scale this card (used for the centre Listening Room card). */
  featured?: boolean;
}

function SamplePlayCard({ pick, tone, featured = false }: SamplePlayCardProps) {
  const { currentStory, isPlaying, play, togglePlay } = useAudioPlayer();
  const isCurrent = useMemo(
    () =>
      !!currentStory &&
      isSampleId(currentStory.id) &&
      currentStory.id.slice(SAMPLE_ID_PREFIX.length) === pick.slug,
    [currentStory, pick.slug],
  );
  const cardPlaying = isCurrent && isPlaying;

  const onClick = useCallback(() => {
    if (isCurrent) togglePlay();
    else play(pickToStory(pick));
  }, [isCurrent, togglePlay, play, pick]);

  const accent =
    tone === "gold"
      ? {
          ring: featured
            ? "ring-1 ring-primary/50 shadow-[0_24px_60px_-20px_rgba(201,162,39,0.45)]"
            : "ring-1 ring-white/8",
          chip: "border-primary/30 bg-primary/8 text-primary/85",
          play:
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_24px_-6px_rgba(201,162,39,0.6)]",
        }
      : {
          ring: "ring-1 ring-[#7b8fff]/25 shadow-[0_24px_60px_-20px_rgba(60,70,200,0.5)]",
          chip: "border-[#7b8fff]/30 bg-[#7b8fff]/10 text-[#9baeff]",
          play:
            "bg-[#7b8fff]/90 text-[#0a0a1e] hover:bg-[#9baeff] shadow-[0_0_24px_-6px_rgba(123,143,255,0.55)]",
        };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={cardPlaying}
      aria-label={cardPlaying ? `Pause ${pick.title}` : `Play ${pick.title}`}
      className={[
        "group relative w-full text-left rounded-3xl overflow-hidden bg-[#0f0d0a] transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        accent.ring,
        featured ? "md:scale-[1.03]" : "",
      ].join(" ")}
    >
      {/* Cover */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={sampleCoverUrl(pick.slug)}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0a] via-[#0f0d0a]/55 to-transparent" />

        {/* Voice badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${accent.chip}`}>
            {pick.voiceName} · {pick.voiceMeta.split("·")[0]?.trim()}
          </span>
        </div>

        {/* Pairing chip (top-right) */}
        <div className="absolute top-4 right-4 z-10">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider bg-black/45 border border-white/10 text-white/75">
            {pick.pairing}
          </span>
        </div>

        {/* Title block over fade */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-6">
          <p className="font-display italic text-xl md:text-[1.55rem] leading-tight text-white/95 mb-1.5 drop-shadow">
            {pick.title}
          </p>
          <p className="text-[12px] text-white/70 leading-snug">
            {pick.tagline}
          </p>
        </div>
      </div>

      {/* Footer — play control + ends-on */}
      <div className="flex items-center gap-3 p-4 md:p-5 border-t border-white/5">
        <span
          className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all ${accent.play}`}
          aria-hidden="true"
        >
          {cardPlaying
            ? <Pause className="w-4 h-4" fill="currentColor" />
            : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
        </span>
        <span className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-0.5">
            Ends on
          </span>
          <span className="text-[12px] italic text-white/75 leading-snug truncate">
            {pick.endsOn}
          </span>
        </span>
        <span className="flex-shrink-0 text-[10px] text-white/35 tabular-nums">
          ~{Math.round(pick.runtimeSec / 60)} min
        </span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { isPaid } = useSubscription();
  const { monthly, annual } = usePricing();

  useSEO({
    title: "The Private Story — Personalised Audio Stories",
    description: "Personalised romantic and intimate audio stories, created around your choices and private to you alone. You choose the cast, the chemistry, the world. We write it, narrate it, and keep it entirely yours.",
  });

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const startCheckout = useCallback(async (plan: "monthly" | "annual") => {
    setCheckoutLoading(plan);
    setCheckoutError(null);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ...(isAuthenticated ? { credentials: "include" } : {}),
        body: JSON.stringify({ plan, returnPath: window.location.pathname }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error ?? "Could not start checkout. Please try again.");
      }
    } catch {
      setCheckoutError("Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  }, [isAuthenticated]);


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative z-30 w-full pt-3 pb-10 md:pt-4 md:pb-14 px-6 sm:px-8 flex flex-col items-start sm:items-center justify-center overflow-hidden">
        {/* ── Atmospheric glow ── */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at 50% -5%, rgba(201,162,39,0.13) 0%, rgba(123,143,255,0.06) 48%, transparent 72%)",
          }} />
        </div>

        {/* ── Woman portrait (WebP w/ PNG fallback, eager + high priority — above the fold) ── */}
        <picture>
          <source
            type="image/webp"
            srcSet={`${import.meta.env.BASE_URL}images/home-hero-woman.webp?v=8`}
          />
          <img
            aria-hidden="true"
            src={`${import.meta.env.BASE_URL}images/home-hero-woman.png?v=8`}
            alt=""
            width={1200}
            height={1600}
            loading="eager"
            // @ts-expect-error -- fetchpriority is valid HTML, not yet in React types
            fetchpriority="high"
            decoding="async"
            className="block absolute right-0 top-0 h-full w-full sm:w-[48%] object-cover object-top pointer-events-none select-none opacity-[0.38] sm:opacity-[0.82]"
            style={{
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 18%, black 42%)",
              maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 18%, black 42%)",
            }}
          />
        </picture>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.75 }}
          className="relative flex flex-col items-start sm:items-center gap-10 max-w-2xl"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
            <span className="text-[11px] font-bold text-white/85 uppercase tracking-widest">Personalised adult immersion · Narrated audio</span>
          </div>

          <h1 className="text-[2.4rem] sm:text-5xl md:text-6xl font-display font-bold text-foreground leading-[1.1] drop-shadow-xl sm:text-center">
            Private Adult Stories that go further —{" "}
            <span className="text-primary">personalised around your choices.</span>
          </h1>

          <p className="text-sm md:text-base text-white/40 tracking-[0.2em] sm:text-center uppercase font-light">
            Private &nbsp;·&nbsp; Intense &nbsp;·&nbsp; Entirely yours
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <Link href="/the-three-doors">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-105 hover:brightness-110 active:scale-100" style={{ background: "#c9a227", color: "#0a0806" }}>
                <Sparkles className="w-4 h-4" />
                Create my story
              </button>
            </Link>
            <Link
              href="/samples"
              className="flex items-center gap-1.5 text-xs text-primary/55 hover:text-primary transition-colors tracking-widest uppercase"
            >
              <Headphones className="w-3 h-3" />
              Hear a sample first →
            </Link>
          </div>
        </motion.div>
      </section>

      <div className="relative z-20 space-y-0 mt-2 md:mt-4">

        {/* ---------------------------------------------------------------- */}
        {/* Three Doors                                                       */}
        {/* ---------------------------------------------------------------- */}
        <ThreeDoors />

        <p className="text-center text-[10px] text-white/25 tracking-widest pt-3 pb-1 px-4">
          2.6M+ unique story combinations possible
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* Story reassurance strip                                           */}
        {/* ---------------------------------------------------------------- */}
        <section className="flex flex-wrap items-center justify-center gap-3 px-4 py-4">
          {[
            { icon: <Sparkles className="w-3 h-3" />, label: "Cast entirely around your choices" },
            { icon: <Headphones className="w-3 h-3" />, label: "Premium voice narration" },
            { icon: <Clock className="w-3 h-3" />, label: "Immersive audio — typically ~10 min" },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/12 bg-white/4 text-[11px] text-white/85 font-medium"
            >
              <span className="text-primary/80">{icon}</span>
              {label}
            </span>
          ))}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Trust bar                                                         */}
        {/* ---------------------------------------------------------------- */}
        <TrustBar />

        {/* ---------------------------------------------------------------- */}
        {/* Emotion-led hook                                                  */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-20 px-4 md:px-8 max-w-2xl mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-5">
              <p className="text-2xl md:text-3xl font-display font-medium text-white/88 leading-snug">
                Have you ever wanted a story written entirely around you?
              </p>
              <p className="text-base md:text-lg text-white/80 leading-relaxed">
                Your world. Your rules. The energy you want, the tension that builds exactly as you like it — and a character who feels written for you, because he was.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Not browsed. Not compromised. Yours from the first line.",
                "Choose the feeling. Choose how far it goes.",
                "The female imagination at its centre. Narrated for you. Saved privately for you.",
              ].map((line) => (
                <p
                  key={line}
                  className="text-sm text-white/80 tracking-wide italic"
                >
                  {line}
                </p>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-x-5 gap-y-2">
              {[
                { icon: <EyeOff className="w-3 h-3" />, label: "Visible only to you" },
                { icon: <WifiOff className="w-3 h-3" />, label: "No sharing" },
                { icon: <Lock className="w-3 h-3" />, label: "No profile" },
                { icon: <Headphones className="w-3 h-3" />, label: "Saved privately" },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-[11px] text-white/80">
                  <span className="text-primary/70">{icon}</span>
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* CastingRoom preview                                               */}
        {/* ---------------------------------------------------------------- */}
        <CastingPreview />

        {/* ---------------------------------------------------------------- */}
        {/* The Listening Room — three Editor's Picks, one per voice          */}
        {/* (Clara · Kayla · James). Plays through the central audio store    */}
        {/* so the FloatingPlayer takes over once a card is started.          */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary/70 mb-3">
              The Listening Room
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
              Three of our writers.<br className="hidden md:block" />
              <span className="text-primary">Three voices. Three stops on a held breath.</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Short, narrated openings from our Editor's Picks. Each one stops where you'd want it to keep going.
              <span className="block mt-1 text-sm text-white/50">Yours, when you create one, can go further.</span>
            </p>
          </div>

          {/* Three-card trio — centre card weighted on md+, vertical stack on mobile.
              Order chosen so Kayla (the centre, scaled) sits between Clara & James. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch max-w-6xl mx-auto">
            {LISTENING_ROOM_SLUGS.map((slug, i) => {
              const pick = EDITORS_PICKS.find((p) => p.slug === slug);
              if (!pick) return null;
              return (
                <SamplePlayCard
                  key={slug}
                  pick={pick}
                  tone="gold"
                  featured={i === 1}
                />
              );
            })}
          </div>

          {/* Two CTAs below the trio */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/samples"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm px-7 py-3.5 rounded-full hover:bg-primary/90 transition-all shadow-[0_0_32px_-6px_rgba(201,162,39,0.5)]"
            >
              Hear all 10 Editor's Picks
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/the-three-doors"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white/85 border border-white/15 hover:border-primary/40 hover:text-white transition-all"
            >
              Or skip ahead — create yours from{" "}
              <span className="tabular-nums">{monthly.display}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-center text-[11px] text-white/40 mt-4">
            Each piece fades before the heat. The story you create is yours alone — and goes as far as you choose. 18+.
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* After Dark — atmospheric teaser. "A door at the end of the hall"  */}
        {/* sits past The Listening Room: same craft, deeper register. Single */}
        {/* Maya teaser card + single CTA, indigo palette, original artwork.  */}
        {/* ---------------------------------------------------------------- */}
        <section
          id="after-dark-section"
          className="py-10 px-4 md:px-8 max-w-7xl mx-auto w-full scroll-mt-24"
        >
          <div className="relative overflow-hidden rounded-3xl border border-[#1a1a3e]/80 bg-[#060610]">
            {/* Atmospheric layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#08081a] via-[#060610] to-[#0a0a1e] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-950/15 rounded-full blur-3xl pointer-events-none" />
            {/* Original After Dark artwork — kept */}
            <div
              className="absolute inset-y-0 right-0 w-2/5 pointer-events-none"
              aria-hidden="true"
              style={{
                backgroundImage: `url(${import.meta.env.BASE_URL}images/home-visual-3.webp)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                maskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 85%)",
                WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 85%)",
              }}
            />
            {/* Subtle vertical "door" of light on the right edge */}
            <div
              className="absolute top-8 bottom-8 right-[18%] w-px bg-gradient-to-b from-transparent via-[#7b8fff]/50 to-transparent pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 p-8 md:p-14 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-center">
              {/* Left — copy + CTA */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#7b8fff]/65 mb-5">
                  After Dark
                </p>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-white/92 leading-[1.1] mb-5">
                  There's a door<br className="hidden md:block" />
                  <span className="text-[#9baeff]">at the end of the hall.</span>
                </h2>
                <p className="text-white/75 text-base leading-relaxed mb-3 max-w-md">
                  Past The Listening Room is After Dark — the same writers, the same four voices, the same
                  intimate craft. The intensity dial just goes further.
                </p>
                <p className="text-white/55 text-sm leading-relaxed mb-8 max-w-md">
                  Power, surrender, the things you'd only ask for in the dark. Written for you. Narrated for you.
                  Private to you.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/after-dark"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#7b8fff]/15 border border-[#7b8fff]/40 text-[#cdd6ff] text-sm font-semibold hover:bg-[#7b8fff]/25 hover:border-[#7b8fff]/70 hover:text-white transition-all shadow-[0_0_28px_-8px_rgba(123,143,255,0.6)]"
                  >
                    Open After Dark
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <span className="text-[11px] text-[#9baeff]/50">
                    Included with your subscription · 18+
                  </span>
                </div>
              </div>

              {/* Right — single Maya teaser card */}
              <div className="max-w-sm w-full mx-auto lg:mx-0 lg:ml-auto">
                {(() => {
                  const pick = EDITORS_PICKS.find((p) => p.slug === AFTER_DARK_SLUG);
                  if (!pick) return null;
                  return (
                    <div className="relative">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9baeff]/55 mb-3 text-center lg:text-left">
                        A taste of the deeper register
                      </p>
                      <SamplePlayCard pick={pick} tone="indigo" />
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </section>


        {/* ---------------------------------------------------------------- */}
        {/* Pricing teaser                                                    */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="rounded-3xl border border-border/25 bg-card/20 p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center mb-8">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Private access</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  A story written entirely for you.<br className="hidden md:block" />
                  <span className="text-muted-foreground font-normal"> Whenever the moment calls for it.</span>
                </h2>
              </div>
              <Link
                href="/pricing"
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/10 transition-all whitespace-nowrap"
              >
                See all plan details
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className={`grid grid-cols-1 gap-4 mb-6 ${isPaid ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              {/* Monthly */}
              <div className="rounded-2xl border border-border/25 bg-background/30 p-6 flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-3">Monthly</p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="font-display text-3xl font-bold text-foreground tabular-nums">{monthly.display}</span>
                  <span className="text-muted-foreground/80 text-sm mb-0.5">/ month</span>
                </div>
                <p className="text-xs text-muted-foreground/80 mb-4">Billed monthly. Stories yours to keep.</p>
                <div className="space-y-2 mb-3">
                  {[
                    { text: "5 personalised stories / month", special: false },
                    { text: "Private library — visible only to you", special: false },
                    { text: "Premium voice narration", special: false },
                    { text: "After Dark — stories that explore further", special: true },
                  ].map((f) => (
                    <div key={f.text} className="flex items-start gap-2">
                      {f.special
                        ? <Moon className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                        : <Check className="w-3.5 h-3.5 text-primary/70 flex-shrink-0 mt-0.5" />
                      }
                      <span className={`text-xs leading-snug ${f.special ? "text-primary/80 font-medium" : "text-muted-foreground/80"}`}>{f.text}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => startCheckout("monthly")}
                  disabled={checkoutLoading === "monthly"}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-border/40 bg-background/40 text-sm font-semibold text-foreground/80 hover:border-primary/40 hover:text-primary transition-all disabled:opacity-50"
                >
                  {checkoutLoading === "monthly" ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</> : "Choose Monthly"}
                </button>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-px bg-border/20" />
                  <span className="text-[10px] text-primary/80 font-medium whitespace-nowrap px-1">Cancel any time — stories stay yours</span>
                  <div className="flex-1 h-px bg-border/20" />
                </div>
              </div>

              {/* Annual */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 relative overflow-hidden shadow-[0_0_40px_-12px_rgba(201,162,39,0.2)] flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Annual</p>
                  <span className="px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[9px] font-bold tracking-wider uppercase">Best value</span>
                </div>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="font-display text-3xl font-bold text-foreground tabular-nums">{annual.display}</span>
                  <span className="text-muted-foreground/80 text-sm mb-0.5">/ year</span>
                </div>
                <p className="text-xs text-muted-foreground/80 mb-4"><span className="tabular-nums">{annual.equivalentMonthlyDisplay}</span>/month — save <span className="tabular-nums">{annual.savingsVsMonthlyDisplay}</span> vs monthly.</p>
                <div className="space-y-2 mb-3">
                  {[
                    { text: "50 personalised stories / year", special: false },
                    { text: "Private library — visible only to you", special: false },
                    { text: "Premium voice narration", special: false },
                    { text: "After Dark — stories that explore further", special: true },
                  ].map((f) => (
                    <div key={f.text} className="flex items-start gap-2">
                      {f.special
                        ? <Moon className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                        : <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      }
                      <span className={`text-xs leading-snug ${f.special ? "text-primary/90 font-medium" : "text-foreground/80"}`}>{f.text}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => startCheckout("annual")}
                  disabled={checkoutLoading === "annual"}
                  className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_24px_-4px_rgba(201,162,39,0.4)] disabled:opacity-50"
                >
                  {checkoutLoading === "annual" ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</> : "Choose Annual"}
                </button>
              </div>

            </div>

            {checkoutError && (
              <div className="mb-4 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs text-center">
                {checkoutError}
              </div>
            )}
            <div className="text-center space-y-2">
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground/80">
                {["Private library included", "After Dark included", "Cast every character yourself", "Add more stories whenever you want"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary/30 inline-block" />
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/80">
                Every plan includes: private library · original cover art · premium voice narration ·{" "}
                <Link href="/pricing" className="text-primary/80 hover:text-primary transition-colors">full plan details →</Link>
              </p>
            </div>
          </div>
        </section>


        {/* ---------------------------------------------------------------- */}
        {/* SEO page links                                                    */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Core */}
            <div className="rounded-2xl border border-border/20 bg-card/20 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-3">Personalised</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Personalised audio stories", href: "/personalised-audio-stories" },
                  { label: "Private audio stories", href: "/private-audio-stories" },
                  { label: "Adult audio stories", href: "/adult-audio-stories" },
                  { label: "Audio stories for women", href: "/audio-stories-for-women" },
                  { label: "Create your own audio story", href: "/create-your-own-audio-story" },
                  { label: "AI audio story generator", href: "/ai-audio-story-generator" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground/80 hover:text-primary transition-colors leading-snug flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-primary/70 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bedtime */}
            <div className="rounded-2xl border border-border/20 bg-card/20 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-3">Relaxation</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Bedtime audio stories", href: "/bedtime-audio-stories" },
                  { label: "Relaxing audio stories", href: "/relaxing-audio-stories" },
                  { label: "Sleep audio stories", href: "/sleep-audio-stories" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground/80 hover:text-primary transition-colors leading-snug flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-primary/70 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Romantic */}
            <div className="rounded-2xl border border-border/20 bg-card/20 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-3">Romantic</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Romantic audio stories", href: "/romantic-audio-stories" },
                  { label: "Love stories audio", href: "/love-stories-audio" },
                  { label: "Emotional audio stories", href: "/emotional-audio-stories" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground/80 hover:text-primary transition-colors leading-snug flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-primary/70 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Intimate */}
            <div className="rounded-2xl border border-border/20 bg-card/20 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-3">Intimate & Genre</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Intimate audio stories", href: "/intimate-audio-stories" },
                  { label: "Late night audio stories", href: "/late-night-audio-stories" },
                  { label: "Slow burn audio stories", href: "/slow-burn-audio-stories" },
                  { label: "Confident energy stories", href: "/confident-energy-stories" },
                  { label: "Quiet intensity stories", href: "/quiet-intensity-stories" },
                  { label: "Dark romance audio stories", href: "/dark-romance-audio-stories" },
                  { label: "Forbidden romance stories", href: "/forbidden-romance-audio-stories" },
                  { label: "Enemies to lovers stories", href: "/enemies-to-lovers-audio-stories" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground/80 hover:text-primary transition-colors leading-snug flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-primary/70 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Final CTA — mini doors                                            */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full flex flex-col items-center gap-6">
          <MiniDoorCTA />
          <div className="flex items-center gap-5">
            <Link
              href="/pricing"
              className="text-xs text-primary/70 hover:text-primary transition-colors tracking-widest uppercase"
            >
              View pricing →
            </Link>
            <span className="text-white/15 text-xs">·</span>
            <Link
              href="/samples"
              className="text-xs text-white/40 hover:text-white/70 transition-colors tracking-widest uppercase"
            >
              Hear a sample →
            </Link>
          </div>
          <p className="text-[11px] text-muted-foreground/80">
            Under 3 minutes from first choice to listening. Private from the first word.{" "}
            <Link href="/privacy" className="hover:text-primary/60 transition-colors">How we protect it →</Link>
          </p>
        </section>

      </div>
    </motion.div>
  );
}
