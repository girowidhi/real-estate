import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { withAdminAuth, apiError } from '@/lib/api-utils';
import { logAudit } from '@/lib/audit';

export const GET = withAdminAuth(async (req, session, context) => {
  const id = context?.params?.id;
  const { data } = await supabaseAdmin.from('blog_posts').select('*').eq('id', id).single();
  return NextResponse.json(data);
});

export const PATCH = withAdminAuth(async (req, session, context) => {
  const id = context?.params?.id;
  if (!id) return apiError('ID is required', 400);
  const body = await req.json();
  const { data: old } = await supabaseAdmin.from('blog_posts').select('*').eq('id', id).single();
  const { data } = await supabaseAdmin.from('blog_posts').update(body).eq('id', id).select().single();
  logAudit('update', 'blog_post', id, old, data);
  return NextResponse.json(data);
});

export const DELETE = withAdminAuth(async (req, session, context) => {
  const id = context?.params?.id;
  if (!id) return apiError('ID is required', 400);
  const { data: old } = await supabaseAdmin.from('blog_posts').select('*').eq('id', id).single();
  await supabaseAdmin.from('blog_posts').delete().eq('id', id);
  logAudit('delete', 'blog_post', id, old, null);
  return NextResponse.json({ success: true });
});
