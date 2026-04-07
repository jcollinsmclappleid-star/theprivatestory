import { EyeOff, Lock, Ban, Trash2, ShieldCheck } from "lucide-react";

const COUNTRIES = [
  { flag: "🇺🇸", name: "United States" },
  { flag: "🇬🇧", name: "United Kingdom" },
  { flag: "🇦🇺", name: "Australia" },
  { flag: "🇨🇦", name: "Canada" },
  { flag: "🇮🇳", name: "India" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇳🇱", name: "Netherlands" },
  { flag: "🇫🇷", name: "France" },
  { flag: "🇸🇪", name: "Sweden" },
  { flag: "🇳🇿", name: "New Zealand" },
  { flag: "🇧🇷", name: "Brazil" },
  { flag: "🇯🇲", name: "Jamaica" },
  { flag: "🇳🇵", name: "Nepal" },
  { flag: "🇹🇭", name: "Thailand" },
  { flag: "🇲🇾", name: "Malaysia" },
  { flag: "🇻🇳", name: "Vietnam" },
  { flag: "🇨🇳", name: "China" },
  { flag: "🇦🇲", name: "Armenia" },
  { flag: "🇺🇦", name: "Ukraine" },
  { flag: "🇵🇰", name: "Pakistan" },
  { flag: "🇪🇸", name: "Spain" },
  { flag: "🇨🇱", name: "Chile" },
  { flag: "🇮🇹", name: "Italy" },
  { flag: "🇹🇷", name: "Turkey" },
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
                className="text-xl leading-none opacity-60 hover:opacity-100 transition-opacity duration-200 cursor-default"
                aria-label={c.name}
              >
                {c.flag}
              </span>
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
              <div className="mt-0.5 flex-shrink-0 text-primary/50">{item.icon}</div>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Stripe trust line */}
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
          <p className="text-xs text-muted-foreground/35 text-center">
            Payments processed securely by{" "}
            <span className="text-muted-foreground/55 font-medium">Stripe</span>
            {" "}— your card details never reach our servers
          </p>
        </div>

      </div>
    </section>
  );
}
