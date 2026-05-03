export interface ComparisonTableRow {
  feature: string;
  thePrivateStory: string;
  other: string;
}

/**
 * A paragraph can be a plain string OR a structured object that lets us
 * inject in-text links without ever resorting to HTML strings (which would
 * render as literal text, since the renderer outputs paragraphs as escaped
 * React text nodes — not dangerouslySetInnerHTML).
 *
 * Each link's `match` is a substring inside `text` — the renderer splits the
 * paragraph on each match (in order) and replaces it with a wouter <Link>.
 */
export type ParagraphContent =
  | string
  | { text: string; links?: Array<{ match: string; href: string }> };

export interface SEOPageConfig {
  meta: { title: string; description: string };
  hero: {
    badge?: string;
    h1: string;
    tagline: string;
  };
  heroCTALabel?: string;
  heroCTAHref?: string;
  heroImage?: string;
  /**
   * Optional pool of inline body image filenames (relative to /public, e.g.
   * "images/seo-body-candlelit-doorway.png"). Must be **non-human, dark
   * editorial illustration** — see brand criteria. When omitted, the renderer
   * falls back to a deterministic rotation of the shared brand-compliant pool.
   */
  bodyImages?: string[];
  dateModified?: string;
  showCastingPreview?: boolean;
  sections: Array<{
    h2: string;
    paragraphs: ParagraphContent[];
    bullets?: string[];
  }>;
  howItWorks: Array<{ heading: string; body: string }>;
  scenarios: {
    h2?: string;
    intro?: string;
    items: Array<{ heading: string; body: string }>;
    interstitial?: string;
  };
  benefits: {
    h2?: string;
    items: Array<{ heading: string; body: string }>;
  };
  fullPicture: {
    h2: string;
    paragraphs: ParagraphContent[];
  };
  finalCTA: {
    h2: string;
    paragraphs: string[];
    primary: { label: string; href: string };
    links: Array<{ label: string; href: string }>;
  };
  faqs: Array<{ q: string; a: string }>;
  comparisonTable?: {
    caption: string;
    otherLabel: string;
    rows: ComparisonTableRow[];
  };
}
