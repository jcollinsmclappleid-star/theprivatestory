import { useState } from "react";
import { motion } from "framer-motion";
import { Moon } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const ACCENT = "#6366f1";

const ROOMS = [
  "The Late Night",
  "Come Home",
  "The Long Week",
  "Warm Weight",
  "Last Hour",
  "The Hour Before",
];

interface Props {
  onEnter: () => void;
}

function DriftDoor({ onEnter }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={onEnter}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label="Enter Drift"
        className="relative focus:outline-none"
        style={{ perspective: "900px", perspectiveOrigin: "30% center" }}
      >
        {/* Light crack behind door */}
        <motion.div
          className="absolute inset-y-0 left-0 w-6 rounded-l-sm pointer-events-none z-0"
          style={{ originX: 0 }}
          animate={{
            opacity: hovered ? 1 : 0.5,
            background: hovered
              ? "linear-gradient(90deg, rgba(99,102,241,0.65) 0%, rgba(99,102,241,0.14) 60%, transparent 100%)"
              : "linear-gradient(90deg, rgba(99,102,241,0.28) 0%, rgba(99,102,241,0.06) 60%, transparent 100%)",
            boxShadow: hovered
              ? "-8px 0 32px 4px rgba(99,102,241,0.45)"
              : "-4px 0 16px 2px rgba(99,102,241,0.18)",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        <motion.div
          style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
          animate={{ rotateY: hovered ? -30 : -15 }}
          transition={{ type: "spring", damping: 22, stiffness: 90 }}
        >
          <img
            src={`${BASE}images/door-drift.png?v=4`}
            alt=""
            aria-hidden="true"
            className="relative z-10 block select-none"
            style={{
              width: "clamp(140px, 22vw, 220px)",
              height: "auto",
              filter: hovered
                ? "brightness(1.1) drop-shadow(0 0 28px rgba(99,102,241,0.45))"
                : "brightness(0.92) drop-shadow(0 0 14px rgba(99,102,241,0.18))",
              transition: "filter 0.5s ease",
            }}
            draggable={false}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `${BASE}images/door-romance.png?v=4`;
            }}
          />
        </motion.div>

        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "110%",
            height: 28,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(99,102,241,0.22) 0%, transparent 70%)",
          }}
          animate={{ opacity: hovered ? 0.9 : 0.35 }}
          transition={{ duration: 0.4 }}
        />
      </button>

      <motion.button
        onClick={onEnter}
        className="flex items-center gap-2.5 px-7 py-3 rounded-full font-semibold text-sm tracking-wide"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(67,56,202,0.18) 100%)",
          border: "1px solid rgba(99,102,241,0.35)",
          color: "#a5b4fc",
          boxShadow: "0 0 18px rgba(99,102,241,0.12)",
        }}
        whileHover={{
          scale: 1.04,
          boxShadow: "0 0 32px rgba(99,102,241,0.3)",
          borderColor: "rgba(99,102,241,0.60)",
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", damping: 18, stiffness: 120 }}
      >
        <Moon className="w-4 h-4 opacity-70" style={{ color: ACCENT }} />
        Enter Drift
      </motion.button>
    </div>
  );
}

export default function DriftLanding({ onEnter }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ background: "#030210" }}
    >
      {/* ── Hero image ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <img
          src={`${BASE}images/drift-hero-woman.png?v=1`}
          alt=""
          aria-hidden="true"
          className="absolute top-0 right-0 h-full object-cover object-top"
          style={{ width: "100%", opacity: 0.24 }}
        />
        {/* Desktop: fade left */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(90deg, #030210 22%, rgba(3,2,16,0.75) 52%, rgba(3,2,16,0.06) 82%, #030210 100%)",
          }}
        />
        {/* Mobile: fade bottom heavily */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(180deg, #030210 0%, rgba(3,2,16,0.38) 32%, rgba(3,2,16,0.88) 70%, #030210 100%)",
          }}
        />
        {/* Top fade */}
        <div
          className="absolute inset-x-0 top-0 h-40"
          style={{ background: "linear-gradient(180deg, #030210 0%, transparent 100%)" }}
        />
        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "50%",
            background:
              "linear-gradient(0deg, #030210 0%, #030210 28%, rgba(3,2,16,0.85) 58%, transparent 100%)",
          }}
        />
        {/* Indigo ambient */}
        <div
          className="absolute top-0 left-0 w-1/2 h-2/3"
          style={{
            background:
              "radial-gradient(ellipse at 15% 35%, rgba(99,102,241,0.07) 0%, transparent 65%)",
          }}
        />
        {/* Warm amber glow from bottom-right */}
        <div
          className="absolute bottom-0 right-0 w-1/2 h-1/2"
          style={{
            background:
              "radial-gradient(ellipse at 80% 85%, rgba(217,119,6,0.06) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Badge */}
        <div className="pt-10 px-5 sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(99,102,241,0.10)",
                border: "1px solid rgba(99,102,241,0.28)",
              }}
            >
              <Moon className="w-2.5 h-2.5 opacity-70" style={{ color: ACCENT }} />
            </motion.div>
            <span
              className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: "rgba(99,102,241,0.70)" }}
            >
              Drift · Intimate · For the hours before sleep
            </span>
          </motion.div>
        </div>

        {/* Headline + copy + chips */}
        <div className="flex-1 flex flex-col justify-end md:justify-center px-5 sm:px-12 max-w-xl pt-4 md:pt-10 pb-6 md:pb-0">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="font-display font-bold leading-[1.08] text-white mb-4 md:mb-5"
            style={{ fontSize: "clamp(1.75rem, 5vw, 3.2rem)" }}
          >
            Soft. Intimate.
            <br />
            <span style={{ color: "#a5b4fc" }}>Made to settle you.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.65 }}
            className="text-sm sm:text-base leading-relaxed mb-6 md:mb-8 max-w-sm"
            style={{ color: "rgba(255,255,255,0.48)" }}
          >
            Not fantasy — closeness. Stories written around who you cast, narrated at the pace your body needs. Private, warm, and entirely yours.
          </motion.p>

          {/* Room chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap gap-1.5 md:gap-2 mb-8 md:mb-12"
          >
            {ROOMS.map((room, i) => (
              <motion.span
                key={room}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.85 + i * 0.06, duration: 0.4 }}
                className="text-[10px] sm:text-xs font-medium px-2.5 md:px-3 py-1 md:py-1.5 rounded-full"
                style={{
                  color: "rgba(99,102,241,0.70)",
                  background: "rgba(99,102,241,0.07)",
                  border: "1px solid rgba(99,102,241,0.15)",
                  letterSpacing: "0.06em",
                }}
              >
                {room}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Door CTA + reassurance */}
        <div className="flex flex-col items-center gap-6 md:gap-8 pb-10 md:pb-14 px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
          >
            <DriftDoor onEnter={onEnter} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div
              className="w-20 h-px"
              style={{ background: "rgba(99,102,241,0.15)" }}
            />
            <p
              className="text-xs tracking-wide"
              style={{ color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em" }}
            >
              Private · Written fresh each time · Nothing leaves this room
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
