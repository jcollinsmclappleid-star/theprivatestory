type Slide = {
  src: string;
  objectPosition?: string;
};

type Props = {
  slides: Slide[];
  activeIndex: number;
  className?: string;
  imgClassName?: string;
};

/** Crossfade between preloaded images — no AnimatePresence wait flash. */
export function Act4Crossfade({ slides, activeIndex, className = "absolute inset-0", imgClassName }: Props) {
  const baseImg =
    imgClassName ??
    "absolute inset-0 w-full h-full object-cover brightness-[1.05] contrast-[1.04] transition-opacity duration-[650ms] ease-in-out will-change-[opacity]";

  return (
    <div className={className} aria-hidden>
      {slides.map((slide, i) => (
        <img
          key={slide.src}
          src={slide.src}
          alt=""
          decoding="async"
          fetchPriority={i === 0 ? "high" : "low"}
          className={baseImg}
          style={{
            objectPosition: slide.objectPosition ?? "center",
            opacity: i === activeIndex ? 1 : 0,
            zIndex: i === activeIndex ? 2 : 1,
          }}
        />
      ))}
    </div>
  );
}

type DotsProps = {
  count: number;
  active: number;
  accent?: string;
  className?: string;
};

export function SlideProgressDots({ count, active, accent = "#c9a227", className }: DotsProps) {
  if (count <= 1) return null;
  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="h-1 rounded-full transition-all duration-300"
          style={{
            width: i === active ? 18 : 6,
            background: i === active ? accent : "rgba(255,255,255,0.25)",
          }}
        />
      ))}
    </div>
  );
}
