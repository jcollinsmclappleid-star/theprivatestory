#!/usr/bin/env npx tsx
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { attributeSpeakers } from "../src/routes/generate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../public/test-stories/story-extreme-latest.json"), "utf8"),
  );
  const text = manifest.fullScenes.map((s: { text: string }) => s.text).join("\n\n");
  const QUOTE_RE = /[“"][^“"]*[”"]/g;
  const dialogues = [...text.matchAll(QUOTE_RE)].map((m) => m[0]);
  console.log(`Dialogue lines: ${dialogues.length}`);

  const llm = await attributeSpeakers(text, "Her & Him", undefined, "James");
  console.log("LLM attribution:", llm ? `ok segments=${llm.segments.length}` : "FAILED");
  if (llm) {
    for (const s of llm.segments.filter((x) => x.role !== "NARRATOR").slice(0, 20)) {
      console.log(`  [${s.role}] ${s.text.slice(0, 72)}…`);
    }
    for (let i = 11; i <= 17; i++) {
      console.log(`  raw[${i}]: ${dialogues[i]?.slice(0, 55)}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
