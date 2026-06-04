import { EyeOff, Lock, Ban, Trash2, ShieldCheck, Globe } from "lucide-react";

const COUNTRY_COUNT = 55;

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

// ── CountryStrip — compact single-line stat (used in paywall / create) ────────
export function CountryStrip({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className ?? ""}`}>
      <Globe
        style={{ width: "13px", height: "13px", color: "rgba(255,255,255,0.50)", flexShrink: 0 }}
      />
      <p
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.50)",
        }}
      >
        Discovered by listeners across {COUNTRY_COUNT} countries
      </p>
    </div>
  );
}

// ── TrustBar — full section (country stat + privacy cards + Stripe line) ──────
export function TrustBar() {
  return (
    <section className="w-full py-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Country stat */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2.5">
            <Globe className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              Global reach
            </span>
          </div>
          <p
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "rgba(255,255,255,0.90)",
              lineHeight: 1.1,
            }}
          >
            Discovered by listeners<br />across {COUNTRY_COUNT} countries
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.04em",
            }}
          >
            From the US and UK to Australia, Canada, Germany, the Netherlands, and beyond.
          </p>
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
