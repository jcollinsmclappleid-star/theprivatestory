import { sendEmail } from "./email.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

/**
 * Fire-and-forget email alert sent to the admin address whenever any admin
 * action is performed. If SMTP is unconfigured the sendEmail helper logs to
 * console instead. Errors are caught and logged — they never block the action.
 */
export function notifyAdmin(action: string, details: Record<string, unknown>): void {
  if (!ADMIN_EMAIL) return;

  const when = new Date().toISOString();
  const detailLines = Object.entries(details)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n");

  const text = `Admin action performed on My Private Story\n\nAction: ${action}\nTime: ${when}\n\n${detailLines}\n\nIf you did not perform this action, change your password and revoke all sessions immediately.`;

  sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Admin Alert] ${action} — My Private Story`,
    text,
  }).catch((err) => {
    console.error("[adminNotify] Failed to send alert email:", err);
  });
}
