import { NextResponse } from 'next/server';
import { fetchBlogPosts, fetchBlogPostBySlug } from '@/lib/data-transform';

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  const category = url.searchParams.get('category');
  if (slug) {
    const post = await fetchBlogPostBySlug(slug);
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(post);
  }
  const posts = await fetchBlogPosts(category ? { category } : undefined);
  return NextResponse.json(posts);
};
