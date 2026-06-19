import type { Property, Agent, BlogPost, FAQItem, NeighborhoodGuide } from '@/types';

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
  return res.json();
}

interface PropertiesResponse {
  total: number;
  properties: Property[];
}

export async function fetchProperties(filters?: Record<string, string | number | boolean | undefined>): Promise<Property[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
  }
  const qs = params.toString();
  const data = await apiFetch<PropertiesResponse>(`/api/properties${qs ? `?${qs}` : ''}`);
  return data.properties;
}

export async function fetchPropertyBySlug(slug: string): Promise<Property | null> {
  const data = await apiFetch<PropertiesResponse>(`/api/properties?slug=${slug}`);
  return data.properties.length > 0 ? data.properties[0] : null;
}

export function fetchBlogPosts(category?: string): Promise<BlogPost[]> {
  const qs = category ? `?category=${category}` : '';
  return apiFetch(`/api/blog-posts${qs}`);
}

export function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return apiFetch(`/api/blog-posts?slug=${slug}`);
}

export function fetchAgents(): Promise<Agent[]> {
  return apiFetch('/api/agents');
}

export function fetchAgentBySlug(slug: string): Promise<Agent | null> {
  return apiFetch(`/api/agents?slug=${slug}`);
}

export function fetchFAQItems(): Promise<FAQItem[]> {
  return apiFetch('/api/faq-items');
}

export function fetchNeighborhoods(): Promise<NeighborhoodGuide[]> {
  return apiFetch('/api/neighborhoods');
}

export function fetchSiteSettings(): Promise<Record<string, any>> {
  return apiFetch('/api/settings');
}

export function fetchTestimonialsFromDb(): Promise<any[]> {
  return apiFetch('/api/testimonials');
}

export function fetchPageContent(pageKey?: string, sectionKey?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (pageKey) params.set('page_key', pageKey);
  if (sectionKey) params.set('section_key', sectionKey);
  const qs = params.toString();
  return apiFetch(`/api/page-content${qs ? `?${qs}` : ''}`);
}
