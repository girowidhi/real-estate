import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);

// Re-export helper functions that were previously here
export async function getProperties(filters?: Record<string, any>) {
  let query = supabase.from('properties').select('*, neighborhood:neighborhoods(*), agent:agents(*)');
  if (filters?.type) query = query.eq('type', filters.type);
  if (filters?.neighborhood) query = query.eq('neighborhood', filters.neighborhood);
  if (filters?.minPrice) query = query.gte('price', filters.minPrice);
  if (filters?.maxPrice) query = query.lte('price', filters.maxPrice);
  if (filters?.bedrooms) query = query.gte('bedrooms', filters.bedrooms);
  if (filters?.featured) query = query.eq('featured', true);
  if (filters?.status) query = query.eq('status', filters.status);
  query = query.eq('status', 'available').order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPropertyBySlug(slug: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*, neighborhood:neighborhoods(*), agent:agents(*), price_history(*)')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}

export async function createContactSubmission(submission: {
  name: string; email: string; phone?: string; message?: string; interest?: string;
}) {
  const { data, error } = await supabase.from('contact_submissions').insert(submission).select().single();
  if (error) throw error;
  return data;
}

export async function createValuationRequest(request: {
  name: string; email: string; phone?: string; property_type?: string;
  neighborhood?: string; size_sqm?: number; bedrooms?: number; year_built?: number; estimated_value?: number;
}) {
  const { data, error } = await supabase.from('valuation_requests').insert(request).select().single();
  if (error) throw error;
  return data;
}

export async function saveSearch(userId: string, search: {
  name?: string; filters: Record<string, any>; alert_enabled?: boolean;
  alert_frequency?: string; alert_channels?: string[];
}) {
  const { data, error } = await supabase.from('saved_searches').insert({ user_id: userId, ...search }).select().single();
  if (error) throw error;
  return data;
}

export async function getSavedSearches(userId: string) {
  const { data, error } = await supabase
    .from('saved_searches').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
