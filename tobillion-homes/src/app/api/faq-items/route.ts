import { NextResponse } from 'next/server';
import { fetchFAQItems } from '@/lib/data-transform';

export const GET = async () => {
  const items = await fetchFAQItems();
  return NextResponse.json(items);
};
