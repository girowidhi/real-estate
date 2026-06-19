export const COMPANY = {
  name: 'Tobillion Homes',
  tagline: 'Find Your Dream Home in Nairobi',
  phone: '+254 700 123 456',
  email: 'info@tobillionhomes.co.ke',
  address: 'Westlands Business Park, Nairobi, Kenya',
  registration: 'TBN-2024-REG-001245',
  social: {
    facebook: 'https://facebook.com/tobillionhomes',
    instagram: 'https://instagram.com/tobillionhomes',
    twitter: 'https://twitter.com/tobillionhomes',
    linkedin: 'https://linkedin.com/company/tobillionhomes',
  },
  hubspotPortalId: process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || '',
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001/admin',
};

export const NEIGHBORHOODS = [
  { slug: 'kilimani', name: 'Kilimani', description: 'Upscale residential area with modern amenities, excellent schools, and vibrant social scene.', avgPrice: 15000000, lat: -1.2813, lng: 36.8001, image: '/neighborhoods/kilimani.jpg' },
  { slug: 'westlands', name: 'Westlands', description: 'Commercial and residential hub with skyscrapers, fine dining, and luxury apartments.', avgPrice: 25000000, lat: -1.2657, lng: 36.8074, image: '/neighborhoods/westlands.jpg' },
  { slug: 'karen', name: 'Karen', description: 'Leafy suburban paradise with large plots, colonial heritage, and quiet living.', avgPrice: 35000000, lat: -1.3329, lng: 36.7187, image: '/neighborhoods/karen.jpg' },
  { slug: 'lavington', name: 'Lavington', description: 'Prestigious neighborhood with executive homes, embassies, and top-rated schools.', avgPrice: 28000000, lat: -1.2756, lng: 36.7792, image: '/neighborhoods/lavington.jpg' },
  { slug: 'eastleigh', name: 'Eastleigh', description: 'Bustling commercial district with affordable housing and vibrant markets.', avgPrice: 8000000, lat: -1.2628, lng: 36.8558, image: '/neighborhoods/eastleigh.jpg' },
  { slug: 'gigiri', name: 'Gigiri', description: 'Diplomatic enclave with UN offices, ambassadors residences, and premium security.', avgPrice: 40000000, lat: -1.2308, lng: 36.8063, image: '/neighborhoods/gigiri.jpg' },
  { slug: 'langata', name: 'Langata', description: 'Expansive suburb adjacent to Nairobi National Park, popular with nature lovers.', avgPrice: 12000000, lat: -1.3595, lng: 36.7392, image: '/neighborhoods/langata.jpg' },
  { slug: 'kileleshwa', name: 'Kileleshwa', description: 'Serene riverside neighborhood with modern apartments and family homes.', avgPrice: 18000000, lat: -1.2759, lng: 36.7883, image: '/neighborhoods/kileleshwa.jpg' },
  { slug: 'runda', name: 'Runda', description: 'Exclusive gated community with luxury villas and lush gardens.', avgPrice: 45000000, lat: -1.2352, lng: 36.8222, image: '/neighborhoods/runda.jpg' },
  { slug: 'parklands', name: 'Parklands', description: 'Cosmopolitan neighborhood with diverse dining, shopping, and modern living.', avgPrice: 22000000, lat: -1.2593, lng: 36.8150, image: '/neighborhoods/parklands.jpg' },
];

export const AMENITIES_LIST = [
  'Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Garden',
  'CCTV', 'Generator', 'Water Tank', 'Clubhouse', 'Children Play Area',
  'Elevator', 'Serviced', 'Furnished', 'Balcony', 'Rooftop Terrace',
  'Visitor Parking', 'Staff Quarters', 'Wine Cellar', 'Home Theater',
  'Smart Home System',
];

export const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export const BEDROOM_OPTIONS = [
  { value: 1, label: '1 Bedroom' },
  { value: 2, label: '2 Bedrooms' },
  { value: 3, label: '3 Bedrooms' },
  { value: 4, label: '4 Bedrooms' },
  { value: 5, label: '5+ Bedrooms' },
];
