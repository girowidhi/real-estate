import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { withAdminAuth, apiError } from '@/lib/api-utils';
import { logAudit } from '@/lib/audit';

export const PATCH = withAdminAuth(async (req, session, context) => {
  const id = context?.params?.id;
  if (!id) return apiError('ID is required', 400);
  const body = await req.json();
  const { data: old } = await supabaseAdmin.from('agents').select('*').eq('id', id).single();
  const { data } = await supabaseAdmin.from('agents').update(body).eq('id', id).select().single();
  logAudit('update', 'agent', id, old, data);
  return NextResponse.json(data);
});

export const DELETE = withAdminAuth(async (req, session, context) => {
  const id = context?.params?.id;
  if (!id) return apiError('ID is required', 400);
  await supabaseAdmin.from('agents').delete().eq('id', id);
  logAudit('delete', 'agent', id, null, null);
  return NextResponse.json({ success: true });
});
