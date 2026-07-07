/**
 * Express write-time audio script — the sustainable multi-voice contract.
 *
 * Each beat returns an ordered `script` array labelling every span as narrator,
 * protagonist (CHAR_A), or love_interest (CHAR_B). TTS uses these labels
 * directly via [N]/[A]/[B] tags — no post-hoc quote guessing.
 */

export type WriterScriptRole = "narrator" | "protagonist" | "love_interest";

export type WriterScriptLine = {
  role: WriterScriptRole;
  text: string;
};

const ROLE_ALIASES: Record<string, WriterScriptRole> = {
  narrator: "narrator",
  n: "narrator",
  narration: "narrator",
  protagonist: "protagonist",
  a: "protagonist",
  char_a: "protagonist",
  listener: "protagonist",
  you: "protagonist",
  love_interest: "love_interest",
  b: "love_interest",
  char_b: "love_interest",
  partner: "love_interest",
  li: "love_interest",
};

export const EXPRESS_AUDIO_SCRIPT_CONTRACT = `
AUDIO SCRIPT (MANDATORY — production multi-voice):
Return a "script" array — ordered spans, each labelled who speaks in audio.
- "narrator": scene description, interiority, action (unquoted prose).
- "protagonist": the listener's spoken lines (second-person "you" in narration; quoted speech is protagonist).
- "love_interest": the partner's spoken lines.

Rules:
1. Every quoted dialogue line MUST be its own script entry with role protagonist or love_interest — never narrator.
2. Do NOT put spoken lines in narrator spans. Narrator never speaks character dialogue.
3. Merge consecutive same-role spans only when natural; split at every speaker change.
4. "text" field: optional flat prose duplicate for display — if omitted, we derive it from script.
5. PERFORM/DECLARE: alternate protagonist and love_interest entries for dialogue exchanges; narrator only between blocks.

Example:
"script": [
  { "role": "narrator", "text": "The suite is quiet except for the rain." },
  { "role": "love_interest", "text": "\\"Don't move,\\" he says, voice low." },
  { "role": "protagonist", "text": "\\"I'm not going anywhere,\\" you breathe." }
]
`.trim();

export function normalizeWriterScriptRole(raw: unknown): WriterScriptRole | null {
  if (typeof raw !== "string") return null;
  return ROLE_ALIASES[raw.toLowerCase().trim()] ?? null;
}

export function parseWriterScriptField(value: unknown): WriterScriptLine[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const lines: WriterScriptLine[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const o = item as Record<string, unknown>;
    const role = normalizeWriterScriptRole(o.role);
    const text = typeof o.text === "string" ? o.text.trim() : "";
    if (!role || !text) return null;
    lines.push({ role, text });
  }
  return lines.length ? lines : null;
}

export function writerScriptToDisplayProse(script: WriterScriptLine[]): string {
  return script
    .map((l) => l.text.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function writerScriptToTaggedRawText(script: WriterScriptLine[]): string {
  const tagFor: Record<WriterScriptRole, string> = {
    narrator: "N",
    protagonist: "A",
    love_interest: "B",
  };
  const parts: string[] = [];
  for (const line of script) {
    const t = line.text.trim();
    if (!t) continue;
    const letter = tagFor[line.role];
    parts.push(`[${letter}]${t}[/${letter}]`);
  }
  return parts.join(" ");
}

export function mergeWriterScripts(scripts: WriterScriptLine[][]): WriterScriptLine[] {
  const out: WriterScriptLine[] = [];
  for (const script of scripts) {
    for (const line of script) {
      const prev = out[out.length - 1];
      if (prev && prev.role === line.role) {
        prev.text = `${prev.text} ${line.text}`.trim();
      } else {
        out.push({ ...line, text: line.text.trim() });
      }
    }
  }
  return out;
}

export type WriterScriptValidation = {
  ok: boolean;
  issues: string[];
};

/** Validate script before accepting a beat — catches narrator-as-dialogue mistakes early. */
export function validateWriterScript(
  script: WriterScriptLine[],
  opts?: { phase?: string; requireBothSpeakers?: boolean },
): WriterScriptValidation {
  const issues: string[] = [];
  const phase = (opts?.phase ?? "").toUpperCase();
  let narratorQuoteLines = 0;
  let protagLines = 0;
  let liLines = 0;

  for (const line of script) {
    const hasQuotes = /[""][^"""]+[""]/.test(line.text) || /"[^"]+"/.test(line.text);
    if (line.role === "narrator" && hasQuotes) {
      narratorQuoteLines += 1;
    }
    if (line.role === "protagonist") protagLines += 1;
    if (line.role === "love_interest") liLines += 1;
  }

  if (narratorQuoteLines > 0) {
    issues.push(
      `${narratorQuoteLines} narrator span(s) contain quoted dialogue — move quotes to protagonist or love_interest`,
    );
  }

  const needsBoth =
    opts?.requireBothSpeakers ??
    (phase === "PERFORM" || phase === "DECLARE" || phase === "FRAME");
  if (needsBoth && (protagLines === 0 || liLines === 0)) {
    issues.push(
      `script must include both protagonist and love_interest spans (got protagonist=${protagLines}, love_interest=${liLines})`,
    );
  }

  if (phase === "PERFORM" && protagLines + liLines < 4) {
    issues.push(`PERFORM script needs at least 4 character spans (got ${protagLines + liLines})`);
  }

  return { ok: issues.length === 0, issues };
}
