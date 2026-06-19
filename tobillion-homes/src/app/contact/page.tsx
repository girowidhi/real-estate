'use client';

import { useEffect, useState } from 'react';
import { HubSpotForm } from '@/components/forms/HubSpotForm';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CTASection } from '@/components/ui/CTASection';
import { COMPANY } from '@/lib/constants';
import { fetchSiteSettings } from '@/lib/client-data';
import { HiPhone, HiMail, HiLocationMarker, HiClock } from 'react-icons/hi';
import { MosaicGrid } from '@/components/layout/MosaicGrid';

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState({ phone: COMPANY.phone, email: COMPANY.email, address: COMPANY.address });

  useEffect(() => {
    document.title = 'Contact Us | Nairobi Real Estate Agency';
    fetchSiteSettings().then(s => {
      if (s.contact_info) setContactInfo({ phone: s.contact_info.phone || COMPANY.phone, email: s.contact_info.email || COMPANY.email, address: s.contact_info.address || COMPANY.address });
    }).catch(() => {});
  }, []);

  return (
    <>
      <section className="bg-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">Contact Us</h1>
          <p className="text-gray-500 italic"><em>Get in touch with Nairobi&apos;s premier real estate team</em></p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <MosaicGrid>
              {[
                { icon: HiPhone, label: 'Phone', value: contactInfo.phone, href: `tel:${contactInfo.phone}` },
                { icon: HiMail, label: 'Email', value: contactInfo.email, href: `mailto:${contactInfo.email}` },
                { icon: HiLocationMarker, label: 'Office', value: contactInfo.address },
                { icon: HiClock, label: 'Office Hours', value: 'Mon-Fri: 8:00 AM - 6:00 PM\nSat: 9:00 AM - 4:00 PM' },
              ].map((item) => (
                <div key={item.label} className="col-span-6 bg-emerald-50 rounded-2xl p-5">
                  <item.icon className="w-6 h-6 text-gold-500 mb-2" />
                  <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="font-semibold text-emerald-900 hover:text-emerald-700 transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-semibold text-emerald-900 whitespace-pre-line">{item.value}</p>
                  )}
                </div>
              ))}
            </MosaicGrid>

            <div className="mt-8 bg-emerald-50 rounded-2xl overflow-hidden h-[250px]">
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1570168009545-3e5a0c0d45d0?w=800&q=80)' }} />
            </div>

            <div className="mt-6 bg-emerald-50 rounded-2xl p-6">
              <h3 className="font-bold text-emerald-900 mb-2">Office Location</h3>
              <p className="text-sm text-gray-600 mb-3">{contactInfo.address}</p>
              <p className="text-sm text-gray-500">We are located on the 3rd floor of Westlands Business Park, opposite the Westgate Shopping Mall. Free visitor parking available.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-100 p-8 shadow-sm">
            <HubSpotForm
              title="Send Us a Message"
              subtitle="We typically respond within 24 hours"
              fields={[
                { name: 'fullName', label: 'Full Name', type: 'text', required: true },
                { name: 'email', label: 'Email Address', type: 'email', required: true },
                { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
                { name: 'interest', label: 'I\'m interested in', type: 'select', required: true, options: ['Buying a property', 'Selling a property', 'Property valuation', 'Property management', 'Investment advice', 'Other'] },
                { name: 'message', label: 'Your Message', type: 'textarea', required: false },
              ]}
              submitLabel="Send Message"
            />
          </div>
        </div>
      </section>

      <CTASection
        title="Prefer to Browse First?"
        subtitle="Explore our full portfolio of Nairobi properties online before reaching out."
        primaryLabel="Browse Properties"
        primaryHref="/properties"
        secondaryLabel="Get a Free Valuation"
        secondaryHref="/valuation"
      />
    </>
  );
}
