import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { withAdminAuth } from '@/lib/api-utils';
import { logAudit } from '@/lib/audit';

export const GET = withAdminAuth(async (_req, session) => {
  const { data } = await supabaseAdmin
    .from('admin_users')
    .select('id, email, name, role, last_login_at, created_at, updated_at')
    .eq('id', session.userId)
    .single();
  return NextResponse.json(data);
});

export const PATCH = withAdminAuth(async (req, session) => {
  const body = await req.json();
  const { name, email, currentPassword, newPassword } = body;
  const updates: Record<string, any> = {};

  if (name) updates.name = name;

  if (email) {
    const { data: existing } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .neq('id', session.userId)
      .single();
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    updates.email = email.toLowerCase();
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }
    const bcrypt = await import('bcryptjs');
    const { data: user } = await supabaseAdmin
      .from('admin_users')
      .select('password_hash')
      .eq('id', session.userId)
      .single();
    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 });
    }
    updates.password_hash = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .update(updates)
    .eq('id', session.userId)
    .select('id, email, name, role')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  logAudit('update', 'profile', session.userId, null, data);
  return NextResponse.json(data);
});
