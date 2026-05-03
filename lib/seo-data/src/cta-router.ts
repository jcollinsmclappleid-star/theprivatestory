/**
 * Mid-page CTA destination per page slug.
 *
 * Single source of truth shared by the React SEOPage renderer and the SSR
 * Googlebot renderer so both produce the same CTA href for a given slug
 * (no hydration mismatch, no SEO/UX divergence).
 *
 * Routing rules:
 *   - bedtime / sleep / relax / drift slugs   → /drift   (The Quiet Room)
 *   - erotic / dark / intimate / forbidden    → /after-dark
 *   - everything else (romantic, slow-burn, …) → /create  (Romance/Story Room)
 *
 * Substring-tested (no strict word boundaries) so `relaxing-audio-stories`,
 * `erotic-audio-stories-for-women`, etc. all classify correctly.
 */
export interface MidCtaTarget {
  label: string;
  href: string;
}

export function pickMidCtaTarget(slug: string): MidCtaTarget {
  if (/(bedtime|sleep|relax|drift)/.test(slug)) {
    return { label: "Drift into a bedtime story", href: "/drift" };
  }
  if (/(erotic|after-dark|dark-romance|intimate|forbidden|late-night|fantasy)/.test(slug)) {
    return { label: "Enter After Dark", href: "/after-dark" };
  }
  return { label: "Create your story", href: "/create" };
}
