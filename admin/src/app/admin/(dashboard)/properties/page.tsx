'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HiPlus, HiSearch, HiPencil, HiTrash, HiFilter, HiDownload } from 'react-icons/hi';
import Spinner from '@/components/Spinner';

interface Property {
  id: string;
  title: string;
  slug: string;
  price: number;
  type: string;
  status: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  is_published?: boolean;
  created_at: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    document.title = 'Properties | Tobillion Admin';
  }, []);

  useEffect(() => {
    loadProperties();
  }, [page, statusFilter, typeFilter]);

  const loadProperties = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);

    const res = await fetch(`/api/admin/properties?${params}`);
    const data = await res.json();
    setProperties(data.data || []);
    setTotalPages(data.pagination?.totalPages || 1);
    setTotal(data.pagination?.total || 0);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
    loadProperties();
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0 || !confirm(`Delete ${selected.size} properties?`)) return;
    await Promise.all([...selected].map(id => fetch(`/api/admin/properties/${id}`, { method: 'DELETE' })));
    setSelected(new Set());
    loadProperties();
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleExport = () => {
    const csv = [
      ['Title', 'Price', 'Type', 'Status', 'Location', 'Bedrooms', 'Bathrooms', 'Area', 'Created'].join(','),
      ...properties.map(p => [p.title, p.price, p.type, p.status, p.location, p.bedrooms, p.bathrooms, p.area, p.created_at].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `properties-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const statusColors: Record<string, string> = {
    available: 'bg-emerald-100 text-emerald-800',
    sold: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    'coming-soon': 'bg-blue-100 text-blue-800',
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="font-semibold text-gray-800">Properties</h2>
            <p className="text-xs text-gray-400">{total} total listings</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="btn-secondary text-xs">
              <HiDownload className="w-4 h-4" /> Export
            </button>
            {selected.size > 0 && (
              <button onClick={handleBulkDelete} className="btn-danger text-xs">
                Delete {selected.size}
              </button>
            )}
            <Link href="/admin/properties/new" className="btn-primary text-xs">
              <HiPlus className="w-4 h-4" /> Add Property
            </Link>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              onKeyDown={(e) => e.key === 'Enter' && loadProperties()}
              className="input-field pl-9"
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="pending">Pending</option>
            <option value="coming-soon">Coming Soon</option>
          </select>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
          <button onClick={loadProperties} className="btn-secondary"><HiFilter className="w-4 h-4" /> Filter</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header w-10"><input type="checkbox" onChange={() => { if (selected.size === properties.length) setSelected(new Set()); else setSelected(new Set(properties.map(p => p.id))); }} checked={selected.size === properties.length && properties.length > 0} /></th>
                <th className="table-header">Property</th>
                <th className="table-header">Price</th>
                <th className="table-header">Type</th>
                <th className="table-header">Status</th>
                <th className="table-header">Beds/Baths</th>
                <th className="table-header">Area</th>
                <th className="table-header">Created</th>
                <th className="table-header w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12"><Spinner /></td></tr>
              ) : properties.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-sm text-gray-400">No properties found</td></tr>
              ) : properties.map((p) => (
                <tr key={p.id} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="table-cell"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${p.images?.[0] || ''})` }} />
                      <div>
                        <Link href={`/admin/properties/${p.id}`} className="text-sm font-medium text-emerald-700 hover:text-gold-500">{p.title}</Link>
                        <p className="text-xs text-gray-400">{p.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell font-medium">KES {p.price?.toLocaleString()}</td>
                  <td className="table-cell capitalize text-xs">{p.type}</td>
                  <td className="table-cell"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span></td>
                  <td className="table-cell text-xs text-gray-500">{p.bedrooms}bd / {p.bathrooms}ba</td>
                  <td className="table-cell text-xs text-gray-500">{p.area} sqm</td>
                  <td className="table-cell text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/properties/${p.id}`} className="p-1.5 text-gray-400 hover:text-emerald-700 rounded hover:bg-emerald-50"><HiPencil className="w-4 h-4" /></Link>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"><HiTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="pagination-btn">Previous</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="pagination-btn">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
