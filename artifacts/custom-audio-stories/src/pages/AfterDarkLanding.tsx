import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { CreationRoomHero } from "@/components/CreationRoomHero";

const BG = "#080604";
const GOLD = "#c9a227";

const ROOMS = [
  "Power Exchange",
  "The Forbidden",
  "Slow Burn",
  "Eyes On Us",
  "Dark Territory",
  "No Limits",
];

interface Props {
  onEnter: () => void;
}

export default function AfterDarkLanding({ onEnter }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col md:flex-row"
      style={{ background: BG }}
    >
      {/* ── Left column — content ──────────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-start w-full md:max-w-[46%] lg:max-w-[42%] px-6 sm:px-10 lg:px-16 pt-24 md:pt-20 pb-8">

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center gap-2 mb-5"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(201,162,39,0.12)",
              border: "1px solid rgba(201,162,39,0.35)",
            }}
          >
            <Sparkles className="w-2.5 h-2.5 text-primary" />
          </motion.div>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
            Personalised Erotica · Private
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="font-display font-bold leading-[1.08] text-white mb-3"
          style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)", textShadow: "0 2px 24px rgba(8,6,4,0.95)" }}
        >
          Nothing held back.
          <br />
          <span className="text-primary">Heard only by you.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.65 }}
          className="text-sm sm:text-base leading-relaxed mb-5 max-w-sm"
          style={{ color: "rgba(255,255,255,0.72)" }}
        >
          Explicit, intimate erotic audio built entirely around your choices. Cast the dynamic, set the intensity, and hear it narrated by a full cast — private to your account alone.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-wrap gap-1.5 mb-8"
        >
          {ROOMS.map((room, i) => (
            <motion.span
              key={room}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85 + i * 0.06, duration: 0.4 }}
              className="text-[10px] sm:text-xs font-medium px-3 py-1.5 rounded-full"
              style={{
                color: "rgba(232,213,160,0.85)",
                background: "rgba(201,162,39,0.08)",
                border: "1px solid rgba(201,162,39,0.22)",
                letterSpacing: "0.06em",
              }}
            >
              {room}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5"
        >
          <motion.button
            type="button"
            onClick={onEnter}
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-sm tracking-wide w-full sm:w-auto"
            style={{
              background: GOLD,
              color: "#0a0806",
              boxShadow: "0 0 32px rgba(201,162,39,0.35)",
            }}
            whileHover={{ scale: 1.03, boxShadow: "0 0 44px rgba(201,162,39,0.5)" }}
            whileTap={{ scale: 0.97 }}
          >
            <Sparkles className="w-4 h-4" />
            Create your erotica
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-14 h-px bg-primary/25" />
          <p className="text-xs tracking-wide text-white/40" style={{ letterSpacing: "0.07em" }}>
            Private · Written fresh each time · Your intensity
          </p>
        </motion.div>
      </div>

      {/* ── Text scrim (headline readable, scene stays visible) ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "linear-gradient(90deg, #080604 0%, rgba(8,6,4,0.88) 28%, rgba(8,6,4,0.45) 48%, transparent 72%)",
        }}
      />

      <CreationRoomHero variant="mobile" />
      <div className="hidden md:block">
        <CreationRoomHero variant="desktop" />
      </div>
    </motion.div>
  );
}
