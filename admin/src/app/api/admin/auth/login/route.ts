import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

async function createNotification(type: string, title: string, message?: string, payload?: Record<string, unknown>) {
  try { await supabaseAdmin.from('notifications').insert({ type, title, message, payload: payload || {} }).select('id').single(); } catch { /* silent */ }
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
    }

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { data: user } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!user) {
      try { await supabaseAdmin.from('audit_log').insert({
        action: 'failed_login', entity_type: 'auth',
        entity_id: email.toLowerCase(), ip_address: ip,
        before_data: {}, after_data: {},
      }).select('id').single(); } catch {}
      createNotification('security', 'Failed login attempt', `Unknown email: ${email.toLowerCase()}`, { ip });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const bcrypt = await import('bcryptjs');
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      try { await supabaseAdmin.from('audit_log').insert({
        user_id: user.id, action: 'failed_login', entity_type: 'auth',
        entity_id: user.id, ip_address: ip,
        before_data: {}, after_data: {},
      }).select('id').single(); } catch {}
      createNotification('security', 'Failed login attempt', `Account: ${user.name} (${user.email})`, { ip });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await supabaseAdmin
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    await createSession(user.id, user.email, user.name, user.role);

    try { await supabaseAdmin.from('audit_log').insert({
      user_id: user.id, action: 'login', entity_type: 'auth',
      entity_id: user.id, ip_address: ip,
      before_data: {}, after_data: {},
    }).select('id').single(); } catch {}
    createNotification('admin', 'Admin logged in', `${user.name} from ${ip}`);

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
