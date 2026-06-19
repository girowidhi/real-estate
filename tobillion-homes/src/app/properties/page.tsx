'use client';

import { useState, useEffect } from 'react';
import { SearchFilters } from '@/components/ui/SearchFilters';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { NairobiMap } from '@/components/map/NairobiMap';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CTASection } from '@/components/ui/CTASection';
import { fetchProperties } from '@/lib/client-data';
import { SearchFilters as SearchFiltersType, Property } from '@/types';
import { HiMap, HiViewGrid } from 'react-icons/hi';
import Spinner from '@/components/ui/Spinner';

export default function PropertiesPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Properties for Sale in Nairobi';
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    const props = await fetchProperties({ status: 'available' });
    setAllProperties(props);
    setFilteredProperties(props);
    setLoading(false);
  };

  const handleFilter = async (filters: SearchFiltersType) => {
    setLoading(true);
    const results = await fetchProperties({
      type: filters.type,
      neighborhood: filters.neighborhood,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      bedrooms: filters.bedrooms,
      status: 'available',
      sort: filters.sort,
    });
    let filtered = results;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.neighborhood.name.toLowerCase().includes(q)
      );
    }
    setFilteredProperties(filtered);
    setLoading(false);
  };

  return (
    <>
      <section className="bg-emerald-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Properties' }]} />
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">Properties in Nairobi</h1>
          <p className="text-gray-500 italic"><em>Browse {filteredProperties.length} available properties across all neighborhoods</em></p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <SearchFilters onFilter={handleFilter} />
      </section>

      {loading ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Spinner text="Loading properties..." />
        </section>
      ) : filteredProperties.length === 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-gray-400 text-lg mb-2">No properties match your criteria</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters or search in a different neighborhood</p>
          <button
            onClick={() => setFilteredProperties(allProperties)}
            className="mt-4 px-6 py-2 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-800 transition-colors"
          >
            Clear All Filters
          </button>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-emerald-700">{filteredProperties.length}</span> properties found
            </p>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500'}`}
                aria-label="Grid view"
              >
                <HiViewGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500'}`}
                aria-label="Map view"
              >
                <HiMap className="w-4 h-4" />
              </button>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div className="mb-8">
              <NairobiMap properties={filteredProperties} />
            </div>
          ) : (
            <MosaicGrid>
              {filteredProperties.map((property) => (
                <div key={property.id} className="col-span-6 md:col-span-4 lg:col-span-3">
                  <PropertyCard property={property} />
                </div>
              ))}
            </MosaicGrid>
          )}
        </section>
      )}

      <CTASection
        title="Need Help Finding the Right Property?"
        subtitle="Our expert agents know every neighborhood in Nairobi. Let us help you find your perfect match."
        primaryLabel="Speak to an Agent"
        primaryHref="/contact"
        secondaryLabel="Get a Free Valuation"
        secondaryHref="/valuation"
      />
    </>
  );
}
