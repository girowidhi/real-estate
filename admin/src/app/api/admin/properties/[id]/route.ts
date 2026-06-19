import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { withAdminAuth, apiError } from '@/lib/api-utils';
import { logAudit } from '@/lib/audit';

export const GET = withAdminAuth(async (req, session, context) => {
  const id = context?.params?.id;
  if (!id) return apiError('ID is required', 400);
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return apiError(error.message, 404);
  return NextResponse.json(data);
});

export const PATCH = withAdminAuth(async (req, session, context) => {
  const id = context?.params?.id;
  if (!id) return apiError('ID is required', 400);
  const body = await req.json();
  const { data: oldData } = await supabaseAdmin.from('properties').select('*').eq('id', id).single();
  const { data, error } = await supabaseAdmin.from('properties').update(body).eq('id', id).select().single();
  if (error) return apiError(error.message, 500);
  logAudit('update', 'property', id, oldData, data);
  return NextResponse.json(data);
});

export const DELETE = withAdminAuth(async (req, session, context) => {
  const id = context?.params?.id;
  if (!id) return apiError('ID is required', 400);
  const { data: oldData } = await supabaseAdmin.from('properties').select('*').eq('id', id).single();
  const { error } = await supabaseAdmin.from('properties').delete().eq('id', id);
  if (error) return apiError(error.message, 500);
  logAudit('delete', 'property', id, oldData, null);
  return NextResponse.json({ success: true });
});
