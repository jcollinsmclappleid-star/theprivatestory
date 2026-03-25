import OpenAI from "openai";

const userApiKey = process.env.OPENAI_API_KEY;
const replitApiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const replitBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

if (!userApiKey && !replitApiKey) {
  throw new Error(
    "No OpenAI API key found. Set OPENAI_API_KEY in Secrets.",
  );
}

export const openai = userApiKey
  ? new OpenAI({
      apiKey: userApiKey,
    })
  : new OpenAI({
      apiKey: replitApiKey,
      baseURL: replitBaseUrl,
    });
