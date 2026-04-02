import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Globe, Shuffle, Sparkles } from "lucide-react";
import { Link } from "wouter";

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

export const CASTING_STEP_CARDS = [
  {
    step: "01", category: "The Pairing", label: "Who's in your story",
    sub: "Five pairings. You choose the dynamic — and we write to it.",
    accent: "#e879a0", gradient: "from-[#1a0810] via-[#250f1a] to-[#100508]",
    options: ["Her & Him", "Her & Her", "Him & Him", "Her & Them", "Him & Them"],
    selected: "Her & Him", example: null, isSetting: false, isFinal: false, isIntensity: false, isSituation: false,
  },
  {
    step: "02", category: "The Chemistry", label: "The energy between you",
    sub: "Nine chemistries. The tension, the power, the pull — choose how it feels.",
    accent: "#c9a227", gradient: "from-[#1a0d00] via-[#251500] to-[#100800]",
    options: ["Push & Pull", "Slow Surrender", "Charged Dynamic", "Forbidden Pull", "Pure Devotion", "Rivals", "Inevitable", "First & Last", "Equal Tension"],
    selected: "Forbidden Pull", example: "They shouldn't. They've been trying not to. They can't stop.",
    isSetting: false, isFinal: false, isIntensity: false, isSituation: false,
  },
  {
    step: "03", category: "The Archetype", label: "Cast him exactly as you want",
    sub: "14 archetypes. Name him, describe him, make him entirely yours.",
    accent: "#6b8cce", gradient: "from-[#040a1a] via-[#081228] to-[#020610]",
    options: ["The Executive", "The Stranger", "The Artist", "The Risk", "The Professor", "The Wanderer", "The Detective", "The Old Friend"],
    selected: "The Executive", example: "Measured control. Understated power. He never raises his voice — and never needs to.",
    isSetting: false, isFinal: false, isIntensity: false, isSituation: false,
  },
  {
    step: "04", category: "The Setting", label: "Set it anywhere in the world",
    sub: "50+ countries, 12 historical eras, or an After Dark world entirely your own.",
    accent: "#34d399", gradient: "from-[#001008] via-[#001a12] to-[#000a06]",
    options: null, selected: "Victorian London",
    example: "1880s — fog, corsets, and everything that cannot be said aloud. Only felt.",
    isSetting: true, isFinal: false, isIntensity: false, isSituation: false,
    settingCategories: {
      contemporary: ["Luxury Hotel", "Private Yacht", "Rooftop Bar", "Mountain Retreat", "European Villa", "Private Estate"],
      historical: ["Victorian London", "Roaring Twenties", "Belle Époque Paris", "Regency England", "Feudal Japan", "Wartime 1940s"],
      afterDark: ["Private Club", "Rooftop, 3am", "Private Terrace", "The Glass House", "VIP Suite", "Penthouse Pool"],
    },
  },
  {
    step: "05", category: "The Intensity", label: "You set the temperature",
    sub: "From soft and slow to more charged. We shape the atmosphere to the level you choose.",
    accent: "#f97316", gradient: "from-[#1a0800] via-[#250f00] to-[#100500]",
    options: ["Tender", "Warm", "Elevated", "Deep"],
    optionSubs: ["Soft, emotional, slow burn", "More charged, desire building", "Richer, more immersive", "At its most intense"],
    selected: "Warm", example: null,
    isSetting: false, isFinal: false, isIntensity: true, isSituation: false,
  },
  {
    step: "06", category: "The Mood", label: "The emotional tone",
    sub: "Choose the emotional tone you want the story to carry.",
    accent: "#a78bfa", gradient: "from-[#0a0018] via-[#100025] to-[#060010]",
    options: ["Slow Burn", "Magnetic", "Quiet Intensity", "Late Night", "Lingering", "Charged", "Unspoken", "Emotional Tension"],
    selected: "Slow Burn", example: null,
    isSetting: false, isFinal: false, isIntensity: false, isSituation: false,
  },
  {
    step: "07", category: "The Situation", label: "The story behind the story",
    sub: "200+ starting points across 10 categories — or one chosen for you.",
    accent: "#e11d48", gradient: "from-[#1a0008] via-[#250010] to-[#100006]",
    options: null, selected: null, example: null,
    isSetting: false, isFinal: false, isIntensity: false, isSituation: true,
  },
  {
    step: "08", category: "Your Story", label: "Written. Narrated. Yours alone.",
    sub: "Your story written, a voice selected, cover art created — private from the very first word.",
    accent: "#c9a227", gradient: "from-[#100c00] via-[#1a1500] to-[#0a0800]",
    options: null, selected: null, example: null,
    isSetting: false, isFinal: true, isIntensity: false, isSituation: false,
  },
] as const;

type StepCard = typeof CASTING_STEP_CARDS[number];

