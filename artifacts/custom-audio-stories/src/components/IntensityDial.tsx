import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const img = (path: string) => `${BASE}/${path.replace(/^\//, "")}`;

export const INTENSITY_LEVELS = [
  {
    id: "slow",
    label: "Slow burn",
    hint: "Tension & longing",
    color: "#94a3b8",
    sampleCap: true,
    image: img("images/rooms/slow_burn.webp"),
    pulse: "Hold your breath…",
  },
  {
    id: "warm",
    label: "Warm",
    hint: "Intimate & charged",
    color: "#f97316",
    sampleCap: false,
    image: img("images/chemistry/romantic.webp"),
    pulse: "The door should stay locked.",
  },
  {
    id: "explicit",
    label: "Explicit",
    hint: "Nothing held back",
    color: "#e879a0",
    sampleCap: false,
    image: img("images/rooms/dark_territory.webp"),
    pulse: "Rules already breaking.",
  },
  {
    id: "unrestrained",
    label: "Unrestrained",
    hint: "As far as you choose",
    color: "#c9a227",
    sampleCap: false,
    image: img("images/rooms/power_exchange.webp"),
    pulse: "No chance to leave.",
  },
] as const;

const THUMB_LEFT = [12, 37, 62, 87];

interface IntensityDialProps {
  activeIndex: number;
  onChange: (index: number) => void;
}

export function IntensityDial({ activeIndex, onChange }: IntensityDialProps) {
  const reduceMotion = useReducedMotion();
  const [burst, setBurst] = useState(0);
  const active = INTENSITY_LEVELS[activeIndex] ?? INTENSITY_LEVELS[1];

  const handlePick = (index: number) => {
    if (index !== activeIndex) setBurst((b) => b + 1);
    onChange(index);
  };

  return (
    <div className="rounded-2xl border border-white/12 bg-gradient-to-br from-black/50 via-[#0a0814]/80 to-black/40 p-5 md:p-6 overflow-hidden relative">
      {/* Scene backdrop — shifts with intensity */}
      <AnimatePresence mode="wait">
        <motion.img
          key={active.id}
          src={active.image}
          alt=""
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.38, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0814]/95 via-[#0a0814]/82 to-[#0a0814]/55 pointer-events-none" />

      {/* Click burst */}
      {!reduceMotion && (
        <AnimatePresence>
          {burst > 0 && (
            <motion.div
              key={burst}
              initial={{ opacity: 0.65, scale: 0.85 }}
              animate={{ opacity: 0, scale: 1.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute inset-0 pointer-events-none z-[5]"
              style={{
                background: `radial-gradient(circle at ${THUMB_LEFT[activeIndex]}% 42%, ${active.color}66 0%, transparent 55%)`,
              }}
            />
          )}
        </AnimatePresence>
      )}

      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.35, 0.75, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, repeatType: "mirror" }}
          style={{
            background: `radial-gradient(circle at ${THUMB_LEFT[activeIndex]}% 30%, ${active.color}44 0%, transparent 58%)`,
          }}
        />
      )}

      <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#ffb4c8] mb-1.5 flex items-center gap-1.5">
            <motion.span
              animate={reduceMotion ? undefined : { scale: [1, 1.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              <Flame className="w-3.5 h-3.5" />
            </motion.span>
            How far it goes
          </p>
          <p className="text-sm text-white/90 leading-snug max-w-md">
            Editor's Picks fade on a held breath.{" "}
            <span className="text-white font-semibold">Tap a level — feel it climb.</span>
          </p>
        </div>
        <motion.p
          key={active.label}
          initial={{ opacity: 0, scale: 0.88, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
          className="text-xs font-bold uppercase tracking-wider shrink-0 px-3 py-1.5 rounded-full border"
          style={{
            color: active.color,
            borderColor: `${active.color}88`,
            background: `${active.color}22`,
            boxShadow: `0 0 28px -4px ${active.color}`,
          }}
        >
          {active.label}
        </motion.p>
      </div>

      <div className="relative pt-3 pb-2">
        <div className="relative h-4 rounded-full bg-white/8 overflow-hidden border border-white/10 shadow-inner">
          {INTENSITY_LEVELS.map((level, i) => (
            <button
              key={level.id}
              type="button"
              aria-label={`Set intensity to ${level.label}`}
              onClick={() => handlePick(i)}
              className="absolute top-0 bottom-0 border-0 p-0 cursor-pointer z-20"
              style={{
                left: `${i * 25}%`,
                width: "25%",
                background: "transparent",
              }}
            />
          ))}

          <div className="absolute inset-0 flex pointer-events-none">
            {INTENSITY_LEVELS.map((level, i) => (
              <motion.div
                key={level.id}
                className="flex-1 h-full relative overflow-hidden"
                animate={{
                  opacity: i <= activeIndex ? 1 : 0.18,
                  scaleY: i === activeIndex ? 1.08 : 1,
                }}
                transition={{ duration: 0.35, type: "spring", stiffness: 300 }}
                style={{
                  background: `linear-gradient(180deg, ${level.color}ee, ${level.color})`,
                  boxShadow: i === activeIndex ? `0 0 22px ${level.color}` : undefined,
                }}
              >
                {!reduceMotion && i === activeIndex && (
                  <motion.div
                    className="absolute inset-0"
                    animate={{ x: ["-100%", "120%"] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)`,
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          <div
            className="absolute top-0 bottom-0 left-0 pointer-events-none border-r-2 border-dashed border-white/35"
            style={{ width: "25%" }}
          >
            <div className="absolute inset-0 bg-black/45" />
          </div>
        </div>

        <motion.div
          className="absolute top-0 z-10 pointer-events-none"
          animate={{ left: `${THUMB_LEFT[activeIndex]}%` }}
          transition={{ type: "spring", stiffness: 520, damping: 16 }}
          style={{ x: "-50%" }}
        >
          <motion.div
            key={`thumb-${activeIndex}-${burst}`}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className="w-6 h-6 rounded-full border-2 border-white"
            style={{
              background: active.color,
              boxShadow: `0 0 24px ${active.color}, 0 0 48px ${active.color}88`,
            }}
          />
          <span className="absolute top-7 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-wider text-white whitespace-nowrap">
            Your story
          </span>
        </motion.div>

        <div className="absolute top-0 left-[12%] -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-white/25 border border-white/50" />
          <span className="text-[8px] font-bold uppercase tracking-wider text-white/50 mt-6 whitespace-nowrap">
            Samples stop
          </span>
        </div>

        <div className="flex justify-between mt-9 gap-1">
          {INTENSITY_LEVELS.map((level, i) => (
            <button
              key={level.id}
              type="button"
              onClick={() => handlePick(i)}
              className="flex-1 min-w-0 text-center px-0.5 group"
            >
              <motion.p
                animate={{
                  scale: i === activeIndex ? 1.12 : 1,
                  color: i <= activeIndex ? level.color : "rgba(255,255,255,0.35)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide truncate"
              >
                {level.label}
              </motion.p>
              <p className="text-[8px] sm:text-[9px] text-white/55 mt-0.5 hidden sm:block truncate group-hover:text-white/80 transition-colors">
                {level.hint}
              </p>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={active.pulse}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="relative mt-4 text-sm italic text-white/88 border-l-2 pl-3"
          style={{ borderColor: active.color }}
        >
          {active.pulse}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
