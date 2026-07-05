/**
 * TTS-only pass: mute narrator dialogue tags after voice assignment.
 * Keep in sync with src/lib/narratorAttributionMute.ts
 */

const ATTR_VERBS =
  "said|asked|replied|answered|whispered|murmured|breathed|muttered|growled|" +
  "demanded|told|added|sighed|gasped|moaned|hissed|laughed|warned|admitted|" +
  "confessed|urged|pleaded|teased|promised|repeated|continued|insisted|" +
  "called|shouted|snapped|purred|drawled|countered|offered|begged|" +
  "says|asks|replies|answers|whispers|murmurs|breathes|mutters|growls|" +
  "demands|tells|adds|sighs|gasps|moans|hisses|laughs|warns|admits|" +
  "confesses|urges|pleads|teases|promises|repeats|continues|insists|" +
  "calls|shouts|snaps|purrs|drawls|counters|offers|begs|" +
  "groans|notes|observes|suggests|agrees|concedes|manages|announces";

const ATTR_RE = new RegExp(`\\b(${ATTR_VERBS})\\b`, "i");
const ATTR_TAIL_RE = new RegExp(
  `(?:${ATTR_VERBS})(?:\\s+(?:his|her|their|my|your|a|an|the)\\s+[\\w'-]+|\\s+[\\w'-]+){0,4}[.!?…,\\-]*$`,
  "i",
);

const SCAFFOLD_WORD =
  /^(?:the|he|she|they|him|her|his|their|them|it|i|you|supervisor|neighbour|neighbor|manager|bodyguard|masseuse|driver|stranger|woman|man|[A-Z][a-z]+)$/i;

function isScaffoldPrefix(prefix) {
  const words = prefix.trim().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((w) => SCAFFOLD_WORD.test(w));
}

function proseOnly(sentence) {
  return sentence
    .replace(/[“"][^“”"]*[”"]/g, " ")
    .replace(/[''][^'']*['']/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[,;:\-—\s]+|[,;:\-—\s]+$/g, "")
    .trim();
}

export function isAttributionOnlySentence(sentence) {
  const stripped = proseOnly(sentence);
  if (!stripped) return true;
  if (stripped.length > 120) return false;
  if (!ATTR_RE.test(stripped)) return false;
  if (stripped.split(/\s+/).length > 10) return false;

  const withoutFillers = stripped
    .replace(/^(?:\.{1,3}|…|—|-|,|\s|and\s+|then\s+|finally\s+|quietly\s+|softly\s+|still\s+)*/i, "")
    .trim();
  if (!ATTR_TAIL_RE.test(withoutFillers)) return false;

  const verbMatch = withoutFillers.match(ATTR_RE);
  if (!verbMatch || verbMatch.index === undefined) return false;
  const prefix = withoutFillers.slice(0, verbMatch.index).trim();
  if (!prefix) return true;
  return isScaffoldPrefix(prefix);
}

export function narratorTextForTts(text) {
  const t = text.trim();
  if (!t) return null;

  const sentences = t.match(/[^.!?…]+[.!?…]+["']?\s*|[^.!?…]+$/g) ?? [t];
  let kept = sentences
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !isAttributionOnlySentence(s));

  if (kept.length === 0) return null;

  const attrClause = new RegExp(
    `[,\\s]+(?:(?:the\\s+)?[\\w'-]+\\s+)*(?:${ATTR_VERBS})(?:\\s+(?:his|her|their|my|your|a|an|the)\\s+[\\w'-]+|\\s+[\\w'-]+){0,4}[.!?…,]*`,
    "gi",
  );
  kept = kept
    .map((s) => s.replace(attrClause, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (kept.length === 0) return null;
  return kept.join(" ").trim();
}

export function dialogueTextForTts(text) {
  const inner = text.replace(/^[“"]|[”"]$/g, "").trim();
  const attrClause = new RegExp(
    `[,\\s]+(?:(?:the\\s+)?[\\w'-]+\\s+)*(?:${ATTR_VERBS})(?:\\s+(?:his|her|their|my|your|a|an|the)\\s+[\\w'-]+|\\s+[\\w'-]+){0,4}[.!?…,]*$`,
    "gi",
  );
  return inner.replace(attrClause, "").replace(/\s+/g, " ").trim() || inner;
}
