'use client';

import { useEffect, useState } from 'react';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CTASection } from '@/components/ui/CTASection';
import { HiDownload, HiDocumentText, HiPhotograph, HiMail, HiExternalLink } from 'react-icons/hi';

export default function PressPage() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Press & Media Kit';
  }, []);

  const handleDownload = (item: string) => {
    setToast(`Downloading ${item}...`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <section className="bg-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Press & Media Kit' }]} />
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">Press & Media Kit</h1>
          <p className="text-gray-500 italic"><em>Resources for journalists and media professionals</em></p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MosaicGrid>
          <div className="col-span-6 md:col-span-8">
            <h2 className="text-2xl font-bold text-emerald-900 mb-6">Media Resources</h2>
            <div className="grid gap-4">
              {[
                { icon: HiDocumentText, title: 'Company Fact Sheet', desc: 'Overview of the company, key metrics, history, and leadership', file: 'tobillion-fact-sheet.pdf' },
                { icon: HiPhotograph, title: 'Brand Assets & Logo Kit', desc: 'Logo files in PNG, SVG, and EPS formats with brand guidelines', file: 'tobillion-brand-kit.zip' },
                { icon: HiDocumentText, title: 'Press Release: Q1 2026 Results', desc: 'Record KES 1.2B in quarterly transactions', file: 'tobillion-q1-2026-results.pdf' },
                { icon: HiPhotograph, title: 'Property Photography Library', desc: 'High-resolution images of Nairobi properties for editorial use', file: 'tobillion-photo-library.zip' },
              ].map((item) => (
                <div key={item.title} className="bg-white border border-emerald-100 rounded-xl p-5 flex items-start gap-4 hover-card">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-emerald-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(item.file)}
                    className="flex items-center gap-1 text-emerald-700 text-sm font-semibold hover:text-gold-500 transition-colors flex-shrink-0"
                  >
                    <HiDownload className="w-4 h-4" /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-6 md:col-span-4">
            <div className="bg-emerald-50 rounded-2xl p-6">
              <h3 className="font-bold text-emerald-900 mb-3">Press Contact</h3>
              <p className="text-sm text-gray-600 mb-4">
                For media inquiries, interview requests, or additional information, please contact our communications team.
              </p>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <HiMail className="w-4 h-4 text-gold-500" />
                  <a href="mailto:media@tobillionhomes.co.ke" className="text-emerald-700 hover:underline font-medium">
                    media@tobillionhomes.co.ke
                  </a>
                </p>
                <p className="text-xs text-gray-400">Response time: Within 24 hours</p>
              </div>
            </div>

            <div className="mt-4 bg-white border border-emerald-100 rounded-2xl p-6">
              <h3 className="font-bold text-emerald-900 mb-3">Quick Facts</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-emerald-50"><dt className="text-gray-500">Founded</dt><dd className="font-medium">2018</dd></div>
                <div className="flex justify-between py-1 border-b border-emerald-50"><dt className="text-gray-500">Headquarters</dt><dd className="font-medium">Nairobi, Kenya</dd></div>
                <div className="flex justify-between py-1 border-b border-emerald-50"><dt className="text-gray-500">Team Size</dt><dd className="font-medium">50+ employees</dd></div>
                <div className="flex justify-between py-1 border-b border-emerald-50"><dt className="text-gray-500">Total Transactions</dt><dd className="font-medium">KES 5B+</dd></div>
                <div className="flex justify-between py-1"><dt className="text-gray-500">Coverage</dt><dd className="font-medium">10+ neighborhoods</dd></div>
              </dl>
            </div>
          </div>
        </MosaicGrid>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-emerald-900 mb-6">Press Releases</h2>
          <div className="space-y-4">
            {[
              { title: '3D Virtual Property Tours Launched Across Nairobi', date: 'May 15, 2026', excerpt: 'New technology allows buyers to explore properties remotely with interactive 3D walkthroughs, eliminating the need for physical visits during initial screening.' },
              { title: 'Record Q1 2026 Sales of KES 1.2 Billion', date: 'April 2, 2026', excerpt: 'Company achieves highest quarterly performance driven by strong demand in Kilimani, Westlands, and emerging neighborhoods like Kileleshwa.' },
              { title: 'HubSpot Partnership for Enhanced Customer Experience', date: 'March 10, 2026', excerpt: 'Integration brings automated lead tracking, personalized property alerts, and improved client communication through AI-powered CRM.' },
              { title: 'Expansion to Karen & Langata Markets', date: 'January 20, 2026', excerpt: 'Strategic expansion adds 50+ new listings in Nairobi\'s fastest-growing residential areas, strengthening market presence.' },
            ].map((release) => (
              <div key={release.title} className="bg-white border border-emerald-100 rounded-xl p-5 hover-card">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-gold-600 font-semibold">{release.date}</span>
                    <h3 className="font-semibold text-emerald-900 mt-1">{release.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{release.excerpt}</p>
                  </div>
                  <button onClick={() => handleDownload(release.title)} className="flex items-center gap-1 text-emerald-700 text-sm font-semibold hover:text-gold-500 flex-shrink-0 ml-4">
                    <HiExternalLink className="w-4 h-4" /> Read
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-up text-sm">
          {toast}
        </div>
      )}

      <CTASection
        title="Want to Learn More?"
        subtitle="Contact our team for more information, interviews, or partnership inquiries"
        primaryLabel="Contact Us"
        primaryHref="/contact"
        secondaryLabel="About Us"
        secondaryHref="/about"
      />
    </>
  );
}
