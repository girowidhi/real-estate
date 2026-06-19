import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function parseRow(row: any): any {
  if (!row) return row;
  const parsed: any = {};
  for (const [key, val] of Object.entries(row)) {
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try { parsed[key] = JSON.parse(val); } catch { parsed[key] = val; }
    } else {
      parsed[key] = val;
    }
  }
  return parsed;
}

export async function GET() {
  try {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_published', 1)
      .order('sort_order', { ascending: true });

    const rows = ((data as any[]) || []).map(parseRow);
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
