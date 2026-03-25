import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY is not set. Add it to Secrets.");
}

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey,
  defaultHeaders: {
    "HTTP-Referer": "https://yourromanticstory.com",
    "X-Title": "Your Romantic Story",
  },
});

export const MISTRAL_MODEL = "mistralai/mistral-large-2512";
