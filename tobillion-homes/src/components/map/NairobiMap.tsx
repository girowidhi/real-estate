'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HiSearch, HiAdjustments, HiX } from 'react-icons/hi';
import { NEIGHBORHOODS } from '@/lib/constants';
import { Property } from '@/types';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface NairobiMapProps {
  properties?: Property[];
  onPropertyClick?: (property: Property) => void;
}

export function NairobiMap({ properties = [], onPropertyClick }: NairobiMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayer, setActiveLayer] = useState<'all' | 'price' | 'developments'>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [36.8219, -1.2921],
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;
      setMapLoaded(true);

      NEIGHBORHOODS.forEach((hood) => {
        const el = document.createElement('div');
        el.className = 'w-4 h-4 bg-emerald-700 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-150 transition-transform';
        el.title = hood.name;

        new mapboxgl.Marker({ element: el })
          .setLngLat([hood.lng, hood.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <p class="font-bold text-emerald-700">${hood.name}</p>
              <p class="text-sm text-gray-500">Avg: KES ${(hood.avgPrice / 1000000).toFixed(1)}M</p>
              <p class="text-xs text-gray-400">Popular area</p>
            </div>
          `))
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const filteredNeighborhoods = NEIGHBORHOODS.filter((n) =>
    n.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-[calc(100vh-12rem)] min-h-[500px] rounded-2xl overflow-hidden border border-emerald-100 shadow-lg">
      {/* Search overlay */}
      <div className="absolute top-4 left-4 right-4 md:right-auto z-10 md:w-80">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search neighborhoods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/95 backdrop-blur-sm border border-emerald-100 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
        {searchQuery && filteredNeighborhoods.length > 0 && (
          <div className="mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100 overflow-hidden">
            {filteredNeighborhoods.map((n) => (
              <button
                key={n.slug}
                onClick={() => {
                  map.current?.flyTo({ center: [n.lng, n.lat], zoom: 14 });
                  setSearchQuery('');
                  setSelectedNeighborhood(n.slug);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-emerald-50 transition-colors flex items-center justify-between"
              >
                <span className="font-medium text-gray-700">{n.name}</span>
                <span className="text-gold-600 text-xs">KES {(n.avgPrice / 1000000).toFixed(1)}M</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Layer controls */}
      <div className="absolute top-4 right-4 z-10 hidden md:block">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100 p-2">
          <button
            onClick={() => setActiveLayer('all')}
            className={`block w-full px-4 py-2 text-sm rounded-lg text-left transition-colors ${
              activeLayer === 'all' ? 'bg-emerald-700 text-white' : 'text-gray-600 hover:bg-emerald-50'
            }`}
          >
            All Properties
          </button>
          <button
            onClick={() => setActiveLayer('price')}
            className={`block w-full px-4 py-2 text-sm rounded-lg text-left transition-colors ${
              activeLayer === 'price' ? 'bg-emerald-700 text-white' : 'text-gray-600 hover:bg-emerald-50'
            }`}
          >
            Price Heatmap
          </button>
          <button
            onClick={() => setActiveLayer('developments')}
            className={`block w-full px-4 py-2 text-sm rounded-lg text-left transition-colors ${
              activeLayer === 'developments' ? 'bg-emerald-700 text-white' : 'text-gray-600 hover:bg-emerald-50'
            }`}
          >
            New Developments
          </button>
        </div>
      </div>

      {/* Mobile filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden absolute bottom-4 right-4 z-10 bg-white shadow-lg rounded-full p-3 border border-emerald-100"
      >
        <HiAdjustments className="w-5 h-5 text-emerald-700" />
      </button>

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-emerald-50/90 backdrop-blur-sm z-20">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗺️</span>
            </div>
            <h3 className="text-lg font-bold text-emerald-900 mb-2">Map requires API Key</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add your Mapbox token to <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code> in <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">.env.local</code>
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Map will display all Nairobi neighborhoods with:</p>
              <p>• Clickable pins with property previews</p>
              <p>• Price heatmap layer toggle</p>
              <p>• Street-level zoom capability</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile filter panel */}
      {showFilters && (
        <div className="md:hidden absolute bottom-20 left-4 right-4 z-10 bg-white rounded-xl shadow-xl border border-emerald-100 p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-sm">Map Layers</span>
            <button onClick={() => setShowFilters(false)}><HiX className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-2">
            {(['all', 'price', 'developments'] as const).map((layer) => (
              <button
                key={layer}
                onClick={() => { setActiveLayer(layer); setShowFilters(false); }}
                className={`flex-1 py-2 text-xs rounded-lg font-medium transition-colors ${
                  activeLayer === layer ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {layer === 'all' ? 'All' : layer === 'price' ? 'Heatmap' : 'New Dev'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
