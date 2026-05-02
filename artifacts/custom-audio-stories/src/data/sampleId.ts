/**
 * Stable id helpers for Editor's Pick samples in the global audio store.
 *
 * Samples flow through the same `useAudioPlayer` store as full Stories, but
 * have no `/story/{id}` route — the FloatingPlayer detects this prefix to
 * link back to `/samples` instead.
 *
 * Kept in its own tiny module so eagerly-loaded callers (FloatingPlayer)
 * don't pull the whole lazy `pages/Samples.tsx` chunk into the main bundle.
 */
export const SAMPLE_ID_PREFIX = "sample-";

export const isSampleId = (id: string | undefined | null): boolean =>
  !!id && id.startsWith(SAMPLE_ID_PREFIX);
