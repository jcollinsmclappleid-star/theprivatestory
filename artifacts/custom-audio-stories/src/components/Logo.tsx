interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 36, showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="18" cy="18" r="17" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.25" />

        <circle cx="18" cy="11" r="3.5" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />

        <path
          d="M12 22c0-3.314 2.686-6 6-6s6 2.686 6 6"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <line x1="18" y1="22" x2="18" y2="28" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="25" x2="21" y2="25" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />

        <path
          d="M22 20 L27 15 L29 17 L24 22 L22 22 Z"
          fill="hsl(var(--primary))"
          fillOpacity="0.85"
        />
        <line x1="26" y1="16" x2="28" y2="18" stroke="hsl(var(--background))" strokeWidth="0.7" />
        <path d="M27 15 L29 13 L30 15 L29 17 Z" fill="hsl(var(--primary))" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-bold tracking-wide text-foreground">
            Custom<span className="text-primary"> Audio</span>
          </span>
          <span className="font-display text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Stories
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return <Logo size={size} showText={false} className={className} />;
}
