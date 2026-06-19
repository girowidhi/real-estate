'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchAgentBySlug, fetchProperties } from '@/lib/client-data';
import { Agent, Property } from '@/types';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { HubSpotForm } from '@/components/forms/HubSpotForm';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CTASection } from '@/components/ui/CTASection';
import Link from 'next/link';
import { HiStar, HiPhone, HiMail, HiShieldCheck } from 'react-icons/hi';
import Spinner from '@/components/ui/Spinner';

export default function AgentProfilePage() {
  const params = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentProperties, setAgentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgent();
  }, [params.slug]);

  const loadAgent = async () => {
    setLoading(true);
    const a = await fetchAgentBySlug(params.slug as string);
    setAgent(a);
    if (a) {
      document.title = `${a.name} | Agent Profile`;
      const props = await fetchProperties({ status: 'available' });
      setAgentProperties(props.filter(p => p.agent.id === a.id));
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <Spinner text="Loading agent..." />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-bold text-emerald-900 mb-2">Agent Not Found</p>
        <Link href="/about" className="text-emerald-700 font-semibold hover:underline">← Meet Our Team</Link>
      </div>
    );
  }

  return (
    <>
      <section className="bg-emerald-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
            { label: agent.name },
          ]} />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-4">
            <img src={agent.photo} alt={agent.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-gold-400 shadow-lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-emerald-900">{agent.name}</h1>
                {agent.verified && (
                  <span className="flex items-center gap-1 bg-emerald-700 text-white text-xs px-2 py-0.5 rounded-full">
                    <HiShieldCheck className="w-3 h-3" /> Verified Agent
                  </span>
                )}
              </div>
              <p className="text-gray-500 mb-2">{agent.bio}</p>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="flex items-center gap-1 text-gold-500 bg-gold-50 px-2 py-0.5 rounded-full">
                  <HiStar className="w-4 h-4" /> {agent.rating} ({agent.reviewCount} reviews)
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">{agent.listings} active listings</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">Member since 2019</span>
              </div>
            </div>
            <div className="flex gap-3">
              <a href={`tel:${agent.phone}`} className="p-3 bg-white border border-emerald-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-colors" aria-label="Call agent">
                <HiPhone className="w-5 h-5 text-emerald-700" />
              </a>
              <a href={`mailto:${agent.email}`} className="p-3 bg-white border border-emerald-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-colors" aria-label="Email agent">
                <HiMail className="w-5 h-5 text-emerald-700" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-emerald-900 mb-4">Listings by {agent.name}</h2>
            {agentProperties.length > 0 ? (
              <MosaicGrid>
                {agentProperties.map((p) => (
                  <div key={p.id} className="col-span-6 md:col-span-4">
                    <PropertyCard property={p} />
                  </div>
                ))}
              </MosaicGrid>
            ) : (
              <div className="text-center py-12 bg-emerald-50 rounded-2xl">
                <p className="text-gray-500">No active listings at the moment.</p>
                <p className="text-sm text-gray-400 mt-1">Contact the agent for upcoming properties.</p>
              </div>
            )}

            <div className="mt-8 bg-emerald-50 rounded-2xl p-6">
              <h3 className="font-bold text-emerald-900 mb-3">About {agent.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{agent.bio}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Total Transactions</p>
                  <p className="font-semibold text-emerald-900">KES 500M+</p>
                </div>
                <div>
                  <p className="text-gray-400">Experience</p>
                  <p className="font-semibold text-emerald-900">6+ Years</p>
                </div>
                <div>
                  <p className="text-gray-400">Areas Covered</p>
                  <p className="font-semibold text-emerald-900">Nairobi (All areas)</p>
                </div>
                <div>
                  <p className="text-gray-400">Languages</p>
                  <p className="font-semibold text-emerald-900">English, Swahili</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm sticky top-28">
              <HubSpotForm
                compact
                title={`Contact ${agent.name}`}
                subtitle="Get a response within 24 hours"
                fields={[
                  { name: 'fullName', label: 'Your Name', type: 'text', required: true },
                  { name: 'email', label: 'Your Email', type: 'email', required: true },
                  { name: 'phone', label: 'Your Phone', type: 'tel', required: true },
                  { name: 'message', label: 'Message', type: 'textarea', required: false },
                ]}
                submitLabel="Send Message"
              />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Meet the Rest of Our Team"
        subtitle="All our agents are experienced professionals dedicated to helping you find the perfect property"
        primaryLabel="View All Agents"
        primaryHref="/about"
        secondaryLabel="Browse Properties"
        secondaryHref="/properties"
      />
    </>
  );
}
