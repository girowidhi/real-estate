'use client';

import { useEffect, useState, useRef } from 'react';
import { HiPlus, HiPencil, HiTrash, HiPhotograph, HiX, HiStar } from 'react-icons/hi';
import Spinner from '@/components/Spinner';

interface Agent {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  photo: string;
  bio: string;
  title: string;
  verified: boolean;
  sort_order: number;
  listings: number;
  rating: number;
  review_count: number;
  created_at: string;
}

export default function AgentsPage() {
  const [items, setItems] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', email: '', phone: '', photo: '', bio: '', title: '', verified: false, sort_order: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = 'Agents | Tobillion Admin'; load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/agents');
      if (!r.ok) { setItems([]); setLoading(false); return; }
      const d = await r.json();
      setItems(Array.isArray(d) ? d : []);
    } catch { setItems([]); }
    setLoading(false);
  };

  const genSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', slug: '', email: '', phone: '', photo: '', bio: '', title: '', verified: false, sort_order: items.length });
    setModalOpen(true);
  };

  const openEdit = (a: Agent) => {
    setEditing(a);
    setForm({ name: a.name, slug: a.slug || '', email: a.email || '', phone: a.phone || '', photo: a.photo || '', bio: a.bio || '', title: a.title || '', verified: !!a.verified, sort_order: a.sort_order ?? 0 });
    setModalOpen(true);
  };

  const openDelete = (a: Agent) => setDeleteTarget(a);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      setForm(f => ({ ...f, photo: data.url }));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { ...form, slug: form.slug || genSlug(form.name), verified: form.verified ? 1 : 0 };
    try {
      if (editing) {
        await fetch(`/api/admin/agents/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        await fetch('/api/admin/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      setModalOpen(false);
      load();
    } catch {}
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/admin/agents/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    load();
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="font-semibold text-gray-800">Agents</h2>
            <p className="text-xs text-gray-400">{items.length} agents</p>
          </div>
          <button onClick={openNew} className="btn-primary text-xs"><HiPlus className="w-4 h-4" /> Add Agent</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Agent</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Title</th>
                <th className="table-header">Listings</th>
                <th className="table-header">Rating</th>
                <th className="table-header">Status</th>
                <th className="table-header w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8"><Spinner /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-sm text-gray-400">No agents yet</td></tr>
              ) : items.map((a) => (
                <tr key={a.id} className="hover:bg-emerald-50/50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-cover bg-center bg-gray-100 flex-shrink-0" style={a.photo ? { backgroundImage: `url(${a.photo})` } : {}}>
                        {!a.photo && <span className="flex items-center justify-center w-full h-full text-xs text-gray-400 font-medium">{a.name.charAt(0)}</span>}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{a.name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-sm text-gray-500">{a.email}<br />{a.phone && <span className="text-xs text-gray-400">{a.phone}</span>}</td>
                  <td className="table-cell text-sm text-gray-500">{a.title || '—'}</td>
                  <td className="table-cell text-sm text-gray-500">{a.listings || 0}</td>
                  <td className="table-cell text-xs">{a.rating ? <span><HiStar className="w-3.5 h-3.5 text-gold-500 inline" /> {a.rating}</span> : '—'}</td>
                  <td className="table-cell">
                    {a.verified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Verified</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Unverified</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(a)} className="p-1.5 text-gray-400 hover:text-emerald-700 rounded hover:bg-emerald-50"><HiPencil className="w-4 h-4" /></button>
                      <button onClick={() => openDelete(a)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"><HiTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Agent' : 'New Agent'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Photo Upload */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {form.photo ? (
                    <>
                      <img src={form.photo} alt="Photo" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setForm({ ...form, photo: '' })} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"><HiX className="w-3 h-3" /></button>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs text-center">Photo</span>
                  )}
                </div>
                <div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary text-xs"><HiPhotograph className="w-4 h-4" /> Upload Photo</button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  <p className="text-xs text-gray-400 mt-1">Or paste URL below</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="input-label">Photo URL</label>
                  <input type="text" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} className="input-field" placeholder="https://... or upload above" />
                </div>
                <div className="col-span-2">
                  <label className="input-label">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="input-label">Slug</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" placeholder="Auto-generated" />
                </div>
                <div>
                  <label className="input-label">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Senior Agent" />
                </div>
                <div>
                  <label className="input-label">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="input-label">Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+254..." />
                </div>
                <div className="col-span-2">
                  <label className="input-label">Bio</label>
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field" rows={3} />
                </div>
                <div>
                  <label className="input-label">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="input-field" min="0" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-emerald-700" />
                    <span className="text-sm text-gray-700">Verified Agent</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Update Agent' : 'Create Agent'}</button>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-2">Delete Agent</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete <strong>{deleteTarget.name}</strong>? Properties assigned to this agent will lose their agent association.</p>
            <div className="flex gap-2">
              <button onClick={handleDeleteConfirm} className="btn-danger">Delete</button>
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
