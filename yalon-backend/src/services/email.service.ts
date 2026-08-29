import { BrevoClient } from '@getbrevo/brevo';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface SendNotificationParams {
  subject: string;
  html: string;
  replyTo: string;
}

// Brevo client — configured once at module load, reused across requests.
const brevo = new BrevoClient({ apiKey: env.BREVO_API_KEY });

// Logo is loaded lazily on first use rather than at module load time.
// A missing logo file should not crash the server — it just means emails
// go out without the inline image, which is acceptable.
let _logoBase64: string | null = null;

function getLogoBase64(): string | null {
  if (_logoBase64 !== null) return _logoBase64;
  try {
    const logoPath = path.join(process.cwd(), 'assets', 'yalon-logo-email.png');
    _logoBase64 = fs.readFileSync(logoPath).toString('base64');
  } catch (err) {
    logger.warn({ err }, 'Logo file not found — emails will be sent without the inline logo');
    _logoBase64 = ''; // cache the miss so we don't retry on every email
  }
  return _logoBase64 || null;
}

export async function sendNotificationEmail({ subject, html, replyTo }: SendNotificationParams): Promise<void> {
  try {
    const logoBase64 = getLogoBase64();

    await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: 'Yalon Professional Staffing Solutions', email: env.SENDER_EMAIL },
      to: [{ email: env.RECEIVER_EMAIL }],
      replyTo: { email: replyTo },
      subject,
      htmlContent: html,
      ...(logoBase64
        ? {
            attachment: [
              {
                content: logoBase64,
                name: 'yalonlogo.png',
              },
            ],
          }
        : {}),
    });
  } catch (err) {
    // Email failure should NOT fail the whole request — the submission is
    // already safely stored in Supabase. We log it so it can be
    // investigated/resent, but the user still gets a success response.
    logger.error({ err }, 'Failed to send notification email');
  }
}