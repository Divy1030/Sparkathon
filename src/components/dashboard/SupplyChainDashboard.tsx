'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  Building2, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Eye
} from 'lucide-react';

// Import the new components
import WarehouseCategoryManager from '../warehouse/WarehouseCategoryManager';
import PurchaseOrderManager from '../purchase/PurchaseOrderManager';
import CustomerOrderManager from '../customer/CustomerOrderManager';
import InventoryForm from '../forms/InventoryForm';

interface DashboardData {
  warehouseUtilization: Array<{
    id: string;
    name: string;
    totalCapacity: number;
    currentUtilization: number;
    categoryCapacities: any;
    inventorySummary: any;
  }>;
  inventorySummary: {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  activeOrders: number;
  pendingPurchases: number;
  recentAlerts: Array<{
    _id: string;
    type: string;
    category: string;
    title: string;
    message: string;
    severity: number;
    actionRequired: boolean;
    createdAt: string;
  }>;
}

type ActiveView = 'dashboard' | 'warehouse' | 'purchase' | 'customer' | 'inventory';

export default function SupplyChainDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/v1/supply-chain/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600 bg-red-100';
    if (utilization >= 75) return 'text-orange-600 bg-orange-100';
    if (utilization >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderNavigation = () => (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeView === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveView('warehouse')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeView === 'warehouse' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Warehouse Management
          </button>
          
          <button
            onClick={() => setActiveView('purchase')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeView === 'purchase' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Purchase Orders
          </button>
          
          <button
            onClick={() => setActiveView('customer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeView === 'customer' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Customer Orders
          </button>
          
          <button
            onClick={() => setActiveView('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeView === 'inventory' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Package className="w-4 h-4" />
            Inventory Management
          </button>
        </div>
      </div>
    </div>
  );

  const renderDashboardView = () => {
    if (!dashboardData) return null;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboardData.inventorySummary.totalItems.toLocaleString()}</p>
                <p className="text-gray-600">Total Items</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{dashboardData.inventorySummary.totalValue.toLocaleString()}</p>
                <p className="text-gray-600">Inventory Value</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboardData.activeOrders}</p>
                <p className="text-gray-600">Active Orders</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboardData.pendingPurchases}</p>
                <p className="text-gray-600">Pending Purchases</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Status Alerts */}
        {(dashboardData.inventorySummary.lowStockCount > 0 || dashboardData.inventorySummary.outOfStockCount > 0) && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Stock Alerts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.inventorySummary.lowStockCount > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Low Stock Items</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-700">{dashboardData.inventorySummary.lowStockCount}</p>
                  <p className="text-sm text-yellow-600">Items below reorder point</p>
                </div>
              )}
              
              {dashboardData.inventorySummary.outOfStockCount > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">Out of Stock</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700">{dashboardData.inventorySummary.outOfStockCount}</p>
                  <p className="text-sm text-red-600">Items completely out of stock</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warehouse Utilization */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Warehouse Utilization
          </h3>
          <div className="space-y-4">
            {dashboardData.warehouseUtilization.map((warehouse) => (
              <div key={warehouse.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{warehouse.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationColor(warehouse.currentUtilization)}`}>
                      {warehouse.currentUtilization}% Used
                    </span>
                    <button
                      onClick={() => {
                        setSelectedWarehouseId(warehouse.id);
                        setActiveView('warehouse');
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Eye className="w-3 h-3" />
                      Manage
                    </button>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      warehouse.currentUtilization >= 90 ? 'bg-red-500' :
                      warehouse.currentUtilization >= 75 ? 'bg-orange-500' :
                      warehouse.currentUtilization >= 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(warehouse.currentUtilization, 100)}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <span>Capacity: {warehouse.totalCapacity.toLocaleString()} units</span>
                  <span className="mx-2">•</span>
                  <span>Used: {Math.round((warehouse.currentUtilization / 100) * warehouse.totalCapacity).toLocaleString()} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        {dashboardData.recentAlerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recent Alerts
            </h3>
            <div className="space-y-3">
              {dashboardData.recentAlerts.slice(0, 5).map((alert) => (
                <div key={alert._id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity === 1 ? 'INFO' : alert.severity === 2 ? 'LOW' : alert.severity === 3 ? 'MEDIUM' : 'HIGH'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {alert.actionRequired && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Action Required
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'warehouse':
        if (selectedWarehouseId) {
          return (
            <WarehouseCategoryManager 
              warehouseId={selectedWarehouseId}
              onClose={() => {
                setSelectedWarehouseId('');
                setActiveView('dashboard');
              }}
            />
          );
        } else {
          // Show warehouse selection
          return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Select a Warehouse to Manage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData?.warehouseUtilization.map((warehouse) => (
                  <button
                    key={warehouse.id}
                    onClick={() => setSelectedWarehouseId(warehouse.id)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{warehouse.name}</h4>
                        <p className="text-sm text-gray-600">{warehouse.currentUtilization}% utilized</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        }
      
      case 'purchase':
        return <PurchaseOrderManager onClose={() => setActiveView('dashboard')} />;
      
      case 'customer':
        return <CustomerOrderManager onClose={() => setActiveView('dashboard')} />;
      
      case 'inventory':
        if (selectedWarehouseId) {
          const warehouse = dashboardData?.warehouseUtilization.find(w => w.id === selectedWarehouseId);
          return (
            <InventoryForm 
              warehouseId={selectedWarehouseId}
              warehouseName={warehouse?.name || 'Unknown Warehouse'}
              onClose={() => {
                setSelectedWarehouseId('');
                setActiveView('dashboard');
              }}
            />
          );
        } else {
          // Show warehouse selection for inventory
          return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Select a Warehouse for Inventory Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData?.warehouseUtilization.map((warehouse) => (
                  <button
                    key={warehouse.id}
                    onClick={() => setSelectedWarehouseId(warehouse.id)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-6 h-6 text-green-600" />
                      <div>
                        <h4 className="font-medium">{warehouse.name}</h4>
                        <p className="text-sm text-gray-600">
                          {warehouse.inventorySummary?.totalItems || 0} items
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        }
      
      default:
        return renderDashboardView();
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading supply chain dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supply Chain Dashboard</h1>
            <p className="text-gray-600">Integrated warehouse, purchase, and customer order management</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-red-800">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        {/* Navigation */}
        {renderNavigation()}

        {/* Main Content */}
        {renderActiveView()}
      </div>
    </div>
  );
}
