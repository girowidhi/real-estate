'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/admin/auth/session')
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) {
          setSession(true);
        } else {
          setSession(false);
          if (!pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/forgot-password')) {
            router.push('/admin/login');
          }
        }
      })
      .catch(() => {
        setSession(false);
        if (!pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/forgot-password')) {
          router.push('/admin/login');
        }
      });
  }, [pathname, router]);

  const isAuthPage = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/forgot-password');

  return (
    <html lang="en" className="light">
      <head>
        <title>Tobillion Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="min-h-screen bg-gray-50">
        {session === null && !isAuthPage ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
