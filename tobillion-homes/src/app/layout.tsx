import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTA } from "@/components/layout/StickyCTA";
import { ExitIntentPopup } from "@/components/ui/ExitIntentPopup";
import { fetchSiteSettings } from "@/lib/data-transform";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  let seoMeta: Record<string, any> = {};
  let branding: Record<string, any> = {};
  let contactInfo: Record<string, any> = {};
  let socialLinks: Record<string, any> = {};
  try {
    const settings = await fetchSiteSettings();
    if (settings.seo_meta) seoMeta = settings.seo_meta;
    if (settings.branding) branding = settings.branding;
    if (settings.contact_info) contactInfo = settings.contact_info;
    if (settings.social_links) socialLinks = settings.social_links;
  } catch {}
  return {
    title: {
      default: seoMeta.title || "Find Your Dream Home in Nairobi",
      template: "%s",
    },
    description: seoMeta.description || "Nairobi's premier real estate agency. Browse luxury apartments, houses, and land in Kilimani, Westlands, Karen, and beyond.",
    keywords: seoMeta.keywords ? seoMeta.keywords.split(',').map((k: string) => k.trim()) : ["Nairobi real estate", "property Kenya"],
    authors: [{ name: "Company" }],
    creator: "Company",
    publisher: "Company",
    metadataBase: new URL("https://tobillionhomes.co.ke"),
    openGraph: {
      type: "website",
      locale: "en_KE",
      url: "https://tobillionhomes.co.ke",
      siteName: "Company",
      title: seoMeta.title || "Find Your Dream Home in Nairobi",
      description: seoMeta.description || "Nairobi's premier real estate agency.",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: seoMeta.title || "Find Your Dream Home in Nairobi",
      description: seoMeta.description || "Nairobi's premier real estate agency.",
      images: ["/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let branding: Record<string, any> = {};
  let contactInfo: Record<string, any> = {};
  let socialLinks: Record<string, any> = {};
  try {
    const settings = await fetchSiteSettings();
    if (settings.branding) branding = settings.branding;
    if (settings.contact_info) contactInfo = settings.contact_info;
    if (settings.social_links) socialLinks = settings.social_links;
  } catch {}

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Company",
    url: "https://tobillionhomes.co.ke",
    ...(branding.logo ? { logo: branding.logo } : { logo: "https://tobillionhomes.co.ke/logo.jpeg" }),
    image: "https://tobillionhomes.co.ke/og-image.jpg",
    address: { "@type": "PostalAddress", streetAddress: contactInfo.address || "Westlands Business Park", addressLocality: "Nairobi", addressCountry: "KE" },
    telephone: contactInfo.phone || "+254700123456",
    email: contactInfo.email || "info@tobillionhomes.co.ke",
    areaServed: ["Nairobi", "Kilimani", "Westlands", "Karen", "Lavington", "Gigiri"],
    sameAs: [socialLinks.facebook, socialLinks.instagram, socialLinks.twitter, socialLinks.linkedin].filter(Boolean),
  };

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        <StickyCTA />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ExitIntentPopup />
      </body>
    </html>
  );
}