const SITUATION_CATEGORIES = [
  "Unexpected Reunion", "First & Unknown", "Close Quarters",
  "Slow Burn & Patience", "Secrets & Unspoken", "Circumstance & Proximity",
  "Complicated Timing", "Emotional Distance",
];
const SITUATION_EXAMPLES = [
  "They were never meant to meet again. Then he walked back into the room.",
  "The night was supposed to be simple. It stopped feeling that way the moment he arrived.",
  "Nothing had been said yet, but the energy had already shifted.",
];

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
            <div className="flex gap-2" style={{ animation: "ticker-left 22s linear infinite", width: "max-content" }}>
              {allCitiesDup.map((city, i) => (
                <span key={`city-${i}`} className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border" style={{ borderColor: "#34d39928", color: "#34d39999", background: "#34d3990a" }}>{city}</span>
              ))}
            </div>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">Or step into another era entirely</p>
          <div className="overflow-hidden -mx-1">
            <div className="flex gap-2" style={{ animation: "ticker-left 35s linear infinite", width: "max-content" }}>
              {allEras.map((era, i) => (
                <span key={`era-${i}`} className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border" style={{ borderColor: "#6b8cce28", color: "#6b8cce99", background: "#6b8cce0a" }}>{era}</span>
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
    <div className="relative overflow-hidden rounded-2xl border flex flex-col border-white/10">
      <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
      <div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(ellipse at 70% 25%, ${s.accent}28 0%, transparent 60%)` }} />
      <div className="relative z-10 p-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-bold tracking-[0.25em] uppercase px-2 py-0.5 rounded-full border" style={{ color: s.accent, borderColor: `${s.accent}30`, background: `${s.accent}0d` }}>{s.category}</span>
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
                  <span key={item} className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                    style={isSel ? { borderColor: color, color: "#0a0a0a", background: color, fontWeight: 700 } : { borderColor: `${color}25`, color: `${color}85`, background: `${color}0a` }}>
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
    <div className="relative overflow-hidden rounded-2xl border flex flex-col border-white/10">
      <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
      <div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(ellipse at 70% 25%, ${s.accent}28 0%, transparent 60%)` }} />
      <div className="relative z-10 p-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-bold tracking-[0.25em] uppercase px-2 py-0.5 rounded-full border" style={{ color: s.accent, borderColor: `${s.accent}30`, background: `${s.accent}0d` }}>{s.category}</span>
          <span className="text-[9px] text-white/20 tracking-widest">{s.step}</span>
        </div>
        <p className="text-base font-bold text-white/90 mb-1 leading-snug">{s.label}</p>
        <p className="text-xs text-white/45 leading-relaxed mb-4">{s.sub}</p>
        <div className="space-y-2">
          {(s.options as readonly string[]).map((opt, idx) => {
            const isSel = opt === s.selected;
            return (
              <div key={opt} className="flex items-center gap-3 px-3 py-2 rounded-xl border"
                style={isSel ? { borderColor: s.accent, background: `${s.accent}18` } : { borderColor: `${s.accent}18`, background: `${s.accent}06` }}>
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

function SituationCard({ s }: { s: StepCard }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border flex flex-col border-white/10">
      <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
      <div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(ellipse at 70% 25%, ${s.accent}28 0%, transparent 60%)` }} />
      <div className="relative z-10 p-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-bold tracking-[0.25em] uppercase px-2 py-0.5 rounded-full border" style={{ color: s.accent, borderColor: `${s.accent}30`, background: `${s.accent}0d` }}>{s.category}</span>
          <span className="text-[9px] text-white/20 tracking-widest">{s.step}</span>
        </div>
        <p className="text-base font-bold text-white/90 mb-1 leading-snug">{s.label}</p>
        <p className="text-xs text-white/45 leading-relaxed mb-3">{s.sub}</p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border mb-3" style={{ borderColor: `${s.accent}30`, background: `${s.accent}10` }}>
          <Shuffle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.accent }} />
          <span className="text-xs font-semibold" style={{ color: s.accent }}>Choose For Me</span>
          <span className="text-[10px] text-white/30 ml-auto">or pick yours →</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {SITUATION_CATEGORIES.map((cat) => (
            <span key={cat} className="px-2 py-0.5 rounded-full text-[10px] font-medium border" style={{ borderColor: `${s.accent}25`, color: `${s.accent}80`, background: `${s.accent}0a` }}>{cat}</span>
          ))}
        </div>
      </div>
      <div className="relative z-10 mx-4 mb-4 rounded-xl border p-3" style={{ borderColor: `${s.accent}20`, background: `${s.accent}08` }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: `${s.accent}60` }}>Example situations</p>
        {SITUATION_EXAMPLES.map((ex) => (
          <p key={ex} className="text-xs italic leading-relaxed mb-1 last:mb-0" style={{ color: `${s.accent}b0` }}>"{ex}"</p>
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
    <div className="relative overflow-hidden rounded-2xl border border-primary/40 flex flex-col">
      <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20" />
      <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(ellipse at 70% 25%, #c9a22728 0%, transparent 60%)" }} />
      <div className="relative z-10 p-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-bold tracking-[0.25em] uppercase px-2 py-0.5 rounded-full border" style={{ color: "#c9a227", borderColor: "#c9a22730", background: "#c9a2270d" }}>{s.category}</span>
          <span className="text-[9px] text-white/20 tracking-widest">✦ Your result</span>
        </div>
        <p className="text-base font-bold text-white/90 mb-1 leading-snug">{s.label}</p>
        <p className="text-xs text-white/45 leading-relaxed">{s.sub}</p>
      </div>
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
        {["Narrated — ready to listen immediately", "Original cover art generated for this story", "Saved privately — visible only to you", "No record shared with anyone, ever"].map((item) => (
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
    <div className="relative overflow-hidden rounded-2xl border flex flex-col border-white/10">
      <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
      <div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(ellipse at 70% 25%, ${s.accent}28 0%, transparent 60%)` }} />
      <div className="relative z-10 p-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-bold tracking-[0.25em] uppercase px-2 py-0.5 rounded-full border" style={{ color: s.accent, borderColor: `${s.accent}30`, background: `${s.accent}0d` }}>{s.category}</span>
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
              <span key={chip} className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all"
                style={isSel ? { borderColor: s.accent, color: "#0a0a0a", background: s.accent, fontWeight: 700 } : { borderColor: `${s.accent}28`, color: `${s.accent}99`, background: `${s.accent}0a` }}>
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

interface CastingPreviewProps {
  soft?: boolean;
}

export default function CastingPreview({ soft = false }: CastingPreviewProps) {
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
    <section className={soft ? "py-10 w-full" : "py-16 px-4 md:px-8 max-w-7xl mx-auto w-full"}>
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
          <h2 className={`font-display font-bold text-foreground leading-tight ${soft ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"}`}>
            {soft ? "Choose every detail." : "The version of them\u00a0that's been in your head."}
          </h2>
          <p className="text-muted-foreground mt-2 text-base max-w-xl leading-relaxed">
            {soft
              ? "The mood, the chemistry, the setting, the intensity — all yours. The story is written around exactly what you choose."
              : "Choose who they are, how they make you feel, the charge between you, and where it takes you. Every detail set before a word is written — so nothing has to be left to someone else's imagination."}
          </p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {[
              { n: "50+", label: "Countries" },
              { n: "12", label: "Historical eras" },
              { n: "14", label: "Archetypes" },
              { n: "9", label: "Chemistries" },
              { n: "200+", label: "Situations" },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <p className="text-sm font-bold text-primary">{n}</p>
                <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <button onClick={() => scrollBy(-1)} disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 transition-all disabled:opacity-20" aria-label="Scroll left">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scrollBy(1)} disabled={!canScrollRight}
            className="w-9 h-9 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 transition-all disabled:opacity-20" aria-label="Scroll right">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} onScroll={updateScroll} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0, duration: 0.5 }} className="flex-shrink-0 w-80 snap-start">
          <WorldIntroCard />
        </motion.div>

        {CASTING_STEP_CARDS.map((s, i) => (
          <motion.div key={s.step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 1) * 0.06, duration: 0.5 }} className="flex-shrink-0 w-80 snap-start">
            {s.isFinal ? <FinalOutputCard s={s} />
              : s.isSetting ? <SettingCard s={s as StepCard & { isSetting: true }} />
              : s.isIntensity ? <IntensityCard s={s as StepCard & { isIntensity: true }} />
              : s.isSituation ? <SituationCard s={s} />
              : <StandardCard s={s} />}
          </motion.div>
        ))}

        <div className="flex-shrink-0 w-72 snap-start flex items-center justify-center px-4">
          <Link href="/create" className="flex flex-col items-center gap-4 text-center group w-full">
            <div className="w-16 h-16 rounded-full bg-primary/12 border border-primary/25 flex items-center justify-center group-hover:bg-primary/22 group-hover:scale-105 transition-all group-hover:shadow-[0_0_32px_rgba(201,162,39,0.2)]">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">Begin your story</p>
              <p className="text-xs text-muted-foreground/45 mt-1.5 leading-relaxed max-w-[180px] mx-auto">Written for you. Narrated. Private from the first word.</p>
            </div>
            <span className="text-xs text-primary/50 group-hover:text-primary/80 transition-colors tracking-widest uppercase">Create My Story →</span>
          </Link>
        </div>
      </div>

      <p className="md:hidden text-center text-xs text-muted-foreground/30 mt-2 tracking-widest">Swipe to explore →</p>
    </section>
  );
}
