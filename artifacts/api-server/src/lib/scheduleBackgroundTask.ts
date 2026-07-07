import { waitUntil } from "@vercel/functions";

/**
 * Keep async work alive on Vercel after the HTTP response is sent.
 * Static import — dynamic import() raced the runtime and dropped jobs mid-pipeline.
 */
export function scheduleBackgroundTask(task: Promise<unknown>): void {
  if (process.env.VERCEL) {
    waitUntil(task);
    return;
  }
  void task;
}
