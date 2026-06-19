-- Run this in Supabase SQL Editor

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin','superadmin')),
  is_2fa_enabled BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_data JSONB DEFAULT '{}',
  after_data JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  payload JSONB DEFAULT '{}',
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page Content
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_key, section_key)
);

-- Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partners
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  website TEXT,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Versions
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price REAL,
  currency TEXT DEFAULT 'KES',
  type TEXT,
  status TEXT DEFAULT 'available',
  location TEXT,
  address TEXT,
  neighborhood TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area REAL,
  area_sqm REAL,
  area_unit TEXT DEFAULT 'sqm',
  year_built INTEGER,
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]',
  amenities JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  floor_plans JSONB DEFAULT '[]',
  lat REAL,
  lng REAL,
  agent_id UUID,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price History
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  price REAL NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  author TEXT,
  category TEXT DEFAULT 'General',
  image TEXT,
  cover_image TEXT,
  tags JSONB DEFAULT '[]',
  published BOOLEAN DEFAULT false,
  read_time INTEGER,
  published_at TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  bio TEXT,
  photo TEXT,
  title TEXT,
  verified BOOLEAN DEFAULT false,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  listings INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  avatar TEXT,
  rating INTEGER DEFAULT 5,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ Items
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Neighborhoods
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  image TEXT,
  avg_price REAL DEFAULT 0,
  property_count INTEGER DEFAULT 0,
  schools JSONB DEFAULT '[]',
  amenities JSONB DEFAULT '[]',
  transport JSONB DEFAULT '[]',
  crime_rate TEXT DEFAULT 'Low',
  lat REAL,
  lng REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  interest TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valuation Requests
CREATE TABLE IF NOT EXISTS valuation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  property_type TEXT,
  neighborhood TEXT,
  size_sqm REAL,
  bedrooms INTEGER,
  year_built INTEGER,
  estimated_value REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  name TEXT,
  filters JSONB NOT NULL DEFAULT '{}',
  alert_enabled BOOLEAN DEFAULT false,
  alert_frequency TEXT DEFAULT 'daily',
  alert_channels JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Increment function (for version tracking)
CREATE OR REPLACE FUNCTION increment()
RETURNS INTEGER AS $$
BEGIN
  RETURN 1;
END;
$$ LANGUAGE plpgsql;

-- Seed default admin user (password: Admin@123)
INSERT INTO admin_users (email, password_hash, name, role)
SELECT 'admin@tobillionhomes.co.ke', '$2a$10$ROK9LYT9qu/4Vp.fVn6dFeX51dbl.UIpZgKYaTyuCyKpN/uKAIDuq', 'Admin', 'superadmin'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@tobillionhomes.co.ke');

-- Seed site settings
INSERT INTO site_settings (key, value)
SELECT 'seo_meta', '{"title":"Tobillion Homes — Premium Real Estate in Nairobi","description":"Discover premium properties across Nairobi.","keywords":"real estate, Nairobi, property, homes, Kenya"}'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'seo_meta');

INSERT INTO site_settings (key, value)
SELECT 'contact_info', '{"phone":"+254 700 123 456","email":"info@tobillionhomes.co.ke","address":"Westlands Business Park, Nairobi, Kenya"}'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'contact_info');

INSERT INTO site_settings (key, value)
SELECT 'social_links', '{"facebook":"https://facebook.com/tobillionhomes","instagram":"https://instagram.com/tobillionhomes","linkedin":"https://linkedin.com/company/tobillionhomes","twitter":"https://twitter.com/tobillionhomes"}'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'social_links');

-- Seed page content
INSERT INTO page_content (page_key, section_key, content)
SELECT 'home', 'hero', '{"headline":"Find Your Dream Home in Nairobi","subheadline":"Premium properties across Kenya''s capital city","cta_text":"Browse Properties","cta_link":"/properties"}'
WHERE NOT EXISTS (SELECT 1 FROM page_content WHERE page_key = 'home' AND section_key = 'hero');

INSERT INTO page_content (page_key, section_key, content)
SELECT 'home', 'features', '{"items":[{"title":"Expert Agents","description":"Professional guidance","icon":"user"},{"title":"Virtual Tours","description":"Explore from anywhere","icon":"cube"},{"title":"Market Insights","description":"Data-driven advice","icon":"chart"}]}'
WHERE NOT EXISTS (SELECT 1 FROM page_content WHERE page_key = 'home' AND section_key = 'features');

