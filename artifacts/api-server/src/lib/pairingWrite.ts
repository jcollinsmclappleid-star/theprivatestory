/**
 * Pairing-aware write/TTS helpers — shared by Express and constraint repair.
 */

import { derivePronounsFromPairing, type PairingPronouns } from "./masterEroticLayer.js";

export type { PairingPronouns };
export { derivePronounsFromPairing };

export const MALE_PARTNER_NAMES = [
  "James", "Marco", "Luca", "Alessandro", "Ethan", "Rafael", "Kai", "Dominic",
  "Noah", "Sebastian", "Leo", "Matteo", "Christian", "Xavier", "Adrian",
  "Dante", "Roman", "Hunter", "Blake", "Cain",
];

export const FEMALE_PARTNER_NAMES = [
  "Sophia", "Isabella", "Elena", "Valentina", "Camille", "Vivienne", "Aurora",
  "Scarlett", "Juliette", "Celeste", "Serena", "Aria", "Estelle", "Lila",
  "Margot", "Nina", "Cleo", "Zara", "Iris", "Bianca",
];

export function autoPickPartnerName(pairing: string | undefined, listenerName?: string): string {
  const p = (pairing ?? "Her & Him").toLowerCase();
  let pool: string[];
  if (p.startsWith("her & her")) pool = FEMALE_PARTNER_NAMES;
  else if (p.startsWith("him & him")) pool = MALE_PARTNER_NAMES;
  else if (p.startsWith("her & him")) pool = MALE_PARTNER_NAMES;
  else pool = [...MALE_PARTNER_NAMES, ...FEMALE_PARTNER_NAMES];

  const ln = listenerName?.trim().toLowerCase();
  const candidates = ln ? pool.filter((n) => n.toLowerCase() !== ln) : pool;
  const list = candidates.length > 0 ? candidates : pool;
  return list[Math.floor(Math.random() * list.length)]!;
}

export function pairingGuideLine(pairing?: string): string {
  const p = pairing ?? "Her & Him";
  const map: Record<string, string> = {
    "Her & Him":
      "Protagonist (listener/you): she/her. Partner: he/him. Heterosexual woman-with-man anatomy when explicit.",
    "Her & Her":
      "Protagonist (listener/you): she/her. Partner: she/her. BOTH characters are women — woman-on-woman only. NEVER he/him/his, cock, penis, erection, or 'good boy'. Praise: 'good girl' if used.",
    "Him & Him":
      "Protagonist (listener/you): he/him. Partner: he/him. BOTH characters are men — man-on-man only. NEVER she/her for either character or 'good girl'. Praise: 'good boy' if used.",
    "Her & Them":
      "Protagonist: she/her. Partner: they/them — attribute partner dialogue by name every time.",
    "Him & Them":
      "Protagonist: he/him. Partner: they/them — attribute partner dialogue by name every time.",
    "Them & Them":
      "Protagonist: they/them. Partner: they/them — attribute every speaker by name.",
  };
  return map[p] ?? map["Her & Him"]!;
}

export function isFemaleFemalePairing(pairing?: string): boolean {
  return (pairing ?? "").toLowerCase().trim() === "her & her";
}

export function isMaleMalePairing(pairing?: string): boolean {
  return (pairing ?? "").toLowerCase().trim() === "him & him";
}

/** Praise phrase the partner may use for the listener during a praise chip. */
export function praisePhraseForPairing(pairing?: string): string {
  const sub = derivePronounsFromPairing(pairing).protSub.toLowerCase();
  if (sub === "he") return "Good boy";
  if (sub === "they") return "Good";
  return "Good girl";
}

type PCtxFull = {
  sub: string;
  subL: string;
  objCap: string;
  obj: string;
  possCap: string;
  poss: string;
  refl: string;
  contr: string;
  contrL: string;
  dep: string;
  depL: string;
};

function getPCtxFull(pronouns: string): PCtxFull {
  switch (pronouns) {
    case "he/him":
      return {
        sub: "He",
        subL: "he",
        objCap: "Him",
        obj: "him",
        possCap: "His",
        poss: "his",
        refl: "himself",
        contr: "He's",
        contrL: "he's",
        dep: "He'd",
        depL: "he'd",
      };
    case "they/them":
      return {
        sub: "They",
        subL: "they",
        objCap: "Them",
        obj: "them",
        possCap: "Their",
        poss: "their",
        refl: "themselves",
        contr: "They're",
        contrL: "they're",
        dep: "They'd",
        depL: "they'd",
      };
    default:
      return {
        sub: "She",
        subL: "she",
        objCap: "Her",
        obj: "her",
        possCap: "Her",
        poss: "her",
        refl: "herself",
        contr: "She's",
        contrL: "she's",
        dep: "She'd",
        depL: "she'd",
      };
  }
}

