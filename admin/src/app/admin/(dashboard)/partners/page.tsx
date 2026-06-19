'use client';

import { useEffect, useState, useRef } from 'react';
import { HiPlus, HiPencil, HiTrash, HiPhotograph, HiX, HiColorSwatch } from 'react-icons/hi';
import Spinner from '@/components/Spinner';

interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string;
  is_published: number;
  sort_order: number;
  created_at: string;
}

export default function PartnersPage() {
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState({ name: '', logo: '', website: '', is_published: true, sort_order: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalFileRef = useRef<File | null>(null);

  useEffect(() => { document.title = 'Partners | Tobillion Admin'; load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/partners');
      if (!r.ok) { setItems([]); setLoading(false); return; }
      const d = await r.json();
      setItems(Array.isArray(d) ? d : []);
    } catch { setItems([]); }
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', logo: '', website: '', is_published: true, sort_order: items.length });
    setModalOpen(true);
  };

  const openEdit = (p: Partner) => {
    setEditing(p);
    setForm({ name: p.name, logo: p.logo || '', website: p.website || '', is_published: !!p.is_published, sort_order: p.sort_order ?? 0 });
    setModalOpen(true);
  };

  const openDelete = (p: Partner) => setDeleteTarget(p);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    originalFileRef.current = file;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      setForm(f => ({ ...f, logo: data.url }));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveBackground = async () => {
    const file = originalFileRef.current;
    if (!file) return;
    setRemovingBg(true);
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const resultBlob = await removeBackground(file);
      const fd = new FormData();
      fd.append('file', resultBlob, 'logo-removebg.png');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setForm(f => ({ ...f, logo: data.url }));
      }
    } catch {}
    setRemovingBg(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { ...form, is_published: form.is_published ? 1 : 0 };
    try {
      if (editing) {
        await fetch(`/api/admin/partners/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        await fetch('/api/admin/partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      setModalOpen(false);
      load();
    } catch {}
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/admin/partners/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    load();
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="font-semibold text-gray-800">Partners</h2>
            <p className="text-xs text-gray-400">{items.length} partners</p>
          </div>
          <button onClick={openNew} className="btn-primary text-xs"><HiPlus className="w-4 h-4" /> Add Partner</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Partner</th>
                <th className="table-header">Website</th>
                <th className="table-header">Status</th>
                <th className="table-header">Order</th>
                <th className="table-header w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8"><Spinner /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-sm text-gray-400">No partners yet</td></tr>
              ) : items.map((p) => (
                <tr key={p.id} className="hover:bg-emerald-50/50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                        {p.logo ? (
                          <img src={p.logo} alt={p.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">{p.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    {p.website ? (
                      <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{p.website}</a>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {p.is_published ? 'Published' : 'Hidden'}
                    </span>
                  </td>
                  <td className="table-cell text-sm text-gray-400">{p.sort_order}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-emerald-700 rounded hover:bg-emerald-50"><HiPencil className="w-4 h-4" /></button>
                      <button onClick={() => openDelete(p)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"><HiTrash className="w-4 h-4" /></button>
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
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Partner' : 'New Partner'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Logo Upload */}
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {form.logo ? (
                    <>
                      <img src={form.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                      <button type="button" onClick={() => setForm({ ...form, logo: '' })} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"><HiX className="w-3 h-3" /></button>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs text-center">Logo</span>
                  )}
                </div>
                <div className="space-y-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary text-xs w-full"><HiPhotograph className="w-4 h-4" /> Upload Logo</button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  {form.logo && (
                    <button type="button" onClick={handleRemoveBackground} disabled={removingBg} className="btn-secondary text-xs w-full">
                      <HiColorSwatch className="w-4 h-4" /> {removingBg ? 'Removing...' : 'Remove Background'}
                    </button>
                  )}
                  <p className="text-xs text-gray-400">Or paste URL below</p>
                </div>
              </div>

              <div>
                <label className="input-label">Logo URL</label>
                <input type="text" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className="input-field" placeholder="https://... or upload above" />
              </div>
              <div>
                <label className="input-label">Partner Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="input-label">Website</label>
                <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input-field" placeholder="https://example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="input-field" min="0" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-emerald-700" />
                <span className="text-sm text-gray-700">Published</span>
              </label>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Update Partner' : 'Create Partner'}</button>
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
            <h3 className="font-semibold text-gray-800 mb-2">Delete Partner</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete <strong>{deleteTarget.name}</strong>?</p>
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
