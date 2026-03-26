interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 80, className = "" }: LogoProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        overflow: "hidden",
        lineHeight: 0,
        flexShrink: 0,
      }}
      className={className}
    >
      <img
        src="/images/logo.png"
        alt="My Private Story"
        style={{
          height: `${height}px`,
          width: "auto",
          display: "block",
        }}
      />
    </span>
  );
}

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return <Logo height={size} className={className} />;
}
