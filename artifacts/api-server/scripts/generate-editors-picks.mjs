#!/usr/bin/env node

/**
 * Generate the 10 Editor's Picks short narrated samples for the central
 * /samples landing page. Each piece is a ~2-minute literary cliffhanger that
 * fades before any explicit content — see docs/compliance/editorial-standard.md
 * for the editorial test every script must pass.
 *
 * Output: public-static/voice-samples/editors-picks/{slug}.mp3
 *   These are committed to git and copied to public/ on each api-server build,
 *   then served as static files at /voice-samples/editors-picks/{slug}.mp3.
 *
 * Voice mix (target female 25-45 audience):
 *   Kayla x6 (American, expressive) - 01, 03, 04, 05, 06, 07, 08
 *   Theo  x3 (British, measured)    - 02, 09, 10  (his-POV narrator)
 * In-story male: James (primary CHAR_B), Ethan (secondary)
 * In-story female dialogue: Maya, Clara (when Kayla narrates)
 *
 * Usage:
 *   node scripts/generate-editors-picks.mjs              # skip existing
 *   node scripts/generate-editors-picks.mjs --force      # regenerate all
 *   node scripts/generate-editors-picks.mjs --dry-run    # print tagger output, no API calls
 *   node scripts/generate-editors-picks.mjs 01 04        # only those slugs
 *
 * After changing any pick text, sync the UI transcripts:
 *   node scripts/sync-transcripts.mjs
 * (PICKS is also exported so sync-transcripts.mjs can import it directly.)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { cleanNarratorSegmentsForTts, speakableDialogueLine } from "./lib/dialogueAttribution.mjs";
import { hybridTts } from "./lib/ttsHybrid.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "public-static",
  "voice-samples",
  "editors-picks",
);
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry-run");
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const IS_MAIN = process.argv[1] === fileURLToPath(import.meta.url);

if (IS_MAIN && !ELEVENLABS_API_KEY) {
  console.error("ERROR: ELEVENLABS_API_KEY environment variable not set");
  process.exit(1);
}

const VOICE = {
  clara: { id: "FA6HhUjVbervLw2rNl8M", name: "Clara", settings: { stability: 0.62, similarity_boost: 0.78, style: 0.12 } },
  kayla: { id: "aTxZrSrp47xsP6Ot4Kgd", name: "Kayla", settings: { stability: 0.48, similarity_boost: 0.80, style: 0.32 } },
  maya:  { id: "tQ4MEZFJOzsahSEEZtHK", name: "Maya",  settings: { stability: 0.45, similarity_boost: 0.82, style: 0.35 } },
  james: { id: "AeRdCCKzvd23BpJoofzx", name: "James", settings: { stability: 0.55, similarity_boost: 0.78, style: 0.18 } },
  theo:  { id: "jfIS2w2yJi0grJZPyEsk", name: "Theo",  settings: { stability: 0.52, similarity_boost: 0.78, style: 0.20 } },
};

// ── Multi-voice (#207): faithful mirror of the server pipeline in ──────────────
// src/routes/generate.ts (tagScriptForMultiVoice / resolveCharacterVoicesServer /
// generateAudioFile). Kept duplicated intentionally — the .mjs script cannot
// import the bundled server module. Keep in sync with that file.
const MV_CLARA = "FA6HhUjVbervLw2rNl8M";
const MV_MAYA  = "tQ4MEZFJOzsahSEEZtHK";
const MV_KAYLA = "aTxZrSrp47xsP6Ot4Kgd";
const MV_JAMES = "AeRdCCKzvd23BpJoofzx";
const MV_ETHAN = "n1PvBOwxb8X6m7tahp2h";
const MV_THEO  = "jfIS2w2yJi0grJZPyEsk";
const MV_HER_POOL = [MV_MAYA, MV_KAYLA, MV_CLARA];
const MV_HIM_POOL = [MV_JAMES, MV_THEO, MV_ETHAN];
const MV_MALE_NARRATORS = new Set([MV_JAMES, MV_ETHAN, MV_THEO]);

const pickHerDialogue = (narratorId) =>
  MV_HER_POOL.find((v) => v !== narratorId) ?? MV_MAYA;
const pickHimDialogue = (narratorId) =>
  MV_HIM_POOL.find((v) => v !== narratorId) ?? MV_JAMES;

function resolveCharacterVoicesServer(narratorId, pairing) {
  const p = (pairing ?? "").toLowerCase().trim();
  const isMale = MV_MALE_NARRATORS.has(narratorId);
  const twoHer = () => MV_HER_POOL.filter((v) => v !== narratorId);
  const twoHim = () => MV_HIM_POOL.filter((v) => v !== narratorId);
  switch (p) {
    case "her & him":
      return { charA: pickHerDialogue(narratorId), charB: pickHimDialogue(narratorId) };
    case "her & her": {
      const [a, b] = twoHer();
      return { charA: a ?? MV_MAYA, charB: b ?? MV_KAYLA };
    }
    case "him & him": {
      const [a, b] = twoHim();
      return { charA: a ?? MV_JAMES, charB: b ?? MV_THEO };
    }
    case "her & them":
      return { charA: pickHerDialogue(narratorId), charB: pickHimDialogue(narratorId) };
    case "him & them":
      return { charA: pickHimDialogue(narratorId), charB: pickHerDialogue(narratorId) };
    case "them & them":
      return isMale
        ? { charA: pickHimDialogue(narratorId), charB: pickHerDialogue(narratorId) }
        : { charA: pickHerDialogue(narratorId), charB: pickHimDialogue(narratorId) };
    default:
      return { charA: pickHerDialogue(narratorId), charB: pickHimDialogue(narratorId) };
  }
}

const CANONICAL_INTENSITY_STYLE = {
  Subtle: { narrator: 0.15, char: 0.35 },
  Warm: { narrator: 0.15, char: 0.35 },
  Elevated: { narrator: 0.25, char: 0.50 },
  Intense: { narrator: 0.35, char: 0.70 },
};
const INTENSITY_SYNONYMS = {
  Unrestrained: "Intense", Scorching: "Intense", Heated: "Elevated", Explicit: "Elevated",
  "Slow burn": "Subtle", Tender: "Subtle", Sensual: "Warm",
};
function canonicalizeIntensity(raw, fallback = "Elevated") {
  const t = (raw ?? "").trim();
  if (!t) return fallback;
  return INTENSITY_SYNONYMS[t] ?? (Object.hasOwn(CANONICAL_INTENSITY_STYLE, t) ? t : fallback);
}
function intensityStyleFor(raw) {
  return CANONICAL_INTENSITY_STYLE[canonicalizeIntensity(raw)] ?? { narrator: 0.25, char: 0.50 };
}
const MV_DEFAULT_STYLE = { narrator: 0.25, char: 0.50 };

// All Editor's Picks are female-protagonist / male love-interest romances.
const MV_DEFAULT_PAIRING = "Her & Him";
const MV_DEFAULT_INTENSITY = "Elevated";

const MV_ATTR_VERBS =
  "said|asked|replied|answered|whispered|murmured|breathed|muttered|growled|" +
  "demanded|told|added|sighed|gasped|moaned|hissed|laughed|warned|admitted|" +
  "confessed|urged|pleaded|teased|promised|repeated|continued|insisted|" +
  "called|shouted|snapped|purred|drawled|countered|offered|begged";

function mvPairingGenders(pairing) {
  const p = (pairing ?? "").toLowerCase().trim();
  switch (p) {
    case "her & him":       return { protag: "f", li: "m" };
    case "her & him & him": return { protag: "f", li: "m" };
    case "her & her & him": return { protag: "f", li: "m" };
    case "her & them":      return { protag: "f", li: "them" };
    case "him & them":      return { protag: "m", li: "them" };
    case "them & them":     return { protag: "them", li: "them" };
    default: return null;
  }
}

function splitTextToLimit(text, limit) {
  const t = text.trim();
  if (t.length <= limit) return t ? [t] : [];
  const out = [];
  const sentences = t.match(/[^.!?]+[.!?]+["']?\s*|[^.!?]+$/g) ?? [t];
  let cur = "";
  for (const s of sentences) {
    if (cur.length + s.length > limit) {
      if (cur.trim()) out.push(cur.trim());
      if (s.length > limit) { for (let i = 0; i < s.length; i += limit) out.push(s.slice(i, i + limit).trim()); cur = ""; }
      else cur = s;
    } else cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function tagScriptForMultiVoice(text, pairing) {
  const normalised = text
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'");
  const genders = mvPairingGenders(pairing);
  const attrRe = new RegExp(`\\b(${MV_ATTR_VERBS})\\b`, "i");
  const maleRe = /\b(he|him|his)\b/i;
  const femaleRe = /\b(she|her|hers)\b/i;
  const firstSecondRe = /\b(I|you|your|me|my)\b/i;
  const raw = [];
  let lastSpeaker = "CHAR_A";
  let explicitAttributions = 0;
  const attribute = (context) => {
    if (attrRe.test(context)) {
      if (firstSecondRe.test(context)) { lastSpeaker = "CHAR_A"; explicitAttributions++; return { role: "CHAR_A", explicit: true }; }
      if (genders) {
        const male = maleRe.test(context), female = femaleRe.test(context);
        if (male && !female) { const role = genders.li === "m" ? "CHAR_B" : "CHAR_A"; lastSpeaker = role; explicitAttributions++; return { role, explicit: true }; }
        if (female && !male) { const role = genders.li === "f" ? "CHAR_B" : "CHAR_A"; lastSpeaker = role; explicitAttributions++; return { role, explicit: true }; }
      }
    }
    lastSpeaker = lastSpeaker === "CHAR_A" ? "CHAR_B" : "CHAR_A";
    return { role: lastSpeaker, explicit: false };
  };
  const paragraphs = normalised.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const quoteRe = /"([^"]+)"/g;
  for (const para of paragraphs) {
    if (!para.includes('"')) { raw.push({ role: "NARRATOR", text: para }); continue; }
    const quotes = [];
    quoteRe.lastIndex = 0;
    let m;
    while ((m = quoteRe.exec(para)) !== null) quotes.push({ full: m[0], start: m.index, end: quoteRe.lastIndex });
    let lastIndex = 0;
    for (let qi = 0; qi < quotes.length; qi++) {
      const q = quotes[qi];
      const before = para.slice(lastIndex, q.start).trim();
      if (before) raw.push({ role: "NARRATOR", text: before });
      const localBefore = para.slice(lastIndex, q.start);
      const nextStart = qi + 1 < quotes.length ? quotes[qi + 1].start : para.length;
      const localAfter = para.slice(q.end, nextStart);
      const { role } = attribute(`${localBefore} ${localAfter}`.trim());
      raw.push({ role, text: q.full.trim() });
      lastIndex = q.end;
    }
    const after = para.slice(lastIndex).trim();
    if (after) raw.push({ role: "NARRATOR", text: after });
  }
  const merged = [];
  for (const seg of raw) {
    const prev = merged[merged.length - 1];
    if (prev && prev.role === seg.role) prev.text = `${prev.text} ${seg.text}`.trim();
    else merged.push({ ...seg });
  }
  const limited = [];
  for (const seg of merged) for (const piece of splitTextToLimit(seg.text, 4500)) limited.push({ role: seg.role, text: piece });
  const firstNarrator = limited.find((s) => s.role === "NARRATOR");
  if (firstNarrator) firstNarrator.isFirst = true;
  const distinctCharRoles = new Set(limited.filter((s) => s.role !== "NARRATOR").map((s) => s.role)).size;
  return { segments: limited, explicitAttributions, distinctCharRoles };
}

function trimSilenceFromMp3(input) {
  return new Promise((resolve) => {
    try {
      const filter =
        "silenceremove=start_periods=1:start_silence=0.08:start_threshold=-40dB:detection=peak," +
        "areverse," +
        "silenceremove=start_periods=1:start_silence=0.08:start_threshold=-40dB:detection=peak," +
        "areverse";
      const ff = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", "pipe:0", "-af", filter, "-f", "mp3", "pipe:1"]);
      const out = [];
      let settled = false;
      const done = (buf) => { if (!settled) { settled = true; resolve(buf); } };
      ff.stdout.on("data", (d) => out.push(d));
      ff.on("error", () => done(input));
      ff.stdin.on("error", () => {});
      ff.on("close", (code) => { if (code === 0 && out.length > 0) done(Buffer.concat(out)); else done(input); });
      ff.stdin.write(input);
      ff.stdin.end();
    } catch { resolve(input); }
  });
}

async function mvTTS(vid, chunk, style, role = "NARRATOR") {
  return hybridTts(vid, chunk, {
    role: role === "NARRATOR" ? "NARRATOR" : "CHAR",
    style,
    vocalEffects: true,
    apiKey: ELEVENLABS_API_KEY,
  });
}

const PICKS = [
  {
    slug: "01-last-one",
    title: "The Last One in the Building",
    voice: VOICE.kayla,
    text:
`"You're still here," he said.

She didn't look up. The quarterly close had finished an hour ago. She had stayed because she had heard him say that morning that he might come back to pick something up. She had told herself that wasn't why she'd stayed.

It was why she'd stayed.

He had stopped in her doorway. She could feel him there without looking.

"Just finishing," she said.

"You finished an hour ago. I checked the system."

She lifted her eyes from the screen.

He had loosened his tie at some point. The top button of his shirt was open. He held a coat over one arm, the way men do when they have not yet decided whether they are leaving or staying.

"So why are you still at your desk," he said.

"You know why."

She had said it before she could stop herself. She felt the heat rise in her throat, in her cheeks. She did not look away.

He set the coat down on the chair across from her.

He walked across the office to her desk. Slowly. Not a man rushing toward something — a man closing the distance he had been keeping for two years.

She stood up.

She took his hands — both of them — and placed them at her waist. Felt him go completely still. Felt the change in his breathing.

"Two years," she said.

Then she tilted her face up and kissed him.

The sound he made against her mouth was not patient. His hands gripped her waist and pulled her in and kissed her back with everything two years of not doing this had built — her fingers in his hair, the edge of the desk pressing into the backs of her thighs. She felt how much he wanted her and it sent heat through her in a wave she did not try to manage.

"I should have done this months ago," he said against her mouth.

"Longer than that."

He pulled back just far enough to look at her the way she had wanted him to look at her for two years. His hands found the zip at the back of her dress.

"Tell me to stop."

She reached back and found his hands. Guided them.

"Don't."`,
  },
  {
    slug: "02-adjoining-suites",
    title: "The Adjoining Suites",
    voice: VOICE.theo,
    pairing: "Her & Him & Him",
    charAVoice: MV_MAYA,
    charBVoice: MV_JAMES,
    text:
`Two men. One hotel suite. She had had every chance to leave — and walked through the connecting door instead.

"We've been talking about you," he said. "For months. Tell us what you've imagined."

"Both of you," she said. "In this room. Me between you — and you deciding who goes first."

"Be specific," he said.

"[sighs softly] One of you holding me still," she said. "The other watching until I say his name."

"Look at me," he said. "Are you sure?"

"[breathless] I've never been more sure of anything," she said.

He reached into the drawer beside the bed. Something cool clicked against the wood.

"Here," he said. "Take this. I've been waiting for an occasion to use it."`,
  },
  {
    slug: "03-spa-at-six",
    title: "The Spa at Six",
    voice: VOICE.kayla,
    pairing: "Her & Her",
    text:
`"You're tense," the woman said quietly.

She had been booking the same masseuse for a year — always the last appointment, always the same room, the candle that smelled of orange and something darker she could never name. Tonight she was on the table face-down. The room was warm. The hands on her shoulders were the ones she had been thinking about, increasingly often, in the week before each appointment.

"I know," she said.

"More than usual."

She didn't answer. The hands worked down her spine, slowly, professionally — the same hands that had touched her for an hour at a time, every two weeks, for a year. Tonight they felt different. Tonight she felt them.

"Yes," she said finally.

"You can turn over if you want."

She turned over. She was supposed to keep her eyes closed. She didn't. The woman was standing at the head of the table, hands resting on the towel, looking down at her with an expression she had never let her see before.

"You're looking at me," she said.

"You always book the last slot," the woman said.

"Yes."

"Why."

"You know why."

The candle moved its light along the ceiling. The hands lifted from the towel and rested, very lightly, against her collarbones — flat, warm, asking.

"Tell me to stop," the woman said.

"No."

"Tell me what you want."

She opened her mouth. Closed it. Opened it again. The towel was very thin. The room was very quiet. The hands had not moved a centimetre, but she could feel them everywhere.

"Lock the door," she said.

The woman did not move yet.

"Say it again."

"Lock the door."

The woman walked, slowly, around the table. She did not look away.

The lock turned.

She came back to the head of the table.

The woman on the table reached up.

She took the masseuse's hands — both of them — and pulled her down. The woman came without resistance, her breath catching, and when she was close enough the woman on the table took her face in both hands and kissed her first.

Not waiting. Not receiving. Deciding.

The masseuse's mouth opened under hers. A year of last appointments folding into one moment they had both been careful not to name.

"You should have said something," the masseuse said against her mouth.

"So should you."

A low sound between them. Then the woman's hands moving with the knowledge of a year of appointments turned toward something entirely else. Her mouth at her collarbone. Her throat. Moving lower.

She wrapped one hand in the woman's hair and told her exactly what she wanted next.`,
  },
  {
    slug: "04-driver",
    title: "The Driver",
    voice: VOICE.kayla,
    text:
`"Come up," she said.

He had driven her for three years. He opened the car door. He waited at events. He never spoke unless she spoke first, and she had never, not once, said his first name out loud. Tonight she had drunk too much champagne at a gallery opening, and he had carried her bag into the lobby of her building, and now they were at the lift, and she could not, suddenly, remember why she had ever bothered to be careful.

"Ma'am," he said.

"Don't."

"Sorry."

"I mean don't call me that. Not tonight," she said.

He looked at her properly for the first time in three years. He looked at her the way she had always known he wanted to look at her, the way he had been holding himself back from looking at her every Tuesday and Friday at the school run and every Saturday night at the restaurant.

"Come up," she said again. "Just to make sure I get in."

"You'll get in."

"Then come up to make sure I don't open the door for anyone else."

The lift arrived. He held it. She walked in. He hesitated for half a second on the threshold, and then, slowly, followed her.

In her hallway she set her bag down. She took off one earring. She put it on the small table by the door. She turned to him.

"Marcus," she said.

His name. The first time.

He closed his eyes for a second. When he opened them, he was a different man — not her driver any more, not exactly anything any more.

"Say it again," he said.

"Marcus."

He was already crossing the hallway when she reached for the second earring.

He stopped a step short of her.

She turned to face him. She did not step back. She looked at him the way she had been looking at him, she understood now, for three years — and then she stepped forward, closed the last of the distance herself, and put both her hands against his chest.

He went still.

"Tell me what you've been thinking about," she said. "All of it."

He told her. Against her ear, his voice different from anything she had ever heard from him — not her driver's voice at all. Specific. Low. She felt heat move through her from her chest down.

"Show me," she said.

He kissed her. Not tentative — three years of not doing this in a single motion — and when he pressed her back against the wall of her own hallway she made a sound she hadn't planned to make.

His hands moved into her hair. She grabbed the front of his shirt. His lips at her jaw. Her throat.

"Show me," she said again.

He found the zip at the side of her dress — certain, unhurried, the hands of a man who had been told yes — and she felt the cool air and then the warmth of his palms and stopped thinking about anything except this.`,
  },
  {
    slug: "05-cabin",
    title: "The Cabin",
    voice: VOICE.kayla,
    pairing: "Her & Him & Him",
    text:
`"Right," he said finally. "The bedroom is yours. We'll work it out down here."

The snow had started at four. By eight it was clear no one was driving anywhere — the cabin had one bedroom, a sofa long enough for one man, and three of them. Her. And the two men she had known since university, the two men who had, separately, in the years since, both told her things they shouldn't have told her.

They had been drinking the wine the cabin owner had left. The fire was high. She was warm in a way that had nothing to do with the fire.

"Will you," she said.

It came out lower than she had meant it to. Both of them looked at her at the same time.

The other one — the quieter one, the one who had once told her, drunk at a wedding, that he had loved her since they were twenty-two — set his glass down on the table.

"Don't," he said.

"Don't what."

"Don't say a thing you can't take back."

She stood up. She took off the cardigan she had been wearing over her dress. She folded it, slowly, and put it on the arm of the chair. Both of them watched her.

"I've been thinking about this," she said, "for ten years."

"Both of us?"

"Both of you."

The fire cracked. The first one — the louder one — stood up too. The quieter one didn't, yet.

"This isn't a joke," he said.

"No."

"You'd have to mean it."

"I mean it."

She walked into the middle of the room. She turned so she could see them both.

Neither of them moved.

She looked at the louder one. Then at the quieter one.

"Tell me," she said. "Both of you. What you want to do tonight. Out loud."

A silence.

The louder one told her first — directly, specifically, without apology. Her breath shortened.

The quieter one told her differently — slower, more considered, and somehow more complete. She felt heat move through her before he had finished the sentence.

She held out a hand to each of them.

Both took it.

The louder one pulled her toward him and kissed her — certain, one hand at the back of her head. Behind her the quieter one stepped close, his chest warm against her back, his hands at her waist, holding himself to just that while he waited.

She was between them. The reality of it made her dizzy.

"Ten years," she said, when the first one pulled back.

"Don't think," said the quieter one at her ear. His hands beginning to move. "Just—"

She turned and kissed him instead. He kissed her exactly as he had described. Behind her, the first one's hands slid lower.

"Both of you," she said. "Tonight. All of it."

They didn't answer. They didn't need to.`,
  },
  {
    slug: "06-supervisor",
    title: "The Supervisor's Office",
    voice: VOICE.kayla,
    pairing: "Her & Her",
    charAVoice: MV_MAYA,
    charBVoice: MV_CLARA,
    text:
`The report was still open. Neither of them was reading it. Three years of supervision — and tonight, for the first time, the rule did not apply.

"You're not looking at the page," she said.

"No," her supervisor said. "I'm looking at you. And I'm done pretending I haven't wanted to for three years."

"You can't say that," she said. "You're still my—"

"I'm not your supervisor anymore," her supervisor said. "You passed. You're a doctor now. So tell me — what have you been writing about me in those footnotes?"

"[sighs softly] Wanting your hands on me," she said. "Wanting you to tell me what to do."

"Be still," her supervisor said.

"[whispers] ...yes," she said.

"Lock the door," her supervisor said. "Then we'll find out if you mean it."`,
  },
  {
    slug: "07-bodyguard",
    title: "The Bodyguard",
    voice: VOICE.kayla,
    text:
`"You can stand somewhere else," she said.

He stood exactly as he stood in every other room — three metres from her, watching the door, hands clasped in front of him. He had been hired six weeks ago. He had, in six weeks, said perhaps forty words to her in total. Tonight she had asked him to come into the suite instead of standing in the corridor. She had said it was a security check. The suite was lit by one lamp. They both knew it wasn't.

"This is where I stand," he said.

"Not tonight."

He looked at her. The professional blankness he had worn for six weeks was still there, but underneath it tonight she could see the thing she had been looking for, all six weeks, in glimpses.

"I have a question," she said.

"Ma'am."

"If I told you to do something. Something that wasn't your job."

"That would depend."

"On what."

"On what it was."

She walked across the room and stopped in front of him. She had never been this close to him. He smelled of nothing — clean, neutral, deliberate.

"If I told you," she said quietly, "to put your hands on my hips."

He didn't breathe.

"Would you," she said.

A pause. A small, rough pause.

"Yes."

"And if I told you not to move."

"Yes."

"And if I told you what to do next."

His jaw worked.

"Yes."

She told him to.

His hands found her hips — large, careful, the restrained precision of a man trained to stand in corners. His palms were warm through the fabric of her dress and her breath went shallow.

"Don't move," she said.

"No."

"Now tell me what you want to do."

A pause. Then he told her. Quietly. Specifically. She felt heat move through her from her chest down.

"And if I said yes to that?" she said.

"Then I'd do exactly what I said."

She reached up and took his face in her hands. Felt his whole body tighten under the restraint she had asked for.

"Yes," she said.

The six weeks of standing in corners broke. He pulled her flush against him and when he kissed her it was exactly what he had described — she felt it from her sternum down. She let it happen and then she stepped back one inch.

He stopped immediately. Hands still on her.

"Again," she said. "But slower."

A pause. A look that bore no resemblance to anything professional.

Then he kissed her again — slowly, precisely, nothing held back and nothing rushed — with the absolute deliberateness of a man who had been given an instruction and intended to follow it to the letter.

She had six weeks of corners to work through. She intended to take her time.`,
  },
  {
    slug: "08-proposition",
    title: "The Proposition",
    voice: VOICE.kayla,
    pairing: "Her & Him",
    charAVoice: MV_MAYA,
    text:
`The members' club had no sign on the door. He had been watching her for an hour. A drink arrived she did not order — and a message: he asked if he could come over.

She looked at the corner table. Then she nodded.

"I'm going to be direct," he said, standing beside her stool. "I have a room upstairs. I won't touch you in the lift. I won't touch you in the corridor. If you change your mind, you walk away — I won't follow."

"And if I don't?" she said.

"Then you'll tell me exactly what you want," he said, "and I'll decide whether I'm willing to give it to you."

"You want me to ask," she said.

"I want you to say it out loud," he said. "What you want a stranger to do to you tonight."

"[breathless] Then stop talking," she said. "And let me say it."`,
  },
  {
    slug: "09-neighbour",
    title: "The Neighbour",
    voice: VOICE.theo,
    pairing: "Her & Him",
    charAVoice: MV_MAYA,
    charBVoice: MV_JAMES,
    text:
`Three weeks. Every night — footsteps above her. Barefoot. Restless. Tonight she knocked on his door with an empty wine glass and no shoes.

"I've been listening to you," she said. "The shower. The late nights. I know your rhythm better than I should."

"That's a strange thing to admit to your neighbour," he said.

"[sighs softly] I didn't come for the corkscrew," she said. "I came because I wanted to know if you've been listening too."

"Every night," he said. "Every sound you make upstairs."

"Good," she said. "Then tell me what you've been imagining when you hear me."

"You," he said. "In my kitchen. Not leaving until I—"

"[breathless] Until you what?" she said. "Say it."

"[groans softly] Until you let me do everything I've been thinking about for three weeks," he said.`,
  },
  {
    slug: "10-night-manager",
    title: "The Night Manager",
    voice: VOICE.theo,
    // Male narrator IS the protagonist — route his dialogue back to Theo so the listener
    // hears one consistent male voice rather than Theo (narration) / James (he said).
    charBVoice: MV_THEO,
    text:
`"I think I locked my key in the room," she said.

He was the night manager. Nine years. He noticed everything — who came in, who left, who had drunk too much, who needed help, who needed to be left alone.

She had checked in three days ago. Suite four-twelve. She had been to a different event every night, and come back at a different hour each time. Tonight she came back at midnight, alone, in a midnight-blue dress that was — he could tell, because he noticed everything — too good for the event she had been to. She had been crying, or about to cry, he wasn't sure which.

"I'll walk you up," he said.

"You don't have to," she said.

"It's policy," he said.

It wasn't policy. He took the master, and they walked to the lift in a silence that he found, by the third floor, that he did not want to break.

At her door he produced the key. He opened it. He stepped back.

She did not go in.

She turned around in the doorway. She looked at him for a long second. He had seen this look before, in nine years of nights — the look of a woman who was about to ask for something a stranger could give her that no one she knew could.

"Don't go yet," she said.

"Madam," he said.

"Please," she said.

"You've been drinking," he said.

"Two glasses. Three hours ago," she said.

He looked at her. He looked, for the first time in nine years, properly at a guest. She let him.

"I'll come in for a moment," he said. "Until you're inside."

She stepped back into her room.

She left the door open behind her.

He came in. He let the door stay open. He told himself it was policy. He followed her into the room.

She turned when he was close. He touched her face — nine years of professional distance ending in one movement, his thumb along her jaw, tilting her face up. Her eyes closed.

"I don't do this," he said.

"I know," she said.

"You should know that," he said.

She opened her eyes. "I don't care," she said.

He kissed her.

Nine years dissolved. Her hands gripped his lapels and she kissed him back — not desperate, deliberate — like a woman who knew exactly what she was choosing.

When he walked her backwards she stopped him two steps from the bed and turned. She crossed to the door — still open, from when he had followed her in — and closed it herself.

She turned the latch.

She turned around.

"Look at me," he said.

"Now," she said.

He came to her.`,
  },
];

async function generateOne(pick) {
  const outputPath = path.join(OUTPUT_DIR, `${pick.slug}.mp3`);
  if (!FORCE && !DRY_RUN && fs.existsSync(outputPath)) {
    console.log(`  - skip ${pick.slug} (${pick.voice.name}) — already exists`);
    return;
  }

  const narratorId = pick.voice.id;
  const pairing = pick.pairing ?? MV_DEFAULT_PAIRING;
  const intensity = pick.intensity ?? MV_DEFAULT_INTENSITY;
  const styleFor = intensityStyleFor(intensity);

  const tagged = tagScriptForMultiVoice(pick.text, pairing);
  // Same-gender pairings (Her & Her, Him & Him) produce 0 explicit attributions because
  // gender-pronoun disambiguation can't distinguish speakers — toggle does the work.
  // Allow multi-voice when enough character segments were detected via toggle alone.
  const enoughToggleChars = tagged.segments.filter((s) => s.role !== "NARRATOR").length >= 4;
  const useMultiVoice = tagged.distinctCharRoles >= 2 && (tagged.explicitAttributions >= 1 || enoughToggleChars);
  const segments = useMultiVoice ? cleanNarratorSegmentsForTts(tagged.segments) : tagged.segments;

  const buffers = [];
  if (useMultiVoice) {
    const { charA: charAResolved, charB: charBResolved } = resolveCharacterVoicesServer(narratorId, pairing);
    // charAVoice / charBVoice overrides pin specific cast members (e.g. Maya as lead female).
    const charA = pick.charAVoice ?? charAResolved;
    // charBVoice override: when the narrator IS the male protagonist (e.g. pick 10),
    // route CHAR_B dialogue back to the narrator voice so the listener hears one consistent
    // male voice rather than a jarring switch between Theo (narration) and James (dialogue).
    const charB = pick.charBVoice ?? charBResolved;
    const VNAMES = { [MV_CLARA]:"Clara",[MV_MAYA]:"Maya",[MV_KAYLA]:"Kayla",[MV_JAMES]:"James",[MV_ETHAN]:"Ethan",[MV_THEO]:"Theo" };
    console.log(`  - gen  ${pick.slug} MULTI-VOICE narrator=${pick.voice.name} segments=${segments.length} attr=${tagged.explicitAttributions} "${pick.title}"`);
    if (DRY_RUN) {
      console.log(`  pairing="${pairing}" charA=${VNAMES[charA]||charA.slice(0,8)} charB=${VNAMES[charB]||charB.slice(0,8)}`);
      for (const seg of segments) {
        const vid = seg.role === "NARRATOR" ? narratorId : seg.role === "CHAR_A" ? charA : charB;
        const vname = VNAMES[vid] ?? vid.slice(0,8);
        const spoken = seg.role === "NARRATOR" ? seg.text : speakableDialogueLine(seg.text);
        const preview = (spoken || `(dropped) ${seg.text}`).replace(/\n/g," ").slice(0,72);
        console.log(`  [${seg.role.padEnd(8)}] ${vname.padEnd(6)} | ${preview}`);
      }
      return;
    }
    for (const seg of segments) {
      const vid = seg.role === "NARRATOR" ? narratorId : seg.role === "CHAR_A" ? charA : charB;
      const baseStyle = seg.role === "NARRATOR" ? styleFor.narrator : styleFor.char;
      // Opening hook: first NARRATOR segment runs hotter, capped at 0.80.
      const style = seg.isFirst ? Math.min(0.80, baseStyle + 0.15) : baseStyle;
      const spoken = seg.role === "NARRATOR" ? seg.text : speakableDialogueLine(seg.text);
      if (!spoken) continue;
      const buf = await mvTTS(vid, spoken, style, seg.role);
      buffers.push(await trimSilenceFromMp3(buf));
    }
  } else {
    console.log(`  - gen  ${pick.slug} single-voice (${pick.voice.name}) — no multi-voice evidence "${pick.title}"`);
    if (DRY_RUN) { console.log(`  [single-voice — no character roles detected]`); return; }
    const pieces = splitTextToLimit(pick.text, 4500);
    for (let i = 0; i < pieces.length; i++) {
      const style = i === 0 ? Math.min(0.80, styleFor.narrator + 0.15) : styleFor.narrator;
      buffers.push(await mvTTS(narratorId, pieces[i], style));
    }
  }

  const finalBuffer = Buffer.concat(buffers);
  if (finalBuffer.length === 0) {
    throw new Error(`Audio generation produced no output for ${pick.slug}`);
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(outputPath, finalBuffer);
  console.log(`    -> ${outputPath} (${(finalBuffer.length / 1024).toFixed(0)} KB) ${useMultiVoice ? "[multi-voice]" : "[single]"}`);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const filtered = ONLY.length
    ? PICKS.filter((p) => ONLY.some((o) => p.slug.startsWith(o)))
    : PICKS;
  console.log(`Generating ${filtered.length} editor's pick(s)...`);
  for (const pick of filtered) {
    await generateOne(pick);
  }
  console.log("Done.");
}

export { PICKS };

if (IS_MAIN) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
