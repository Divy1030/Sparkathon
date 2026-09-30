import React from 'react';
import { AlertTriangle, ArrowUpRight, Boxes, CheckCircle2, CircleDot, PackageCheck, Warehouse as WarehouseIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from 'recharts';
import { Alert, InventoryItem, Warehouse } from '../../types';
import { mockDemandForecast, mockWarehouses } from '../../data/mockData';

interface DashboardOverviewProps {
  cardClass: string;
  alerts: Alert[];
  resolveAlert: (alertId: number | string) => void;
  warehouses?: Warehouse[];
  inventory?: InventoryItem[];
  darkMode?: boolean;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ cardClass, alerts, resolveAlert, warehouses, inventory = [], darkMode = false }) => {
  const activeAlerts = alerts.filter((alert) => !alert.resolved);
  const lowStock = inventory.filter((item) => item.status === 'low_stock' || item.status === 'out_of_stock');
  const totalUnits = inventory.reduce((sum, item) => sum + (item.availableQuantity ?? item.current ?? 0), 0);
  const warehouseRows = warehouses?.length ? warehouses : mockWarehouses;
  const chartRows = warehouseRows.map((warehouse) => ({
    name: warehouse.name.replace(/ warehouse| distribution center| regional hub| port warehouse/gi, '').split(' ').slice(0, 2).join(' '),
    efficiency: Number(warehouse.efficiency || 0),
    load: Number(warehouse.load || 0),
  }));
  const inventoryRows = inventory.length ? inventory.slice(0, 8).map((item) => ({ name: item.product.slice(0, 14), available: item.availableQuantity ?? item.current ?? 0, reorder: item.reorderLevel ?? 0 })) : [];
  const muted = darkMode ? 'text-slate-400' : 'text-slate-500';

  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#102a43] via-[#0f3d56] to-[#087f8c] p-6 text-white shadow-xl shadow-cyan-950/10 sm:p-8">
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-cyan-100"><CircleDot className="h-3 w-3 fill-current" />Live operations overview</div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Good morning, operations team.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-cyan-50/75">Monitor stock health, warehouse throughput, and exceptions that need attention today.</p></div><div className="flex items-center gap-2 text-sm text-cyan-50/80"><span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />System monitoring active</div></div>
    </section>

    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard cardClass={cardClass} icon={<Boxes className="h-5 w-5" />} label="Available units" value={totalUnits.toLocaleString()} detail={`${inventory.length || '—'} tracked SKUs`} tone="blue" />
      <KpiCard cardClass={cardClass} icon={<WarehouseIcon className="h-5 w-5" />} label="Warehouses online" value={String(warehouseRows.length)} detail="Connected facilities" tone="cyan" />
      <KpiCard cardClass={cardClass} icon={<PackageCheck className="h-5 w-5" />} label="Stock health" value={inventory.length ? `${Math.round(((inventory.length - lowStock.length) / inventory.length) * 100)}%` : '—'} detail={`${lowStock.length} items need review`} tone={lowStock.length ? 'amber' : 'green'} />
      <KpiCard cardClass={cardClass} icon={<AlertTriangle className="h-5 w-5" />} label="Open exceptions" value={String(activeAlerts.length)} detail={activeAlerts.length ? 'Requires attention' : 'All clear'} tone={activeAlerts.length ? 'red' : 'green'} />
    </section>

    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
      <Panel cardClass={cardClass} title="Warehouse throughput" subtitle="Efficiency and current load by facility"><div className="h-[300px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartRows} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barGap={8}><CartesianGrid vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} /><XAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: 0, background: darkMode ? '#172033' : '#0f172a', color: '#fff' }} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /><Bar name="Efficiency" dataKey="efficiency" fill="#14b8a6" radius={[5, 5, 0, 0]} maxBarSize={34} /><Bar name="Load" dataKey="load" fill="#60a5fa" radius={[5, 5, 0, 0]} maxBarSize={34} /></BarChart></ResponsiveContainer></div></Panel>
      <Panel cardClass={cardClass} title="Inventory health" subtitle="Available units against reorder thresholds"><div className="h-[300px] w-full">{inventoryRows.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={inventoryRows} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} /><XAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: 0, background: darkMode ? '#172033' : '#0f172a', color: '#fff' }} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /><Line type="monotone" name="Available" dataKey="available" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} /><Line type="monotone" name="Reorder level" dataKey="reorder" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} /></LineChart></ResponsiveContainer> : <ResponsiveContainer width="100%" height="100%"><LineChart data={mockDemandForecast}><CartesianGrid vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} /><XAxis dataKey="month" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip /><Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={3} /></LineChart></ResponsiveContainer>}</div></Panel>
    </section>

    <section className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${cardClass}`}><div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-lg font-semibold tracking-tight">Exception queue</h2><p className={`mt-1 text-sm ${muted}`}>Prioritized signals from your live operation.</p></div><span className={`text-xs font-medium ${muted}`}>{activeAlerts.length} open</span></div><div className="space-y-3">{alerts.slice(0, 4).map((alert) => <AlertRow key={alert.id} alert={alert} resolveAlert={resolveAlert} darkMode={darkMode} />)}{!alerts.length && <div className={`rounded-xl border border-dashed p-8 text-center text-sm ${muted}`}>No alerts have been reported.</div>}</div></section>
  </div>;
};

function KpiCard({ cardClass, icon, label, value, detail, tone }: { cardClass: string; icon: React.ReactNode; label: string; value: string; detail: string; tone: 'blue' | 'cyan' | 'green' | 'amber' | 'red' }) {
  const tones = { blue: 'bg-blue-500/10 text-blue-500', cyan: 'bg-cyan-500/10 text-cyan-500', green: 'bg-emerald-500/10 text-emerald-500', amber: 'bg-amber-500/10 text-amber-500', red: 'bg-rose-500/10 text-rose-500' };
  return <div className={`rounded-2xl border p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardClass}`}><div className="flex items-start justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p></div><div className={`rounded-xl p-2.5 ${tones[tone]}`}>{icon}</div></div><p className="mt-3 flex items-center gap-1 text-xs text-slate-500"><ArrowUpRight className="h-3.5 w-3.5" />{detail}</p></div>;
}

function Panel({ cardClass, title, subtitle, children }: { cardClass: string; title: string; subtitle: string; children: React.ReactNode }) { return <div className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${cardClass}`}><div className="mb-4"><h2 className="text-lg font-semibold tracking-tight">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>{children}</div>; }

function AlertRow({ alert, resolveAlert, darkMode }: { alert: Alert; resolveAlert: (id: number | string) => void; darkMode: boolean }) {
  const styles = alert.type === 'critical' ? (darkMode ? 'border-rose-400/20 bg-rose-400/10' : 'border-rose-200 bg-rose-50') : alert.type === 'warning' ? (darkMode ? 'border-amber-400/20 bg-amber-400/10' : 'border-amber-200 bg-amber-50') : (darkMode ? 'border-blue-400/20 bg-blue-400/10' : 'border-blue-200 bg-blue-50');
  const icon = alert.type === 'critical' ? 'text-rose-500' : alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500';
  return <div className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${styles}`}><div className="flex items-start gap-3"><AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${icon}`} /><div><p className="text-sm font-medium">{alert.message}</p><p className="mt-1 text-xs text-slate-500">{alert.timestamp}</p></div></div>{!alert.resolved && <button onClick={() => resolveAlert(alert.id)} className="self-end rounded-lg border border-slate-300/60 px-3 py-1.5 text-xs font-medium transition hover:bg-white/60 sm:self-auto">Resolve</button>}</div>;
}

export default DashboardOverview;
