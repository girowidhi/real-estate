'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { HiMenu, HiX, HiSearch } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPANY, NEIGHBORHOODS } from '@/lib/constants';
import { sampleProperties } from '@/data/mockData';
import { fetchSiteSettings } from '@/lib/client-data';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Properties', href: '/properties' },
  { label: 'Map', href: '/map' },
  {
    label: 'Neighborhoods',
    href: '/neighborhoods',
    children: NEIGHBORHOODS.map(n => ({ label: n.name, href: `/neighborhoods/${n.slug}` })),
  },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [branding, setBranding] = useState<{ logo: string; logo_size: number } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchSiteSettings().then(s => { if (s?.branding) setBranding(s.branding); }).catch(() => {});
  }, []);

  const searchResults = searchQuery
    ? sampleProperties.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.neighborhood.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/properties?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <img src={branding?.logo || "/logo.jpeg"} alt="Logo" className="object-contain" style={{ width: branding?.logo_size || 40, height: branding?.logo_size || 40 }} />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setDropdown(item.label)}
                onMouseLeave={() => setDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  {item.label}
                  {item.children && <span className="ml-1 text-xs">▼</span>}
                </Link>
                {item.children && dropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-emerald-100 py-2 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                aria-label="Search"
              >
                <HiSearch className="w-5 h-5" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-emerald-100 overflow-hidden z-50">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder='Search "3-bedroom apartments Kilimani"...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full pl-10 pr-4 py-3 text-sm focus:outline-none"
                      />
                    </div>
                  </form>
                  {searchResults.length > 0 && (
                    <div className="border-t border-emerald-100 max-h-80 overflow-y-auto">
                      {searchResults.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/properties/${p.slug}`}
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${p.images[0]})` }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                            <p className="text-xs text-gray-400">{p.neighborhood.name} · KES {Number(p.price).toLocaleString()}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchQuery && searchResults.length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-400">No properties found</p>
                      <p className="text-xs text-gray-300 mt-1">Try different keywords</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Link
              href="/saved"
              className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors"
            >
              Saved
            </Link>
            <Link
              href="/valuation"
              className="px-5 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition-all hover:shadow-lg hover:shadow-emerald-200"
            >
              Get Valuation
            </Link>
          </div>

          <button
            className="lg:hidden p-2 text-gray-700"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <HiMenu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-white z-50 lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-emerald-100">
              <Link href="/" className="flex items-center gap-2">
                <img src={branding?.logo || "/logo.jpeg"} alt="Logo" className="object-contain" style={{ width: Math.min(branding?.logo_size || 32, 32), height: Math.min(branding?.logo_size || 32, 32) }} />
              </Link>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <HiX className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 border-b border-emerald-100">
              <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { router.push(`/properties?q=${encodeURIComponent(searchQuery)}`); setMobileOpen(false); setSearchQuery(''); } }}>
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </form>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-emerald-50 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="ml-4 space-y-1 border-l-2 border-emerald-100 pl-4 mt-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-emerald-700"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 space-y-3">
                <Link
                  href="/saved"
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-emerald-50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Saved Searches
                </Link>
                <Link
                  href="/valuation"
                  className="block mx-4 px-5 py-3 bg-emerald-700 text-white text-center font-semibold rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Valuation
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
