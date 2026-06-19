'use client';

import { useEffect } from 'react';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CTASection } from '@/components/ui/CTASection';
import { NEIGHBORHOODS } from '@/lib/constants';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function NeighborhoodsPage() {
  useEffect(() => {
    document.title = 'Nairobi Neighborhoods Guide | Property Areas';
  }, []);

  const sorted = [...NEIGHBORHOODS].sort((a, b) => b.avgPrice - a.avgPrice);

  return (
    <>
      <section className="bg-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Neighborhoods' }]} />
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">Nairobi Neighborhoods</h1>
          <p className="text-gray-500 italic"><em>Explore property trends, schools, and lifestyle across all areas of Nairobi</em></p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MosaicGrid>
          {sorted.map((hood, i) => (
            <motion.div
              key={hood.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`col-span-6 ${i < 2 ? 'md:col-span-6' : 'md:col-span-4'}`}
            >
              <Link href={`/neighborhoods/${hood.slug}`} className="block group">
                <div className="relative rounded-2xl overflow-hidden hover-card">
                  <div className={`bg-cover bg-center transition-transform duration-500 group-hover:scale-105 ${i < 2 ? 'aspect-[21/9]' : 'aspect-[4/3]'}`}
                    style={{ backgroundImage: `url(${hood.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-bold text-xl">{hood.name}</h3>
                        <p className="text-emerald-300 text-sm mt-1 line-clamp-1">{hood.description}</p>
                      </div>
                      <HiArrowRight className="w-5 h-5 text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-white/80">
                      <span>KES {(hood.avgPrice / 1000000).toFixed(1)}M avg</span>
                      <span>·</span>
                      <span>Premium area</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </MosaicGrid>
      </section>

      <section className="bg-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-emerald-900 mb-6">Nairobi Price Comparison</h2>
          <p className="text-gray-500 text-sm mb-6">Average property prices by neighborhood (sorted high to low)</p>
          <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden">
            {sorted.map((hood, i) => (
              <div key={hood.slug} className={`flex items-center justify-between px-6 py-4 ${i !== sorted.length - 1 ? 'border-b border-emerald-50' : ''} hover:bg-emerald-50 transition-colors`}>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-6 font-mono">{i + 1}</span>
                  <Link href={`/neighborhoods/${hood.slug}`} className="font-semibold text-emerald-900 hover:text-emerald-700 transition-colors">
                    {hood.name}
                  </Link>
                </div>
                <span className="font-bold text-emerald-700">KES {(hood.avgPrice / 1000000).toFixed(1)}M</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-emerald-900 mb-4">Which Neighborhood Is Right for You?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-emerald-50 rounded-2xl p-6">
            <h3 className="font-bold text-emerald-900 mb-3">For Families</h3>
            <p className="text-sm text-gray-600 mb-3">Top areas with excellent schools, safe environments, and family-friendly amenities.</p>
            <ul className="space-y-1 text-sm text-gray-600">
              {['Karen — International schools, large gardens', 'Lavington — Quiet streets, embassies nearby', 'Kileleshwa — Riverside, gated communities', 'Runda — Exclusive, private golf club'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-6">
            <h3 className="font-bold text-emerald-900 mb-3">For Investors</h3>
            <p className="text-sm text-gray-600 mb-3">Highest rental yields and capital appreciation potential.</p>
            <ul className="space-y-1 text-sm text-gray-600">
              {['Kilimani — 7-9% rental yields', 'Westlands — Premium tenants', 'Eastleigh — Affordable entry, high returns', 'Langata — Growing demand, value area'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Explore a Neighborhood?"
        subtitle="Contact us for personalized guidance on finding the perfect area for your needs."
        primaryLabel="Contact an Expert"
        primaryHref="/contact"
        secondaryLabel="Browse Properties"
        secondaryHref="/properties"
      />
    </>
  );
}
