'use client';

import { useEffect, useState } from 'react';
import { HiPencil, HiX, HiPlus, HiTrash } from 'react-icons/hi';
import Spinner from '@/components/Spinner';

const PAGE_KEYS = ['home', 'about', 'contact', 'faq', 'footer'];
const SECTION_KEYS = ['hero', 'features', 'cards', 'testimonials', 'footer', 'links'];

interface PageContent {
  id: string;
  page_key: string;
  section_key: string;
  content: any;
  is_published: number;
  version: number;
}

export default function PagesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PageContent | null>(null);
  const [editing, setEditing] = useState<PageContent | null>(null);
  const [content, setContent] = useState<any>({});
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Page Content | Tobillion Admin'; load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/pages');
      if (!r.ok) { setItems([]); setLoading(false); return; }
      const d = await r.json();
      setItems(Array.isArray(d) ? d.map(parseDbContent) : []);
    } catch { setItems([]); }
    setLoading(false);
  };

  const parseDbContent = (row: any) => ({
    ...row,
    content: typeof row.content === 'string' ? tryParse(row.content) : row.content,
  });

  const tryParse = (s: string) => { try { return JSON.parse(s); } catch { return s; } };

  const openEditor = (item: any) => {
    setEditing(item);
    setContent(structuredClone(item.content || {}));
    setModalOpen(true);
    setError('');
  };

  const openNew = (pageKey: string, sectionKey: string) => {
    const defaults: any = { headline: '', subheadline: '' };
    if (sectionKey === 'features') defaults.items = [{ title: '', description: '', icon: 'user' }];
    if (sectionKey === 'testimonials') defaults.items = [{ name: '', role: '', content: '', avatar: '' }];
    if (sectionKey === 'links') defaults.columns = [{ title: '', links: [{ label: '', href: '' }] }];
    setEditing({ page_key: pageKey, section_key: sectionKey, content: defaults, is_published: 1, version: 1 } as any);
    setContent(structuredClone(defaults));
    setModalOpen(true);
    setError('');
  };

  const openDelete = (item: PageContent) => setDeleteTarget(item);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_key: editing!.page_key,
          section_key: editing!.section_key,
          content,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Save failed'); setSaving(false); return; }
      setToast('Content saved');
      setTimeout(() => setToast(''), 3000);
      setModalOpen(false);
      load();
    } catch { setError('Save failed'); }
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/admin/pages/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    load();
  };

  const updateContent = (key: string, value: any) => setContent({ ...content, [key]: value });

  // --- Hero fields ---
  const isHero = editing?.section_key === 'hero';
  const isFeatures = editing?.section_key === 'features';
  const isTestimonials = editing?.section_key === 'testimonials';
  const isLinks = editing?.section_key === 'links';

  const heroFields = ['headline', 'subheadline', 'cta_text', 'cta_link'];

  const grouped = PAGE_KEYS.map(pk => ({
    pageKey: pk,
    sections: SECTION_KEYS.map(sk => ({
      sectionKey: sk,
      item: items.find((i: any) => i.page_key === pk && i.section_key === sk),
    })),
  }));

  return (
    <div>
      {toast && <div className="fixed top-4 right-4 z-[60] bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{toast}</div>}
      <div className="card">
        <div className="card-header"><h2 className="font-semibold text-gray-800">Page Content Editor</h2></div>
        <div className="card-body">
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <div className="space-y-8">
              {grouped.map((group) => (
                <div key={group.pageKey}>
                  <h3 className="text-lg font-semibold text-emerald-800 capitalize mb-3 border-b border-emerald-100 pb-2">{group.pageKey} Page</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.sections.map((sec) => (
                      <div key={sec.sectionKey} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 capitalize">{sec.sectionKey}</span>
                          <div className="flex items-center gap-1">
                            {sec.item && (
                              <button onClick={() => openDelete(sec.item)} className="text-gray-400 hover:text-red-600 p-1">
                                <HiTrash className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button onClick={() => sec.item ? openEditor(sec.item) : openNew(group.pageKey, sec.sectionKey)} className="text-gray-400 hover:text-emerald-700 p-1">
                              <HiPencil className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {sec.item ? (
                          <p className="text-xs text-gray-400 truncate">{JSON.stringify(sec.item.content).substring(0, 80)}...</p>
                        ) : (
                          <p className="text-xs text-gray-300 italic">Not set — click to create</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {sec.item?.is_published ? (
                            <span className="badge-emerald">Published</span>
                          ) : (
                            <span className="badge-draft">Draft</span>
                          )}
                          {sec.item && <span className="text-xs text-gray-400">v{sec.item.version || 1}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-800 capitalize">Edit: {editing!.page_key} / {editing!.section_key}</h3>
                <p className="text-xs text-gray-400 mt-0.5">v{editing!.version || 1}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

              {/* Hero fields */}
              {isHero && heroFields.map(field => (
                <div key={field}>
                  <label className="input-label capitalize">{field.replace(/_/g, ' ')}</label>
                  {field === 'subheadline' ? (
                    <textarea value={content[field] || ''} onChange={e => updateContent(field, e.target.value)} className="input-field" rows={2} />
                  ) : (
                    <input type="text" value={content[field] || ''} onChange={e => updateContent(field, e.target.value)} className="input-field" />
                  )}
                </div>
              ))}

              {/* Features items */}
              {isFeatures && (
                <div>
                  <label className="input-label">Feature Items</label>
                  <div className="space-y-3">
                    {(content.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">Item {idx + 1}</span>
                          <button type="button" onClick={() => {
                            const items = [...(content.items || [])];
                            items.splice(idx, 1);
                            updateContent('items', items);
                          }} className="text-red-400 hover:text-red-600"><HiTrash className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="input-label text-[11px]">Title</label>
                            <input type="text" value={item.title} onChange={e => {
                              const items = [...(content.items || [])];
                              items[idx] = { ...items[idx], title: e.target.value };
                              updateContent('items', items);
                            }} className="input-field text-sm" />
                          </div>
                          <div>
                            <label className="input-label text-[11px]">Icon</label>
                            <input type="text" value={item.icon} onChange={e => {
                              const items = [...(content.items || [])];
                              items[idx] = { ...items[idx], icon: e.target.value };
                              updateContent('items', items);
                            }} className="input-field text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="input-label text-[11px]">Description</label>
                          <input type="text" value={item.description} onChange={e => {
                            const items = [...(content.items || [])];
                            items[idx] = { ...items[idx], description: e.target.value };
                            updateContent('items', items);
                          }} className="input-field text-sm" />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => updateContent('items', [...(content.items || []), { title: '', description: '', icon: 'user' }])} className="btn-secondary text-xs"><HiPlus className="w-4 h-4" /> Add Feature</button>
                  </div>
                </div>
              )}

              {/* Testimonials items */}
              {isTestimonials && (
                <div>
                  <label className="input-label">Testimonial Items</label>
                  <div className="space-y-3">
                    {(content.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">Item {idx + 1}</span>
                          <button type="button" onClick={() => {
                            const items = [...(content.items || [])];
                            items.splice(idx, 1);
                            updateContent('items', items);
                          }} className="text-red-400 hover:text-red-600"><HiTrash className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="input-label text-[11px]">Name</label>
                            <input type="text" value={item.name} onChange={e => {
                              const items = [...(content.items || [])];
                              items[idx] = { ...items[idx], name: e.target.value };
                              updateContent('items', items);
                            }} className="input-field text-sm" />
                          </div>
                          <div>
                            <label className="input-label text-[11px]">Role</label>
                            <input type="text" value={item.role} onChange={e => {
                              const items = [...(content.items || [])];
                              items[idx] = { ...items[idx], role: e.target.value };
                              updateContent('items', items);
                            }} className="input-field text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="input-label text-[11px]">Content</label>
                          <textarea value={item.content} onChange={e => {
                            const items = [...(content.items || [])];
                            items[idx] = { ...items[idx], content: e.target.value };
                            updateContent('items', items);
                          }} className="input-field text-sm" rows={2} />
                        </div>
                        <div>
                          <label className="input-label text-[11px]">Avatar URL</label>
                          <input type="text" value={item.avatar} onChange={e => {
                            const items = [...(content.items || [])];
                            items[idx] = { ...items[idx], avatar: e.target.value };
                            updateContent('items', items);
                          }} className="input-field text-sm" />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => updateContent('items', [...(content.items || []), { name: '', role: '', content: '', avatar: '' }])} className="btn-secondary text-xs"><HiPlus className="w-4 h-4" /> Add Testimonial</button>
                  </div>
                </div>
              )}

              {/* Footer links */}
              {isLinks && (
                <div>
                  <label className="input-label">Link Columns</label>
                  <div className="space-y-4">
                    {(content.columns || []).map((col: any, ci: number) => (
                      <div key={ci} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">Column {ci + 1}</span>
                          <button type="button" onClick={() => {
                            const cols = [...(content.columns || [])];
                            cols.splice(ci, 1);
                            updateContent('columns', cols);
                          }} className="text-red-400 hover:text-red-600"><HiTrash className="w-4 h-4" /></button>
                        </div>
                        <div>
                          <label className="input-label text-[11px]">Column Title</label>
                          <input type="text" value={col.title} onChange={e => {
                            const cols = [...(content.columns || [])];
                            cols[ci] = { ...cols[ci], title: e.target.value };
                            updateContent('columns', cols);
                          }} className="input-field text-sm" />
                        </div>
                        <div className="space-y-2 ml-2 border-l-2 border-gray-100 pl-4">
                          <label className="input-label text-[11px] text-gray-500">Links</label>
                          {(col.links || []).map((link: any, li: number) => (
                            <div key={li} className="flex items-center gap-2">
                              <input type="text" value={link.label} onChange={e => {
                                const cols = [...(content.columns || [])];
                                cols[ci].links = [...(cols[ci].links || [])];
                                cols[ci].links[li] = { ...cols[ci].links[li], label: e.target.value };
                                updateContent('columns', cols);
                              }} className="input-field text-sm flex-1" placeholder="Label" />
                              <input type="text" value={link.href} onChange={e => {
                                const cols = [...(content.columns || [])];
                                cols[ci].links = [...(cols[ci].links || [])];
                                cols[ci].links[li] = { ...cols[ci].links[li], href: e.target.value };
                                updateContent('columns', cols);
                              }} className="input-field text-sm flex-1" placeholder="/path" />
                              <button type="button" onClick={() => {
                                const cols = [...(content.columns || [])];
                                cols[ci].links = cols[ci].links.filter((_: any, i: number) => i !== li);
                                updateContent('columns', cols);
                              }} className="text-red-400 hover:text-red-600 flex-shrink-0"><HiTrash className="w-4 h-4" /></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => {
                            const cols = [...(content.columns || [])];
                            cols[ci] = { ...cols[ci], links: [...(cols[ci].links || []), { label: '', href: '' }] };
                            updateContent('columns', cols);
                          }} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"><HiPlus className="w-3 h-3" /> Add Link</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => updateContent('columns', [...(content.columns || []), { title: '', links: [{ label: '', href: '' }] }])} className="btn-secondary text-xs"><HiPlus className="w-4 h-4" /> Add Column</button>
                  </div>
                </div>
              )}

              {/* Fallback JSON editor for unknown section types */}
              {!isHero && !isFeatures && !isTestimonials && !isLinks && (
                <div>
                  <label className="input-label">Content (JSON)</label>
                  <textarea value={JSON.stringify(content, null, 2)} onChange={e => {
                    try { setContent(JSON.parse(e.target.value)); setError(''); } catch { setError('Invalid JSON'); }
                  }} className="input-field font-mono text-xs" rows={14} />
                </div>
              )}

              {/* JSON preview */}
              <div className="pt-2 border-t border-gray-100">
                <details className="group">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">Raw JSON</summary>
                  <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-[10px] font-mono text-gray-500 overflow-x-auto max-h-32">{JSON.stringify(content, null, 2)}</pre>
                </details>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Content'}</button>
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-2">Delete Page Content</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete the <strong>{deleteTarget.page_key}</strong> / <strong>{deleteTarget.section_key}</strong> section?
            </p>
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
