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
  Sun,
  ChevronDown,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';
import { NavItem } from '../types';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import InventoryForecasting from '../components/dashboard/InventoryForecasting';
import SupplierReliability from '../components/dashboard/SupplierReliability';
import LastMileDelivery from '../components/dashboard/LastMileDelivery';
import WarehouseAI from '../components/dashboard/WarehouseAI';
import PurchaseOrderManager from '../components/purchase/PurchaseOrderManager';
import MapSimulation from '../components/dashboard/MapSimulation';
import AlertsPage from '../components/dashboard/AlertsPage';
import ReportsPage from '../components/dashboard/ReportsPage';
import IntegratedSupplyChainDashboard from '../components/dashboard/SupplyChainDashboard';

// Main Dashboard Component
export default function SupplyChainDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [inventoryDropdownOpen, setInventoryDropdownOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'dashboard', name: 'Dashboard Overview', icon: Home },
    { id: 'supply-chain', name: 'Supply Chain Management', icon: ShoppingCart },
    { id: 'forecasting', name: 'Inventory Forecasting', icon: Package },
    { id: 'suppliers', name: 'Supplier Reliability', icon: Users },
    { id: 'delivery', name: 'Last-Mile Delivery', icon: Truck },
    { id: 'map', name: 'Map Simulation', icon: MapPin },
    { id: 'alerts', name: 'Alerts & Anomalies', icon: Bell },
    { id: 'reports', name: 'Reports & Insights', icon: FileText }
  ];

  const bgClass = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const sidebarClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const cardClass = darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900';

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            cardClass={cardClass}
          />
        );
      case 'supply-chain':
        return <IntegratedSupplyChainDashboard />;
      case 'forecasting':
        return <InventoryForecasting cardClass={cardClass} />;
      case 'suppliers':
        return <SupplierReliability cardClass={cardClass} />;
      case 'delivery':
        return <LastMileDelivery cardClass={cardClass} />;
      case 'warehouse-ai':
        return <WarehouseAI cardClass={cardClass} />;
      case 'purchase':
        return <PurchaseOrderManager />;
      case 'map':
        return <MapSimulation cardClass={cardClass} darkMode={darkMode} />;
      case 'alerts':
        return (
          <AlertsPage 
            cardClass={cardClass}
          />
        );
      case 'reports':
        return <ReportsPage cardClass={cardClass} />;
      default:
        return (
          <DashboardOverview 
            cardClass={cardClass}
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
              
              {/* Inventory Section with Dropdown */}
              <div className="mt-4">
                <button
                  onClick={() => setInventoryDropdownOpen(!inventoryDropdownOpen)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    (activeTab === 'warehouse-ai' || activeTab === 'purchase')
                      ? 'bg-blue-500 text-white'
                      : darkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Warehouse className="w-5 h-5" />
                  <span className="text-sm font-medium flex-1">Inventory</span>
                  {inventoryDropdownOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {/* Dropdown Items */}
                {inventoryDropdownOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    <button
                      onClick={() => setActiveTab('warehouse-ai')}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                        activeTab === 'warehouse-ai'
                          ? 'bg-blue-400 text-white'
                          : darkMode 
                            ? 'hover:bg-gray-700 text-gray-400' 
                            : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <Warehouse className="w-4 h-4" />
                      <span className="text-sm">Warehouse AI</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('purchase')}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                        activeTab === 'purchase'
                          ? 'bg-blue-400 text-white'
                          : darkMode 
                            ? 'hover:bg-gray-700 text-gray-400' 
                            : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm">Purchase</span>
                    </button>
                  </div>
                )}
              </div>
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
