'use client';

import { useState, useEffect } from 'react';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CTASection } from '@/components/ui/CTASection';
import { HubSpotForm } from '@/components/forms/HubSpotForm';
import { careerOpenings } from '@/data/mockData';
import { HiBriefcase, HiLocationMarker, HiClock } from 'react-icons/hi';

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    document.title = 'Careers | Join Our Team';
  }, []);

  const applyForJob = (jobTitle: string) => {
    setSelectedJob(jobTitle);
    setShowApplicationForm(true);
  };

  return (
    <>
      <section className="bg-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Careers' }]} />
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-2">Join the Team</h1>
          <p className="text-gray-500 italic"><em>Help us shape Nairobi&apos;s real estate future</em></p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">Why Work With Us?</h2>
            <p className="text-gray-600 mb-6">
              We&apos;re building the future of real estate in Nairobi. We combine traditional
              market expertise with cutting-edge technology to deliver exceptional experiences for our clients.
            </p>
            <ul className="space-y-3">
              {[
                'Competitive salary and uncapped commission structure',
                'Professional development and ongoing training programs',
                'Modern tools and technology stack to excel in your role',
                'Supportive team culture with clear growth opportunities',
                'Health insurance, pension, and comprehensive benefits package',
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-emerald-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div className="aspect-[4/3] rounded-2xl bg-cover bg-center shadow-lg"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80)' }}
          />
        </div>

        <h2 className="text-2xl font-bold text-emerald-900 mb-6">Open Positions</h2>
        <MosaicGrid>
          {careerOpenings.map((job, i) => (
            <div key={job.id} className={`col-span-6 ${i < 2 ? 'md:col-span-6' : 'md:col-span-4'}`}>
              <div className="bg-white border border-emerald-100 rounded-2xl p-6 hover-card h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-emerald-900 text-lg">{job.title}</h3>
                  <span className="text-xs bg-emerald-700 text-white px-2 py-0.5 rounded-full whitespace-nowrap">{job.type}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-wrap">
                  <span className="flex items-center gap-1"><HiBriefcase className="w-4 h-4" /> {job.department}</span>
                  <span className="flex items-center gap-1"><HiLocationMarker className="w-4 h-4" /> {job.location}</span>
                  <span className="flex items-center gap-1"><HiClock className="w-4 h-4" /> Posted {new Date(job.postedAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 flex-1">{job.description}</p>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">Requirements:</p>
                  <ul className="space-y-0.5">
                    {job.requirements.map((req) => (
                      <li key={req} className="text-xs text-gray-500 flex items-start gap-1.5">
                        <span className="w-1 h-1 bg-gold-400 rounded-full mt-1.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => applyForJob(job.title)}
                  className="text-sm font-semibold text-emerald-700 hover:text-gold-500 transition-colors self-start"
                >
                  Apply Now →
                </button>
              </div>
            </div>
          ))}
        </MosaicGrid>

        {showApplicationForm && (
          <div className="mt-16 bg-emerald-50 rounded-2xl p-8">
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl font-bold text-emerald-900 text-center mb-2">
                Apply for {selectedJob}
              </h2>
              <p className="text-sm text-gray-500 text-center mb-6">Fill in your details and our HR team will get back to you within 48 hours.</p>
              <HubSpotForm
                compact
                title=""
                subtitle=""
                fields={[
                  { name: 'fullName', label: 'Full Name', type: 'text', required: true },
                  { name: 'email', label: 'Email Address', type: 'email', required: true },
                  { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
                  { name: 'message', label: 'Why are you a good fit for this role?', type: 'textarea', required: true },
                ]}
                submitLabel={`Apply for ${selectedJob}`}
              />
            </div>
          </div>
        )}

        {!showApplicationForm && (
          <div className="mt-16 bg-emerald-50 rounded-2xl p-8">
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl font-bold text-emerald-900 text-center mb-4">Don&apos;t See a Fit?</h2>
              <p className="text-sm text-gray-500 text-center mb-6">Send us your CV and we&apos;ll keep you in mind for future opportunities.</p>
              <HubSpotForm
                compact
                title=""
                subtitle=""
                fields={[
                  { name: 'fullName', label: 'Full Name', type: 'text', required: true },
                  { name: 'email', label: 'Email Address', type: 'email', required: true },
                  { name: 'message', label: 'Tell us about yourself and your ideal role', type: 'textarea', required: false },
                ]}
                submitLabel="Submit General Application"
              />
            </div>
          </div>
        )}
      </section>

      <CTASection
        title="Learn More About Us"
        subtitle="Discover our story, values, and the team behind Nairobi's premier real estate agency"
        primaryLabel="About Us"
        primaryHref="/about"
        secondaryLabel="Contact Us"
        secondaryHref="/contact"
      />
    </>
  );
}
