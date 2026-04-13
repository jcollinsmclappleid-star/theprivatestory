import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const GOLD = "#c9a227";
const BG = "#080604";

const ROOMS = [
  "Slow Burn",
  "The First Night",
  "Long Distance",
  "The Weekend Away",
  "Reunited",
  "Something Real",
];

interface Props {
  onEnter: () => void;
}

function RomanceDoor({ onEnter }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        onClick={onEnter}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label="Enter the Romance Room"
        className="relative focus:outline-none"
        style={{ perspective: "900px", perspectiveOrigin: "30% center" }}
      >
        {/* Light crack behind door */}
        <motion.div
          className="absolute inset-y-0 left-0 w-6 rounded-l-sm pointer-events-none z-0"
          animate={{
            opacity: hovered ? 1 : 0.5,
            background: hovered
              ? "linear-gradient(90deg, rgba(201,162,39,0.65) 0%, rgba(201,162,39,0.14) 60%, transparent 100%)"
              : "linear-gradient(90deg, rgba(201,162,39,0.28) 0%, rgba(201,162,39,0.06) 60%, transparent 100%)",
            boxShadow: hovered
              ? "-8px 0 32px 4px rgba(201,162,39,0.45)"
              : "-4px 0 16px 2px rgba(201,162,39,0.18)",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        <motion.div
          style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
          animate={{ rotateY: hovered ? -30 : -15 }}
          transition={{ type: "spring", damping: 22, stiffness: 90 }}
        >
          <img
            src={`${BASE}images/door-romance.png?v=4`}
            alt=""
            aria-hidden="true"
            className="relative z-10 block select-none"
            style={{
              width: "clamp(110px, 16vw, 165px)",
              height: "auto",
              filter: hovered
                ? "brightness(1.12) drop-shadow(0 0 28px rgba(201,162,39,0.5))"
                : "brightness(0.9) drop-shadow(0 0 14px rgba(201,162,39,0.2))",
              transition: "filter 0.5s ease",
            }}
            draggable={false}
          />
        </motion.div>

        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "110%",
            height: 28,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(201,162,39,0.22) 0%, transparent 70%)",
          }}
          animate={{ opacity: hovered ? 0.9 : 0.35 }}
          transition={{ duration: 0.4 }}
        />
      </button>

      <motion.button
        onClick={onEnter}
        className="flex items-center gap-2.5 px-7 py-3 rounded-full font-semibold text-sm tracking-wide"
        style={{
          background: "linear-gradient(135deg, rgba(201,162,39,0.16) 0%, rgba(160,120,20,0.22) 100%)",
          border: "1px solid rgba(201,162,39,0.38)",
          color: "#e8c96a",
          boxShadow: "0 0 20px rgba(201,162,39,0.12)",
        }}
        whileHover={{
          scale: 1.04,
          boxShadow: "0 0 36px rgba(201,162,39,0.32)",
          borderColor: "rgba(201,162,39,0.65)",
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", damping: 18, stiffness: 120 }}
      >
        <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
        Begin my story
      </motion.button>
    </div>
  );
}

export default function CreateLanding({ onEnter }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="relative min-h-screen w-full overflow-hidden flex flex-col md:flex-row"
      style={{ background: BG }}
    >
      {/* ── Left column — content ──────────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-start w-full md:w-[52%] lg:w-[48%] px-6 sm:px-10 lg:px-16 pt-24 md:pt-20 pb-6">

        {/* Badge */}
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
              background: "rgba(201,162,39,0.10)",
              border: "1px solid rgba(201,162,39,0.32)",
            }}
          >
            <Sparkles className="w-2.5 h-2.5" style={{ color: GOLD }} />
          </motion.div>
          <span
            className="text-xs font-semibold uppercase tracking-[0.22em]"
            style={{ color: "rgba(201,162,39,0.72)" }}
          >
            The Romance Room · Private · Entirely Yours
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="font-display font-bold leading-[1.08] text-white mb-3"
          style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)" }}
        >
          Written around you.
          <br />
          <span style={{ color: "#e8c96a" }}>Heard only by you.</span>
        </motion.h1>

        {/* Copy */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.65 }}
          className="text-sm sm:text-base leading-relaxed mb-5 max-w-sm"
          style={{ color: "rgba(255,255,255,0.50)" }}
        >
          You cast the characters. You set the scene. Your story is written from scratch and narrated privately — no template, no catalogue, nothing left over from someone else's night.
        </motion.p>

        {/* Room chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-wrap gap-1.5 mb-7"
        >
          {ROOMS.map((room, i) => (
            <motion.span
              key={room}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85 + i * 0.06, duration: 0.4 }}
              className="text-[10px] sm:text-xs font-medium px-3 py-1.5 rounded-full"
              style={{
                color: "rgba(201,162,39,0.72)",
                background: "rgba(201,162,39,0.07)",
                border: "1px solid rgba(201,162,39,0.16)",
                letterSpacing: "0.06em",
              }}
            >
              {room}
            </motion.span>
          ))}
        </motion.div>

        {/* Door CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
          className="flex justify-center md:justify-start mb-5"
        >
          <RomanceDoor onEnter={onEnter} />
        </motion.div>

        {/* Reassurance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-14 h-px" style={{ background: "rgba(201,162,39,0.16)" }} />
          <p
            className="text-xs tracking-wide"
            style={{ color: "rgba(255,255,255,0.22)", letterSpacing: "0.07em" }}
          >
            Private · Written fresh each time · Nothing stored
          </p>
        </motion.div>
      </div>

      {/* ── Mobile hero image (shows above content on small screens) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.9 }}
        className="block md:hidden relative w-full overflow-hidden order-first"
        style={{ height: "45vw", minHeight: 200, maxHeight: 340 }}
      >
        <img
          src={`${BASE}images/creation-room-hero.png?v=1`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ opacity: 0.82 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, transparent 25%, transparent 70%, ${BG} 100%)`,
          }}
        />
      </motion.div>

      {/* ── Right column — desktop image ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="hidden md:block absolute right-0 top-0 bottom-0 pointer-events-none select-none"
        style={{ width: "52%", left: "48%" }}
      >
        <img
          src={`${BASE}images/creation-room-hero.png?v=1`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ opacity: 0.82 }}
        />
        {/* Left-edge fade so text stays readable */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, ${BG} 0%, rgba(8,6,4,0.55) 30%, rgba(8,6,4,0.08) 65%, transparent 100%)`,
          }}
        />
        {/* Warm gold ambient glow */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 60% 40%, rgba(180,130,20,0.14) 0%, transparent 70%)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
