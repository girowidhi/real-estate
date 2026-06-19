'use client';

import { useEffect, useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiPhotograph, HiEye, HiEyeOff } from 'react-icons/hi';
import Spinner from '@/components/Spinner';

function parseTags(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return String(val).split(',').map(t => t.trim()).filter(Boolean); }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', image: '', category: '', author: '', tags: '', published: false });
  const [saving, setSaving] = useState(false);
  const [publishedFilter, setPublishedFilter] = useState<string>('');

  useEffect(() => { document.title = 'Blog | Tobillion Admin'; loadPosts(); }, [publishedFilter]);

  const loadPosts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (publishedFilter) params.set('published', publishedFilter);
    const res = await fetch(`/api/admin/blog?${params}`);
    const data = await res.json();
    setPosts(data.data || []);
    setLoading(false);
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', image: '', category: '', author: '', tags: '', published: false });
    setShowForm(true);
  };

  const openEdit = (post: any) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      image: post.image || '',
      category: post.category || '',
      author: post.author || '',
      tags: parseTags(post.tags).join(', '),
      published: !!post.published,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const readTime = Math.max(1, Math.ceil((form.content.length || 0) / 2000));
    const body: any = { ...form, tags, read_time: readTime };
    if (!body.slug) body.slug = generateSlug(body.title);
    if (editing) {
      await fetch(`/api/admin/blog/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch('/api/admin/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setSaving(false); setShowForm(false); loadPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    loadPosts();
  };

  const togglePublished = async (post: any) => {
    const newVal = post.published ? 0 : 1;
    await fetch(`/api/admin/blog/${post.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: newVal, published_at: newVal ? new Date().toISOString() : null }) });
    loadPosts();
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="font-semibold text-gray-800">Blog Posts</h2>
            <p className="text-xs text-gray-400">{posts.length} posts</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={publishedFilter} onChange={(e) => setPublishedFilter(e.target.value)} className="input-field w-auto text-xs">
              <option value="">All</option>
              <option value="1">Published</option>
              <option value="0">Drafts</option>
            </select>
            <button onClick={openNew} className="btn-primary text-xs"><HiPlus className="w-4 h-4" /> New Post</button>
          </div>
        </div>

        {showForm && (
          <div className="p-6 border-b border-gray-100 bg-emerald-50/50">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="input-label">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required /></div>
                <div><label className="input-label">Slug</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" placeholder="Auto-generated" /></div>
                <div><label className="input-label">Author</label><input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="input-field" /></div>
                <div><label className="input-label">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    <option value="">General</option>
                    <option value="Market Insights">Market Insights</option>
                    <option value="Neighborhood Guide">Neighborhood Guide</option>
                    <option value="Buying Guide">Buying Guide</option>
                    <option value="Selling Tips">Selling Tips</option>
                    <option value="Investment">Investment</option>
                    <option value="News">News</option>
                  </select>
                </div>
                <div className="col-span-2"><label className="input-label">Excerpt</label><textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="input-field" rows={2} /></div>
                <div className="col-span-2"><label className="input-label">Content (Markdown)</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field font-mono text-xs" rows={8} /></div>
                <div className="col-span-2">
                  <label className="input-label">Image URL</label>
                  <div className="flex gap-2">
                    <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field flex-1" placeholder="https://..." />
                  </div>
                  {form.image && <img src={form.image} alt="Preview" className="mt-2 h-24 rounded-lg object-cover border border-gray-200" />}
                </div>
                <div className="col-span-2"><label className="input-label">Tags (comma-separated)</label><input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="e.g. luxury, nairobi, kilimani" /></div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-emerald-700" />
                  <span className="text-sm text-gray-700">Published</span>
                </label>
                <span className="text-xs text-gray-400">Read time: ~{Math.max(1, Math.ceil((form.content.length || 0) / 2000))} min</span>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Update Post' : 'Create Post'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Title</th>
                <th className="table-header">Author</th>
                <th className="table-header">Category</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8"><Spinner /></td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-gray-400">No blog posts yet</td></tr>
              ) : posts.map((post) => (
                <tr key={post.id} className="hover:bg-emerald-50/50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      {post.image && <div className="w-9 h-9 rounded bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${post.image})` }} />}
                      <div>
                        <span className="text-sm font-medium text-gray-800">{post.title}</span>
                        {post.tags && parseTags(post.tags).length > 0 && (
                          <div className="flex gap-1 mt-0.5">
                            {parseTags(post.tags).slice(0, 2).map((t: string) => <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-sm text-gray-500">{post.author || '—'}</td>
                  <td className="table-cell"><span className="badge-blue text-xs">{post.category || 'General'}</span></td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${post.published ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="table-cell text-xs text-gray-400">{new Date(post.published_at || post.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => togglePublished(post)} className="p-1.5 text-gray-400 hover:text-emerald-700 rounded hover:bg-emerald-50" title={post.published ? 'Unpublish' : 'Publish'}>
                        {post.published ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openEdit(post)} className="p-1.5 text-gray-400 hover:text-emerald-700 rounded hover:bg-emerald-50"><HiPencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"><HiTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
