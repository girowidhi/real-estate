'use client';

import { useEffect, useState } from 'react';
import { MosaicGrid } from '@/components/layout/MosaicGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CTASection } from '@/components/ui/CTASection';
import { BubbleTestimonials } from '@/components/ui/BubbleTestimonial';
import { fetchAgents, fetchTestimonialsFromDb } from '@/lib/client-data';
import { Agent } from '@/types';
import Link from 'next/link';
import { HiShieldCheck, HiStar, HiUsers, HiHome } from 'react-icons/hi';
import { motion } from 'framer-motion';
import Spinner from '@/components/ui/Spinner';

export default function AboutPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'About Us | Nairobi Real Estate Agency';
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [a, t] = await Promise.all([fetchAgents(), fetchTestimonialsFromDb()]);
    setAgents(a);
    setTestimonials(t);
    setLoading(false);
  };

  return (
    <>
      <section className="bg-emerald-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
          <div className="grid md:grid-cols-2 gap-12 items-center mt-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-4">
                About Us
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Founded in 2018, we have grown to become one of Nairobi&apos;s most trusted real estate agencies. 
                We combine deep local expertise with modern technology to help you find the perfect property.
              </p>
              <p className="text-gray-500 mb-8">
                From luxury apartments in Westlands to family homes in Karen, our team has facilitated over KES 5 billion 
                in property transactions across Nairobi&apos;s finest neighborhoods. Our commitment to transparency, integrity, 
                and client satisfaction sets us apart in Kenya&apos;s competitive real estate market.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { value: '500+', label: 'Properties Sold' },
                  { value: '2,000+', label: 'Happy Clients' },
                  { value: '8+', label: 'Years Experience' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-emerald-100">
                    <p className="text-2xl font-bold text-emerald-700">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {agents.map((a) => (
                    <img key={a.id} src={a.photo} alt={a.name} className="w-10 h-10 rounded-full border-2 border-white" />
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-emerald-700">50+</span> team members across Nairobi
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-cover bg-center shadow-xl"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80)' }}
              />
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg border border-emerald-100">
                <p className="text-3xl font-bold text-emerald-700">8+</p>
                <p className="text-xs text-gray-500">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-emerald-900 text-center mb-4">Our Core Values</h2>
        <p className="text-gray-500 italic text-center mb-12"><em>What drives us every day</em></p>
        <MosaicGrid>
          {[
            { icon: HiShieldCheck, title: 'Trust & Integrity', desc: 'Every transaction is handled with complete transparency and ethical standards. We believe honest business is the only business.' },
            { icon: HiStar, title: 'Excellence', desc: 'We maintain the highest standards of service delivery across all touchpoints, from first contact to post-sale support.' },
            { icon: HiUsers, title: 'Client First', desc: 'Your needs drive everything we do. We provide personalized service tailored to each clients unique requirements.' },
            { icon: HiHome, title: 'Local Expertise', desc: 'Deep knowledge of Nairobi neighborhoods, market trends, legal processes, and investment opportunities.' },
          ].map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="col-span-6 md:col-span-3 bg-emerald-50 rounded-2xl p-6 text-center"
            >
              <div className="w-14 h-14 bg-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <v.icon className="w-7 h-7 text-gold-400" />
              </div>
              <h3 className="font-bold text-emerald-900 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500">{v.desc}</p>
            </motion.div>
          ))}
        </MosaicGrid>
      </section>

      <section className="bg-emerald-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-emerald-900 mb-2 text-center">Meet Our Team</h2>
          <p className="text-gray-500 italic text-center mb-12"><em>Experienced professionals dedicated to your property journey</em></p>
          {loading ? (
            <Spinner text="Loading team..." />
          ) : (
          <MosaicGrid>
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="col-span-6 md:col-span-4"
              >
                <Link href={`/agents/${agent.slug}`} className="block bg-white rounded-2xl border border-emerald-100 p-6 hover-card text-center">
                  <img src={agent.photo} alt={agent.name} className="w-20 h-20 rounded-full object-cover mb-4 mx-auto border-2 border-gold-400" />
                  <h3 className="font-bold text-emerald-900 flex items-center justify-center gap-1">
                    {agent.name}
                    {agent.verified && (
                      <svg className="w-4 h-4 text-emerald-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{agent.bio}</p>
                  <div className="flex items-center justify-center gap-1 mt-3 text-sm">
                    <HiStar className="w-4 h-4 text-gold-500" />
                    <span className="text-gold-600 font-semibold">{agent.rating}</span>
                    <span className="text-gray-400">({agent.reviewCount} reviews)</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{agent.listings} active listings</p>
                </Link>
              </motion.div>
            ))}
          </MosaicGrid>
          )}
        </div>
      </section>

      <BubbleTestimonials items={testimonials.length > 0 ? testimonials : undefined} />

      <CTASection
        title="Ready to Start Your Property Journey?"
        subtitle="Whether buying, selling, or investing — our team is here to guide you every step of the way."
        primaryLabel="Contact Our Team"
        primaryHref="/contact"
        secondaryLabel="Browse Properties"
        secondaryHref="/properties"
      />
    </>
  );
}
