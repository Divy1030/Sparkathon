'use client'
import React, { useState } from 'react';
import { 
  Truck, 
  Home, 
  Package, 
  Users, 
  MapPin, 
  Warehouse, 
  Bell, 
  FileText, 
  Moon, 
  Sun
} from 'lucide-react';
import { NavItem } from '../types';
import { mockAlerts } from '../data/mockData';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import InventoryForecasting from '../components/dashboard/InventoryForecasting';
import SupplierReliability from '../components/dashboard/SupplierReliability';
import LastMileDelivery from '../components/dashboard/LastMileDelivery';
import WarehouseAI from '../components/dashboard/WarehouseAI';
import MapSimulation from '../components/dashboard/MapSimulation';
import AlertsPage from '../components/dashboard/AlertsPage';
import ReportsPage from '../components/dashboard/ReportsPage';

// Main Dashboard Component
export default function SupplyChainDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [alerts, setAlerts] = useState(mockAlerts);

  const navItems: NavItem[] = [
    { id: 'dashboard', name: 'Dashboard Overview', icon: Home },
    { id: 'inventory', name: 'Inventory Forecasting', icon: Package },
    { id: 'suppliers', name: 'Supplier Reliability', icon: Users },
    { id: 'delivery', name: 'Last-Mile Delivery', icon: Truck },
    { id: 'warehouse-ai', name: 'Warehouse Selector AI', icon: Warehouse },
    { id: 'map', name: 'Map Simulation', icon: MapPin },
    { id: 'alerts', name: 'Alerts & Anomalies', icon: Bell },
    { id: 'reports', name: 'Reports & Insights', icon: FileText }
  ];

  const resolveAlert = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const bgClass = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const sidebarClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const cardClass = darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900';

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            cardClass={cardClass} 
            alerts={alerts} 
            resolveAlert={resolveAlert} 
          />
        );
      case 'inventory':
        return <InventoryForecasting cardClass={cardClass} />;
      case 'suppliers':
        return <SupplierReliability cardClass={cardClass} />;
      case 'delivery':
        return <LastMileDelivery cardClass={cardClass} />;
      case 'warehouse-ai':
        return <WarehouseAI cardClass={cardClass} />;
      case 'map':
        return <MapSimulation cardClass={cardClass} darkMode={darkMode} />;
      case 'alerts':
        return (
          <AlertsPage 
            cardClass={cardClass} 
            alerts={alerts} 
            resolveAlert={resolveAlert} 
          />
        );
      case 'reports':
        return <ReportsPage cardClass={cardClass} />;
      default:
        return (
          <DashboardOverview 
            cardClass={cardClass} 
            alerts={alerts} 
            resolveAlert={resolveAlert} 
          />
        );
    }
  };

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-200`}>
      <div className="flex">
        {/* Sidebar */}
        <div className={`w-64 fixed h-full ${sidebarClass} border-r shadow-lg overflow-y-auto`}>
          <div className="p-6">
            <h1 className="text-xl font-bold mb-8">Supply Chain AI</h1>
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
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </nav>
            
            {/* Dark Mode Toggle */}
            <div className="absolute bottom-4 left-4 right-4">
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
        <div className="flex-1 ml-64 p-8 overflow-y-auto">
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
}
