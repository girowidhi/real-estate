import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/alerts', '/saved'],
    },
    sitemap: 'https://tobillionhomes.co.ke/sitemap.xml',
  };
}
