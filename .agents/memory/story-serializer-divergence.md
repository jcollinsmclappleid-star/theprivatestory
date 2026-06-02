---
name: Story serializer divergence (cover vs audio)
description: Why a story cover can be blank while audio plays — list vs detail endpoint field-mapping mismatch
---

When a generated-story symptom is "audio plays but the cover image is blank/black", suspect a **flat-field mapping divergence between the list and detail story endpoints**, NOT the media URL/auth/storage.

**Why:** The raw DB row exposes `audioUrl` as a top-level column but stores the cover nested in the `images` JSONB (`images.cover`). The frontend reads a flat `story.coverImage`. List endpoints map the row through a serializer that produces flat `coverImage`; if the single-story detail endpoint returns the raw row instead, audio works (top-level column) but the cover is `undefined` → blank.

**How to apply:** Audio and images share identical serving infra (local disk → GCS fallback, same auth-gated `/api/audio` & `/api/images` routes, root-relative URLs with a root-scoped session cookie). Both files normally exist in GCS. So an asymmetry (audio ok, cover broken) points at the serialized JSON shape, not the URL. Make every endpoint that returns a story add the flat `coverImage` (from `images.cover || images.coverImage`) — but for the player, do NOT route through the trimming list-serializer, because the player also needs `scenes` and `castingData` which that serializer drops; instead spread the row and add the flat field.

**Note:** Frontend media URLs are root-relative `/api/...` with NO `BASE_URL`/API_BASE prefix (the audio `<audio src>` uses the raw value). Prefixing media with `BASE_URL` (`/custom-audio-stories/api/...`) BREAKS it — that path returns the SPA index.html, not the file.
