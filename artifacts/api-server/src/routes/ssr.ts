import { Router, type IRouter, type Request, type Response } from "express";
import { allPageConfigs } from "../seoPageData.js";
import { ssrHtmlShell } from "../ssrShared.js";

const SITE_URL = "https://theprivatestory.com";
const SITE_NAME = "The Private Story";
const DATE_PUBLISHED = "2025-11-01";
const DATE_MODIFIED = "2026-04-02";
const CACHE_1D = "public, max-age=86400, stale-while-revalidate=3600";
const CACHE_1H = "public, max-age=3600, stale-while-revalidate=300";

const router: IRouter = Router();

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function makeBreadcrumb(url: string, items: Array<{ name: string; item: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

function makeWebPage(opts: {
  name: string;
  description: string;
  url: string;
  includesBreadcrumb?: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    isFamilyFriendly: false,
    contentRating: "Adult Only 18+",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(opts.includesBreadcrumb
      ? { breadcrumb: { "@id": `${opts.url}#breadcrumb` } }
      : {}),
  };
}

function makeFaqSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

const TRUST_BAR_HTML = `
    <div class="trust-bar">
      <div class="trust-item"><strong>Completely private</strong><span>No social, no history shared</span></div>
      <div class="trust-item"><strong>Made for you</strong><span>Generated around your choices</span></div>
      <div class="trust-item"><strong>Narrated audio</strong><span>Ready to listen instantly</span></div>
      <div class="trust-item"><strong>Yours alone</strong><span>Only you can access your stories</span></div>
    </div>`;

const EXPLORE_HTML = `
    <section>
      <h2>Explore Related</h2>
      <p><a href="/personalised-audio-stories">Personalised audio stories</a> · <a href="/private-audio-stories">Private audio stories</a> · <a href="/create-your-own-audio-story">Create your own audio story</a> · <a href="/discover">Discover all story types</a></p>
    </section>`;

const HOW_TO_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to create a personalised audio story",
  description:
    "Create a private, AI-generated audio story in under two minutes.",
  totalTime: "PT2M",
  tool: [{ "@type": "HowToTool", name: "The Private Story app" }],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Choose your emotional register",
      text: "Select the mood, dynamic, and tone that fits how you feel tonight.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Story is written for you",
      text: "AI generates a complete, narrated audio story around your specific choices.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Listen privately",
      text: "Your story is saved to your private account. Only you can access it.",
    },
  ],
};

interface StaticPage {
  path: string;
  slug: string;
  title: string;
  description: string;
  h1: string;
  tagline: string;
  body: string;
  extraSchemas?: object[];
  cacheHeader?: string;
}

const STATIC_PAGES: StaticPage[] = [
  {
    path: "/pricing",
    slug: "pricing",
    title: "Pricing — The Private Story",
    description:
      "Choose a plan. £29/month for 5 stories, £179/year for 50 stories, or try a single story for £3.99.",
    h1: "Simple, Private Pricing",
    tagline: "No algorithm. No history shared. Just your stories.",
    cacheHeader: CACHE_1H,
    extraSchemas: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "The Private Story — Monthly Subscription",
        description:
          "5 personalised AI-narrated audio stories per month. Completely private.",
        brand: { "@type": "Brand", name: "The Private Story" },
        offers: [
          {
            "@type": "Offer",
            name: "Monthly plan",
            price: "29.00",
            priceCurrency: "GBP",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/pricing`,
          },
          {
            "@type": "Offer",
            name: "Annual plan",
            price: "179.00",
            priceCurrency: "GBP",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/pricing`,
          },
          {
            "@type": "Offer",
            name: "Story add-on",
            price: "3.99",
            priceCurrency: "GBP",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/pricing`,
          },
          {
            "@type": "Offer",
            name: "Immersive entry",
            price: "7.99",
            priceCurrency: "GBP",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/pricing`,
          },
        ],
      },
    ],
    body: `
    <section>
      <h2>Plans</h2>
      <p><strong>Monthly — £29/month</strong> · 5 personalised audio stories per month. Cancel any time.</p>
      <p><strong>Annual — £179/year</strong> · 50 stories per year (save 49%). Best value for regular listeners.</p>
      <p><strong>Add-on — £3.99/story</strong> · Extra stories beyond your plan allowance.</p>
      <p><strong>Immersive entry — £7.99 once</strong> · One complete immersive story. No subscription needed.</p>
    </section>
    <section>
      <h2>What's Included</h2>
      <p>Every plan includes fully narrated AI-generated audio, private story storage, and your complete listening history — visible only to you.</p>
      <a class="cta-primary" href="/create">Start creating</a>
    </section>`,
  },
  {
    path: "/about",
    slug: "about",
    title: "About — The Private Story",
    description:
      "The Private Story is built by Ianson System Ltd. Privacy-led, agency-first, female-first audio fiction.",
    h1: "About The Private Story",
    tagline:
      "Stories written for the parts of you that nobody else gets to know.",
    body: `
    <section>
      <h2>Who We Are</h2>
      <p>The Private Story is a product of Ianson System Ltd t/a The Private Story. We are a UK-based company building premium literary audio for adults who want stories that respond to them — not to a generic audience.</p>
    </section>
    <section>
      <h2>Our Principles</h2>
      <p>Privacy first. Your story choices stay private. We never share, monetise, or analyse your listening history outside of your own account.</p>
      <p>Agency first. You describe the story. The platform builds around your choices, not the other way around.</p>
      <p>Female-first. Our design, our tone, and our product philosophy centres the female listener.</p>
    </section>`,
  },
  {
    path: "/how-it-works",
    slug: "how-it-works",
    title: "How It Works — The Private Story",
    description:
      "Choose your mood. The AI writes your story. Listen instantly. Completely private. Here's how The Private Story works.",
    h1: "How The Private Story Works",
    tagline: "From your choices to your ears in under two minutes.",
    extraSchemas: [HOW_TO_SCHEMA],
    body: `
    <section>
      <h2>Three Steps</h2>
      <p><strong>1. Choose your emotional register.</strong> Select the mood, dynamic, and tone that fits how you feel tonight.</p>
      <p><strong>2. The story is written for you.</strong> AI generates a complete, narrated audio story around your specific choices — not retrieved from a library.</p>
      <p><strong>3. Listen privately.</strong> Your story is saved to your private account. Only you can access it.</p>
      <a class="cta-primary" href="/create">Create your first story</a>
    </section>`,
  },
  {
    path: "/contact",
    slug: "contact",
    title: "Contact — The Private Story",
    description:
      "Get in touch with The Private Story. Email us at support@theprivatestory.com.",
    h1: "Contact Us",
    tagline: "We read every message.",
    body: `
    <section>
      <h2>Get In Touch</h2>
      <p>Email us at <a href="mailto:support@theprivatestory.com">support@theprivatestory.com</a>. We aim to respond within one business day.</p>
    </section>`,
  },
  {
    path: "/privacy",
    slug: "privacy",
    title: "Privacy Policy — The Private Story",
    description:
      "How The Private Story handles your data. We keep your story choices completely private.",
    h1: "Privacy Policy",
    tagline: "What you listen to here stays here. Always.",
    body: `
    <section>
      <h2>Data We Collect</h2>
      <p>We collect your email address and payment information when you subscribe. We collect the story preferences you provide when creating a story. We do not sell or share this data.</p>
    </section>
    <section>
      <h2>Your Story Privacy</h2>
      <p>Your story choices, listening history, and generated stories are private to your account. They are never used for advertising, shared with third parties, or visible to other users.</p>
    </section>
    <section>
      <h2>Contact</h2>
      <p>Questions about your data? Email <a href="mailto:support@theprivatestory.com">support@theprivatestory.com</a>.</p>
      <p>Ianson System Ltd t/a The Private Story, registered in England and Wales.</p>
    </section>`,
  },
  {
    path: "/terms",
    slug: "terms",
    title: "Terms of Service — The Private Story",
    description:
      "Terms of service for The Private Story. Adults 18+ only. UK law applies.",
    h1: "Terms of Service",
    tagline: "Adults 18+ only. UK law applies.",
    body: `
    <section>
      <h2>Eligibility</h2>
      <p>You must be 18 or over to use The Private Story. By creating an account or purchasing, you confirm you meet this requirement.</p>
    </section>
    <section>
      <h2>Subscriptions and Billing</h2>
      <p>Subscriptions are billed monthly or annually via Stripe. You may cancel at any time. Refunds are subject to our <a href="/refund-policy">Refund Policy</a>.</p>
    </section>
    <section>
      <h2>Intellectual Property</h2>
      <p>Stories generated on The Private Story are for your personal use only. You may not redistribute or publish them without permission.</p>
    </section>
    <section>
      <h2>Contact</h2>
      <p>Ianson System Ltd t/a The Private Story. Email: <a href="mailto:support@theprivatestory.com">support@theprivatestory.com</a>.</p>
    </section>`,
  },
  {
    path: "/content-policy",
    slug: "content-policy",
    title: "Content Policy — The Private Story",
    description:
      "Content guidelines for The Private Story. Adults 18+ only. All content involves consenting fictional adults.",
    h1: "Content Policy",
    tagline: "All content is fictional. All depicted parties are adults.",
    body: `
    <section>
      <h2>What We Generate</h2>
      <p>The Private Story generates adult literary fiction for listeners aged 18 and over. All stories are fictional. All characters are adults.</p>
    </section>
    <section>
      <h2>What We Do Not Generate</h2>
      <p>We do not generate content involving minors, non-consent presented approvingly, real people, or content designed to harass or harm individuals.</p>
    </section>
    <section>
      <h2>Enforcement</h2>
      <p>Attempts to circumvent our content policy will result in immediate account termination. Contact <a href="mailto:support@theprivatestory.com">support@theprivatestory.com</a> to report concerns.</p>
    </section>`,
  },
  {
    path: "/refund-policy",
    slug: "refund-policy",
    title: "Refund Policy — The Private Story",
    description:
      "Refund policy for The Private Story subscriptions and one-time purchases.",
    h1: "Refund Policy",
    tagline:
      "We are reasonable. Please get in touch if something isn't right.",
    body: `
    <section>
      <h2>Subscriptions</h2>
      <p>If you cancel within 14 days of your first subscription payment and have used fewer than 2 stories, you are entitled to a full refund. After 14 days or after using 2 or more stories, we do not offer refunds for partial billing periods.</p>
    </section>
    <section>
      <h2>One-Time Purchases</h2>
      <p>Immersive entry and story add-ons are non-refundable once the story has been generated.</p>
    </section>
    <section>
      <h2>Contact</h2>
      <p>To request a refund, email <a href="mailto:support@theprivatestory.com">support@theprivatestory.com</a>. We aim to respond within one business day.</p>
    </section>`,
  },
];

