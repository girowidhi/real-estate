'use client';

import { useState, useEffect } from 'react';
import { HiBell, HiTrash, HiPencil, HiPlus } from 'react-icons/hi';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CTASection } from '@/components/ui/CTASection';

interface Alert {
  id: string;
  name: string;
  criteria: string;
  frequency: 'instant' | 'daily' | 'weekly';
  channels: ('email' | 'sms')[];
  enabled: boolean;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', name: 'Kilimani 3-Bed Houses', criteria: 'Type: House | Beds: 3+ | Max: KES 20M', frequency: 'instant', channels: ['email', 'sms'], enabled: true },
    { id: '2', name: 'Westlands Apartments', criteria: 'Type: Apartment | Max: KES 15M', frequency: 'daily', channels: ['email'], enabled: true },
    { id: '3', name: 'Karen Luxury Properties', criteria: 'Max: KES 50M | Min Beds: 4', frequency: 'weekly', channels: ['email'], enabled: false },
  ]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Listing Alerts';
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    showToast('Alert updated');
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    showToast('Alert deleted');
  };

  return (
    <>
      <section className="bg-emerald-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'Alerts' }]} />
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Listing Alerts</h1>
          <p className="text-gray-500 italic"><em>Get notified when new properties match your criteria</em></p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-5 md:p-6 border-b border-emerald-50 last:border-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <HiBell className={`w-5 h-5 mt-0.5 ${alert.enabled ? 'text-gold-500' : 'text-gray-300'}`} />
                  <div>
                    <h3 className="font-semibold text-emerald-900">{alert.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{alert.criteria}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => showToast('Edit feature coming soon')} className="p-1.5 text-gray-400 hover:text-emerald-700 transition-colors" aria-label="Edit">
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteAlert(alert.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete">
                    <HiTrash className="w-4 h-4" />
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={alert.enabled} onChange={() => toggleAlert(alert.id)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-700" />
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400 ml-8">
                <span className="bg-gray-100 px-2 py-0.5 rounded-full">Frequency: {alert.frequency}</span>
                <span>Channels: {alert.channels.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => showToast('New alert creation form coming soon')}
          className="mt-6 w-full py-3 border-2 border-dashed border-emerald-200 rounded-xl text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
        >
          <HiPlus className="w-5 h-5" /> Create New Alert
        </button>

        <div className="mt-8 bg-emerald-50 rounded-2xl p-6">
          <h3 className="font-bold text-emerald-900 mb-2">How Alerts Work</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-emerald-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              Set your property criteria (location, price, type, bedrooms)
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-emerald-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              Choose how often you want to be notified (instant, daily, or weekly)
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-emerald-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              Select your preferred channels (email and/or SMS)
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-emerald-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
              Get notified immediately when matching properties are listed
            </li>
          </ul>
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-up text-sm">
          {toast}
        </div>
      )}

      <CTASection
        title="Ready to Find Your Next Property?"
        subtitle="Browse our full catalog of Nairobi properties while you set up your alerts"
        primaryLabel="Browse Properties"
        primaryHref="/properties"
        secondaryLabel="Contact an Agent"
        secondaryHref="/contact"
      />
    </>
  );
}
