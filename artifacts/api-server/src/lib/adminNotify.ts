import { sendEmail } from "./email.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@theprivatestory.com";

const APP_URL = process.env.APP_URL ?? "https://theprivatestory.com";

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

// ---------------------------------------------------------------------------
// Moderation / Trust & Safety alerts — sent to support@theprivatestory.com
// ---------------------------------------------------------------------------

export interface StoryReportAlert {
  reportId: number;
  userId: string;
  storyId?: string | null;
  storyTitle?: string | null;
  reasonCategory: string;
  reason: string;
  note?: string | null;
  createdAt: Date;
}

export interface ModerationEventAlert {
  eventId: number;
  userId?: string | null;
  storyId?: string | null;
  eventType: string;
  severity: string;
  reason: string;
  actionTaken: string;
  createdAt: Date;
}

/**
 * Sends an email alert to the support inbox when a user submits a story report.
 * Always fires regardless of severity — all user reports warrant review.
 */
export function alertUserReport(report: StoryReportAlert): void {
  const adminLink = `${APP_URL}/admin`;
  const text = [
    `New story report submitted on My Private Story`,
    ``,
    `Report ID:    #${report.reportId}`,
    `User:         ${report.userId}`,
    `Story ID:     ${report.storyId ?? "N/A"}`,
    `Story Title:  ${report.storyTitle ?? "N/A"}`,
    `Category:     ${report.reasonCategory}`,
    `Reason:       ${report.reason}`,
    `User note:    ${report.note ?? "(none)"}`,
    `Submitted:    ${report.createdAt.toISOString()}`,
    ``,
    `Review here: ${adminLink}`,
  ].join("\n");

  sendEmail({
    to: SUPPORT_EMAIL,
    subject: `[Report] New story report — ${report.reasonCategory}`,
    text,
  }).catch((err) => {
    console.error("[adminNotify] Failed to send report alert:", err);
  });
}

/**
 * Sends an email alert to the support inbox when a high/critical severity
 * moderation event occurs (auto-blocks, severe policy violations, etc.).
 * Low and medium severity events are logged to DB only.
 */
export function alertModerationEvent(event: ModerationEventAlert): void {
  if (event.severity !== "high" && event.severity !== "critical") return;

  const adminLink = `${APP_URL}/admin`;
  const text = [
    `High-severity moderation event detected on My Private Story`,
    ``,
    `Event ID:     #${event.eventId}`,
    `Type:         ${event.eventType}`,
    `Severity:     ${event.severity.toUpperCase()}`,
    `User:         ${event.userId ?? "anonymous"}`,
    `Story ID:     ${event.storyId ?? "N/A"}`,
    `Reason:       ${event.reason}`,
    `Action Taken: ${event.actionTaken}`,
    `Timestamp:    ${event.createdAt.toISOString()}`,
    ``,
    `Review here: ${adminLink}`,
  ].join("\n");

  sendEmail({
    to: SUPPORT_EMAIL,
    subject: `[Moderation] ${event.severity.toUpperCase()} severity event — ${event.eventType}`,
    text,
  }).catch((err) => {
    console.error("[adminNotify] Failed to send moderation event alert:", err);
  });
}