router.get("/", (_req: Request, res: Response) => {
  const url = SITE_URL;

  const orgSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#org`,
        name: SITE_NAME,
        url,
        logo: {
          "@type": "ImageObject",
          url: `${url}/favicon.svg`,
          width: 180,
          height: 180,
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: "support@theprivatestory.com",
          contactType: "customer service",
        },
        description:
          "The Private Story is an AI-powered premium literary audio platform. Privacy-led, agency-first, female-first.",
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: SITE_NAME,
        publisher: { "@id": `${url}/#org` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${url}/discover?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${url}/#webapp`,
        name: SITE_NAME,
        url,
        applicationCategory: "EntertainmentApplication",
        operatingSystem: "Web",
        offers: [
          {
            "@type": "Offer",
            name: "Monthly subscription",
            price: "29.00",
            priceCurrency: "GBP",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Annual subscription",
            price: "179.00",
            priceCurrency: "GBP",
            availability: "https://schema.org/InStock",
          },
        ],
        provider: { "@id": `${url}/#org` },
      },
    ],
  };

  const bodyHtml = `
    <a class="cta-primary" href="/create">Create your story</a>
    ${TRUST_BAR_HTML}
    <section>
      <h2>What Is The Private Story?</h2>
      <p>The Private Story is a premium literary audio platform that generates personalised stories from your choices — not from a content library. Each story is written by AI around the emotional register, characters, and atmosphere you describe, then narrated and saved privately to your account.</p>
      <p><strong>What this is:</strong> A private platform for AI-generated audio stories, created around your choices each time — not a catalogue of content made for a general audience.</p>
      <p><strong>Who it's for:</strong> Adult women who want private, emotionally intelligent audio storytelling personalised around their mood, dynamic, and tone — not retrieved from a fixed library.</p>
      <p><strong>How it works:</strong> <a href="/personalised-audio-stories">Personalised audio stories</a> begin with seven structured selections — mood, tone, dynamic, setting, intensity, character type, and scenario direction. <a href="/private-audio-stories">Private audio stories</a> are saved only to your account. And <a href="/create-your-own-audio-story">creating your own audio story</a> takes under two minutes.</p>
      <p><a href="/how-it-works">Full explanation of how it works →</a></p>
    </section>
    <section>
      <h2>Browse Story Types</h2>
      <p><a href="/romantic-audio-stories">Romantic</a> · <a href="/intimate-audio-stories">Intimate</a> · <a href="/dark-romance-audio-stories">Dark Romance</a> · <a href="/slow-burn-audio-stories">Slow Burn</a> · <a href="/bedtime-audio-stories">Bedtime</a> · <a href="/ai-audio-story-generator">AI audio story generator</a> · <a href="/discover">Discover all</a></p>
    </section>`;

  const html = ssrHtmlShell({
    title: "The Private Story — Private AI Audio Stories Made for You",
    description:
      "AI-generated personalised audio stories. Choose your mood, your voice, your story. Completely private. Narrated and ready to listen.",
    canonical: url,
    h1: "AI-Powered Private Audio Stories — Made for You",
    tagline:
      "Your story, your voice, your moment. Private, intimate, and completely yours.",
    bodyHtml,
    schemas: [orgSchema],
  });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", CACHE_1D);
  res.status(200).send(html);
});

