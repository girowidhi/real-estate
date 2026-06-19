'use client';

import { useState, useEffect } from 'react';
import { HiHeart, HiSearch, HiBell, HiHome, HiCog, HiTrash, HiPencil } from 'react-icons/hi';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { sampleProperties } from '@/data/mockData';
import { PropertyCard } from '@/components/ui/PropertyCard';
import Link from 'next/link';

export default function DashboardPage() {
  const [savedProperties, setSavedProperties] = useState(sampleProperties.slice(0, 3));
  const [savedSearches, setSavedSearches] = useState([
    { id: '1', name: '3-Bed in Kilimani', filters: 'Type: House | Max: KES 20M | Beds: 3+' },
    { id: '2', name: 'Apartments under 15M', filters: 'Type: Apartment | Max: KES 15M | Any beds' },
  ]);
  const [activeTab, setActiveTab] = useState('saved');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'My Dashboard';
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const removeProperty = (id: string) => {
    setSavedProperties(prev => prev.filter(p => p.id !== id));
    showToast('Property removed from saved');
  };

  const deleteSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
    showToast('Search deleted');
  };

  return (
    <>
      <section className="bg-emerald-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">My Dashboard</h1>
          <p className="text-gray-500 italic"><em>Manage your saved properties, searches, and alerts</em></p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 overflow-x-auto">
          {[
            { id: 'saved', icon: HiHome, label: 'Saved Properties', count: savedProperties.length },
            { id: 'searches', icon: HiSearch, label: 'Saved Searches', count: savedSearches.length },
            { id: 'alerts', icon: HiBell, label: 'Alerts', count: '5' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className="bg-emerald-700 text-white text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>

        {activeTab === 'saved' && (
          savedProperties.length > 0 ? (
            <MosaicGrid>
              {savedProperties.map((p) => (
                <div key={p.id} className="col-span-6 md:col-span-4 relative">
                  <PropertyCard property={p} />
                  <button
                    onClick={() => removeProperty(p.id)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
                    aria-label="Remove from saved"
                  >
                    <HiHeart className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </MosaicGrid>
          ) : (
            <div className="text-center py-16">
              <HiHeart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500 mb-2">No saved properties yet</p>
              <p className="text-sm text-gray-400 mb-4">Save properties you like to review them later</p>
              <Link href="/properties" className="text-emerald-700 font-semibold hover:underline">Browse Properties →</Link>
            </div>
          )
        )}

        {activeTab === 'searches' && (
          savedSearches.length > 0 ? (
            <div className="space-y-3">
              {savedSearches.map((search) => (
                <div key={search.id} className="bg-white border border-emerald-100 rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover-card">
                  <div>
                    <p className="font-semibold text-emerald-900">{search.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{search.filters}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => showToast('Edit feature coming soon')} className="px-3 py-1.5 text-xs text-gray-500 hover:text-emerald-700 border border-gray-200 rounded-lg hover:border-emerald-200 transition-colors flex items-center gap-1">
                      <HiPencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => deleteSearch(search.id)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg hover:border-red-200 transition-colors flex items-center gap-1">
                      <HiTrash className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <HiSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No saved searches</p>
            </div>
          )
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {[
              { msg: 'New 3-bed apartment listed in Kilimani — KES 16.5M', time: '2 hours ago' },
              { msg: 'Price drop: Luxury villa in Karen reduced by KES 3M', time: '1 day ago' },
              { msg: '2 properties match your search in Westlands', time: '3 days ago' },
              { msg: 'New development launched in Kileleshwa — 12 units available', time: '5 days ago' },
              { msg: 'Market update: Kilimani prices up 4% this quarter', time: '1 week ago' },
            ].map((alert, i) => (
              <div key={i} className="bg-emerald-50 rounded-xl p-4 flex items-start gap-3">
                <HiBell className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">{alert.msg}</p>
                  <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
            <Link href="/alerts" className="block text-center text-sm text-emerald-700 font-semibold mt-4 hover:text-gold-500 transition-colors">
              Manage Alert Settings →
            </Link>
          </div>
        )}
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-up text-sm">
          {toast}
        </div>
      )}
    </>
  );
}
