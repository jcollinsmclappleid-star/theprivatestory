import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const BASE = import.meta.env.BASE_URL;
const POSTER = `${BASE}images/creation-room-frame-2.png?v=1`;
const VIDEO_WEBM = `${BASE}images/creation-room-loop.webm?v=2`;
const VIDEO_MP4 = `${BASE}images/creation-room-loop.mp4?v=2`;

const MASK_STYLE = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 5%, black 12%, black 100%)",
  maskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 5%, black 12%, black 100%)",
} as const;

interface CreationRoomHeroProps {
  /** Full-bleed mobile background vs right-rail desktop */
  variant?: "mobile" | "desktop";
}

/**
 * Creation Room hero — full scene with kneeling men visible, AI morph loop
 * (hand reaches to cup his head), candlelit spotlight overlay.
 */
export function CreationRoomHero({ variant = "desktop" }: CreationRoomHeroProps) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const useVideo = !reduceMotion && !videoFailed;
  const isMobile = variant === "mobile";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion || videoFailed) return;

    const play = () => {
      void video.play().catch(() => setVideoFailed(true));
    };

    if (video.readyState >= 2) play();
    else video.addEventListener("loadeddata", play, { once: true });

    return () => video.removeEventListener("loadeddata", play);
  }, [reduceMotion, videoFailed]);

  const mediaClassName = isMobile
    ? "absolute inset-0 w-full h-full object-cover object-center opacity-[0.62]"
    : "w-full h-full object-cover object-center opacity-[0.96]";

  return (
    <div
      aria-hidden
      className={
        isMobile
          ? "absolute inset-0 pointer-events-none select-none"
          : "absolute inset-y-0 right-0 w-full sm:w-[68%] lg:w-[72%] overflow-hidden pointer-events-none select-none"
      }
    >
      {!isMobile && (
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse at 55% 35%, rgba(201,162,39,0.18) 0%, transparent 55%)",
          }}
        />
      )}

      <div className={isMobile ? "absolute inset-0" : "absolute inset-0 sm:inset-[-1%]"}>
        {useVideo ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={POSTER}
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
            className={mediaClassName}
            style={{
              ...(!isMobile ? MASK_STYLE : undefined),
              opacity: videoReady ? undefined : 0,
            }}
          >
            <source src={VIDEO_WEBM} type="video/webm" />
            <source src={VIDEO_MP4} type="video/mp4" />
          </video>
        ) : null}

        {(!useVideo || !videoReady) && (
          <img
            src={POSTER}
            alt=""
            className={mediaClassName}
            style={!isMobile ? MASK_STYLE : undefined}
          />
        )}
      </div>

      {!reduceMotion && (
        <motion.div
          className="absolute inset-0 z-[2] mix-blend-soft-light pointer-events-none"
          animate={{ opacity: [0.12, 0.32, 0.15, 0.28, 0.12] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(circle at 52% 28%, rgba(255,200,120,0.5) 0%, transparent 42%)",
          }}
        />
      )}

      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          background: isMobile
            ? "linear-gradient(180deg, #080604 0%, rgba(8,6,4,0.45) 22%, rgba(8,6,4,0.2) 48%, rgba(8,6,4,0.5) 78%, #080604 100%)"
            : "linear-gradient(to top, #080604 0%, transparent 20%), linear-gradient(to left, #080604 0%, transparent 16%)",
        }}
      />
    </div>
  );
}
