'use client';

import { useEffect } from 'react';
import { NairobiMap } from '@/components/map/NairobiMap';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CTASection } from '@/components/ui/CTASection';
import { NEIGHBORHOODS } from '@/lib/constants';
import Link from 'next/link';
import { HiArrowRight, HiInformationCircle } from 'react-icons/hi';

export default function MapPage() {
  useEffect(() => {
    document.title = 'Interactive Nairobi Property Map';
  }, []);

  return (
    <>
      <section className="bg-emerald-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Interactive Map' }]} />
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">Interactive Nairobi Map</h1>
          <p className="text-gray-500 italic"><em>Explore properties across all Nairobi neighborhoods with layered filters</em></p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-4 md:p-6">
          <div className="flex items-start gap-3 mb-4">
            <HiInformationCircle className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">
                Click on neighborhood markers for property previews and average prices. 
                Use the layer controls on the right to toggle between all properties, price heatmap, and new developments.
                Zoom in to street level for detailed exploration.
              </p>
            </div>
          </div>
          <NairobiMap />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-emerald-900 mb-2">Nairobi Neighborhoods</h2>
        <p className="text-gray-500 italic mb-8"><em>Average property prices across the city</em></p>
        <MosaicGrid>
          {NEIGHBORHOODS.map((hood, i) => (
            <Link
              key={hood.slug}
              href={`/neighborhoods/${hood.slug}`}
              className={`col-span-6 md:col-span-3 group bg-white rounded-xl border border-emerald-100 p-5 hover-card ${i === 0 ? 'md:col-span-6' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">{hood.name}</h3>
                <HiArrowRight className="w-4 h-4 text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{hood.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-emerald-700">
                  KES {(hood.avgPrice / 1000000).toFixed(1)}M <span className="text-xs font-normal text-gray-400">avg</span>
                </span>
                <span className="text-xs text-gray-400">Active area</span>
              </div>
            </Link>
          ))}
        </MosaicGrid>
      </section>

      <CTASection
        title="Can't Find What You're Looking For?"
        subtitle="Let our expert agents help you find the perfect property in any Nairobi neighborhood."
        primaryLabel="Speak to an Agent"
        primaryHref="/contact"
        secondaryLabel="Search Properties"
        secondaryHref="/properties"
      />
    </>
  );
}
