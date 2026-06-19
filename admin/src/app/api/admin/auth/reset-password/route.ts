import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip, 3, 900000)) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
    }

    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 12) {
      return NextResponse.json({ error: 'Password must be at least 12 characters' }, { status: 400 });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: 'Password must contain uppercase, lowercase, and numbers' }, { status: 400 });
    }

    const { data: resetToken } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (!resetToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);

    await supabaseAdmin.from('admin_users').update({ password_hash: passwordHash }).eq('id', resetToken.user_id);
    await supabaseAdmin.from('password_reset_tokens').update({ used: true }).eq('id', resetToken.id);
    await supabaseAdmin.from('audit_log').insert({
      user_id: resetToken.user_id,
      action: 'password_reset',
      entity_type: 'auth',
      entity_id: resetToken.user_id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
