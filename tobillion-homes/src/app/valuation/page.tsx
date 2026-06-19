'use client';

import { useState, useEffect } from 'react';
import { HubSpotForm } from '@/components/forms/HubSpotForm';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CTASection } from '@/components/ui/CTASection';
import { HiCalculator, HiHome, HiLocationMarker } from 'react-icons/hi';
import Link from 'next/link';

const estimateValue = (type: string, neighborhood: string, size: number, bedrooms: number): number => {
  const basePrices: Record<string, number> = {
    house: 25000000, apartment: 15000000, land: 30000000, commercial: 20000000,
  };
  const neighborhoodMultiplier: Record<string, number> = {
    gigiri: 3.0, runda: 2.8, karen: 2.2, lavington: 1.8, westlands: 1.6,
    kileleshwa: 1.2, kilimani: 1.0, parklands: 1.4, langata: 0.8, eastleigh: 0.5,
  };
  const base = basePrices[type] || 15000000;
  const mult = neighborhoodMultiplier[neighborhood] || 1.0;
  return Math.round(base * mult * (size / 100) * (1 + bedrooms * 0.1));
};

export default function ValuationPage() {
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [formData, setFormData] = useState({ type: 'house', neighborhood: 'kilimani', size: 150, bedrooms: 3, yearBuilt: 2020 });
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Free Property Valuation Tool';
  }, []);

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const type = (form.elements.namedItem('type') as HTMLSelectElement)?.value || 'house';
    const neighborhood = (form.elements.namedItem('neighborhood') as HTMLSelectElement)?.value || 'kilimani';
    const size = Number((form.elements.namedItem('size') as HTMLInputElement)?.value) || 150;
    const bedrooms = Number((form.elements.namedItem('bedrooms') as HTMLSelectElement)?.value) || 3;
    const yearBuilt = Number((form.elements.namedItem('yearBuilt') as HTMLInputElement)?.value) || 2020;
    setFormData({ type, neighborhood, size, bedrooms, yearBuilt });
    setEstimatedValue(estimateValue(type, neighborhood, size, bedrooms));
    setStep('result');
  };

  return (
    <>
      <section className="bg-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Valuation' }]} />
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">Property Valuation Tool</h1>
          <p className="text-gray-500 italic"><em>Get an instant AI-powered estimate of your property&apos;s market value</em></p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 'form' ? (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-xl font-bold text-emerald-900 mb-4">Enter Property Details</h2>
              <form onSubmit={handleEstimate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                  <select name="type" defaultValue="house" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white" required>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Neighborhood *</label>
                  <select name="neighborhood" defaultValue="kilimani" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white" required>
                    <option value="kilimani">Kilimani</option>
                    <option value="westlands">Westlands</option>
                    <option value="karen">Karen</option>
                    <option value="lavington">Lavington</option>
                    <option value="gigiri">Gigiri</option>
                    <option value="langata">Langata</option>
                    <option value="kileleshwa">Kileleshwa</option>
                    <option value="runda">Runda</option>
                    <option value="parklands">Parklands</option>
                    <option value="eastleigh">Eastleigh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size (sqm) *</label>
                  <input type="number" name="size" defaultValue={150} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="e.g., 150" required min={10} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <select name="bedrooms" defaultValue={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
                    <option value="0">Studio/None</option>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                    <option value="6">6+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                  <input type="number" name="yearBuilt" defaultValue={2020} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="e.g., 2020" />
                </div>
                <button type="submit" className="w-full py-3 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 hover:scale-[1.02] transition-all duration-300 border-2 border-transparent hover:border-gold-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                  <HiCalculator className="w-5 h-5 inline mr-2" />
                  Get Instant Estimate
                </button>
              </form>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-6">
              <h3 className="font-bold text-emerald-900 mb-3">How It Works</h3>
              <ul className="space-y-4">
                {[
                  { step: '1', title: 'Enter Details', desc: 'Fill in your property information' },
                  { step: '2', title: 'AI Analysis', desc: 'Our algorithm compares with current Nairobi market data' },
                  { step: '3', title: 'Instant Estimate', desc: 'Get your valuation in seconds' },
                  { step: '4', title: 'Expert Review', desc: 'A certified valuer follows up with a detailed report' },
                ].map((s) => (
                  <li key={s.step} className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-emerald-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{s.step}</span>
                    <div>
                      <p className="font-semibold text-emerald-900 text-sm">{s.title}</p>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-lg mx-auto">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiHome className="w-10 h-10 text-emerald-700" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Estimated Property Value</h2>
            <p className="text-5xl font-bold text-gold-500 mb-2">
              KES {(estimatedValue! / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm text-gray-500 mb-1">
              <HiLocationMarker className="w-4 h-4 inline" /> {formData.neighborhood.charAt(0).toUpperCase() + formData.neighborhood.slice(1)}, Nairobi
            </p>
            <p className="text-xs text-gray-400 mb-6">
              {formData.type} · {formData.size} sqm · {formData.bedrooms} bed · Built {formData.yearBuilt}
            </p>
            <p className="text-xs text-gray-400 mb-8">This is an AI-generated estimate based on current Nairobi market data. A certified valuer will provide the official report.</p>
            <div className="max-w-sm mx-auto">
              <HubSpotForm
                compact
                title="Get Your Full Valuation Report"
                subtitle="Our expert team will send a detailed breakdown within 24 hours"
                submitLabel="Request Full Report"
              />
            </div>
            <button onClick={() => setStep('form')} className="mt-4 text-sm text-gray-500 hover:text-emerald-700 transition-colors">
              ← Start Over
            </button>
          </div>
        )}
      </section>

      <CTASection
        title="Browse Properties in Your Price Range"
        subtitle="Explore Nairobi properties that match your estimated budget"
        primaryLabel="Search Properties"
        primaryHref="/properties"
        secondaryLabel="Contact an Agent"
        secondaryHref="/contact"
      />
    </>
  );
}
