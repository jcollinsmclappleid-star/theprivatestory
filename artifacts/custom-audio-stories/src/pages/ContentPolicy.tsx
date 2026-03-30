import { motion } from "framer-motion";
import { Link } from "wouter";
import { CheckCircle, XCircle, AlertTriangle, MessageSquare, Download } from "lucide-react";

export default function ContentPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-4 py-16"
    >
      <div className="mb-12">
        <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
          Safety
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
          Content Policy
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          <strong>Effective date:</strong> March 2025 | <strong>Last updated:</strong> March 2025
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed mt-3">
          The Private Story is a private, personalised audio storytelling service for adults. This policy defines what content is allowed and how we enforce these boundaries.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 border-primary/20 bg-primary/5 mb-12">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Full Content Policy Document</p>
            <p className="text-xs text-muted-foreground mb-3">
              For a complete and detailed version of this policy, please download our full Content Policy document (PDF).
            </p>
            <a 
              href="/documents/content-policy.pdf" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              download
            >
              <Download className="w-4 h-4" />
              Download Full Document
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-10">

        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">1. Adults only</h2>
            </div>
          </div>
          <div className="pl-14 space-y-3 text-muted-foreground text-sm leading-relaxed">
            <p>The Private Story is intended for adults aged 18 and over only.</p>
            <p>You must not use the service if you are under 18. You must not use the service to request, generate, simulate, or refer to <strong className="text-foreground/80">any content involving anyone under 18</strong>, regardless of how it is framed.</p>
            <p>This includes any attempt to suggest, imply, code, roleplay, or disguise underage content indirectly through age ambiguity or euphemistic language.</p>
          </div>
        </section>

        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">2. What the service is for</h2>
            </div>
          </div>
          <div className="pl-14 space-y-3">
            <div>
              <p className="text-foreground/80 font-semibold text-sm mb-2">Intended for:</p>
              <ul className="space-y-1">
                {[
                  "Fictional, personalised storytelling for adults",
                  "Private, personal listening and reading experiences",
                  "Emotionally immersive, intimate audio stories",
                  "Consensual romantic and adult themes within lawful boundaries",
                  "All adult pairings: m/f, f/f, m/m, and non-binary characters",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500/80 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-foreground/80 font-semibold text-sm mb-2">Not intended for:</p>
              <ul className="space-y-1">
                {[
                  "Illegal, unlawful, or abusive content",
                  "Public publishing or content distribution",
                  "Harassment, intimidation, or harmful targeting",
                  "Attempts to bypass or evade moderation systems",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <XCircle className="w-3.5 h-3.5 text-red-500/60 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">3. Prohibited content (absolute limits)</h2>
              <p className="text-muted-foreground text-sm">These rules have no exceptions. Violations result in immediate action.</p>
            </div>
          </div>
          <div className="pl-14 space-y-3">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-1">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                <p className="font-semibold text-sm text-foreground">Minors or age ambiguity</p>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed pl-6">Sexual or sexualised content involving anyone under 18, school-age characters, "barely legal" framing, or any age-ambiguous content. Requests are immediately blocked and may be reported to NCMEC and the Internet Watch Foundation.</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-1">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                <p className="font-semibold text-sm text-foreground">Non-consensual, coercive, or exploitative content</p>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed pl-6">Sexual assault, coercion, pressure, manipulation, blackmail, abuse of vulnerability, exploitation, or any content where consent is absent, unclear, reluctant, or overridden.</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-1">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                <p className="font-semibold text-sm text-foreground">Abuse, violence, or criminal exploitation</p>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed pl-6">Sexual violence, abuse framed as intimacy, trafficking, incest, unlawful confinement, extortion, sadistic harm, or any content constituting illegal abuse.</p>
            </div>
            <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-1">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400/60" />
                <p className="font-semibold text-sm text-foreground/80">Real, identifiable individuals</p>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed pl-6">Named celebrities, public figures, or any real person in sexual scenarios. Fictional characters named after real people are also prohibited.</p>
            </div>
            <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-1">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400/60" />
                <p className="font-semibold text-sm text-foreground/80">Bestiality, necrophilia, or animals</p>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed pl-6">Sexual content involving animals or death in any form.</p>
            </div>
            <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-1">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400/60" />
                <p className="font-semibold text-sm text-foreground/80">Harassment and targeted harm</p>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed pl-6">Content designed to harass, threaten, intimidate, stalk, or harm a real person.</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">4. Content that may be restricted or regenerated</h2>
            </div>
          </div>
          <div className="pl-14 space-y-3 text-muted-foreground text-sm leading-relaxed">
            <p>Some content may not be fully prohibited, but may still be restricted, softened, or regenerated if it falls outside the intended tone of the service:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Too explicit or crude for the product's positioning</li>
              <li>Too aggressive, vulgar, or demeaning</li>
              <li>Inconsistent with an agency-led, mutual, adult tone</li>
              <li>Outside the selected category or emotional pacing</li>
              <li>Inconsistent with the premium, private, female-first brand direction</li>
            </ul>
            <p className="mt-3">The Private Story is designed around emotional quality, privacy, and intentionality. Content that breaks that experience may be moderated even if not unlawful.</p>
          </div>
        </section>

        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">5. Moderation and enforcement</h2>
            </div>
          </div>
          <div className="pl-14 space-y-4 text-muted-foreground text-sm leading-relaxed">
            <div>
              <p className="font-semibold text-foreground/80 mb-1">We use automated and human review to:</p>
              <ul className="list-disc list-inside space-y-0.5 text-sm">
                <li>Assess generation requests before they reach the AI</li>
                <li>Review generated outputs before delivery</li>
                <li>Block, alter, regenerate, or remove stories</li>
                <li>Investigate reported content</li>
                <li>Record moderation outcomes</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground/80 mb-1">If content is blocked, we may:</p>
              <ul className="list-disc list-inside space-y-0.5 text-sm">
                <li>Stop the generation request immediately</li>
                <li>Prevent the story from being shown or converted to audio</li>
                <li>Regenerate all or part of the story</li>
                <li>Remove the story from your private library</li>
                <li>Flag your account for review</li>
                <li>Restrict or suspend access</li>
                <li>Keep internal moderation records</li>
              </ul>
            </div>
            <p className="mt-3 text-xs">
              <strong className="text-foreground/80">Note:</strong> Private stories are not exempt from moderation. Content in your private library may be reviewed where reported, flagged, or where policy breach is suspected.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">6. Evasion and circumvention</h2>
            </div>
          </div>
          <div className="pl-14 space-y-2 text-muted-foreground text-sm leading-relaxed">
            <p>Any attempt to bypass our moderation systems will result in immediate and permanent account termination. This includes:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Coded language or indirect phrasing to evade filters</li>
              <li>Character substitution (numbers for letters, Unicode lookalikes)</li>
              <li>Deliberately combining selections to produce prohibited content</li>
              <li>Repeated attempts to generate blocked themes</li>
              <li>Prompt injection or jailbreak attempts</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">7. Reporting and appeals</h2>
            </div>
          </div>
          <div className="pl-14 space-y-3 text-muted-foreground text-sm leading-relaxed">
            <p><strong className="text-foreground/80">You can report stories</strong> that appear to violate this policy. When you report, we will review the story, the selections used, and moderation records to determine if action is needed.</p>
            <p><strong className="text-foreground/80">Account appeals:</strong> If you believe your account was terminated or a request was blocked in error, you may appeal by emailing <a href="mailto:support@theprivatestory.co.uk" className="text-primary hover:underline">support@theprivatestory.co.uk</a>. Include your account email and a brief description of the issue. We will respond within 5 business days.</p>
            <p><strong className="text-foreground/80 text-xs">Note:</strong> Appeals are not available for violations involving minors or non-consensual content. These are final.</p>
          </div>
        </section>

        <section>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">8. Legal compliance and reporting</h2>
            </div>
          </div>
          <div className="pl-14 space-y-3 text-muted-foreground text-sm leading-relaxed">
            <p>
              We are legally required to report suspected child sexual abuse material (CSAM) to the National Center for Missing &amp; Exploited Children (NCMEC) CyberTipline and the Internet Watch Foundation (IWF). <strong className="text-foreground/80">We do this.</strong>
            </p>
            <p>
              Attempts to delete accounts or request data deletion will not remove preserved safety evidence. Legal requests from law enforcement receive our full cooperation.
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
            href="mailto:support@theprivatestory.co.uk"
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
