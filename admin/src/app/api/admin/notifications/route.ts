import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { withAdminAuth } from '@/lib/api-utils';

export const GET = withAdminAuth(async () => {
  const { data } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  return NextResponse.json(data);
});

export const PATCH = withAdminAuth(async (req) => {
  const { ids } = await req.json();
  const { data } = await supabaseAdmin
    .from('notifications')
    .update({ delivered_at: new Date().toISOString() })
    .in('id', ids || [])
    .select();
  return NextResponse.json(data);
});

export const DELETE = withAdminAuth(async (req) => {
  const { ids } = await req.json();
  await supabaseAdmin
    .from('notifications')
    .delete()
    .in('id', ids || []);
  return NextResponse.json({ success: true });
});
