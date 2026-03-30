import { useState } from "react";
import { motion } from "framer-motion";

type TileTheme = {
  gradient: string;
  accent: string;
  pattern: "waves" | "geometric" | "shards" | "dots" | "loops" | "circuit" | "deco" | "organic";
  count?: number;
};

const TILE_THEMES: Record<string, TileTheme> = {
  forbidden_desire:    { gradient: "from-[#2a0a0a] via-[#4a1010] to-[#1a0505]", accent: "#c0392b", pattern: "shards" },
  dark_romance:        { gradient: "from-[#0d0d1a] via-[#1a1028] to-[#0a0a15]", accent: "#8b5cf6", pattern: "geometric" },
  slow_burn:           { gradient: "from-[#1a0f00] via-[#3d2000] to-[#120c00]", accent: "#c8893c", pattern: "waves" },
  emotional_desire:    { gradient: "from-[#1a0a10] via-[#2a1018] to-[#120508]", accent: "#e879a0", pattern: "organic" },
  dominant_surrendered:{ gradient: "from-[#0d0a00] via-[#1f1800] to-[#0a0800]", accent: "#c9a227", pattern: "shards" },
  late_night:          { gradient: "from-[#020510] via-[#060c22] to-[#020510]", accent: "#6b8cce", pattern: "dots" },
  second_chance:       { gradient: "from-[#150a00] via-[#2a1500] to-[#100800]", accent: "#c96c2a", pattern: "loops" },
  first_time:          { gradient: "from-[#0f0d00] via-[#1f1a00] to-[#0c0b00]", accent: "#e6c84a", pattern: "organic" },
  explicit_collection: { gradient: "from-[#12080a] via-[#261018] to-[#0e0608]", accent: "#f43f5e", pattern: "shards" },
  historical_romance:  { gradient: "from-[#100d00] via-[#221c00] to-[#0d0a00]", accent: "#c9a227", pattern: "deco" },
};

function PatternSVG({ pattern, accent }: { pattern: TileTheme["pattern"]; accent: string }) {
  const a = accent;
  switch (pattern) {
    case "waves":
      return (
        <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <path d="M0 60 Q50 20 100 60 Q150 100 200 60" stroke={a} strokeWidth="1.5" fill="none" />
          <path d="M0 80 Q50 40 100 80 Q150 120 200 80" stroke={a} strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M0 40 Q50 0 100 40 Q150 80 200 40" stroke={a} strokeWidth="0.8" fill="none" opacity="0.4" />
          <path d="M0 100 Q50 60 100 100 Q150 140 200 100" stroke={a} strokeWidth="0.6" fill="none" opacity="0.3" />
        </svg>
      );
    case "geometric":
      return (
        <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <polygon points="100,10 140,80 60,80" stroke={a} strokeWidth="1" fill="none" />
          <polygon points="100,30 120,70 80,70" stroke={a} strokeWidth="0.6" fill="none" opacity="0.5" />
          <circle cx="100" cy="60" r="40" stroke={a} strokeWidth="0.8" fill="none" opacity="0.3" />
          <circle cx="100" cy="60" r="20" stroke={a} strokeWidth="0.5" fill="none" opacity="0.4" />
          <line x1="100" y1="0" x2="100" y2="120" stroke={a} strokeWidth="0.4" opacity="0.2" />
          <line x1="0" y1="60" x2="200" y2="60" stroke={a} strokeWidth="0.4" opacity="0.2" />
        </svg>
      );
    case "shards":
      return (
        <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <polygon points="0,0 80,40 60,120" stroke={a} strokeWidth="1" fill="none" />
          <polygon points="140,0 200,50 180,120 120,80" stroke={a} strokeWidth="0.8" fill="none" opacity="0.7" />
          <line x1="60" y1="0" x2="100" y2="120" stroke={a} strokeWidth="1.2" opacity="0.5" />
          <line x1="120" y1="0" x2="80" y2="120" stroke={a} strokeWidth="0.6" opacity="0.4" />
          <polygon points="80,20 120,0 140,60 90,80" stroke={a} strokeWidth="0.5" fill="none" opacity="0.3" />
        </svg>
      );
    case "dots":
      return (
        <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          {Array.from({ length: 18 }).map((_, i) => (
            <circle key={i} cx={15 + (i % 6) * 35} cy={20 + Math.floor(i / 6) * 40} r={i % 3 === 0 ? 2 : 1} fill={a} opacity={0.3 + (i % 3) * 0.2} />
          ))}
          <circle cx="100" cy="60" r="3" fill={a} opacity="0.7" />
          <circle cx="100" cy="60" r="12" stroke={a} strokeWidth="0.5" fill="none" opacity="0.4" />
          <circle cx="100" cy="60" r="24" stroke={a} strokeWidth="0.3" fill="none" opacity="0.2" />
        </svg>
      );
    case "loops":
      return (
        <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <path d="M30,60 C30,20 80,20 80,60 C80,100 130,100 130,60 C130,20 180,20 180,60" stroke={a} strokeWidth="1.5" fill="none" />
          <path d="M20,70 C20,40 60,40 70,70 C80,100 120,100 130,70 C140,40 180,40 190,70" stroke={a} strokeWidth="0.8" fill="none" opacity="0.5" />
          <path d="M10,50 C30,10 70,10 90,50 C110,90 150,90 170,50" stroke={a} strokeWidth="0.5" fill="none" opacity="0.3" />
        </svg>
      );
    case "circuit":
      return (
        <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <polyline points="20,60 60,60 60,30 100,30 100,90 140,90 140,60 180,60" stroke={a} strokeWidth="1" fill="none" />
          <polyline points="0,40 40,40 40,80 80,80 80,20 120,20 120,80 160,80 160,40 200,40" stroke={a} strokeWidth="0.6" fill="none" opacity="0.5" />
          <circle cx="60" cy="30" r="2" fill={a} />
          <circle cx="100" cy="90" r="2" fill={a} />
          <circle cx="140" cy="60" r="2" fill={a} />
          <circle cx="100" cy="30" r="1.5" fill={a} opacity="0.6" />
        </svg>
      );
    case "deco":
      return (
        <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <rect x="70" y="20" width="60" height="80" stroke={a} strokeWidth="1" fill="none" />
          <rect x="80" y="30" width="40" height="60" stroke={a} strokeWidth="0.6" fill="none" opacity="0.6" />
          <line x1="100" y1="0" x2="100" y2="20" stroke={a} strokeWidth="1" />
          <line x1="100" y1="100" x2="100" y2="120" stroke={a} strokeWidth="1" />
          <line x1="0" y1="60" x2="70" y2="60" stroke={a} strokeWidth="1" />
          <line x1="130" y1="60" x2="200" y2="60" stroke={a} strokeWidth="1" />
          <polygon points="100,35 108,55 90,55" stroke={a} strokeWidth="0.6" fill="none" />
          <polygon points="100,85 108,65 90,65" stroke={a} strokeWidth="0.6" fill="none" />
        </svg>
      );
    case "organic":
    default:
      return (
        <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <ellipse cx="80" cy="60" rx="50" ry="35" stroke={a} strokeWidth="1" fill="none" />
          <ellipse cx="120" cy="60" rx="50" ry="35" stroke={a} strokeWidth="1" fill="none" />
          <ellipse cx="100" cy="40" rx="30" ry="20" stroke={a} strokeWidth="0.7" fill="none" opacity="0.5" />
          <ellipse cx="100" cy="80" rx="30" ry="20" stroke={a} strokeWidth="0.7" fill="none" opacity="0.5" />
          <ellipse cx="100" cy="60" rx="15" ry="10" stroke={a} strokeWidth="0.5" fill={a} fillOpacity="0.1" />
        </svg>
      );
  }
}

