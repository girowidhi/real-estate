import type { Property, Agent, BlogPost, FAQItem, Neighborhood, NeighborhoodGuide } from '@/types';
import { supabase } from './supabase';

function parseJson(val: any, fallback: any = null): any {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

export function toProperty(dbRow: any, agent?: any, neighborhood?: any): Property {
  const images = parseJson(dbRow.images, []);
  const amenities = parseJson(dbRow.amenities, []);
  const features = parseJson(dbRow.features, []);
  const floorPlans = parseJson(dbRow.floor_plans, []);

  return {
    id: dbRow.id,
    slug: dbRow.slug,
    title: dbRow.title,
    description: dbRow.description || '',
    price: dbRow.price || 0,
    currency: dbRow.currency || 'KES',
    type: dbRow.type || 'house',
    bedrooms: dbRow.bedrooms || 0,
    bathrooms: dbRow.bathrooms || 0,
    area: dbRow.area || dbRow.area_sqm || 0,
    areaUnit: dbRow.area_unit || 'sqm',
    location: dbRow.location || '',
    neighborhood: toNeighborhood(neighborhood || dbRow, dbRow.neighborhood),
    images,
    floorPlans,
    amenities,
    features,
    agent: agent || toAgent(dbRow),
    status: dbRow.status || 'available',
    featured: !!dbRow.featured,
    verified: !!dbRow.verified,
    yearBuilt: dbRow.year_built || new Date().getFullYear(),
    priceHistory: [],
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
    latitude: dbRow.lat || -1.2921,
    longitude: dbRow.lng || 36.8219,
    rating: dbRow.rating || 0,
    reviewCount: dbRow.review_count || 0,
  };
}

export function toAgent(dbRow: any): Agent {
  return {
    id: dbRow.id || dbRow.agent_id || '',
    name: dbRow.name || dbRow.agent_name || '',
    slug: dbRow.slug || '',
    email: dbRow.email || '',
    phone: dbRow.phone || '',
    photo: dbRow.photo || '',
    bio: dbRow.bio || '',
    verified: !!dbRow.verified,
    rating: dbRow.rating || 0,
    reviewCount: dbRow.review_count || 0,
    listings: dbRow.listings || 0,
  };
}

export function toNeighborhood(dbRow: any, _slug?: string): Neighborhood {
  return {
    slug: dbRow.neighborhood_slug || dbRow.slug || _slug || '',
    name: dbRow.neighborhood_name || dbRow.name || _slug || '',
    description: dbRow.neighborhood_description || dbRow.description || '',
    image: dbRow.neighborhood_image || dbRow.image || '',
    avgPrice: dbRow.avg_price || 0,
    properties: dbRow.property_count || 0,
    lat: dbRow.lat || -1.2921,
    lng: dbRow.lng || 36.8219,
    schools: dbRow.schools || 0,
    transportRating: dbRow.transport_rating || 0,
    crimeScore: dbRow.crime_score || 0,
  };
}

export function toBlogPost(dbRow: any): BlogPost {
  const tags = parseJson(dbRow.tags, []);
  return {
    id: dbRow.id,
    slug: dbRow.slug,
    title: dbRow.title,
    excerpt: dbRow.excerpt || '',
    content: dbRow.content || '',
    image: dbRow.image || dbRow.cover_image || '',
    author: dbRow.author || '',
    category: dbRow.category || 'General',
    tags,
    publishedAt: dbRow.published_at || dbRow.created_at,
    readTime: dbRow.read_time || Math.max(1, Math.ceil((dbRow.content?.length || 0) / 2000)),
  };
}

export function toFAQItem(dbRow: any): FAQItem {
  return {
    question: dbRow.question,
    answer: dbRow.answer,
    category: dbRow.category || 'General',
  };
}

function extractJoin(r: any, alias: string): any {
  const prefix = `${alias}_`;
  const obj: any = {};
  let hasData = false;
  for (const key of Object.keys(r)) {
    if (key.startsWith(prefix)) {
      const shortKey = key.slice(prefix.length);
      obj[shortKey] = r[key];
      hasData = true;
    }
  }
  return hasData ? obj : null;
}

export async function fetchProperties(filters?: {
  type?: string; neighborhood?: string; minPrice?: number; maxPrice?: number;
  bedrooms?: number; featured?: boolean; status?: string; slug?: string; sort?: string; limit?: number;
}): Promise<Property[]> {
  let query = supabase.from('properties').select('*, neighborhood:neighborhoods(*), agent:agents(*)');
  if (filters?.slug) query = query.eq('slug', filters.slug);
  if (filters?.type) query = query.eq('type', filters.type);
  if (filters?.neighborhood) query = query.eq('neighborhood', filters.neighborhood);
  if (filters?.minPrice) query = query.gte('price', filters.minPrice);
  if (filters?.maxPrice) query = query.lte('price', filters.maxPrice);
  if (filters?.bedrooms) query = query.gte('bedrooms', filters.bedrooms);
  if (filters?.featured) query = query.eq('featured', true);
  query = query.eq('status', filters?.status || 'available').order('created_at', { ascending: false });
  if (filters?.limit) query = query.limit(filters.limit);
  const { data, error } = await query;
  if (error) throw error;
  return ((data as any[]) || []).map((r: any) => toProperty(r, extractJoin(r, 'agent'), extractJoin(r, 'neighborhood')));
}

export async function fetchPropertyBySlug(slug: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*, neighborhood:neighborhoods(*), agent:agents(*)')
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  const r = data as any;
  const prop = toProperty(r, extractJoin(r, 'agent'), extractJoin(r, 'neighborhood'));
  const phData = await supabase.from('price_history').select('*').eq('property_id', r.id).order('date', { ascending: false });
  if (phData.data) {
    prop.priceHistory = (phData.data as any[]).map((p: any) => ({ date: p.date, price: p.price }));
  }
  return prop;
}

export async function fetchBlogPosts(filters?: { category?: string; slug?: string }): Promise<BlogPost[]> {
  let query = supabase.from('blog_posts').select('*').eq('published', true);
  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.slug) query = query.eq('slug', filters.slug);
  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return ((data as any[]) || []).map(toBlogPost);
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fetchBlogPosts({ slug });
  return posts[0] || null;
}

