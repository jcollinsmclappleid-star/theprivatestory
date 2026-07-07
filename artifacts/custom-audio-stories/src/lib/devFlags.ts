/** Skip paywall in local dev only — never on deployed builds. */
export const canBypassPaywall =
  import.meta.env.DEV ||
  (typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"));
