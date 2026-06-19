'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPropertyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', slug: '', price: 0, currency: 'KES', type: 'house',
    bedrooms: 1, bathrooms: 1, area: 0, area_unit: 'sqm',
    location: '', address: '', lat: -1.2921, lng: 36.8219,
    description: '', status: 'available', year_built: 2024,
    featured: false, verified: false,
    images: [] as string[], amenities: [] as string[], features: [] as string[],
    agent_id: '', neighborhood: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agents, setAgents] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);

  useEffect(() => {
    document.title = 'New Property | Tobillion Admin';
    Promise.all([
      fetch('/api/admin/agents').then(r => r.json()).catch(() => []),
      fetch('/api/admin/neighborhoods').then(r => r.json()).catch(() => []),
    ]).then(([a, n]) => { setAgents(a); setNeighborhoods(n); });
  }, []);

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, slug: form.slug || generateSlug(form.title) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to create property');
      setLoading(false);
    } else {
      router.push(`/admin/properties/${data.id}`);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-gray-800">New Property</h2>
        </div>
        <div className="card-body">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="input-label">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" placeholder="Auto-generated if empty" />
              </div>
              <div>
                <label className="input-label">Price *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input-field" required />
              </div>
              <div>
                <label className="input-label">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className="input-label">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                  <option value="coming-soon">Coming Soon</option>
                </select>
              </div>
              <div>
                <label className="input-label">Bedrooms</label>
                <input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })} className="input-field" min="0" />
              </div>
              <div>
                <label className="input-label">Bathrooms</label>
                <input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })} className="input-field" min="0" />
              </div>
              <div>
                <label className="input-label">Area (sqm)</label>
                <input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: Number(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="input-label">Year Built</label>
                <input type="number" value={form.year_built} onChange={(e) => setForm({ ...form, year_built: Number(e.target.value) })} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="input-label">Latitude</label>
                <input type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="input-label">Longitude</label>
                <input type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Neighborhood</label>
                <select value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="input-field">
                  <option value="">Select neighborhood</option>
                  {neighborhoods.map((n: any) => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Agent</label>
                <select value={form.agent_id} onChange={(e) => setForm({ ...form, agent_id: e.target.value })} className="input-field">
                  <option value="">No agent assigned</option>
                  {agents.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[120px]" rows={5} />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} />
                <span className="text-sm">Verified</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create Property'}</button>
              <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
