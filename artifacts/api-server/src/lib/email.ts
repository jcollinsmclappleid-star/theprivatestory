import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.SMTP_FROM ?? "noreply@theprivatestory.com";

export const SAFETY_EMAIL = process.env.SAFETY_EMAIL ?? "safety@theprivatestory.com";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (client) return client;
  if (!RESEND_API_KEY) return null;
  client = new Resend(RESEND_API_KEY);
  return client;
}

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends an email via Resend if RESEND_API_KEY is configured; otherwise logs to console.
 * Never throws — failures are caught and logged.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const resend = getClient();
  if (!resend) {
    console.log(
      `[email] RESEND_API_KEY not configured — would have sent to ${payload.to}: ${payload.subject}\n${payload.text}`,
    );
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [payload.to],
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
    if (error) {
      console.error(`[email] Resend error sending to ${payload.to}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[email] Failed to send to ${payload.to}:`, err);
    return false;
  }
}
