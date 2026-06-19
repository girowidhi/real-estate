import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { withAdminAuth } from '@/lib/api-utils';
import { logAudit } from '@/lib/audit';

export const GET = withAdminAuth(async () => {
  const { data } = await supabaseAdmin.from('testimonials').select('*').order('created_at', { ascending: false });
  return NextResponse.json(data);
});

export const POST = withAdminAuth(async (req, session) => {
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from('testimonials').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  logAudit('create', 'testimonial', data.id, null, data);
  return NextResponse.json(data, { status: 201 });
});
