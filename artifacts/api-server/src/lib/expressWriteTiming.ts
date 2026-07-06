/** Per-beat timing for Express write path (logged at end of generation). */

export type ExpressWriteTimingEntry = {
  beat: string;
  ms: number;
  detail?: string;
};

const entries: ExpressWriteTimingEntry[] = [];

export function resetExpressWriteTimings(): void {
  entries.length = 0;
}

export function recordExpressWriteTiming(beat: string, ms: number, detail?: string): void {
  entries.push({ beat, ms, detail });
}

export async function timeExpressWrite<T>(
  beat: string,
  fn: () => Promise<T>,
  detail?: string,
): Promise<T> {
  const t0 = Date.now();
  try {
    return await fn();
  } finally {
    recordExpressWriteTiming(beat, Date.now() - t0, detail);
  }
}

export function getExpressWriteTimings(): ExpressWriteTimingEntry[] {
  return [...entries];
}

export function summarizeExpressWriteTimings(): {
  totalMs: number;
  llmCalls: number;
  byBeat: ExpressWriteTimingEntry[];
} {
  const byBeat = getExpressWriteTimings();
  return {
    totalMs: byBeat.reduce((s, e) => s + e.ms, 0),
    llmCalls: byBeat.length,
    byBeat,
  };
}
