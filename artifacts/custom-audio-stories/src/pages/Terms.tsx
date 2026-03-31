import { motion } from "framer-motion";
import { Link } from "wouter";
import { FileText, Shield, AlertTriangle, Scale, Mail } from "lucide-react";

export default function Terms() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-4 py-16"
    >
      <div className="mb-12">
        <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
          Legal
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
          Terms and Conditions
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          <strong>Effective date:</strong> March 2025 | <strong>Last updated:</strong> March 2026
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed mt-3">
          The Private Story is operated by <strong>Ianson System Ltd</strong> trading as <strong>The Private Story</strong>.<br />
          <strong>Registered office:</strong> 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, England<br />
          <strong>Contact:</strong> <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a>
        </p>
      </div>


      <div className="space-y-10">

        <Section icon={<Shield className="w-5 h-5 text-primary" />} iconBg="bg-primary/10 border-primary/20" title="1. About the service">
          <p className="text-sm">
            The Private Story is a private digital storytelling service that provides AI-generated written and audio stories based on your selections and preferences. The service is designed for personal, private use and is not a social platform.
          </p>
        </Section>

        <Section icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} iconBg="bg-amber-500/10 border-amber-500/20" title="2. Adults only">
          <p className="text-sm">This service is intended for adults aged 18 and over only. By using the service, you confirm that:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground text-sm">
            <li>You are at least 18 years of age.</li>
            <li>You are legally permitted to use the service in your jurisdiction.</li>
          </ul>
          <p className="mt-3 text-sm">We may suspend or terminate access if we reasonably believe a user is under 18 or is using the service unlawfully.</p>
        </Section>

        <Section icon={<Shield className="w-5 h-5 text-primary" />} iconBg="bg-primary/10 border-primary/20" title="3. Your account">
          <p className="text-sm">To use features of the service, you may need to create an account. You agree to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground text-sm">
            <li>Provide accurate and up-to-date information.</li>
            <li>Keep your login credentials confidential.</li>
            <li>Use the account only for your own personal use.</li>
            <li>Notify us promptly if you suspect unauthorised access.</li>
          </ul>
          <p className="mt-3 text-sm">You are responsible for activity carried out through your account. We may suspend, restrict, or close accounts where necessary for safety, fraud prevention, legal compliance, or breach of these terms.</p>
        </Section>

        <Section icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} iconBg="bg-amber-500/10 border-amber-500/20" title="4. Acceptable use and prohibited content">
          <p className="text-sm">You must use the service lawfully and in accordance with these terms. You must <strong>not</strong> use the service to request or create content that:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground text-sm">
            <li><strong className="text-foreground/70">Involves minors or age ambiguity</strong> — this is illegal and will be reported to relevant authorities.</li>
            <li>Is non-consensual, coercive, exploitative, or abusive.</li>
            <li>Is otherwise unlawful in your jurisdiction.</li>
            <li>Is intended to harass, threaten, intimidate, or harm.</li>
            <li>Infringes another person's rights.</li>
            <li>Attempts to bypass, test, or undermine our moderation systems.</li>
            <li>Is used for commercial resale, redistribution, or scraping without written consent.</li>
          </ul>
          <p className="mt-3 text-sm">We may refuse requests, block content, remove stories, restrict accounts, or terminate access where necessary to enforce these terms or protect the service.</p>
        </Section>

        <Section icon={<FileText className="w-5 h-5 text-blue-400" />} iconBg="bg-blue-500/10 border-blue-500/20" title="5. Story generation and AI outputs">
          <p className="text-sm">The service uses AI tools to generate stories and audio. You acknowledge that:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground text-sm">
            <li>Outputs are generated automatically and are fictional.</li>
            <li>Output quality, style, and suitability may vary.</li>
            <li>Outputs may not always be error-free or available on demand.</li>
            <li>We may moderate, refuse, remove, or regenerate outputs.</li>
          </ul>
          <p className="mt-3 text-sm">We do not guarantee that any generated story will match every expectation or preference.</p>
        </Section>

        <Section icon={<Shield className="w-5 h-5 text-emerald-400" />} iconBg="bg-emerald-500/10 border-emerald-500/20" title="6. Your private library">
          <p className="text-sm">
            Stories generated through your account are saved to your private library, visible only to you. However, we may access content where necessary for moderation, safety, support, technical maintenance, legal compliance, and fraud prevention.
          </p>
          <p className="mt-3 text-sm">You may be able to delete stories using account controls, subject to backups, technical retention, and moderation records as required by law.</p>
        </Section>

        <Section icon={<FileText className="w-5 h-5 text-blue-400" />} iconBg="bg-blue-500/10 border-blue-500/20" title="7. Fees, subscriptions, and billing">
          <p className="text-sm"><strong>Subscription models:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground text-sm">
            <li>Monthly subscriptions (£29/month for 5 stories)</li>
            <li>Annual subscriptions (£179/year for 50 stories)</li>
            <li>Additional story purchases (£3.99 per story)</li>
          </ul>
          <p className="mt-3 text-sm"><strong>Automatic renewal:</strong> Subscriptions renew automatically until cancelled. You are responsible for cancelling before renewal if you do not want the next charge.</p>
          <p className="mt-3 text-sm"><strong>Price changes:</strong> We may change subscription prices for future billing periods with reasonable notice.</p>
          <p className="mt-3 text-sm">Payment is processed securely through our payment provider. We do not store your card details.</p>
        </Section>

        <Section icon={<Scale className="w-5 h-5 text-violet-400" />} iconBg="bg-violet-500/10 border-violet-500/20" title="8. Refund policy">
          <p className="text-sm">
            Refunds, where available, are limited because the service includes immediate-access digital features and generated content. Refunds may not be available once a subscription has started, stories have been generated, or content access has begun, except where required by law.
          </p>
          <p className="mt-3 text-sm">For refund questions, contact <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a>.</p>
        </Section>

        <Section icon={<Shield className="w-5 h-5 text-primary" />} iconBg="bg-primary/10 border-primary/20" title="9. Intellectual property">
          <p className="text-sm">
            All rights in the website, app, software, branding, and design belong to us or our licensors. Generated outputs are provided to you for personal use under a limited licence and are not a transfer of underlying platform rights.
          </p>
          <p className="mt-3 text-sm">You may not redistribute, sell, publish, or commercially exploit generated content without our written permission.</p>
        </Section>

        <Section icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} iconBg="bg-amber-500/10 border-amber-500/20" title="10. Moderation and enforcement">
          <p className="text-sm">
            We use automated and manual moderation to maintain safety, quality, and legal compliance. We may:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground text-sm">
            <li>Block generation requests or prevent story release.</li>
            <li>Regenerate, remove, or restrict stories.</li>
            <li>Record moderation outcomes and take enforcement action.</li>
            <li>Suspend or terminate accounts.</li>
          </ul>
          <p className="mt-3 text-sm">Moderation decisions may be made to protect users, the service, and ensure legal compliance.</p>
        </Section>

        <Section icon={<Mail className="w-5 h-5 text-muted-foreground" />} iconBg="bg-muted/20 border-border/20" title="11. Suspension and termination">
          <p className="text-sm">We may suspend or terminate your access immediately where:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground text-sm">
            <li>You breach these terms or our content policy.</li>
            <li>We suspect fraud, abuse, or unlawful conduct.</li>
            <li>Payment fails or is reversed.</li>
            <li>Your use poses a legal or safety risk.</li>
          </ul>
          <p className="mt-3 text-sm">Where we detect prohibited content involving minors, we are legally required to preserve evidence and report to relevant authorities. Account deletion will not remove preserved safety evidence.</p>
        </Section>

        <Section icon={<Shield className="w-5 h-5 text-primary" />} iconBg="bg-primary/10 border-primary/20" title="12. Limitation of liability">
          <p className="text-sm">To the fullest extent permitted by law:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground text-sm">
            <li>The service is provided "as is" without warranties.</li>
            <li>We are not liable for indirect, incidental, or consequential damages.</li>
            <li>Our total liability shall not exceed the amount you paid us in the 12 months before the claim.</li>
          </ul>
        </Section>

        <Section icon={<Scale className="w-5 h-5 text-violet-400" />} iconBg="bg-violet-500/10 border-violet-500/20" title="13. Governing law and disputes">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
            <li>These terms are governed by the laws of England and Wales.</li>
            <li>Disputes are subject to the exclusive jurisdiction of the English courts.</li>
            <li>We aim to resolve disputes informally first. Contact us before formal proceedings.</li>
          </ul>
        </Section>

        <Section icon={<Mail className="w-5 h-5 text-muted-foreground" />} iconBg="bg-muted/20 border-border/20" title="14. Changes to these terms">
          <p className="text-sm">
            We may update these terms from time to time. Material changes will be notified via email. Continued use after updates constitutes acceptance of the revised terms.
          </p>
        </Section>

        <div className="glass-panel rounded-2xl p-6 border-primary/20 text-center">
          <p className="text-muted-foreground text-sm mb-3">Questions about these terms?</p>
          <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline text-sm font-medium">
            support@theprivatestory.com
          </a>
          <p className="text-muted-foreground text-xs mt-4">
            Registered company: Ianson System Ltd<br />
            Registered in England and Wales<br />
            71-75 Shelton Street, Covent Garden, London, WC2H 9JQ
          </p>
        </div>

        <div className="text-center pt-4 flex gap-6 justify-center">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/content-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Content Policy</Link>
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