for (const page of STATIC_PAGES) {
  const canonical = `${SITE_URL}${page.path}`;
  const breadcrumb = makeBreadcrumb(canonical, [
    { name: SITE_NAME, item: SITE_URL },
    { name: page.h1, item: canonical },
  ]);
  const webPage = makeWebPage({
    name: page.title,
    description: page.description,
    url: canonical,
    includesBreadcrumb: true,
  });
  const schemas: object[] = [breadcrumb, webPage, ...(page.extraSchemas ?? [])];
  const cacheHeader = page.cacheHeader ?? CACHE_1D;
  const bodyHtml = page.body;
  const title = page.title;
  const description = page.description;
  const h1 = page.h1;
  const tagline = page.tagline;

  router.get(page.path, (_req: Request, res: Response) => {
    const html = ssrHtmlShell({
      title,
      description,
      canonical,
      h1,
      tagline,
      bodyHtml,
      schemas,
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", cacheHeader);
    res.status(200).send(html);
  });
}

router.get("/:slug", (req: Request, res: Response, next) => {
  const { slug } = req.params as { slug: string };
  const page = allPageConfigs.get(slug);

  if (!page) return next();

  const canonical = `${SITE_URL}/${slug}`;

  const faqSchema = makeFaqSchema(page.faqs);

  const breadcrumb = makeBreadcrumb(canonical, [
    { name: SITE_NAME, item: SITE_URL },
    { name: "Discover All Story Types", item: `${SITE_URL}/discover` },
    { name: page.hero.h1, item: canonical },
  ]);

  const webPage = makeWebPage({
    name: page.meta.title,
    description: page.meta.description,
    url: canonical,
    includesBreadcrumb: true,
  });

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to create a personalised ${page.hero.h1.split("—")[0].trim().toLowerCase()} story`,
    description:
      "Create a private, AI-generated audio story in under two minutes.",
    totalTime: "PT2M",
    tool: [{ "@type": "HowToTool", name: "The Private Story app" }],
    step: page.howItWorks.map((step, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: step.heading,
      text: step.body,
    })),
  };

  const sectionsHtml = page.sections
    .map(
      (s) => `
    <section>
      <h2>${esc(s.h2)}</h2>
      ${s.paragraphs.map((p) => `<p>${p}</p>`).join("\n      ")}
      ${
        s.bullets?.length
          ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`
          : ""
      }
    </section>`,
    )
    .join("\n");

  const scenariosHtml =
    page.scenarios?.items?.length
      ? `
    <section>
      ${page.scenarios.h2 ? `<h2>${esc(page.scenarios.h2)}</h2>` : ""}
      ${page.scenarios.intro ? `<p>${esc(page.scenarios.intro)}</p>` : ""}
      ${page.scenarios.items
        .map(
          (it) => `
      <div class="scenario-item">
        <strong>${esc(it.heading)}</strong>
        <p>${esc(it.body)}</p>
      </div>`,
        )
        .join("")}
      ${page.scenarios.interstitial ? `<p>${esc(page.scenarios.interstitial)}</p>` : ""}
    </section>`
      : "";

  const benefitsHtml =
    page.benefits?.items?.length
      ? `
    <section>
      ${page.benefits.h2 ? `<h2>${esc(page.benefits.h2)}</h2>` : ""}
      ${page.benefits.items
        .map(
          (it) => `
      <div class="benefit-item">
        <strong>${esc(it.heading)}</strong>
        <p>${esc(it.body)}</p>
      </div>`,
        )
        .join("")}
    </section>`
      : "";

  const fullPictureHtml =
    page.fullPicture?.paragraphs?.length
      ? `
    <section>
      <h2>${esc(page.fullPicture.h2)}</h2>
      ${page.fullPicture.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("\n      ")}
    </section>`
      : "";

  const finalCtaHtml = page.finalCTA
    ? `
    <section>
      <h2>${esc(page.finalCTA.h2)}</h2>
      ${page.finalCTA.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("\n      ")}
      <a class="cta-primary" href="${esc(page.finalCTA.primary.href)}">${esc(page.finalCTA.primary.label)}</a>
      ${
        page.finalCTA.links?.length
          ? `<p>${page.finalCTA.links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join(" · ")}</p>`
          : ""
      }
    </section>`
    : "";

  const faqsHtml = page.faqs.length
    ? `
    <section>
      <h2>Frequently Asked Questions</h2>
      ${page.faqs
        .map(
          (f) => `
      <div class="faq-item">
        <p class="faq-q">${esc(f.q)}</p>
        <p class="faq-a">${esc(f.a)}</p>
      </div>`,
        )
        .join("")}
    </section>`
    : "";

  const howItWorksHtml = `
    <section>
      <h2>How It Works</h2>
      ${page.howItWorks
        .map(
          (step, idx) => `
      <div class="hiw-step">
        <strong>${idx + 1}. ${esc(step.heading)}</strong>
        <p>${esc(step.body)}</p>
      </div>`,
        )
        .join("")}
      <p><a href="/create">Create yours in under two minutes →</a></p>
    </section>`;

  const comparisonTableHtml = page.comparisonTable
    ? `
    <section>
      <table class="comparison-table">
        <caption>${esc(page.comparisonTable.caption)}</caption>
        <thead>
          <tr>
            <th>Feature</th>
            <th>The Private Story</th>
            <th>${esc(page.comparisonTable.otherLabel)}</th>
          </tr>
        </thead>
        <tbody>
          ${page.comparisonTable.rows
            .map(
              (r) => `
          <tr>
            <td>${esc(r.feature)}</td>
            <td>${esc(r.thePrivateStory)}</td>
            <td>${esc(r.other)}</td>
          </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </section>`
    : "";

  const comparisonItemListSchema = page.comparisonTable
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: page.comparisonTable.caption,
        itemListElement: page.comparisonTable.rows.map((r, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: r.feature,
          description: `The Private Story: ${r.thePrivateStory}. ${page.comparisonTable!.otherLabel}: ${r.other}`,
        })),
      }
    : null;

  const bodyHtml = `
    <a class="cta-primary" href="/create">Create your story</a>
    ${TRUST_BAR_HTML}
    ${sectionsHtml}
    ${comparisonTableHtml}
    ${scenariosHtml}
    ${benefitsHtml}
    ${fullPictureHtml}
    ${howItWorksHtml}
    ${faqsHtml}
    ${finalCtaHtml}
    ${EXPLORE_HTML}`;

  const html = ssrHtmlShell({
    title: page.meta.title,
    description: page.meta.description,
    canonical,
    h1: page.hero.h1,
    badge: page.hero.badge,
    tagline: page.hero.tagline,
    bodyHtml,
    schemas: [faqSchema, breadcrumb, webPage, howToSchema, ...(comparisonItemListSchema ? [comparisonItemListSchema] : [])],
  });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", CACHE_1D);
  res.status(200).send(html);
});

/* ─────────────────────────────────────────
   DEFINITION PAGES  (5)
   ───────────────────────────────────────── */

interface DefinitionPageConfig {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  badge: string;
  h1: string;
  tagline: string;
  term: string;
  definition: string;
  inDefinedTermSet: string;
  breadcrumbLabel: string;
  sections: { h2: string; body: string }[];
  faqs: { q: string; a: string }[];
  relatedLinks: { label: string; href: string }[];
}

const DEFINITION_PAGES: DefinitionPageConfig[] = [
  {
    slug: "what-is-a-personalised-audio-story",
    metaTitle: "What Is a Personalised Audio Story? | The Private Story",
    metaDescription:
      "A clear, honest definition of personalised audio stories — bespoke narrative fiction crafted around your preferences and narrated just for you.",
    badge: "Definition",
    h1: "What Is a Personalised Audio Story?",
    tagline: "Bespoke fiction that puts you at the centre of the narrative — crafted around your tastes, desires, and emotional world.",
    term: "Personalised Audio Story",
    definition:
      "A personalised audio story is a piece of narrative fiction that is individually tailored to a specific listener's preferences — including genre, tone, character dynamics, setting, and level of sensuality — and delivered as a high-quality audio file narrated by a professional or AI voice actor.",
    inDefinedTermSet: "Audio Storytelling Glossary",
    breadcrumbLabel: "What Is a Personalised Audio Story?",
    sections: [
      {
        h2: "How personalisation works",
        body: `At The Private Story, personalisation begins with a short creative brief: you tell us the genre (romance, erotica, dark romance, thriller), the tone (tender, intense, slow-burn), the character genders and dynamic, and any specific scenes or settings you want to explore. An AI author then constructs a story specifically for you — no generic template, no recycled plot. The result is a 5–15 minute audio story that feels written and performed for your ears only.<br><br>Personalisation goes beyond surface-level name insertion. The emotional arc, the pacing, the sensory details — these all reflect the brief you provided. If you asked for slow-burn tension between two rivals, that is what builds in the narrative. If you wanted something tender and melancholic, the prose reflects that register.`,
      },
      {
        h2: "Why personalised audio stories exist",
        body: `Generic romance audiobooks are written for the widest possible audience. They compromise — softening scenes that some readers might find too intense, or leaning into tropes that are commercially safe. A personalised audio story has no such constraint. It is written for one person: you.<br><br>This matters especially for women who want erotic fiction that genuinely reflects their inner world — not a publisher's idea of what women are supposed to want. <a href="/personalised-audio-stories">Personalised audio stories</a> are a direct response to that gap in the market.`,
      },
      {
        h2: "Personalised vs custom vs bespoke — what is the difference?",
        body: `These three words are often used interchangeably, but there are nuances. A <em>custom</em> story implies a one-off commission, usually expensive and slow. A <em>bespoke</em> story implies a high level of craft and handmade quality. A <em>personalised</em> story implies that the content is specifically shaped around your stated preferences — which is exactly what happens at The Private Story. We use the word personalised because the creative output adapts to your input, not the other way around.<br><br>Explore <a href="/private-audio-stories">private audio stories</a> to understand how privacy and personalisation intersect in our approach.`,
      },
      {
        h2: "The role of AI in personalised audio storytelling",
        body: `AI makes personalisation scalable. Without it, a truly bespoke audio story would require commissioning a human writer, a voice actor, and an audio engineer — costing hundreds of pounds and weeks of time. With AI, you can receive a personalised story within minutes, at a fraction of that cost, without sacrificing narrative quality.<br><br>The Private Story uses large language models for story generation and professional-grade AI voice synthesis for narration. Every story is reviewed for coherence, tone, and quality before delivery. The goal is a listening experience that feels human — because the creative vision behind it is yours.`,
      },
      {
        h2: "Who listens to personalised audio stories?",
        body: `Our listeners are predominantly women aged 25–45 who already consume romance fiction or literary erotica in other formats. Many are audiobook subscribers who want something more tailored. Some are podcast listeners who enjoy narrative audio but find true crime and interview formats too passive. Others are simply people who have never found fiction that matches what they privately imagine.<br><br>If you want to try one, <a href="/create-your-own-audio-story">create your own audio story</a> in under two minutes.`,
      },
    ],
    faqs: [
      {
        q: "Is a personalised audio story the same as an audiobook?",
        a: "No. An audiobook is a recording of a previously published book — written for a mass audience. A personalised audio story is created specifically for you, based on your brief. It has never been written before and will not be sold to anyone else.",
      },
      {
        q: "How long does a personalised audio story take to create?",
        a: "At The Private Story, most stories are generated and available to listen within a few minutes of completing your creative brief. Longer or more complex stories may take up to 30 minutes.",
      },
      {
        q: "Can I request explicit content in a personalised audio story?",
        a: "Yes. The Private Story supports adult content including erotica, dark romance, and explicit scenes — provided you are 18 or over and have verified your age. All adult content is delivered privately and securely.",
      },
      {
        q: "How is my story kept private?",
        a: "Your story is stored securely and is never shared, sold, or used as training data. Each story belongs to you alone. We do not display story titles or content in public-facing areas of the platform.",
      },
      {
        q: "What formats are personalised audio stories delivered in?",
        a: "Stories are delivered as streamable audio within your account. You can also download them as MP3 files for offline listening.",
      },
    ],
    relatedLinks: [
      { label: "Personalised audio stories", href: "/personalised-audio-stories" },
      { label: "Private audio stories", href: "/private-audio-stories" },
      { label: "Create your own audio story", href: "/create-your-own-audio-story" },
    ],
  },
  {
    slug: "what-is-audio-erotica",
    metaTitle: "What Is Audio Erotica? Definition & Guide | The Private Story",
    metaDescription:
      "Audio erotica defined: sensual and explicit fiction delivered as spoken audio. Discover how it works, why women prefer it, and how AI has transformed the format.",
    badge: "Definition",
    h1: "What Is Audio Erotica?",
    tagline: "Explicit literary fiction for your ears — intimate, private, and crafted to stimulate the imagination rather than the eyes.",
    term: "Audio Erotica",
    definition:
      "Audio erotica is a genre of spoken-word content in which explicit or sensual sexual fiction is narrated aloud, typically for the purpose of arousal or entertainment. Unlike visual pornography, audio erotica is text-based in origin and relies on voice, pacing, language, and imagination to create an immersive experience.",
    inDefinedTermSet: "Audio Storytelling Glossary",
    breadcrumbLabel: "What Is Audio Erotica?",
    sections: [
      {
        h2: "How audio erotica differs from visual pornography",
        body: `Audio erotica is a completely different medium to visual pornography. It is literary in origin — the content begins as written fiction, then is narrated. The stimulation is cognitive and imaginative rather than visual. Many women prefer audio erotica precisely because it does not require looking at anything, and because the narrative context — who the characters are, why they want each other, what the emotional stakes are — is as important as the physical description.<br><br>Research consistently shows that women respond more strongly to narrative context in sexual content than men, on average. Audio erotica is built around that insight. Explore <a href="/audio-erotica-for-women">audio erotica for women</a> to see how this translates into a platform built specifically for female listeners.`,
      },
      {
        h2: "The role of voice in audio erotica",
        body: `Voice is everything in audio erotica. The cadence of a sentence, the pause before a key word, the warmth or edge in a narrator's tone — these are the instruments that audio erotica uses. A well-narrated piece of erotic fiction creates an intimacy that no other format matches. It feels like someone is speaking directly to you.<br><br>At The Private Story, narration is handled by professional-grade AI voice synthesis, with careful attention to pacing, breath, and emotional register. The voice feels human because the writing behind it is crafted to be read aloud. Every story begins with your brief — <a href="/create">create yours</a> in under two minutes.`,
      },
      {
        h2: "Is audio erotica the same as an erotic audiobook?",
        body: `Not exactly. An erotic audiobook is a commercial recording of a published erotic novel — written for a mass market, narrated professionally, sold widely. Audio erotica is a broader term that includes any spoken erotic content, from standalone short stories to longer serialised fiction.<br><br><a href="/erotic-audio-stories">Erotic audio stories</a> on The Private Story are explicitly personalised — the content is shaped by your preferences, not a publisher's commercial calculations. See also our guide to <a href="/personalised-audio-stories">personalised audio stories</a> for a full explanation of how the creation process works.`,
      },
      {
        h2: "Why AI has transformed audio erotica",
        body: `Before AI, high-quality audio erotica required a writer, a voice actor, and a recording setup. This made truly bespoke erotic audio prohibitively expensive for most people. AI-powered platforms like The Private Story have changed that fundamentally. You can now receive a personalised, narrated erotic story based on your specific brief within minutes — at a subscription price comparable to a streaming service.<br><br>This is particularly significant for women, who historically have had limited options in erotic content that genuinely reflected their tastes and imagination. AI makes personalisation at scale possible for the first time.`,
      },
      {
        h2: "Legal and consent considerations",
        body: `Audio erotica depicting adults is legal in the United Kingdom and most Western jurisdictions. The Private Story operates under UK law and requires all users to verify their age before accessing explicit content. All content generated on the platform depicts fictional adults in consensual scenarios. Content involving minors, non-consensual scenarios presented approvingly, or other illegal content is strictly prohibited and technically prevented.`,
      },
    ],
    faqs: [
      {
        q: "Is audio erotica legal in the UK?",
        a: "Yes. Audio erotica depicting fictional adults in consensual scenarios is legal in the UK. The Private Story complies with UK legislation and requires age verification for explicit content.",
      },
      {
        q: "Is audio erotica the same as ASMR?",
        a: "No. ASMR (Autonomous Sensory Meridian Response) content is designed to produce a tingling, relaxing sensation through quiet sounds. Audio erotica is explicitly sexual fiction narrated aloud. The formats sometimes overlap — some audio erotica uses whispered narration — but they are distinct genres.",
      },
      {
        q: "Can audio erotica be personalised?",
        a: "Yes, and this is increasingly the expectation. Platforms like The Private Story allow you to specify genre, tone, character dynamics, and explicit detail level, producing a story crafted for your preferences rather than a generic audience.",
      },
      {
        q: "How explicit is audio erotica on The Private Story?",
        a: "You control the level of explicitness when you create your brief. Options range from sensual and suggestive to fully explicit. Adult content is only available to verified users aged 18 and over.",
      },
      {
        q: "Is my listening history private?",
        a: "Completely. Your stories, preferences, and listening history are never shared, sold, or displayed publicly. Privacy is a foundational design principle of The Private Story — not a feature added later.",
      },
    ],
    relatedLinks: [
      { label: "Audio erotica for women", href: "/audio-erotica-for-women" },
      { label: "Erotic audio stories", href: "/erotic-audio-stories" },
      { label: "Personalised audio stories", href: "/personalised-audio-stories" },
    ],
  },
  {
    slug: "what-is-slow-burn-romance",
    metaTitle: "What Is Slow Burn Romance? Definition & Examples | The Private Story",
    metaDescription:
      "Slow burn romance defined: extended tension, emotional intimacy, and delayed gratification. Learn why it dominates the romance genre and how to request it in your audio story.",
    badge: "Definition",
    h1: "What Is Slow Burn Romance?",
    tagline: "The long game of desire — stories where the tension builds so slowly it becomes almost unbearable before the reward arrives.",
    term: "Slow Burn Romance",
    definition:
      "Slow burn romance is a sub-genre of romantic fiction in which the development of the central romantic and/or sexual relationship unfolds gradually over an extended period. The tension — emotional, intellectual, and physical — accumulates deliberately, and the payoff (a confession, a first kiss, a consummation) is withheld until late in the narrative.",
    inDefinedTermSet: "Romance Fiction Glossary",
    breadcrumbLabel: "What Is Slow Burn Romance?",
    sections: [
      {
        h2: "Why slow burn romance works psychologically",
        body: `The appeal of slow burn romance is rooted in anticipation. Neuroscientific research on reward systems shows that dopamine — the neurotransmitter associated with pleasure — is released most intensely not when a reward arrives, but when it is expected and its timing is uncertain. Slow burn romance exploits this mechanism deliberately. The reader or listener knows the two characters will eventually come together; the pleasure lies in the not-yet.<br><br>This is why slow burn is particularly popular among women readers, who consistently report preferring narrative context and emotional depth in romantic fiction over immediate physical resolution. The relationship has to feel earned.`,
      },
      {
        h2: "Key features of a slow burn narrative",
        body: `A slow burn romance typically includes: an early meeting that establishes chemistry without resolution; a series of near-misses, misunderstandings, or deliberate denials; growing emotional intimacy that precedes physical intimacy; obstacles — internal or external — that create plausible reasons for the delay; and a payoff scene that is proportionate to the build-up. The best slow burn stories make the wait feel inevitable in retrospect. Every detail contributed to the tension.`,
      },
      {
        h2: "Slow burn vs enemies-to-lovers vs forced proximity",
        body: `Slow burn is a pacing structure, not a plot archetype. It can combine with many other romance tropes: enemies-to-lovers (two characters who begin in conflict slowly discover their attraction); forced proximity (characters thrown together by circumstance); or forbidden romance (where external barriers create the delay). Most enemies-to-lovers stories are slow burns by nature, because the shift from antagonism to attraction requires time and narrative work to feel credible.<br><br>If you want to explore <a href="/what-is-enemies-to-lovers">enemies-to-lovers</a> as a separate concept, we have a definition page for that too.`,
      },
      {
        h2: "Requesting slow burn in a personalised audio story",
        body: `When you create a story at The Private Story, you can specify slow burn as the desired pacing. This instructs the story generator to withhold resolution, build tension through charged interactions, and prioritise emotional intimacy over immediate physicality. You can combine slow burn with other preferences — dark romance, explicit content, specific character archetypes — and the pacing will adapt to your brief.<br><br>Explore <a href="/personalised-audio-stories">personalised audio stories</a> to understand how your preferences shape the narrative.`,
      },
      {
        h2: "Famous slow burn examples in romance fiction",
        body: `Without naming specific titles, slow burn romance is the dominant structure of romantasy (romantic fantasy) and new adult romance — two of the fastest-growing segments of the fiction market. It is also the backbone of most fan fiction, where extended tension across a long narrative is standard. The slow burn structure translates particularly well to audio, because the listener experiences the delay in real time, making the tension more visceral than in text. You can explore our <a href="/slow-burn-audio-stories">slow burn audio stories</a> page to see how the format works in practice, or <a href="/create">create your own slow burn story</a> right now.`,
      },
    ],
    faqs: [
      {
        q: "What is the difference between slow burn and will-they-won't-they?",
        a: "Will-they-won't-they is a specific plot device — usually used in television — where the romantic resolution is deliberately unclear to the audience. Slow burn is a pacing structure in which the resolution is expected but delayed. All will-they-won't-they is slow burn, but not all slow burn is will-they-won't-they.",
      },
      {
        q: "How long should a slow burn romance be?",
        a: "There is no fixed length. Short slow burns (5,000–15,000 words or equivalent audio) compress the tension into a single charged encounter. Novel-length slow burns unfold over 80,000–120,000 words. In audio stories, the length of the piece determines how compressed or expanded the build-up can be.",
      },
      {
        q: "Can slow burn romance include explicit content?",
        a: "Yes. The slow burn structure refers to timing and pacing, not content level. A slow burn story can be entirely non-explicit, or it can build to an extremely explicit payoff. The Private Story allows you to choose the level of explicitness in your brief.",
      },
      {
        q: "Is slow burn the same as a slow romance?",
        a: "Broadly yes, though 'slow romance' is not a formal genre term. 'Slow burn' is the established phrase used by romance readers and writers to describe this pacing structure.",
      },
      {
        q: "Can I request slow burn in my personalised audio story?",
        a: "Yes. Simply mention slow burn pacing in your story brief when you create your story at The Private Story. The narrative will be structured to build tension gradually and delay the emotional and physical resolution.",
      },
    ],
    relatedLinks: [
      { label: "What is enemies-to-lovers?", href: "/what-is-enemies-to-lovers" },
      { label: "What is dark romance?", href: "/what-is-dark-romance" },
      { label: "Personalised audio stories", href: "/personalised-audio-stories" },
    ],
  },
  {
    slug: "what-is-dark-romance",
    metaTitle: "What Is Dark Romance? Definition & Guide | The Private Story",
    metaDescription:
      "Dark romance defined: morally complex characters, unconventional power dynamics, and transgressive themes in romantic fiction. A genre guide with context and nuance.",
    badge: "Definition",
    h1: "What Is Dark Romance?",
    tagline: "Romantic fiction that goes where mainstream stories won't — into moral complexity, power, danger, and the parts of desire that don't fit neatly into daylight.",
    term: "Dark Romance",
    definition:
      "Dark romance is a sub-genre of romantic fiction characterised by morally complex or ambiguous protagonists, unconventional power dynamics, transgressive themes (including dubious consent, obsession, captivity, or violence), and an emotional intensity that often exceeds mainstream romance. The genre does not guarantee a traditional happy ending, though it typically resolves with the central relationship intact.",
    inDefinedTermSet: "Romance Fiction Glossary",
    breadcrumbLabel: "What Is Dark Romance?",
    sections: [
      {
        h2: "What makes a romance 'dark'?",
        body: `The darkness in dark romance operates on several levels simultaneously. Thematically, it explores desire in contexts that mainstream fiction avoids — obsession, captivity, moral complicity, anti-hero love interests who have done genuinely terrible things. Tonally, it is often more intense, more atmospheric, and less reassuring than conventional romance. The reader or listener is not always comfortable; that discomfort is part of the point.<br><br>Crucially, dark romance is fiction. The appeal lies in the safety of exploring these dynamics through narrative — a controlled, consensual encounter with scenarios that would be intolerable in reality. This is what psychologists call 'the paradox of fiction': we can feel genuine emotions in response to events we know are not real, and we can safely explore desires we would not want enacted in our lives.`,
      },
      {
        h2: "Common tropes in dark romance",
        body: `Dark romance has developed a recognisable lexicon of tropes: the 'morally grey' hero (or anti-hero) who operates outside conventional ethics; the 'dark captive' setup (two characters confined together under duress); stalker romance (an obsessive love interest whose surveillance of the protagonist is portrayed with ambivalence); and 'dark forced proximity' (situations where the power imbalance is explicit and central to the tension). These tropes are not endorsements; they are narrative scaffolding for exploring complex emotional territory. Many of these dynamics naturally pair with <a href="/what-is-enemies-to-lovers">enemies-to-lovers</a> structures, where the original antagonism gives the dark dynamic its credibility.`,
      },
      {
        h2: "Who reads dark romance and why?",
        body: `Dark romance is predominantly read by women. This is not a contradiction — it reflects the fact that women's erotic and romantic imaginations are more complex and varied than mainstream media tends to acknowledge. Research on fantasy content consistently finds that women are more likely than men to engage in fantasy scenarios involving power imbalance, even among women who hold strongly egalitarian values. Dark romance provides a literary space for that exploration.<br><br><a href="/adult-bedtime-stories">Adult bedtime stories</a> on The Private Story can incorporate dark romance tones and tropes at your request.`,
      },
      {
        h2: "Dark romance vs paranormal romance vs romantasy",
        body: `These genres overlap significantly but are distinct. Paranormal romance involves supernatural elements (vampires, werewolves, fae) but is not necessarily dark in tone — though many paranormal romances are. Romantasy (romantic fantasy) is a broader category that spans light and dark. Dark romance is defined by its tonal and thematic qualities rather than its setting — a contemporary dark romance set in a crime family is as much 'dark romance' as a fantasy novel featuring a fae king with questionable ethics.`,
      },
      {
        h2: "Requesting dark romance in a personalised audio story",
        body: `At The Private Story, dark romance is a fully supported genre. When you create your brief, you can specify morally grey characters, power imbalances, specific dark tropes, and content intensity. The story will be constructed around your preferences — including explicit content if requested. All content, including dark themes, depicts fictional adults and is handled with narrative craft rather than gratuitousness.<br><br>Explore <a href="/personalised-erotica">personalised erotica</a> to understand how explicit dark romance stories are created, or <a href="/create">create your own dark romance story</a> in under two minutes.`,
      },
    ],
    faqs: [
      {
        q: "Is dark romance the same as erotica?",
        a: "Not necessarily. Dark romance can be entirely non-explicit — the darkness refers to tone and theme, not sexual content level. However, dark romance and erotica frequently overlap, and many dark romance stories are explicitly sexual. At The Private Story, you control both the darkness level and the explicitness level independently.",
      },
      {
        q: "Are dark romance stories promoting harmful behaviour?",
        a: "No. Dark romance is fiction, and its readers understand the distinction between fantasy and reality. Decades of research on fiction consumption find no evidence that reading dark or transgressive fiction causes harmful behaviour. The genre has existed for centuries — gothic novels, villainous anti-heroes, transgressive desire — under different names.",
      },
      {
        q: "What is the most popular dark romance trope?",
        a: "Morally grey hero and enemies-to-lovers are consistently the most-requested tropes in dark romance. Stalker romance and dark captive scenarios are also extremely popular, particularly in audio formats where the narrator's voice adds an additional layer of intimacy.",
      },
      {
        q: "Can dark romance have a happy ending?",
        a: "Yes, though the 'happy ending' in dark romance is often unconventional. The central couple typically remains together, but the resolution may involve moral compromise, ongoing intensity, or an ending that is satisfying rather than tidy.",
      },
      {
        q: "How do I request dark romance at The Private Story?",
        a: "When you create your story brief, select 'dark romance' as your genre and specify any tropes you want to include — enemies-to-lovers, morally grey characters, power imbalance, and so on. You can also specify the level of explicitness. The story will be built around your preferences.",
      },
    ],
    relatedLinks: [
      { label: "What is enemies-to-lovers?", href: "/what-is-enemies-to-lovers" },
      { label: "What is slow burn romance?", href: "/what-is-slow-burn-romance" },
      { label: "Personalised erotica", href: "/personalised-erotica" },
    ],
  },
  {
    slug: "what-is-enemies-to-lovers",
    metaTitle: "What Is Enemies-to-Lovers? Romance Trope Defined | The Private Story",
    metaDescription:
      "Enemies-to-lovers defined: the romance trope where antagonism transforms into desire. Why it works, how it's written, and how to request it in your audio story.",
    badge: "Definition",
    h1: "What Is Enemies-to-Lovers?",
    tagline: "The romance trope built on a simple, electric premise: the person you hate most is also the person you cannot stop thinking about.",
    term: "Enemies-to-Lovers",
    definition:
      "Enemies-to-lovers is a romance fiction trope in which the central relationship begins in a state of active antagonism — the two characters dislike, oppose, or compete with each other — and gradually transforms into romantic and/or sexual attraction. The tension generated by the conflict fuels the chemistry, making the eventual resolution more satisfying.",
    inDefinedTermSet: "Romance Fiction Glossary",
    breadcrumbLabel: "What Is Enemies-to-Lovers?",
    sections: [
      {
        h2: "Why enemies-to-lovers is the most popular romance trope",
        body: `Enemies-to-lovers consistently ranks as the most requested romance trope in reader surveys and on fiction platforms. Its appeal is structural: conflict generates tension, tension generates desire, and desire is the engine of romantic fiction. When two characters actively antagonise each other, every interaction is charged. The reader or listener knows where this is going — but the journey is the point.<br><br>The trope also offers something rare in romance: both characters have to change. The enemies-to-lovers arc requires each character to revise their understanding of the other, which creates genuine character development rather than simple attraction. The relationship feels earned in a way that immediate chemistry does not.`,
      },
      {
        h2: "The psychology behind enemies-to-lovers attraction",
        body: `There is a well-documented psychological phenomenon called 'misattribution of arousal' — the tendency to interpret physiological arousal from one source (conflict, fear, excitement) as attraction to a nearby person. This may partly explain why antagonism between characters reads as erotic potential. In fiction, writers exploit this deliberately: the conflict creates physical and emotional agitation, and the reader's imagination translates that agitation into desire.<br><br>Enemies-to-lovers also provides the cognitive satisfaction of resolution. The antagonism is a puzzle; the romance is the solution. When the two characters finally give in, the reader experiences not just romantic satisfaction but the pleasure of a narrative problem resolved.`,
      },
      {
        h2: "Enemies-to-lovers vs rivals-to-lovers vs frenemies-to-lovers",
        body: `These variants are closely related but have distinct flavours. Enemies-to-lovers implies genuine antagonism — the characters may actively harm or oppose each other. Rivals-to-lovers (sometimes called 'rivals' or 'competition romance') involves two characters competing for the same goal, with mutual respect beneath the competition. Frenemies-to-lovers involves two characters who are outwardly friendly but secretly (or privately) in tension. All three are slow burn by nature, but the intensity of the original conflict varies.`,
      },
      {
        h2: "Enemies-to-lovers in audio stories",
        body: `The trope translates exceptionally well to audio format. Narrated dialogue — particularly terse, charged exchanges between characters who are pretending not to want each other — is one of the most effective tools in audio storytelling. The listener hears the subtext in the narrator's voice. The pause before a cutting remark, the breath that follows an accidental touch — audio makes these moments more visceral than text.<br><br><a href="/what-is-slow-burn-romance">Slow burn romance</a> and enemies-to-lovers are the most frequent combination requested at The Private Story.`,
      },
      {
        h2: "Requesting enemies-to-lovers in your personalised story",
        body: `When creating your story brief at The Private Story, you can specify enemies-to-lovers as the core trope and combine it with other preferences: slow burn pacing, dark romance tone, specific character archetypes (a cold, brilliant antagonist; a rival in a professional setting), and your preferred level of explicitness. The story will be constructed to honour the trope's essential structure — genuine antagonism that transforms through charged interaction.<br><br>See also <a href="/personalised-audio-stories">personalised audio stories</a> and <a href="/ai-romance-stories-for-women">AI romance stories for women</a>.`,
      },
    ],
    faqs: [
      {
        q: "Is enemies-to-lovers always a slow burn?",
        a: "Almost always. The trope depends on a credible transformation from antagonism to attraction, which requires time and narrative work. A story where two enemies are immediately attracted is more accurately 'hate-at-first-sight' or 'frenemy attraction' — not a full enemies-to-lovers arc.",
      },
      {
        q: "Can enemies-to-lovers include dark romance elements?",
        a: "Yes, and it frequently does. When the antagonism is more extreme — genuine threat, power imbalance, morally complex behaviour — the story enters dark romance territory. The Private Story supports the full spectrum from light rivals-to-lovers to dark, intense enemies-to-lovers.",
      },
      {
        q: "Do both characters have to be enemies, or just one?",
        a: "Classically, both characters begin as antagonists. However, many popular variations feature one character who actively dislikes the other while the second character is secretly, reluctantly attracted from the start — sometimes called 'one-sided enemies-to-lovers' or 'oblivious pining'.",
      },
      {
        q: "What makes enemies-to-lovers different from forced proximity?",
        a: "Forced proximity is a situational device — characters are thrown together by circumstance. Enemies-to-lovers is a relational arc — characters begin in conflict and move toward love. The two tropes frequently combine: rivals forced to work together, enemies trapped in the same space. Each device intensifies the other.",
      },
      {
        q: "How do I request enemies-to-lovers in my audio story?",
        a: "When creating your brief at The Private Story, specify enemies-to-lovers as the core trope. You can add detail: the professional or personal context for the antagonism, the character archetypes, the slow burn pacing, and the level of explicitness. The story will be built around the trope's structure.",
      },
    ],
    relatedLinks: [
      { label: "What is slow burn romance?", href: "/what-is-slow-burn-romance" },
      { label: "What is dark romance?", href: "/what-is-dark-romance" },
      { label: "AI romance stories for women", href: "/ai-romance-stories-for-women" },
    ],
  },
];

