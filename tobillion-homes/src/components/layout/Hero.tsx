'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiSearch } from 'react-icons/hi';

const heroImages = [
  { src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', alt: 'Luxury home in Nairobi' },
  { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', alt: 'Modern apartment Nairobi' },
  { src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', alt: 'Luxury villa' },
  { src: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80', alt: 'Nairobi property' },
  { src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', alt: 'Modern house' },
  { src: 'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800&q=80', alt: 'Apartment view' },
];

interface HeroProps {
  content?: { headline?: string; subheadline?: string; cta_text?: string; cta_link?: string };
}

export function Hero({ content }: HeroProps) {
  const headline = content?.headline || 'Find Your Dream Home in Nairobi';
  const subheadline = content?.subheadline || 'Limited luxury units available in Westlands & Karen';
  const ctaText = content?.cta_text || 'Start Your Search';
  const ctaLink = content?.cta_link || '/properties';

  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="inline-flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <span className="text-gold-400 font-bold text-3xl">T</span>
            </div>
            <div>
              <p className="text-emerald-600 text-sm tracking-widest uppercase">Nairobi&apos;s Premier Real Estate</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-full overflow-hidden">
        <div className="flex gap-2 px-4 sm:px-6 lg:px-8 overflow-x-auto pb-2 scrollbar-hide">
          {heroImages.map((img, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[380px] lg:w-[420px] h-[260px] sm:h-[300px] md:h-[340px] rounded-xl overflow-hidden shadow-md hover-card group"
            >
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${img.src})` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-8 mx-4 sm:mx-6 lg:mx-8 rounded-2xl overflow-hidden">
        <div className="animate-mesh bg-gradient-to-br from-emerald-700 via-emerald-600 to-gold-500 p-8 md:p-16 text-center relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight"
            >
              {headline}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-emerald-100 italic text-lg md:text-xl mb-8 max-w-2xl mx-auto"
            >
              <em>{subheadline}</em>
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-2 bg-white text-emerald-800 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 border-2 border-gold-400 hover:border-gold-500 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300 group"
              >
                <HiSearch className="w-5 h-5" />
                {ctaText}
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 hover:scale-105 transition-all duration-300"
              >
                Explore Map
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Properties Listed', value: '500+' },
            { label: 'Neighborhoods Covered', value: '12' },
            { label: 'Happy Clients', value: '2,000+' },
            { label: 'Years Experience', value: '8+' },
          ].map((stat) => (
            <div key={stat.label} className="bg-emerald-50 rounded-xl p-4">
              <p className="text-2xl md:text-3xl font-bold text-emerald-700">{stat.value}</p>
              <p className="text-sm text-emerald-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
