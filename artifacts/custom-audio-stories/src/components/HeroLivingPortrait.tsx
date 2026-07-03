import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const BASE = import.meta.env.BASE_URL;
const HERO_POSTER = `${BASE}images/home-hero-woman.webp?v=11`;
const HERO_VIDEO_WEBM = `${BASE}images/home-hero-loop.webm?v=3`;
const HERO_VIDEO_MP4 = `${BASE}images/home-hero-loop.mp4?v=3`;

/** Soft feather only where the image meets the headline — full scene stays visible. */
const MASK_STYLE = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 6%, black 14%, black 100%)",
  maskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 6%, black 14%, black 100%)",
} as const;

/**
 * Cinematic hero portrait — muted looped video with candlelight overlay and
 * soft parallax. Falls back to Ken Burns on the still if video fails to load.
 */
export function HeroLivingPortrait() {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const useVideo = !reduceMotion && !videoFailed;

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 14;
      const ny = (e.clientY / window.innerHeight - 0.5) * 10;
      setParallax({ x: nx, y: ny });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduceMotion]);

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

  const mediaClassName =
    "w-full h-full object-cover object-center opacity-[0.58] sm:opacity-[0.96]";

  return (
    <div
      aria-hidden
      className="absolute inset-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[68%] lg:w-[72%] overflow-hidden pointer-events-none select-none"
    >
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 72% 38%, rgba(201,162,39,0.14) 0%, transparent 52%)",
        }}
      />

      <motion.div
        className="absolute inset-[-2%] sm:inset-0"
        style={{
          x: reduceMotion ? 0 : parallax.x,
          y: reduceMotion ? 0 : parallax.y,
        }}
        animate={
          useVideo
            ? undefined
            : reduceMotion
              ? undefined
              : {
                  scale: [1.06, 1.11, 1.08, 1.12],
                  x: [0, -12, 6, 0],
                  y: [0, 8, -4, 0],
                }
        }
        transition={
          useVideo || reduceMotion
            ? undefined
            : {
                duration: 22,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }
        }
      >
        {useVideo ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_POSTER}
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
            className={mediaClassName}
            style={{
              ...MASK_STYLE,
              opacity: videoReady ? undefined : 0,
            }}
          >
            <source src={HERO_VIDEO_WEBM} type="video/webm" />
            <source src={HERO_VIDEO_MP4} type="video/mp4" />
          </video>
        ) : null}

        {(!useVideo || !videoReady) && (
          <picture className={useVideo && !videoReady ? "absolute inset-0" : undefined}>
            <source type="image/webp" srcSet={HERO_POSTER} />
            <img
              src={HERO_POSTER}
              alt=""
              width={1200}
              height={1600}
              loading="eager"
              decoding="async"
              className={mediaClassName}
              style={MASK_STYLE}
            />
          </picture>
        )}
      </motion.div>

      {!reduceMotion && (
        <>
          <motion.div
            className="absolute inset-0 z-[2] mix-blend-soft-light"
            animate={{ opacity: [0.15, 0.38, 0.22, 0.42, 0.18] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle at 68% 42%, rgba(255,190,120,0.55) 0%, transparent 38%)",
            }}
          />
          <motion.div
            className="absolute inset-0 z-[2] mix-blend-soft-light"
            animate={{ opacity: [0.08, 0.28, 0.12, 0.32, 0.1] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            style={{
              background:
                "radial-gradient(circle at 58% 55%, rgba(201,162,39,0.45) 0%, transparent 45%)",
            }}
          />
        </>
      )}

      {!reduceMotion && !useVideo && (
        <motion.div
          className="absolute z-[3] w-[18%] h-[28%] right-[8%] top-[38%] opacity-[0.12] sm:opacity-[0.22]"
          animate={{ rotate: [-2.5, 2.5, -1.5, 2.8], y: [0, 6, -4, 5] }}
          transition={{ duration: 7, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(201,162,39,0.9) 48%, rgba(255,220,160,0.7) 52%, transparent 60%)",
            filter: "blur(1px)",
          }}
        />
      )}

      <div
        className="absolute inset-0 z-[4]"
        style={{
          background:
            "linear-gradient(to top, hsl(var(--background)) 0%, transparent 22%), linear-gradient(to left, hsl(var(--background)) 0%, transparent 18%)",
        }}
      />
    </div>
  );
}
