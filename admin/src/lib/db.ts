import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'tobillion.db');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

let db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode=WAL');
    db.exec('PRAGMA foreign_keys=ON');
    runMigrations(db);
  }
  return db;
}

function runMigrations(d: DatabaseSync) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL, name TEXT NOT NULL,
      role TEXT DEFAULT 'admin' CHECK (role IN ('admin','superadmin')),
      is_2fa_enabled INTEGER DEFAULT 0, last_login_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY, user_id TEXT REFERENCES admin_users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL, expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY, data TEXT NOT NULL,
      expires_at TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY, user_id TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
      action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT,
      before_data TEXT DEFAULT '{}', after_data TEXT DEFAULT '{}',
      ip_address TEXT, user_agent TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL,
      message TEXT, payload TEXT DEFAULT '{}',
      delivered_at TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS page_content (
      id TEXT PRIMARY KEY, page_key TEXT NOT NULL, section_key TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '{}', is_published INTEGER DEFAULT 1,
      version INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(page_key, section_key)
    );
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY, key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL DEFAULT '{}', updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS partners (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT, website TEXT,
      is_published INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS content_versions (
      id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
      version INTEGER NOT NULL, data TEXT NOT NULL,
      created_by TEXT REFERENCES admin_users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      description TEXT, price REAL, currency TEXT DEFAULT 'KES',
      type TEXT, status TEXT DEFAULT 'available',
      location TEXT, address TEXT, neighborhood TEXT,
      bedrooms INTEGER, bathrooms INTEGER, area REAL, area_sqm REAL,
      area_unit TEXT DEFAULT 'sqm', year_built INTEGER,
      featured INTEGER DEFAULT 0, verified INTEGER DEFAULT 0,
      images TEXT DEFAULT '[]', amenities TEXT DEFAULT '[]',
      features TEXT DEFAULT '[]', floor_plans TEXT DEFAULT '[]',
      lat REAL, lng REAL,
      agent_id TEXT, rating REAL DEFAULT 0, review_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS price_history (
      id TEXT PRIMARY KEY, property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
      price REAL NOT NULL, date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      content TEXT, excerpt TEXT, author TEXT, category TEXT DEFAULT 'General',
      image TEXT, cover_image TEXT,
      tags TEXT DEFAULT '[]', published INTEGER DEFAULT 0,
      read_time INTEGER, published_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      email TEXT, phone TEXT, bio TEXT, photo TEXT, title TEXT,
      verified INTEGER DEFAULT 0, rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0, listings INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT,
      content TEXT NOT NULL, avatar TEXT, rating INTEGER DEFAULT 5,
      is_published INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS faq_items (
      id TEXT PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL,
      category TEXT, sort_order INTEGER DEFAULT 0, is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS neighborhoods (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      description TEXT, image TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
      phone TEXT, message TEXT, interest TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS valuation_requests (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
      phone TEXT, property_type TEXT, neighborhood TEXT,
      size_sqm REAL, bedrooms INTEGER, year_built INTEGER,
      estimated_value REAL, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS saved_searches (
      id TEXT PRIMARY KEY, user_id TEXT, name TEXT,
      filters TEXT NOT NULL DEFAULT '{}', alert_enabled INTEGER DEFAULT 0,
      alert_frequency TEXT DEFAULT 'daily', alert_channels TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  seedDefaults(d);
}

function seedDefaults(d: DatabaseSync) {
  const adminHash = '$2a$10$ROK9LYT9qu/4Vp.fVn6dFeX51dbl.UIpZgKYaTyuCyKpN/uKAIDuq';

  const count = (t: string) => (d.prepare(`SELECT COUNT(*) as c FROM ${t}`).get() as any).c;

  if (count('admin_users') === 0) {
    d.prepare(`INSERT OR IGNORE INTO admin_users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`)
      .run(genId(), 'admin@tobillionhomes.co.ke', adminHash, 'Admin', 'superadmin');
  }

  if (count('site_settings') === 0) {
    d.exec(`
      INSERT OR IGNORE INTO site_settings (id, key, value) VALUES
        ('${genId()}', 'seo_meta', '{"title":"Tobillion Homes — Premium Real Estate in Nairobi","description":"Discover premium properties across Nairobi.","keywords":"real estate, Nairobi, property, homes, Kenya"}'),
        ('${genId()}', 'contact_info', '{"phone":"+254 700 123 456","email":"info@tobillionhomes.co.ke","address":"Westlands Business Park, Nairobi, Kenya"}'),
        ('${genId()}', 'social_links', '{"facebook":"https://facebook.com/tobillionhomes","instagram":"https://instagram.com/tobillionhomes","linkedin":"https://linkedin.com/company/tobillionhomes","twitter":"https://twitter.com/tobillionhomes"}');
    `);
  }

  if (count('page_content') === 0) {
    d.exec(`
      INSERT OR IGNORE INTO page_content (id, page_key, section_key, content) VALUES
        ('${genId()}', 'home', 'hero', '{"headline":"Find Your Dream Home in Nairobi","subheadline":"Premium properties across Kenya''s capital city","cta_text":"Browse Properties","cta_link":"/properties"}'),
        ('${genId()}', 'home', 'features', '{"items":[{"title":"Expert Agents","description":"Professional guidance","icon":"user"},{"title":"Virtual Tours","description":"Explore from anywhere","icon":"cube"},{"title":"Market Insights","description":"Data-driven advice","icon":"chart"}]}'),
        ('${genId()}', 'home', 'testimonials', '{"items":[{"name":"Sarah K.","role":"Home Buyer","content":"Tobillion made finding our dream home seamless.","avatar":""}]}'),
        ('${genId()}', 'about', 'hero', '{"headline":"About Tobillion Homes","subheadline":"Nairobi''s premier real estate agency since 2018"}'),
        ('${genId()}', 'contact', 'hero', '{"headline":"Get In Touch","subheadline":"We''d love to hear from you"}'),
        ('${genId()}', 'faq', 'hero', '{"headline":"Frequently Asked Questions","subheadline":"Everything you need to know"}'),
        ('${genId()}', 'footer', 'links', '{"columns":[{"title":"Quick Links","links":[{"label":"Properties","href":"/properties"},{"label":"About","href":"/about"},{"label":"Contact","href":"/contact"}]},{"title":"Neighborhoods","links":[{"label":"Kilimani","href":"/neighborhoods/kilimani"},{"label":"Westlands","href":"/neighborhoods/westlands"},{"label":"Karen","href":"/neighborhoods/karen"}]}]}');
    `);
  }

  if (count('agents') === 0) {
    d.exec(`
      INSERT OR IGNORE INTO agents (id, name, slug, email, phone, bio, photo, title, sort_order) VALUES
        ('${genId()}', 'Grace Mwangi', 'grace-mwangi', 'grace@tobillionhomes.co.ke', '+254 712 345 678', 'Specializing in luxury residential properties in Westlands, Gigiri, and Runda with over 10 years of experience in Nairobi real estate.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80', 'Senior Property Consultant', 0),
        ('${genId()}', 'James Ochieng', 'james-ochieng', 'james@tobillionhomes.co.ke', '+254 723 456 789', 'Expert in commercial real estate and investment properties across Nairobi''s business districts.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80', 'Commercial Real Estate Advisor', 1),
        ('${genId()}', 'Sarah Kamau', 'sarah-kamau', 'sarah@tobillionhomes.co.ke', '+254 734 567 890', 'Passionate about helping first-time homebuyers find their dream homes in Kilimani, Kileleshwa, and Langata.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80', 'Residential Sales Agent', 2);
    `);
  }

  if (count('neighborhoods') === 0) {
    d.exec(`
      INSERT OR IGNORE INTO neighborhoods (id, name, slug, description, image) VALUES
        ('${genId()}', 'Kilimani', 'kilimani', 'Upscale residential area with modern amenities, excellent schools, and vibrant social scene.', '/neighborhoods/kilimani.jpg'),
        ('${genId()}', 'Westlands', 'westlands', 'Commercial and residential hub with skyscrapers, fine dining, and luxury apartments.', '/neighborhoods/westlands.jpg'),
        ('${genId()}', 'Karen', 'karen', 'Leafy suburban paradise with large plots, colonial heritage, and quiet living.', '/neighborhoods/karen.jpg'),
        ('${genId()}', 'Lavington', 'lavington', 'Prestigious neighborhood with executive homes, embassies, and top-rated schools.', '/neighborhoods/lavington.jpg'),
        ('${genId()}', 'Eastleigh', 'eastleigh', 'Bustling commercial district with affordable housing and vibrant markets.', '/neighborhoods/eastleigh.jpg'),
        ('${genId()}', 'Gigiri', 'gigiri', 'Diplomatic enclave with UN offices, ambassadors residences, and premium security.', '/neighborhoods/gigiri.jpg'),
        ('${genId()}', 'Langata', 'langata', 'Expansive suburb adjacent to Nairobi National Park, popular with nature lovers.', '/neighborhoods/langata.jpg'),
        ('${genId()}', 'Kileleshwa', 'kileleshwa', 'Serene riverside neighborhood with modern apartments and family homes.', '/neighborhoods/kileleshwa.jpg');
    `);
  }

  if (count('blog_posts') === 0) {
    d.exec(`
      INSERT OR IGNORE INTO blog_posts (id, title, slug, content, excerpt, author, category, image, tags, published, read_time, published_at) VALUES
        ('${genId()}', 'Nairobi Property Market 2026: Trends and Insights', 'nairobi-property-market-2026', 'The Nairobi property market continues to show remarkable resilience and growth in 2026. With infrastructure projects like the Nairobi Expressway and ongoing developments in satellite towns, property values have appreciated significantly.\n\nKey trends include a surge in apartment developments in Kilimani and Westlands, growing demand for gated community homes in Karen and Langata, and increased interest in commercial spaces in the CBD and Upper Hill.\n\nFor investors, the current market presents excellent opportunities, especially in emerging neighborhoods where property prices are still relatively affordable but poised for growth.', 'An in-depth look at the latest trends shaping Nairobi real estate in 2026, from infrastructure impacts to emerging neighborhoods.', 'Tobillion Homes Team', 'Market Insights', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80', '["market trends","Nairobi property","real estate 2026","investment"]', 1, 8, '2026-06-01'),
        ('${genId()}', 'Complete Guide to Buying Property in Kenya as a Foreigner', 'guide-buying-property-kenya-foreigner', 'Buying property in Kenya as a foreigner is straightforward but comes with specific legal requirements you need to understand.\n\nForeigners can own land under a 99-year leasehold arrangement, while freehold ownership is generally reserved for Kenyan citizens. The process involves due diligence, title search, sale agreement, and registration at the lands office.\n\nKey tips: Always work with a reputable lawyer, verify the title deed at the Ministry of Lands, conduct a physical inspection, and ensure all taxes (stamp duty, legal fees) are accounted for.', 'Everything you need to know about purchasing property in Kenya as a foreign investor — legal requirements, leasehold vs freehold, and step-by-step process.', 'Grace Mwangi', 'Buying Guide', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80', '["foreign buyers","legal guide","Kenya property","investment"]', 1, 10, '2026-05-15'),
        ('${genId()}', 'Top 5 Neighborhoods for Families in Nairobi', 'top-neighborhoods-families-nairobi', 'Choosing the right neighborhood for your family is one of the most important decisions you will make. Here are the top 5 family-friendly neighborhoods in Nairobi.\n\n1. Karen — Known for its spacious properties, excellent international schools, and green environment.\n2. Gigiri — Home to the UN and numerous embassies, offering top security and international community.\n3. Lavington — Quiet tree-lined streets with excellent schools and family-oriented amenities.\n4. Kileleshwa — Modern apartments and townhouses near the city center with good school access.\n5. Runda — Exclusive gated community with large gardens and premium security.', 'Discover the best neighborhoods in Nairobi for families, ranked by schools, safety, amenities, and quality of life.', 'James Ochieng', 'Neighborhood Guide', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', '["family homes","Nairobi neighborhoods","schools","safety"]', 1, 6, '2026-05-01');
    `);
  }

  if (count('faq_items') === 0) {
    d.exec(`
      INSERT OR IGNORE INTO faq_items (id, question, answer, category, sort_order, is_published) VALUES
        ('${genId()}', 'What is the process for buying property in Nairobi?', 'The buying process typically involves: 1) Property search and viewing, 2) Offer and negotiation, 3) Due diligence including title search, 4) Signing the sale agreement, 5) Payment of deposit, 6) Transfer of title at the Ministry of Lands, 7) Final payment and handover. The entire process usually takes 30-90 days.', 'Buying Process', 0, 1),
        ('${genId()}', 'How much deposit do I need to buy a home?', 'Most sellers require a 10-20% deposit upon signing the sale agreement. The balance is typically paid within 30-90 days. For mortgage financing, banks usually require a 20-30% down payment of the property value.', 'Financing', 1, 1),
        ('${genId()}', 'Are there financing options available for property purchase?', 'Yes, several options are available: bank mortgages (offered by most Kenyan banks), Sacco loans, developer financing plans, and government housing schemes like the Kenya Mortgage Refinance Company (KMRC). Most lenders require a 20-30% deposit.', 'Financing', 2, 1),
        ('${genId()}', 'What are the additional costs when buying property?', 'Additional costs include: Stamp duty (2-4% of property value), legal fees (1-2%), valuation fees, search fees, and registration fees. Budget for approximately 8-12% above the purchase price to cover these costs.', 'Buying Process', 3, 1),
        ('${genId()}', 'How do I verify a property title in Kenya?', 'Title verification involves: 1) Official search at the Ministry of Lands, 2) Confirming the seller is the registered owner, 3) Checking for any encumbrances or cautions, 4) Verifying the deed plan, 5) Confirming land rates are paid. Always work with a qualified lawyer.', 'Legal', 4, 1),
        ('${genId()}', 'What types of properties are available in Nairobi?', 'Nairobi offers diverse property types: apartments (studio, 1-3 bedroom), townhouses, bungalows, villas, maisonettes, commercial spaces, and land plots. Prices range from KES 5M for a studio apartment to KES 100M+ for luxury villas in prime neighborhoods.', 'Property Types', 5, 1);
    `);
  }

  if (count('testimonials') === 0) {
    d.exec(`
      INSERT OR IGNORE INTO testimonials (id, name, role, content, avatar, rating, sort_order, is_published) VALUES
        ('${genId()}', 'Sarah Kiprop', 'Home Buyer', 'Tobillion Homes made our dream of owning a home in Nairobi a reality. Their team guided us through every step with professionalism and care.', '', 5, 0, 1),
        ('${genId()}', 'David Mwangi', 'Property Investor', 'I have worked with several agencies over the years, but Tobillion stands out for their market knowledge and integrity. Highly recommended for serious investors.', '', 5, 1, 1),
        ('${genId()}', 'Emily Wanjiku', 'First-time Buyer', 'As a first-time buyer, I was nervous about the process. Grace held my hand through everything and found me the perfect apartment in Kileleshwa.', '', 5, 2, 1);
    `);
  }

  if (count('neighborhoods') > 0 && count('properties') === 0) {
    const hoods = d.prepare("SELECT id, slug FROM neighborhoods").all() as any[];
    const agents = d.prepare("SELECT id FROM agents").all() as any[];
    const agentId = agents[0]?.id || '';
    const getHoodId = (slug: string) => hoods.find((h: any) => h.slug === slug)?.id || '';

    const sampleProps = [
      { title: 'Modern 3-Bedroom Apartment in Kilimani', slug: 'modern-3br-kilimani', type: 'apartment', price: 18500000, bedrooms: 3, bathrooms: 2, area: 120, featured: 1, hood: 'kilimani', desc: 'Stunning modern apartment in the heart of Kilimani featuring an open-plan living area, modern kitchen with granite countertops, spacious bedrooms with built-in wardrobes, and a balcony with city views. The complex offers a gym, swimming pool, and 24-hour security.', location: 'Argwings Kodhek Road', address: 'Argwings Kodhek Road, Kilimani', images: '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80","https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80"]', amenities: '["Swimming Pool","Gym","24hr Security","Parking","Generator","CCTV"]', features: '["Wardrobes","Granite Tops","Tiled Floors","Balcony","DSQ"]', lat: -1.2813, lng: 36.8001, year_built: 2022, verified: 1, rating: 4.5, review_count: 12 },
      { title: 'Luxury 4-Bedroom Villa in Karen', slug: 'luxury-4br-karen', type: 'house', price: 45000000, bedrooms: 4, bathrooms: 3, area: 250, featured: 1, hood: 'karen', desc: 'Exquisite stand-alone villa set on a half-acre plot in serene Karen. Features include a spacious living and dining area, modern kitchen, master ensuite with walk-in closet, landscaped garden with mature trees, and a private swimming pool.', location: 'Langata Road', address: 'Langata Road, Karen', images: '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80","https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80"]', amenities: '["Private Pool","Garden","Staff Quarters","Borehole","Solar","Carport for 3"]', features: '["Ensuite Master","Walk-in Closet","Landscaped Garden","DSQ","Store"]', lat: -1.3329, lng: 36.7187, year_built: 2020, verified: 1, rating: 4.8, review_count: 8 },
      { title: 'Executive 2-Bedroom Apartment in Westlands', slug: 'executive-2br-westlands', type: 'apartment', price: 22000000, bedrooms: 2, bathrooms: 2, area: 95, featured: 1, hood: 'westlands', desc: 'Premium executive apartment on the 15th floor with breathtaking city views. Features include a fully fitted modern kitchen, spacious living area, master ensuite, and access to rooftop infinity pool and gym.', location: 'Riverside Drive', address: 'Riverside Drive, Westlands', images: '["https://images.unsplash.com/photo-1545324418-cc1e3fa86d14?w=600&q=80","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80"]', amenities: '["Rooftop Pool","Gym","Concierge","Valet Parking","Sauna","Rooftop Terrace"]', features: '["City Views","Ensuite","Wardrobes","AC","Generator"]', lat: -1.2657, lng: 36.8074, year_built: 2023, verified: 1, rating: 4.6, review_count: 15 },
      { title: 'Charming 3-Bedroom Bungalow in Lavington', slug: 'charming-3br-lavington', type: 'house', price: 32000000, bedrooms: 3, bathrooms: 2, area: 180, featured: 0, hood: 'lavington', desc: 'Well-maintained bungalow on a quiet leafy street in Lavington. Offers spacious living areas, a modern kitchen, lovely garden with patio, and ample parking. Ideal for a family seeking tranquility near the city.', location: 'James Gichuru Road', address: 'James Gichuru Road, Lavington', images: '["https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&q=80","https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=600&q=80","https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80"]', amenities: '["Garden","Parking","Water Tank","Security Lights","DSQ"]', features: '["Fireplace","Wooden Floors","Patio","Store","Veranda"]', lat: -1.2756, lng: 36.7792, year_built: 2018, verified: 1, rating: 4.3, review_count: 6 },
      { title: 'Affordable 1-Bedroom Apartment in Kileleshwa', slug: 'affordable-1br-kileleshwa', type: 'apartment', price: 8500000, bedrooms: 1, bathrooms: 1, area: 55, featured: 0, hood: 'kileleshwa', desc: 'Cozy and affordable 1-bedroom apartment in a well-managed complex in Kileleshwa. Ideal for young professionals or investors. Features open-plan living, fitted kitchen, and a small balcony.', location: 'Muthithi Road', address: 'Muthithi Road, Kileleshwa', images: '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"]', amenities: '["Parking","Security","Water","Garbage Collection"]', features: '["Fitted Kitchen","Balcony","Wardrobe","Tiled Floors"]', lat: -1.2759, lng: 36.7883, year_built: 2021, verified: 0, rating: 4.0, review_count: 3 },
      { title: 'Prime Commercial Space in Westlands', slug: 'prime-commercial-westlands', type: 'commercial', price: 58000000, bedrooms: 0, bathrooms: 2, area: 200, featured: 0, hood: 'westlands', desc: 'Premium commercial space on the ground floor of a prime Westlands building. High foot traffic area, perfect for a restaurant, retail store, or office. Fitted with modern finishes and parking for clients.', location: 'Woodvale Grove', address: 'Woodvale Grove, Westlands', images: '["https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80","https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80"]', amenities: '["Client Parking","Security","Generator","Store Room"]', features: '["Shop Front","Display Windows","Office Space","Store","WC"]', lat: -1.2648, lng: 36.8065, year_built: 2019, verified: 1, rating: 4.2, review_count: 4 },
    ];

    for (const p of sampleProps) {
      const hoodId = getHoodId(p.hood);
      d.prepare(`INSERT OR IGNORE INTO properties
        (id, title, slug, description, price, currency, type, status, location, address, neighborhood, bedrooms, bathrooms, area, area_unit, year_built, featured, verified, images, amenities, features, lat, lng, agent_id, rating, review_count)
        VALUES (?, ?, ?, ?, ?, 'KES', ?, 'available', ?, ?, ?, ?, ?, ?, 'sqm', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(genId(), p.title, p.slug, p.desc, p.price, p.type, p.location, p.address, hoodId, p.bedrooms, p.bathrooms, p.area, p.year_built, p.featured, p.verified, p.images, p.amenities, p.features, p.lat, p.lng, agentId, p.rating, p.review_count);
    }
  }
}

function genId(): string { return crypto.randomUUID(); }

function sanitizeValue(val: any): any {
  if (val === undefined) return null;
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
    try { return JSON.stringify(val); } catch { return String(val); }
  }
  return val;
}

function splitSelectParts(selectStr: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of selectStr) {
    if (ch === '(') { depth++; current += ch; }
    else if (ch === ')') { depth--; current += ch; }
    else if (ch === ',' && depth === 0) { parts.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  const last = current.trim();
  if (last) parts.push(last);
  return parts;
}

function parseJoinColumns(selectStr: string): { mainCols: string[]; joins: { alias: string; table: string; cols: string }[] } {
  const joins: { alias: string; table: string; cols: string }[] = [];
  const parts = splitSelectParts(selectStr);
  const mainCols: string[] = [];
  for (const part of parts) {
    const joinMatch = part.match(/^(\w+):(\w+)\((.*)\)$/);
    if (joinMatch) {
      joins.push({ alias: joinMatch[1], table: joinMatch[2], cols: joinMatch[3] || '*' });
    } else {
      const bareJoin = part.match(/^(\w+)\((.*)\)$/);
      if (bareJoin) {
        joins.push({ alias: bareJoin[1], table: bareJoin[1], cols: bareJoin[2] || '*' });
      } else {
        mainCols.push(part);
      }
    }
  }
  return { mainCols, joins };
}

function parseOrFilter(filterStr: string): string {
  return filterStr.split(',').map(c => c.trim()).map(cond => {
    const match = cond.match(/^(\w+)\.ilike\.%(.*)%$/);
    if (match) return `${match[1]} LIKE '%${match[2].replace(/'/g, "''")}%'`;
    return cond;
  }).join(' OR ');
}

class RpcRef {
  constructor(public fn: string, public params?: any) {}
}

type FilterDef = [string, string, any];

class QueryBuilder {
  private table: string;
  private mode: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private columns: string = '*';
  private countMode: boolean = false;
  private filters: FilterDef[] = [];
  private orFilters: string[] = [];
  private orderCol: string | null = null;
  private orderAsc: boolean = true;
  private limitN: number | null = null;
  private rangeStart: number | null = null;
  private rangeEnd: number | null = null;
  private singleResult: boolean = false;
  private insertData: any = null;
  private updateData: any = null;
  private upsertData: any = null;
  private upsertConflictCol: string | null = null;
  private deleteMode: boolean = false;
  private joins: { alias: string; table: string; cols: string }[] = [];
  private mainSelectCols: string[] = ['*'];

  constructor(table: string) { this.table = table; }

  select(columns?: string, options?: { count?: 'exact' | 'planned' | 'estimated' }): this {
    if (this.mode !== 'insert' && this.mode !== 'update' && this.mode !== 'upsert') {
      this.mode = 'select';
    }
    this.columns = columns || '*';
    this.countMode = options?.count === 'exact';
    const parsed = parseJoinColumns(this.columns);
    this.mainSelectCols = parsed.mainCols.length > 0 ? parsed.mainCols : ['*'];
    this.joins = parsed.joins;
    return this;
  }

  insert(data: any, _options?: any): this { this.mode = 'insert'; this.insertData = data; return this; }

  update(data: any): this { this.mode = 'update'; this.updateData = data; return this; }

  delete(): this { this.mode = 'delete'; this.deleteMode = true; return this; }

  upsert(data: any, options?: { onConflict?: string }): this {
    this.mode = 'upsert'; this.upsertData = data;
    this.upsertConflictCol = options?.onConflict || null;
    return this;
  }

  eq(col: string, val: any): this { this.filters.push([col, '=', val]); return this; }
  neq(col: string, val: any): this { this.filters.push([col, '!=', val]); return this; }
  gt(col: string, val: any): this { this.filters.push([col, '>', val]); return this; }
  gte(col: string, val: any): this { this.filters.push([col, '>=', val]); return this; }
  lt(col: string, val: any): this { this.filters.push([col, '<', val]); return this; }
  lte(col: string, val: any): this { this.filters.push([col, '<=', val]); return this; }
  in(col: string, vals: any[]): this { if (vals.length > 0) this.filters.push([col, 'IN', vals]); return this; }

  or(filterStr: string): this { this.orFilters.push(filterStr); return this; }

  order(col: string, opts?: { ascending?: boolean }): this {
    this.orderCol = col; this.orderAsc = opts?.ascending !== false; return this;
  }

  limit(n: number): this { this.limitN = n; return this; }
  range(from: number, to: number): this { this.rangeStart = from; this.rangeEnd = to; return this; }
  single(): this { this.singleResult = true; return this; }

  then(resolve: any, _reject?: any): any {
    const result = this.execute();
    return resolve ? resolve(result) : result;
  }

  private buildWhereClause(params: any[], prefixCols = false): string {
    const clauses: string[] = [];
    for (const [col, op, val] of this.filters) {
      const prefixed = prefixCols ? `${this.table}.${col}` : col;
      if (op === 'IN') {
        const placeholders = (val as any[]).map(() => '?').join(',');
        clauses.push(`${prefixed} IN (${placeholders})`);
        for (const v of val) params.push(sanitizeValue(v));
      } else {
        clauses.push(`${prefixed} ${op} ?`);
        params.push(sanitizeValue(val));
      }
    }
    for (const orStr of this.orFilters) {
      clauses.push(`(${parseOrFilter(orStr)})`);
    }
    return clauses.length > 0 ? 'WHERE ' + clauses.join(' AND ') : '';
  }

  private buildSelectSQL(params: any[]): string {
    let cols: string;
    if (this.mainSelectCols.includes('*') && this.joins.length > 0) {
      const d = getDb();
      const mainCols = this.getTableColumns(d, this.table);
      cols = mainCols.map(c => `${this.table}.${c}`).join(', ');
    } else {
      cols = this.mainSelectCols.join(', ');
    }
    let fromClause = `FROM ${this.table}`;
    for (const j of this.joins) {
      const fkMap: Record<string, string> = {
        price_history: 'property_id', neighborhoods: 'neighborhood',
        agents: 'agent_id', admin_users: 'user_id',
      };
      const fk = fkMap[j.table] || `${j.table.slice(0, -1)}_id`;
      fromClause += ` LEFT JOIN ${j.table} AS ${j.alias} ON ${this.table}.${fk} = ${j.alias}.id`;
      const d = getDb();
      const joinCols = this.getTableColumns(d, j.table);
      for (const col of joinCols) {
        cols += `, ${j.alias}.${col} AS "${j.alias}_${col}"`;
      }
    }
    const hasJoins = this.joins.length > 0;
    const whereClause = this.buildWhereClause(params, hasJoins);
    const orderCol = hasJoins ? `${this.table}.${this.orderCol}` : this.orderCol;
    const orderClause = this.orderCol ? ` ORDER BY ${orderCol} ${this.orderAsc ? 'ASC' : 'DESC'}` : '';
    let limitClause = '';
    if (this.rangeStart !== null) {
      limitClause = ` LIMIT ${sanitizeValue(this.rangeEnd! - this.rangeStart! + 1)} OFFSET ${sanitizeValue(this.rangeStart)}`;
    } else if (this.limitN !== null) {
      limitClause = ` LIMIT ${sanitizeValue(this.limitN)}`;
    }
    return `SELECT ${cols} ${fromClause} ${whereClause}${orderClause}${limitClause}`;
  }

  private execute(): { data: any; count?: number; error: any } {
    try {
      const d = getDb();

      if (this.mode === 'insert' || this.mode === 'upsert') {
        return this.doInsert(d);
      }
      if (this.mode === 'update') {
        return this.doUpdate(d);
      }
      if (this.mode === 'delete') {
        return this.doDelete(d);
      }
      return this.doSelect(d);
    } catch (e: any) {
      return { data: null, count: undefined, error: { message: e.message || 'Database error' } };
    }
  }

  private tableHasColumn(d: DatabaseSync, col: string): boolean {
    const info = d.prepare(`PRAGMA table_info(${this.table})`).all() as any[];
    return info.some((r: any) => r.name === col);
  }

  private getTableColumns(d: DatabaseSync, table: string): string[] {
    const info = d.prepare(`PRAGMA table_info(${table})`).all() as any[];
    return info.map((r: any) => r.name);
  }

  private doInsert(d: DatabaseSync) {
    const raw = this.mode === 'upsert' ? this.upsertData : this.insertData;
    const entry = Array.isArray(raw) ? raw[0] : raw;
    if (!entry) return { data: null, error: { message: 'No data provided' } };

    const hasIdCol = this.tableHasColumn(d, 'id');
    const cols: string[] = [];
    const placeholders: string[] = [];
    const vals: any[] = [];
    const hasId = entry.id != null;

    if (!hasId && hasIdCol) { cols.push('id'); placeholders.push('?'); vals.push(genId()); }
    for (const [key, value] of Object.entries(entry)) {
      if (key === 'id' && !hasId && hasIdCol) continue;
      cols.push(key);
      placeholders.push('?');
      vals.push(sanitizeValue(value));
    }

    let sql: string;
    if (this.mode === 'upsert' && this.upsertConflictCol) {
      const updates = cols.filter(c => c !== this.upsertConflictCol && c !== 'id')
        .map(c => `${c}=excluded.${c}`).join(',');
      sql = `INSERT INTO ${this.table} (${cols.join(',')}) VALUES (${placeholders.join(',')})
             ON CONFLICT(${this.upsertConflictCol}) DO UPDATE SET ${updates}`;
    } else {
      sql = `INSERT INTO ${this.table} (${cols.join(',')}) VALUES (${placeholders.join(',')})`;
    }
    d.prepare(sql).run(...vals);

    const idVal = hasId ? entry.id : (hasIdCol ? vals[0] : null);
    const selectCols = this.columns && this.columns !== '*' ? this.columns : '*';

    if (this.joins.length > 0) {
      const params: any[] = [];
      params.push(idVal);
      const sql2 = this.buildSelectSQL(params).replace(/\?/g, `'${idVal}'`);
      const rows = (d.prepare(sql2).all() as any[]).map(r => this.parseRow(r));
      return { data: this.singleResult ? (rows[0] || null) : rows, error: null };
    }

    let row: any = null;
    if (this.upsertConflictCol && entry[this.upsertConflictCol] != null) {
      row = this.parseRow(d.prepare(`SELECT ${selectCols} FROM ${this.table} WHERE ${this.upsertConflictCol}=?`).get(entry[this.upsertConflictCol]));
    } else if (idVal && this.tableHasColumn(d, 'id')) {
      row = this.parseRow(d.prepare(`SELECT ${selectCols} FROM ${this.table} WHERE id=?`).get(idVal));
    } else if (entry.token) {
      row = this.parseRow(d.prepare(`SELECT ${selectCols} FROM ${this.table} WHERE token=?`).get(entry.token));
    }
    return { data: this.singleResult ? (row || null) : row ? [row] : [], error: null };
  }

  private doUpdate(d: DatabaseSync) {
    const data = this.updateData;
    if (!data) return { data: null, error: { message: 'No data provided' } };

    const setCols: string[] = [];
    const setVals: any[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof RpcRef) {
        if (value.fn === 'increment') { setCols.push(`${key}=COALESCE(${key},0)+1`); }
        else { setCols.push(`${key}=?`); setVals.push(sanitizeValue(value)); }
      } else {
        setCols.push(`${key}=?`);
        setVals.push(sanitizeValue(value));
      }
    }

    const whereParams: any[] = [];
    const whereClause = this.buildWhereClause(whereParams);
    d.prepare(`UPDATE ${this.table} SET ${setCols.join(',')} ${whereClause}`).run(...setVals, ...whereParams);

    const selectParams: any[] = [];
    const sql = `SELECT ${this.columns || '*'} FROM ${this.table} ${this.buildWhereClause(selectParams)}`;
    const rows = (d.prepare(sql).all(...selectParams) as any[]).map(r => this.parseRow(r));
    return { data: this.singleResult ? (rows[0] || null) : rows, error: null };
  }

  private doDelete(d: DatabaseSync) {
    const params: any[] = [];
    const whereClause = this.buildWhereClause(params);
    d.prepare(`DELETE FROM ${this.table} ${whereClause}`).run(...params);
    return { data: null, error: null };
  }

  private parseRow(row: any): any {
    if (!row || typeof row !== 'object') return row;
    const parsed: any = {};
    for (const [key, val] of Object.entries(row)) {
      if (typeof val === 'string' && val.length > 1 && (val[0] === '{' || val[0] === '[')) {
        try { parsed[key] = JSON.parse(val); } catch { parsed[key] = val; }
      } else {
        parsed[key] = val;
      }
    }
    return parsed;
  }

  private doSelect(d: DatabaseSync) {
    const params: any[] = [];
    const sql = this.buildSelectSQL(params);
    const rows = (d.prepare(sql).all(...params) as any[]).map(r => this.parseRow(r));

    let count: number | undefined;
    if (this.countMode) {
      const cp: any[] = [];
      const csql = `SELECT COUNT(*) as cnt FROM ${this.table} ${this.buildWhereClause(cp)}`;
      const r = d.prepare(csql).get(...cp) as any;
      count = r?.cnt || 0;
    }

    return {
      data: this.singleResult ? (rows[0] || null) : rows,
      count,
      error: null,
    };
  }
}

class StorageBuilder {
  private bucket: string;
  constructor(bucket: string) { this.bucket = bucket; }

  upload(filename: string, buffer: Buffer, _options?: any) {
    try {
      const fullPath = path.join(UPLOAD_DIR, filename);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, buffer);
      return { data: { path: filename, fullPath }, error: null };
    } catch (e: any) {
      return { data: null, error: { message: e.message } };
    }
  }

  getPublicUrl(filePath: string) {
    const url = `/uploads/${filePath}`;
    return { data: { publicUrl: url } };
  }
}

class StorageApi {
  from(bucket: string) { return new StorageBuilder(bucket); }
}

const adminClient = {
  from(table: string) { return new QueryBuilder(table); },
  storage: new StorageApi(),
  rpc(fn: string, params?: any) {
    if (fn === 'increment') return new RpcRef('increment');
    return { data: null, error: null };
  },
};

const mockChain = new Proxy({} as any, {
  get(_t: any, p: string) {
    if (p === 'then' || p === 'catch') return undefined;
    return (..._a: any[]) => mockChain;
  },
});

export const supabaseAdmin = new Proxy(adminClient, {
  get(target: any, prop: string) {
    if (prop in target) return target[prop];
    return (...args: any[]) => {
      if (process.env.NEXT_PHASE === 'phase-production-build') return mockChain;
      throw new Error(`supabaseAdmin.${prop} not implemented in SQLite mode`);
    };
  },
});
