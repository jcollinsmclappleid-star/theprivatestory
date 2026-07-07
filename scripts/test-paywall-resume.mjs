/**
 * Unit checks for paywall resume redirect logic (no browser required).
 */
const PENDING_CAST_KEY = "afterDarkPendingCast";
const AFTER_DARK_CHECKOUT_STATE_KEY = "afterDarkCheckoutState";

function createStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  };
}

function hasPendingAfterDarkPaywall(storage) {
  try {
    return !!storage.getItem(PENDING_CAST_KEY);
  } catch {
    return false;
  }
}

function getPostPurchaseRedirectPath(storage) {
  return hasPendingAfterDarkPaywall(storage)
    ? "/after-dark?checkout=success"
    : "/create";
}

let passed = 0;
let failed = 0;

function assert(name, cond) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
  }
}

const storage = createStorage();

assert("no pending cast → /create", getPostPurchaseRedirectPath(storage) === "/create");

storage.setItem(PENDING_CAST_KEY, JSON.stringify({ casting: { pairing: "Her & Him" }, allTags: [] }));
assert(
  "pending cast → /after-dark?checkout=success",
  getPostPurchaseRedirectPath(storage) === "/after-dark?checkout=success",
);

storage.clear();
assert("cleared storage → /create again", getPostPurchaseRedirectPath(storage) === "/create");

storage.setItem(AFTER_DARK_CHECKOUT_STATE_KEY, JSON.stringify({ confirmedPairing: "Her & Him" }));
assert(
  "checkout state alone does not change redirect (cast drives path)",
  getPostPurchaseRedirectPath(storage) === "/create",
);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
