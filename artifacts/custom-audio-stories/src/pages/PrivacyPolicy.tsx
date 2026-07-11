import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
      {children}
    </h1>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <h2 className="font-display text-lg font-bold text-foreground mt-10 mb-3 flex items-start gap-2">
      <span className="text-primary/60 font-mono text-sm mt-0.5 flex-shrink-0 w-6">{number}.</span>
      {title}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-semibold text-foreground text-sm mt-5 mb-2">{children}</h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-sm leading-relaxed mb-3">{children}</p>
  );
}

function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mb-3 space-y-1 pl-4">
      {items.map((item, i) => (
        <li key={i} className="text-muted-foreground text-sm leading-relaxed flex items-start gap-2">
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40 flex-shrink-0 mt-2" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Table({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border/30">
            <th className="text-left text-xs font-semibold text-muted-foreground py-2 pr-4 w-1/3">Processing purpose</th>
            <th className="text-left text-xs font-semibold text-muted-foreground py-2 pr-4 w-1/3">Data categories</th>
            <th className="text-left text-xs font-semibold text-muted-foreground py-2 w-1/3">Lawful basis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([purpose, data, basis], i) => (
            <tr key={i} className="border-b border-border/10 last:border-0">
              <td className="text-foreground/80 py-2.5 pr-4 align-top">{purpose}</td>
              <td className="text-muted-foreground py-2.5 pr-4 align-top">{data}</td>
              <td className="text-muted-foreground py-2.5 align-top">{basis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const EFFECTIVE_DATE = "30 March 2026";
const LAST_UPDATED = "26 April 2026";

export default function PrivacyPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 py-16"
    >
      {/* Header */}
      <div className="mb-10">
        <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-5">
          Full Privacy Policy
        </span>
        <H1>Privacy Policy</H1>
        <div className="glass-panel rounded-xl p-4 text-xs text-muted-foreground space-y-1 mb-6">
          <p><span className="text-foreground/60 font-medium">Effective date:</span> {EFFECTIVE_DATE}</p>
          <p><span className="text-foreground/60 font-medium">Last updated:</span> {LAST_UPDATED}</p>
          <p><span className="text-foreground/60 font-medium">Controller:</span> The Private Story</p>
          <p><span className="text-foreground/60 font-medium">Contact:</span>{" "}
            <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a>
          </p>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          This policy sets out the complete terms on which The Private Story processes personal data. For a plain-language overview, see our{" "}
          <Link href="/privacy" className="text-primary hover:underline">Privacy Summary</Link>.
        </p>
      </div>

      <div className="border-t border-border/20 pt-2">

        {/* 1 */}
        <SectionHeading number="1" title="Introduction" />
        <P>
          This Privacy Policy explains how The Private Story collects, uses, stores, shares, and protects personal data when you use our website, create an account, generate stories, purchase a subscription, contact us, or otherwise interact with our services.
        </P>
        <P>
          The Private Story is a private, personalised audio storytelling service for adults. Stories are generated using structured mood and scenario selections made by users and are intended to be accessible only within the relevant user account, subject to our moderation, support, security, legal, and operational needs.
        </P>
        <P>
          We are committed to handling personal data in a lawful, fair, and transparent way, in compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
        </P>

        {/* 2 */}
        <SectionHeading number="2" title="Who we are" />
        <P>
          For the purposes of UK data protection law, <strong className="text-foreground/80">The Private Story</strong> is the controller of your personal data.
        </P>
        <P>
          If you have any questions about this Privacy Policy or wish to exercise your rights, contact us at:{" "}
          <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a>.
        </P>

        {/* 3 */}
        <SectionHeading number="3" title="Scope of this policy" />
        <P>This Privacy Policy applies to personal data we collect through:</P>
        <Ul items={[
          "our website at theprivatestory.com (web-only — there is no mobile app);",
          "account creation and account management;",
          "story generation and private library features;",
          "subscriptions, billing, and customer support;",
          "moderation, trust and safety, and abuse prevention;",
          "cookies and similar technologies, where used.",
        ]} />

        {/* 4 */}
        <SectionHeading number="4" title="The personal data we collect" />
        <P>We collect only the personal data we reasonably need to operate, secure, and improve the service.</P>

        <SubHeading>4.1 Account and identity data</SubHeading>
        <Ul items={[
          "email address;",
          "encrypted login credentials;",
          "account status and subscription tier;",
          "records showing when you accepted our Terms of Service, Privacy Policy, and Content Policy.",
        ]} />

        <SubHeading>4.2 Story generation and product-use data</SubHeading>
        <P>
          Because the service uses structured selections rather than open free-text prompts (with the exception of optional scenario description and character name fields), we may collect:
        </P>
        <Ul items={[
          "mood, tone, dynamic, setting, intensity, and other structured selections made during story creation;",
          "any optional free-text scenario description or character name you provide;",
          "selected voice or narration preferences;",
          "timestamps of generation requests;",
          "generated story titles, descriptions, text, scene structure, tags, audio files, and cover images;",
          "library actions such as play, pause, continue, resume, replay, save, unsave, or delete.",
        ]} />

        <SubHeading>4.3 Taste profile and preference data</SubHeading>
        <P>We may collect anonymised preference signals derived from your story interactions, including:</P>
        <Ul items={[
          "moods and tones you have responded to;",
          "reaction data you attach to stories;",
          "your preferred narration styles or intensity ranges.",
        ]} />
        <P>This data is used only to improve your personal experience within the service and is not shared.</P>

        <SubHeading>4.4 Private library and collection data</SubHeading>
        <Ul items={[
          "stories generated through your account;",
          "metadata associated with those stories;",
          "whether content has been saved, resumed, deleted, or reported;",
          "your access to curated library content included in your subscription plan.",
        ]} />

        <SubHeading>4.5 Payment and billing data</SubHeading>
        <P>Payments are processed by Stripe. We do not store full payment card details.</P>
        <Ul items={[
          "billing status and subscription tier;",
          "renewal dates and cancellation status;",
          "payment transaction references;",
          "limited billing metadata necessary to manage subscriptions and accounts.",
        ]} />

        <SubHeading>4.6 Communications and support data</SubHeading>
        <Ul items={[
          "emails and support requests sent to support@theprivatestory.com;",
          "information you provide when asking for help, reporting a problem, or requesting account support or deletion.",
        ]} />

        <SubHeading>4.7 Safety, moderation, and reporting data</SubHeading>
        <Ul items={[
          "moderation outcomes and policy flags from automated content checks;",
          "block, regeneration, and review decisions;",
          "story reports submitted by users (including the reason provided and the relevant story content snapshot);",
          "admin review notes and audit records connected to reports or moderation events;",
          "records of generation requests that were blocked or restricted, including a technical snapshot of the input.",
        ]} />

        <SubHeading>4.8 Technical and usage data</SubHeading>
        <Ul items={[
          "IP address;",
          "browser type and version;",
          "device type and operating system;",
          "server log files and error diagnostics;",
          "session activity;",
          "page views and feature usage data.",
        ]} />

        <SubHeading>4.9 Cookie and analytics data</SubHeading>
        <P>We use strictly necessary session cookies to maintain your authenticated session. We do not currently use third-party advertising or behavioural tracking cookies.</P>

        {/* 5 */}
        <SectionHeading number="5" title="How we collect your personal data" />
        <P>We collect personal data:</P>
        <Ul items={[
          "directly from you when you sign up, create stories, subscribe, or contact us;",
          "automatically when you use the site (technical and usage data);",
          "from service providers such as payment processors or hosting and infrastructure partners;",
          "from trust and safety workflows, including moderation systems and user-submitted reports.",
        ]} />

        {/* 6 */}
        <SectionHeading number="6" title="How we use your personal data" />

        <SubHeading>6.1 To provide the service</SubHeading>
        <Ul items={[
          "create and manage your account;",
          "authenticate your access;",
          "generate personalised stories using your inputs;",
          "save and display your private library;",
          "provide access to curated collection content;",
          "maintain the performance and functionality of the product.",
        ]} />

        <SubHeading>6.2 To manage subscriptions and payments</SubHeading>
        <Ul items={[
          "process purchases and activate subscriptions;",
          "manage renewals and billing;",
          "handle failed payments, billing disputes, and account queries.",
        ]} />

        <SubHeading>6.3 To moderate content and maintain safety</SubHeading>
        <Ul items={[
          "enforce our Terms of Service and Content Policy;",
          "detect misuse or prohibited requests using automated checks;",
          "investigate user-submitted reports;",
          "block, remove, or regenerate content where appropriate;",
          "reduce legal, safety, and abuse risks.",
        ]} />

        <SubHeading>6.4 To support users and respond to enquiries</SubHeading>
        <Ul items={[
          "answer support questions and troubleshoot product issues;",
          "respond to account or billing concerns;",
          "manage complaints, deletion requests, and data subject rights requests.",
        ]} />

        <SubHeading>6.5 To improve and develop the service</SubHeading>
        <Ul items={[
          "understand how users interact with the service;",
          "improve product design, moderation controls, and content quality;",
          "identify bugs and technical issues.",
        ]} />

        <SubHeading>6.6 To comply with law and protect rights</SubHeading>
        <Ul items={[
          "comply with legal obligations;",
          "maintain records necessary for compliance;",
          "establish, exercise, or defend legal claims;",
          "protect our rights, users, service providers, and the integrity of the platform.",
        ]} />

        {/* 7 */}
        <SectionHeading number="7" title="Our lawful bases for processing" />
        <P>Under UK GDPR, we must identify a lawful basis for processing personal data. The table below sets out the principal purposes, data categories, and lawful bases we rely on.</P>

        <div className="glass-panel rounded-xl p-4 mb-4 overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[480px]">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left text-xs font-semibold text-muted-foreground py-2 pr-3 w-2/5">Purpose</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-2 pr-3 w-1/3">Data</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-2 w-1/4">Lawful basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {[
                ["Account creation and authentication", "Account data", "Contract"],
                ["Story generation and library", "Generation inputs, story content", "Contract"],
                ["Subscription and billing management", "Billing data", "Contract / Legal obligation"],
                ["Customer support", "Communications data", "Contract / Legitimate interests"],
                ["Content moderation and safety", "Moderation data, generation inputs", "Legitimate interests / Legal obligation"],
                ["Service security and fraud prevention", "Technical data, account data", "Legitimate interests"],
                ["Service improvement and analytics", "Technical data, usage data, taste data", "Legitimate interests"],
                ["Legal compliance and record-keeping", "All categories where relevant", "Legal obligation"],
                ["Session cookies (strictly necessary)", "Cookie / session data", "Legitimate interests (essential)"],
              ].map(([purpose, data, basis], i) => (
                <tr key={i}>
                  <td className="text-foreground/70 py-2.5 pr-3 align-top leading-relaxed">{purpose}</td>
                  <td className="text-muted-foreground py-2.5 pr-3 align-top leading-relaxed">{data}</td>
                  <td className="text-muted-foreground py-2.5 align-top leading-relaxed">{basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SubHeading>7.1 Contract</SubHeading>
        <P>We process much of your data because it is necessary to provide the service you have asked for, including creating and managing your account, generating and storing stories, providing subscription features, and delivering customer support connected to your account.</P>

        <SubHeading>7.2 Legitimate interests</SubHeading>
        <P>We may process data where it is reasonably necessary for our legitimate interests, including keeping the service secure, preventing abuse, fraud, and misuse, moderating outputs and handling reports, improving the service, and maintaining service reliability. Where we rely on legitimate interests, we have assessed the impact on your rights and aim to use data in a proportionate way.</P>

        <SubHeading>7.3 Legal obligation</SubHeading>
        <P>We may process data where necessary to comply with legal obligations, regulatory requirements, lawful requests, or record-keeping duties under UK law.</P>

        <SubHeading>7.4 Consent</SubHeading>
        <P>Where required, we rely on consent — for example, for any non-essential cookies. Where we rely on consent, you may withdraw it at any time without affecting the lawfulness of prior processing.</P>

        <SubHeading>7.5 Special category data — story preferences</SubHeading>
        <P>
          Under UK GDPR Article 9, data that reveals sexual preferences or sexual life is classified as special category data and attracts additional protections. Some of the structured selections you make during story creation — such as intensity level, dynamic type, or thematic content — may constitute, or be capable of revealing, data about your sexual preferences.
        </P>
        <P>
          Where we process such data, we rely on your <strong className="text-foreground/80">explicit consent</strong>, given when you accept our Terms of Service, Privacy Policy, and Content Policy before accessing story creation features. You may withdraw this consent at any time by deleting your account, which will result in the deletion of your story preference data in accordance with Section 13.
        </P>
        <P>
          We treat all story preference data with the heightened care appropriate to its sensitivity: it is stored only within your private account, is not shared with other users, and is not used for any purpose other than delivering and improving your personal service experience.
        </P>

        {/* 8 */}
        <SectionHeading number="8" title="Your private library" />
        <P>Stories generated through your account are saved to your private library. Our intention is that these stories are visible only to you within your authenticated account.</P>
        <P>However, access to story content may occur where reasonably necessary for:</P>
        <Ul items={[
          "moderation and safety review following a report or automated flag;",
          "support and troubleshooting;",
          "technical maintenance, backups, and disaster recovery;",
          "legal compliance and enforcement;",
          "security investigations.",
        ]} />
        <P>We do not operate the service as a social platform, and we do not make your private library visible to other users.</P>

        {/* 9 */}
        <SectionHeading number="9" title="Curated library content" />
        <P>If your subscription plan includes access to curated library content, we may record which items you access in order to provide the feature correctly, understand feature usage, support account and customer service functions, and improve the collection experience.</P>

        {/* 10 */}
        <SectionHeading number="10" title="Automated systems and moderation" />
        <P>The service uses automated systems, including AI language models and content filtering tools, to generate stories and to identify or restrict content that may breach our Content Policy.</P>
        <P>When you generate a story, your structured selections (such as mood, tone, setting, and intensity) and any optional free-text inputs (such as a scenario description or character name) are transmitted to our AI text generation processors to produce the story narrative. Generated story text is also transmitted to our content moderation provider for automated safety screening before delivery. Cover art is generated by a separate AI image service using a description derived from your story. These processors are listed in Section 11 and are located principally in the United States; appropriate safeguards apply as described in Section 12.</P>
        <P>This may include:</P>
        <Ul items={[
          "automated checks before and after story generation;",
          "input screening against a maintained blocklist;",
          "output review against content policy rules;",
          "blocking certain content from being delivered;",
          "regeneration workflows where content does not meet our standards;",
          "flagging and logging of events for admin review.",
        ]} />
        <P>Moderation data is stored as part of our audit and safety processes. Where our systems automatically block a generation request, a record of that block is retained for the purpose of safety monitoring and repeated-misuse prevention.</P>
        <P>We also allow users to submit reports about generated stories. Where a report is received, it triggers a review process. Story content, user inputs, and related metadata may be accessed by our staff for the purpose of investigating the report.</P>

        {/* 11 */}
        <SectionHeading number="11" title="Who we share personal data with" />
        <P>We do not sell your personal data.</P>
        <P>We share personal data only with trusted processors who support our service under strict instructions. The principal processors we currently use are:</P>

        <div className="glass-panel rounded-xl p-4 mb-4">
          {[
            { name: "Stripe", role: "Payment processing. Card details are entered directly with Stripe — we never see or store them. Stripe is PCI DSS Level 1 certified.", location: "USA (Standard Contractual Clauses)" },
            { name: "OpenRouter", role: "AI routing service used to access the Mistral AI language model for story text generation. Your structured story inputs and any optional free-text details are transmitted through OpenRouter to generate narrative content. Under our API agreement, inputs are not used to train models.", location: "USA (Standard Contractual Clauses)" },
            { name: "Mistral AI", role: "The underlying AI language model (Mistral Large) that generates story text. Receives story generation inputs via OpenRouter. Mistral AI is a French company and processes data within the EU.", location: "EU (France)" },
            { name: "OpenAI", role: "Used for two purposes: (1) automated safety moderation — story inputs and generated story text are screened against OpenAI's content moderation API before and after generation; (2) AI image generation for story cover art via DALL-E. Under our API agreement, inputs are not used to train OpenAI models.", location: "USA (Standard Contractual Clauses)" },
            { name: "ElevenLabs", role: "Text-to-speech audio narration. Audio is generated for delivery only and is not retained by ElevenLabs beyond generation.", location: "USA (Standard Contractual Clauses)" },
            { name: "Resend", role: "Transactional email delivery (account confirmation, password reset, and account notifications). Email addresses are shared only as necessary to deliver these communications.", location: "USA (Standard Contractual Clauses)" },
            { name: "Replit / hosting infrastructure", role: "The cloud platform on which the service runs. Personal data is stored on servers operated within this infrastructure.", location: "USA (Standard Contractual Clauses)" },
            { name: "Google Analytics 4", role: "Aggregate usage analytics, loaded in cookie-less consent mode (analytics_storage: denied). No cookies are set and no personal data is transmitted to Google in this configuration.", location: "USA (Standard Contractual Clauses)" },
          ].map((p) => (
            <div key={p.name} className="py-3 border-b border-border/20 last:border-0">
              <p className="font-semibold text-foreground text-sm">{p.name}</p>
              <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{p.role}</p>
              <p className="text-muted-foreground/60 text-xs mt-0.5">Location: {p.location}</p>
            </div>
          ))}
        </div>

        <P>We may also disclose personal data where required by law, in response to lawful requests by public authorities (including law enforcement), to protect rights, safety, property, or the integrity of the service, or in connection with a sale, merger, restructuring, or acquisition involving our business.</P>

        {/* 12 */}
        <SectionHeading number="12" title="International transfers" />
        <P>Some of our processors operate outside the UK, principally in the United States. Where personal data is transferred internationally, we ensure appropriate safeguards are in place — currently Standard Contractual Clauses (SCCs) approved under applicable UK data protection law — so that your data remains protected to an equivalent standard.</P>

        {/* 13 */}
        <SectionHeading number="13" title="Data retention" />
        <P>We retain personal data only for as long as reasonably necessary for the purposes described in this Privacy Policy.</P>

        <div className="glass-panel rounded-xl p-4 mb-4 space-y-3">
          {[
            { category: "Account data (email, credentials, settings)", period: "Retained while your account is active. Deleted or anonymised as soon as reasonably practicable after account deletion, and within 90 days at the latest, subject to the exceptions below." },
            { category: "Generated stories and library content", period: "Retained in your account until you delete them or your account is deleted. Subject to limited retention for security, moderation, and legal compliance." },
            { category: "Taste and preference data", period: "Retained while your account is active. Deleted on account deletion." },
            { category: "Safety event logs (blocked generation requests)", period: "90 days, then automatically deleted — unless a legal hold applies." },
            { category: "User-submitted story reports", period: "Retained as long as reasonably necessary to investigate the report, improve controls, and demonstrate compliance." },
            { category: "Moderation records and audit logs", period: "Retained for as long as reasonably necessary to investigate incidents, manage disputes, and support legal compliance." },
            { category: "Billing and transaction records", period: "7 years, as required by UK financial and tax regulations." },
            { category: "CSAM and legally preserved safety evidence", period: "Retained indefinitely as required by applicable law — not subject to deletion requests." },
            { category: "Technical logs (server logs, error logs)", period: "Up to 90 days for operational and security purposes, then deleted." },
            { category: "Support communications", period: "Retained for up to 3 years following resolution, for dispute management and compliance." },
          ].map(({ category, period }) => (
            <div key={category} className="pb-3 border-b border-border/20 last:border-0">
              <p className="font-semibold text-foreground text-xs mb-1">{category}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">{period}</p>
            </div>
          ))}
        </div>

        {/* 14 */}
        <SectionHeading number="14" title="Your rights under UK GDPR" />
        <P>Depending on your circumstances, you have the following rights in relation to your personal data:</P>

        <div className="space-y-2 mb-4">
          {[
            { right: "Right of access (Article 15)", desc: "You can request a copy of the personal data we hold about you." },
            { right: "Right to rectification (Article 16)", desc: "You can ask us to correct inaccurate personal data." },
            { right: "Right to erasure (Article 17)", desc: "You can ask us to delete your personal data in certain circumstances. You can also delete your account directly from your profile page." },
            { right: "Right to restriction (Article 18)", desc: "You can ask us to restrict processing of your personal data in certain circumstances." },
            { right: "Right to data portability (Article 20)", desc: "You can ask for certain data in a structured, machine-readable format, where processing is based on consent or contract." },
            { right: "Right to object (Article 21)", desc: "You can object to processing where we rely on legitimate interests as the lawful basis." },
            { right: "Right to withdraw consent", desc: "Where processing is based on consent, you can withdraw it at any time without affecting the lawfulness of prior processing." },
            { right: "Right to lodge a complaint", desc: "You can complain to the UK Information Commissioner's Office (ICO) at ico.org.uk or by post to: ICO, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF." },
          ].map(({ right, desc }) => (
            <div key={right} className="glass-panel rounded-xl p-4">
              <p className="font-semibold text-foreground text-sm mb-1">{right}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <P>These rights are not absolute and may be subject to legal exceptions. To exercise any of these rights, email us at{" "}
          <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a>. We will respond within one calendar month.
        </P>

        {/* 15 */}
        <SectionHeading number="15" title="Account deletion and story deletion" />
        <P>You may delete individual stories from your library at any time from within the app.</P>
        <P>You may request account deletion at any time from your profile page. When an account is deleted:</P>
        <Ul items={[
          "your account access is immediately disabled;",
          "your email address, stories, taste profile, and library data are permanently deleted as soon as reasonably practicable, and within 90 days at the latest;",
          "billing and transaction records are retained for 7 years as required by UK HMRC tax regulations and cannot be deleted earlier;",
          "some other records may be retained where reasonably necessary for legal, security, accounting, fraud-prevention, moderation, or compliance purposes (see Section 13).",
        ]} />
        <P>
          To request deletion of your data if you cannot access your account, email{" "}
          <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a>{" "}
          from the email address associated with your account.
        </P>

        {/* 16 */}
        <SectionHeading number="16" title="Cookies and similar technologies" />
        <P>We use strictly necessary session cookies to maintain your authenticated login session. These are essential for the service to function and do not require consent under the Privacy and Electronic Communications Regulations (PECR).</P>
        <P>We use Google Analytics 4 in a privacy-preserving configuration. Google Analytics is loaded with <strong className="text-foreground/80">analytics_storage denied</strong> — meaning no cookies are set, no client identifiers are stored, and no personal data is transmitted to Google. Only aggregate, non-identifiable usage signals (such as pageview counts) may be collected in this configuration.</P>
        <P>We do not use third-party advertising cookies, behavioural tracking cookies, or any analytics configuration that identifies individual users.</P>
        <P>If we introduce any non-essential cookies in the future, we will seek your consent before placing them.</P>

        {/* 17 */}
        <SectionHeading number="17" title="Marketing communications" />
        <P>We do not send marketing emails unless you have specifically opted in to receive them. If you have opted in, you can unsubscribe at any time using the link in any marketing email, or by emailing{" "}
          <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a>.
        </P>

        {/* 18 */}
        <SectionHeading number="18" title="Security" />
        <P>We use reasonable technical and organisational measures to protect personal data, including HTTPS encryption in transit, access controls, and authentication requirements for administrative access.</P>
        <P>No service can guarantee absolute security, but we are committed to protecting personal data proportionately given the sensitivity of the content the service handles.</P>
        <P>In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will notify the ICO within 72 hours, as required by UK GDPR Article 33. Where there is a high risk to you, we will also notify you directly without undue delay.</P>

        {/* 19 */}
        <SectionHeading number="19" title="Adults only" />
        <P>This service is intended for adults aged 18 and over and is not directed at children. We do not knowingly provide the service to anyone under 18 or intentionally collect personal data from anyone under 18. If you become aware that a person under 18 has created an account, please contact us at{" "}
          <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a>.
        </P>

        {/* 20 */}
        <SectionHeading number="20" title="Third-party links" />
        <P>Our site may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties. We encourage you to review their privacy information separately.</P>

        {/* 21 */}
        <SectionHeading number="21" title="Complaints" />
        <P>If you have concerns about how we handle your personal data, please contact us first at{" "}
          <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a>{" "}
          so we can try to resolve the issue.
        </P>
        <P>If you are not satisfied with our response, you have the right to complain to the UK Information Commissioner's Office (ICO):</P>
        <Ul items={[
          <>Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk</a></>,
          "Post: Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF",
          "Helpline: 0303 123 1113",
        ]} />

        {/* 22 */}
        <SectionHeading number="22" title="Changes to this Privacy Policy" />
        <P>We may update this Privacy Policy from time to time to reflect legal, technical, or business changes. When we do, we will update the effective date and last updated date at the top of this page.</P>
        <P>Where changes are material, we will take reasonable steps to notify users — for example by displaying a notice on the website or by email.</P>
        <P>Continued use of the service after the updated policy is posted constitutes acceptance of the revised terms, to the extent permitted by applicable law.</P>

        {/* 23 */}
        <SectionHeading number="23" title="Contact us" />
        <div className="glass-panel rounded-xl p-5 mb-6">
          <p className="font-display font-bold text-foreground mb-3">The Private Story</p>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p>Email: <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">support@theprivatestory.com</a></p>
            <p className="text-xs text-muted-foreground/60 mt-2">We aim to respond to all data subject requests within one calendar month of receipt.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/20 pt-8 mt-4">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-4 h-4 text-primary/60" />
            <p className="text-xs text-muted-foreground/60">
              This policy was prepared in accordance with the UK General Data Protection Regulation, the Data Protection Act 2018, and related ICO guidance.
            </p>
          </div>
          <div className="flex gap-6 justify-center flex-wrap text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Summary</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/content-policy" className="text-muted-foreground hover:text-primary transition-colors">Content Policy</Link>
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">← Back to home</Link>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
