import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Listen() {
  useSEO({
    title: "Choose your intensity — Sample stories — The Private Story",
    description:
      "The same premise. Two intensities. Hear what a personalised audio story sounds like before you build your own.",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.22em]">Sample stories</span>
        <Link
          href="/pricing"
          className="text-[11px] text-primary/80 hover:text-primary transition-colors tracking-widest uppercase"
        >
          Pricing →
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pb-12 max-w-lg mx-auto w-full">

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-10 mt-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60 mb-4">
            Editor's choice · Two stories
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
            The same premise.<br />Two intensities.
          </h1>
          <p className="text-sm text-white/55 leading-relaxed max-w-sm mx-auto">
            Both stories start in the same place — a stalled elevator in Montego Bay, 
            a man with a ring on his finger, a silence that's running out of room.
            Where they go next depends on which door you open.
          </p>
        </motion.div>

        {/* Shared premise card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="w-full rounded-2xl border border-primary/20 bg-primary/6 p-5 mb-8"
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-primary/50 mb-2">The shared situation</p>
          <p className="text-sm text-white/85 italic leading-relaxed mb-3">
            "He's engaged. The announcement was three weeks ago."
          </p>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/8">
            {[
              { label: "Setting",   value: "Moving Elevator" },
              { label: "World",     value: "Montego Bay" },
              { label: "Chemistry", value: "He Takes Charge" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-0.5">{label}</p>
                <p className="text-[11px] text-white/65 leading-snug">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Two doors */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full mb-3"
        >
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 mb-5">
            Select your intensity
          </p>
          <div className="flex flex-col gap-4">

            {/* Door 1 — The Private Story */}
            <Link href="/listen/private">
              <div className="group w-full rounded-2xl border border-white/15 bg-white/3 hover:bg-white/6
                              hover:border-white/30 transition-all duration-300 p-5 cursor-pointer
                              hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.12)]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl border border-white/15 bg-white/5
                                  flex items-center justify-center group-hover:border-white/30 transition-colors">
                    {/* Moon */}
                    <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">The Private Story</span>
                      <span className="text-[9px] text-white/25">·</span>
                      <span className="text-[9px] text-white/35">Warm intensity</span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-foreground leading-snug mb-1.5">
                      The Ring in the Mirror
                    </h2>
                    <p className="text-xs text-white/50 leading-relaxed">
                      He has a ring on his finger. The elevator has stalled. Neither of you mentions either.
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-white/25 group-hover:text-white/60 transition-colors mt-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/8">
                  <img
                    src={`${API_BASE}/api/images/cover-daa5ffac36e215afb98fc54761355b53.png`}
                    alt="The Ring in the Mirror"
                    className="w-10 h-10 rounded-lg object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                  <span className="text-[10px] text-white/35 group-hover:text-white/55 transition-colors">
                    Forbidden · 10 min · Clara · Soothing
                  </span>
                </div>
              </div>
            </Link>

            {/* Door 2 — After Dark */}
            <Link href="/listen/after-dark">
              <div className="group w-full rounded-2xl border border-[#e879a0]/20 bg-[#e879a0]/4
                              hover:bg-[#e879a0]/8 hover:border-[#e879a0]/40 transition-all duration-300 p-5
                              cursor-pointer hover:shadow-[0_0_40px_-12px_rgba(232,121,160,0.35)]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl border border-[#e879a0]/25 bg-[#e879a0]/10
                                  flex items-center justify-center group-hover:border-[#e879a0]/50 transition-colors">
                    {/* Flame */}
                    <svg className="w-5 h-5 text-[#e879a0]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#e879a0]/70">After Dark</span>
                      <span className="text-[9px] text-[#e879a0]/30">·</span>
                      <span className="text-[9px] text-[#e879a0]/50">Intense</span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-foreground leading-snug mb-1.5">
                      Gold Light, Cold Metal
                    </h2>
                    <p className="text-xs text-white/50 leading-relaxed">
                      He's promised to someone else. The gold light makes it easy to pretend otherwise.
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-[#e879a0]/30 group-hover:text-[#e879a0]/70 transition-colors mt-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#e879a0]/10">
                  <img
                    src={`${API_BASE}/api/images/cover-fc49bea83789fbfdf8b98e5042316d77.png`}
                    alt="Gold Light, Cold Metal"
                    className="w-10 h-10 rounded-lg object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                  <span className="text-[10px] text-[#e879a0]/40 group-hover:text-[#e879a0]/70 transition-colors">
                    Intense · 10 min · Kayla · Expressive
                  </span>
                </div>
              </div>
            </Link>

          </div>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center text-[10px] text-white/25 mt-4 leading-relaxed"
        >
          Both are editor's selections. Yours is written from scratch — around your cast,<br />
          your scene, your desire, your intensity.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8"
        >
          <Link
            href="/the-three-doors"
            className="block text-center text-xs text-primary/60 hover:text-primary transition-colors"
          >
            Create my story →
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-white/35 tracking-wide pb-8 px-6">
        Literary. Private. Entirely yours. ·{" "}
        <Link href="/privacy" className="hover:text-white/50 transition-colors">
          How we protect it →
        </Link>
      </p>
    </motion.div>
  );
}
