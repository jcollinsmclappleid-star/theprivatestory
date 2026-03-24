interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 56, className = "" }: LogoProps) {
  return (
    <img
      src="/images/logo.png"
      alt="Custom Audio Stories"
      style={{ height: `${height}px`, width: "auto" }}
      className={className}
    />
  );
}

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return <Logo height={size} className={className} />;
}
