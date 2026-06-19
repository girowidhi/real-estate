'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NEIGHBORHOODS } from '@/lib/constants';
import { fetchNeighborhoods, fetchProperties } from '@/lib/client-data';
import { NeighborhoodGuide, Property } from '@/types';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { HubSpotForm } from '@/components/forms/HubSpotForm';
import { HiArrowRight } from 'react-icons/hi';
import Spinner from '@/components/ui/Spinner';

export default function NeighborhoodDetailPage() {
  const params = useParams();
  const hood = NEIGHBORHOODS.find(n => n.slug === params.slug);
  const [guide, setGuide] = useState<NeighborhoodGuide | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hood) loadData();
  }, [hood]);

  const loadData = async () => {
    setLoading(true);
    const [guides, props] = await Promise.all([
      fetchNeighborhoods(),
      fetchProperties({ neighborhood: params.slug as string, status: 'available' }),
    ]);
    setGuide(guides.find((g: NeighborhoodGuide) => g.slug === params.slug) || null);
    setProperties(props);
    setLoading(false);
  };

  if (!hood) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-bold text-emerald-900 mb-2">Neighborhood Not Found</p>
        <Link href="/neighborhoods" className="text-emerald-700 font-semibold hover:underline">← All Neighborhoods</Link>
      </div>
    );
  }

  return (
    <>
      <section className="bg-emerald-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-emerald-700">Home</Link>
            <span>/</span>
            <Link href="/neighborhoods" className="hover:text-emerald-700">Neighborhoods</Link>
            <span>/</span>
            <span className="text-emerald-700">{hood.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">{hood.name}, Nairobi</h1>
          <p className="text-gray-500 italic mb-4"><em>{hood.description}</em></p>
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-emerald-700 text-white px-3 py-1 rounded-full font-semibold">
              Avg: KES {(hood.avgPrice / 1000000).toFixed(1)}M
            </span>
            <span className="text-gray-500">{properties.length} properties available</span>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Spinner text="Loading neighborhood..." />
        </section>
      ) : (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="aspect-[21/9] rounded-2xl bg-cover bg-center"
              style={{ backgroundImage: `url(${hood.image})` }}
            />

            {guide && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-emerald-900 mb-3">About {guide.name}</h2>
                  <p className="text-gray-600 leading-relaxed">{guide.content}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <h3 className="font-semibold text-emerald-900 mb-2 text-sm">Schools</h3>
                    <ul className="space-y-1">
                      {guide.schools.map((s) => (
                        <li key={s} className="text-sm text-gray-600 flex items-center gap-1">
                          <svg className="w-3 h-3 text-emerald-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <h3 className="font-semibold text-emerald-900 mb-2 text-sm">Transport</h3>
                    <ul className="space-y-1">
                      {guide.transport.map((t) => (
                        <li key={t} className="text-sm text-gray-600 flex items-center gap-1">
                          <svg className="w-3 h-3 text-emerald-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4">
                  <h3 className="font-semibold text-emerald-900 mb-2 text-sm">Amenities & Safety</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {guide.amenities.map((a) => (
                      <span key={a} className="text-gray-600 flex items-center gap-1">
                        <svg className="w-3 h-3 text-emerald-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-500"><strong className="text-emerald-700">Crime Rate:</strong> {guide.crimeRate}</p>
              </>
            )}

            <h2 className="text-xl font-bold text-emerald-900">Properties in {hood.name}</h2>
            {properties.length > 0 ? (
              <MosaicGrid>
                {properties.map((property) => (
                  <div key={property.id} className="col-span-6 md:col-span-4">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </MosaicGrid>
            ) : (
              <p className="text-gray-500">No properties currently listed in {hood.name}.</p>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
              <HubSpotForm
                compact
                title={`Interested in ${hood.name}?`}
                subtitle="Get personalized property recommendations"
                submitLabel="Get Recommendations"
              />
            </div>

            <div className="bg-emerald-50 rounded-2xl p-6">
              <h3 className="font-bold text-emerald-900 mb-3">Nearby Neighborhoods</h3>
              <div className="space-y-2">
                {NEIGHBORHOODS.filter(n => n.slug !== hood.slug).slice(0, 4).map((n) => (
                  <Link key={n.slug} href={`/neighborhoods/${n.slug}`} className="flex items-center justify-between text-sm hover:bg-white/50 rounded-lg p-2 transition-colors">
                    <span className="text-gray-700">{n.name}</span>
                    <span className="text-gray-400">KES {(n.avgPrice / 1000000).toFixed(1)}M</span>
                  </Link>
                ))}
              </div>
              <Link href="/neighborhoods" className="text-sm text-emerald-700 font-semibold flex items-center gap-1 mt-3 hover:text-gold-500 transition-colors">
                View All <HiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
      )}
    </>
  );
}
