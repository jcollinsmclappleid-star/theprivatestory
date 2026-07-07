import assert from "node:assert/strict";
import {
  parseWriterScriptField,
  validateWriterScript,
  writerScriptToTaggedRawText,
  mergeWriterScripts,
} from "../src/lib/expressAudioScript.js";

const sample = parseWriterScriptField([
  { role: "narrator", text: "Rain on the glass." },
  { role: "love_interest", text: '"Stay still," he murmurs.' },
  { role: "protagonist", text: '"I\'m not moving," you breathe.' },
]);
assert.ok(sample);
const v = validateWriterScript(sample, { phase: "DECLARE" });
assert.equal(v.ok, true, v.issues.join("; "));

const tagged = writerScriptToTaggedRawText(sample);
assert.match(tagged, /\[A\].*\[\/A\]/);
assert.match(tagged, /\[B\].*\[\/B\]/);

const bad = parseWriterScriptField([
  { role: "narrator", text: '"Fuck," she gasps.' },
  { role: "love_interest", text: '"Yes."' },
]);
assert.ok(bad);
const badV = validateWriterScript(bad!, { phase: "PERFORM" });
assert.equal(badV.ok, false);
assert.ok(badV.issues.some((i) => i.includes("narrator span")));

const merged = mergeWriterScripts([
  [{ role: "narrator", text: "Part A." }, { role: "love_interest", text: '"Hi."' }],
  [{ role: "protagonist", text: '"Hello."' }],
]);
assert.equal(merged.length, 3);

console.log("express-audio-script.test.mts — all assertions passed");
