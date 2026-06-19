'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HiOfficeBuilding, HiDocumentText, HiUserGroup, HiChat, HiEye, HiCheckCircle, HiClock } from 'react-icons/hi';

export default function DashboardPage() {
  const [stats, setStats] = useState({ properties: 0, blogs: 0, agents: 0, testimonials: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [pendingItems, setPendingItems] = useState(0);

  useEffect(() => {
    document.title = 'Dashboard | Tobillion Admin';
    async function load() {
      const [props, blogs, ag, tms, audit] = await Promise.all([
        fetch('/api/admin/properties?limit=1').then(r => r.json()),
        fetch('/api/admin/blog?limit=1').then(r => r.json()),
        fetch('/api/admin/agents').then(r => r.json()),
        fetch('/api/admin/testimonials').then(r => r.json()),
        fetch('/api/admin/audit?limit=10').then(r => r.json()),
      ]);
      setStats({
        properties: props.pagination?.total || 0,
        blogs: blogs.pagination?.total || 0,
        agents: Array.isArray(ag) ? ag.length : 0,
        testimonials: Array.isArray(tms) ? tms.length : 0,
      });
      setRecentActivity(audit.data || []);
    }
    load();
  }, []);

  const statCards = [
    { label: 'Properties', value: stats.properties, icon: HiOfficeBuilding, href: '/admin/properties', color: 'bg-emerald-500' },
    { label: 'Blog Posts', value: stats.blogs, icon: HiDocumentText, href: '/admin/blog', color: 'bg-blue-500' },
    { label: 'Agents', value: stats.agents, icon: HiUserGroup, href: '/admin/agents', color: 'bg-purple-500' },
    { label: 'Testimonials', value: stats.testimonials, icon: HiChat, href: '/admin/testimonials', color: 'bg-gold-500' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{card.value}</span>
              </div>
              <p className="text-sm text-gray-500">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-800">Recent Activity</h2>
            <Link href="/admin/audit" className="text-sm text-emerald-700 hover:text-gold-500">View All</Link>
          </div>
          <div className="card-body p-0">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentActivity.map((log: any) => (
                  <div key={log.id} className="px-6 py-3 flex items-center gap-3 text-sm">
                    {log.action === 'create' ? (
                      <HiCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <HiEye className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                    <span className="text-gray-700 capitalize">{log.action}</span>
                    <span className="text-gray-400">{log.entity_type}</span>
                    <span className="text-gray-300 ml-auto text-xs">
                      {new Date(log.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-800">Quick Actions</h2>
          </div>
          <div className="card-body space-y-3">
            {[
              { label: 'Add New Property', href: '/admin/properties/new', desc: 'Create a new property listing' },
              { label: 'Write Blog Post', href: '/admin/blog', desc: 'Create and publish content' },
              { label: 'Update Site Settings', href: '/admin/settings', desc: 'Logo, SEO, contact info' },
              { label: 'Edit Page Content', href: '/admin/pages', desc: 'Hero, features, testimonials' },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center justify-between p-3 rounded-lg hover:bg-emerald-50 transition-colors group">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <HiClock className="w-4 h-4 text-gray-300 group-hover:text-emerald-700 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