function pronounSetFromSub(sub: string): string {
  const s = sub.toLowerCase();
  if (s === "he") return "he/him";
  if (s === "they") return "they/them";
  return "she/her";
}

/** Adapt text written for default She(prot)+He(partner) to the target pairing. */
export function adaptTextForPairing(text: string, pairing?: string): string {
  const p = derivePronounsFromPairing(pairing);
  const protagonistPronouns = pronounSetFromSub(p.protSub);
  const partnerPronouns = pronounSetFromSub(p.partnSub);
  if (protagonistPronouns === "she/her" && partnerPronouns === "he/him") return text;

  const P = getPCtxFull(protagonistPronouns);
  const A = getPCtxFull(partnerPronouns);

  let t = text
    .replace(/\bHe's\b/g, "%%AC%%")
    .replace(/\bhe's\b/g, "%%ac%%")
    .replace(/\bHe'd\b/g, "%%AD%%")
    .replace(/\bhe'd\b/g, "%%ad%%")
    .replace(/\bHe\b/g, "%%AS%%")
    .replace(/\bhe\b/g, "%%as%%")
    .replace(/\bhimself\b/g, "%%AR%%")
    .replace(/\bHim\b/g, "%%AO%%")
    .replace(/\bhim\b/g, "%%ao%%")
    .replace(/\bHis\b/g, "%%AP%%")
    .replace(/\bhis\b/g, "%%ap%%");

  t = t
    .replace(/\bShe's\b/g, P.contr)
    .replace(/\bshe's\b/g, P.contrL)
    .replace(/\bShe'd\b/g, P.dep)
    .replace(/\bshe'd\b/g, P.depL)
    .replace(/\bShe\b/g, P.sub)
    .replace(/\bshe\b/g, P.subL)
    .replace(/\bherself\b/g, P.refl)
    .replace(/\bHer(?= \w)/g, P.possCap)
    .replace(/\bher(?= \w)/g, P.poss)
    .replace(/\bHer\b/g, P.objCap)
    .replace(/\bher\b/g, P.obj);

  t = t
    .replace(/%%AC%%/g, A.contr)
    .replace(/%%ac%%/g, A.contrL)
    .replace(/%%AD%%/g, A.dep)
    .replace(/%%ad%%/g, A.depL)
    .replace(/%%AS%%/g, A.sub)
    .replace(/%%as%%/g, A.subL)
    .replace(/%%AR%%/g, A.refl)
    .replace(/%%AO%%/g, A.objCap)
    .replace(/%%ao%%/g, A.obj)
    .replace(/%%AP%%/g, A.possCap)
    .replace(/%%ap%%/g, A.poss);

  return t;
}

export function perspectiveFromPairing(pairing?: string): "her" | "his" | "your" | "their" {
  const sub = derivePronounsFromPairing(pairing).protSub.toLowerCase();
  if (sub === "he") return "his";
  if (sub === "they") return "their";
  return "her";
}

export function defaultDynamicForPairing(pairing?: string): string {
  const p = (pairing ?? "Her & Him").toLowerCase();
  if (p.startsWith("her & her")) return "She Takes Charge";
  return "He Takes Charge";
}

export function positionChangeExamples(pairing?: string, partnerName?: string): string[] {
  const partnSubL = derivePronounsFromPairing(pairing).partnSub.toLowerCase();
  const name = partnerName?.trim();
  if (partnSubL === "they") {
    const who = name ? `${name}` : "they";
    return [`"—Turn over," ${who} said low.`, `"—Stay still," ${who} breathed.`];
  }
  return [`"—Turn over," ${partnSubL} said low.`, `"—Stay still," ${partnSubL} breathed.`];
}

const SPEECH_VERBS =
  "commands?|commanded|growls?|growled|murmurs?|murmured|says?|said|whispers?|whispered|demands?|demanded|tells?|told|asks?|asked|praises?|praised|teases?|teased|warns?|warned|breathes?|breathed|repeats?|repeated|continues?|continued|adds?|added|insists?|insisted";
const PROTAG_SPEECH_VERBS =
  "admit|admitted|whisper|whispered|breathe|breathed|gasp|gasped|beg|begged|murmur|murmured|say|said|reply|replied|answer|answered|confess|confessed|plead|pleaded|moan|moaned|cry|cried|scream|screamed|sob|sobbed|whimper|whimpered";

/** True when dialogue addresses `name` as the listener (vocative), not as self-reference. */
export function isAddressingCharacterName(line: string, name?: string): boolean {
  if (!name?.trim()) return false;
  const n = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `(?:^${n}[,!?.\\s—-]|[,—-]\\s*${n}\\b|\\b${n}\\s*[,!?]|\\byou(?:'re| are)\\b[^.]{0,120}\\b${n}\\b|\\bcome for me[,]?\\s*${n}\\b)`,
    "i",
  ).test(line);
}

/** When a line names the listener, the partner is speaking — and vice versa. */
export function inferSpeakerFromVocative(
  line: string,
  listenerName?: string,
  partnerName?: string,
): "CHAR_A" | "CHAR_B" | null {
  if (isAddressingCharacterName(line, listenerName)) return "CHAR_B";
  if (isAddressingCharacterName(line, partnerName)) return "CHAR_A";
  return null;
}

/** Partner commanding the listener — e.g. "You're going to come for me, Rochelle". */
export function isPartnerCommandToListener(line: string): boolean {
  return /^you(?:'re| are)\b/i.test(line) && /\b(come for me|going to come)\b/i.test(line);
}

export function buildSpeechCuePatterns(pairing: string, partnerName?: string, protagonistName?: string): {
  liSpeechAfter: RegExp;
  protagSpeechAfter: RegExp;
} {
  const p = derivePronounsFromPairing(pairing);
  const liTokens: string[] = [];
  const protagTokens = ["you"];

  const partnSubL = p.partnSub.toLowerCase();
  const protSubL = p.protSub.toLowerCase();

  if (partnSubL === "he") liTokens.push("he", "him", "his");
  else if (partnSubL === "she") liTokens.push("she", "her", "hers");
  else liTokens.push("they", "them", "their");

  if (protSubL === "she") protagTokens.push("she", "her");
  else if (protSubL === "he") protagTokens.push("he", "him", "his");
  else protagTokens.push("they", "them", "their");

  if (partnerName?.trim()) liTokens.push(partnerName.trim().toLowerCase());
  if (protagonistName?.trim()) protagTokens.push(protagonistName.trim().toLowerCase());

  return {
    liSpeechAfter: new RegExp(`\\b(${liTokens.join("|")})\\s+(${SPEECH_VERBS})\\b`, "i"),
    protagSpeechAfter: new RegExp(`\\b(${protagTokens.join("|")})\\s+(${PROTAG_SPEECH_VERBS})\\b`, "i"),
  };
}

export function performSexActsLine(pairing: string | undefined, level: number): string {
  if (level < 4) return "";
  if (isFemaleFemalePairing(pairing)) {
    return "- Intensity (Her & Her): oral between women, fingers/toy/grinding with anatomical specificity — NO male anatomy (no cock/penis/erection). Position changes introduced by speech.";
  }
  if (isMaleMalePairing(pairing)) {
    return "- Intensity (Him & Him): oral and penetrative anal sex with anatomical specificity — both men, no female anatomy. Position changes introduced by speech.";
  }
  return "- Intensity: oral sex AND penetrative intercourse with anatomical specificity; position changes introduced by speech.";
}

export function performPartGoalSuffix(pairing: string | undefined, part: "A" | "B"): string {
  if (isFemaleFemalePairing(pairing)) {
    return part === "A"
      ? "PART A: first physical cross (kiss/touch) → enact customer chips begin (oral foreplay between women). Stop before deepest penetration."
      : "PART B: continue — fingers/toy/grinding/tribbing → praise during act → climax. Both women throughout.";
  }
  if (isMaleMalePairing(pairing)) {
    return part === "A"
      ? "PART A: first physical cross → enact customer chips begin (oral foreplay). Stop before full penetration."
      : "PART B: continue — penetration → praise during act → climax. Both men throughout.";
  }
  return part === "A"
    ? "PART A: first physical cross (kiss/grope) → blindfold on → enact customer chips begin (oral foreplay). Stop before penetration."
    : "PART B: continue uninterrupted — penetration → praise during act → climax. Blindfold stays until climax. Match continuity from Part A.";
}

export type PairingRepairContext = Pick<
  PairingPronouns,
  "partnSub" | "partnObj" | "partnPoss"
> & { praisePhrase: string };

export function pairingRepairContext(pairing?: string): PairingRepairContext {
  const { partnSub, partnObj, partnPoss } = derivePronounsFromPairing(pairing);
  return { partnSub, partnObj, partnPoss, praisePhrase: praisePhraseForPairing(pairing) };
}

export function protPronounsFromPairing(pairing?: string): {
  sub: string;
  obj: string;
  poss: string;
  refl: string;
} {
  const p = derivePronounsFromPairing(pairing);
  return { sub: p.protSub, obj: p.protObj, poss: p.protPoss, refl: p.protRefl };
}