DEFINITION_PAGES.forEach((def) => {
  router.get(`/${def.slug}`, (_req, res) => {
    const BASE = "https://theprivatestory.com";
    const PAGE_URL = `${BASE}/${def.slug}`;

    const definedTermSchema = {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      name: def.term,
      description: def.definition,
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        name: def.inDefinedTermSet,
        url: `${BASE}/`,
      },
      url: PAGE_URL,
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: def.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
        { "@type": "ListItem", position: 2, name: def.breadcrumbLabel, item: PAGE_URL },
      ],
    };

    const webPage = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: def.metaTitle,
      description: def.metaDescription,
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    };

    const relatedLinksHtml = def.relatedLinks
      .map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`)
      .join("");

    const faqsHtml = `
      <section>
        <h2>Frequently asked questions</h2>
        <div class="faq-list">
          ${def.faqs
            .map(
              (f) => `
          <div class="faq-item">
            <div class="faq-q">${esc(f.q)}</div>
            <div class="faq-a">${esc(f.a)}</div>
          </div>`,
            )
            .join("")}
        </div>
      </section>`;

    const sectionsHtml = def.sections
      .map(
        (s) => `
      <section>
        <h2>${esc(s.h2)}</h2>
        <p>${s.body}</p>
      </section>`,
      )
      .join("");

    const bodyHtml = `
      <div class="defined-term-box">
        <h2>Definition</h2>
        <p>${esc(def.definition)}</p>
      </div>
      ${TRUST_BAR_HTML}
      ${sectionsHtml}
      ${faqsHtml}
      <section>
        <h2>Related reading</h2>
        <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:8px">
          ${relatedLinksHtml}
        </ul>
      </section>
      <section style="text-align:center;padding:40px 0">
        <p style="margin-bottom:20px;color:#a09080">Ready to hear a story shaped around your imagination?</p>
        <a class="cta-primary" href="/create">Create your personalised story</a>
      </section>
      ${EXPLORE_HTML}`;

    const html = ssrHtmlShell({
      title: def.metaTitle,
      description: def.metaDescription,
      canonical: PAGE_URL,
      h1: def.h1,
      badge: def.badge,
      tagline: def.tagline,
      bodyHtml,
      schemas: [definedTermSchema, faqSchema, breadcrumb, webPage],
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", CACHE_1D);
    res.status(200).send(html);
  });
});

/* ─────────────────────────────────────────
   COMPETITOR ALTERNATIVE PAGES  (2)
   ───────────────────────────────────────── */

interface CompetitorPageConfig {
  slug: string;
  competitorName: string;
  metaTitle: string;
  metaDescription: string;
  badge: string;
  h1: string;
  tagline: string;
  intro: string;
  comparisonRows: { feature: string; thePrivateStory: string; competitor: string }[];
  sections: { h2: string; body: string }[];
  faqs: { q: string; a: string }[];
}

const COMPETITOR_PAGES: CompetitorPageConfig[] = [
  {
    slug: "dipsea-alternative",
    competitorName: "Dipsea",
    metaTitle: "Looking for a Dipsea Alternative? | The Private Story",
    metaDescription:
      "Comparing Dipsea and The Private Story for audio erotica? See how personalised, AI-crafted stories differ from Dipsea's curated library approach.",
    badge: "Compare",
    h1: "Looking for a Dipsea Alternative?",
    tagline: "Dipsea offers a curated library. The Private Story writes your story — shaped around your imagination, not a catalogue.",
    intro: `Dipsea is one of the best-known audio erotica platforms, and for good reason — its production quality is high and its catalogue is substantial. If you are looking for a Dipsea alternative, you are probably looking for something different: more personalisation, a different content direction, or a different relationship between the listener and the story. This page explains honestly what The Private Story does differently, so you can decide which experience is right for you.`,
    comparisonRows: [
      { feature: "Content model", thePrivateStory: "AI-generated, personalised to your brief", competitor: "Human-authored, curated library" },
      { feature: "Personalisation", thePrivateStory: "Every story shaped by your preferences", competitor: "Fixed content; you choose from existing stories" },
      { feature: "Privacy", thePrivateStory: "Stories never shared or displayed publicly", competitor: "Library content visible to all subscribers" },
      { feature: "Content range", thePrivateStory: "Full spectrum including explicit adult content and dark romance", competitor: "Sensual to explicit; curated range" },
      { feature: "Pricing model", thePrivateStory: "Monthly or annual subscription", competitor: "Monthly subscription" },
      { feature: "Story length", thePrivateStory: "5–15 minutes per story, generated on demand", competitor: "Short stories and series in curated library" },
    ],
    sections: [
      {
        h2: "What Dipsea does well",
        body: `Dipsea has built a significant library of high-quality audio erotica, produced with professional writers and voice actors. The platform has done important work in normalising audio erotica for women — it launched in 2018 when the category was barely visible. Its guided meditation and mindfulness content is also genuinely useful for some listeners. If you are looking for a curated, professionally produced library and are happy to choose from existing stories, Dipsea is a strong option.`,
      },
      {
        h2: "What The Private Story does differently",
        body: `The Private Story is built around a different principle: your story should be created for you, not chosen from a catalogue. When you write your brief — the characters, the dynamic, the tone, the explicit detail level — you receive a story that has never existed before and will never be shared with another user. This is not a variation on an existing template; it is a story written around the specific texture of what you want to hear.<br><br>This matters if you have a very specific imaginative world you want to inhabit, or if you have found that existing erotic content — however good — never quite fits. It also matters if privacy is paramount to you: at The Private Story, your stories are yours alone, stored securely and never displayed in any public-facing area of the platform.`,
      },
      {
        h2: "Which platform is right for you?",
        body: `Choose Dipsea if you want a curated library of professionally produced short stories and are happy browsing what exists. Choose The Private Story if you want a story written specifically for you, based on your brief, with no compromise on personalisation or privacy. Both platforms are designed for women; both take the format seriously. The difference is between choosing from a menu and having the dish made to your specifications.<br><br>See also <a href="/alternatives-to-romance-audiobooks">alternatives to romance audiobooks</a> for a broader look at the landscape, or <a href="/personalised-audio-stories">personalised audio stories</a> to understand our approach in depth.`,
      },
    ],
    faqs: [
      {
        q: "Is The Private Story cheaper than Dipsea?",
        a: "Pricing changes over time; please check each platform's current pricing page for accurate comparison. The Private Story offers both monthly and annual subscription options.",
      },
      {
        q: "Does The Private Story have as much content as Dipsea?",
        a: "Dipsea has a larger pre-existing library. The Private Story generates new content on demand — so your library grows with every story you create. If breadth of pre-existing content matters most, Dipsea may have the advantage. If you want content created for you specifically, The Private Story is purpose-built for that.",
      },
      {
        q: "Is the audio quality on The Private Story comparable to Dipsea?",
        a: "The Private Story uses professional-grade AI voice synthesis. Dipsea uses human voice actors. Both produce high-quality audio; the character of the voice differs. Human narration has organic imperfections that many listeners find warmer; AI narration is consistent and configurable.",
      },
      {
        q: "Can I use both Dipsea and The Private Story?",
        a: "Yes. Many listeners use curated platforms for browsing and discovery, and use The Private Story when they want something created specifically for them. The two approaches complement each other.",
      },
      {
        q: "Does The Private Story have a free trial?",
        a: "Please check the current pricing page for trial or introductory offers. Availability may change over time.",
      },
    ],
  },
  {
    slug: "quinn-alternative",
    competitorName: "Quinn",
    metaTitle: "Looking for a Quinn Alternative? | The Private Story",
    metaDescription:
      "Comparing Quinn and The Private Story for audio erotica? See how AI-personalised stories differ from Quinn's community-driven audio content platform.",
    badge: "Compare",
    h1: "Looking for a Quinn Alternative?",
    tagline: "Quinn is a community platform for erotic audio. The Private Story is a private studio — writing stories shaped around your imagination alone.",
    intro: `Quinn is a well-established audio erotica platform with a community-driven model: creators post audio content, listeners discover and follow creators, and the content ranges from amateur recordings to professionally produced pieces. If you are looking for a Quinn alternative, you may want something more private, more personalised, or with a different content model. This page explains honestly what The Private Story does differently.`,
    comparisonRows: [
      { feature: "Content model", thePrivateStory: "AI-generated stories personalised to your brief", competitor: "Community-uploaded creator content" },
      { feature: "Personalisation", thePrivateStory: "Every story written for your specific preferences", competitor: "Browse and follow creators; no personalisation" },
      { feature: "Privacy", thePrivateStory: "All content private; stories never shared publicly", competitor: "Public-facing platform; creator profiles visible" },
      { feature: "Content quality", thePrivateStory: "Consistent, professionally crafted narrative fiction", competitor: "Variable — amateur to professional creator range" },
      { feature: "Creator economy", thePrivateStory: "Not applicable (platform-generated content)", competitor: "Supports independent audio creators" },
      { feature: "Story ownership", thePrivateStory: "Your story belongs to you; never resold or repurposed", competitor: "Creator retains ownership; content may be paywalled" },
    ],
    sections: [
      {
        h2: "What Quinn does well",
        body: `Quinn has built a meaningful community of audio erotica creators and listeners. The platform supports independent creators — writers, voice actors, and storytellers — who produce a huge variety of content. The discovery model (following creators, exploring categories) works well for listeners who enjoy browsing and finding new voices. Quinn also has a strong community feel, with comments, feedback, and creator–listener relationships that some users value highly.`,
      },
      {
        h2: "What The Private Story does differently",
        body: `The Private Story operates on a completely different model. There are no creators to follow, no community, and no public-facing content. Every story is written for you — by an AI author working from your brief — and delivered to your private account. Nobody else will hear your story. Nobody else knows it exists.<br><br>This matters if privacy is important to you: the community model that makes Quinn vibrant also means that the platform has a social, visible dimension. At The Private Story, the entire experience is between you and the story. There is no discovery feed, no creator profiles, no public space at all. Just your imagination, and a story written to inhabit it.<br><br>See <a href="/private-audio-stories">private audio stories</a> for more on how privacy shapes our approach.`,
      },
      {
        h2: "Which platform is right for you?",
        body: `Choose Quinn if you enjoy discovering different creator voices, want to support independent audio creators, and value a community feel. Choose The Private Story if you want a story created specifically for you — based on your brief, private, and never shared. Both platforms serve the audio erotica audience, but the experience is fundamentally different in character.<br><br>For a broader comparison of the landscape, see <a href="/alternatives-to-romance-audiobooks">alternatives to romance audiobooks</a>, or explore <a href="/audio-erotica-for-women">audio erotica for women</a> to understand our content range.`,
      },
    ],
    faqs: [
      {
        q: "Is The Private Story more expensive than Quinn?",
        a: "Please check each platform's current pricing page. Quinn offers both free and premium content; The Private Story operates on a subscription model. Pricing may change over time.",
      },
      {
        q: "Can I request specific types of content on The Private Story like I can on Quinn?",
        a: "Yes — in fact, personalisation is the core premise of The Private Story. Rather than finding a creator who produces the content you want, you write a brief and receive a story built around your specific preferences.",
      },
      {
        q: "Does The Private Story have human voice actors like Quinn creators?",
        a: "The Private Story uses professional-grade AI voice synthesis rather than human creators. The audio quality is high, but the character of the voice differs from a human recording. Many listeners find AI narration intimate and consistent; others prefer human warmth. Both have genuine merits.",
      },
      {
        q: "Is the content on The Private Story explicit?",
        a: "Yes. The Private Story supports the full spectrum from sensual and suggestive to fully explicit adult content, including dark romance and erotic fiction. All explicit content is available only to age-verified users aged 18 and over.",
      },
      {
        q: "Can I use both Quinn and The Private Story?",
        a: "Yes. The platforms serve different needs: Quinn for discovering and following creators; The Private Story for receiving a story written specifically for you. Many listeners use both for different purposes.",
      },
    ],
  },
];

COMPETITOR_PAGES.forEach((comp) => {
  router.get(`/${comp.slug}`, (_req, res) => {
    const BASE = "https://theprivatestory.com";
    const PAGE_URL = `${BASE}/${comp.slug}`;

    const tableHtml = `
      <section>
        <table class="competitor-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>The Private Story</th>
              <th>${esc(comp.competitorName)}</th>
            </tr>
          </thead>
          <tbody>
            ${comp.comparisonRows
              .map(
                (r) => `
            <tr>
              <td>${esc(r.feature)}</td>
              <td>${esc(r.thePrivateStory)}</td>
              <td>${esc(r.competitor)}</td>
            </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </section>`;

    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `The Private Story vs ${comp.competitorName} — Feature Comparison`,
      itemListElement: comp.comparisonRows.map((r, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: r.feature,
        description: `The Private Story: ${r.thePrivateStory}. ${comp.competitorName}: ${r.competitor}`,
      })),
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: comp.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
        { "@type": "ListItem", position: 2, name: comp.h1, item: PAGE_URL },
      ],
    };

    const webPage = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: comp.metaTitle,
      description: comp.metaDescription,
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    };

    const sectionsHtml = comp.sections
      .map(
        (s) => `
      <section>
        <h2>${esc(s.h2)}</h2>
        <p>${s.body}</p>
      </section>`,
      )
      .join("");

    const faqsHtml = `
      <section>
        <h2>Frequently asked questions</h2>
        <div class="faq-list">
          ${comp.faqs
            .map(
              (f) => `
          <div class="faq-item">
            <div class="faq-q">${esc(f.q)}</div>
            <div class="faq-a">${esc(f.a)}</div>
          </div>`,
            )
            .join("")}
        </div>
      </section>`;

    const bodyHtml = `
      <p style="color:#a09080;margin-bottom:32px">${esc(comp.intro)}</p>
      ${TRUST_BAR_HTML}
      ${tableHtml}
      ${sectionsHtml}
      ${faqsHtml}
      <section style="text-align:center;padding:40px 0">
        <p style="margin-bottom:20px;color:#a09080">Ready for a story written around your imagination?</p>
        <a class="cta-primary" href="/create">Create your personalised story</a>
      </section>
      ${EXPLORE_HTML}`;

    const html = ssrHtmlShell({
      title: comp.metaTitle,
      description: comp.metaDescription,
      canonical: PAGE_URL,
      h1: comp.h1,
      badge: comp.badge,
      tagline: comp.tagline,
      bodyHtml,
      schemas: [itemListSchema, faqSchema, breadcrumb, webPage],
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", CACHE_1D);
    res.status(200).send(html);
  });
});

export default router;
