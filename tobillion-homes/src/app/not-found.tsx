'use client';

import Link from 'next/link';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { HiSearch, HiHome } from 'react-icons/hi';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <MosaicGrid>
          <div className="col-span-12 md:col-span-8 md:col-start-3 text-center">
            <div className="mb-8">
              <p className="text-8xl md:text-9xl font-bold text-emerald-200">404</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-3">
              Page Not Found
            </h1>
            <p className="text-gray-500 italic mb-8 max-w-md mx-auto">
              <em>The page you&apos;re looking for doesn&apos;t exist or has been moved. Let us help you find your way home.</em>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 border-2 border-gold-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300"
              >
                <HiHome className="w-5 h-5" />
                Back to Home
              </Link>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 bg-white text-emerald-800 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 border-2 border-emerald-200 hover:border-gold-400 transition-all duration-300"
              >
                <HiSearch className="w-5 h-5" />
                Browse Properties
              </Link>
            </div>
          </div>
        </MosaicGrid>
      </div>
    </div>
  );
}
