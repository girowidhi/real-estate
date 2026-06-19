import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi';

interface CTASectionProps {
  title: string;
  subtitle?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  variant?: 'default' | 'dark';
}

export function CTASection({
  title,
  subtitle,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  variant = 'default',
}: CTASectionProps) {
  const bg = variant === 'dark' ? 'bg-emerald-900' : 'bg-emerald-50';

  return (
    <section className={`${bg} py-16 mt-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${variant === 'dark' ? 'text-white' : 'text-emerald-900'}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`italic mb-6 max-w-xl mx-auto ${variant === 'dark' ? 'text-emerald-200' : 'text-gray-500'}`}>
            <em>{subtitle}</em>
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 border-2 border-gold-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300"
          >
            {primaryLabel} <HiArrowRight />
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link
              href={secondaryHref}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                variant === 'dark'
                  ? 'border-2 border-white/20 text-white hover:bg-white/10'
                  : 'border-2 border-emerald-200 text-emerald-700 hover:border-gold-400'
              }`}
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
