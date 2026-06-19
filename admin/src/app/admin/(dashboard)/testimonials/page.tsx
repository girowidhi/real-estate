'use client';

import { useEffect, useState, useRef } from 'react';
import { HiPlus, HiPencil, HiTrash, HiPhotograph, HiX } from 'react-icons/hi';
import Spinner from '@/components/Spinner';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
  is_published: number;
  sort_order: number;
  created_at: string;
}

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ name: '', role: '', company: '', content: '', avatar: '', rating: 5, is_published: true, sort_order: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = 'Testimonials | Tobillion Admin'; load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/testimonials');
      if (!r.ok) { setItems([]); setLoading(false); return; }
      const d = await r.json();
      setItems(Array.isArray(d) ? d : []);
    } catch { setItems([]); }
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', role: '', company: '', content: '', avatar: '', rating: 5, is_published: true, sort_order: items.length });
    setModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ name: t.name, role: t.role || '', company: t.company || '', content: t.content, avatar: t.avatar || '', rating: t.rating || 5, is_published: !!t.is_published, sort_order: t.sort_order ?? 0 });
    setModalOpen(true);
  };

  const openDelete = (t: Testimonial) => setDeleteTarget(t);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      setForm(f => ({ ...f, avatar: data.url }));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { ...form, is_published: form.is_published ? 1 : 0 };
    try {
      if (editing) {
        await fetch(`/api/admin/testimonials/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        await fetch('/api/admin/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      setModalOpen(false);
      load();
    } catch {}
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/admin/testimonials/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    load();
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="font-semibold text-gray-800">Testimonials</h2>
            <p className="text-xs text-gray-400">{items.length} testimonials</p>
          </div>
          <button onClick={openNew} className="btn-primary text-xs"><HiPlus className="w-4 h-4" /> Add Testimonial</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Avatar</th>
                <th className="table-header">Name</th>
                <th className="table-header">Role</th>
                <th className="table-header">Content</th>
                <th className="table-header">Rating</th>
                <th className="table-header">Status</th>
                <th className="table-header w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8"><Spinner /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-sm text-gray-400">No testimonials yet</td></tr>
              ) : items.map((t) => (
                <tr key={t.id} className="hover:bg-emerald-50/50">
                  <td className="table-cell">
                    <div className="w-9 h-9 rounded-full bg-cover bg-center bg-gray-100" style={{ backgroundImage: t.avatar ? `url(${t.avatar})` : undefined }}>
                      {!t.avatar && <span className="flex items-center justify-center w-full h-full text-xs text-gray-400 font-medium">{t.name.charAt(0)}</span>}
                    </div>
                  </td>
                  <td className="table-cell"><span className="text-sm font-medium text-gray-800">{t.name}</span></td>
                  <td className="table-cell text-sm text-gray-500">{t.role}{t.company ? `, ${t.company}` : ''}</td>
                  <td className="table-cell text-xs text-gray-400 max-w-[220px] truncate">{t.content}</td>
                  <td className="table-cell text-xs">{'★'.repeat(t.rating || 5)}{'☆'.repeat(5 - (t.rating || 5))}</td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {t.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-emerald-700 rounded hover:bg-emerald-50"><HiPencil className="w-4 h-4" /></button>
                      <button onClick={() => openDelete(t)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"><HiTrash className="w-4 h-4" /></button>
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
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Testimonial' : 'New Testimonial'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {form.avatar ? (
                    <>
                      <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setForm({ ...form, avatar: '' })} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"><HiX className="w-3 h-3" /></button>
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
                  <label className="input-label">Avatar URL</label>
                  <input type="text" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} className="input-field" placeholder="https://... or upload above" />
                </div>
                <div className="col-span-2">
                  <label className="input-label">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="input-label">Role</label>
                  <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field" placeholder="e.g. Home Buyer" />
                </div>
                <div>
                  <label className="input-label">Company</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="input-label">Content *</label>
                  <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field" rows={3} required />
                </div>
                <div>
                  <label className="input-label">Rating</label>
                  <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="input-field">
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</option>)}
                  </select>
                </div>
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
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Update Testimonial' : 'Create Testimonial'}</button>
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
            <h3 className="font-semibold text-gray-800 mb-2">Delete Testimonial</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete the testimonial from <strong>{deleteTarget.name}</strong>?</p>
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
