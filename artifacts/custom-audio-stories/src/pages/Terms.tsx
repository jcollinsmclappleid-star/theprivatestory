import { motion } from "framer-motion";
import { Link } from "wouter";
import { FileText, Shield, AlertTriangle, Scale, Mail } from "lucide-react";

export default function Terms() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 py-16"
    >
      <div className="mb-12">
        <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
          Legal
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Last updated: March 2025. These terms are governed by the laws of England and Wales.{" "}
          <strong className="text-foreground/70">
            ⚠ DRAFT — must be reviewed by a solicitor with adult content experience before public launch.
          </strong>
        </p>
      </div>

      <div className="space-y-10">

        <Section icon={<Shield className="w-5 h-5 text-primary" />} iconBg="bg-primary/10 border-primary/20" title="1. Who may use this service">
          <p>This platform is an adults-only service. By accessing or using the service you confirm that:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground text-sm">
            <li>You are at least 18 years of age (or the age of majority in your jurisdiction, whichever is higher).</li>
            <li>It is legal to access adult content in your jurisdiction.</li>
            <li>You are accessing this service for your own personal, private use only.</li>
          </ul>
          <p className="mt-3">We reserve the right to terminate accounts and report to relevant authorities if we have reason to believe a user is under 18 or is misusing the service.</p>
        </Section>

        <Section icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} iconBg="bg-amber-500/10 border-amber-500/20" title="2. Prohibited content and conduct">
          <p>You must not use this service to generate, request, or attempt to generate:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground text-sm">
            <li><strong className="text-foreground/70">Any content involving minors</strong> in a sexual or sexualised context. This is illegal and will be reported to the National Center for Missing &amp; Exploited Children (NCMEC) and the Internet Watch Foundation (IWF) where required by law.</li>
            <li>Non-consensual sexual scenarios depicted approvingly or erotically.</li>
            <li>Sexual content involving real, identifiable individuals without clear evidence of their consent.</li>
            <li>Content designed to harass, threaten, or facilitate harm to any person.</li>
            <li>Bestiality or zoophilic content.</li>
            <li>Content that violates any applicable law in England and Wales or in your jurisdiction.</li>
          </ul>
          <p className="mt-3">Attempts to circumvent our content filters — including the use of coded language, character substitution, or prompt injection — are a violation of these terms and will result in immediate account termination.</p>
        </Section>

        <Section icon={<FileText className="w-5 h-5 text-blue-400" />} iconBg="bg-blue-500/10 border-blue-500/20" title="3. Subscription and payment">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
            <li>Subscriptions are billed annually. The current price is displayed at checkout.</li>
            <li>Payment is processed by Stripe. We do not store your card details.</li>
            <li>Subscriptions renew automatically. You may cancel at any time from your account settings.</li>
            <li>Refunds are offered within 14 days of the initial purchase where no stories have been generated, in accordance with UK consumer law. Contact us at <a href="mailto:hello@theprivatestory.com" className="text-primary hover:underline">hello@theprivatestory.com</a>.</li>
          </ul>
        </Section>

        <Section icon={<Shield className="w-5 h-5 text-emerald-400" />} iconBg="bg-emerald-500/10 border-emerald-500/20" title="4. Intellectual property">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
            <li>The platform, its design, and underlying technology are owned by us.</li>
            <li>Stories generated for you are for your personal, private use only. You may not redistribute, sell, or publish generated content.</li>
            <li>You grant us no rights to your stories except those needed to deliver the service (generating audio, saving to your library).</li>
          </ul>
        </Section>

        <Section icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} iconBg="bg-amber-500/10 border-amber-500/20" title="5. Account termination">
          <p>We may suspend or terminate your account immediately and without refund if:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground text-sm">
            <li>You violate the prohibited content rules in Section 2.</li>
            <li>You attempt to circumvent our safety systems.</li>
            <li>We receive a valid law enforcement request requiring us to do so.</li>
            <li>Your use poses a legal or reputational risk to the platform.</li>
          </ul>
          <p className="mt-3">Where we detect prohibited content involving minors, we are legally required to preserve relevant data and report to NCMEC and/or IWF. Account deletion requests will not result in deletion of preserved safety evidence.</p>
        </Section>

        <Section icon={<Scale className="w-5 h-5 text-violet-400" />} iconBg="bg-violet-500/10 border-violet-500/20" title="6. Limitation of liability">
          <p>To the fullest extent permitted by law:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground text-sm">
            <li>The service is provided "as is" without warranties of any kind.</li>
            <li>We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</li>
            <li>Our total liability to you for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.</li>
          </ul>
        </Section>

        <Section icon={<Scale className="w-5 h-5 text-violet-400" />} iconBg="bg-violet-500/10 border-violet-500/20" title="7. Dispute resolution and governing law">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
            <li>These terms are governed by the laws of England and Wales.</li>
            <li>Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</li>
            <li>We aim to resolve disputes informally first. Contact us at <a href="mailto:hello@theprivatestory.com" className="text-primary hover:underline">hello@theprivatestory.com</a> before initiating formal proceedings.</li>
          </ul>
        </Section>

        <Section icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} iconBg="bg-amber-500/10 border-amber-500/20" title="8. DMCA / Copyright">
          <p>If you believe content on this platform infringes your copyright, contact us at <a href="mailto:hello@theprivatestory.com" className="text-primary hover:underline">hello@theprivatestory.com</a> with:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground text-sm">
            <li>Identification of the copyrighted work you claim has been infringed.</li>
            <li>Identification of the material claimed to be infringing.</li>
            <li>Your contact information.</li>
            <li>A statement of good faith belief that the use is not authorised.</li>
            <li>A statement, under penalty of perjury, that the information in your notice is accurate.</li>
          </ul>
        </Section>

        <Section icon={<Mail className="w-5 h-5 text-muted-foreground" />} iconBg="bg-muted/20 border-border/20" title="9. Changes to these terms">
          <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify subscribers of material changes by email.</p>
        </Section>

        <div className="glass-panel rounded-2xl p-6 border-primary/20 text-center">
          <p className="text-muted-foreground text-sm mb-3">Questions about these terms?</p>
          <a href="mailto:hello@theprivatestory.com" className="text-primary hover:underline text-sm font-medium">
            hello@theprivatestory.com
          </a>
          <p className="text-muted-foreground text-xs mt-3">
            Safety concerns:{" "}
            <a href="mailto:safety@theprivatestory.com" className="text-amber-400 hover:underline">
              safety@theprivatestory.com
            </a>
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
