'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Settings, 
  Save,
  Plus,
  Edit3,
  BarChart3
} from 'lucide-react';

interface CategoryCapacity {
  max: number;
  current: number;
}

interface WarehouseData {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: { lat: number; lng: number; };
  };
  capacity: number;
  currentUtilization: number;
  categoryCapacities: {
    electronics: CategoryCapacity;
    clothing: CategoryCapacity;
    food: CategoryCapacity;
    books: CategoryCapacity;
    home_garden: CategoryCapacity;
    toys: CategoryCapacity;
    sports: CategoryCapacity;
  };
  inventorySummary: {
    totalItems: number;
    totalValue: number;
    categoryCounts: {
      electronics: number;
      clothing: number;
      food: number;
      books: number;
      home_garden: number;
      toys: number;
      sports: number;
    };
    lowStockCategories: string[];
    lastUpdated: string;
  };
  status: 'active' | 'inactive' | 'maintenance';
}

interface WarehouseCategoryManagerProps {
  warehouseId: string;
  onClose?: () => void;
}

const CATEGORIES = [
  'electronics',
  'clothing',
  'food', 
  'books',
  'home_garden',
  'toys',
  'sports'
];

const CATEGORY_DISPLAY_NAMES = {
  electronics: 'Electronics',
  clothing: 'Clothing',
  food: 'Food & Beverages',
  books: 'Books',
  home_garden: 'Home & Garden',
  toys: 'Toys',
  sports: 'Sports'
};

