/**
 * Mid-page CTA destination per page slug.
 *
 * Single source of truth shared by the React SEOPage renderer and the SSR
 * Googlebot renderer so both produce the same CTA href for a given slug
 * (no hydration mismatch, no SEO/UX divergence).
 *
 * All CTAs route to /after-dark (Personalised Erotica funnel).
 * Labels stay trope-aware where the slug signals intent.
 */
export interface MidCtaTarget {
  label: string;
  href: string;
}

const AFTER_DARK = "/after-dark";

export function pickMidCtaTarget(slug: string): MidCtaTarget {
  if (/(billionaire|mafia|dark-romance|forbidden|enemies-to-lovers|smut|steamy|erotic|after-dark|intimate|late-night|fantasy)/.test(slug)) {
    return { label: "Create your erotica", href: AFTER_DARK };
  }
  if (/(slow-burn|romance|romantic|love-story|emotional)/.test(slug)) {
    return { label: "Create your romantic erotica", href: AFTER_DARK };
  }
  if (/(bedtime|sleep|relax|drift|quiet)/.test(slug)) {
    return { label: "Create your erotica", href: AFTER_DARK };
  }
  return { label: "Create your erotica", href: AFTER_DARK };
}