INSERT INTO page_content (page_key, section_key, content)
SELECT 'home', 'testimonials', '{"items":[{"name":"Sarah K.","role":"Home Buyer","content":"Tobillion made finding our dream home seamless.","avatar":""}]}'
WHERE NOT EXISTS (SELECT 1 FROM page_content WHERE page_key = 'home' AND section_key = 'testimonials');

INSERT INTO page_content (page_key, section_key, content)
SELECT 'about', 'hero', '{"headline":"About Us","subheadline":"Nairobi''s premier real estate agency since 2018"}'
WHERE NOT EXISTS (SELECT 1 FROM page_content WHERE page_key = 'about' AND section_key = 'hero');

INSERT INTO page_content (page_key, section_key, content)
SELECT 'contact', 'hero', '{"headline":"Get In Touch","subheadline":"We''d love to hear from you"}'
WHERE NOT EXISTS (SELECT 1 FROM page_content WHERE page_key = 'contact' AND section_key = 'hero');

INSERT INTO page_content (page_key, section_key, content)
SELECT 'footer', 'links', '{"columns":[{"title":"Quick Links","links":[{"label":"Properties","href":"/properties"},{"label":"About","href":"/about"},{"label":"Contact","href":"/contact"}]},{"title":"Neighborhoods","links":[{"label":"Kilimani","href":"/neighborhoods/kilimani"},{"label":"Westlands","href":"/neighborhoods/westlands"},{"label":"Karen","href":"/neighborhoods/karen"}]}]}'
WHERE NOT EXISTS (SELECT 1 FROM page_content WHERE page_key = 'footer' AND section_key = 'links');

-- Seed agents
INSERT INTO agents (name, slug, email, phone, bio, photo, title, sort_order)
SELECT 'Grace Mwangi', 'grace-mwangi', 'grace@tobillionhomes.co.ke', '+254 712 345 678', 'Specializing in luxury residential properties in Westlands, Gigiri, and Runda with over 10 years of experience in Nairobi real estate.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80', 'Senior Property Consultant', 0
WHERE NOT EXISTS (SELECT 1 FROM agents WHERE slug = 'grace-mwangi');

INSERT INTO agents (name, slug, email, phone, bio, photo, title, sort_order)
SELECT 'James Ochieng', 'james-ochieng', 'james@tobillionhomes.co.ke', '+254 723 456 789', 'Expert in commercial real estate and investment properties across Nairobi''s business districts.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80', 'Commercial Real Estate Advisor', 1
WHERE NOT EXISTS (SELECT 1 FROM agents WHERE slug = 'james-ochieng');

INSERT INTO agents (name, slug, email, phone, bio, photo, title, sort_order)
SELECT 'Sarah Kamau', 'sarah-kamau', 'sarah@tobillionhomes.co.ke', '+254 734 567 890', 'Passionate about helping first-time homebuyers find their dream homes in Kilimani, Kileleshwa, and Langata.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80', 'Residential Sales Agent', 2
WHERE NOT EXISTS (SELECT 1 FROM agents WHERE slug = 'sarah-kamau');

-- Seed neighborhoods
INSERT INTO neighborhoods (name, slug, description, image)
SELECT 'Kilimani', 'kilimani', 'Upscale residential area with modern amenities, excellent schools, and vibrant social scene.', '/neighborhoods/kilimani.jpg'
WHERE NOT EXISTS (SELECT 1 FROM neighborhoods WHERE slug = 'kilimani');

INSERT INTO neighborhoods (name, slug, description, image)
SELECT 'Westlands', 'westlands', 'Commercial and residential hub with skyscrapers, fine dining, and luxury apartments.', '/neighborhoods/westlands.jpg'
WHERE NOT EXISTS (SELECT 1 FROM neighborhoods WHERE slug = 'westlands');

INSERT INTO neighborhoods (name, slug, description, image)
SELECT 'Karen', 'karen', 'Leafy suburban paradise with large plots, colonial heritage, and quiet living.', '/neighborhoods/karen.jpg'
WHERE NOT EXISTS (SELECT 1 FROM neighborhoods WHERE slug = 'karen');

INSERT INTO neighborhoods (name, slug, description, image)
SELECT 'Lavington', 'lavington', 'Prestigious neighborhood with executive homes, embassies, and top-rated schools.', '/neighborhoods/lavington.jpg'
WHERE NOT EXISTS (SELECT 1 FROM neighborhoods WHERE slug = 'lavington');

