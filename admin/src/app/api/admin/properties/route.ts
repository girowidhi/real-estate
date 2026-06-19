import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { withAdminAuth } from '@/lib/api-utils';
import { logAudit } from '@/lib/audit';

export const GET = withAdminAuth(async (req) => {
  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const status = url.searchParams.get('status') || '';
  const type = url.searchParams.get('type') || '';
  const minPrice = url.searchParams.get('minPrice') || '';
  const maxPrice = url.searchParams.get('maxPrice') || '';
  const offset = (page - 1) * limit;

  let query = supabaseAdmin.from('properties').select('*', { count: 'exact' });

  if (search) query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%,description.ilike.%${search}%`);
  if (status) query = query.eq('status', status);
  if (type) query = query.eq('type', type);
  if (minPrice) query = query.gte('price', parseInt(minPrice));
  if (maxPrice) query = query.lte('price', parseInt(maxPrice));

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  });
});

export const POST = withAdminAuth(async (req, session) => {
  const body = await req.json();
  const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data, error } = await supabaseAdmin
    .from('properties')
    .insert({ ...body, slug })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  logAudit('create', 'property', data.id, null, data);
  return NextResponse.json(data, { status: 201 });
});
