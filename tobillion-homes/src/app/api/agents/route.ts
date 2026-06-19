import { NextResponse } from 'next/server';
import { fetchAgents, fetchAgentBySlug } from '@/lib/data-transform';

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  if (slug) {
    const agent = await fetchAgentBySlug(slug);
    if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(agent);
  }
  const agents = await fetchAgents();
  return NextResponse.json(agents);
};
