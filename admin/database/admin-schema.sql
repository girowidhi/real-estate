-- Tobillion Homes Admin — PostgreSQL Schema
-- Run this in your Supabase SQL Editor after the main site schema

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  is_2fa_enabled BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin sessions (for session-based auth)
CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_data JSONB,
  after_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  payload JSONB,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page content (hero, features, cards, testimonials, footer per page)
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_key, section_key)
);

-- Site settings
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
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content version history
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  version INT NOT NULL,
  data JSONB NOT NULL,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('seo_meta', '{"title":"Tobillion Homes — Premium Real Estate in Nairobi","description":"Discover premium properties across Nairobi. Expert real estate agents, personalized service, and cutting-edge technology.","keywords":"real estate, Nairobi, property, homes, Kenya"}'),
  ('contact_info', '{"phone":"+254 700 123 456","email":"info@tobillionhomes.co.ke","address":"Westlands Business Park, Nairobi, Kenya"}'),
  ('social_links', '{"facebook":"https://facebook.com/tobillionhomes","instagram":"https://instagram.com/tobillionhomes","twitter":"https://twitter.com/tobillionhomes","linkedin":"https://linkedin.com/company/tobillionhomes"}')
ON CONFLICT (key) DO NOTHING;

-- Insert default page content
INSERT INTO page_content (page_key, section_key, content) VALUES
  ('home', 'hero', '{"headline":"Find Your Dream Home in Nairobi","subheadline":"Premium properties across Kenya''s capital city","cta_text":"Browse Properties","cta_link":"/properties"}'),
  ('home', 'features', '{"items":[{"title":"Expert Agents","description":"Professional guidance throughout your property journey","icon":"user"},{"title":"Virtual Tours","description":"Explore properties from anywhere with 3D tours","icon":"cube"},{"title":"Market Insights","description":"Data-driven advice for smart investment decisions","icon":"chart"}]}'),
  ('home', 'testimonials', '{"items":[{"name":"Sarah K.","role":"Home Buyer","content":"Tobillion made finding our dream home seamless. Highly recommended!","avatar":""}]}'),
  ('about', 'hero', '{"headline":"About Tobillion Homes","subheadline":"Nairobi''s premier real estate agency since 2018"}'),
  ('contact', 'hero', '{"headline":"Get In Touch","subheadline":"We''d love to hear from you"}'),
  ('faq', 'hero', '{"headline":"Frequently Asked Questions","subheadline":"Everything you need to know about buying property in Nairobi"}'),
  ('footer', 'links', '{"columns":[{"title":"Quick Links","links":[{"label":"Properties","href":"/properties"},{"label":"About","href":"/about"},{"label":"Contact","href":"/contact"}]},{"title":"Neighborhoods","links":[{"label":"Kilimani","href":"/neighborhoods/kilimani"},{"label":"Westlands","href":"/neighborhoods/westlands"},{"label":"Karen","href":"/neighborhoods/karen"}]}]}')
ON CONFLICT (page_key, section_key) DO NOTHING;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
