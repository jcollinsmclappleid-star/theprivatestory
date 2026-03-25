import { db } from "@workspace/db";
import { generatedStories } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

function cleanText(raw: string): string {
  let t = raw;
  t = t.replace(/```json[\s\S]*?```/gi, "");
  t = t.replace(/```[\s\S]*?```/gi, "");
  t = t.replace(/\{\s*"category"\s*:[\s\S]*?\n\}/m, "");
  t = t.replace(/\{\s*"stories"\s*:[\s\S]*?\n\}/m, "");
  t = t.replace(/\[HOOK\][\s\S]*?\[\/HOOK\]/gi, "");
  t = t.replace(/^[═]{2,}.*$/gm, "");
  t = t.replace(/^\s*\*{0,2}PART\s+[123]\s*[—–-][^\n]*\*{0,2}\s*$/gim, "");
  t = t.replace(/^\s*\*{0,2}(?:ESTABLISH|SIMMER|CRACK|IGNITE|RESONATE)\s*[:\-—]?\s*\*{0,2}\s*$/gim, "");
  t = t.replace(/^\s*\*{0,2}INTENSITY LEVEL\s+\d+\s*[—–\-][^\n]*\*{0,2}\s*$/gim, "");
  t = t.replace(/FORCED DNA FIELDS[\s\S]*?\n\}/gi, "");
  t = t.replace(/PRIOR STORY REGISTRY[\s\S]*?\n\}/gi, "");
  t = t.replace(/^\s*(?:WORLD-GROUNDING|VARIETY FORCING|ANTI-REPETITION|SEVEN MANDATORY|SCENE ENTRY|EROTIC ARCHITECTURE|IMMERSION RULES|SENSORY REQUIREMENTS|EXPLICIT CONTENT|BANNED WORDS|VOICE & DELIVERY)[^\n]*/gim, "");
  t = t.replace(/^\s*[A-Z][A-Z\s\-–—&\/]{8,}(?:[:—–])\s*$/gm, "");
  t = t.replace(/\*{1,2}STORY DNA\*{1,2}[^\n]*/gi, "");
  t = t.replace(/\*{1,2}\[?(?:FULL STORY|Story begins|Generating DNA)[^\n]*\*{1,2}[^\n]*/gi, "");
  t = t.replace(/\*{1,2}STORY TITLE[^\n]*\*{1,2}[^\n]*/gi, "");
  t = t.replace(/^\s*\*{1,2}[A-Z][^*\n]{0,60}\*{1,2}\s*:?\s*$/gm, "");
  t = t.replace(/^[^\n]*(?:Generating|Understood)[^\n]*(?:DNA|story)[^\n]*/gim, "");
  t = t.replace(/^[-=]{3,}\s*$/gm, "");
  t = t.replace(/\n{3,}/g, "\n\n").trim();
  return t;
}

async function main() {
  const rows = await db
    .select()
    .from(generatedStories)
    .where(eq(generatedStories.isLibraryStory, true));

  console.log(`Processing ${rows.length} library stories...\n`);

  let cleaned = 0;
  let unchanged = 0;

  for (const row of rows) {
    const scenes = Array.isArray(row.scenes)
      ? (row.scenes as Array<{ id: number; text: string }>)
      : JSON.parse(row.scenes as string);

    const originalText = scenes[0]?.text ?? "";
    const cleanedText = cleanText(originalText);

    if (cleanedText !== originalText) {
      await db
        .update(generatedStories)
        .set({ scenes: [{ id: 1, text: cleanedText }] })
        .where(eq(generatedStories.id, row.id));
      console.log(`✓ Cleaned: ${row.title} (${originalText.length} → ${cleanedText.length} chars)`);
      cleaned++;
    } else {
      unchanged++;
    }
  }

  console.log(`\nDone: ${cleaned} stories cleaned, ${unchanged} already clean`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
