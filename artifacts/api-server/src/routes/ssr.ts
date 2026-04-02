import { Router, type IRouter, type Request, type Response } from "express";
import { seoPageMap } from "../seoPageData.js";
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

function makeBreadcrumb(items: Array<{ name: string; item: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
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
  breadcrumbId?: string;
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
    ...(opts.breadcrumbId ? { breadcrumb: { "@id": opts.breadcrumbId } } : {}),
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
    <h1>AI-Powered Private Audio Stories — Made for You</h1>
    <p class="tagline">Your story, your voice, your moment. Private, intimate, and completely yours.</p>
    <a class="cta-primary" href="/create">Create your story</a>
    ${TRUST_BAR_HTML}
    <section>
      <h2>What Is The Private Story?</h2>
      <p>The Private Story is a premium literary audio platform that generates personalised stories from your choices — not from a content library. Each story is written by AI around the emotional register, characters, and atmosphere you describe, then narrated and saved privately to your account.</p>
      <p><a href="/how-it-works">How it works →</a></p>
    </section>
    <section>
      <h2>Browse Story Types</h2>
      <p><a href="/romantic-audio-stories">Romantic</a> · <a href="/intimate-audio-stories">Intimate</a> · <a href="/dark-romance-audio-stories">Dark Romance</a> · <a href="/slow-burn-audio-stories">Slow Burn</a> · <a href="/bedtime-audio-stories">Bedtime</a> · <a href="/discover">Discover all</a></p>
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
  const breadcrumb = makeBreadcrumb([
    { name: SITE_NAME, item: SITE_URL },
    { name: page.h1, item: canonical },
  ]);
  const webPage = makeWebPage({
    name: page.title,
    description: page.description,
    url: canonical,
    breadcrumbId: `${canonical}#breadcrumb`,
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
  const page = seoPageMap.get(slug);

  if (!page) return next();

  const canonical = `${SITE_URL}/${slug}`;

  const faqSchema = makeFaqSchema(page.faqs);

  const breadcrumb = makeBreadcrumb([
    { name: SITE_NAME, item: SITE_URL },
    { name: "Discover All Story Types", item: `${SITE_URL}/discover` },
    { name: page.h1, item: canonical },
  ]);

  const webPage = makeWebPage({
    name: page.title,
    description: page.description,
    url: canonical,
    breadcrumbId: `${canonical}#breadcrumb`,
  });

  const sectionsHtml = page.sections
    .map(
      (s) => `
    <section>
      <h2>${esc(s.h2)}</h2>
      <p>${esc(s.p)}</p>
    </section>`,
    )
    .join("\n");

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

  const bodyHtml = `
    ${page.badge ? `<span class="badge">${esc(page.badge)}</span>` : ""}
    <h1>${esc(page.h1)}</h1>
    <p class="tagline">${esc(page.tagline)}</p>
    <a class="cta-primary" href="/create">Create your story</a>
    ${TRUST_BAR_HTML}
    ${sectionsHtml}
    <section>
      <h2>How It Works</h2>
      <p>Choose your mood and emotional register. The story is generated around your selections — not retrieved from a library, but written from scratch for you. Your personalised audio story is narrated and saved privately to your account.</p>
      <p><a href="/create">Create yours in under two minutes →</a></p>
    </section>
    ${faqsHtml}
    ${EXPLORE_HTML}`;

  const html = ssrHtmlShell({
    title: page.title,
    description: page.description,
    canonical,
    h1: page.h1,
    badge: page.badge,
    tagline: page.tagline,
    bodyHtml,
    schemas: [faqSchema, breadcrumb, webPage],
  });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", CACHE_1D);
  res.status(200).send(html);
});

export default router;
