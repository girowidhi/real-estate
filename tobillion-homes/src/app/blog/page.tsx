'use client';

import { useState, useEffect } from 'react';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CTASection } from '@/components/ui/CTASection';
import { fetchBlogPosts } from '@/lib/client-data';
import { BlogPost } from '@/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Spinner from '@/components/ui/Spinner';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Blog | Nairobi Property Insights';
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const posts = await fetchBlogPosts();
    setAllPosts(posts);
    setFilteredPosts(posts);
    setLoading(false);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      setFilteredPosts(allPosts);
    } else {
      setFilteredPosts(allPosts.filter(p => p.category === cat));
    }
  };

  const categories = ['All', ...new Set(allPosts.map(p => p.category))];

  return (
    <>
      <section className="bg-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">Blog</h1>
          <p className="text-gray-500 italic"><em>Nairobi property insights, neighborhood guides, and market trends</em></p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                activeCategory === cat ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner text="Loading posts..." />
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No posts in this category yet.</p>
            <button onClick={() => handleCategoryChange('All')} className="text-emerald-700 font-semibold mt-2 hover:underline">View all posts</button>
          </div>
        ) : (
          <MosaicGrid>
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`col-span-6 ${i === 0 ? 'md:col-span-8' : 'md:col-span-4'}`}
              >
                <Link href={`/blog/${post.slug}`} className="block group">
                  <article className="bg-white rounded-2xl overflow-hidden border border-emerald-100 hover-card h-full">
                    <div className={`bg-cover bg-center transition-transform duration-500 group-hover:scale-105 ${i === 0 ? 'aspect-[21/9]' : 'aspect-[16/10]'}`}
                      style={{ backgroundImage: `url(${post.image})` }}
                    />
                    <div className="p-5">
                      <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-2 py-1 rounded-full">{post.category}</span>
                      <h2 className="font-bold text-gray-900 mt-2 mb-1 group-hover:text-emerald-700 transition-colors">{post.title}</h2>
                      <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                        <span>{post.readTime} min read</span>
                        <span>·</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>·</span>
                        <span>{post.author}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </MosaicGrid>
        )}
      </section>

      <CTASection
        title="Stay Updated with Nairobi Property News"
        subtitle="Subscribe to our newsletter for weekly market updates and new listings"
        primaryLabel="Subscribe Now"
        primaryHref="/contact"
        secondaryLabel="Browse Properties"
        secondaryHref="/properties"
      />
    </>
  );
}
