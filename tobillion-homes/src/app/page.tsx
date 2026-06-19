'use client';

import { Hero } from '@/components/layout/Hero';
import { SearchFilters } from '@/components/ui/SearchFilters';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { BubbleTestimonials } from '@/components/ui/BubbleTestimonial';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { HubSpotForm } from '@/components/forms/HubSpotForm';
import { fetchProperties, fetchBlogPosts, fetchPageContent } from '@/lib/client-data';
import { SearchFilters as SearchFiltersType, Property, BlogPost } from '@/types';
import { HiArrowRight, HiStar, HiShieldCheck, HiShieldExclamation, HiUser, HiCube, HiChartBar } from 'react-icons/hi';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Spinner from '@/components/ui/Spinner';

export default function HomePage() {
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [heroContent, setHeroContent] = useState<any>(null);
  const [featuresContent, setFeaturesContent] = useState<any[]>([]);
  const [testimonialsContent, setTestimonialsContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Find Your Dream Home in Nairobi';
    loadData();
  }, []);

  const loadData = async () => {
    const [props, posts, pages] = await Promise.all([
      fetchProperties({ featured: true, limit: 8 }),
      fetchBlogPosts(),
      fetchPageContent('home'),
    ]);
    setFilteredProperties(props);
    setBlogPosts(posts);
    const hero = pages.find((p: any) => p.section_key === 'hero');
    if (hero) setHeroContent(hero.content);
    const features = pages.find((p: any) => p.section_key === 'features');
    if (features?.content?.items) setFeaturesContent(features.content.items);
    const testimonials = pages.find((p: any) => p.section_key === 'testimonials');
    if (testimonials?.content?.items) setTestimonialsContent(testimonials.content.items);
    setLoading(false);
  };

  const handleFilter = async (filters: SearchFiltersType) => {
    setLoading(true);
    const results = await fetchProperties({
      type: filters.type,
      neighborhood: filters.neighborhood,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      bedrooms: filters.bedrooms,
      status: 'available',
    });
    let filtered = results;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.neighborhood.name.toLowerCase().includes(q)
      );
    }
    setFilteredProperties(filtered);
    setLoading(false);
  };

  return (
    <>
      <Hero content={heroContent} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-3">Search Properties in Nairobi</h2>
          <p className="text-gray-500 italic"><em>Find your perfect home across Kenya&apos;s capital</em></p>
        </div>
        <SearchFilters onFilter={handleFilter} />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-900">Featured Properties</h2>
            <p className="text-gray-500 text-sm mt-1">{filteredProperties.length} properties found</p>
          </div>
          <Link href="/properties" className="text-emerald-700 font-semibold text-sm hover:text-gold-500 transition-colors flex items-center gap-1">
            View All <HiArrowRight />
          </Link>
        </div>
        {loading ? (
          <Spinner text="Loading properties..." />
        ) : (
          <MosaicGrid>
            {filteredProperties.slice(0, 4).map((property) => (
              <div key={property.id} className={property.featured ? 'col-span-6 md:col-span-4' : 'col-span-6 md:col-span-3'}>
                <PropertyCard property={property} variant={property.featured ? 'featured' : 'default'} />
              </div>
            ))}
            {filteredProperties.slice(4, 8).map((property) => (
              <div key={property.id} className="col-span-6 md:col-span-3">
                <PropertyCard property={property} />
              </div>
            ))}
          </MosaicGrid>
        )}
      </section>

      <section className="bg-emerald-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4">
                Why Choose Us?
              </h2>
              <p className="text-gray-600 mb-8">
                We are Nairobi&apos;s most trusted real estate agency, combining deep local knowledge with modern technology.
              </p>
              <ul className="space-y-4">
                {(featuresContent.length > 0 ? featuresContent : [
                  { title: 'Verified Properties', desc: 'Every listing is physically verified by our team before going live', icon: 'star' },
                  { title: 'Secure Transactions', desc: 'End-to-end legal support and secure payment processing for peace of mind', icon: 'shield' },
                  { title: 'Market Expertise', desc: '8+ years of Nairobi real estate experience across all neighborhoods', icon: 'chart' },
                  { title: 'Client Protection', desc: 'Full due diligence, title verification, and fraud prevention included', icon: 'shield-ex' },
                ]).map((item: any, idx: number) => {
                  const IconMap: Record<string, any> = { star: HiStar, shield: HiShieldCheck, chart: HiChartBar, 'shield-ex': HiShieldExclamation, user: HiUser, cube: HiCube };
                  const Icon = IconMap[item.icon] || HiArrowRight;
                  return (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-5 h-5 text-gold-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </li>
                  );
                })}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-100">
              <HubSpotForm
                title="Schedule a Free Consultation"
                subtitle="Speak with our expert team about your property needs"
                submitLabel="Book Free Consultation"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-900 mb-2">Nairobi Neighborhoods</h2>
          <p className="text-gray-500 italic mb-8"><em>Explore properties in Nairobi&apos;s most desirable areas</em></p>
          <MosaicGrid>
            {[
              { name: 'Kilimani', slug: 'kilimani', img: 'https://images.unsplash.com/photo-1570168009545-3e5a0c0d45d0?w=600&q=80', price: 'KES 15M avg' },
              { name: 'Westlands', slug: 'westlands', img: 'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=600&q=80', price: 'KES 25M avg' },
              { name: 'Karen', slug: 'karen', img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80', price: 'KES 35M avg' },
              { name: 'Lavington', slug: 'lavington', img: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&q=80', price: 'KES 28M avg' },
              { name: 'Gigiri', slug: 'gigiri', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80', price: 'KES 40M avg' },
              { name: 'Kileleshwa', slug: 'kileleshwa', img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80', price: 'KES 18M avg' },
            ].map((hood, i) => (
              <Link
                key={hood.slug}
                href={`/neighborhoods/${hood.slug}`}
                className={`relative rounded-xl overflow-hidden group hover-card ${i === 0 ? 'col-span-6 md:col-span-6 row-span-2' : 'col-span-6 md:col-span-3'}`}
              >
                <div className="aspect-[16/10] bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${hood.img})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg">{hood.name}</h3>
                  <p className="text-emerald-300 text-sm">{hood.price}</p>
                </div>
              </Link>
            ))}
          </MosaicGrid>
        </div>
      </section>

      <BubbleTestimonials items={testimonialsContent.length > 0 ? testimonialsContent : undefined} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-900">Latest from Our Blog</h2>
            <p className="text-gray-500 text-sm mt-1">Nairobi property insights and guides</p>
          </div>
          <Link href="/blog" className="text-emerald-700 font-semibold text-sm hover:text-gold-500 transition-colors flex items-center gap-1">
            All Posts <HiArrowRight />
          </Link>
        </div>
        <MosaicGrid>
          {blogPosts.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className={`group ${i === 0 ? 'col-span-6 md:col-span-7' : 'col-span-6 md:col-span-5'}`}
            >
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl overflow-hidden border border-emerald-100 hover-card h-full"
              >
                <div className="aspect-[16/9] bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${post.image})` }}
                />
                <div className="p-5">
                  <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-2 mb-1 group-hover:text-emerald-700 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span>{post.readTime} min read</span>
                    <span>·</span>
                    <span>{post.author}</span>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </MosaicGrid>
      </section>

      <section className="bg-emerald-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to Find Your Dream Home?</h2>
          <p className="text-emerald-200 italic mb-6 max-w-xl mx-auto">
            <em>Our expert team is ready to help you find the perfect property in Nairobi.</em>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-emerald-800 px-6 py-3 rounded-xl font-semibold hover:scale-105 border-2 border-gold-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300"
            >
              Contact Us Today <HiArrowRight />
            </Link>
            <Link
              href="/valuation"
              className="inline-flex items-center gap-2 border-2 border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
            >
              Get a Free Valuation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
