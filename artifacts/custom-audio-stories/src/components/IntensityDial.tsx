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
    color: "#a68fa3",
    sampleCap: true,
    image: img("images/rooms/slow_burn.webp"),
    pulse: "Still on the edge of saying it…",
  },
  {
    id: "warm",
    label: "Warm",
    hint: "Intimate & charged",
    color: "#c9956a",
    sampleCap: false,
    image: img("images/chemistry/romantic.webp"),
    pulse: "The tension builds, deliberately.",
  },
  {
    id: "explicit",
    label: "Explicit",
    hint: "Nothing held back",
    color: "#d4738f",
    sampleCap: false,
    image: img("images/rooms/dark_territory.webp"),
    pulse: "Nothing held back — on your terms.",
  },
  {
    id: "unrestrained",
    label: "Unrestrained",
    hint: "As far as you choose",
    color: "#c9a87c",
    sampleCap: false,
    image: img("images/rooms/power_exchange.webp"),
    pulse: "Exactly as far as you chose.",
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
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-[#120a14]/95 via-[#0f0812]/90 to-[#0a060c]/95 p-5 md:p-6 overflow-hidden relative">
      {/* Scene backdrop — shifts with intensity */}
      <AnimatePresence mode="wait">
        <motion.img
          key={active.id}
          src={active.image}
          alt=""
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.38, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-[#120a14]/96 via-[#120a14]/88 to-[#120a14]/60 pointer-events-none" />

      {/* Click burst */}
      {!reduceMotion && (
        <AnimatePresence>
          {burst > 0 && (
            <motion.div
              key={burst}
              initial={{ opacity: 0.65, scale: 0.85 }}
              animate={{ opacity: 0, scale: 1.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="absolute inset-0 pointer-events-none z-[5]"
              style={{
                background: `radial-gradient(circle at ${THUMB_LEFT[activeIndex]}% 42%, ${active.color}55 0%, transparent 55%)`,
              }}
            />
          )}
        </AnimatePresence>
      )}

      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.25, 0.55, 0.3] }}
          transition={{ duration: 4.2, repeat: Infinity, repeatType: "mirror" }}
          style={{
            background: `radial-gradient(circle at ${THUMB_LEFT[activeIndex]}% 30%, ${active.color}33 0%, transparent 58%)`,
          }}
        />
      )}

      <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-rose-200/75 mb-1.5 flex items-center gap-1.5">
            <motion.span
              animate={reduceMotion ? undefined : { scale: [1, 1.15, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              <Flame className="w-3.5 h-3.5" />
            </motion.span>
            How intimate it becomes
          </p>
          <p className="text-sm text-white/90 leading-snug max-w-md">
            Studio teasers fade on a held breath.{" "}
            <span className="text-white font-medium">Choose a level — yours goes further.</span>
          </p>
        </div>
        <motion.p
          key={active.label}
          initial={{ opacity: 0, scale: 0.88, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 20 }}
          className="text-xs font-bold uppercase tracking-wider shrink-0 px-3 py-1.5 rounded-full border"
          style={{
            color: active.color,
            borderColor: `${active.color}77`,
            background: `${active.color}18`,
            boxShadow: `0 0 24px -6px ${active.color}`,
          }}
        >
          {active.label}
        </motion.p>
      </div>

      <div className="relative pt-3 pb-2">
        <div className="relative h-4 rounded-full bg-[#1a0f18]/90 overflow-hidden border border-rose-900/35 shadow-inner">
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
                  opacity: i <= activeIndex ? 1 : 0.15,
                  scaleY: i === activeIndex ? 1.06 : 1,
                }}
                transition={{ duration: 0.45, type: "spring", stiffness: 260 }}
                style={{
                  background: `linear-gradient(180deg, ${level.color}dd, ${level.color}aa)`,
                  boxShadow: i === activeIndex ? `0 0 20px ${level.color}88` : undefined,
                }}
              >
                {!reduceMotion && i === activeIndex && (
                  <motion.div
                    className="absolute inset-0"
                    animate={{ x: ["-100%", "120%"] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(255,220,200,0.28), transparent)`,
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          <div
            className="absolute top-0 bottom-0 left-0 pointer-events-none border-r border-dashed border-white/25"
            style={{ width: "25%" }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
        </div>

        <motion.div
          className="absolute top-0 z-10 pointer-events-none"
          animate={{ left: `${THUMB_LEFT[activeIndex]}%` }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          style={{ x: "-50%" }}
        >
          <motion.div
            key={`thumb-${activeIndex}-${burst}`}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 16 }}
            className="w-6 h-6 rounded-full border-2 border-white/90"
            style={{
              background: active.color,
              boxShadow: `0 0 20px ${active.color}, 0 0 40px ${active.color}66`,
            }}
          />
          <span className="absolute top-7 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-wider text-white/90 whitespace-nowrap">
            Your story
          </span>
        </motion.div>

        <div className="absolute top-0 left-[12%] -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/40" />
          <span className="text-[8px] font-bold uppercase tracking-wider text-white/45 mt-6 whitespace-nowrap">
            Teasers stop
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
                  scale: i === activeIndex ? 1.1 : 1,
                  color: i <= activeIndex ? level.color : "rgba(255,255,255,0.35)",
                }}
                transition={{ type: "spring", stiffness: 360, damping: 22 }}
                className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide truncate"
              >
                {level.label}
              </motion.p>
              <p className="text-[8px] sm:text-[9px] text-white/55 mt-0.5 hidden sm:block truncate group-hover:text-white/75 transition-colors">
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
