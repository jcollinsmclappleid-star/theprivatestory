import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM ?? "noreply@theprivatestory.com";

export const SAFETY_EMAIL = process.env.SAFETY_EMAIL ?? "safety@theprivatestory.com";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends an email if SMTP is configured; otherwise logs to console.
 * Never throws — failures are caught and logged.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.log(
      `[email] SMTP not configured — would have sent to ${payload.to}: ${payload.subject}\n${payload.text}`,
    );
    return false;
  }
  try {
    await t.sendMail({
      from: SMTP_FROM,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
    return true;
  } catch (err) {
    console.error(`[email] Failed to send to ${payload.to}:`, err);
    return false;
  }
}
