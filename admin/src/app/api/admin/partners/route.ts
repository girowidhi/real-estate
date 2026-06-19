import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { withAdminAuth } from '@/lib/api-utils';
import { logAudit } from '@/lib/audit';

export const GET = withAdminAuth(async () => {
  const { data } = await supabaseAdmin.from('partners').select('*').order('sort_order');
  return NextResponse.json(Array.isArray(data) ? data : []);
});

export const POST = withAdminAuth(async (req, session) => {
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from('partners').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  logAudit('create', 'partner', data.id, null, data);
  return NextResponse.json(data, { status: 201 });
});
