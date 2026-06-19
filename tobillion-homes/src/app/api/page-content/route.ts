import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('page_key');
    const sectionKey = searchParams.get('section_key');

    let query = supabase.from('page_content').select('*');
    if (pageKey) query = query.eq('page_key', pageKey);
    if (sectionKey) query = query.eq('section_key', sectionKey);

    const { data } = await query;
    const rows = ((data as any[]) || []).map(parseRow);
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
