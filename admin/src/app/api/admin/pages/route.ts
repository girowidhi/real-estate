import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { withAdminAuth } from '@/lib/api-utils';
import { logAudit } from '@/lib/audit';

export const GET = withAdminAuth(async () => {
  const { data } = await supabaseAdmin.from('page_content').select('*').order('page_key');
  return NextResponse.json(Array.isArray(data) ? data : []);
});

export const POST = withAdminAuth(async (req, session) => {
  const body = await req.json();
  const { data: existing } = await supabaseAdmin
    .from('page_content')
    .select('id, content')
    .eq('page_key', body.page_key)
    .eq('section_key', body.section_key)
    .single();

  if (existing) {
    const oldContent = existing.content;
    const { data } = await supabaseAdmin
      .from('page_content')
      .update({ content: body.content, version: supabaseAdmin.rpc('increment'), updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    logAudit('update', 'page_content', existing.id, oldContent, body.content);
    return NextResponse.json(data);
  }

  const { data, error } = await supabaseAdmin.from('page_content').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  logAudit('create', 'page_content', data.id, null, data);
  return NextResponse.json(data, { status: 201 });
});
