import { motion } from "framer-motion";
import { Link } from "wouter";
import { DollarSign, AlertTriangle, CheckCircle, HelpCircle, Download, Mail } from "lucide-react";

export default function RefundPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-4 py-16"
    >
      <div className="mb-12">
        <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
          Billing
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
          Refund Policy
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          <strong>Effective date:</strong> March 2025 | <strong>Last updated:</strong> March 2025
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed mt-3">
          The Private Story is operated by <strong>Ianson System Ltd</strong> trading as <strong>The Private Story</strong>.<br />
          <strong>Billing inquiries:</strong> <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a>
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 border-primary/20 bg-primary/5 mb-12">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Full Refund Policy Document</p>
            <p className="text-xs text-muted-foreground mb-3">
              For a complete and detailed version of this policy, please download our full Refund Policy document (PDF).
            </p>
            <a 
              href="/documents/refund-policy.pdf" 
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

        <Section icon={<HelpCircle className="w-5 h-5 text-primary" />} iconBg="bg-primary/10 border-primary/20" title="1. About this policy">
          <p className="text-sm">The Private Story is a digital storytelling service providing subscriptions, curated content, personalised generation, and one-off purchases. Because we supply digital content, refund rules differ depending on whether you've started using the service.</p>
        </Section>

        <Section icon={<DollarSign className="w-5 h-5 text-emerald-500" />} iconBg="bg-emerald-500/10 border-emerald-500/20" title="2. General principle">
          <p className="text-sm mb-2"><strong>We aim to be fair and transparent.</strong></p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
            <li><strong className="text-foreground/80">Before use begins:</strong> Cancellation rights are broader.</li>
            <li><strong className="text-foreground/80">Once access starts:</strong> Refund rights may be reduced or lost.</li>
            <li><strong className="text-foreground/80">Once a story is generated:</strong> Normally non-refundable.</li>
          </ul>
        </Section>

        <Section icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} iconBg="bg-amber-500/10 border-amber-500/20" title="3. Subscription plans">
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-foreground/80 mb-1">Monthly subscriptions:</p>
              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-sm">
                <li>Active until the end of the paid billing period.</li>
                <li>No charge if cancelled before renewal.</li>
                <li>No pro-rata refund for unused time in a started month, except where required by law.</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground/80 mb-1">Annual subscriptions:</p>
              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-sm">
                <li>Access for the full annual term.</li>
                <li>Will not renew if cancelled before expiry.</li>
                <li>No partial refund for unused remainder once access has begun, except where required by law.</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section icon={<DollarSign className="w-5 h-5 text-blue-400" />} iconBg="bg-blue-500/10 border-blue-500/20" title="4. Additional story purchases">
          <p className="text-sm mb-2">One-off purchases are normally <strong>non-refundable</strong> once generated. Exceptions:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
            <li>Purchase made in error.</li>
            <li>Billing error on our part.</li>
            <li>Story failed to generate due to our technical issue.</li>
            <li>Consumer law requires a refund.</li>
          </ul>
        </Section>

        <Section icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} iconBg="bg-amber-500/10 border-amber-500/20" title="5. Cooling-off rights and immediate access">
          <p className="text-sm mb-2">
            You may have legal cancellation rights for online purchases, but these can be affected when digital content is supplied immediately.
          </p>
          <p className="text-sm mb-2">
            At checkout, you confirm you want immediate access and understand that cancellation rights may be reduced or lost once supply begins.
          </p>
          <p className="text-sm font-semibold text-foreground/80 mb-1">Supply begins when:</p>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-sm">
            <li>Your subscription is activated.</li>
            <li>You access curated collection content.</li>
            <li>A story is generated for your account.</li>
            <li>Content is delivered to your library.</li>
          </ul>
        </Section>

        <Section icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} iconBg="bg-emerald-500/10 border-emerald-500/20" title="6. Revoked post generation">
          <p className="text-sm mb-2">
            Once a personalised story is generated, that generation is treated as <strong>used digital supply</strong>. Your refund right is normally revoked unless required by law or we choose to make an exception.
          </p>
          <p className="text-sm mb-2">
            We normally do not refund simply because you changed your mind, didn't like the tone, or decided not to listen.
          </p>
          <p className="text-sm font-semibold text-foreground/80">We may offer:</p>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-sm mt-1">
            <li>A goodwill regeneration.</li>
            <li>A replacement generation credit.</li>
            <li>A partial or full refund where we are responsible for a technical issue.</li>
          </ul>
        </Section>

        <Section icon={<AlertTriangle className="w-5 h-5 text-red-500" />} iconBg="bg-red-500/10 border-red-500/20" title="7. When refunds are unlikely">
          <p className="text-sm mb-1">Unless required by law, refunds will normally be refused where:</p>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-sm">
            <li>You accessed paid content after checkout with valid consent.</li>
            <li>You used story generations or curated content.</li>
            <li>A story was generated and added to your account.</li>
            <li>You purchased and used an additional story.</li>
            <li>You're changing your mind after using the service.</li>
            <li>The issue relates only to personal preference, not a product failure.</li>
          </ul>
        </Section>

        <Section icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} iconBg="bg-emerald-500/10 border-emerald-500/20" title="8. When refunds may be considered">
          <p className="text-sm mb-1">We may consider a refund where:</p>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-sm">
            <li>You were charged twice.</li>
            <li>You were charged after cancelling correctly before renewal.</li>
            <li>There was a clear pricing or billing error.</li>
            <li>A generation failed due to our technical issue and no output was supplied.</li>
            <li>A paid feature was unavailable for a material period due to our fault.</li>
            <li>There was a serious product defect affecting your use.</li>
            <li>Consumer law requires a refund.</li>
          </ul>
        </Section>

        <Section icon={<HelpCircle className="w-5 h-5 text-primary" />} iconBg="bg-primary/10 border-primary/20" title="9. Failed generations and technical issues">
          <p className="text-sm mb-2">
            If a generation fails due to our technical issue, we will usually try to resolve it by regenerating, restoring the output, returning the generation entitlement, or issuing a replacement credit.
          </p>
          <p className="text-sm">If we cannot reasonably provide the service, we may issue a refund or account credit.</p>
        </Section>

        <Section icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} iconBg="bg-amber-500/10 border-amber-500/20" title="10. Moderation and blocked generations">
          <p className="text-sm mb-2">
            If a generation is blocked, regenerated, or withheld due to moderation or policy rules, we may restore the generation entitlement or invite you to try again with adjusted selections.
          </p>
          <p className="text-sm">
            We are not required to refund a subscription simply because a requested generation was not allowed. If we remove a story post-generation due to moderation, we decide on a case-by-case basis whether to replace it, return the credit, or take no action.
          </p>
        </Section>

        <Section icon={<DollarSign className="w-5 h-5 text-blue-400" />} iconBg="bg-blue-500/10 border-blue-500/20" title="11. Automatic renewals and cancellation">
          <p className="text-sm mb-2">
            You are responsible for cancelling before renewal if you don't want the next billing period.
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-sm">
            <li>The current period remains active if you cancel after renewal.</li>
            <li>Cancellation usually applies to the next renewal.</li>
            <li>Refunds for a renewed period are not usually available unless required by law.</li>
          </ul>
        </Section>

        <Section icon={<DollarSign className="w-5 h-5 text-emerald-500" />} iconBg="bg-emerald-500/10 border-emerald-500/20" title="12. Free trials and introductory offers">
          <p className="text-sm">
            Once a trial or introductory period converts to paid subscription, standard billing and refund terms apply. You remain responsible for cancelling before conversion if you don't want to continue.
          </p>
        </Section>

        <Section icon={<Mail className="w-5 h-5 text-primary" />} iconBg="bg-primary/10 border-primary/20" title="13. How to request a refund">
          <p className="text-sm mb-2">Contact us at <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a> with:</p>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-sm">
            <li>Your account email address.</li>
            <li>Your order or subscription details.</li>
            <li>The date of the charge.</li>
            <li>A brief explanation of the issue.</li>
          </ul>
        </Section>

        <Section icon={<HelpCircle className="w-5 h-5 text-primary" />} iconBg="bg-primary/10 border-primary/20" title="14. How we assess requests">
          <p className="text-sm">When reviewing a refund request, we consider whether it was a subscription or one-off purchase, whether access began, whether a story was generated, whether the service was used, whether there was a billing error, and whether the issue was technical or policy-related.</p>
        </Section>

        <Section icon={<DollarSign className="w-5 h-5 text-emerald-500" />} iconBg="bg-emerald-500/10 border-emerald-500/20" title="15. Timing of refunds">
          <p className="text-sm">
            Where a refund is due, we aim to process it promptly. Refunds are usually made within 14 days using the same payment method used for the original transaction.
          </p>
        </Section>

        <Section icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} iconBg="bg-amber-500/10 border-amber-500/20" title="16. Chargebacks and disputes">
          <p className="text-sm mb-2">
            Please contact us first to resolve billing issues. If you initiate a chargeback without contacting us, we may investigate, suspend access, and restrict future purchases.
          </p>
          <p className="text-sm text-xs">This does not affect your legal rights.</p>
        </Section>

        <Section icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} iconBg="bg-emerald-500/10 border-emerald-500/20" title="17. Your statutory rights">
          <p className="text-sm">
            This policy does not remove or limit any rights you have under consumer law. If the law gives you a right to a refund, repair, repeat performance, or other remedy, this policy is read subject to those rights.
          </p>
        </Section>

        <Section icon={<Mail className="w-5 h-5 text-primary" />} iconBg="bg-primary/10 border-primary/20" title="18. Contact">
          <p className="text-sm">
            For refund, billing, or cancellation queries, contact:<br />
            <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a>
          </p>
        </Section>

        <div className="text-center pt-4 flex gap-6 justify-center flex-wrap">
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/content-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Content Policy</Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Back to home</Link>
        </div>

      </div>
    </motion.div>
  );
}

function Section({
  icon,
  iconBg,
  title,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
          {icon}
        </div>
        <h2 className="font-display text-lg font-bold text-foreground pt-2">{title}</h2>
      </div>
      <div className="pl-14 text-muted-foreground text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}
