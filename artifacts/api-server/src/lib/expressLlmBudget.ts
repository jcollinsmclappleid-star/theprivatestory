/** Caps total Mistral calls per Express story — headroom for write-time script validation + retries. */
const EXPRESS_LLM_CALL_LIMIT = Number(process.env.EXPRESS_LLM_CALL_LIMIT ?? 20);

let used = 0;

export function resetExpressLlmBudget(): void {
  used = 0;
}

export function expressLlmCallsUsed(): number {
  return used;
}

export function canMakeExpressLlmCall(): boolean {
  return used < EXPRESS_LLM_CALL_LIMIT;
}

export function recordExpressLlmCall(): void {
  used += 1;
}

export function assertExpressLlmBudget(label: string): void {
  if (!canMakeExpressLlmCall()) {
    throw new Error(`Express LLM budget exhausted (${EXPRESS_LLM_CALL_LIMIT}) at ${label}`);
  }
}
