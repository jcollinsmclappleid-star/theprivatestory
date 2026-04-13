import { useState } from "react";
import { motion } from "framer-motion";
import { Moon } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const BG = "#03030e";

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

function PartiallyOpenDoor({ onEnter }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        onClick={onEnter}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label="Enter After Dark"
        className="relative focus:outline-none"
        style={{ perspective: "900px", perspectiveOrigin: "30% center" }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 w-6 rounded-l-sm pointer-events-none z-0"
          animate={{
            opacity: hovered ? 1 : 0.55,
            background: hovered
              ? "linear-gradient(90deg, rgba(123,143,255,0.75) 0%, rgba(123,143,255,0.18) 60%, transparent 100%)"
              : "linear-gradient(90deg, rgba(123,143,255,0.35) 0%, rgba(123,143,255,0.08) 60%, transparent 100%)",
            boxShadow: hovered
              ? "-8px 0 32px 4px rgba(123,143,255,0.55)"
              : "-4px 0 18px 2px rgba(123,143,255,0.22)",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        <motion.div
          style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
          animate={{ rotateY: hovered ? -32 : -18 }}
          transition={{ type: "spring", damping: 22, stiffness: 90 }}
        >
          <img
            src={`${BASE}images/door-afterdark.png?v=4`}
            alt=""
            aria-hidden="true"
            className="relative z-10 block select-none"
            style={{
              width: "clamp(110px, 16vw, 165px)",
              height: "auto",
              filter: hovered
                ? "brightness(1.12) drop-shadow(0 0 32px rgba(123,143,255,0.5))"
                : "brightness(0.95) drop-shadow(0 0 18px rgba(123,143,255,0.22))",
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
            background: "radial-gradient(ellipse, rgba(123,143,255,0.28) 0%, transparent 70%)",
          }}
          animate={{ opacity: hovered ? 0.9 : 0.4 }}
          transition={{ duration: 0.4 }}
        />
      </button>

      <motion.button
        onClick={onEnter}
        className="flex items-center gap-2.5 px-7 py-3 rounded-full font-semibold text-sm tracking-wide"
        style={{
          background: "linear-gradient(135deg, rgba(123,143,255,0.18) 0%, rgba(90,105,200,0.22) 100%)",
          border: "1px solid rgba(123,143,255,0.40)",
          color: "#a8b8ff",
          boxShadow: "0 0 20px rgba(123,143,255,0.15)",
        }}
        whileHover={{
          scale: 1.04,
          boxShadow: "0 0 36px rgba(123,143,255,0.35)",
          borderColor: "rgba(123,143,255,0.70)",
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", damping: 18, stiffness: 120 }}
      >
        <Moon className="w-4 h-4" style={{ color: "#7b8fff" }} />
        Enter After Dark
      </motion.button>
    </div>
  );
}

export default function AfterDarkLanding({ onEnter }: Props) {
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
              background: "rgba(123,143,255,0.12)",
              border: "1px solid rgba(123,143,255,0.35)",
            }}
          >
            <Moon className="w-2.5 h-2.5" style={{ color: "#7b8fff" }} />
          </motion.div>
          <span
            className="text-xs font-semibold uppercase tracking-[0.22em]"
            style={{ color: "rgba(123,143,255,0.75)" }}
          >
            After Dark · Private · Unrestrained
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
          Nothing held back.
          <br />
          <span style={{ color: "#9baeff" }}>Heard only by you.</span>
        </motion.h1>

        {/* Copy */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.65 }}
          className="text-sm sm:text-base leading-relaxed mb-5 max-w-sm"
          style={{ color: "rgba(255,255,255,0.52)" }}
        >
          You don't pick from a list. You describe exactly what you want — the character, the dynamic, how far it goes. Written from scratch and narrated privately for you.
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
                color: "rgba(123,143,255,0.75)",
                background: "rgba(123,143,255,0.07)",
                border: "1px solid rgba(123,143,255,0.16)",
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
          <PartiallyOpenDoor onEnter={onEnter} />
        </motion.div>

        {/* Reassurance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-14 h-px" style={{ background: "rgba(123,143,255,0.18)" }} />
          <p
            className="text-xs tracking-wide"
            style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.07em" }}
          >
            Private · Written fresh each time · Nothing leaves this room
          </p>
        </motion.div>
      </div>

      {/* ── Mobile hero image (stacked, shows between content and door on small screens) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.9 }}
        className="block md:hidden relative w-full overflow-hidden order-first"
        style={{ height: "60vw", minHeight: 220, maxHeight: 420 }}
      >
        <img
          src={`${BASE}images/creation-room-hero.png?v=3`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.82, objectPosition: "50% 18%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, transparent 10%, transparent 72%, ${BG} 100%)`,
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
          src={`${BASE}images/creation-room-hero.png?v=3`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.82, objectPosition: "50% 18%" }}
        />
        {/* Left-edge gradient so text stays readable */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, ${BG} 0%, rgba(3,3,14,0.55) 30%, rgba(3,3,14,0.1) 65%, transparent 100%)`,
          }}
        />
        {/* Subtle indigo tint */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 60% 40%, rgba(80,90,200,0.18) 0%, transparent 70%)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
