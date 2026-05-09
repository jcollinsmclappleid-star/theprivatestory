import { Router, type IRouter, type Request, type Response } from "express";
import { pickMidCtaTarget, type ParagraphContent } from "@workspace/seo-data";
import { allPageConfigs } from "../seoPageData.js";
import { ssrHtmlShell, escHtml, THREE_DOORS_HTML } from "../ssrShared.js";

/**
 * Brand-compliant body-image pool for SEO pages — non-human, dark editorial
 * illustration. Mirrors the React renderer's pool so bots see the same visual
 * surface (image SEO + Discover/Image-pack eligibility).
 *
 * WebP versions: 1MB → ~50KB each (95% smaller, no perceptible quality loss).
 */
const SEO_BODY_IMAGE_POOL: string[] = [
  "images/seo-body-candlelit-doorway.webp",
  "images/seo-body-four-poster-bed.webp",
  "images/seo-body-library-at-night.webp",
  "images/seo-body-silk-on-velvet.webp",
  "images/seo-body-rain-on-window.webp",
  "images/seo-body-fireplace-and-wine.webp",
];

const SEO_BODY_IMAGE_W = 1408;
const SEO_BODY_IMAGE_H = 768;

function ssrPageHash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickSsrBodyImages(seed: string, count: number, override?: string[]): string[] {
  const pool = override?.length ? override : SEO_BODY_IMAGE_POOL;
  if (!pool.length) return [];
  const start = ssrPageHash(seed) % pool.length;
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(pool[(start + i) % pool.length]);
  return out;
}

/**
 * Render a body image. `eager=true` for the first image (in scroll range,
 * lazy-loading produces a visible pop-in). Width/height attrs lock layout
 * so there's no shift while the WebP decodes.
 */
function bodyImgHtml(src: string, eager = false): string {
  const loading = eager ? "eager" : "lazy";
  return `<figure class="seo-body-img"><img src="/${src}" alt="" aria-hidden="true" loading="${loading}" decoding="async" width="${SEO_BODY_IMAGE_W}" height="${SEO_BODY_IMAGE_H}" /></figure>`;
}

const SITE_URL = "https://theprivatestory.com";
const SITE_NAME = "The Private Story";
const DATE_PUBLISHED = "2025-11-01";
const DATE_MODIFIED = "2026-04-05";
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

/**
 * Render a paragraph (string OR structured {text, links}) as safe HTML.
 *
 * - Structured form: escapes `text`, then re-injects each link as a real
 *   <a href> by replacing the matched substring inside the escaped text.
 * - String form: trusted internal content from configs.ts which may contain
 *   inline `<a href="X">Y</a>` HTML — passed through as-is so the links
 *   render. (Audit confirms no raw `&` or `<` outside `<a>` tags in copy.)
 */
function renderParagraph(p: ParagraphContent): string {
  if (typeof p === "string") return p;
  let html = esc(p.text);
  if (p.links?.length) {
    for (const { match, href } of p.links) {
      const escMatch = esc(match);
      html = html.replace(escMatch, `<a href="${esc(href)}">${escMatch}</a>`);
    }
  }
  return html;
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
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    datePublished: DATE_PUBLISHED,
    dateModified: opts.dateModified ?? DATE_MODIFIED,
    isFamilyFriendly: false,
    contentRating: "Adult Only 18+",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".tagline"],
    },
    ...(opts.includesBreadcrumb
      ? { breadcrumb: { "@id": `${opts.url}#breadcrumb` } }
      : {}),
  };
}

function makeAudioObjectSchema(opts: {
  name: string;
  description: string;
  url: string;
  genre?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    name: opts.name,
    description: opts.description,
    contentUrl: opts.url,
    encodingFormat: "audio/mpeg",
    genre: opts.genre ?? "Romance",
    inLanguage: "en-GB",
    isAccessibleForFree: false,
    requiresSubscription: true,
    producer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

// Slugs that get a Product schema with AggregateRating in SERP — top-priority
// pages where star-rating-rich-results lift CTR most. Rating values mirror the
// /pricing page reviews already published on the site.
const HIGH_PRIORITY_RATING_SLUGS = new Set<string>([
  "personalised-audio-stories",
  "private-audio-stories",
  "create-your-own-audio-story",
  "ai-audio-story-generator",
  "romantic-audio-stories",
  "intimate-audio-stories",
  "dark-romance-audio-stories",
  "audio-stories-for-women",
  "audio-erotica-for-women",
  "erotic-audio-stories",
  "personalised-erotica",
]);

function makeProductRatingSchema(slug: string, page: { meta: { title: string; description: string }; hero: { h1: string } }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/${slug}#product`,
    name: page.hero.h1,
    description: page.meta.description,
    brand: { "@type": "Brand", name: SITE_NAME },
    category: "Personalised Audio Stories",
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/pricing`,
      priceCurrency: "GBP",
      price: "29.00",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "14",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

function makeArticleSchema(opts: {
  headline: string;
  description: string;
  url: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    url: opts.url,
    datePublished: DATE_PUBLISHED,
    dateModified: opts.dateModified ?? DATE_MODIFIED,
    inLanguage: "en-GB",
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.webp`,
      },
    },
  };
}

const SEO_PAGE_CROSS_LINKS: Record<string, Array<{ label: string; href: string }>> = {
  "forced-proximity-romance-audio-stories": [
    { label: "Office romance audio stories", href: "/office-romance-audio-stories" },
    { label: "Enemies to lovers audio stories", href: "/enemies-to-lovers-audio-stories" },
    { label: "Slow burn audio stories", href: "/slow-burn-audio-stories" },
    { label: "Forbidden romance audio stories", href: "/forbidden-romance-audio-stories" },
  ],
  "erotic-audiobooks-for-women": [
    { label: "Audio erotica for women", href: "/audio-erotica-for-women" },
    { label: "Personalised erotica", href: "/personalised-erotica" },
    { label: "Erotic audio stories", href: "/erotic-audio-stories" },
    { label: "Audio stories for women", href: "/audio-stories-for-women" },
  ],
  "office-romance-audio-stories": [
    { label: "Forced proximity romance audio stories", href: "/forced-proximity-romance-audio-stories" },
    { label: "Forbidden romance audio stories", href: "/forbidden-romance-audio-stories" },
    { label: "Enemies to lovers audio stories", href: "/enemies-to-lovers-audio-stories" },
    { label: "Slow burn audio stories", href: "/slow-burn-audio-stories" },
  ],
  "steamy-audio-stories": [
    { label: "Slow burn audio stories", href: "/slow-burn-audio-stories" },
    { label: "Intimate audio stories", href: "/intimate-audio-stories" },
    { label: "Adult audio stories", href: "/adult-audio-stories" },
    { label: "Dark romance audio stories", href: "/dark-romance-audio-stories" },
  ],
  "ai-erotica": [
    { label: "Personalised erotica", href: "/personalised-erotica" },
    { label: "Audio erotica for women", href: "/audio-erotica-for-women" },
    { label: "Erotic audio stories", href: "/erotic-audio-stories" },
    { label: "AI audio story generator", href: "/ai-audio-story-generator" },
  ],
  "ferly-alternative": [
    { label: "Dipsea alternative", href: "/dipsea-alternative" },
    { label: "Quinn alternative", href: "/quinn-alternative" },
    { label: "Personalised audio stories", href: "/personalised-audio-stories" },
    { label: "Audio erotica for women", href: "/audio-erotica-for-women" },
  ],
};

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
  robots?: string;
}

