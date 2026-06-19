'use client';

import { useEffect, useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import Spinner from '@/components/Spinner';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: number;
  created_at: string;
}

export default function FAQsPage() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', category: '', sort_order: 0, is_published: true });

  useEffect(() => { document.title = 'FAQs | Tobillion Admin'; load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/faqs');
      if (!r.ok) { setItems([]); setLoading(false); return; }
      const d = await r.json();
      setItems(Array.isArray(d) ? d : []);
    } catch { setItems([]); }
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ question: '', answer: '', category: '', sort_order: items.length, is_published: true });
    setModalOpen(true);
  };

  const openEdit = (f: FAQ) => {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, category: f.category || '', sort_order: f.sort_order ?? 0, is_published: !!f.is_published });
    setModalOpen(true);
  };

  const openDelete = (f: FAQ) => setDeleteTarget(f);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { ...form, is_published: form.is_published ? 1 : 0 };
    try {
      if (editing) {
        await fetch(`/api/admin/faqs/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        await fetch('/api/admin/faqs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      setModalOpen(false);
      load();
    } catch {}
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/admin/faqs/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    load();
  };

  const categories = [...new Set(items.map(f => f.category).filter(Boolean))];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="font-semibold text-gray-800">FAQ Items</h2>
            <p className="text-xs text-gray-400">{items.length} questions</p>
          </div>
          <button onClick={openNew} className="btn-primary text-xs"><HiPlus className="w-4 h-4" /> Add FAQ</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Question</th>
                <th className="table-header">Category</th>
                <th className="table-header">Status</th>
                <th className="table-header">Order</th>
                <th className="table-header w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8"><Spinner /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-sm text-gray-400">No FAQs yet</td></tr>
              ) : items.map((f) => (
                <tr key={f.id} className="hover:bg-emerald-50/50">
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-800">{f.question}</div>
                  </td>
                  <td className="table-cell">
                    {f.category ? (
                      <span className="badge-blue">{f.category}</span>
                    ) : (
                      <span className="text-xs text-gray-400">Uncategorized</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${f.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {f.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="table-cell text-sm text-gray-400">{f.sort_order}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(f)} className="p-1.5 text-gray-400 hover:text-emerald-700 rounded hover:bg-emerald-50"><HiPencil className="w-4 h-4" /></button>
                      <button onClick={() => openDelete(f)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"><HiTrash className="w-4 h-4" /></button>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit FAQ' : 'New FAQ'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="input-label">Question *</label>
                <input type="text" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="input-label">Answer *</label>
                <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="input-field" rows={5} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Category</label>
                  <div className="flex gap-2">
                    <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" list="faq-categories" placeholder="e.g. Buying, Selling" />
                    <datalist id="faq-categories">
                      {categories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
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
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Update FAQ' : 'Create FAQ'}</button>
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
            <h3 className="font-semibold text-gray-800 mb-2">Delete FAQ</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete this FAQ?</p>
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm font-medium text-gray-800">{deleteTarget.question}</p>
            </div>
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