export async function fetchAgents(): Promise<Agent[]> {
  const { data, error } = await supabase.from('agents').select('*').order('sort_order');
  if (error) throw error;
  return ((data as any[]) || []).map(toAgent);
}

export async function fetchAgentBySlug(slug: string): Promise<Agent | null> {
  const { data } = await supabase.from('agents').select('*').eq('slug', slug).single();
  if (!data) return null;
  return toAgent(data);
}

export async function fetchFAQItems(): Promise<FAQItem[]> {
  const { data, error } = await supabase.from('faq_items').select('*').eq('is_published', true).order('sort_order');
  if (error) throw error;
  return ((data as any[]) || []).map(toFAQItem);
}

export async function fetchNeighborhoods(): Promise<NeighborhoodGuide[]> {
  const { data, error } = await supabase.from('neighborhoods').select('*');
  if (error) throw error;
  return ((data as any[]) || []).map((r: any) => ({
    slug: r.slug, name: r.name, description: r.description || '',
    content: r.content || r.description || '', image: r.image || '',
    avgPropertyPrice: r.avg_price || 0,
    schools: parseJson(r.schools, []), amenities: parseJson(r.amenities, []),
    transport: parseJson(r.transport, []), crimeRate: r.crime_rate || 'Low',
    lat: r.lat || -1.2921, lng: r.lng || 36.8219,
  }));
}

export async function fetchTestimonials(): Promise<any[]> {
  const { data, error } = await supabase.from('testimonials').select('*').eq('is_published', true).order('sort_order');
  if (error) throw error;
  return ((data as any[]) || []).map((r: any) => ({
    name: r.name, text: r.content, photo: r.avatar || '',
  }));
}

export async function fetchSiteSettings(): Promise<Record<string, any>> {
  const { data } = await supabase.from('site_settings').select('*');
  const settings: Record<string, any> = {};
  ((data as any[]) || []).forEach((s: any) => {
    let val = s.value;
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try { val = JSON.parse(val); } catch {}
    }
    settings[s.key] = val;
  });
  return settings;
}

export interface PageContent {
  id: string;
  page_key: string;
  section_key: string;
  content: Record<string, any>;
  is_published: number;
  version: number;
  created_at?: string;
  updated_at?: string;
}

export async function fetchPageContent(pageKey?: string, sectionKey?: string): Promise<PageContent[]> {
  let query = supabase.from('page_content').select('*').eq('is_published', true);
  if (pageKey) query = query.eq('page_key', pageKey);
  if (sectionKey) query = query.eq('section_key', sectionKey);
  const { data, error } = await query;
  if (error) throw error;
  return (data as any[]) || [];
}
