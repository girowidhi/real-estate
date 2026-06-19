'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchBlogPostBySlug, fetchBlogPosts } from '@/lib/client-data';
import { BlogPost } from '@/types';
import Link from 'next/link';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HubSpotForm } from '@/components/forms/HubSpotForm';
import Spinner from '@/components/ui/Spinner';

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [params.slug]);

  const loadPost = async () => {
    setLoading(true);
    const p = await fetchBlogPostBySlug(params.slug as string);
    setPost(p);
    if (p) {
      document.title = `${p.title}`;
      const related = await fetchBlogPosts(p.category);
      setRelatedPosts(related.filter(b => b.id !== p.id).slice(0, 3));
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <Spinner text="Loading post..." />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-bold text-emerald-900 mb-2">Post Not Found</p>
        <Link href="/blog" className="text-emerald-700 font-semibold hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <>
      <section className="bg-emerald-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: post.title },
          ]} />
          <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-2 py-1 rounded-full">{post.category}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mt-3 mb-3">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
            <span>By {post.author}</span>
            <span>·</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span>{post.readTime} min read</span>
          </div>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="aspect-[21/9] rounded-2xl bg-cover bg-center mb-8 shadow-lg"
          style={{ backgroundImage: `url(${post.image})` }}
        />

        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 leading-relaxed mb-6 italic font-medium">
            <em>{post.excerpt}</em>
          </p>

          {post.content.split('\n\n').filter(Boolean).map((paragraph, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>
          ))}

          <div className="bg-emerald-50 rounded-2xl p-6 my-8 border-l-4 border-gold-400">
            <p className="text-emerald-900 font-semibold mb-2">📞 Need personalized advice?</p>
            <p className="text-sm text-gray-600">
              Contact us for expert guidance on buying, selling, or renting property in Nairobi. 
              Our team is ready to help you make informed decisions.
            </p>
            <Link href="/contact" className="inline-block mt-3 text-emerald-700 font-semibold hover:text-gold-500 transition-colors">
              Contact Our Team →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-default">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-emerald-100 pt-8 mt-8">
          <div className="bg-white rounded-2xl border border-emerald-100 p-6">
            <HubSpotForm
              compact
              title="Download the Full Guide"
              subtitle="Get the complete article with detailed pricing data and expert tips delivered to your inbox"
              submitLabel="Download PDF Guide"
            />
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-900 mb-6">Related Articles</h2>
          <MosaicGrid>
            {relatedPosts.map((rp) => (
              <div key={rp.id} className="col-span-6 md:col-span-4">
                <Link href={`/blog/${rp.slug}`} className="block group">
                  <article className="bg-white rounded-xl overflow-hidden border border-emerald-100 hover-card h-full">
                    <div className="aspect-[16/10] bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${rp.image})` }}
                    />
                    <div className="p-4">
                      <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full">{rp.category}</span>
                      <h3 className="font-bold text-gray-900 mt-2 group-hover:text-emerald-700 transition-colors line-clamp-2">{rp.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{rp.readTime} min read</p>
                    </div>
                  </article>
                </Link>
              </div>
            ))}
          </MosaicGrid>
        </section>
      )}

      <section className="bg-emerald-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to Find Your Nairobi Home?</h2>
          <p className="text-emerald-200 italic mb-6"><em>Browse our curated selection of premium properties across Nairobi</em></p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/properties" className="bg-white text-emerald-800 px-6 py-3 rounded-xl font-semibold hover:scale-105 border-2 border-gold-400 transition-all duration-300">
              Browse Properties
            </Link>
            <Link href="/contact" className="border-2 border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
