import { NextResponse } from 'next/server';
import { fetchSiteSettings } from '@/lib/data-transform';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await fetchSiteSettings();
    return NextResponse.json(settings);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
