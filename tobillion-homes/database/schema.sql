-- Tobillion Homes — PostgreSQL Database Schema
-- Compatible with Supabase

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  currency TEXT DEFAULT 'KES',
  type TEXT CHECK (type IN ('house', 'apartment', 'land', 'commercial')),
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  area INT,
  area_unit TEXT DEFAULT 'sqm',
  location TEXT,
  neighborhood TEXT REFERENCES neighborhoods(slug),
  images TEXT[] DEFAULT '{}',
  floor_plans TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  agent_id UUID REFERENCES agents(id),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending', 'coming-soon')),
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  year_built INT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  scarcity TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_slug ON properties(slug);

-- Price history table
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  price BIGINT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_property ON price_history(property_id);

-- Neighborhoods table
CREATE TABLE neighborhoods (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  avg_price BIGINT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  schools INT DEFAULT 0,
  transport_rating INT DEFAULT 0,
  crime_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  photo TEXT,
  bio TEXT,
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  listings INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (for auth + saved searches)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  image TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved properties (junction table)
CREATE TABLE saved_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Saved searches
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  filters JSONB NOT NULL,
  alert_enabled BOOLEAN DEFAULT false,
  alert_frequency TEXT DEFAULT 'instant' CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
  alert_channels TEXT[] DEFAULT '{email}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  image TEXT,
  author TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  read_time INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);

-- FAQ items
CREATE TABLE faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valuation requests
CREATE TABLE valuation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  property_type TEXT,
  neighborhood TEXT,
  size_sqm INT,
  bedrooms INT,
  year_built INT,
  estimated_value BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Career applications
CREATE TABLE career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact form submissions / HubSpot sync log
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  interest TEXT,
  hubspot_contact_id TEXT,
  synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  page_url TEXT,
  user_id UUID REFERENCES users(id),
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