const CATEGORY_COLORS = {
  electronics: 'bg-blue-100 text-blue-800 border-blue-200',
  clothing: 'bg-purple-100 text-purple-800 border-purple-200',
  food: 'bg-green-100 text-green-800 border-green-200',
  books: 'bg-orange-100 text-orange-800 border-orange-200',
  home_garden: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  toys: 'bg-pink-100 text-pink-800 border-pink-200',
  sports: 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

export default function WarehouseCategoryManager({ warehouseId, onClose }: WarehouseCategoryManagerProps) {
  const [warehouse, setWarehouse] = useState<WarehouseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingCapacities, setEditingCapacities] = useState<{[key: string]: number}>({});
  const [editingStocks, setEditingStocks] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadWarehouseData();
  }, [warehouseId]);

  const loadWarehouseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the regular warehouse API to get warehouse data
      const response = await fetch(`/api/v1/warehouses/${warehouseId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setWarehouse(data.data);
        // Initialize editing capacities and stocks with current values
        const initialCapacities: {[key: string]: number} = {};
        const initialStocks: {[key: string]: number} = {};
        CATEGORIES.forEach(category => {
          initialCapacities[category] = data.data.categoryCapacities?.[category]?.max || 0;
          initialStocks[category] = data.data.categoryCapacities?.[category]?.current || 0;
        });
        setEditingCapacities(initialCapacities);
        setEditingStocks(initialStocks);
      } else {
        setError(data.message || 'Failed to load warehouse data');
      }
    } catch (err) {
      console.error('Error loading warehouse data:', err);
      setError('Failed to load warehouse data');
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryCapacity = async (category: string, maxCapacity: number) => {
    try {
      setSaving(true);
      setError(null);
      
      // Use the supply chain API endpoint specifically for category capacity updates
      const response = await fetch(`/api/v1/supply-chain/warehouse/${warehouseId}/category-capacity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          category, 
          maxCapacity 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Updated ${CATEGORY_DISPLAY_NAMES[category as keyof typeof CATEGORY_DISPLAY_NAMES]} capacity to ${maxCapacity}`);
        setTimeout(() => setSuccess(null), 3000);
        await loadWarehouseData(); // Reload data
      } else {
        setError(data.message || 'Failed to update capacity');
      }
    } catch (err: any) {
      console.error('Error updating capacity:', err);
      setError(err.message || 'Failed to update capacity');
    } finally {
      setSaving(false);
    }
  };

  const updateCategoryStock = async (category: string, currentStock: number) => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch(`/api/v1/supply-chain/warehouse/${warehouseId}/category-stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, currentStock })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Updated ${CATEGORY_DISPLAY_NAMES[category as keyof typeof CATEGORY_DISPLAY_NAMES]} current stock to ${currentStock}`);
        setTimeout(() => setSuccess(null), 3000);
        await loadWarehouseData();
      } else {
        setError(data.message || 'Failed to update current stock');
      }
    } catch (err: any) {
      console.error('Error updating current stock:', err);
      setError(err.message || 'Failed to update current stock');
    } finally {
      setSaving(false);
    }
  };

  const handleCapacityChange = (category: string, value: number) => {
    setEditingCapacities(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleStockChange = (category: string, value: number) => {
    setEditingStocks(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const saveCapacity = async (category: string) => {
    const newCapacity = editingCapacities[category];
    if (newCapacity !== undefined) {
      await updateCategoryCapacity(category, newCapacity);
    }
  };

  const saveStock = async (category: string) => {
    const newStock = editingStocks[category];
    if (newStock !== undefined) {
      await updateCategoryStock(category, newStock);
    }
  };

  const getUtilizationPercentage = (current: number, max: number) => {
    if (max === 0) return 0;
    return Math.round((current / max) * 100);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-500">Warehouse not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">{warehouse.name}</h2>
                <p className="text-gray-600">{warehouse.location.address}, {warehouse.location.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                warehouse.status === 'active' ? 'bg-green-100 text-green-800' : 
                warehouse.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {warehouse.status.toUpperCase()}
              </span>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-800">{success}</span>
            </div>
          )}

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Total Items</span>
              </div>
              <p className="text-2xl font-bold">{warehouse.inventorySummary.totalItems.toLocaleString()}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span className="font-medium">Total Value</span>
              </div>
              <p className="text-2xl font-bold">₹{warehouse.inventorySummary.totalValue.toLocaleString()}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Low Stock Categories</span>
              </div>
              <p className="text-2xl font-bold">{warehouse.inventorySummary.lowStockCategories.length}</p>
            </div>
          </div>

          {/* Category Capacity Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Category Capacity Management
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORIES.map((category) => {
                const categoryData = warehouse.categoryCapacities[category as keyof typeof warehouse.categoryCapacities];
                const currentCount = warehouse.inventorySummary.categoryCounts[category as keyof typeof warehouse.inventorySummary.categoryCounts];
                const utilizationPercent = getUtilizationPercentage(categoryData.current, categoryData.max);
                const isLowStock = warehouse.inventorySummary.lowStockCategories.includes(category);
                
                return (
                  <div key={category} className={`border rounded-lg p-4 ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{CATEGORY_DISPLAY_NAMES[category as keyof typeof CATEGORY_DISPLAY_NAMES]}</h4>
                      {isLowStock && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          LOW STOCK
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {/* Current vs Max Capacity */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Current: {categoryData.current}</span>
                          <span>Max: {categoryData.max}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getUtilizationColor(utilizationPercent)}`}
                            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs mt-1">{utilizationPercent}% utilized</p>
                      </div>
                      
                      {/* Edit Max Capacity */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Max Capacity</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editingCapacities[category] || 0}
                            onChange={(e) => handleCapacityChange(category, parseInt(e.target.value) || 0)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Max capacity"
                          />
                          <button
                            onClick={() => saveCapacity(category)}
                            disabled={saving || editingCapacities[category] === categoryData.max}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            title="Update Max Capacity"
                          >
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Edit Current Stock */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Current Stock</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editingStocks[category] || 0}
                            onChange={(e) => handleStockChange(category, parseInt(e.target.value) || 0)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Current stock"
                          />
                          <button
                            onClick={() => saveStock(category)}
                            disabled={saving || editingStocks[category] === categoryData.current}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            title="Update Current Stock"
                          >
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Package className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Items:</span> {currentCount}
                        </div>
                        <div>
                          <span className="font-medium">Available:</span> {Math.max(0, categoryData.max - categoryData.current)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-6 text-sm text-gray-500">
            Last updated: {new Date(warehouse.inventorySummary.lastUpdated).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
