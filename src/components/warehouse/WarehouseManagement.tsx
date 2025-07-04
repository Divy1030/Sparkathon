'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Settings, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  MapPin,
  Users,
  TrendingUp,
  Eye,
  RefreshCw
} from 'lucide-react';
import WarehouseForm from '../forms/WarehouseForm';
import WarehouseCategoryManager from './WarehouseCategoryManager';
import { apiClient } from '../../lib/apiUtils';

interface WarehouseManagementProps {
  cardClass: string;
}

interface Warehouse {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: { lat: number; lng: number; };
  };
  capacity?: number;
  currentUtilization?: number;
  categoryCapacities?: {
    electronics: { max: number; current: number; };
    clothing: { max: number; current: number; };
    food: { max: number; current: number; };
    books: { max: number; current: number; };
    home_garden: { max: number; current: number; };
    toys: { max: number; current: number; };
    sports: { max: number; current: number; };
  };
  inventorySummary?: {
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
  status?: 'active' | 'inactive' | 'maintenance';
  operationalHours?: {
    open: string;
    close: string;
    timezone: string;
  };
  manager?: {
    name: string;
    email: string;
    phone: string;
  };
  facilities?: string[];
  createdAt?: string;
  updatedAt?: string;
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

export default function WarehouseManagement({ cardClass }: WarehouseManagementProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'create' | 'manage' | 'analytics'>('overview');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [selectedWarehouseForCategory, setSelectedWarehouseForCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getWarehouses();
      if (response.success && response.data) {
        setWarehouses(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Failed to fetch warehouses');
      }
    } catch (err) {
      console.error('Error fetching warehouses:', err);
      setError('Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWarehouse = async (warehouseId: string) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.deleteWarehouse(warehouseId);
      
      if (response.success) {
        setSuccess('Warehouse deleted successfully');
        await fetchWarehouses();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to delete warehouse');
      }
    } catch (err: any) {
      console.error('Error deleting warehouse:', err);
      setError(err.message || 'Failed to delete warehouse');
    } finally {
      setLoading(false);
    }
  };

  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || warehouse.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600 bg-red-100';
    if (utilization >= 75) return 'text-yellow-600 bg-yellow-100';
    if (utilization >= 50) return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${cardClass} p-6 rounded-lg border shadow-sm`}>
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Warehouses</p>
              <p className="text-2xl font-bold">{warehouses.length}</p>
            </div>
          </div>
        </div>
        
        <div className={`${cardClass} p-6 rounded-lg border shadow-sm`}>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Active Warehouses</p>
              <p className="text-2xl font-bold">{warehouses.filter(w => w.status === 'active').length}</p>
            </div>
          </div>
        </div>
        
        <div className={`${cardClass} p-6 rounded-lg border shadow-sm`}>
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Capacity</p>
              <p className="text-2xl font-bold">{warehouses.reduce((sum, w) => sum + (w.capacity || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className={`${cardClass} p-6 rounded-lg border shadow-sm`}>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Avg Utilization</p>
              <p className="text-2xl font-bold">
                {warehouses.length > 0 
                  ? Math.round(warehouses.reduce((sum, w) => sum + (w.currentUtilization || 0), 0) / warehouses.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className={`${cardClass} p-6 rounded-lg border shadow-sm`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search warehouses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <button
            onClick={fetchWarehouses}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Warehouses List */}
      <div className={`${cardClass} rounded-lg border shadow-sm overflow-hidden`}>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Warehouses</h3>
        </div>
        
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
        
        {!loading && filteredWarehouses.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No warehouses found
          </div>
        )}
        
        {!loading && filteredWarehouses.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Warehouse</th>
                  <th className="text-left p-4 font-medium">Location</th>
                  <th className="text-left p-4 font-medium">Capacity</th>
                  <th className="text-left p-4 font-medium">Utilization</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{warehouse.name}</p>
                        <p className="text-sm text-gray-600">{warehouse.manager?.name || 'No manager assigned'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm">{warehouse.location.city}, {warehouse.location.state}</p>
                          <p className="text-xs text-gray-500">{warehouse.location.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{warehouse.capacity?.toLocaleString() || '0'}</p>
                        <p className="text-sm text-gray-600">Items: {warehouse.inventorySummary?.totalItems?.toLocaleString() || '0'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getUtilizationColor(warehouse.currentUtilization || 0)}`}>
                        {warehouse.currentUtilization || 0}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(warehouse.status || 'inactive')}`}>
                        {(warehouse.status || 'inactive').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedWarehouseForCategory(warehouse._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Manage Categories"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingWarehouse(warehouse);
                            setShowWarehouseForm(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Warehouse"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWarehouse(warehouse._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Warehouse"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderCreateWarehouse = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Plus className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Create New Warehouse</h2>
      </div>
      
      <WarehouseForm
        cardClass={cardClass}
        onSubmit={async (data) => {
          try {
            setLoading(true);
            setError(null);
            
            const response = await apiClient.createWarehouse(data);
            if (response.success) {
              await fetchWarehouses();
              setActiveSection('overview');
              setSuccess('Warehouse created successfully');
              setTimeout(() => setSuccess(null), 3000);
            } else {
              setError(response.message || 'Failed to create warehouse');
            }
          } catch (err: any) {
            console.error('Error creating warehouse:', err);
            setError(err.message || 'Failed to create warehouse');
          } finally {
            setLoading(false);
          }
        }}
        onCancel={() => setActiveSection('overview')}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🏭 Warehouse Management</h1>
          <p className="text-gray-600 mt-1">Comprehensive warehouse operations and management</p>
        </div>
        <button
          onClick={() => setActiveSection('create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Warehouse
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className={`${cardClass} border rounded-lg overflow-hidden`}>
        <div className="flex border-b">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeSection === 'overview'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveSection('create')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeSection === 'create'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create
            </div>
          </button>
          <button
            onClick={() => setActiveSection('analytics')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeSection === 'analytics'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'create' && renderCreateWarehouse()}
          {activeSection === 'analytics' && (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Analytics coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Management Modal */}
      {selectedWarehouseForCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Category Management</h2>
              <button
                onClick={() => setSelectedWarehouseForCategory(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <WarehouseCategoryManager
                warehouseId={selectedWarehouseForCategory}
                onClose={() => setSelectedWarehouseForCategory(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Form Modal */}
      {showWarehouseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingWarehouse ? 'Edit Warehouse' : 'Create Warehouse'}
              </h2>
              <button
                onClick={() => {
                  setShowWarehouseForm(false);
                  setEditingWarehouse(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <WarehouseForm
                cardClass="bg-white"
                editingWarehouse={editingWarehouse}
                onSubmit={async (data) => {
                  try {
                    setLoading(true);
                    setError(null);
                    
                    let response;
                    if (editingWarehouse) {
                      response = await apiClient.updateWarehouse(editingWarehouse._id, data);
                    } else {
                      response = await apiClient.createWarehouse(data);
                    }
                    
                    if (response.success) {
                      await fetchWarehouses();
                      setShowWarehouseForm(false);
                      setEditingWarehouse(null);
                      setSuccess(editingWarehouse ? 'Warehouse updated successfully' : 'Warehouse created successfully');
                      setTimeout(() => setSuccess(null), 3000);
                    } else {
                      setError(response.message || `Failed to ${editingWarehouse ? 'update' : 'create'} warehouse`);
                    }
                  } catch (err: any) {
                    console.error(`Error ${editingWarehouse ? 'updating' : 'creating'} warehouse:`, err);
                    setError(err.message || `Failed to ${editingWarehouse ? 'update' : 'create'} warehouse`);
                  } finally {
                    setLoading(false);
                  }
                }}
                onCancel={() => {
                  setShowWarehouseForm(false);
                  setEditingWarehouse(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
