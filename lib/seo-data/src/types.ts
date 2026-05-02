export interface ComparisonTableRow {
  feature: string;
  thePrivateStory: string;
  other: string;
}

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
  dateModified?: string;
  showCastingPreview?: boolean;
  sections: Array<{
    h2: string;
    paragraphs: string[];
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
    paragraphs: string[];
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
