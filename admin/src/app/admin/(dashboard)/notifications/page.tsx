'use client';

import { useEffect, useState } from 'react';
import { HiCheck, HiX, HiShieldExclamation, HiMail, HiTrash } from 'react-icons/hi';
import Spinner from '@/components/Spinner';

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Notifications | Tobillion Admin'; load(); }, []);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/notifications');
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  const notifyChanged = () => { globalThis.dispatchEvent(new CustomEvent('notifications-changed')); };

  const markDelivered = async (ids: string[]) => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    load();
    notifyChanged();
  };

  const clearDelivered = async () => {
    const delivered = items.filter(n => n.delivered_at);
    if (delivered.length === 0) return;
    await fetch('/api/admin/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: delivered.map(n => n.id) }),
    });
    load();
    notifyChanged();
  };

  const unreadCount = items.filter(n => !n.delivered_at).length;
  const typeIcon = (type: string) => {
    if (type === 'security') return <HiShieldExclamation className="w-4 h-4 text-red-500" />;
    if (type === 'email') return <HiMail className="w-4 h-4 text-blue-500" />;
    return <HiCheck className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-gray-800">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[11px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full px-1.5">{unreadCount}</span>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={() => markDelivered(items.filter(n => !n.delivered_at).map(n => n.id))} className="btn-secondary text-xs">Mark All Read</button>
          )}
          {items.some(n => n.delivered_at) && (
            <button onClick={clearDelivered} className="btn-secondary text-xs flex items-center gap-1"><HiTrash className="w-3 h-3" /> Clear Read</button>
          )}
        </div>
      </div>
      <div className="card-body p-0">
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <HiCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((n) => (
              <div
                key={n.id}
                className={`px-6 py-4 flex items-start gap-3 transition-colors ${!n.delivered_at ? 'bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer' : 'hover:bg-gray-50'}`}
                onClick={() => { if (!n.delivered_at) markDelivered([n.id]); }}
              >
                <div className="mt-0.5 flex-shrink-0">{typeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!n.delivered_at ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                    {!n.delivered_at && <span className="w-2 h-2 rounded-full bg-gold-500 flex-shrink-0" />}
                  </div>
                  {n.message && <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>}
                  <p className="text-xs text-gray-300 mt-1">{new Date(n.created_at).toLocaleString('en-KE')}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${n.type === 'email' ? 'bg-blue-100 text-blue-800' : n.type === 'security' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>{n.type}</span>
                {n.delivered_at && (
                  <button onClick={(e) => { e.stopPropagation(); markDelivered([n.id]); }} className="text-gray-300 hover:text-red-500 mt-0.5 flex-shrink-0" title="Dismiss">
                    <HiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
