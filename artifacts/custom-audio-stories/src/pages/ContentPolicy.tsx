import { motion } from "framer-motion";
import { Link } from "wouter";
import { CheckCircle, XCircle, AlertTriangle, MessageSquare } from "lucide-react";

export default function ContentPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 py-16"
    >
      <div className="mb-12">
        <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
          Safety
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
          Content Policy
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          This platform is for adults. These rules exist to protect everyone — including you. They are enforced automatically, and violations are reviewed by humans.
        </p>
      </div>

      <div className="space-y-10">

        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">Permitted content</h2>
              <p className="text-muted-foreground text-sm">What you can ask for.</p>
            </div>
          </div>
          <div className="pl-14 space-y-2">
            {[
              "Consensual sexual and romantic content between adult characters",
              "Fantasy scenarios involving fictional adult characters (human or humanoid)",
              "A wide range of relationship dynamics, intensities, and themes — including those labelled 'After Dark'",
              "Custom scenarios, character names, and story settings of your choosing",
              "All pairings: m/f, f/f, m/m, and non-binary",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 py-2 border-b border-border/20 last:border-0">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500/80 flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">Prohibited content</h2>
              <p className="text-muted-foreground text-sm">These are absolute limits. There are no exceptions.</p>
            </div>
          </div>
          <div className="pl-14 space-y-2">
            {[
              {
                item: "Sexual content involving anyone under 18",
                detail: "This includes ambiguous-age characters in sexual contexts. Any such request is immediately blocked, logged, and may be reported to NCMEC (US) and the Internet Watch Foundation (UK).",
                critical: true,
              },
              {
                item: "Non-consensual sexual scenarios depicted approvingly",
                detail: "Content that presents sexual assault, coercion, or non-consent as erotic or acceptable is prohibited.",
                critical: true,
              },
              {
                item: "Real, identifiable individuals in sexual scenarios",
                detail: "Named celebrities, public figures, or any real person. Fictional characters named after real people are also not permitted.",
                critical: false,
              },
              {
                item: "Bestiality and zoophilia",
                detail: "Sexual content involving animals in any form.",
                critical: true,
              },
              {
                item: "Necrophilia",
                detail: "Sexual content involving death or the deceased.",
                critical: true,
              },
              {
                item: "Content designed to harass or threaten specific individuals",
                detail: "Stories created to intimidate, stalk, or harm a real person.",
                critical: false,
              },
            ].map(({ item, detail, critical }) => (
              <div key={item} className={`rounded-xl p-4 ${critical ? "bg-red-500/5 border border-red-500/20" : "glass-panel"}`}>
                <div className="flex items-start gap-2 mb-1">
                  <XCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${critical ? "text-red-500" : "text-red-400/60"}`} />
                  <p className={`font-semibold text-sm ${critical ? "text-foreground" : "text-foreground/80"}`}>{item}</p>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed pl-6">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">How we enforce these rules</h2>
            </div>
          </div>
          <div className="pl-14 space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>
              <strong className="text-foreground/80">Automatic filtering</strong> — All inputs pass through multiple automated safety layers before a story is generated. Prohibited requests are blocked immediately.
            </p>
            <p>
              <strong className="text-foreground/80">Output review</strong> — Generated content is reviewed by AI safety classifiers before it reaches you. Stories that fail safety checks are not delivered.
            </p>
            <p>
              <strong className="text-foreground/80">Account termination</strong> — Repeated violations or any attempt to circumvent our safety systems results in permanent account termination. Circumvention attempts include: coded language, character substitution (e.g. replacing letters with numbers), Unicode lookalike characters, and prompt injection.
            </p>
            <p>
              <strong className="text-foreground/80">Legal reporting</strong> — We are legally required to report suspected child sexual abuse material (CSAM) to the National Center for Missing &amp; Exploited Children (NCMEC) CyberTipline and the Internet Watch Foundation (IWF). We do this. Blocking evidence of such reports is also illegal — account deletion requests will not remove preserved safety evidence.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">Appeals</h2>
            </div>
          </div>
          <div className="pl-14 text-muted-foreground text-sm leading-relaxed">
            <p className="mb-3">
              If you believe your account was terminated or a request was blocked in error, you may appeal by emailing <a href="mailto:safety@theprivatestory.com" className="text-primary hover:underline">safety@theprivatestory.com</a>. Include your account email and a brief description of the issue. We will respond within 5 business days.
            </p>
            <p>
              <strong className="text-foreground/80">Note:</strong> Appeals are not available for violations involving prohibited content related to minors or non-consensual content. These are final.
            </p>
          </div>
        </section>

        <div className="glass-panel rounded-2xl p-6 border-amber-500/20 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500/80 mx-auto mb-3" />
          <p className="text-foreground/80 font-semibold text-sm mb-2">See something that shouldn't be here?</p>
          <p className="text-muted-foreground text-sm mb-4">
            If a story generated on this platform contains content that appears to violate this policy, please report it.
          </p>
          <a
            href="mailto:safety@theprivatestory.com"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Report a safety concern
          </a>
        </div>

        <div className="text-center pt-4 flex gap-6 justify-center">
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Back to home</Link>
        </div>

      </div>
    </motion.div>
  );
}
