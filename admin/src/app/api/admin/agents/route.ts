import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { withAdminAuth } from '@/lib/api-utils';

export const GET = withAdminAuth(async () => {
  const { data } = await supabaseAdmin
    .from('agents')
    .select('*')
    .order('name');
  return NextResponse.json(Array.isArray(data) ? data : []);
});

export const POST = withAdminAuth(async (req, session) => {
  const body = await req.json();
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const { data, error } = await supabaseAdmin.from('agents').insert({ ...body, slug }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
});
