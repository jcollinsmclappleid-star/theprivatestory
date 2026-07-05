const STEPS = [
  { n: 1, label: "Fantasy", href: "#creation-step-fantasy" },
  { n: 2, label: "Heat", href: "#creation-step-intensity" },
  { n: 3, label: "Situation", href: "#creation-step-situation" },
  { n: 4, label: "Yours", href: "#creation-step-desires" },
] as const;

interface CreationStepRailProps {
  className?: string;
}

export function CreationStepRail({ className = "" }: CreationStepRailProps) {
  return (
    <nav
      aria-label="Create your story steps"
      className={`flex items-center gap-1 sm:gap-2 ${className}`}
    >
      {STEPS.map((step, i) => (
        <div key={step.n} className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
          <a
            href={step.href}
            className="flex flex-col items-center gap-1 flex-1 min-w-0 group"
          >
            <span className="flex items-center justify-center w-8 h-8 sm:w-6 sm:h-6 rounded-full border border-primary/35 bg-primary/10 text-[11px] sm:text-[10px] font-bold text-primary group-hover:bg-primary/20 group-active:scale-95 transition-all">
              {step.n}
            </span>
            <span className="text-[9px] sm:text-[9px] font-bold uppercase tracking-wider text-white/55 group-hover:text-primary/80 transition-colors truncate w-full text-center">
              {step.label}
            </span>
          </a>
          {i < STEPS.length - 1 && (
            <span className="w-3 sm:w-6 h-px bg-white/12 shrink-0 mb-4" aria-hidden />
          )}
        </div>
      ))}
    </nav>
  );
}

interface CreationStepHeaderProps {
  step: number;
  title: string;
  subtitle?: string;
  id?: string;
}

export function CreationStepHeader({ step, title, subtitle, id }: CreationStepHeaderProps) {
  return (
    <div id={id} className="scroll-mt-24">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary mb-1">
        Step {step} · {title}
      </p>
      {subtitle && (
        <p className="text-[13px] md:text-sm text-white/85 leading-snug mb-1">{subtitle}</p>
      )}
    </div>
  );
}
