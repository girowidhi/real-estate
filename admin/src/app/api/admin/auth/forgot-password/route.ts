import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip, 3, 900000)) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data: user } = await supabaseAdmin
      .from('admin_users')
      .select('id, name, email')
      .eq('email', email.toLowerCase())
      .single();

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    await supabaseAdmin.from('password_reset_tokens').insert({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_ADMIN_URL}/login?reset_token=${token}`;
    await sendEmail(
      user.email,
      'Password Reset Request — Tobillion Admin',
      `Hi ${user.name},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you did not request this, please ignore this email.`
    );

    return NextResponse.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
