'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { 
  Home, 
  Package, 
  Bell, 
  FileText, 
  ClipboardList,
  Settings2,
  ShieldCheck,
  FlaskConical,
  Moon, 
  Sun
} from 'lucide-react';
import { NavItem, Alert, InventoryItem, Warehouse } from '../types';
import { mockAlerts } from '../data/mockData';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import InventoryForecasting from '../components/dashboard/InventoryForecasting';
import AlertsPage from '../components/dashboard/AlertsPage';
import ReportsPage from '../components/dashboard/ReportsPage';
import OrdersPage from '../components/dashboard/OrdersPage';
import OperationsPage from '../components/dashboard/OperationsPage';
import AuditLogsPage from '../components/dashboard/AuditLogsPage';
import ResearchWorkspacePage from '../components/dashboard/ResearchWorkspacePage';
import { api, ApiClientError, API_BASE_URL } from '../lib/api';

// Main Dashboard Component
export default function SupplyChainDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [backendOnline, setBackendOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [currentUser, setCurrentUser] = useState<{ email: string; username: string; role: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const previousInventoryRef = useRef(new Map<string, { status?: string; available: number }>());
  const notificationPermissionRef = useRef<NotificationPermission>('default');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('sparkflow-theme');
    if (savedTheme === 'dark') setDarkMode(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('sparkflow-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    api.me()
      .then(({ user }) => { setCurrentUser(user); setAuthState('authenticated'); })
      .catch(() => setAuthState('unauthenticated'));
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      notificationPermissionRef.current = Notification.permission;
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const enableDesktopNotifications = async () => {
    if (!('Notification' in window)) {
      setLoadError('Desktop notifications are not supported by this browser');
      return;
    }
    const permission = await Notification.requestPermission();
    notificationPermissionRef.current = permission;
    setNotificationPermission(permission);
  };

  const notifyInventoryChanges = useCallback((items: InventoryItem[]) => {
    if (notificationPermissionRef.current !== 'granted') return;
    items.forEach((item) => {
      if (!item.id || !item.status || !['low_stock', 'out_of_stock'].includes(item.status)) return;
      const available = item.availableQuantity ?? item.current;
      const previous = previousInventoryRef.current.get(item.id);
      const becameLow = !previous || previous.status !== item.status || previous.available !== available;
      if (becameLow) {
        new Notification(item.status === 'out_of_stock' ? 'Inventory depleted' : 'Low stock alert', {
          body: `${item.product} has ${available} units available${item.status === 'out_of_stock' ? '' : ` (reorder at ${item.reorderLevel})`}.`,
          tag: `inventory-${item.id}`,
        });
      }
    });
    previousInventoryRef.current = new Map(items.filter((item) => item.id).map((item) => [item.id as string, { status: item.status, available: item.availableQuantity ?? item.current }]));
  }, []);

  const loadLiveData = useCallback(async () => {
    if (authState !== 'authenticated') return;
    setIsLoading(true);
    try {
      const [dashboard, warehouseRows, inventoryRows, alertRows] = await Promise.all([
        api.dashboard(), api.warehouses(), api.inventory(), api.alerts('limit=100&resolved=false'),
      ]);
      setBackendOnline(true);
      setLoadError(null);
      setWarehouses(normalizeWarehouses(warehouseRows));
      const normalizedInventory = normalizeInventory(inventoryRows);
      setInventory(normalizedInventory);
      notifyInventoryChanges(normalizedInventory);
      setAlerts(normalizeAlerts(alertRows.length ? alertRows : dashboard.recentAlerts));
    } catch (error) {
      setBackendOnline(false);
      setLoadError(error instanceof ApiClientError ? error.message : 'Backend is unavailable');
    } finally {
      setIsLoading(false);
    }
  }, [authState, notifyInventoryChanges]);

  useEffect(() => { void loadLiveData(); }, [loadLiveData]);

  useEffect(() => {
    if (authState !== 'authenticated') return;
    const socket = io(API_BASE_URL, { withCredentials: true, transports: ['websocket', 'polling'] });
    const refreshEvents = ['inventory.updated', 'alert.created', 'alert.resolved', 'order.created', 'order.fulfilled', 'order.cancelled', 'order.returned', 'order.status_changed', 'shipment.created', 'shipment.status_changed'];
    refreshEvents.forEach((event) => socket.on(event, () => { void loadLiveData(); }));
    socket.on('connect', () => setBackendOnline(true));
    socket.on('disconnect', () => setBackendOnline(false));
    return () => { socket.disconnect(); };
  }, [authState, loadLiveData]);

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const { user } = await api.login(loginEmail, loginPassword);
      setCurrentUser(user);
      setAuthState('authenticated');
      setLoginPassword('');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unable to sign in');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signOut = async () => {
    try { await api.logout(); } finally {
      setCurrentUser(null);
      setAuthState('unauthenticated');
    }
  };

  const navItems: NavItem[] = [
    { id: 'research', name: 'Research Workspace', icon: FlaskConical },
    { id: 'dashboard', name: 'Dashboard Overview', icon: Home },
    { id: 'inventory', name: 'Inventory Forecasting', icon: Package },
    { id: 'orders', name: 'Order Management', icon: ClipboardList },
    { id: 'operations', name: 'Operations Center', icon: Settings2 },
    { id: 'alerts', name: 'Alerts & Anomalies', icon: Bell },
    { id: 'reports', name: 'Reports & Insights', icon: FileText },
    ...(currentUser?.role === 'admin' ? [{ id: 'audit-logs', name: 'Audit Logs', icon: ShieldCheck }] : [])
  ];

  const resolveAlert = async (alertId: number | string) => {
    try {
      await api.resolveAlert(String(alertId));
      setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, resolved: true } : alert));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to resolve alert');
    }
  };

  const bgClass = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const sidebarClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const cardClass = darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900';

  if (authState === 'checking') {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">Checking secure session…</div>;
  }

  if (authState === 'unauthenticated') {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <form onSubmit={submitLogin} className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:p-10">
          <div className="mb-8">
            <div className="mb-5 flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-cyan-300">SF</span><p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">SparkFlow</p></div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Sign in to operations</h1>
            <p className="mt-2 text-sm text-slate-500">Use your warehouse administrator account to continue.</p>
          </div>
          <label className="mb-4 block text-sm font-medium text-slate-700">Email
            <input value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} type="email" required autoComplete="email" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15" />
          </label>
          <label className="mb-5 block text-sm font-medium text-slate-700">Password
            <input value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} type="password" required autoComplete="current-password" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15" />
          </label>
          {loginError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loginError}</p>}
          <button disabled={isLoggingIn} className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60">{isLoggingIn ? 'Signing in…' : 'Sign in securely'}</button>
        </form>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'research':
        return <ResearchWorkspacePage cardClass={cardClass} darkMode={darkMode} />;
      case 'dashboard':
        return (
          <DashboardOverview 
            cardClass={cardClass} 
            alerts={alerts} 
            resolveAlert={resolveAlert} 
            warehouses={warehouses.length ? warehouses : undefined}
            inventory={inventory}
            darkMode={darkMode}
          />
        );
      case 'inventory':
        return <InventoryForecasting cardClass={cardClass} inventory={inventory.length ? inventory : undefined} darkMode={darkMode} />;
      case 'orders':
        return <OrdersPage cardClass={cardClass} inventory={inventory} darkMode={darkMode} />;
      case 'operations':
        return <OperationsPage cardClass={cardClass} darkMode={darkMode} />;
      case 'alerts':
        return (
          <AlertsPage 
            cardClass={cardClass} 
            alerts={alerts} 
            resolveAlert={resolveAlert} 
            darkMode={darkMode}
          />
        );
      case 'reports':
        return <ReportsPage cardClass={cardClass} darkMode={darkMode} />;
      case 'audit-logs':
        return <AuditLogsPage cardClass={cardClass} darkMode={darkMode} />;
      default:
        return (
          <DashboardOverview 
            cardClass={cardClass} 
            alerts={alerts} 
            resolveAlert={resolveAlert} 
            inventory={inventory}
            darkMode={darkMode}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-200`}>
      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed z-20 h-full w-20 overflow-y-auto border-r shadow-lg lg:w-64 ${sidebarClass}`}>
          <div className="p-3 lg:p-6">
            <h1 className="mb-8 text-center text-xl font-bold lg:text-left"><span className="lg:hidden">SC</span><span className="hidden lg:inline">Spark<span className="text-cyan-500">Flow</span></span></h1>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-500 text-white'
                      : darkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="hidden text-sm font-medium lg:inline">{item.name}</span>
                </button>
              ))}
            </nav>
            
            {/* Dark Mode Toggle */}
            <div className="absolute bottom-4 left-3 right-3 lg:left-4 lg:right-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="text-sm font-medium">
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-20 min-h-screen flex-1 overflow-y-auto p-4 sm:p-6 lg:ml-64 lg:p-8">
          <div className={`mb-6 flex flex-col gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between ${cardClass}`}>
            <div className="flex items-center gap-3"><span>{isLoading ? 'Connecting to Spark backend…' : backendOnline ? 'Connected to Spark backend' : 'Using local demo data'}</span><span className={`h-2.5 w-2.5 rounded-full ${backendOnline ? 'bg-green-500' : 'bg-yellow-500'}`} /></div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-gray-500 sm:inline">{currentUser?.email}</span>
              {notificationPermission === 'default' && <button onClick={enableDesktopNotifications} className="rounded bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600">Enable desktop alerts</button>}
              {notificationPermission === 'granted' && <span className="text-xs text-green-600">Desktop alerts enabled</span>}
              <button onClick={signOut} className="rounded-lg border border-slate-300/70 px-3 py-1.5 text-xs font-medium transition hover:bg-slate-500/10">Sign out</button>
            </div>
          </div>
          {loadError && (
            <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${darkMode ? 'border-amber-400/20 bg-amber-400/10 text-amber-200' : 'border-yellow-200 bg-yellow-50 text-yellow-800'}`}>
              {loadError}. Demo data is shown until the backend is available.
            </div>
          )}
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
}

function normalizeAlerts(rows: unknown[]): Alert[] {
  return rows.map((row: any) => ({
    id: row.id || row._id,
    type: row.type || 'info',
    message: row.message || row.title || 'Operational alert',
    timestamp: row.timestamp || row.createdAt || new Date().toISOString(),
    resolved: Boolean(row.resolved),
  }));
}

function normalizeWarehouses(rows: unknown[]): Warehouse[] {
  return rows.map((row: any) => ({
    id: String(row._id || row.id),
    name: row.name,
    location: { lat: row.location?.coordinates?.lat || row.location?.lat || 0, lng: row.location?.coordinates?.lng || row.location?.lng || 0 },
    stock: {
      electronics: row.categoryCapacities?.electronics?.current || 0,
      clothing: row.categoryCapacities?.clothing?.current || 0,
      food: row.categoryCapacities?.food?.current || 0,
    },
    load: row.currentUtilization || 0,
    droneReady: Boolean(row.droneReady),
    efficiency: row.efficiency || 0,
  }));
}

function normalizeInventory(rows: unknown[]): InventoryItem[] {
  return rows.map((row: any) => ({
    id: String(row._id || row.id),
    warehouseId: String(row.warehouse?.id || ''),
    productId: String(row.product?.id || ''),
    sku: row.product?.sku || '',
    category: row.product?.category,
    unitPrice: row.product?.price || 0,
    product: row.product?.name || row.product?.sku || 'Unknown product',
    current: row.quantity || 0,
    availableQuantity: row.availableQuantity ?? row.quantity ?? 0,
    status: row.status,
    forecasted: row.quantity || 0,
    reorderLevel: row.reorderPoint || 0,
    trend: 'down',
  }));
}
