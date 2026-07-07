import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY is not set. Add it to Secrets.");
}

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey,
  timeout: Number(process.env.OPENROUTER_TIMEOUT_MS ?? 45_000),
  maxRetries: 0,
  defaultHeaders: {
    "HTTP-Referer": "https://yourromanticstory.com",
    "X-Title": "The Private Story",
  },
});

export const MISTRAL_MODEL = "mistralai/mistral-large-2512";

/** All story generation uses Mistral — other providers block explicit adult content. */
export const MISTRAL_MODEL_WRITE = MISTRAL_MODEL;
export const MISTRAL_MODEL_CLASSIFY = MISTRAL_MODEL;
