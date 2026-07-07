/** Shown to users when generation fails — never expose safety/moderation internals. */
export const USER_GENERATION_ERROR_MESSAGE =
  "Your story almost made it through in one breath — sometimes desire needs a second pass. Tap try again; your choices are still here, and you won't be charged twice.";

export function toUserFacingGenerationError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  if (msg.includes("429") || lower.includes("too many requests")) {
    return "We're caught up in the moment — a little busy right now. Wait a minute and try again. Your choices are saved.";
  }
  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    msg.includes("504") ||
    lower.includes("did not reach the required length") ||
    lower.includes("function_invocation_timeout")
  ) {
    return "Your story wanted a little more time than one sitting allows — sometimes the best ones unfold in two parts. Tap try again; everything you chose is still here, and you won't be charged twice.";
  }
  if (lower.includes("llm budget") || lower.includes("call limit")) {
    return "We ran out of room to finish this one in a single breath. Try again — your casting is saved, and you won't be charged twice.";
  }
  return USER_GENERATION_ERROR_MESSAGE;
}
