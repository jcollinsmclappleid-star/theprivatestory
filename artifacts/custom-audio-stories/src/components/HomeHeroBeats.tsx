import { PenLine, Headphones, Lock } from "lucide-react";

const BEATS = [
  { icon: PenLine, label: "You choose", sub: "who, tension, heat" },
  { icon: Headphones, label: "We narrate", sub: "full-cast audio" },
  { icon: Lock, label: "~10 min", sub: "private to you" },
] as const;

export function HomeHeroBeats({ className = "" }: { className?: string }) {
  return (
    <ul
      className={`grid grid-cols-3 gap-2 sm:gap-3 max-w-md sm:max-w-lg mx-auto md:mx-0 ${className}`}
      aria-label="How it works"
    >
      {BEATS.map(({ icon: Icon, label, sub }) => (
        <li
          key={label}
          className="flex flex-col items-center text-center rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2.5 sm:px-3 sm:py-3"
        >
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/85 mb-1.5" aria-hidden />
          <span className="text-[11px] sm:text-xs font-bold text-white/90 leading-tight">{label}</span>
          <span className="text-[9px] sm:text-[10px] text-white/50 leading-snug mt-0.5">{sub}</span>
        </li>
      ))}
    </ul>
  );
}
