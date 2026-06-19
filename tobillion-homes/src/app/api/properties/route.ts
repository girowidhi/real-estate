import { NextRequest, NextResponse } from 'next/server';
import { fetchProperties, fetchPropertyBySlug } from '@/lib/data-transform';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const type = searchParams.get('type');
  const neighborhood = searchParams.get('neighborhood');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const bedrooms = searchParams.get('bedrooms');
  const featured = searchParams.get('featured');
  const sort = searchParams.get('sort');
  const limit = searchParams.get('limit');

  if (slug) {
    const property = await fetchPropertyBySlug(slug);
    return NextResponse.json({ total: property ? 1 : 0, properties: property ? [property] : [] });
  }

  try {
    const filters: any = {};
    if (type) filters.type = type;
    if (neighborhood) filters.neighborhood = neighborhood;
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    if (featured === 'true') filters.featured = true;
    if (limit) filters.limit = Number(limit);

    if (bedrooms) {
      const beds = Number(bedrooms);
      if (beds >= 5) filters.bedrooms = beds;
      else filters.bedrooms = beds;
    }

    let properties = await fetchProperties(filters);

    if (sort) {
      switch (sort) {
        case 'price-asc': properties.sort((a, b) => a.price - b.price); break;
        case 'price-desc': properties.sort((a, b) => b.price - a.price); break;
        default: break;
      }
    }

    return NextResponse.json({ total: properties.length, properties });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
