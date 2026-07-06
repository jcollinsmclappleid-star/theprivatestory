/**
 * Targeted IGNITE dialogue patch — one Mistral call instead of full story regen.
 */

import { openrouter, MISTRAL_MODEL } from "./openrouter.js";
import type { FantasySpine } from "./customerDesireBeats.js";
import { buildCustomerDesireWriteBlock } from "./customerDesireBeats.js";

type SceneRow = { id?: number; heading?: string; text?: string; duration_estimate?: number; emotional_shift?: string };

function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as T;
}

export async function patchIgniteSceneDialogue(
  parsed: Record<string, unknown>,
  opts: {
    scenePlan: Array<{ phase?: string; fantasy_enactment_spine?: string; customer_desire_beats?: string[] }>;
    fantasySpine?: FantasySpine;
    partnerName?: string;
    listenerName?: string;
    intensity?: string;
    minQuotedWords?: number;
  },
): Promise<Record<string, unknown>> {
  const scenes = [...((parsed.scenes ?? []) as SceneRow[])];
  const igniteIdx = opts.scenePlan.findIndex((s) => s.phase?.toUpperCase() === "IGNITE");
  const idx = igniteIdx >= 0 ? igniteIdx : Math.min(3, scenes.length - 1);
  const ignite = scenes[idx];
  if (!ignite?.text) return parsed;

  const partner = opts.partnerName ?? "James";
  const fantasyBlock = opts.fantasySpine ? buildCustomerDesireWriteBlock(opts.fantasySpine) : "";

  const systemPrompt = `You are an expert erotic audio screenplay editor. Return only JSON.
Expand dialogue in the IGNITE scene — partners speak; narrator bridges only.
Keep explicit ${opts.intensity ?? "Explicit"} tone. Preserve plot and customer fantasy enactments.`;

  const userPrompt = `Rewrite ONLY the IGNITE scene text below.
Requirements:
- At least ${opts.minQuotedWords ?? 180} words inside quotation marks (character speech)
- Dirty talk leads physical beats; speech before each escalation
- Partner "${partner}" performs customer fantasies in dialogue and action
- Do not shorten total scene below 380 words
${fantasyBlock ? `\n${fantasyBlock}` : ""}

Current IGNITE scene:
${ignite.text}

Return JSON: { "text": "full revised scene prose with heavy dialogue" }`;

  const completion = await openrouter.chat.completions.create({
    model: MISTRAL_MODEL,
    max_tokens: 2500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  try {
    const out = parseJson<{ text?: string }>(raw);
    if (out.text && out.text.length > ignite.text.length * 0.7) {
      scenes[idx] = { ...ignite, text: out.text };
      return { ...parsed, scenes };
    }
  } catch {
    /* keep original */
  }
  return parsed;
}
