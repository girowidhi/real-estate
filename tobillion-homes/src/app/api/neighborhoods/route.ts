import { NextResponse } from 'next/server';
import { fetchNeighborhoods } from '@/lib/data-transform';

export const GET = async () => {
  const items = await fetchNeighborhoods();
  return NextResponse.json(items);
};
