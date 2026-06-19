'use client';

import { useState, useEffect } from 'react';
import { sampleProperties } from '@/data/mockData';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CTASection } from '@/components/ui/CTASection';
import Link from 'next/link';
import { HiHeart, HiArrowRight } from 'react-icons/hi';

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState<string[]>(['prop-1', 'prop-2']);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Saved Properties';
  }, []);

  const savedProperties = sampleProperties.filter(p => savedIds.includes(p.id));

  const removeSaved = (id: string) => {
    setSavedIds(prev => prev.filter(s => s !== id));
    setToast('Property removed from saved');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <section className="bg-emerald-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Saved Properties' }]} />
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Saved Properties</h1>
          <p className="text-gray-500 italic"><em>Properties you&apos;ve saved for later review</em></p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {savedProperties.length > 0 ? (
          <MosaicGrid>
            {savedProperties.map((p) => (
              <div key={p.id} className="col-span-6 md:col-span-4 relative">
                <PropertyCard property={p} />
                <button
                  onClick={() => removeSaved(p.id)}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
                  aria-label="Remove from saved"
                >
                  <HiHeart className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </MosaicGrid>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiHeart className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-xl text-gray-500 mb-2">No saved properties yet</p>
            <p className="text-sm text-gray-400 mb-6">Start saving properties by clicking the heart icon on any listing</p>
            <Link href="/properties" className="inline-flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-800 transition-colors">
              Browse Properties <HiArrowRight />
            </Link>
          </div>
        )}

        {savedProperties.length > 0 && (
          <div className="mt-12 bg-emerald-50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-emerald-900 mb-3">Want to save more properties?</h2>
            <p className="text-sm text-gray-500 mb-4">Create a free account to sync your saved properties across devices and get price drop alerts.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-1 bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-800 transition-colors">
              Create Free Account
            </Link>
          </div>
        )}
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-up text-sm">
          {toast}
        </div>
      )}

      <CTASection
        title="Find Your Dream Home"
        subtitle="Browse hundreds of premium properties across all Nairobi neighborhoods"
        primaryLabel="Search Properties"
        primaryHref="/properties"
        secondaryLabel="Get a Valuation"
        secondaryHref="/valuation"
      />
    </>
  );
}
