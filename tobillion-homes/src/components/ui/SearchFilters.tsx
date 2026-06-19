'use client';

import { useState } from 'react';
import { HiSearch, HiAdjustments, HiX } from 'react-icons/hi';
import { PROPERTY_TYPES, BEDROOM_OPTIONS, SORT_OPTIONS } from '@/lib/constants';
import type { SearchFilters } from '@/types';

interface SearchFiltersProps {
  onFilter: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export function SearchFilters({ onFilter, initialFilters }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilter(updated);
  };

  const clearFilters = () => {
    const cleared: SearchFilters = {};
    setFilters(cleared);
    onFilter(cleared);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder='Search "3-bedroom apartments under 10M in Kilimani"'
            value={filters.query || ''}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filters.type || ''}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={filters.bedrooms || ''}
            onChange={(e) => updateFilter('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          >
            <option value="">Beds</option>
            {BEDROOM_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-3 border rounded-xl text-sm flex items-center gap-2 transition-colors ${
              showAdvanced ? 'bg-emerald-700 text-white border-emerald-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <HiAdjustments className="w-4 h-4" />
            <span className="hidden md:inline">Filters</span>
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-emerald-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Min Price (KES)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Price (KES)</label>
              <input
                type="number"
                placeholder="Any"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Neighborhood</label>
              <select
                value={filters.neighborhood || ''}
                onChange={(e) => updateFilter('neighborhood', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Areas</option>
                <option value="kilimani">Kilimani</option>
                <option value="westlands">Westlands</option>
                <option value="karen">Karen</option>
                <option value="lavington">Lavington</option>
                <option value="gigiri">Gigiri</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
              <select
                value={filters.sort || 'newest'}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-emerald-700 flex items-center gap-1"
            >
              <HiX className="w-4 h-4" /> Clear all filters
            </button>
            <p className="text-xs text-gray-400">Results update in real-time</p>
          </div>
        </div>
      )}
    </div>
  );
}
