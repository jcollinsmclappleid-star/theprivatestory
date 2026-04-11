import "flag-icons/css/flag-icons.min.css";
import { EyeOff, Lock, Ban, Trash2, ShieldCheck } from "lucide-react";

const COUNTRIES = [
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "au", name: "Australia" },
  { code: "ca", name: "Canada" },
  { code: "in", name: "India" },
  { code: "de", name: "Germany" },
  { code: "nl", name: "Netherlands" },
  { code: "fr", name: "France" },
  { code: "se", name: "Sweden" },
  { code: "nz", name: "New Zealand" },
  { code: "br", name: "Brazil" },
  { code: "jm", name: "Jamaica" },
  { code: "np", name: "Nepal" },
  { code: "th", name: "Thailand" },
  { code: "my", name: "Malaysia" },
  { code: "vn", name: "Vietnam" },
  { code: "cn", name: "China" },
  { code: "am", name: "Armenia" },
  { code: "ua", name: "Ukraine" },
  { code: "pk", name: "Pakistan" },
  { code: "es", name: "Spain" },
  { code: "cl", name: "Chile" },
  { code: "it", name: "Italy" },
  { code: "tr", name: "Turkey" },
];

const TRUST_ITEMS = [
  {
    icon: <EyeOff className="w-4 h-4" />,
    text: "No social features. No public profiles. No shared listening history.",
  },
  {
    icon: <Lock className="w-4 h-4" />,
    text: "Your stories are visible to no one else — including us.",
  },
  {
    icon: <Ban className="w-4 h-4" />,
    text: "We don't run ads. We don't sell your data.",
  },
  {
    icon: <Trash2 className="w-4 h-4" />,
    text: "Delete your account and everything in it — instantly, any time.",
  },
];

// ── CountryStrip — compact reusable flag strip (no privacy cards) ─────────────
export function CountryStrip({ className }: { className?: string }) {
  return (
    <div className={`text-center ${className ?? ""}`}>
      <p
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.20)",
          marginBottom: "10px",
        }}
      >
        Discovered across {COUNTRIES.length} countries
      </p>
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1.5">
        {COUNTRIES.map((c) => (
          <span
            key={c.name}
            title={c.name}
            className={`fi fi-${c.code}`}
            aria-label={c.name}
            style={{
              width: "1.25em",
              height: "1em",
              borderRadius: "2px",
              opacity: 0.5,
              display: "inline-block",
              transition: "opacity 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
          />
        ))}
      </div>
    </div>
  );
}

// ── TrustBar — full section (flag strip + privacy cards + Stripe line) ────────
export function TrustBar() {
  return (
    <section className="w-full py-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Country discovery */}
        <div className="text-center">
          <p
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)",
              marginBottom: "14px",
            }}
          >
            Discovered across {COUNTRIES.length} countries
          </p>
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1.5">
            {COUNTRIES.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className={`fi fi-${c.code}`}
                aria-label={c.name}
                style={{
                  width: "1.4em",
                  height: "1.05em",
                  borderRadius: "2px",
                  opacity: 0.6,
                  display: "inline-block",
                  transition: "opacity 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-border/30 mx-auto" />

        {/* Privacy statements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border/20 bg-white/[0.02] px-4 py-3.5"
            >
              <div className="mt-0.5 flex-shrink-0 text-primary/70">{item.icon}</div>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Stripe trust line */}
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/80 flex-shrink-0" />
          <p className="text-xs text-muted-foreground/80 text-center">
            Payments processed securely by{" "}
            <span className="text-muted-foreground/80 font-medium">Stripe</span>
            {" "}— your card details never reach our servers
          </p>
        </div>

      </div>
    </section>
  );
}
