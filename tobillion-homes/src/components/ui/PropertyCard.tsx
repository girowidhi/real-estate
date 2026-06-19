'use client';

import Link from 'next/link';
import { HiLocationMarker, HiHome, HiPhotograph } from 'react-icons/hi';
import { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'featured' | 'compact';
}

export function PropertyCard({ property, variant = 'default' }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link href={`/properties/${property.slug}`}>
      <div className={`group bg-white rounded-xl overflow-hidden border border-emerald-100 hover-card ${variant === 'featured' ? 'col-span-8 md:col-span-6' : ''}`}>
        <div className="relative overflow-hidden aspect-[16/10]">
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url(${property.images[0]})` }}
          />
          {property.scarcity && (
            <span className="scarcity-badge absolute top-3 right-3 animate-pulse">
              {property.scarcity}
            </span>
          )}
          {property.verified && (
            <span className="absolute top-3 left-3 bg-emerald-700 text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Verified
            </span>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center gap-1 text-white text-sm">
              <HiLocationMarker className="w-3.5 h-3.5" />
              {property.neighborhood.name}, Nairobi
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-1 group-hover:text-emerald-700 transition-colors">
              {property.title}
            </h3>
            {property.rating > 0 && (
              <span className="flex items-center gap-1 text-xs text-gold-500 bg-gold-50 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                {property.rating}
              </span>
            )}
          </div>

          <p className="text-lg font-bold text-emerald-700 mb-2">{formatPrice(property.price)}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {property.type !== 'land' && (
              <>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  {property.bedrooms} Beds
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {property.bathrooms} Baths
                </span>
              </>
            )}
            <span className="flex items-center gap-1">
              <HiPhotograph className="w-4 h-4" />
              {property.area} {property.areaUnit}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
              {property.type}
            </span>
            <span className="text-xs text-gray-400">{property.status === 'available' ? 'For Sale' : property.status}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
