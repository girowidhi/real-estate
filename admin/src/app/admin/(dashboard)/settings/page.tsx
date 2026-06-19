'use client';

import { useEffect, useState, useRef } from 'react';
import { HiPencil, HiX, HiPhotograph, HiColorSwatch } from 'react-icons/hi';
import Spinner from '@/components/Spinner';

interface SecuritySettings {
  max_login_attempts: number;
  login_window_minutes: number;
  session_expiry_hours: number;
  min_password_length: number;
  audit_log_enabled: boolean;
  failed_login_notification: boolean;
  force_password_reset_days: number;
  ip_whitelist: string;
  ip_blacklist: string;
}

interface Settings {
  seo_meta: { title: string; description: string; keywords: string };
  contact_info: { phone: string; email: string; address: string };
  social_links: { facebook: string; instagram: string; twitter: string; linkedin: string };
  branding: { logo: string; logo_size: number };
  security_settings: SecuritySettings;
}

const SECURITY_DEFAULTS: SecuritySettings = {
  max_login_attempts: 5,
  login_window_minutes: 15,
  session_expiry_hours: 24,
  min_password_length: 8,
  audit_log_enabled: true,
  failed_login_notification: true,
  force_password_reset_days: 90,
  ip_whitelist: '',
  ip_blacklist: '',
};

const DEFAULTS: Settings = {
  seo_meta: { title: '', description: '', keywords: '' },
  contact_info: { phone: '', email: '', address: '' },
  social_links: { facebook: '', instagram: '', twitter: '', linkedin: '' },
  branding: { logo: '', logo_size: 48 },
  security_settings: SECURITY_DEFAULTS,
};

