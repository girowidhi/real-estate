'use client';

import { motion } from 'framer-motion';

const positions = [
  { x: '10%', y: '10%' }, { x: '70%', y: '5%' }, { x: '5%', y: '40%' }, { x: '80%', y: '45%' },
  { x: '15%', y: '70%' }, { x: '65%', y: '75%' }, { x: '45%', y: '15%' }, { x: '50%', y: '65%' },
];

const defaultTestimonials = [
  { name: 'Grace M.', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', text: 'Found my dream home in Kilimani in just 2 weeks!', x: '10%', y: '10%', delay: 0 },
  { name: 'James K.', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', text: 'Best real estate agents in Nairobi, period.', x: '70%', y: '5%', delay: 0.5 },
  { name: 'Sarah W.', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', text: 'The 3D tour saved me so much time!', x: '5%', y: '40%', delay: 1 },
  { name: 'Peter O.', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80', text: 'They handled everything. Stress-free buying.', x: '80%', y: '45%', delay: 1.5 },
  { name: 'Alice N.', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', text: 'Got a great deal in Karen. Highly recommend!', x: '15%', y: '70%', delay: 2 },
  { name: 'David M.', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80', text: 'Professional, transparent, and fast.', x: '65%', y: '75%', delay: 2.5 },
  { name: 'Faith A.', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80', text: 'Found us a tenant in 3 days. Amazing!', x: '45%', y: '15%', delay: 3 },
  { name: 'Kevin M.', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80', text: 'Premium service from start to finish.', x: '50%', y: '65%', delay: 3.5 },
];

interface BubbleTestimonialsProps {
  items?: { name: string; text: string; photo?: string }[];
}

export function BubbleTestimonials({ items }: BubbleTestimonialsProps) {
  const testimonials = items && items.length > 0
    ? items.map((t, i) => ({
        name: t.name, photo: t.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=10b981&color=fff&size=100`,
        text: t.text, x: positions[i % positions.length].x, y: positions[i % positions.length].y, delay: i * 0.5,
      }))
    : defaultTestimonials;
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 text-center mb-4">
          What Our Clients Say
        </h2>
        <p className="text-center text-gray-500 italic mb-16">
          <em>Real stories from real homeowners across Nairobi</em>
        </p>

        <div className="relative h-[500px] md:h-[600px] hidden md:block">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: t.x, top: t.y }}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: t.delay }}
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: t.delay }}
                className="flex flex-col items-center"
              >
                <img
                  src={t.photo}
                  alt={t.name}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-3 border-gold-400 shadow-lg"
                />
                <div className="bg-white p-3 rounded-2xl mt-2 shadow-lg max-w-[180px] text-center relative">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">{t.text}</p>
                  <p className="text-xs text-gold-600 mt-1 font-semibold">{t.name}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="md:hidden space-y-4">
          {testimonials.slice(0, 4).map((t, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-md border border-emerald-100 flex items-start gap-3">
              <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700 italic"><em>&ldquo;{t.text}&rdquo;</em></p>
                <p className="text-xs text-gold-600 font-semibold mt-1">{t.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
