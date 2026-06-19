import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { withAdminAuth } from '@/lib/api-utils';
import { logAudit } from '@/lib/audit';

export const GET = withAdminAuth(async () => {
  const { data } = await supabaseAdmin.from('site_settings').select('*');
  const settings: Record<string, unknown> = {};
  data?.forEach((s: any) => { settings[s.key] = s.value; });
  return NextResponse.json(settings);
});

export const POST = withAdminAuth(async (req, session) => {
  const body = await req.json();
  const results: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    const { data: old } = await supabaseAdmin.from('site_settings').select('value').eq('key', key).single();
    const { data } = await supabaseAdmin.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' }).select().single();
    logAudit('update', 'site_setting', key, (old?.value || null) as object | null, value as object);
    if (data) results[key] = data.value;
  }
  return NextResponse.json(results);
});
