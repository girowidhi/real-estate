'use client';

import { useEffect, useState, Fragment } from 'react';
import { HiFilter, HiX, HiShieldExclamation, HiChevronDown, HiChevronRight, HiTrash, HiSearch } from 'react-icons/hi';
import Spinner from '@/components/Spinner';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_data: any;
  after_data: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_users?: { name: string; email: string } | null;
}

const SECURITY_ACTIONS = ['failed_login', 'password_reset', '2fa_failed', 'suspicious_ip', 'rate_limited'];

const actionColors: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  login: 'bg-gray-100 text-gray-600',
  failed_login: 'bg-red-100 text-red-800',
  password_reset: 'bg-yellow-100 text-yellow-800',
  suspicious_ip: 'bg-orange-100 text-orange-800',
  rate_limited: 'bg-purple-100 text-purple-800',
  '2fa_failed': 'bg-orange-100 text-orange-800',
};

const actionIcons: Record<string, string> = {
  failed_login: '🔴',
  suspicious_ip: '⚠️',
  rate_limited: '🚫',
  '2fa_failed': '🔐',
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [securityMode, setSecurityMode] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [detailTarget, setDetailTarget] = useState<AuditLog | null>(null);
  const [purgeModal, setPurgeModal] = useState(false);

  useEffect(() => { document.title = 'Audit Log | Tobillion Admin'; }, []);

  useEffect(() => { load(); }, [page, entityFilter, actionFilter, search, securityMode, dateFrom, dateTo]);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (entityFilter) params.set('entity_type', entityFilter);
    if (actionFilter) params.set('action', actionFilter);
    if (search) params.set('search', search);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (securityMode) params.set('security', 'true');
    const res = await fetch(`/api/admin/audit?${params}`);
    const data = await res.json();
    setLogs(data.data || []);
    setTotalPages(data.pagination?.totalPages || 1);
    setTotal(data.pagination?.total || 0);
    setLoading(false);
  };

  const toggleExpanded = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  const isSecurity = (log: AuditLog) => SECURITY_ACTIONS.includes(log.action);

  const purgeLogs = async () => {
    if (!dateTo) return;
    await fetch(`/api/admin/audit?before=${dateTo}T23:59:59`, { method: 'DELETE' });
    setPurgeModal(false);
    load();
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card !p-4">
          <p className="text-xs text-gray-400">Total Events</p>
          <p className="text-xl font-bold text-gray-800">{total}</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-gray-400">Security Events</p>
          <p className="text-xl font-bold text-red-600">{logs.filter(isSecurity).length}</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-gray-400">This Page</p>
          <p className="text-xl font-bold text-gray-800">{logs.length}</p>
        </div>
        <button onClick={() => setPurgeModal(true)} className="card !p-4 flex flex-col items-start gap-1 hover:border-red-200 cursor-pointer">
          <p className="text-xs text-gray-400">Purge Old Logs</p>
          <p className="text-sm font-medium text-red-600 flex items-center gap-1"><HiTrash className="w-4 h-4" /> Purge</p>
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-800">Audit Log</h2>
            {securityMode && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                <HiShieldExclamation className="w-3.5 h-3.5" /> Security View
              </span>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={securityMode} onChange={(e) => { setSecurityMode(e.target.checked); setPage(1); }} className="w-4 h-4 rounded border-gray-300 text-red-600" />
            <span className="text-gray-600">Security only</span>
          </label>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="input-label text-[11px]">Search</label>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Entity ID..." className="input-field pl-9 text-sm" />
              </div>
            </div>
            <div>
              <label className="input-label text-[11px]">Entity</label>
              <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }} className="input-field w-auto">
                <option value="">All Entities</option>
                <option value="auth">Auth</option>
                <option value="property">Property</option>
                <option value="blog_post">Blog Post</option>
                <option value="testimonial">Testimonial</option>
                <option value="agent">Agent</option>
                <option value="faq">FAQ</option>
                <option value="partner">Partner</option>
                <option value="page_content">Page Content</option>
                <option value="site_setting">Site Setting</option>
                <option value="security">Security</option>
              </select>
            </div>
            <div>
              <label className="input-label text-[11px]">Action</label>
              <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="input-field w-auto">
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="login">Login</option>
                <option value="failed_login">Failed Login</option>
                <option value="password_reset">Password Reset</option>
              </select>
            </div>
            <div>
              <label className="input-label text-[11px]">From</label>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="input-field text-sm" />
            </div>
            <div>
              <label className="input-label text-[11px]">To</label>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="input-field text-sm" />
            </div>
            <button onClick={load} className="btn-secondary text-xs"><HiFilter className="w-4 h-4" /> Filter</button>
            {(entityFilter || actionFilter || search || dateFrom || dateTo || securityMode) && (
              <button onClick={() => { setEntityFilter(''); setActionFilter(''); setSearch(''); setDateFrom(''); setDateTo(''); setSecurityMode(false); setPage(1); }} className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1">
                <HiX className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header w-8"></th>
                <th className="table-header">Time</th>
                <th className="table-header">Admin</th>
                <th className="table-header">Action</th>
                <th className="table-header">Entity</th>
                <th className="table-header">Entity ID</th>
                <th className="table-header">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8"><Spinner /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-sm text-gray-400">No audit logs found</td></tr>
              ) : logs.map((log) => (
                <Fragment key={log.id}>
                  <tr className={`hover:bg-gray-50 cursor-pointer ${isSecurity(log) ? 'bg-red-50/50' : ''}`} onClick={() => toggleExpanded(log.id)}>
                    <td className="table-cell">
                      {expanded.has(log.id) ? <HiChevronDown className="w-4 h-4 text-gray-400" /> : <HiChevronRight className="w-4 h-4 text-gray-400" />}
                    </td>
                    <td className="table-cell text-xs text-gray-400 whitespace-nowrap">{new Date(log.created_at).toLocaleString('en-KE')}</td>
                    <td className="table-cell text-sm">{log.admin_users?.name || log.admin_users?.email || <span className="text-gray-400">System</span>}</td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1">
                        {actionIcons[log.action] && <span>{actionIcons[log.action]}</span>}
                        <span className={`${actionColors[log.action] || 'bg-gray-100 text-gray-600'} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}>{log.action}</span>
                      </span>
                    </td>
                    <td className="table-cell text-sm text-gray-600">{log.entity_type}</td>
                    <td className="table-cell text-xs text-gray-400 font-mono max-w-[120px] truncate" title={log.entity_id || ''}>{log.entity_id || '-'}</td>
                    <td className="table-cell text-xs text-gray-400 font-mono">{log.ip_address || '-'}</td>
                  </tr>
                  {expanded.has(log.id) && (
                    <tr key={`${log.id}-detail`} className="bg-gray-50">
                      <td colSpan={7} className="p-4">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Before</h4>
                            {log.before_data && Object.keys(log.before_data).length > 0 ? (
                              <pre className="text-xs bg-white rounded-lg p-3 border border-gray-200 overflow-x-auto max-h-40">{JSON.stringify(log.before_data, null, 2)}</pre>
                            ) : (
                              <p className="text-xs text-gray-400 italic">No before data</p>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">After</h4>
                            {log.after_data && Object.keys(log.after_data).length > 0 ? (
                              <pre className="text-xs bg-white rounded-lg p-3 border border-gray-200 overflow-x-auto max-h-40">{JSON.stringify(log.after_data, null, 2)}</pre>
                            ) : (
                              <p className="text-xs text-gray-400 italic">No after data</p>
                            )}
                          </div>
                          {log.user_agent && (
                            <div className="md:col-span-2">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">User Agent</h4>
                              <p className="text-xs text-gray-600 truncate">{log.user_agent}</p>
                            </div>
                          )}
                          <div className="md:col-span-2 flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setDetailTarget(log); }} className="text-xs text-blue-600 hover:underline">View full details →</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Page {page} of {totalPages} ({total} total)</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="pagination-btn">Previous</button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pn: number;
                  if (totalPages <= 5) pn = i + 1;
                  else if (page <= 3) pn = i + 1;
                  else if (page >= totalPages - 2) pn = totalPages - 4 + i;
                  else pn = page - 2 + i;
                  return (
                    <button key={pn} onClick={() => setPage(pn)} className={`pagination-btn ${pn === page ? '!bg-emerald-700 !text-white' : ''}`}>{pn}</button>
                  );
                })}
              </div>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="pagination-btn">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Audit Log Detail</h3>
              <button onClick={() => setDetailTarget(null)} className="text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-400">Event ID</span><p className="font-mono text-xs">{detailTarget.id}</p></div>
                <div><span className="text-gray-400">Timestamp</span><p>{new Date(detailTarget.created_at).toLocaleString('en-KE')}</p></div>
                <div><span className="text-gray-400">Action</span><p><span className={`${actionColors[detailTarget.action] || 'bg-gray-100 text-gray-600'} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}>{detailTarget.action}</span></p></div>
                <div><span className="text-gray-400">Entity</span><p>{detailTarget.entity_type}</p></div>
                <div><span className="text-gray-400">Entity ID</span><p className="font-mono text-xs">{detailTarget.entity_id || '-'}</p></div>
                <div><span className="text-gray-400">Admin</span><p>{detailTarget.admin_users?.name || detailTarget.admin_users?.email || 'System'}</p></div>
                <div><span className="text-gray-400">IP Address</span><p className="font-mono text-xs">{detailTarget.ip_address || '-'}</p></div>
                <div><span className="text-gray-400">User Agent</span><p className="text-xs truncate">{detailTarget.user_agent || '-'}</p></div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Before Data</h4>
                  <pre className="text-xs bg-gray-50 rounded-lg p-3 border border-gray-200 overflow-x-auto max-h-60">{JSON.stringify(detailTarget.before_data, null, 2) || '{}'}</pre>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">After Data</h4>
                  <pre className="text-xs bg-gray-50 rounded-lg p-3 border border-gray-200 overflow-x-auto max-h-60">{JSON.stringify(detailTarget.after_data, null, 2) || '{}'}</pre>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100">
              <button onClick={() => setDetailTarget(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Purge Modal */}
      {purgeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPurgeModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-2">Purge Audit Logs</h3>
            <p className="text-sm text-gray-500 mb-4">Delete all audit logs before this date. This action cannot be undone.</p>
            <div className="space-y-3 mb-4">
              <label className="input-label">Delete logs before:</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field" />
            </div>
            <div className="flex gap-2">
              <button onClick={purgeLogs} disabled={!dateTo} className="btn-danger">Purge</button>
              <button onClick={() => setPurgeModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
