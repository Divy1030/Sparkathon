'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';

interface AuditLogsPageProps { cardClass: string; darkMode?: boolean; }

export default function AuditLogsPage({ cardClass, darkMode = false }: AuditLogsPageProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setLogs(await api.auditLogs(200) as any[]);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load audit logs');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const visibleLogs = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return logs;
    return logs.filter((log) => `${log.action} ${log.userId?.email || ''} ${log.statusCode}`.toLowerCase().includes(query));
  }, [filter, logs]);

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Governance & traceability</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Audit logs</h1><p className="mt-2 text-sm text-slate-500">Review administrator actions and operational changes.</p></div>
      <button onClick={() => void load()} className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition hover:bg-slate-500/10"><RefreshCw className="h-4 w-4" />Refresh</button>
    </div>
    <div className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${cardClass}`}>
      <div className="mb-4 flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-cyan-500" /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter by action, user, or status" className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15" /></div>
      {error && <div className={`rounded-xl px-3 py-2 text-sm ${darkMode ? 'bg-rose-400/10 text-rose-200' : 'bg-red-50 text-red-700'}`}>{error}</div>}
      {loading ? <div className="py-10 text-center text-slate-500">Loading audit history…</div> : visibleLogs.length === 0 ? <div className="py-10 text-center text-slate-500">No audit records found.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b text-xs uppercase tracking-wide text-slate-500"><th className="p-3">Time</th><th className="p-3">User</th><th className="p-3">Action</th><th className="p-3">Status</th><th className="p-3">IP</th></tr></thead><tbody>{visibleLogs.map((log) => <tr key={log._id} className="border-b last:border-0 transition hover:bg-slate-500/5"><td className="whitespace-nowrap p-3">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</td><td className="p-3">{log.userId?.email || 'Unknown user'}</td><td className="p-3 font-medium">{log.action}</td><td className={`p-3 font-semibold ${log.statusCode >= 400 ? 'text-red-600' : 'text-emerald-600'}`}>{log.statusCode}</td><td className="p-3 text-slate-500">{log.ip || '—'}</td></tr>)}</tbody></table></div>}
    </div>
  </div>;
}
