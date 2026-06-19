import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { withAdminAuth } from '@/lib/api-utils';
import { logAudit } from '@/lib/audit';

export const GET = withAdminAuth(async (req) => {
  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const category = url.searchParams.get('category') || '';
  const published = url.searchParams.get('published') || '';
  const offset = (page - 1) * limit;

  let query = supabaseAdmin.from('blog_posts').select('*', { count: 'exact' });
  if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  if (category) query = query.eq('category', category);
  if (published !== '') query = query.eq('published', parseInt(published));

  const { data, count } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  return NextResponse.json({ data, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } });
});

export const POST = withAdminAuth(async (req, session) => {
  const body = await req.json();
  const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const { data, error } = await supabaseAdmin.from('blog_posts').insert({ ...body, slug }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  logAudit('create', 'blog_post', data.id, null, data);
  return NextResponse.json(data, { status: 201 });
});