INSERT INTO neighborhoods (name, slug, description, image)
SELECT 'Eastleigh', 'eastleigh', 'Bustling commercial district with affordable housing and vibrant markets.', '/neighborhoods/eastleigh.jpg'
WHERE NOT EXISTS (SELECT 1 FROM neighborhoods WHERE slug = 'eastleigh');

INSERT INTO neighborhoods (name, slug, description, image)
SELECT 'Gigiri', 'gigiri', 'Diplomatic enclave with UN offices, ambassadors residences, and premium security.', '/neighborhoods/gigiri.jpg'
WHERE NOT EXISTS (SELECT 1 FROM neighborhoods WHERE slug = 'gigiri');

INSERT INTO neighborhoods (name, slug, description, image)
SELECT 'Langata', 'langata', 'Expansive suburb adjacent to Nairobi National Park, popular with nature lovers.', '/neighborhoods/langata.jpg'
WHERE NOT EXISTS (SELECT 1 FROM neighborhoods WHERE slug = 'langata');

INSERT INTO neighborhoods (name, slug, description, image)
SELECT 'Kileleshwa', 'kileleshwa', 'Serene riverside neighborhood with modern apartments and family homes.', '/neighborhoods/kileleshwa.jpg'
WHERE NOT EXISTS (SELECT 1 FROM neighborhoods WHERE slug = 'kileleshwa');

-- Seed blog posts
INSERT INTO blog_posts (title, slug, content, excerpt, author, category, image, tags, published, read_time, published_at)
SELECT 'Nairobi Property Market 2026: Trends and Insights', 'nairobi-property-market-2026', 'The Nairobi property market continues to show remarkable resilience and growth in 2026. With infrastructure projects like the Nairobi Expressway and ongoing developments in satellite towns, property values have appreciated significantly.\n\nKey trends include a surge in apartment developments in Kilimani and Westlands, growing demand for gated community homes in Karen and Langata, and increased interest in commercial spaces in the CBD and Upper Hill.\n\nFor investors, the current market presents excellent opportunities, especially in emerging neighborhoods where property prices are still relatively affordable but poised for growth.', 'An in-depth look at the latest trends shaping Nairobi real estate in 2026, from infrastructure impacts to emerging neighborhoods.', 'Team', 'Market Insights', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80', '["market trends","Nairobi property","real estate 2026","investment"]', true, 8, '2026-06-01'
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'nairobi-property-market-2026');

-- Seed FAQ items
INSERT INTO faq_items (question, answer, category, sort_order, is_published)
SELECT 'What is the process for buying property in Nairobi?', 'The buying process typically involves: 1) Property search and viewing, 2) Offer and negotiation, 3) Due diligence including title search, 4) Signing the sale agreement, 5) Payment of deposit, 6) Transfer of title at the Ministry of Lands, 7) Final payment and handover. The entire process usually takes 30-90 days.', 'Buying Process', 0, true
WHERE NOT EXISTS (SELECT 1 FROM faq_items WHERE question LIKE 'What is the process for buying property%');

INSERT INTO faq_items (question, answer, category, sort_order, is_published)
SELECT 'How much deposit do I need to buy a home?', 'Most sellers require a 10-20% deposit upon signing the sale agreement. The balance is typically paid within 30-90 days. For mortgage financing, banks usually require a 20-30% down payment of the property value.', 'Financing', 1, true
WHERE NOT EXISTS (SELECT 1 FROM faq_items WHERE question LIKE 'How much deposit%');

INSERT INTO faq_items (question, answer, category, sort_order, is_published)
SELECT 'What are the additional costs when buying property?', 'Additional costs include: Stamp duty (2-4% of property value), legal fees (1-2%), valuation fees, search fees, and registration fees. Budget for approximately 8-12% above the purchase price to cover these costs.', 'Buying Process', 2, true
WHERE NOT EXISTS (SELECT 1 FROM faq_items WHERE question LIKE 'What are the additional costs%');

-- Seed testimonials
INSERT INTO testimonials (name, role, content, avatar, rating, sort_order, is_published)
SELECT 'Sarah Kiprop', 'Home Buyer', 'Tobillion Homes made our dream of owning a home in Nairobi a reality. Their team guided us through every step with professionalism and care.', '', 5, 0, true
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Sarah Kiprop');

INSERT INTO testimonials (name, role, content, avatar, rating, sort_order, is_published)
SELECT 'David Mwangi', 'Property Investor', 'I have worked with several agencies over the years, but Tobillion stands out for their market knowledge and integrity. Highly recommended for serious investors.', '', 5, 1, true
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'David Mwangi');

-- Enable Row Level Security (optional, can expand later)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
