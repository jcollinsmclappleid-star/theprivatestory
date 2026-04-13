import { useState } from "react";
import { motion } from "framer-motion";
import { Moon } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

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
    <div className="flex flex-col items-center gap-6">
      {/* Door container */}
      <button
        onClick={onEnter}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label="Enter After Dark"
        className="relative focus:outline-none group"
        style={{ perspective: "900px", perspectiveOrigin: "30% center" }}
      >
        {/* Light crack behind the door — bleeds through the left/hinge edge */}
        <motion.div
          className="absolute inset-y-0 left-0 w-6 rounded-l-sm pointer-events-none z-0"
          style={{ originX: 0 }}
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

        {/* The door itself — slightly ajar via rotateY */}
        <motion.div
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
          }}
          animate={{ rotateY: hovered ? -32 : -18 }}
          transition={{ type: "spring", damping: 22, stiffness: 90 }}
        >
          <img
            src={`${BASE}images/door-afterdark.png?v=4`}
            alt=""
            aria-hidden="true"
            width={280}
            height={560}
            className="relative z-10 block select-none"
            style={{
              width: "clamp(180px, 28vw, 280px)",
              height: "auto",
              filter: hovered
                ? "brightness(1.12) drop-shadow(0 0 32px rgba(123,143,255,0.5))"
                : "brightness(0.95) drop-shadow(0 0 18px rgba(123,143,255,0.22))",
              transition: "filter 0.5s ease",
            }}
            draggable={false}
          />
        </motion.div>

        {/* Ambient floor glow under the door */}
        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "110%",
            height: 32,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(123,143,255,0.28) 0%, transparent 70%)",
          }}
          animate={{ opacity: hovered ? 0.9 : 0.4 }}
          transition={{ duration: 0.4 }}
        />
      </button>

      {/* CTA label under the door */}
      <motion.button
        onClick={onEnter}
        className="flex items-center gap-2.5 px-7 py-3 rounded-full font-semibold text-sm tracking-wide transition-all"
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
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ background: "#03030e" }}
    >
      {/* ── Hero image ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <img
          src={`${BASE}images/afterdark-hero-woman.png?v=1`}
          alt=""
          aria-hidden="true"
          className="absolute top-0 right-0 h-full object-cover object-top"
          style={{
            width: "62%",
            minWidth: 260,
            opacity: 0.82,
          }}
        />

        {/* Right-to-left fade so image melts into the dark left side */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #03030e 22%, rgba(3,3,14,0.72) 52%, rgba(3,3,14,0.08) 80%, #03030e 100%)",
          }}
        />
        {/* Top fade */}
        <div
          className="absolute inset-x-0 top-0 h-40"
          style={{
            background: "linear-gradient(180deg, #03030e 0%, transparent 100%)",
          }}
        />
        {/* Bottom fade — strong, melts into door section */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "52%",
            background:
              "linear-gradient(0deg, #03030e 0%, #03030e 30%, rgba(3,3,14,0.88) 60%, transparent 100%)",
          }}
        />

        {/* Subtle indigo ambient light in upper-left */}
        <div
          className="absolute top-0 left-0 w-1/2 h-2/3 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 30%, rgba(123,143,255,0.09) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Top — badge */}
        <div className="pt-10 px-6 sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-5 rounded-full flex items-center justify-center"
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
        </div>

        {/* Middle — headline + copy */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 max-w-xl pt-10 pb-0">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="font-display font-bold leading-[1.08] text-white mb-5"
            style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}
          >
            Nothing held back.
            <br />
            <span style={{ color: "#9baeff" }}>Heard only by you.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.65 }}
            className="text-sm sm:text-base leading-relaxed mb-8 max-w-sm"
            style={{ color: "rgba(255,255,255,0.52)" }}
          >
            You don't pick from a list. You describe exactly what you want — the character, the dynamic, how far it goes. It's written from scratch and narrated privately for you.
          </motion.p>

          {/* Room teaser chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap gap-2 mb-12"
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
        </div>

        {/* Bottom — door CTA + reassurance */}
        <div className="flex flex-col items-center gap-8 pb-14 px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
          >
            <PartiallyOpenDoor onEnter={onEnter} />
          </motion.div>

          {/* Ruled line + reassurance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div
              className="w-20 h-px"
              style={{ background: "rgba(123,143,255,0.18)" }}
            />
            <p
              className="text-xs tracking-wide"
              style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}
            >
              Private · Written fresh each time · Nothing leaves this room
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
