'use client';

import { useState, useEffect } from 'react';
import { HiPhone } from 'react-icons/hi';
import { COMPANY } from '@/lib/constants';
import { fetchSiteSettings } from '@/lib/client-data';

export function StickyCTA() {
  const [contactInfo, setContactInfo] = useState({ phone: COMPANY.phone, email: COMPANY.email });

  useEffect(() => {
    fetchSiteSettings().then(s => {
      if (s.contact_info) setContactInfo({ phone: s.contact_info.phone || COMPANY.phone, email: s.contact_info.email || COMPANY.email });
    }).catch(() => {});
  }, []);

  return (
    <div className="hidden md:block bg-emerald-900 text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
        <div className="flex items-center gap-4">
          <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-1.5 hover:text-gold-400 transition-colors">
            <HiPhone className="w-3.5 h-3.5" /> {contactInfo.phone}
          </a>
          <span className="text-emerald-400">|</span>
          <a href={`mailto:${contactInfo.email}`} className="hover:text-gold-400 transition-colors text-emerald-200">
            {contactInfo.email}
          </a>
        </div>
        <p className="text-emerald-300 text-xs">
          <span className="text-gold-400 font-semibold">Limited units available</span> in Kilimani & Westlands
        </p>
      </div>
    </div>
  );
}
