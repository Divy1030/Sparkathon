'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Truck,
  Building2,
  Plus,
  Send
} from 'lucide-react';

interface Supplier {
  _id: string;
  name: string;
  contactInfo: {
    email: string;
    phone: string;
  };
  categories: string[];
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
}

interface Warehouse {
  _id: string;
  name: string;
  location: {
    city: string;
    state: string;
  };
}

interface PurchaseOrder {
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
  unitPrice: number;
  totalAmount: number;
  supplier: {
    id: string;
    name: string;
    contactInfo: string;
  };
  status: 'pending' | 'approved' | 'ordered' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  purchaseOrderNumber: string;
}

interface PurchaseOrderManagerProps {
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

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  ordered: 'bg-purple-100 text-purple-800',
  shipped: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function PurchaseOrderManager({ onClose }: PurchaseOrderManagerProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newPurchaseOrder, setNewPurchaseOrder] = useState({
    warehouseId: '',
    productId: '',
    quantity: 1,
    supplierId: '',
    unitPrice: 0,
    expectedDeliveryDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all necessary data
      const [purchasesRes, suppliersRes, productsRes, warehousesRes] = await Promise.all([
        fetch('/api/v1/purchases'),
        fetch('/api/v1/suppliers'),
        fetch('/api/v1/products'),
        fetch('/api/v1/warehouses')
      ]);

      const [purchasesData, suppliersData, productsData, warehousesData] = await Promise.all([
        purchasesRes.json(),
        suppliersRes.json(),
        productsRes.json(),
        warehousesRes.json()
      ]);

      if (purchasesData.success) setPurchaseOrders(purchasesData.data || []);
      if (suppliersData.success) setSuppliers(suppliersData.data || []);
      if (productsData.success) setProducts(productsData.data || []);
      if (warehousesData.success) setWarehouses(warehousesData.data || []);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const createPurchaseOrder = async () => {
    try {
      setCreating(true);
      
      const selectedProduct = products.find(p => p._id === newPurchaseOrder.productId);
      const selectedSupplier = suppliers.find(s => s._id === newPurchaseOrder.supplierId);
      const selectedWarehouse = warehouses.find(w => w._id === newPurchaseOrder.warehouseId);
      
      if (!selectedProduct || !selectedSupplier || !selectedWarehouse) {
        setError('Please select all required fields');
        return;
      }

      const purchaseData = {
        warehouse: {
          id: selectedWarehouse._id,
          name: selectedWarehouse.name
        },
        product: {
          id: selectedProduct._id,
          name: selectedProduct.name,
          sku: selectedProduct.sku,
          category: selectedProduct.category
        },
        quantity: newPurchaseOrder.quantity,
        unitPrice: newPurchaseOrder.unitPrice || selectedProduct.price,
        supplier: {
          id: selectedSupplier._id,
          name: selectedSupplier.name,
          contactInfo: selectedSupplier.contactInfo.email
        },
        expectedDeliveryDate: newPurchaseOrder.expectedDeliveryDate,
        createdBy: 'user' // In real app, this would be the logged-in user ID
      };

      const response = await fetch('/api/v1/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(purchaseData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Purchase order created successfully');
        setShowCreateForm(false);
        setNewPurchaseOrder({
          warehouseId: '',
          productId: '',
          quantity: 1,
          supplierId: '',
          unitPrice: 0,
          expectedDeliveryDate: ''
        });
        await loadData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to create purchase order');
      }
    } catch (err) {
      console.error('Error creating purchase order:', err);
      setError('Failed to create purchase order');
    } finally {
      setCreating(false);
    }
  };

  const processPurchaseDelivery = async (purchaseId: string) => {
    try {
      setProcessing(purchaseId);
      
      const response = await fetch(`/api/v1/supply-chain/purchase/${purchaseId}/delivery`, {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Purchase delivery processed! Inventory and warehouse updated automatically.');
        await loadData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to process delivery');
      }
    } catch (err) {
      console.error('Error processing delivery:', err);
      setError('Failed to process delivery');
    } finally {
      setProcessing(null);
    }
  };

  const generateAutoPurchaseOrders = async () => {
    try {
      setCreating(true);
      
      const response = await fetch('/api/v1/supply-chain/auto-purchase-orders', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Generated ${data.data.length} auto purchase orders for low stock items`);
        await loadData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to generate auto purchase orders');
      }
    } catch (err) {
      console.error('Error generating auto purchase orders:', err);
      setError('Failed to generate auto purchase orders');
    } finally {
      setCreating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'ordered': return <ShoppingCart className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const selectedProduct = products.find(p => p._id === newPurchaseOrder.productId);
    return selectedProduct ? supplier.categories.includes(selectedProduct.category) : true;
  });

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Purchase Order Management</h2>
                <p className="text-gray-600">Manage supplier purchases and track deliveries</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={generateAutoPurchaseOrders}
                disabled={creating}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {creating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Package className="w-4 h-4" />
                )}
                Auto Generate
              </button>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Purchase Order
              </button>
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
              <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-800">{success}</span>
            </div>
          )}

          {/* Create Purchase Order Form */}
          {showCreateForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Create New Purchase Order</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                  <select
                    value={newPurchaseOrder.warehouseId}
                    onChange={(e) => setNewPurchaseOrder(prev => ({ ...prev, warehouseId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select warehouse</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse._id} value={warehouse._id}>
                        {warehouse.name} - {warehouse.location.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <select
                    value={newPurchaseOrder.productId}
                    onChange={(e) => {
                      const selectedProduct = products.find(p => p._id === e.target.value);
                      setNewPurchaseOrder(prev => ({ 
                        ...prev, 
                        productId: e.target.value,
                        unitPrice: selectedProduct?.price || 0
                      }));
                    }}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select
                    value={newPurchaseOrder.supplierId}
                    onChange={(e) => setNewPurchaseOrder(prev => ({ ...prev, supplierId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select supplier</option>
                    {filteredSuppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newPurchaseOrder.quantity}
                    onChange={(e) => setNewPurchaseOrder(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPurchaseOrder.unitPrice}
                    onChange={(e) => setNewPurchaseOrder(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={newPurchaseOrder.expectedDeliveryDate}
                    onChange={(e) => setNewPurchaseOrder(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={createPurchaseOrder}
                  disabled={creating || !newPurchaseOrder.warehouseId || !newPurchaseOrder.productId || !newPurchaseOrder.supplierId}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Create Purchase Order
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {newPurchaseOrder.quantity && newPurchaseOrder.unitPrice && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Total Amount: ₹{(newPurchaseOrder.quantity * newPurchaseOrder.unitPrice).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Purchase Orders List */}
          <div className="space-y-4">
            {purchaseOrders.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No purchase orders found</p>
              </div>
            ) : (
              purchaseOrders.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-mono text-sm text-gray-600">{order.purchaseOrderNumber}</span>
                    </div>
                    
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => processPurchaseDelivery(order._id)}
                        disabled={processing === order._id}
                        className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                      >
                        {processing === order._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Product:</span>
                      <p>{order.product.name} ({order.product.sku})</p>
                      <p className="text-xs text-gray-500">{CATEGORY_DISPLAY_NAMES[order.product.category as keyof typeof CATEGORY_DISPLAY_NAMES]}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Warehouse:</span>
                      <p className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {order.warehouse.name}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Supplier:</span>
                      <p>{order.supplier.name}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Order Details:</span>
                      <p>Qty: {order.quantity} × ₹{order.unitPrice.toLocaleString()}</p>
                      <p className="font-semibold">Total: ₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>Order Date: {new Date(order.orderDate).toLocaleDateString()}</div>
                    <div>Expected Delivery: {new Date(order.expectedDeliveryDate).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
