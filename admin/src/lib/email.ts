import { supabaseAdmin } from './db';

interface NotificationPayload {
  type: string;
  title: string;
  message?: string;
  payload?: Record<string, unknown>;
}

export async function createNotification(notification: NotificationPayload) {
  const { data } = await supabaseAdmin
    .from('notifications')
    .insert({
      type: notification.type,
      title: notification.title,
      message: notification.message || null,
      payload: notification.payload || {},
    })
    .select('id')
    .single();
  return data?.id;
}

export async function sendEmail(to: string, subject: string, body: string) {
  if (!process.env.SMTP_HOST) {
    console.log(`[EMAIL] Would send to ${to}: ${subject}`);
    await createNotification({
      type: 'email',
      title: `Email: ${subject}`,
      payload: { to, subject },
    });
    return;
  }
  // In production, use nodemailer or Resend/SendGrid
  console.log(`[EMAIL] Sending to ${to}: ${subject}`);
}
