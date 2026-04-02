import { Router, type IRouter, type Request, type Response } from "express";
import { seoPageMap } from "../seoPageData.js";
import { ssrHtmlShell } from "../ssrShared.js";

const SITE_URL = "https://theprivatestory.com";
const CACHE_1D = "public, max-age=86400, stale-while-revalidate=3600";

const router: IRouter = Router();

router.get("/:slug", (req: Request, res: Response, next) => {
  const { slug } = req.params as { slug: string };
  const page = seoPageMap.get(slug);

  if (!page) return next();

  const canonical = `${SITE_URL}/${slug}`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "The Private Story", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Discover All Story Types", item: `${SITE_URL}/discover` },
      { "@type": "ListItem", position: 3, name: page.h1, item: canonical },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: canonical,
    dateModified: "2026-04-02",
    publisher: {
      "@type": "Organization",
      name: "The Private Story",
      url: SITE_URL,
    },
    breadcrumb: { "@id": `${canonical}#breadcrumb` },
  };

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

    <div class="trust-bar">
      <div class="trust-item"><strong>Completely private</strong><span>No social, no history shared</span></div>
      <div class="trust-item"><strong>Made for you</strong><span>Generated around your choices</span></div>
      <div class="trust-item"><strong>Narrated audio</strong><span>Ready to listen instantly</span></div>
      <div class="trust-item"><strong>Yours alone</strong><span>Only you can access your stories</span></div>
    </div>

    ${sectionsHtml}

    <section>
      <h2>How It Works</h2>
      <p>Choose your mood and emotional register. The story is generated around your selections — not retrieved from a library, but written from scratch for you. Your personalised audio story is narrated and saved privately to your account.</p>
      <p><a href="/create">Create yours in under two minutes →</a></p>
    </section>

    ${faqsHtml}

    <section>
      <h2>Explore Related</h2>
      <p><a href="/personalised-audio-stories">Personalised audio stories</a> · <a href="/private-audio-stories">Private audio stories</a> · <a href="/create-your-own-audio-story">Create your own audio story</a> · <a href="/discover">Discover all story types</a></p>
    </section>`;

  const html = ssrHtmlShell({
    title: page.title,
    description: page.description,
    canonical,
    h1: page.h1,
    badge: page.badge,
    tagline: page.tagline,
    bodyHtml,
    schemas: [faqSchema, breadcrumbSchema, webPageSchema],
  });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", CACHE_1D);
  res.status(200).send(html);
});

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default router;
