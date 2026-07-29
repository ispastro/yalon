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

// Logo is a static file that never changes at runtime — read it once into
// memory using process.cwd() so it resolves correctly from the project root on Render.
const LOGO_PATH = path.join(process.cwd(), 'assets', 'yalon-logo-email.png');
const LOGO_BASE64 = fs.readFileSync(LOGO_PATH).toString('base64');

export async function sendNotificationEmail({ subject, html, replyTo }: SendNotificationParams): Promise<void> {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: 'Yalon Professional Staffing Solutions', email: env.SENDER_EMAIL },
      to: [{ email: env.RECEIVER_EMAIL }],
      replyTo: { email: replyTo },
      subject,
      htmlContent: html,
      // Inline logo — same cid:yalonlogo reference your templates already use.
      // Brevo matches attachment.name against the cid the template points to.
      attachment: [
        {
          content: LOGO_BASE64,
          name: 'yalonlogo',
        },
      ],
    });
  } catch (err) {
    // Email failure should NOT fail the whole request — the submission is
    // already safely stored in Supabase. We log it so it can be
    // investigated/resent, but the user still gets a success response.
    logger.error({ err }, 'Failed to send notification email');
  }
}