type SectionKey = keyof Settings;

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [modalSection, setModalSection] = useState<SectionKey | null>(null);
  const [form, setForm] = useState<any>({});
  const [removingBg, setRemovingBg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalFileRef = useRef<File | null>(null);

  useEffect(() => { document.title = 'Settings | Tobillion Admin'; load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings({
        seo_meta: { ...DEFAULTS.seo_meta, ...data.seo_meta },
        contact_info: { ...DEFAULTS.contact_info, ...data.contact_info },
        social_links: { ...DEFAULTS.social_links, ...data.social_links },
        branding: { ...DEFAULTS.branding, ...data.branding },
        security_settings: { ...SECURITY_DEFAULTS, ...data.security_settings },
      });
    } catch {}
    setLoading(false);
  };

  const openModal = (section: SectionKey) => {
    setForm({ ...settings[section] });
    setModalSection(section);
  };

  const handleSave = async () => {
    if (!modalSection) return;
    setSaving(true);
    const body = { [modalSection]: form };
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setSettings(s => ({ ...s, [modalSection]: form }));
      setToast(`${modalSection.replace(/_/g, ' ')} saved`);
      setTimeout(() => setToast(''), 3000);
      setModalSection(null);
    }
    setSaving(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    originalFileRef.current = file;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const data = await res.json();
      setForm((f: any) => ({ ...f, logo: data.url }));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveBackground = async () => {
    const file = originalFileRef.current;
    if (!file) {
      setToast('Re-upload the logo first, then remove background');
      setTimeout(() => setToast(''), 3000);
      return;
    }
    setRemovingBg(true);
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const resultBlob = await removeBackground(file);
      const fd = new FormData();
      fd.append('file', resultBlob, 'logo-removebg.png');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setForm((f: any) => ({ ...f, logo: data.url }));
        setToast('Background removed');
        setTimeout(() => setToast(''), 3000);
      }
    } catch {
      setToast('Background removal failed');
      setTimeout(() => setToast(''), 3000);
    }
    setRemovingBg(false);
  };

  const label = (s: SectionKey) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  const sections: { key: SectionKey; description: string }[] = [
    { key: 'seo_meta', description: 'Site title, meta description, and SEO keywords' },
    { key: 'contact_info', description: 'Phone, email, and business address' },
    { key: 'social_links', description: 'Facebook, Instagram, Twitter, LinkedIn URLs' },
    { key: 'branding', description: 'Company logo and display size' },
    { key: 'security_settings', description: 'Login attempts, session expiry, password rules, IP restrictions' },
  ];

  return (
    <div>
      {toast && <div className="fixed top-4 right-4 z-[60] bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">{toast}</div>}

      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map(({ key, description }) => (
          <div key={key} className="card">
            <div className="card-header">
              <div>
                <h2 className="font-semibold text-gray-800">{label(key)}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{description}</p>
              </div>
              <button onClick={() => openModal(key)} className="btn-secondary text-xs"><HiPencil className="w-4 h-4" /> Edit</button>
            </div>
            <div className="card-body">
              {key === 'seo_meta' && (
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-400">Title:</span> <span className="text-gray-700">{settings.seo_meta.title || '—'}</span></div>
                  <div><span className="text-gray-400">Description:</span> <span className="text-gray-700">{settings.seo_meta.description || '—'}</span></div>
                  <div><span className="text-gray-400">Keywords:</span> <span className="text-gray-700">{settings.seo_meta.keywords || '—'}</span></div>
                </div>
              )}
              {key === 'contact_info' && (
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-400">Phone:</span> <span className="text-gray-700">{settings.contact_info.phone || '—'}</span></div>
                  <div><span className="text-gray-400">Email:</span> <span className="text-gray-700">{settings.contact_info.email || '—'}</span></div>
                  <div><span className="text-gray-400">Address:</span> <span className="text-gray-700">{settings.contact_info.address || '—'}</span></div>
                </div>
              )}
              {key === 'social_links' && (
                <div className="space-y-1 text-sm">
                  {(['facebook', 'instagram', 'twitter', 'linkedin'] as const).map(p => (
                    <div key={p}><span className="text-gray-400 capitalize">{p}:</span> <span className="text-gray-700">{settings.social_links[p] || '—'}</span></div>
                  ))}
                </div>
              )}
              {key === 'branding' && (
                <div className="flex items-center gap-3">
                  {settings.branding.logo ? (
                    <img src={settings.branding.logo} alt="Logo" className="rounded-lg border border-gray-100 bg-gray-50" style={{ width: Math.min(settings.branding.logo_size, 96), height: Math.min(settings.branding.logo_size, 96), objectFit: 'contain' }} />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">Logo</div>
                  )}
                  <div className="text-sm text-gray-500">
                    {settings.branding.logo ? 'Logo set' : 'No logo'} · Size: {settings.branding.logo_size}px
                  </div>
                </div>
              )}
              {key === 'security_settings' && (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${settings.security_settings.audit_log_enabled ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span className="text-gray-400">Audit Log:</span> <span className="text-gray-700">{settings.security_settings.audit_log_enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div><span className="text-gray-400">Max Login Attempts:</span> <span className="text-gray-700">{settings.security_settings.max_login_attempts}</span></div>
                  <div><span className="text-gray-400">Session Expiry:</span> <span className="text-gray-700">{settings.security_settings.session_expiry_hours}h</span></div>
                  <div><span className="text-gray-400">Min Password Length:</span> <span className="text-gray-700">{settings.security_settings.min_password_length} chars</span></div>
                  <div><span className="text-gray-400">Password Reset:</span> <span className="text-gray-700">Every {settings.security_settings.force_password_reset_days} days</span></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {modalSection && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalSection(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Edit {label(modalSection)}</h3>
              <button onClick={() => setModalSection(null)} className="text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
              {modalSection === 'seo_meta' && (
                <>
                  <div>
                    <label className="input-label">Site Title</label>
                    <input type="text" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Meta Description</label>
                    <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
                  </div>
                  <div>
                    <label className="input-label">Keywords (comma-separated)</label>
                    <input type="text" value={form.keywords || ''} onChange={e => setForm({ ...form, keywords: e.target.value })} className="input-field" />
                  </div>
                </>
              )}

              {modalSection === 'contact_info' && (
                <>
                  <div>
                    <label className="input-label">Phone</label>
                    <input type="text" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+254 700 123 456" />
                  </div>
                  <div>
                    <label className="input-label">Email</label>
                    <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="info@example.com" />
                  </div>
                  <div>
                    <label className="input-label">Address</label>
                    <input type="text" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field" />
                  </div>
                </>
              )}

              {modalSection === 'social_links' && (
                <>
                  {(['facebook', 'instagram', 'twitter', 'linkedin'] as const).map(p => (
                    <div key={p}>
                      <label className="input-label capitalize">{p}</label>
                      <input type="url" value={form[p] || ''} onChange={e => setForm({ ...form, [p]: e.target.value })} className="input-field" placeholder={`https://${p}.com/...`} />
                    </div>
                  ))}
                </>
              )}

              {modalSection === 'branding' && (
                <>
                  <div>
                    <label className="input-label">Company Logo</label>
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
                  </div>
                  <div>
                    <label className="input-label">Logo URL</label>
                    <input type="text" value={form.logo || ''} onChange={e => setForm({ ...form, logo: e.target.value })} className="input-field" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="input-label">Logo Size: <span className="text-emerald-700 font-semibold">{form.logo_size || 48}px</span></label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">16</span>
                      <input type="range" min={16} max={128} value={form.logo_size || 48} onChange={e => setForm({ ...form, logo_size: Number(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-700" />
                      <span className="text-xs text-gray-400">128</span>
                    </div>
                    {form.logo && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center justify-center">
                        <img src={form.logo} alt="Preview" className="object-contain" style={{ width: form.logo_size || 48, height: form.logo_size || 48 }} />
                      </div>
                    )}
                  </div>
                </>
              )}

              {modalSection === 'security_settings' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Max Login Attempts</label>
                      <input type="number" value={form.max_login_attempts ?? 5} onChange={e => setForm({ ...form, max_login_attempts: Number(e.target.value) })} className="input-field" min={1} max={20} />
                    </div>
                    <div>
                      <label className="input-label">Login Window (minutes)</label>
                      <input type="number" value={form.login_window_minutes ?? 15} onChange={e => setForm({ ...form, login_window_minutes: Number(e.target.value) })} className="input-field" min={1} max={1440} />
                    </div>
                    <div>
                      <label className="input-label">Session Expiry (hours)</label>
                      <input type="number" value={form.session_expiry_hours ?? 24} onChange={e => setForm({ ...form, session_expiry_hours: Number(e.target.value) })} className="input-field" min={1} max={720} />
                    </div>
                    <div>
                      <label className="input-label">Min Password Length</label>
                      <input type="number" value={form.min_password_length ?? 8} onChange={e => setForm({ ...form, min_password_length: Number(e.target.value) })} className="input-field" min={4} max={64} />
                    </div>
                    <div>
                      <label className="input-label">Force Password Reset (days)</label>
                      <input type="number" value={form.force_password_reset_days ?? 90} onChange={e => setForm({ ...form, force_password_reset_days: Number(e.target.value) })} className="input-field" min={0} max={365} />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.audit_log_enabled ?? true} onChange={e => setForm({ ...form, audit_log_enabled: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-emerald-700" />
                        <span className="text-sm text-gray-700">Audit Logging</span>
                      </label>
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.failed_login_notification ?? true} onChange={e => setForm({ ...form, failed_login_notification: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-emerald-700" />
                        <span className="text-sm text-gray-700">Failed Login Alerts</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="input-label">IP Whitelist (one per line)</label>
                    <textarea value={form.ip_whitelist || ''} onChange={e => setForm({ ...form, ip_whitelist: e.target.value })} className="input-field font-mono text-xs" rows={3} placeholder="192.168.1.0/24&#10;10.0.0.0/8" />
                  </div>
                  <div>
                    <label className="input-label">IP Blacklist (one per line)</label>
                    <textarea value={form.ip_blacklist || ''} onChange={e => setForm({ ...form, ip_blacklist: e.target.value })} className="input-field font-mono text-xs" rows={3} placeholder="1.2.3.4&#10;5.6.7.0/24" />
                  </div>
                  <p className="text-xs text-gray-400">Changes to rate limiting and session expiry take effect on next server restart.</p>
                </>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setModalSection(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
