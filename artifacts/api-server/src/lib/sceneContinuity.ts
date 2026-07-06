/**
 * Structured continuity passed between Express 4-beat scene writes.
 */

export type SceneContinuityLedger = {
  location: string;
  clothing: string;
  blindfold: "off" | "on" | "removed";
  restraint: "off" | "on" | "released";
  lastPosition: string;
  actsCompleted: string[];
  partnerName: string;
  /** Customer Make it yours tags contracted for this story. */
  activeTags: string[];
};

export type ContinuityUpdate = Partial<
  Pick<
    SceneContinuityLedger,
    "location" | "clothing" | "blindfold" | "restraint" | "lastPosition" | "actsCompleted"
  >
>;

export function buildInitialLedger(opts: {
  setting?: string;
  partnerName?: string;
  activeTags?: string[];
}): SceneContinuityLedger {
  return {
    location: opts.setting ?? "the scene location",
    clothing: "fully dressed",
    blindfold: "off",
    restraint: "off",
    lastPosition: "standing apart",
    actsCompleted: [],
    partnerName: opts.partnerName ?? "James",
    activeTags: opts.activeTags ?? [],
  };
}

export function ledgerPromptBlock(ledger: SceneContinuityLedger): string {
  return `CONTINUITY STATE (must match and extend — do not contradict):
${JSON.stringify(ledger, null, 2)}`;
}

export function mergeContinuityUpdate(
  ledger: SceneContinuityLedger,
  update?: ContinuityUpdate,
): SceneContinuityLedger {
  if (!update) return ledger;
  return {
    ...ledger,
    ...update,
    actsCompleted: update.actsCompleted
      ? [...new Set([...ledger.actsCompleted, ...update.actsCompleted])]
      : ledger.actsCompleted,
  };
}

export function parseContinuityFromSceneJson(parsed: Record<string, unknown>): ContinuityUpdate | undefined {
  const c = parsed.continuity;
  if (!c || typeof c !== "object") return undefined;
  const o = c as Record<string, unknown>;
  const blindfold =
    o.blindfold === "on" || o.blindfold === "off" || o.blindfold === "removed"
      ? o.blindfold
      : undefined;
  const restraint =
    o.restraint === "on" || o.restraint === "off" || o.restraint === "released"
      ? o.restraint
      : undefined;
  return {
    location: typeof o.location === "string" ? o.location : undefined,
    clothing: typeof o.clothing === "string" ? o.clothing : undefined,
    blindfold,
    restraint,
    lastPosition: typeof o.lastPosition === "string" ? o.lastPosition : undefined,
    actsCompleted: Array.isArray(o.actsCompleted)
      ? o.actsCompleted.filter((x): x is string => typeof x === "string")
      : undefined,
  };
}