const API_BASE = (typeof import.meta !== "undefined" && (import.meta as any).env?.BASE_URL?.replace(/\/$/, "")) || "";

interface CategoryTileProps {
  id: string;
  label: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function CategoryTile({ id, label, count, isActive, onClick, compact }: CategoryTileProps) {
  const theme = TILE_THEMES[id] ?? { gradient: "from-[#0a0a0a] via-[#141414] to-[#080808]", accent: "#c9a227", pattern: "waves" as const };
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-2xl border transition-all cursor-pointer group text-left w-full ${
        compact ? "aspect-[4/3]" : "aspect-[3/2]"
      } ${
        isActive
          ? "border-primary shadow-glow"
          : "border-white/8 hover:border-primary/40"
      }`}
    >
      {/* Gradient background — always present as fallback */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />

      {/* Category photo — fades in when loaded, hidden on error */}
      {!imgError && (
        <img
          src={`${API_BASE}/api/images/category-${id}.png`}
          alt=""
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? "opacity-75" : "opacity-0"}`}
        />
      )}

      {/* Animated SVG pattern — subtle texture over image */}
      <motion.div
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 ${imgLoaded && !imgError ? "opacity-30" : ""}`}
      >
        <PatternSVG pattern={theme.pattern} accent={theme.accent} />
      </motion.div>

      {/* Accent glow */}
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute inset-0 rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 70% 50%, ${theme.accent}22 0%, transparent 65%)` }}
      />

      {/* Bottom gradient for text legibility — stronger when image is showing */}
      <div className={`absolute inset-0 bg-gradient-to-t ${imgLoaded && !imgError ? "from-black/85 via-black/30 to-black/10" : "from-black/70 via-transparent to-transparent"}`} />

      {isActive && (
        <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/50" />
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className={`font-semibold text-white leading-tight ${compact ? "text-xs" : "text-sm"}`}>{label}</p>
        {count !== undefined && (
          <p className="text-white/50 text-xs mt-0.5">{count} stories</p>
        )}
      </div>
    </motion.button>
  );
}
