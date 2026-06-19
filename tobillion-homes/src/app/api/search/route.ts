import { NextRequest, NextResponse } from 'next/server';
import { fetchProperties } from '@/lib/data-transform';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ results: [] });
    }

    const q = query.toLowerCase().trim();
    const properties = await fetchProperties();

    const results = properties.filter((property) => {
      const searchable = [
        property.title,
        property.description,
        property.type,
        property.neighborhood.name,
        property.location,
        ...property.amenities,
        ...property.features,
        property.agent.name,
      ].join(' ').toLowerCase();
      const matchTerms = q.split(/\s+/);
      return matchTerms.every((term) => searchable.includes(term));
    });

    return NextResponse.json({ query, total: results.length, properties: results });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
