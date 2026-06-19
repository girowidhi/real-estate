export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: 'house' | 'apartment' | 'land' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  location: string;
  neighborhood: Neighborhood;
  images: string[];
  floorPlans: string[];
  amenities: string[];
  features: string[];
  agent: Agent;
  status: 'available' | 'sold' | 'pending' | 'coming-soon';
  featured: boolean;
  verified: boolean;
  yearBuilt: number;
  priceHistory: PricePoint[];
  createdAt: string;
  updatedAt: string;
  latitude: number;
  longitude: number;
  scarcity?: string;
  rating: number;
  reviewCount: number;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface Neighborhood {
  slug: string;
  name: string;
  description: string;
  image?: string;
  avgPrice: number;
  properties?: number;
  lat: number;
  lng: number;
  schools?: number;
  transportRating?: number;
  crimeScore?: number;
}

export interface Agent {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  photo: string;
  bio: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  listings: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
}

export interface SearchFilters {
  query?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  neighborhood?: string;
  amenities?: string[];
  sort?: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: SearchFilters;
  alertEnabled: boolean;
  alertFrequency: 'instant' | 'daily' | 'weekly';
  alertChannels: ('email' | 'sms')[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  savedProperties: string[];
  savedSearches: SavedSearch[];
}

export interface NeighborhoodGuide {
  slug: string;
  name: string;
  description: string;
  content: string;
  image: string;
  avgPropertyPrice: number;
  schools: string[];
  amenities: string[];
  transport: string[];
  crimeRate: string;
  lat: number;
  lng: number;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface CareerOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  description: string;
  requirements: string[];
  postedAt: string;
}
