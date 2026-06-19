'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HiHome, HiViewGrid, HiDocumentText, HiChat, HiUserGroup,
  HiQuestionMarkCircle, HiBriefcase, HiCollection, HiCog,
  HiShieldCheck, HiBell, HiLogout, HiMenu, HiX, HiChevronLeft,
  HiPhotograph, HiOfficeBuilding, HiUserCircle,
} from 'react-icons/hi';

const navSections = [
  {
    title: 'Main',
    links: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: HiHome },
      { label: 'Properties', href: '/admin/properties', icon: HiOfficeBuilding },
      { label: 'Blog Posts', href: '/admin/blog', icon: HiDocumentText },
      { label: 'Testimonials', href: '/admin/testimonials', icon: HiChat },
      { label: 'Agents', href: '/admin/agents', icon: HiUserGroup },
      { label: 'FAQs', href: '/admin/faqs', icon: HiQuestionMarkCircle },
      { label: 'Partners', href: '/admin/partners', icon: HiBriefcase },
    ],
  },
  {
    title: 'Content',
    links: [
      { label: 'Page Content', href: '/admin/pages', icon: HiCollection },
      { label: 'Site Settings', href: '/admin/settings', icon: HiCog },
    ],
  },
  {
    title: 'System',
    links: [
      { label: 'Audit Log', href: '/admin/audit', icon: HiShieldCheck },
      { label: 'Notifications', href: '/admin/notifications', icon: HiBell },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState('');

  const fetchUnread = async () => {
    try {
      const [notifRes, userRes] = await Promise.all([
        fetch('/api/admin/notifications?limit=100'),
        fetch('/api/admin/auth/session'),
      ]);
      const notifData = await notifRes.json();
      setUnreadCount(Array.isArray(notifData) ? notifData.filter((n: any) => !n.delivered_at).length : 0);
      const userData = await userRes.json();
      if (userData?.user?.name) setUserName(userData.user.name);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchUnread();
    const t = setInterval(fetchUnread, 30000);
    const handler = () => fetchUnread();
    globalThis.addEventListener('notifications-changed', handler);
    return () => { clearInterval(t); globalThis.removeEventListener('notifications-changed', handler); };
  }, []);

  const handleLogout = async () => {
    await fetch('/admin/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-emerald-800/50">
          <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-gold-400 font-bold text-sm">T</span>
            </div>
            <span className="text-white font-semibold text-sm">Admin Panel</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-emerald-300 hover:text-white">
            <HiX className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="text-emerald-400/60 text-xs font-semibold uppercase tracking-wider px-4 mb-2">{section.title}</p>
              <div className="space-y-0.5">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname.startsWith(link.href) || (link.href === '/admin/dashboard' && pathname === '/admin');
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{link.label}</span>
                      {link.label === 'Notifications' && unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">{unreadCount > 99 ? '99+' : unreadCount}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="space-y-0.5 pt-4 border-t border-emerald-800/50">
            <Link
              href="/admin/profile"
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${pathname === '/admin/profile' ? 'active' : ''}`}
            >
              <HiUserCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">Profile</span>
              {userName && <span className="text-[10px] text-emerald-400/60 truncate max-w-[60px]">{userName}</span>}
            </Link>
            <button onClick={handleLogout} className="sidebar-link w-full text-red-300 hover:text-red-200 hover:bg-red-900/20">
              <HiLogout className="w-4 h-4" />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-emerald-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-emerald-700">
              <HiMenu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
              {navSections.flatMap(s => s.links).find(l => pathname.startsWith(l.href))?.label || (pathname === '/admin/profile' ? 'Profile' : 'Admin')}
            </h1>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
