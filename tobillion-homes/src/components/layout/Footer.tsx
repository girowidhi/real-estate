import Link from 'next/link';
import { COMPANY, NEIGHBORHOODS } from '@/lib/constants';
import { fetchSiteSettings, fetchPageContent } from '@/lib/data-transform';
import { HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi';

export async function Footer() {
  let contactInfo = { phone: COMPANY.phone, email: COMPANY.email, address: COMPANY.address };
  let socialLinks = { facebook: COMPANY.social.facebook, instagram: COMPANY.social.instagram, twitter: COMPANY.social.twitter, linkedin: COMPANY.social.linkedin };
  let footerColumns: { title: string; links: { label: string; href: string }[] }[] = [];
  let branding: { logo: string; logo_size: number } | null = null;
  try {
    const [settings, pageContents] = await Promise.all([fetchSiteSettings(), fetchPageContent('footer')]);
    if (settings.contact_info) contactInfo = { ...contactInfo, ...settings.contact_info };
    if (settings.social_links) socialLinks = { ...socialLinks, ...settings.social_links };
    if (settings.branding) branding = settings.branding;
    const links = pageContents.find((p: any) => p.section_key === 'links');
    if (links?.content?.columns) footerColumns = links.content.columns;
  } catch {} // fall back to COMPANY defaults
  return (
    <footer className="bg-emerald-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <svg viewBox="0 0 1440 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <path fill="currentColor" d="M0,320 C60,300 120,280 180,290 C240,300 300,260 360,240 C420,220 480,250 540,260 C600,270 660,230 720,210 C780,190 840,220 900,230 C960,240 1020,200 1080,180 C1140,160 1200,190 1260,200 C1320,210 1380,180 1440,160 L1440,400 L0,400 Z" />
          <path fill="currentColor" d="M0,360 C80,340 160,320 240,330 C320,340 400,300 480,280 C560,260 640,290 720,300 C800,310 880,270 960,250 C1040,230 1120,260 1200,270 C1280,280 1360,240 1440,220 L1440,400 L0,400 Z" opacity="0.5" />
        </svg>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src={branding?.logo || "/logo.jpeg"} alt="Logo" className="object-contain" style={{ width: branding?.logo_size || 40, height: branding?.logo_size || 40 }} />
            </Link>
            <p className="text-emerald-200 text-sm leading-relaxed mb-4">
              Nairobi&apos;s premier real estate agency, helping you find the perfect home in Kenya&apos;s most desirable neighborhoods.
            </p>
            <div className="space-y-2 text-sm text-emerald-200">
              <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <HiPhone className="w-4 h-4 text-gold-400" /> {contactInfo.phone}
              </a>
              <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <HiMail className="w-4 h-4 text-gold-400" /> {contactInfo.email}
              </a>
              <p className="flex items-center gap-2">
                <HiLocationMarker className="w-4 h-4 text-gold-400 flex-shrink-0" /> {contactInfo.address}
              </p>
            </div>
          </div>

          {footerColumns.length > 0 ? footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="font-semibold text-gold-400 mb-4 uppercase text-sm tracking-wider">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-emerald-200 text-sm hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )) : (
            <div>
              <h3 className="font-semibold text-gold-400 mb-4 uppercase text-sm tracking-wider">Quick Links</h3>
              <ul className="space-y-2.5">
                <li><Link href="/properties" className="text-emerald-200 text-sm hover:text-white transition-colors">All Properties</Link></li>
                <li><Link href="/about" className="text-emerald-200 text-sm hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-emerald-200 text-sm hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/blog" className="text-emerald-200 text-sm hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/faq" className="text-emerald-200 text-sm hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gold-400 mb-4 uppercase text-sm tracking-wider">Neighborhoods</h3>
            <ul className="space-y-2.5">
              {NEIGHBORHOODS.slice(0, 6).map((n) => (
                <li key={n.slug}>
                  <Link href={`/neighborhoods/${n.slug}`} className="text-emerald-200 text-sm hover:text-white transition-colors">
                    {n.name}
                  </Link>
                </li>
              ))}
              <li><Link href="/neighborhoods" className="text-gold-400 text-sm font-medium hover:text-gold-300 transition-colors">View All →</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gold-400 mb-4 uppercase text-sm tracking-wider">Legal</h3>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-emerald-200 text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-emerald-200 text-sm hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/careers" className="text-emerald-200 text-sm hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/press" className="text-emerald-200 text-sm hover:text-white transition-colors">Press Kit</Link></li>
              <li><a href={COMPANY.adminUrl} className="text-emerald-200 text-sm hover:text-white transition-colors">Admin Login</a></li>
            </ul>
            <p className="mt-6 text-emerald-400 text-xs">Reg: {COMPANY.registration}</p>
          </div>
        </div>

        <div className="border-t border-emerald-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-emerald-400 text-sm">© {new Date().getFullYear()} All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-gold-400 transition-colors" aria-label="Facebook">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-gold-400 transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" /></svg>
            </a>
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-gold-400 transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-gold-400 transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