const STATIC_PAGES: StaticPage[] = [
  {
    path: "/pricing",
    slug: "pricing",
    title: "Pricing — The Private Story",
    description:
      "Choose a plan. £29.99/month for 5 stories, £239/year for 50 stories. Extra stories £7.99 each for subscribers.",
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
        image: `${SITE_URL}/images/logo.webp`,
        brand: { "@type": "Brand", name: "The Private Story" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "14",
          bestRating: "5",
          worstRating: "1",
        },
        review: [
          {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5",
            },
            author: { "@type": "Person", name: "Sarah M." },
            reviewBody:
              "Unlike anything else I've found. The stories feel genuinely written for me — not recycled from a library. The privacy aspect matters more than I expected.",
            datePublished: "2026-02-14",
          },
        ],
        offers: [
          {
            "@type": "Offer",
            name: "Monthly plan",
            price: "29.00",
            priceCurrency: "GBP",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/pricing`,
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              "@id": `${SITE_URL}/pricing#return-policy`,
              applicableCountry: "GB",
              returnPolicyCategory:
                "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 14,
              returnMethod: "https://schema.org/ReturnByMail",
              returnFees: "https://schema.org/FreeReturn",
              merchantReturnLink: `${SITE_URL}/privacy-policy`,
            },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: "0",
                currency: "GBP",
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "GB",
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 0,
                  unitCode: "DAY",
                },
                transitTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 0,
                  unitCode: "DAY",
                },
              },
            },
          },
          {
            "@type": "Offer",
            name: "Annual plan",
            price: "179.00",
            priceCurrency: "GBP",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/pricing`,
            hasMerchantReturnPolicy: { "@id": `${SITE_URL}/pricing#return-policy` },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: "0",
                currency: "GBP",
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "GB",
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 0,
                  unitCode: "DAY",
                },
                transitTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 0,
                  unitCode: "DAY",
                },
              },
            },
          },
          {
            "@type": "Offer",
            name: "Story add-on",
            price: "3.99",
            priceCurrency: "GBP",
            priceValidUntil: "2026-12-31",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/pricing`,
            hasMerchantReturnPolicy: { "@id": `${SITE_URL}/pricing#return-policy` },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: "0",
                currency: "GBP",
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "GB",
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 0,
                  unitCode: "DAY",
                },
                transitTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 0,
                  unitCode: "DAY",
                },
              },
            },
          },
        ],
      },
    ],
    body: `
    <section>
      <h2>Plans</h2>
      <p><strong>Monthly — £29.99/month</strong> · 5 personalised audio stories per month. Cancel any time.</p>
      <p><strong>Annual — £239/year</strong> · 50 stories per year (save 33%). Best value for regular listeners.</p>
      <p><strong>Add-on — £7.99/story</strong> · Extra stories beyond your plan allowance.</p>
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
    path: "/the-three-doors",
    slug: "the-three-doors",
    title: "Three Worlds, One Choice — Romance, After Dark & Drift | The Private Story",
    description:
      "Three private worlds of personalised audio stories. Romance: intimate and desire-led. After Dark: explicit adult fiction, fully unrestrained. Drift: warm, intimate bedtime stories. All built around you.",
    h1: "Behind Each Door, Something Different Waits",
    tagline: "Three worlds. All private. All personalised to you.",
    extraSchemas: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "The Three Doors — The Private Story",
        description:
          "An overview of the three private worlds available on The Private Story: personalised romance audio stories, explicit adult audio fiction (After Dark), and intimate bedtime audio stories (Drift).",
        url: `${SITE_URL}/the-three-doors`,
        datePublished: DATE_PUBLISHED,
        dateModified: DATE_MODIFIED,
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
        hasPart: [
          {
            "@type": "WebPage",
            name: "Romance — The Story Room",
            description: "Personalised romantic audio stories — forbidden, slow burn, historical, enemies to lovers. Cast it yourself. Private and saved to your account.",
            url: `${SITE_URL}/create`,
          },
          {
            "@type": "WebPage",
            name: "After Dark — Explicit Adult Audio Fiction",
            description: "Explicit adult audio stories, fully unrestrained. Power Exchange, The Forbidden, Slow Burn, In Character and more. 18+ age gate required.",
            url: `${SITE_URL}/after-dark`,
          },
          {
            "@type": "WebPage",
            name: "Drift — Intimate Bedtime Audio Stories",
            description: "Warm, intimate bedtime audio stories for the quiet hour. Softly sensual, emotionally close, written to hold you as the night settles.",
            url: `${SITE_URL}/drift`,
          },
        ],
      },
      makeBreadcrumb(`${SITE_URL}/the-three-doors`, [
        { name: "Home", item: SITE_URL },
        { name: "The Three Doors", item: `${SITE_URL}/the-three-doors` },
      ]),
    ],
    body: `
    <section>
      <h2>Romance — The Story Room</h2>
      <p>Personalised romantic audio stories built around your exact desires. Choose your mood — Forbidden, Slow Burn, Historical, Second Chance, Enemies to Lovers. Cast the character yourself: his name, his dynamic, how far it goes. Every story is written exclusively for you and saved privately to your account.</p>
      <p>~10 minutes per story. Fully private. No library, no catalogue — written fresh for you every time.</p>
      <a href="/create">Create your romance story</a>
    </section>
    <section>
      <h2>After Dark — Explicit Adult Audio Fiction</h2>
      <p>After Dark is where the story goes further. Explicit, unrestrained adult audio fiction personalised entirely to you. Choose from fantasy rooms including Power Exchange, The Forbidden, Slow Burn, In Character, Eyes On Us, Sweet &amp; Savage, More Than Two, The Edge, and Dark Territory.</p>
      <p>Adult content — 18+ age gate required. Nothing implied where it can be named. Nothing held back.</p>
      <a href="/after-dark">Enter After Dark</a>
    </section>
    <section>
      <h2>Drift — Intimate Bedtime Audio Stories</h2>
      <p>Drift is written for the hour when everything else has gone quiet. Warm, intimate, softly sensual audio stories designed for the late-night hour. Rooms include The Late Night, Come Home, Warm Weight, and The Long Week.</p>
      <p>Emotionally close, sleep-adjacent, the kind of presence that holds you as the night settles.</p>
      <a href="/drift">Explore Drift</a>
    </section>
    <section>
      <h2>All Plans Include All Three Worlds</h2>
      <p>One subscription gives you access to Romance, After Dark, and Drift. Every story is personalised to you, privately saved, and heard only by you.</p>
      <a href="/pricing">See pricing</a>
    </section>`,
  },
  {
    path: "/create-my-story",
    slug: "create-my-story",
    title: "Create My Story — Private Adult Stories, Personalised | The Private Story",
    description:
      "Create your own private adult story — personalised around your choices. Choose Romance, After Dark, or Drift. Written for you, narrated for you, saved privately. No catalogue, no sharing.",
    h1: "Create My Story",
    tagline: "Choose your world. Your story is written and narrated privately for you.",
    extraSchemas: [
      makeBreadcrumb(`${SITE_URL}/create-my-story`, [
        { name: "Home", item: SITE_URL },
        { name: "Create My Story", item: `${SITE_URL}/create-my-story` },
      ]),
    ],
    body: `
    <section>
      <h2>Choose Your Story</h2>
      <p>The Private Story is not a catalogue. Every story is created from scratch around the choices you make — the mood, the character, the dynamic, how far it goes. You describe what you want; the story is written and narrated privately for you.</p>
      <a class="cta-primary" href="/create">Begin your story</a>
    </section>
    <section>
      <h2>Romance</h2>
      <p>Intimate, desire-led personalised audio stories. Forbidden, slow burn, historical, enemies to lovers — cast it yourself and hear it alone.</p>
      <a href="/create">Create a romance story</a>
    </section>
    <section>
      <h2>After Dark</h2>
      <p>Stories that go further — explicit, unrestrained, personalised entirely to you. Nothing held back.</p>
      <a href="/after-dark">Enter After Dark</a>
    </section>
    <section>
      <h2>Drift</h2>
      <p>Warm, intimate bedtime audio stories for the quiet hour. Written to hold you as the night settles.</p>
      <a href="/drift">Explore Drift</a>
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
    path: "/privacy-policy",
    slug: "privacy-policy",
    title: "Privacy Policy — The Private Story",
    description:
      "How The Private Story handles your data. Your story choices, listening history, and generated stories are private to your account — never sold, never shared.",
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
    path: "/samples",
    slug: "samples",
    title: "Hear a Sample — 30-Second Narrated Audio Stories | The Private Story",
    description:
      "Listen before you create. Free 30-second narrated samples from each of the three doors — Romance, After Dark, and Drift. Premium voices, no sign-up required.",
    h1: "Hear a Sample Before You Create",
    tagline: "Free 30-second narrated openings — Romance, After Dark, and Drift. No sign-up.",
    cacheHeader: CACHE_1H,
    body: `
    <section>
      <h2>Listen Before You Create</h2>
      <p>Every story on The Private Story is generated and narrated end-to-end around your choices. These free samples let you hear our professional narrators and the tone of each of the three doors — before you create your own.</p>
    </section>
    <section>
      <h2>Three Doors, Three Tones</h2>
      <p><strong>Romance</strong> — warm, considered, emotionally intelligent. Slow-burn pull and tender intimacy.</p>
      <p><strong>After Dark</strong> — charged, unhurried, adult. Confident desire and quiet heat.</p>
      <p><strong>Drift</strong> — slow, calming, low-stimulation. Bedtime listening designed to settle, not arouse.</p>
    </section>
    <section>
      <h2>Why Sample First</h2>
      <p>Hearing the narration sells the experience faster than any description can. The samples below are real openings written and recorded the same way your personalised story will be — only yours will be written around the cast, chemistry, world, and intensity you choose.</p>
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
  {
    path: "/create",
    slug: "create",
    title: "Create Your Story — The Private Story",
    description:
      "Build your brief. Choose your mood, tone, dynamic, setting, and characters. Your personalised audio story is generated in minutes.",
    h1: "Create Your Story",
    tagline: "Choose your mood. Set the scene. Your story is written for you.",
    cacheHeader: CACHE_1H,
    body: `
    <section>
      <h2>How It Works</h2>
      <p>The Casting Room guides you through seven selections — mood, tone, dynamic, setting, intensity, character type, and scenario direction. Each choice shapes the story that follows. Nothing is retrieved from a library. Everything is written around your brief.</p>
      <p>A complete narrated story takes under two minutes to generate. It is saved privately to your account. Only you can access it.</p>
      <a class="cta-primary" href="/create">Start creating</a>
    </section>
    <section>
      <h2>What You Can Create</h2>
      <p>Slow burn romance. Dark tension. Tender and intimate. Late night. Historical. Forbidden. Over a million possible configurations — six pairings, eight chemistry types, 19 archetypes, four intensities, seven endings, and 200+ situations across countries, eras, and After Dark worlds.</p>
      <p>See also: <a href="/personalised-audio-stories">personalised audio stories</a> · <a href="/ai-audio-story-generator">AI audio story generator</a> · <a href="/how-it-works">how it works</a></p>
    </section>`,
  },
  {
    path: "/browse",
    slug: "browse",
    title: "Browse Stories — The Private Story",
    description:
      "Browse the story collection at The Private Story. Find stories by mood, tone, and genre. Every story is privately saved to your account.",
    h1: "Browse Stories",
    tagline: "Find your mood. Every story is yours alone.",
    cacheHeader: CACHE_1H,
    robots: "noindex, nofollow",
    body: `
    <section>
      <h2>The Collection</h2>
      <p>The Private Story generates each story from scratch — nothing in the collection was written in advance. Browse by mood, genre, and tone to find the type of story you want to create next.</p>
      <p>Categories include slow burn, dark romance, forbidden desire, late night, emotional, intimate, historical, and more. Each story is saved privately to your account.</p>
      <a class="cta-primary" href="/create">Create a story</a>
    </section>
    <section>
      <h2>Explore by Type</h2>
      <p><a href="/romantic-audio-stories">Romantic</a> · <a href="/intimate-audio-stories">Intimate</a> · <a href="/dark-romance-audio-stories">Dark Romance</a> · <a href="/slow-burn-audio-stories">Slow Burn</a> · <a href="/late-night-audio-stories">Late Night</a> · <a href="/emotional-audio-stories">Emotional</a> · <a href="/forbidden-romance-audio-stories">Forbidden</a> · <a href="/discover">Discover all</a></p>
    </section>`,
  },
  {
    path: "/discover",
    slug: "discover",
    title: "Discover Story Types — The Private Story",
    description:
      "Discover every story type at The Private Story. Browse by genre, mood, tone, and dynamic. Personalised audio stories created around your choices.",
    h1: "Discover",
    tagline: "Every mood. Every dynamic. Every story type — personalised.",
    cacheHeader: CACHE_1H,
    body: `
    <section>
      <h2>Story Types</h2>
      <p>The Private Story covers the full range of adult romantic and intimate fiction — from slow burn and tender romance to dark, forbidden, and explicit. Every type can be personalised around your mood, dynamic, and setting.</p>
      <p><a href="/romantic-audio-stories">Romantic</a> · <a href="/intimate-audio-stories">Intimate</a> · <a href="/dark-romance-audio-stories">Dark Romance</a> · <a href="/slow-burn-audio-stories">Slow Burn</a> · <a href="/emotional-audio-stories">Emotional</a> · <a href="/forbidden-romance-audio-stories">Forbidden</a> · <a href="/enemies-to-lovers-audio-stories">Enemies to Lovers</a> · <a href="/late-night-audio-stories">Late Night</a> · <a href="/bedtime-audio-stories">Bedtime</a></p>
      <a class="cta-primary" href="/create">Start creating</a>
    </section>`,
  },
  {
    path: "/after-dark",
    slug: "after-dark",
    title: "Enter After Dark — Create Yours | The Private Story",
    description:
      "After Dark: premium literary audio fiction at The Private Story. Explicit, unrestrained, personalised entirely to you. For subscribers. Private, narrated, yours alone.",
    h1: "Enter After Dark — Create Yours",
    tagline: "Explicit, unrestrained, personalised entirely to you.",
    cacheHeader: CACHE_1H,
    robots: "noindex, nofollow",
    body: `
    <section>
      <h2>What After Dark Is</h2>
      <p>After Dark is the explicit tier at The Private Story. Stories here are written without the tonal restraints of the standard collection — more direct, more intense, more explicit. The same literary quality. The same complete privacy. No limits on what your brief can include.</p>
      <p>After Dark stories are available to subscribers on the Monthly and Annual plans. Every story is saved privately to your account.</p>
      <a class="cta-primary" href="/pricing">See plans</a>
    </section>
    <section>
      <h2>Related</h2>
      <p><a href="/intimate-audio-stories">Intimate audio stories</a> · <a href="/dark-romance-audio-stories">Dark romance</a> · <a href="/forbidden-romance-audio-stories">Forbidden romance</a> · <a href="/late-night-audio-stories">Late night stories</a></p>
    </section>`,
  },
  {
    path: "/drift",
    slug: "drift",
    title: "Drift — Ambient Audio Experience — The Private Story",
    description:
      "Drift is The Private Story's ambient listening mode. Layered sound and narration designed to settle the mind. Available to all subscribers.",
    h1: "Drift",
    tagline: "Let the story carry you. Ambient audio for quiet nights.",
    cacheHeader: CACHE_1H,
    body: `
    <section>
      <h2>What Drift Is</h2>
      <p>Drift is an ambient audio mode at The Private Story — layered sound environments paired with narration, designed to slow the mind and ease you into rest. It is a different experience from a story: less narrative drive, more atmosphere.</p>
      <p>Available to Monthly and Annual subscribers alongside the full story collection.</p>
      <a class="cta-primary" href="/pricing">See plans</a>
    </section>
    <section>
      <h2>Related</h2>
      <p><a href="/sleep-audio-stories">Sleep audio stories</a> · <a href="/relaxing-audio-stories">Relaxing audio stories</a> · <a href="/bedtime-audio-stories">Bedtime audio stories</a></p>
    </section>`,
  },
  {
    path: "/search",
    slug: "search",
    title: "Search — The Private Story",
    description:
      "Search The Private Story. Find stories by mood, genre, setting, and tone. Every story is privately generated and saved to your account.",
    h1: "Search",
    tagline: "Find what you're looking for.",
    cacheHeader: CACHE_1H,
    robots: "noindex, nofollow",
    body: `
    <section>
      <h2>Find Your Story</h2>
      <p>Search The Private Story by mood, genre, tone, or setting. Every story in the collection was generated for a specific listener — privately, around a specific brief. Browse and search to find your starting point, then create your own.</p>
      <a class="cta-primary" href="/create">Create a story</a>
    </section>
    <section>
      <h2>Popular Categories</h2>
      <p><a href="/romantic-audio-stories">Romantic</a> · <a href="/dark-romance-audio-stories">Dark Romance</a> · <a href="/slow-burn-audio-stories">Slow Burn</a> · <a href="/intimate-audio-stories">Intimate</a> · <a href="/discover">Discover all types</a></p>
    </section>`,
  },
];

// ---------------------------------------------------------------------------
// Dynamic sitemap — generated at request time so <lastmod> reflects the
// actual deploy/content date and the URL list stays in sync with the code.
// Private / account routes (disallowed in robots.txt) are intentionally
// excluded. User-generated story pages can be added via a DB query here
// in the future.
// ---------------------------------------------------------------------------
const SITEMAP_URLS: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [
  // Core site pages
  { loc: "/",               lastmod: DATE_MODIFIED, changefreq: "weekly",  priority: "1.0" },
  { loc: "/how-it-works",   lastmod: DATE_MODIFIED, changefreq: "monthly", priority: "0.9" },
  { loc: "/create",         lastmod: DATE_MODIFIED, changefreq: "weekly",  priority: "0.7"  },
  { loc: "/pricing",           lastmod: DATE_MODIFIED, changefreq: "monthly", priority: "0.9" },
  { loc: "/the-three-doors",   lastmod: DATE_MODIFIED, changefreq: "monthly", priority: "0.85" },
  { loc: "/create-my-story",   lastmod: DATE_MODIFIED, changefreq: "monthly", priority: "0.9"  },
  { loc: "/samples",           lastmod: DATE_MODIFIED, changefreq: "weekly",  priority: "0.85" },
  // { loc: "/browse",      ... }  // noindex — age-gated, excluded from sitemap
  // { loc: "/search",      ... }  // noindex — age-gated, excluded from sitemap
  { loc: "/discover",       lastmod: DATE_MODIFIED, changefreq: "daily",   priority: "0.9" },
  // { loc: "/after-dark",  ... }  // noindex — age-gated, excluded from sitemap
  { loc: "/drift",          lastmod: DATE_MODIFIED, changefreq: "weekly",  priority: "0.8" },
  { loc: "/about",          lastmod: DATE_MODIFIED, changefreq: "monthly", priority: "0.75" },
  { loc: "/contact",        lastmod: DATE_MODIFIED, changefreq: "monthly", priority: "0.7" },
  // SEO landing pages — Core cluster
  { loc: "/personalised-audio-stories",       lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/private-audio-stories",            lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/create-your-own-audio-story",      lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.95" },
  { loc: "/ai-audio-story-generator",         lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  // SEO landing pages — Bedtime cluster
  { loc: "/sleep-audio-stories",    lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.8" },
  { loc: "/bedtime-audio-stories",  lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.8" },
  { loc: "/relaxing-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.8" },
  // SEO landing pages — Romantic cluster
  { loc: "/romantic-audio-stories",  lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/love-stories-audio",      lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/emotional-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  // SEO landing pages — Intimate cluster
  { loc: "/intimate-audio-stories",   lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/late-night-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/slow-burn-audio-stories",  lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/confident-energy-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.8" },
  { loc: "/quiet-intensity-stories",  lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.8" },
  // SEO landing pages — Genre & Audience cluster
  { loc: "/dark-romance-audio-stories",       lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/forbidden-romance-audio-stories",  lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/enemies-to-lovers-audio-stories",  lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/adult-audio-stories",              lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/audio-stories-for-women",          lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  // SEO landing pages — Decision-stage comparison cluster
  { loc: "/audio-stories-vs-audiobooks",      lastmod: DATE_MODIFIED, changefreq: "weekly",  priority: "0.8" },
  { loc: "/audio-stories-vs-podcasts",        lastmod: DATE_MODIFIED, changefreq: "weekly",  priority: "0.8" },
  { loc: "/best-audio-story-app-for-adults",  lastmod: DATE_MODIFIED, changefreq: "weekly",  priority: "0.8" },
  { loc: "/alternatives-to-romance-audiobooks", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.8" },
  // SEO landing pages — Competitor alternative pages
  { loc: "/dipsea-alternative",         lastmod: DATE_MODIFIED, changefreq: "monthly", priority: "0.8" },
  { loc: "/quinn-alternative",          lastmod: DATE_MODIFIED, changefreq: "monthly", priority: "0.8" },
  { loc: "/gonewildaudio-alternative",  lastmod: DATE_MODIFIED, changefreq: "monthly", priority: "0.8" },
  { loc: "/ferly-alternative",          lastmod: DATE_MODIFIED, changefreq: "monthly", priority: "0.8" },
  // SEO landing pages — Adult content cluster
  { loc: "/audio-erotica-for-women",          lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/erotic-audio-stories-for-women",   lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/personalised-erotica",             lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/erotic-audio-stories",             lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/adult-bedtime-stories",            lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/spicy-audio-stories",              lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/ai-romance-stories-for-women",     lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  // SEO landing pages — New Wave 2 content cluster
  { loc: "/forced-proximity-romance-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/erotic-audiobooks-for-women",            lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/office-romance-audio-stories",           lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/steamy-audio-stories",                   lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  { loc: "/ai-erotica",                             lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.9" },
  // SEO landing pages — Tropes (May 2026 expansion)
    { loc: "/billionaire-romance-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/mafia-romance-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/morally-grey-romance-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/age-gap-romance-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/fake-dating-romance-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/second-chance-romance-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/grumpy-sunshine-romance-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/single-dad-romance-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
    // SEO landing pages — BookTok / discovery (May 2026 expansion)
    { loc: "/romantasy-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/dark-romantasy-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/booktok-romance-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/smut-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/spicy-reads-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
    // SEO landing pages — UK / regional (May 2026 expansion)
    { loc: "/audio-erotica-uk", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/british-audio-erotica-for-women", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/best-audio-erotica-app-uk", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/audio-erotica-male-voice-british", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
    // SEO landing pages — Audience (May 2026 expansion)
    { loc: "/audio-erotica-for-women-over-30", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/audio-erotica-for-couples", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/lesbian-audio-erotica", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/queer-audio-erotica", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
    // SEO landing pages — Format / discovery (May 2026 expansion)
    { loc: "/short-erotic-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/audio-erotica-with-male-narrator", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/sensual-audio-stories", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/how-to-listen-to-audio-erotica", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
  { loc: "/audio-erotica-for-beginners", lastmod: DATE_MODIFIED, changefreq: "weekly", priority: "0.85" },
    // SEO landing pages — Definition pages
  { loc: "/what-is-a-personalised-audio-story", lastmod: DATE_MODIFIED, changefreq: "yearly", priority: "0.75" },
  { loc: "/what-is-slow-burn-romance",          lastmod: DATE_MODIFIED, changefreq: "yearly", priority: "0.75" },
  { loc: "/what-is-dark-romance",               lastmod: DATE_MODIFIED, changefreq: "yearly", priority: "0.75" },
  { loc: "/what-is-enemies-to-lovers",          lastmod: DATE_MODIFIED, changefreq: "yearly", priority: "0.75" },
  // Legal pages
  { loc: "/privacy-policy",  lastmod: DATE_PUBLISHED, changefreq: "yearly", priority: "0.6" },
  { loc: "/privacy",         lastmod: DATE_PUBLISHED, changefreq: "yearly", priority: "0.6" },
  { loc: "/terms",           lastmod: DATE_PUBLISHED, changefreq: "yearly", priority: "0.6" },
  { loc: "/content-policy",  lastmod: DATE_PUBLISHED, changefreq: "yearly", priority: "0.6" },
  { loc: "/refund-policy",   lastmod: DATE_PUBLISHED, changefreq: "yearly", priority: "0.6" },
];

router.get("/sitemap.xml", (_req: Request, res: Response) => {
  const urlEntries = SITEMAP_URLS.map(
    ({ loc, lastmod, changefreq, priority }) => {
      // Per-page lastmod: if this slug has a SEO config with a dateModified
      // override, use it. Otherwise fall back to the sitemap-array default.
      const slug = loc.startsWith("/") ? loc.slice(1) : loc;
      const cfg = allPageConfigs.get(slug);
      const finalLastmod = cfg?.dateModified ?? lastmod;
      return `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <lastmod>${finalLastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    },
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n${urlEntries}\n\n</urlset>\n`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=600");
  res.status(200).send(xml);
});

// ─────────────────────────────────────────────────────────────────────────────
// Image sitemap — surfaces hero images and editor-pick covers in Google Images.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/sitemap-images.xml", (_req: Request, res: Response) => {
  type ImgEntry = { pageLoc: string; image: string; caption: string; title: string };
  const entries: ImgEntry[] = [];

  // Homepage + key static pages (use shared default OG image)
  const defaultOG = "/images/home-hero-woman.webp";
  entries.push({
    pageLoc: "/",
    image: defaultOG,
    caption: "Premium AI literary audio stories — written and narrated around your brief",
    title: "The Private Story — Personalised Audio Stories",
  });

  // SEO pages with their own heroImage
  for (const { loc } of SITEMAP_URLS) {
    const slug = loc.startsWith("/") ? loc.slice(1) : loc;
    const cfg = allPageConfigs.get(slug);
    if (!cfg?.heroImage) continue;
    const imagePath = cfg.heroImage.startsWith("/")
      ? cfg.heroImage
      : `/${cfg.heroImage}`;
    entries.push({
      pageLoc: loc,
      image: imagePath,
      caption: cfg.meta.description,
      title: cfg.hero.h1,
    });
  }

  // Group by page URL (image sitemap allows up to 1000 images per page entry)
  const byPage = new Map<string, ImgEntry[]>();
  for (const e of entries) {
    const arr = byPage.get(e.pageLoc) ?? [];
    arr.push(e);
    byPage.set(e.pageLoc, arr);
  }

  const urlBlocks = Array.from(byPage.entries()).map(([pageLoc, imgs]) => {
    const imageBlocks = imgs
      .map(
        (i) =>
          `    <image:image>\n      <image:loc>${SITE_URL}${i.image}</image:loc>\n      <image:title>${escHtml(i.title)}</image:title>\n      <image:caption>${escHtml(i.caption)}</image:caption>\n    </image:image>`,
      )
      .join("\n");
    return `  <url>\n    <loc>${SITE_URL}${pageLoc}</loc>\n${imageBlocks}\n  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n${urlBlocks}\n\n</urlset>\n`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=600");
  res.status(200).send(xml);
});

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
        sameAs: ["https://x.com/theprivatestory"],
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
      <p><strong>Who it's for:</strong> Adults who want private, emotionally intelligent audio storytelling — personalised around their mood, dynamic, and tone, not retrieved from a fixed library.</p>
      <p><strong>How it works:</strong> <a href="/personalised-audio-stories">Personalised audio stories</a> begin with seven structured selections — mood, tone, dynamic, setting, intensity, character type, and scenario direction. <a href="/private-audio-stories">Private audio stories</a> are saved only to your account. And <a href="/create-your-own-audio-story">creating your own audio story</a> takes under two minutes.</p>
      <p><a href="/how-it-works">Full explanation of how it works →</a></p>
    </section>
    <section>
      <h2>Browse Story Types</h2>
      <p><a href="/romantic-audio-stories">Romantic</a> · <a href="/intimate-audio-stories">Intimate</a> · <a href="/dark-romance-audio-stories">Dark Romance</a> · <a href="/slow-burn-audio-stories">Slow Burn</a> · <a href="/bedtime-audio-stories">Bedtime</a> · <a href="/ai-audio-story-generator">AI audio story generator</a> · <a href="/discover">Discover all</a></p>
    </section>`;

  const homepageFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is The Private Story?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Private Story is a premium AI audio storytelling platform that writes personalised romantic and intimate audio stories around your choices — mood, cast, chemistry, setting, and intensity. Every story is created from scratch for you and saved privately to your account. Nothing is shared with other users or displayed publicly.",
        },
      },
      {
        "@type": "Question",
        name: "Are the stories really private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Privacy is a founding design principle, not a feature added later. There are no social features, no public profiles, and no shared listening history. Your stories are stored securely in your private account and are not visible to anyone else — including the platform operators. The platform does not run ads or sell data.",
        },
      },
      {
        "@type": "Question",
        name: "How much does The Private Story cost?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Private Story offers a Monthly subscription at £29.99/month (includes 5 story generations) and an Annual subscription at £239/year (includes 50 story generations). Additional stories can be purchased at £7.99 each. Please check the pricing page for the most current offers.",
        },
      },
      {
        "@type": "Question",
        name: "How long does it take to create a personalised story?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Casting Room — where you make your seven creative choices — typically takes under two minutes to complete. Most stories are generated and available to listen within a few minutes of submitting your brief.",
        },
      },
      {
        "@type": "Question",
        name: "Is the content explicit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Private Story supports the full spectrum from emotionally charged slow burn to fully explicit adult content, including dark romance and erotic fiction. You choose the intensity level as part of your story brief. Explicit content is available only to age-verified users aged 18 and over.",
        },
      },
    ],
  };

  const html = ssrHtmlShell({
    title: "The Private Story — Create the Story You've Been Looking For",
    description:
      "Private audio stories written around you — your world, your feeling, your voice. Heard only by you.",
    canonical: url,
    h1: "Create the Story You've Been Looking For",
    tagline:
      "Your story, your voice, your moment. Private, intimate, and completely yours.",
    bodyHtml,
    schemas: [orgSchema, homepageFaqSchema],
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
      ...(page.robots ? { robots: page.robots } : {}),
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

  const pageDate = page.dateModified ?? DATE_MODIFIED;

  const webPage = makeWebPage({
    name: page.meta.title,
    description: page.meta.description,
    url: canonical,
    includesBreadcrumb: true,
    dateModified: pageDate,
  });

  const audioObjectSchema = makeAudioObjectSchema({
    name: page.meta.title,
    description: page.meta.description,
    url: canonical,
    genre: page.hero.badge ?? "Romance",
  });

  const articleSchema = makeArticleSchema({
    headline: page.hero.h1,
    description: page.meta.description,
    url: canonical,
    dateModified: pageDate,
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

  // Three deterministic body images — interleaved between long-copy sections
  // (image SEO surface for Google Images / Discover, plus visual relief).
  const bodyImgs = pickSsrBodyImages(page.meta.title, 3, page.bodyImages);

  const sectionsHtml = page.sections
    .map(
      (s) => `
    <section>
      <h2>${esc(s.h2)}</h2>
      ${s.paragraphs.map((p) => `<p>${renderParagraph(p)}</p>`).join("\n      ")}
      ${
        s.bullets?.length
          ? `<ul>${s.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`
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
      ${page.scenarios.intro ? `<p>${page.scenarios.intro}</p>` : ""}
      ${page.scenarios.items
        .map(
          (it) => `
      <div class="scenario-item">
        <strong>${esc(it.heading)}</strong>
        <p>${it.body}</p>
      </div>`,
        )
        .join("")}
      ${page.scenarios.interstitial ? `<p>${page.scenarios.interstitial}</p>` : ""}
    </section>`
      : "";

  // Mid-page CTA — restrained re-engagement nudge between Scenarios and
  // Benefits. Routes to the door that matches the page's tone. Shared
  // helper from @workspace/seo-data so React + SSR always agree.
  const midCta = pickMidCtaTarget(slug);
  const midCtaHtml = `
    <section class="mid-cta">
      <p class="mid-cta-eyebrow">Ready when you are</p>
      <p class="mid-cta-line">A story made for you, in about a minute. Heard only by you.</p>
      <a class="cta-primary" href="${midCta.href}">${midCta.label} &rarr;</a>
    </section>`;

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
        <p>${it.body}</p>
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
      ${page.fullPicture.paragraphs.map((p) => `<p>${renderParagraph(p)}</p>`).join("\n      ")}
    </section>`
      : "";

  const finalCtaHtml = page.finalCTA
    ? `
    <section>
      <h2>${esc(page.finalCTA.h2)}</h2>
      ${page.finalCTA.paragraphs.map((p) => `<p>${p}</p>`).join("\n      ")}
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
        <p class="faq-a">${f.a}</p>
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
        <p>${step.body}</p>
      </div>`,
        )
        .join("")}
      <p><a href="${esc(page.finalCTA.primary.href)}">Create yours in under two minutes →</a></p>
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

  const crossLinks = SEO_PAGE_CROSS_LINKS[slug];
  const crossLinksHtml = crossLinks?.length
    ? `
    <section>
      <h2>Related</h2>
      <p>${crossLinks.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join(" · ")}</p>
    </section>`
    : "";

  const bodyHtml = `
    <a class="cta-primary" href="${esc(page.finalCTA.primary.href)}">Create your story</a>
    ${TRUST_BAR_HTML}
    ${sectionsHtml}
    ${bodyImgs[0] ? bodyImgHtml(bodyImgs[0], true) : ""}
    ${comparisonTableHtml}
    ${scenariosHtml}
    ${bodyImgs[1] ? bodyImgHtml(bodyImgs[1]) : ""}
    ${midCtaHtml}
    ${benefitsHtml}
    ${fullPictureHtml}
    ${bodyImgs[2] ? bodyImgHtml(bodyImgs[2]) : ""}
    ${howItWorksHtml}
    ${faqsHtml}
    ${finalCtaHtml}
    ${THREE_DOORS_HTML}
    ${crossLinksHtml}
    ${EXPLORE_HTML}`;

  const ogImage = page.heroImage
    ? `${SITE_URL}/${page.heroImage}`
    : undefined;

  const html = ssrHtmlShell({
    title: page.meta.title,
    description: page.meta.description,
    canonical,
    h1: page.hero.h1,
    badge: page.hero.badge,
    tagline: page.hero.tagline,
    bodyHtml,
    ogImage,
    schemas: [faqSchema, breadcrumb, webPage, audioObjectSchema, articleSchema, howToSchema, ...(comparisonItemListSchema ? [comparisonItemListSchema] : []), ...(HIGH_PRIORITY_RATING_SLUGS.has(slug) ? [makeProductRatingSchema(slug, page)] : [])],
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
        body: `At The Private Story, personalisation begins with a short creative brief: you tell us the genre (romance, erotica, dark romance, thriller), the tone (tender, intense, slow-burn), the character genders and dynamic, and any specific scenes or settings you want to explore. An AI author then constructs a story specifically for you — no generic template, no recycled plot. The result is an audio story of around 10 minutes that feels written and performed for your ears only.<br><br>Personalisation goes beyond surface-level name insertion. The emotional arc, the pacing, the sensory details — these all reflect the brief you provided. If you asked for slow-burn tension between two rivals, that is what builds in the narrative. If you wanted something tender and melancholic, the prose reflects that register.`,
      },
      {
        h2: "Why personalised audio stories exist",
        body: `Generic romance audiobooks are written for the widest possible audience. They compromise — softening scenes that some readers might find too intense, or leaning into tropes that are commercially safe. A personalised audio story has no such constraint. It is written for one person: you.<br><br>This matters especially for anyone who wants erotic fiction that genuinely reflects their inner world — not a publisher's idea of what you're supposed to want. <a href="/personalised-audio-stories">Personalised audio stories</a> are a direct response to that gap in the market.`,
      },
      {
        h2: "Personalised vs custom vs bespoke — what is the difference?",
        body: `These three words are often used interchangeably, but there are nuances. A <em>custom</em> story implies a one-off commission, usually expensive and slow. A <em>bespoke</em> story implies a high level of craft and handmade quality. A <em>personalised</em> story implies that the content is specifically shaped around your stated preferences — which is exactly what happens at The Private Story. We use the word personalised because the creative output adapts to your input, not the other way around.<br><br>Explore <a href="/private-audio-stories">private audio stories</a> to understand how privacy and personalisation intersect in our approach.`,
      },
      {
        h2: "The role of AI in personalised audio storytelling",
        body: `AI makes personalisation scalable. Without it, a truly bespoke audio story would require commissioning a human writer, a voice actor, and an audio engineer — costing hundreds of pounds and weeks of time. With AI, you can receive a personalised story within minutes, at a fraction of that cost, without sacrificing narrative quality.<br><br>The Private Story uses large language models for story generation and professional-grade narration. Every story is reviewed for coherence, tone, and quality before delivery. The goal is a listening experience that feels human — because the creative vision behind it is yours.`,
      },
      {
        h2: "Who listens to personalised audio stories?",
        body: `Our listeners are predominantly women aged 25–45 who already consume romance fiction or literary erotica in other formats. Many are audiobook subscribers who want something more tailored. Some are podcast listeners who enjoy narrative audio but find true crime and interview formats too passive. Others are simply people who have never found fiction that matches what they privately imagine.<br><br>If you want to try one, <a href="/create-your-own-audio-story">create your own audio story</a> in under two minutes.`,
      },
      {
        h2: "The emotional intelligence of personalisation",
        body: `A truly personalised audio story is not just a story with your name inserted into the text. It is a piece of writing that understands what you wanted to feel before it began — and constructs every sentence in service of that feeling.<br><br>When you describe wanting slow burn tension between two rivals, the story does not simply include a chase scene and call it slow burn. It structures the emotional arc around accumulation: charged glances, deliberate restraint, dialogue that means more than it says. When you ask for something tender and melancholic, the prose shifts register entirely — shorter sentences, more interiority, a different pace. This is what emotional intelligence in personalisation means: the story is not just relevant to your preferences, it is written to deliver the specific feeling you described.<br><br>The result is a listening experience that feels uncomfortably accurate to your inner world — because it was built around exactly that.`,
      },
      {
        h2: "From brief to story — what actually happens",
        body: `When you complete the Casting Room at The Private Story, your seven choices are translated into a structured creative brief — a precise set of creative parameters that the AI writes toward. The brief specifies the emotional register, the character dynamic, the pacing, the setting, the tone, and the situation. It is not a prompt in the conventional AI sense; it is a detailed creative direction document.<br><br>The story generator (Mistral Large) writes original narrative from that brief. It does not retrieve an existing story and modify it. It does not find a template and fill in the blanks. It writes the story from the first sentence — shaped around every parameter in your brief. The result is then narrated to a professional standard, with attention to pacing, breath, and emotional register. Cover art is generated by gpt-image-1. The complete story is typically ready to listen within a few minutes. See also <a href="/ai-audio-story-generator">how our AI audio story generator works</a> for a technical account of the process.`,
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
      {
        q: "Can I request something very specific or unusual in my personalised audio story?",
        a: "Yes. The Casting Room lets you choose six pairings, eight chemistry types, 19 character archetypes, four intensity levels, seven endings, and 200+ situations across countries, eras, and After Dark worlds. Over a million possible configurations on the input side alone — and the story itself is then written fresh around your specific brief. If you want a slow burn story set in 1920s Paris between two rivals who are both hiding something, you can build exactly that brief.",
      },
      {
        q: "Is a personalised audio story better than an audiobook?",
        a: "It depends on what you want. An audiobook gives you a complete, fully authored work — often with multiple narrators, complex plotting, and the depth that comes from a professional novelist. A personalised audio story gives you something built around your specific preferences for this listening session — emotionally precise, private, and created for you. They serve different needs and many listeners use both.",
      },
    ],
    relatedLinks: [
      { label: "Personalised audio stories", href: "/personalised-audio-stories" },
      { label: "Private audio stories", href: "/private-audio-stories" },
      { label: "Create your own audio story", href: "/create-your-own-audio-story" },
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
      {
        h2: "Why slow burn works differently in audio than in text",
        body: `When you read a slow burn story, you control the pace. You can skim, re-read, skip ahead to the payoff, or linger on a charged paragraph. Audio removes that control entirely. The story unfolds at the narrator's pace, in real time. The pause before a loaded line of dialogue is exactly as long as the narrator makes it. The moment before a first touch arrives exactly when the story decides it arrives — not a second sooner.<br><br>This makes slow burn in audio uniquely effective. The delay is not abstract; it is happening to you, in the present tense, in your ear. The restraint has duration. The tension accumulates in real time, which is much closer to how desire actually works in the body than reading about it on a page. For many listeners, slow burn audio stories deliver an intensity that equivalent text cannot match.`,
      },
      {
        h2: "The most important moment in a slow burn story",
        body: `The architecture of a slow burn depends on the near-miss: the moment where resolution almost happens and then doesn't. The interrupted kiss. The hand that reaches and withdraws. The confession that almost makes it out. These moments are the structural heartbeat of slow burn, and their effectiveness depends entirely on whether the build-up has been sufficient. A near-miss in the first chapter is just a tease. A near-miss at the three-quarter point of a story that has earned every preceding moment of tension is devastating.<br><br>Writing a near-miss well is one of the hardest craft problems in romantic fiction. It has to feel inevitable that the resolution didn't happen — the obstacle has to be plausible — and it has to leave the listener desperate for resolution rather than frustrated. When it works, the listener cannot stop. When you request slow burn at <a href="/create">The Private Story</a>, the story is structured around this logic: building toward a payoff that feels proportionate to everything that preceded it.`,
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
      {
        q: "Does slow burn have to be between strangers?",
        a: "No. Some of the most effective slow burn stories involve characters who already know each other — colleagues, old friends, people thrown back together by circumstance. Pre-existing history adds complication and depth to the tension, because the characters already have reasons to resist acting on their feelings.",
      },
      {
        q: "What is the best slow burn payoff scene?",
        a: "The best slow burn payoff is proportionate — the resolution should feel as significant as the build-up that preceded it. Whether explicit or not, the payoff scene should carry the accumulated weight of everything the characters have been denied. In audio specifically, the payoff is often the moment where the narrator's restraint finally gives way, which creates an emotional release that is more satisfying than anything that comes easily.",
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
      {
        h2: "Content warnings in dark romance — what they mean",
        body: `Dark romance communities have developed a detailed vocabulary of content warnings — sometimes called CWs or TWs (trigger warnings) — that alert readers and listeners to specific content before they engage. Common dark romance content warnings include: dubious consent (also written as dub-con), non-consent (non-con), obsessive or stalker behaviour, violence, captivity, morally grey or villain protagonists, and graphic explicit content.<br><br>These warnings are not critiques of the genre; they are tools that allow readers to make informed choices about what they engage with. A listener who finds obsession narratives cathartic and engaging will seek them out. A listener who finds non-consensual scenarios distressing can avoid them. At The Private Story, the intensity and trope choices you make in the Casting Room serve the same function: you shape the parameters of what the story will and will not include before it is written.`,
      },
      {
        h2: "Dark romance in audio — the specific power of narrated darkness",
        body: `Dark romance translates particularly well to audio for one specific reason: narration makes interiority visceral. The reader of a dark romance novel experiences the protagonist's internal experience through text — words on a page that describe fear, desire, confusion. The listener of a dark romance audio story hears those same interior states in a voice. The narrator's breath, the pace of delivery, the warmth or edge in their tone — all of this transforms the written interiority into something felt.<br><br>A morally grey love interest reads differently from the page than he sounds when narrated. A captivity scenario unfolds differently when the listener cannot skip ahead, when the tension has duration, when the narrator's voice inhabits both characters with the same intimacy. Audio removes the distance that text creates. For dark romance specifically — where the emotional intensity is the point — that absence of distance is particularly powerful.<br><br>See <a href="/adult-audio-stories">adult audio stories</a> for more on how the full intensity spectrum works in audio.`,
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
      {
        q: "Is dark romance always explicit?",
        a: "No. Dark romance is defined by tone and theme — moral complexity, power dynamics, transgressive scenarios — not by sexual content level. Many dark romance readers prefer non-explicit or lightly explicit stories where the darkness comes from tension, danger, and moral ambiguity rather than graphic sex. At The Private Story, you control explicitness independently of darkness level.",
      },
      {
        q: "How is dark romance different from literary fiction with dark themes?",
        a: "The distinction is in the genre contract. Literary fiction with dark themes may not resolve in the protagonist's favour, may not centre a romantic relationship, and does not promise emotional payoff in the form of connection or resolution. Dark romance, even at its most transgressive, operates within a genre framework: the central romantic relationship is the story's core concern, and there is typically a resolution — however unconventional — that honours that relationship. The darkness serves the romance, not the other way around.",
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
      {
        h2: "The emotional arc of enemies-to-lovers in audio format",
        body: `Reading enemies-to-lovers and listening to it are meaningfully different experiences. On the page, you track the subtle shifts in how a character is described — the language around the antagonist softening over chapters, the interiority of the protagonist becoming more ambivalent, the reader noticing changes before the characters acknowledge them. Audio creates a different version of this: the narrator's voice carries the emotional temperature of the scene, and the listener tracks the shift in feeling through tone rather than language.<br><br>A voice that is sharp and cold in early scenes, then hesitant, then fractured — that trajectory is felt differently than reading equivalent descriptions. The moment when an antagonist becomes something else registers in the narrator's voice before any explicit statement is made. This is why enemies-to-lovers is particularly well-suited to the audio format: the emotional intelligence of narration can carry the shift with a subtlety that description alone cannot always manage. Explore <a href="/enemies-to-lovers-audio-stories">enemies-to-lovers audio stories</a> to see this in practice.`,
      },
      {
        h2: "Combining enemies-to-lovers with other romance tropes",
        body: `Enemies-to-lovers rarely appears alone. It is one of the most combinable tropes in romance fiction, working naturally alongside slow burn (the antagonism extends the delay before resolution), forced proximity (the characters cannot escape each other despite wanting to), dark romance (the opposition has genuine moral weight), and forbidden pull (the chemistry is real but the enmity makes acting on it costly).<br><br>Some of the most effective enemies-to-lovers stories layer in additional complexity: rivals with pre-existing history who must now work together, former lovers whose relationship ended badly and has since calcified into opposition, adversaries who are fighting over something they both genuinely care about. The richer the reason for the conflict, the more satisfying the eventual break. At The Private Story, you can combine chemistry types, tropes, and archetype choices to build exactly this kind of layered brief.`,
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
      {
        q: "Can enemies-to-lovers work in a short story format?",
        a: "Yes, with compression. A short enemies-to-lovers piece typically begins after the antagonism is established — the listener already knows these two people cannot stand each other — and uses a single scene, confrontation, or forced moment to crack the dynamic open. The key is that the reason for the enmity is established clearly and quickly, so the break feels earned even within a compressed timeframe.",
      },
      {
        q: "What professional settings work best for enemies-to-lovers?",
        a: "Settings that create both sustained proximity and a structural source of conflict are most effective: legal opponents who must share a case, colleagues in competing departments, creative collaborators with incompatible visions, a new hire and the person whose position they threaten. The professional setting adds a layer of constraint — acting on the chemistry has real consequences — which raises the stakes considerably.",
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
      datePublished: "2025-11-01",
      dateModified: DATE_MODIFIED,
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".tagline", ".defined-term-box"],
      },
    };

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: def.h1,
      description: def.metaDescription,
      datePublished: "2025-11-01",
      dateModified: DATE_MODIFIED,
      author: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
      mainEntityOfPage: { "@id": `${PAGE_URL}#webpage` },
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
      schemas: [definedTermSchema, faqSchema, breadcrumb, webPage, articleSchema],
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
      "Exploring audio erotica beyond Dipsea? The Private Story writes your story from scratch — personalised to your mood, cast, and imagination. Completely private.",
    badge: "Compare",
    h1: "Looking for a Dipsea Alternative?",
    tagline: "Dipsea has built something genuinely good. If you want something different — a story written from scratch, around your imagination — that is what The Private Story is here for.",
    intro: `This page is written by The Private Story. We have a commercial interest in your choosing our platform — please weigh what we say here accordingly. What we can offer honestly is a clear account of what Dipsea does well, and what The Private Story was built to do.`,
    comparisonRows: [],
    sections: [
      {
        h2: "What Dipsea does well",
        body: `Dipsea has built a genuinely strong curated library of audio erotica — professionally produced, narrated by real voice actors, and thoughtfully designed for women. It is a well-made platform that helped establish audio as a serious format for erotic fiction.`,
      },
      {
        h2: "What The Private Story is built for",
        body: `The Private Story is built around a different idea: rather than a library you browse, it writes a story around you. Before anything is generated, you make seven creative choices — the pairing, the chemistry between the characters, the archetype, the setting, the intensity, the emotional mood, and the situation. Those choices become the brief. The story is then written by AI in service of exactly what you described, narrated in the voice you selected, and delivered privately to your account.<br><br>The story exists because of your brief. It did not exist before you described it, and it will not be written for anyone else. See <a href="/personalised-audio-stories">personalised audio stories</a> for a full account of how this works, or <a href="/private-audio-stories">private audio stories</a> to understand the privacy architecture.`,
      },
      {
        h2: "World building and personalisation",
        body: `The Casting Room gives you creative control across the full world of your story. Choose from six pairings, eight chemistry types, 19 character archetypes, four intensity levels, seven endings, and 200+ situations across countries, eras, and After Dark worlds. The combination you select becomes the brief the story is written toward — a world built around your imagination for this session, not selected from a catalogue built around a general audience.<br><br>If you have ever found yourself wanting something very specific — a particular dynamic, a precise emotional register, a scenario that does not exist in any library — the Casting Room was built for exactly that. Explore <a href="/ai-audio-story-generator">how AI audio story generation works</a> or <a href="/create-your-own-audio-story">create your own story</a> to see the full creation flow.`,
      },
      {
        h2: "Privacy by design",
        body: `The Private Story was built privacy-first. There are no social features — no followers, no shared listening history, no public profiles. Your stories are stored privately in your account and are not visible to anyone else, including the platform operators. The platform does not sell data, run ads, or make listening history available to third parties.<br><br>The platform was designed from the start for listeners who want to explore their full imagination privately, without any of that exploration becoming part of a public or shared history.`,
      },
      {
        h2: "Two different things",
        body: `Dipsea is a great choice if you want to browse a curated library of professionally produced audio stories and discover content that has been made with care. The Private Story is for when you want something that does not exist yet — a story built around the specific scene, dynamic, and emotional register you have in your imagination right now. Both are valid ways to listen; they serve different moments.`,
      },
      {
        h2: "Pricing and what you get",
        body: `The Private Story offers two subscription tiers: Monthly at £29.99/month (5 story generations) and Annual at £239/year (50 story generations). Additional stories are available at £7.99 each. Every story includes the full creation flow — your brief, the written narrative, professional AI narration, and original cover art — saved privately to your account.<br><br>See the <a href="/pricing">pricing page</a> for full details and any current offers.`,
      },
    ],
    faqs: [
      {
        q: "What makes The Private Story different from a curated audio platform?",
        a: "The core difference is generative versus curatorial. A curated platform selects from stories written in advance for a general audience. The Private Story writes your story from scratch, around the choices you make before each session — the pairing, the chemistry, the situation, the mood. The story is created for this listening experience, shaped around exactly what you described wanting.",
      },
      {
        q: "How long does it take to get a personalised story?",
        a: "Most stories are generated and available to listen within a few minutes of completing the creation flow. The Casting Room — the step-by-step brief — typically takes under two minutes to complete.",
      },
      {
        q: "Is the content on The Private Story explicit?",
        a: "Yes. The Private Story supports the full spectrum from emotionally charged slow burn to fully explicit adult content, including dark romance and erotic fiction. Intensity is one of the choices you make in the creation flow — the story is calibrated to match what you selected. All explicit content is available only to age-verified users aged 18 and over.",
      },
      {
        q: "Can I listen to The Private Story alongside other platforms?",
        a: "Yes. Many listeners use more than one audio platform for different purposes. The Private Story is particularly suited to the moments when you want something created for you specifically, rather than chosen from what already exists.",
      },
      {
        q: "Does The Private Story have a free trial?",
        a: "Please check the current pricing page for any introductory offers. Availability may change over time.",
      },
    ],
  },
  {
    slug: "quinn-alternative",
    competitorName: "Quinn",
    metaTitle: "Looking for a Quinn Alternative? | The Private Story",
    metaDescription:
      "Exploring audio erotica beyond Quinn? The Private Story writes your story from scratch — private, personalised, built around your imagination. Nothing shared, nothing public.",
    badge: "Compare",
    h1: "Looking for a Quinn Alternative?",
    tagline: "Quinn has built a vibrant creative community. The Private Story takes a different path entirely — writing your story, privately, from scratch.",
    intro: `This page is written by The Private Story. We have a commercial interest in your choosing our platform — please weigh what we say here accordingly. What we can offer honestly is a clear account of what Quinn does well, and what The Private Story was built to do.`,
    comparisonRows: [],
    sections: [
      {
        h2: "What Quinn does well",
        body: `Quinn has built a vibrant community of independent audio creators — writers, voice actors, and storytellers who post across a wide range of dynamics and scenarios. It is a platform with real energy, genuine variety, and a creative community that has made it an important space in the adult audio category.`,
      },
      {
        h2: "What The Private Story is built for",
        body: `The Private Story is built for something different: a story written from scratch, around what you described wanting, delivered privately to your account. Before anything is generated, you make seven structured choices — pairing, chemistry, archetype, setting, intensity, emotional mood, and situation. Those choices become the creative brief. The story is then written by AI in service of exactly that brief, narrated in the voice you selected, and stored privately in your account.<br><br>The entire experience is between you and what you described wanting. See <a href="/private-audio-stories">private audio stories</a> for a full account of the privacy architecture, and <a href="/personalised-audio-stories">personalised audio stories</a> to understand the creation model.`,
      },
      {
        h2: "World building and personalisation",
        body: `The Casting Room gives you choices across six pairings, eight chemistry types, 19 character archetypes, four intensity levels, seven endings, and 200+ situations across countries, eras, and After Dark worlds. The combination you choose becomes the brief the story is written toward — a specific world, a specific scene, a specific dynamic, built around your imagination for this session.<br><br>The story is original — it did not exist before you described what you wanted, and it will not be written for anyone else. For listeners who have a very specific world they want to inhabit, this generative model is what the platform was built to serve. Explore <a href="/ai-audio-story-generator">how AI audio story generation works</a> or try <a href="/create-your-own-audio-story">creating your own story</a> to see the full creation flow.`,
      },
      {
        h2: "Privacy by design",
        body: `The Private Story was designed privacy-first. There are no public profiles, no social features, no shared listening history, and no feeds. Your stories are stored privately in your account and are not visible to anyone — including the platform team. The platform does not run ads, sell data, or make any listening behaviour available to third parties.<br><br>For listeners who want to explore the full range of their imagination privately, the architecture is the point — not a feature added on, but the founding design principle of the platform.`,
      },
      {
        h2: "Two different things",
        body: `Quinn is a great choice if you love discovering independent creators, following voices you enjoy, and engaging with a living community of audio storytellers. The Private Story is for when you want something that has not been made yet — a story built specifically around the scene, character, and feeling you have in mind right now. Both serve real needs; they are just different ones.`,
      },
      {
        h2: "Pricing and how The Private Story works",
        body: `The Private Story offers a Monthly subscription at £29.99/month (5 story generations) and an Annual subscription at £239/year (50 story generations). Additional stories can be generated for £7.99 each. Each story is a complete, private listening experience: your brief, a written narrative, professional AI narration, and original cover art, all stored securely in your private account.<br><br>See the <a href="/pricing">pricing page</a> for full current details.`,
      },
    ],
    faqs: [
      {
        q: "What makes The Private Story different from a creator platform?",
        a: "The core difference is between discovering creators versus receiving a story created for you. On a creator platform, you find voices and content that exist and choose what to listen to. At The Private Story, you describe what you want and a story is written around that — by AI, from scratch, for this session. Nothing is retrieved from a library; everything is generated from your brief.",
      },
      {
        q: "Is everything on The Private Story private?",
        a: "Yes. Stories are stored in your private account and are not visible to anyone else. There are no public profiles, no shared listening history, no social features of any kind. The platform was built privacy-first — not as an add-on, but as the founding design principle.",
      },
      {
        q: "Is the content on The Private Story explicit?",
        a: "Yes. The Private Story supports the full spectrum from emotionally charged slow burn to fully explicit adult content, including dark romance and erotic fiction. Intensity is one of the seven choices you make before your story is written. All explicit content is available only to age-verified users aged 18 and over.",
      },
      {
        q: "How long does a personalised story take to receive?",
        a: "Most stories are generated and available to listen within a few minutes of completing the Casting Room. The brief itself typically takes under two minutes to complete.",
      },
      {
        q: "Can I use The Private Story alongside other audio platforms?",
        a: "Yes. Many listeners use more than one platform for different moods and purposes. The Private Story is particularly suited to when you want something written specifically for you, rather than discovered from what already exists.",
      },
    ],
  },
  {
    slug: "gonewildaudio-alternative",
    competitorName: "r/GoneWildAudio",
    metaTitle: "Looking for a GoneWildAudio Alternative? | The Private Story",
    metaDescription:
      "Exploring erotic audio beyond r/GoneWildAudio? The Private Story writes your story from scratch — private, personalised, completely yours. Nothing public, nothing shared.",
    badge: "Compare",
    h1: "Looking for a GoneWildAudio Alternative?",
    tagline:
      "r/GoneWildAudio built something real. The Private Story is for when you want something different — a story created from scratch, around your imagination, that no one else can find.",
    intro:
      "Written by The Private Story. We have a commercial interest in your choosing this platform — please weigh that accordingly. What we can offer honestly is a clear account of what r/GoneWildAudio does well, and what The Private Story was built to do.",
    comparisonRows: [],
    sections: [
      {
        h2: "What r/GoneWildAudio does well",
        body: `r/GoneWildAudio is one of the most successful adult audio communities on the internet — thousands of creators across every conceivable dynamic, tone, and scenario, with the energy and variety that only a genuine community can produce. It is a remarkable space that helped make erotic audio a mainstream format.`,
      },
      {
        h2: "What The Private Story is built for",
        body: `The Private Story is built for one thing: a story written from scratch, around what you described wanting, delivered privately to your account. Before anything is generated, you make seven structured choices in the Casting Room — the pairing, the chemistry between the characters, the archetype, the setting, the emotional intensity, the mood, and the situation. Those choices become a detailed creative brief. The story is then written from the first word, shaped by exactly what you described, narrated in the voice you selected.<br><br>The experience is entirely between you and what you chose. See <a href="/private-audio-stories">private audio stories</a> for a full account of the privacy architecture, and <a href="/personalised-audio-stories">personalised audio stories</a> to understand the creation model.`,
      },
      {
        h2: "World building and personalisation",
        body: `The Casting Room gives you creative control across six pairings, eight chemistry types, 19 character archetypes, four intensity levels, seven endings, and 200+ situations across countries, eras, and After Dark worlds. The combination you select becomes the brief the story is written toward — a specific world, a specific scene, a specific dynamic, built around your imagination for this session.<br><br>The story is original — it did not exist before you described what you wanted, and it will not be written for anyone else. For listeners who have a very specific world they want to inhabit — a precise dynamic, a particular emotional register, a scenario that lives in their imagination — this generative model is what the platform was built for. Explore <a href="/ai-audio-story-generator">how AI audio story generation works</a> or try <a href="/create-your-own-audio-story">creating your own story</a> to see the full creation flow.`,
      },
      {
        h2: "Privacy by design",
        body: `The Private Story was built privacy-first. There are no public profiles, no social features, no shared listening history, and no feeds. Your stories are stored privately in your account and are not visible to anyone — including the platform team. The platform does not run ads, sell data, or make any listening behaviour available to third parties.<br><br>For listeners who want to explore the full range of their imagination privately, the architecture is the point. It is not a feature added on — it is the founding design of the platform. Read the <a href="/privacy">full privacy commitment</a> to understand exactly what this means in practice.`,
      },
      {
        h2: "Two different things",
        body: `r/GoneWildAudio is a great choice if you love the energy of a community, the variety of many creator voices, and the pleasure of discovering new audio. The Private Story is for when you want something that has not been made yet — a story built specifically around the scene, character dynamic, and emotional register you have in your imagination right now. Both serve real needs; they are just different ones. Many listeners find a use for both.`,
      },
      {
        h2: "Pricing and what you get",
        body: `The Private Story offers two subscription tiers — Monthly at £29.99/month (5 story generations) and Annual at £239/year (50 story generations) — with additional stories available beyond your plan allocation. Every story includes the full creation flow: your brief, the written narrative, professional narration in the voice you selected, and original cover art. Everything is saved privately to your account.<br><br>See the <a href="/pricing">pricing page</a> for full details and any current offers.`,
      },
    ],
    faqs: [
      {
        q: "What makes The Private Story different from r/GoneWildAudio?",
        a: "The fundamental difference is generative versus community-uploaded. r/GoneWildAudio gives you access to content that creators have already made and uploaded publicly. The Private Story writes your story from scratch based on choices you make before each session — the pairing, the chemistry, the setting, the mood, the intensity. Nothing is retrieved from a public archive; the story is created for this listening experience, shaped around what you just described wanting.",
      },
      {
        q: "Is The Private Story private?",
        a: "Yes, by design. The Private Story has no public-facing layer at all — no social features, no visible activity, no history shared with anyone. Your stories and your creation choices belong to your account and are not accessible to anyone else, including the platform team.",
      },
      {
        q: "Can I get the same variety on The Private Story as on r/GoneWildAudio?",
        a: "r/GoneWildAudio offers enormous variety through the sheer volume of creator-uploaded content — variety that comes from human diversity. The Private Story offers variety through the combination of your choices across hundreds of settings, moods, archetypes, chemistry types, and situations — effective millions of possible story combinations. The kind of variety is different: GWA gives you many voices; The Private Story gives you any scenario you can describe.",
      },
      {
        q: "Is the content on The Private Story as explicit as r/GoneWildAudio?",
        a: "Yes. The Private Story supports the full spectrum from emotionally charged slow burn to fully explicit adult content. Intensity is one of the choices you make in the creation flow — the story is calibrated to match what you selected. All explicit content is available only to age-verified users aged 18 and over.",
      },
      {
        q: "Does The Private Story have a free option?",
        a: "Please check the current pricing page for any introductory offers. Availability may change over time. The platform is a premium subscription service — you are paying for original stories created specifically for you, not access to a free community archive.",
      },
      {
        q: "Looking for something more specific than what's in the archive?",
        a: "The Casting Room at The Private Story lets you describe the exact scenario, character dynamic, and emotional register you are looking for — and generates a story from those choices. If what you want is too specific for any existing archive, that is exactly what the platform was built for.",
      },
      {
        q: "Can I use both GWA and The Private Story?",
        a: "Yes, and many listeners do. They serve genuinely different needs. r/GoneWildAudio is strongest for discovery, community, and browsing a varied catalogue of creator-made content. The Private Story is for when you want something created specifically for you — a scenario too specific to find in any archive, or a session where the privacy of the experience matters as much as the content. Using both makes sense if you value what each does: GWA for variety and community, The Private Story for the moments when you want something that does not already exist.",
      },
    ],
  },
  {
    slug: "ferly-alternative",
    competitorName: "Ferly",
    metaTitle: "Looking for a Ferly Alternative? | The Private Story",
    metaDescription:
      "Exploring intimate audio beyond Ferly? The Private Story writes your story from scratch — personalised to your imagination, narrated, and completely private. Nothing shared, nothing public.",
    badge: "Compare",
    h1: "Looking for a Ferly Alternative?",
    tagline:
      "Ferly built something genuinely valuable for intimate audio. The Private Story takes a different path entirely — writing your story, privately, from scratch.",
    intro:
      "Written by The Private Story. We have a commercial interest in your choosing this platform — please weigh that accordingly. What we can offer honestly is a clear account of what Ferly does well, and what The Private Story was built to do.",
    comparisonRows: [],
    sections: [
      {
        h2: "What Ferly does well",
        body: `Ferly has created a genuinely thoughtful space in the intimate audio category — mindful, educational, and built for women who want to explore their relationship with desire in a careful, considered way. It is a platform that takes the inner experience of sexuality seriously.`,
      },
      {
        h2: "What The Private Story is built for",
        body: `The Private Story is built for narrative immersion — a story created around your specific choices, that you inhabit as a listening experience. Before anything is created, you make seven specific choices in the Casting Room: the pairing, the chemistry between the characters, the archetype, the setting, the emotional intensity, the mood, and the situation. Those choices become the creative brief. The story is then generated in service of exactly what you described, narrated in the voice you selected, and stored privately in your account. See <a href="/personalised-audio-stories">personalised audio stories</a> for a full account of how this works, or <a href="/private-audio-stories">private audio stories</a> to understand the privacy architecture.`,
      },
      {
        h2: "World building and personalisation",
        body: `The Casting Room gives you choices across six pairings, eight chemistry types, 19 character archetypes, four intensity levels, seven endings, and 200+ situations across countries, eras, and After Dark worlds. The combination you choose becomes the brief the story is built toward — a specific world, a specific scene, a specific dynamic, built around your imagination for this session.<br><br>The story is original — it did not exist before you described what you wanted, and it will not be written for anyone else. For listeners who have a very specific world they want to inhabit — a particular character, a precise dynamic, an emotional register that curated content has never quite reached — this generative model is what the platform was built to serve. See also <a href="/ai-audio-story-generator">how audio story generation works</a>.`,
      },
      {
        h2: "Privacy by design",
        body: `The Private Story was designed privacy-first. There are no public profiles, no social features, no shared listening history, and no recommendation feeds visible to others. Your stories are stored privately in your account and are not visible to anyone — including the platform team. The platform does not run ads, sell data, or make any listening behaviour available to third parties.<br><br>For listeners who want to explore the full range of their imagination privately, the architecture is the point. It is not a feature added on — it is the founding design principle of the platform.`,
      },
      {
        h2: "What kind of listener chooses each platform",
        body: `Ferly is the better choice if you want to reconnect with your body and desire in a thoughtful, guided way — if what you are looking for is understanding, exploration, and intimate education framed within a supportive and mindful context. Ferly has built something genuinely valuable for listeners at that stage of their relationship with their own sexuality, and it does this better than platforms built primarily around erotic fiction.<br><br>The Private Story is the better choice if you want to be inside a story — a narrative experience that is specific to your imagination, this session, this mood. If you have a clear picture of the character, the dynamic, the emotional register you want to inhabit, and you want something that is genuinely built around that picture rather than selected from a catalogue, The Private Story was built for exactly that. Many listeners find both platforms useful at different times: Ferly for reflection and reconnection, The Private Story for the moments when you want something specific and yours.`,
      },
      {
        h2: "Pricing and what you get",
        body: `The Private Story offers a Monthly subscription at £29.99/month (5 story generations) and an Annual subscription at £239/year (50 story generations). Additional stories can be generated for £7.99 each. Each story is a complete, private listening experience: your brief, a written narrative, professional AI narration in your chosen voice, and original cover art, all stored securely in your private account.<br><br>There are no shared features, no feed to browse, and no community content. The value is entirely the story itself — created for you, and for no one else. See the <a href="/pricing">pricing page</a> for full current details.`,
      },
    ],
    faqs: [
      {
        q: "What makes The Private Story different from a mindful intimacy platform like Ferly?",
        a: "The core difference is in purpose: Ferly is built for reflection, reconnection, and intimate education — helping listeners understand and explore their relationship with their own desire. The Private Story is built for narrative immersion — a story created around your specific choices, that you inhabit as a listening experience. They serve genuinely different imaginative needs, and many listeners find both useful.",
      },
      {
        q: "Is the content on The Private Story explicit?",
        a: "Yes. The Private Story supports the full spectrum from emotionally charged slow burn to fully explicit adult fiction, including dark romance and erotic fiction. Intensity is one of the choices you make before your story is generated — the story is calibrated to match what you selected. All explicit content is available only to age-verified users aged 18 and over.",
      },
      {
        q: "How long does it take to receive a personalised story?",
        a: "Most stories are generated and available to listen within a few minutes of completing the Casting Room. The brief itself — seven structured creative choices — typically takes under two minutes to complete. You can be listening to your story within five minutes of starting.",
      },
      {
        q: "Is everything at The Private Story private?",
        a: "Yes. Stories are stored in your private account and are not visible to anyone else. There are no public profiles, no shared listening history, no social features of any kind. The platform was built privacy-first — not as an add-on, but as the founding design principle.",
      },
      {
        q: "Can I use The Private Story alongside Ferly?",
        a: "Yes, and many listeners do. Ferly is well-suited to the moments when you want to reflect, reconnect, and explore what desire means for you. The Private Story is for the moments when you want a story built specifically around your imagination. The two platforms serve different needs and work well alongside each other.",
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
      <p style="color:#a09080;font-style:italic;font-size:14px;margin-bottom:24px">${esc(comp.intro)}</p>
      ${TRUST_BAR_HTML}
      ${comp.comparisonRows.length > 0 ? tableHtml : ""}
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
