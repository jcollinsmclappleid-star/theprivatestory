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
        lineHeight: 0,
        flexShrink: 0,
      }}
      className={className}
    >
      <img
        src={`${import.meta.env.BASE_URL}images/logo.png`}
        alt="My Private Story"
        style={{
          height: `${height}px`,
          width: "auto",
          display: "block",
          mixBlendMode: "screen",
        }}
      />
    </span>
  );
}

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return <Logo height={size} className={className} />;
}
