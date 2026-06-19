'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Spinner from '@/components/Spinner';
import { HiTrash, HiUpload, HiPhotograph, HiArrowUp, HiArrowDown, HiPlus, HiX } from 'react-icons/hi';

function parseJson(val: any, fallback: any = null) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

interface FormData {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  area_unit: string;
  year_built: number;
  location: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  featured: boolean;
  verified: boolean;
  images: string[];
  amenities: string[];
  features: string[];
  floor_plans: any[];
  agent_id: string;
  neighborhood: string;
  is_published: boolean;
}

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [agents, setAgents] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [amenityInput, setAmenityInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    document.title = 'Edit Property | Tobillion Admin';
    Promise.all([
      fetch('/api/admin/agents').then(r => r.json()).catch(() => []),
      fetch('/api/admin/neighborhoods').then(r => r.json()).catch(() => []),
    ]).then(([a, n]) => { setAgents(a); setNeighborhoods(n); });
  }, []);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/admin/properties/${params.id}`)
      .then(r => r.json())
      .then((data: any) => {
        setForm({
          ...data,
          images: parseJson(data.images, []),
          amenities: parseJson(data.amenities, []),
          features: parseJson(data.features, []),
          floor_plans: parseJson(data.floor_plans, []),
          neighborhood: data.neighborhood || '',
        });
        setFetching(false);
      })
      .catch(() => { setError('Failed to load property'); setFetching(false); });
  }, [params.id]);

  const update = (patch: Partial<FormData>) => setForm(f => f ? { ...f, ...patch } : f);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setLoading(true);
    setError('');
    const res = await fetch(`/api/admin/properties/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to update');
    } else {
      setToast('Property updated successfully');
      setTimeout(() => setToast(''), 3000);
    }
    setLoading(false);
  };

  const handlePublish = async (publish: boolean) => {
    const body = { is_published: publish, published_at: publish ? new Date().toISOString() : null };
    const res = await fetch(`/api/admin/properties/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      setToast(publish ? 'Property published' : 'Property unpublished');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        update({ images: [...(form?.images || []), data.url] });
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const arr = [...(form?.images || [])];
    arr.splice(index, 1);
    update({ images: arr });
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const arr = [...(form?.images || [])];
    const target = index + direction;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    update({ images: arr });
  };

  const addAmenity = () => {
    const val = amenityInput.trim();
    if (!val) return;
    if ((form?.amenities || []).includes(val)) { setAmenityInput(''); return; }
    update({ amenities: [...(form?.amenities || []), val] });
    setAmenityInput('');
  };

  const removeAmenity = (index: number) => {
    const arr = [...(form?.amenities || [])];
    arr.splice(index, 1);
    update({ amenities: arr });
  };

  const addFeature = () => {
    const val = featureInput.trim();
    if (!val) return;
    if ((form?.features || []).includes(val)) { setFeatureInput(''); return; }
    update({ features: [...(form?.features || []), val] });
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    const arr = [...(form?.features || [])];
    arr.splice(index, 1);
    update({ features: arr });
  };

  const addFloorPlan = () => {
    update({ floor_plans: [...(form?.floor_plans || []), { title: '', image: '', price: 0, size: '' }] });
  };

  const updateFloorPlan = (index: number, patch: any) => {
    const arr = [...(form?.floor_plans || [])];
    arr[index] = { ...arr[index], ...patch };
    update({ floor_plans: arr });
  };

  const removeFloorPlan = (index: number) => {
    const arr = [...(form?.floor_plans || [])];
    arr.splice(index, 1);
    update({ floor_plans: arr });
  };

  if (fetching) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (error) return <div className="card p-6 text-red-600">{error}</div>;
  if (!form) return <div className="card p-6 text-gray-400">Property not found</div>;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/admin/properties" className="text-sm text-gray-400 hover:text-emerald-700">&larr; Back to Properties</Link>
      </div>

      {toast && <div className="toast-success mb-4">{toast}</div>}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-gray-800">Edit: {form.title}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => handlePublish(!form.is_published)} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${form.is_published ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}>
              {form.is_published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
        <div className="card-body">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100 w-full">Basic Information</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="input-label">Title *</label>
                  <input type="text" value={form.title} onChange={(e) => update({ title: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="input-label">Slug</label>
                  <input type="text" value={form.slug} onChange={(e) => update({ slug: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Neighborhood</label>
                  <select value={form.neighborhood || ''} onChange={(e) => update({ neighborhood: e.target.value })} className="input-field">
                    <option value="">Select neighborhood</option>
                    {neighborhoods.map((n: any) => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Price</label>
                  <input type="number" value={form.price} onChange={(e) => update({ price: Number(e.target.value) })} className="input-field" required />
                </div>
                <div>
                  <label className="input-label">Currency</label>
                  <select value={form.currency} onChange={(e) => update({ currency: e.target.value })} className="input-field">
                    <option value="KES">KES</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Type</label>
                  <select value={form.type} onChange={(e) => update({ type: e.target.value })} className="input-field">
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Status</label>
                  <select value={form.status} onChange={(e) => update({ status: e.target.value })} className="input-field">
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="pending">Pending</option>
                    <option value="coming-soon">Coming Soon</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Bedrooms</label>
                  <input type="number" value={form.bedrooms} onChange={(e) => update({ bedrooms: Number(e.target.value) })} className="input-field" min="0" />
                </div>
                <div>
                  <label className="input-label">Bathrooms</label>
                  <input type="number" value={form.bathrooms} onChange={(e) => update({ bathrooms: Number(e.target.value) })} className="input-field" min="0" />
                </div>
                <div>
                  <label className="input-label">Area</label>
                  <input type="number" value={form.area} onChange={(e) => update({ area: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Area Unit</label>
                  <select value={form.area_unit} onChange={(e) => update({ area_unit: e.target.value })} className="input-field">
                    <option value="sqm">sqm</option>
                    <option value="sqft">sqft</option>
                    <option value="acres">acres</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Year Built</label>
                  <input type="number" value={form.year_built} onChange={(e) => update({ year_built: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Agent</label>
                  <select value={form.agent_id || ''} onChange={(e) => update({ agent_id: e.target.value })} className="input-field">
                    <option value="">No agent assigned</option>
                    {agents.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Location */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100 w-full">Location</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="input-label">Location (area description)</label>
                  <input type="text" value={form.location} onChange={(e) => update({ location: e.target.value })} className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="input-label">Address</label>
                  <input type="text" value={form.address || ''} onChange={(e) => update({ address: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Latitude</label>
                  <input type="number" step="any" value={form.lat} onChange={(e) => update({ lat: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Longitude</label>
                  <input type="number" step="any" value={form.lng} onChange={(e) => update({ lng: Number(e.target.value) })} className="input-field" />
                </div>
              </div>
            </fieldset>

            {/* Photos */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100 w-full">Photos</legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                {(form.images || []).map((img, i) => (
                  <div key={i} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="p-1 bg-white/90 rounded hover:bg-white disabled:opacity-30"><HiArrowUp className="w-4 h-4" /></button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} className="p-1 bg-white/90 rounded hover:bg-white disabled:opacity-30"><HiArrowDown className="w-4 h-4" /></button>
                      <button type="button" onClick={() => removeImage(i)} className="p-1 bg-red-500/90 rounded hover:bg-red-600"><HiTrash className="w-4 h-4 text-white" /></button>
                    </div>
                    {i === 0 && <span className="absolute top-1 left-1 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-medium">Main</span>}
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-emerald-600 transition-colors">
                  {uploading ? <Spinner /> : <><HiPhotograph className="w-6 h-6" /><span className="text-xs">Upload</span></>}
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
              <p className="text-xs text-gray-400">Click upload to add photos. Hover to reorder or delete. First image is the main photo.</p>
            </fieldset>

            {/* Description */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100 w-full">Description</legend>
              <textarea value={form.description || ''} onChange={(e) => update({ description: e.target.value })} className="input-field min-h-[150px]" rows={6} />
            </fieldset>

            {/* Amenities */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100 w-full">Amenities</legend>
              <div className="flex flex-wrap gap-2 mb-3">
                {(form.amenities || []).map((a, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-full">
                    {a}
                    <button type="button" onClick={() => removeAmenity(i)} className="text-emerald-400 hover:text-red-500"><HiX className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())} placeholder="Type and press Enter or click Add" className="input-field flex-1" />
                <button type="button" onClick={addAmenity} className="btn-secondary text-xs"><HiPlus className="w-4 h-4" /> Add</button>
              </div>
            </fieldset>

            {/* Features */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100 w-full">Features</legend>
              <div className="flex flex-wrap gap-2 mb-3">
                {(form.features || []).map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-gold-50 text-amber-800 text-xs px-2.5 py-1 rounded-full">
                    {f}
                    <button type="button" onClick={() => removeFeature(i)} className="text-amber-400 hover:text-red-500"><HiX className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="Type and press Enter or click Add" className="input-field flex-1" />
                <button type="button" onClick={addFeature} className="btn-secondary text-xs"><HiPlus className="w-4 h-4" /> Add</button>
              </div>
            </fieldset>

            {/* Floor Plans */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100 w-full">Floor Plans</legend>
              {(form.floor_plans || []).map((fp, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg mb-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input type="text" value={fp.title || ''} onChange={(e) => updateFloorPlan(i, { title: e.target.value })} placeholder="Plan title" className="input-field text-xs" />
                    <input type="number" value={fp.price || 0} onChange={(e) => updateFloorPlan(i, { price: Number(e.target.value) })} placeholder="Price" className="input-field text-xs" />
                    <input type="text" value={fp.size || ''} onChange={(e) => updateFloorPlan(i, { size: e.target.value })} placeholder="Size (e.g. 120 sqm)" className="input-field text-xs" />
                    <input type="text" value={fp.image || ''} onChange={(e) => updateFloorPlan(i, { image: e.target.value })} placeholder="Image URL" className="input-field text-xs" />
                  </div>
                  <button type="button" onClick={() => removeFloorPlan(i)} className="p-1.5 text-gray-400 hover:text-red-600"><HiTrash className="w-4 h-4" /></button>
                </div>
              ))}
              <button type="button" onClick={addFloorPlan} className="btn-secondary text-xs"><HiPlus className="w-4 h-4" /> Add Floor Plan</button>
            </fieldset>

            {/* Toggles */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100 w-full">Settings</legend>
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => update({ featured: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-500" />
                  <span className="text-sm text-gray-700">Featured Property</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.verified} onChange={(e) => update({ verified: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-500" />
                  <span className="text-sm text-gray-700">Verified Listing</span>
                </label>
              </div>
            </fieldset>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" onClick={() => router.push('/admin/properties')} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
