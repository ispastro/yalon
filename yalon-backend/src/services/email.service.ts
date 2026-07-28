import { transporter } from '../config/mailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import path from 'path';

interface SendNotificationParams {
  subject: string;
  html: string;
  replyTo: string;
}

export async function sendNotificationEmail({ subject, html, replyTo }: SendNotificationParams): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"Yalon Professional Staffing Solutions" <${env.SENDER_EMAIL}>`,
      to: env.RECEIVER_EMAIL,
      replyTo,
      subject,
      html,
      attachments: [
        {
          filename: 'yalon-logo.png',
          path: path.join(__dirname, '..', '..', 'assets', 'yalon-logo-email.png'),
          cid: 'yalonlogo',
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
