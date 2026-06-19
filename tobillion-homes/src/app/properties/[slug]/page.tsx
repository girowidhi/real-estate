'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ExplodedView } from '@/components/three/ExplodedView';
import { HubSpotForm } from '@/components/forms/HubSpotForm';
import { GraphicButton } from '@/components/ui/GraphicButton';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { fetchPropertyBySlug, fetchProperties } from '@/lib/client-data';
import { Property } from '@/types';
import { HiHeart, HiCalendar, HiPhone, HiMail, HiHome, HiChartBar, HiCheck, HiShare, HiLocationMarker } from 'react-icons/hi';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner';

export default function ListingDetailPage() {
  const params = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tourModal, setTourModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadProperty();
  }, [params.slug]);

  const loadProperty = async () => {
    setLoading(true);
    const prop = await fetchPropertyBySlug(params.slug as string);
    setProperty(prop);
    if (prop) {
      document.title = `${prop.title}`;
      const similar = await fetchProperties({ status: 'available', limit: 3 });
      setSimilarProperties(similar.filter(p => p.id !== prop.id && (p.neighborhood.slug === prop.neighborhood.slug || Math.abs(p.price - prop.price) < 20000000)).slice(0, 3));
    }
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <Spinner text="Loading property..." />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-bold text-emerald-900 mb-2">Property Not Found</p>
        <p className="text-gray-500 mb-6">The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/properties" className="text-emerald-700 font-semibold hover:underline">Browse all properties →</Link>
      </div>
    );
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(price);

  return (
    <>
      <section className="bg-emerald-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Properties', href: '/properties' },
            { label: property.title },
          ]} />
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-900">
            {property.title}
            {property.verified && (
              <span className="inline-flex items-center gap-1 ml-2 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full align-middle">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Verified
              </span>
            )}
          </h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {property.location && (
          <p className="text-sm text-gray-500 mb-6 flex items-center gap-1">
            <HiLocationMarker className="w-4 h-4 text-emerald-600" />
            {property.location}{property.neighborhood?.name ? `, ${property.neighborhood.name}` : ''}
          </p>
        )}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative rounded-2xl overflow-hidden border border-emerald-100">
              <div className="aspect-[16/10] bg-cover bg-center cursor-pointer"
                style={{ backgroundImage: `url(${property.images[selectedImage]})` }}
                onClick={() => setShowFullScreen(true)}
              />
              {property.scarcity && (
                <span className="scarcity-badge absolute top-4 right-4 text-base animate-pulse">{property.scarcity}</span>
              )}
              <div className="flex gap-2 p-3 bg-white overflow-x-auto">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-16 rounded-lg bg-cover bg-center flex-shrink-0 border-2 transition-colors ${selectedImage === i ? 'border-gold-400' : 'border-transparent'}`}
                    style={{ backgroundImage: `url(${img})` }}
                  />
                ))}
              </div>
            </div>

            <ExplodedView variant={property.type === 'apartment' ? 'apartment' : 'house'} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Price', value: formatPrice(property.price), sub: property.currency || 'KES', icon: HiChartBar },
                { label: 'Type', value: property.type.charAt(0).toUpperCase() + property.type.slice(1), icon: HiHome },
                { label: 'Bedrooms', value: property.bedrooms ?? 'N/A', icon: HiHome },
                { label: 'Bathrooms', value: property.bathrooms ?? 'N/A', icon: HiHome },
              ].map((s) => (
                <div key={s.label} className="bg-emerald-50 rounded-xl p-4 text-center">
                  <s.icon className="w-5 h-5 text-gold-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="font-bold text-emerald-900">{s.value}</p>
                  {(s as any).sub && <p className="text-[10px] text-gray-400">{(s as any).sub}</p>}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Area', value: `${property.area || '—'} ${property.areaUnit || 'sqm'}`, icon: HiHome },
                { label: 'Year Built', value: property.yearBuilt ?? 'N/A', icon: HiCalendar },
                { label: 'Status', value: property.status.charAt(0).toUpperCase() + property.status.slice(1), icon: HiChartBar },
                { label: 'Rating', value: property.rating ? `${property.rating}/5 (${property.reviewCount} reviews)` : 'N/A', icon: HiChartBar },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <s.icon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="font-bold text-emerald-900 text-sm">{s.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-900 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-900 mb-3">Amenities & Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[...property.amenities, ...property.features].map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-gray-600 bg-emerald-50 px-3 py-2 rounded-lg">
                    <HiCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {property.priceHistory.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-emerald-900 mb-3">Price History (6 Months)</h2>
                <div className="bg-white border border-emerald-100 rounded-xl overflow-hidden">
                  {property.priceHistory.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-emerald-50 last:border-0">
                      <span className="text-sm text-gray-500">{new Date(p.date).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}</span>
                      <span className="font-semibold text-emerald-900">{formatPrice(p.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {property.floorPlans.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-emerald-900 mb-3">Floor Plans</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.floorPlans.map((fp, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-200 transition-colors">
                      <img src={fp} alt={`Floor plan ${i + 1}`} className="w-full h-40 object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {property.latitude && property.longitude && (
              <div>
                <h2 className="text-xl font-bold text-emerald-900 mb-3">Location</h2>
                <div className="rounded-xl overflow-hidden border border-gray-200 h-64 bg-gray-100">
                  <iframe
                    title="Property Location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.01},${property.latitude - 0.01},${property.longitude + 0.01},${property.latitude + 0.01}&layer=mapnik&marker=${property.latitude},${property.longitude}`}
                    allowFullScreen
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  <a href={`https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View larger map →</a>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <GraphicButton size="lg" className="flex-1" onClick={() => { setSaved(!saved); showToast(saved ? 'Removed from saved' : 'Saved to favorites'); }}>
                <HiHeart className={`w-5 h-5 ${saved ? 'fill-red-500 text-red-500' : ''}`} /> {saved ? 'Saved' : 'Save Listing'}
              </GraphicButton>
              <GraphicButton size="lg" variant="secondary" className="flex-1" onClick={() => setTourModal(true)}>
                <HiCalendar className="w-5 h-5" /> Request Tour
              </GraphicButton>
              <GraphicButton size="lg" variant="outline" className="flex-shrink-0" onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast('Link copied!'); }}>
                <HiShare className="w-5 h-5" />
              </GraphicButton>
            </div>

            {similarProperties.length > 0 && (
              <div className="pt-8 border-t border-emerald-100">
                <h2 className="text-xl font-bold text-emerald-900 mb-4">Similar Properties</h2>
                <MosaicGrid>
                  {similarProperties.map((p) => (
                    <div key={p.id} className="col-span-6 md:col-span-4">
                      <PropertyCard property={p} />
                    </div>
                  ))}
                </MosaicGrid>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <img src={property.agent.photo} alt={property.agent.name} className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <Link href={`/agents/${property.agent.slug}`} className="font-semibold text-emerald-900 hover:text-emerald-700 flex items-center gap-1">
                    {property.agent.name}
                    {property.agent.verified && (
                      <svg className="w-4 h-4 text-emerald-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    )}
                  </Link>
                  <p className="text-sm text-gray-500">{property.agent.listings} listings</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-4 h-4 ${i < Math.round(property.agent.rating) ? 'text-gold-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
                <span className="text-xs text-gray-500 ml-1">({property.agent.reviewCount} reviews)</span>
              </div>
              <div className="space-y-2 mb-4">
                <a href={`tel:${property.agent.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700">
                  <HiPhone className="w-4 h-4 text-gold-500" /> {property.agent.phone}
                </a>
                <a href={`mailto:${property.agent.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700">
                  <HiMail className="w-4 h-4 text-gold-500" /> {property.agent.email}
                </a>
              </div>
              <HubSpotForm
                compact
                title="Interested in this property?"
                subtitle="Request more info or schedule a viewing"
                submitLabel="Send Inquiry"
              />
            </div>

            <div className="bg-emerald-50 rounded-2xl p-6">
              <h3 className="font-bold text-emerald-900 mb-3">Property Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Property ID</dt><dd className="font-medium">{property.id}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Year Built</dt><dd className="font-medium">{property.yearBuilt || 'N/A'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className={`font-medium ${property.status === 'available' ? 'text-emerald-700' : 'text-amber-600'}`}>{property.status}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Area</dt><dd className="font-medium">{property.area || '—'} {property.areaUnit || 'sqm'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Bedrooms</dt><dd className="font-medium">{property.bedrooms ?? '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Bathrooms</dt><dd className="font-medium">{property.bathrooms ?? '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Location</dt><dd className="font-medium">{property.neighborhood.name}</dd></div>
                {property.location && <div className="flex justify-between"><dt className="text-gray-500">Address</dt><dd className="font-medium text-right text-xs">{property.location}</dd></div>}
                <div className="flex justify-between"><dt className="text-gray-500">Currency</dt><dd className="font-medium">{property.currency || 'KES'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Rating</dt><dd className="font-medium">{property.rating ? `${property.rating} / 5` : '—'}</dd></div>
              </dl>
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <Link href="/valuation" className="text-sm text-emerald-700 font-semibold hover:text-gold-500 transition-colors">
                  Is this property overpriced? Get a valuation →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-up text-sm">
          {toast}
        </div>
      )}

      {tourModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setTourModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setTourModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <HubSpotForm
              title="Request a Tour"
              subtitle={`Schedule a viewing for ${property.title}`}
              fields={[
                { name: 'fullName', label: 'Full Name', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'phone', label: 'Phone', type: 'tel', required: true },
                { name: 'preferredDate', label: 'Preferred Date & Time', type: 'text', required: true },
              ]}
              submitLabel="Request Tour"
            />
          </div>
        </div>
      )}

      {showFullScreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowFullScreen(false)}>
          <div className="max-w-5xl w-full max-h-[90vh] aspect-[16/10] bg-cover bg-center rounded-2xl"
            style={{ backgroundImage: `url(${property.images[selectedImage]})` }}
          />
          <button className="absolute top-4 right-4 text-white text-2xl hover:text-gold-400 transition-colors" onClick={() => setShowFullScreen(false)}>✕</button>
        </div>
      )}
    </>
  );
}
