import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { withAdminAuth } from '@/lib/api-utils';

const SECURITY_ACTIONS = ['failed_login', 'password_reset', '2fa_failed', 'suspicious_ip', 'rate_limited'];

export const GET = withAdminAuth(async (req) => {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const entityType = url.searchParams.get('entity_type') || '';
  const action = url.searchParams.get('action') || '';
  const search = url.searchParams.get('search') || '';
  const dateFrom = url.searchParams.get('date_from') || '';
  const dateTo = url.searchParams.get('date_to') || '';
  const security = url.searchParams.get('security') || '';
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('audit_log')
    .select('*, admin_users(name, email)', { count: 'exact' });

  if (entityType) query = query.eq('entity_type', entityType);

  if (action) {
    query = query.eq('action', action);
  } else if (security === 'true') {
    query = query.in('action', SECURITY_ACTIONS);
  }

  if (search) {
    query = query.or(`entity_id LIKE '%${search}%'`);
  }
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59');

  const { data, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({
    data,
    pagination: {
      page, limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
});

export const DELETE = withAdminAuth(async (req) => {
  const url = new URL(req.url);
  const before = url.searchParams.get('before');
  if (before) {
    await supabaseAdmin.from('audit_log').delete().lte('created_at', before);
    return NextResponse.json({ success: true, message: `Logs before ${before} purged` });
  }
  return NextResponse.json({ error: 'Missing before parameter' }, { status: 400 });
});
