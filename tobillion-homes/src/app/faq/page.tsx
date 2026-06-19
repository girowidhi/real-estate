'use client';

import { useState, useEffect } from 'react';
import { fetchFAQItems } from '@/lib/client-data';
import { FAQItem } from '@/types';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CTASection } from '@/components/ui/CTASection';
import { HubSpotForm } from '@/components/forms/HubSpotForm';
import { HiChevronDown, HiSearch } from 'react-icons/hi';
import Spinner from '@/components/ui/Spinner';

export default function FAQPage() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [allItems, setAllItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'FAQ | Property Buying Guide Nairobi';
    loadFAQ();
  }, []);

  const loadFAQ = async () => {
    setLoading(true);
    const items = await fetchFAQItems();
    setAllItems(items);
    setLoading(false);
  };

  const categories = ['All', ...new Set(allItems.map(f => f.category))];
  const filtered = allItems.filter(f => {
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    const matchesSearch = !searchQuery ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <section className="bg-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]} />
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-500 italic mb-6"><em>Everything you need to know about buying property in Nairobi</em></p>
          <div className="max-w-md relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                    activeCategory === cat ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <Spinner text="Loading FAQs..." />
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 bg-emerald-50 rounded-2xl">
                <p className="text-gray-500">No matching questions found</p>
                <p className="text-sm text-gray-400 mt-1">Try different keywords or browse all categories</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((faq, i) => (
                  <div key={i} className="bg-white border border-emerald-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenId(openId === i ? null : i)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-emerald-50 transition-colors"
                    >
                      <span className="font-medium text-emerald-900 pr-4 text-sm md:text-base">{faq.question}</span>
                      <HiChevronDown className={`w-5 h-5 text-gold-500 flex-shrink-0 transition-transform ${openId === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openId === i && (
                      <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-emerald-50 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm sticky top-28">
              <HubSpotForm
                compact
                title="Still Have Questions?"
                subtitle="Our property experts are here to help you with personalized advice"
                submitLabel="Ask a Question"
              />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Start Your Property Journey?"
        subtitle="Contact our expert team for personalized assistance with buying property in Nairobi"
        primaryLabel="Contact Us Today"
        primaryHref="/contact"
        secondaryLabel="Browse Properties"
        secondaryHref="/properties"
      />
    </>
  );
}
