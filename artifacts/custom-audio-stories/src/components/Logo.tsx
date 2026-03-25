interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 136, className = "" }: LogoProps) {
  return (
    <img
      src="/images/logo.png"
      alt="The Private Story"
      style={{
        height: `${height}px`,
        width: "auto",
        mixBlendMode: "lighten",
        display: "block",
        flexShrink: 0,
      }}
      className={className}
    />
  );
}

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return <Logo height={size} className={className} />;
}
