'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save, Trash2, Package, TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiClient } from '../../lib/apiUtils';

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price?: number;
}

interface InventoryItem {
  _id: string;
  warehouse: {
    id: string;
    name: string;
  };
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
  };
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderPoint: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  location?: {
    zone?: string;
    aisle?: string;
    shelf?: string;
    bin?: string;
  };
}

interface InventoryFormProps {
  warehouseId: string;
  warehouseName: string;
  onClose?: () => void;
  onSave?: () => void;
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

export default function InventoryForm({ warehouseId, warehouseName, onClose, onSave }: InventoryFormProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInventoryItem, setNewInventoryItem] = useState({
    productId: '',
    quantity: 0,
    minimumStockLevel: 10,
    maximumStockLevel: 1000,
    reorderPoint: 20,
    location: {
      zone: '',
      aisle: '',
      shelf: '',
      bin: ''
    }
  });

  useEffect(() => {
    loadInventory();
    loadProducts();
  }, [warehouseId]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getWarehouseInventory(warehouseId);
      if (response.success) {
        setInventory(response.data || []);
      } else {
        setError(response.message || 'Failed to load inventory');
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      // For now, we'll create mock products since we don't have a products API
      // In a real implementation, you'd call an actual products API
      const mockProducts: Product[] = [
        { _id: '1', name: 'Laptop', sku: 'LAP001', category: 'electronics', price: 999 },
        { _id: '2', name: 'T-Shirt', sku: 'TSH001', category: 'clothing', price: 29 },
        { _id: '3', name: 'Apple', sku: 'APL001', category: 'food', price: 2 },
        { _id: '4', name: 'Novel', sku: 'NOV001', category: 'books', price: 15 },
        { _id: '5', name: 'Garden Tool', sku: 'GRD001', category: 'home_garden', price: 45 },
        { _id: '6', name: 'Action Figure', sku: 'TOY001', category: 'toys', price: 25 },
        { _id: '7', name: 'Football', sku: 'SPT001', category: 'sports', price: 35 }
      ];
      setProducts(mockProducts);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const handleQuantityChange = async (inventoryId: string, newQuantity: number) => {
    try {
      const response = await apiClient.updateInventoryQuantity(inventoryId, {
        quantity: Math.max(0, newQuantity),
        reason: 'Manual adjustment from inventory form'
      });
      
      if (response.success) {
        setInventory(prev => prev.map(item => 
          item._id === inventoryId 
            ? { ...item, quantity: Math.max(0, newQuantity) }
            : item
        ));
        setSuccess('Inventory updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to update inventory');
      }
    } catch (err) {
      console.error('Error updating inventory:', err);
      setError('Failed to update inventory');
    }
  };

  const handleAddInventoryItem = async () => {
    try {
      if (!newInventoryItem.productId) {
        setError('Please select a product');
        return;
      }

      const response = await apiClient.createOrUpdateInventory({
        warehouseId,
        productId: newInventoryItem.productId,
        quantity: newInventoryItem.quantity,
        minimumStockLevel: newInventoryItem.minimumStockLevel,
        maximumStockLevel: newInventoryItem.maximumStockLevel,
        reorderPoint: newInventoryItem.reorderPoint,
        location: newInventoryItem.location
      });

      if (response.success) {
        await loadInventory(); // Reload inventory
        setShowAddForm(false);
        setNewInventoryItem({
          productId: '',
          quantity: 0,
          minimumStockLevel: 10,
          maximumStockLevel: 1000,
          reorderPoint: 20,
          location: { zone: '', aisle: '', shelf: '', bin: '' }
        });
        setSuccess('Inventory item added successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to add inventory item');
      }
    } catch (err) {
      console.error('Error adding inventory item:', err);
      setError('Failed to add inventory item');
    }
  };

  const handleDeleteInventoryItem = async (inventoryId: string) => {
    try {
      const response = await apiClient.deleteInventory(inventoryId);
      if (response.success) {
        setInventory(prev => prev.filter(item => item._id !== inventoryId));
        setSuccess('Inventory item deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to delete inventory item');
      }
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      setError('Failed to delete inventory item');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Package className="w-4 h-4 text-green-500" />;
      case 'low_stock':
        return <TrendingDown className="w-4 h-4 text-yellow-500" />;
      case 'out_of_stock':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'overstocked':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      in_stock: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
      overstocked: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const filteredInventory = selectedCategory === 'all' 
    ? inventory 
    : inventory.filter(item => item.product.category === selectedCategory);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Inventory Management - {warehouseName}</h2>
          </div>
          <p className="text-gray-600">
            Manage stock levels, set reorder points, and track inventory status for this warehouse.
          </p>
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

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {CATEGORY_DISPLAY_NAMES[category as keyof typeof CATEGORY_DISPLAY_NAMES]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
              <button 
                onClick={loadInventory}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Add New Item Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Add New Inventory Item</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select 
                      value={newInventoryItem.productId} 
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewInventoryItem(prev => ({ ...prev, productId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select product</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} ({product.sku}) - {CATEGORY_DISPLAY_NAMES[product.category as keyof typeof CATEGORY_DISPLAY_NAMES]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={newInventoryItem.quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInventoryItem(prev => ({ 
                        ...prev, 
                        quantity: parseInt(e.target.value) || 0 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
                    <input
                      type="number"
                      min="0"
                      value={newInventoryItem.minimumStockLevel}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInventoryItem(prev => ({ 
                        ...prev, 
                        minimumStockLevel: parseInt(e.target.value) || 0 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
                    <input
                      type="number"
                      min="0"
                      value={newInventoryItem.reorderPoint}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInventoryItem(prev => ({ 
                        ...prev, 
                        reorderPoint: parseInt(e.target.value) || 0 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleAddInventoryItem}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Inventory List */}
          <div className="space-y-4">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {selectedCategory === 'all' 
                    ? 'No inventory items found for this warehouse.' 
                    : `No inventory items found for ${CATEGORY_DISPLAY_NAMES[selectedCategory as keyof typeof CATEGORY_DISPLAY_NAMES]} category.`
                  }
                </p>
              </div>
            ) : (
              filteredInventory.map((item) => (
                <div key={item._id} className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(item.status)}
                        <h4 className="font-semibold">{item.product.name}</h4>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{item.product.sku}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {CATEGORY_DISPLAY_NAMES[item.product.category as keyof typeof CATEGORY_DISPLAY_NAMES]}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Available: </span>
                          {item.availableQuantity || item.quantity}
                        </div>
                        <div>
                          <span className="font-medium">Reserved: </span>
                          {item.reservedQuantity || 0}
                        </div>
                        <div>
                          <span className="font-medium">Min Level: </span>
                          {item.minimumStockLevel}
                        </div>
                        <div>
                          <span className="font-medium">Reorder Point: </span>
                          {item.reorderPoint}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 0}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuantityChange(item._id, parseInt(e.target.value) || 0)}
                        className="w-20 text-center px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteInventoryItem(item._id)}
                        className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {onSave && (
              <button 
                onClick={onSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            )}
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
    </div>
  );
}
