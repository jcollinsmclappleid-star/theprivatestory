---
name: Pack-credit idempotency
description: How authenticated credit-pack purchases are credited exactly once and never lost
---

Credit-pack crediting for authenticated buyers is anchored on the unique Stripe
checkout session id (a row in pendingPurchasesTable). Both the webhook and the
live-check fallback (/api/stripe/verify-session) credit through one shared helper
that flips `claimed: false -> true` atomically; only the winner credits.

**Rule:** the claimed-flip AND the user-credit update MUST run in the SAME db
transaction, and the credit update must assert a row was actually updated
(throw + rollback otherwise).

**Why:** if you mark the row claimed before crediting (or in a separate write),
a failed/zero-row credit update leaves the session permanently "claimed" — every
retry returns duplicate and the buyer gets ZERO credits despite paying. This is
worse than double-crediting because it silently denies access. Found via architect
review; the first implementation had this exact gap.

**How to apply:** any new "credit once per Stripe session/event" path (packs,
future one-off purchases) must keep the idempotency guard and the balance mutation
in one transaction so a failure rolls back the guard and a retry can recover.
