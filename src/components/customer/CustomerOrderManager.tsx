'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Truck,
  Building2,
  Plus,
  Send,
  Star
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
}

interface CustomerOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  };
  items: Array<{
    product: {
      id: string;
      name: string;
      sku: string;
      category: string;
    };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  assignedWarehouse?: {
    id: string;
    name: string;
    estimatedDeliveryTime: number;
    distance: number;
  };
  orderTotal: {
    subtotal: number;
    tax: number;
    shippingCost: number;
    totalAmount: number;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash_on_delivery' | 'credit_card' | 'debit_card' | 'upi' | 'bank_transfer';
  expectedDeliveryDate?: string;
  warehouseSelectionReason?: string;
  createdAt: string;
}

interface CustomerOrderManagerProps {
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
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  packed: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export default function CustomerOrderManager({ onClose }: CustomerOrderManagerProps) {
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newOrder, setNewOrder] = useState({
    customer: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'India',
        zipCode: '',
        coordinates: { lat: 0, lng: 0 }
      }
    },
    items: [{ productId: '', quantity: 1 }],
    priority: 'medium' as const,
    paymentMethod: 'cash_on_delivery' as const
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // For now, we'll use mock data for customer orders since the endpoint might not exist yet
      // In a real implementation, you'd call the actual API
      const mockOrders: CustomerOrder[] = [
        {
          _id: '1',
          orderNumber: 'ORD-2024001',
          customer: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+91-9876543210',
            address: {
              street: '123 Main St',
              city: 'Mumbai',
              state: 'Maharashtra',
              country: 'India',
              zipCode: '400001',
              coordinates: { lat: 19.0760, lng: 72.8777 }
            }
          },
          items: [
            {
              product: { id: '1', name: 'Laptop', sku: 'LAP001', category: 'electronics' },
              quantity: 1,
              unitPrice: 50000,
              totalPrice: 50000
            }
          ],
          assignedWarehouse: {
            id: 'wh1',
            name: 'Mumbai Central Warehouse',
            estimatedDeliveryTime: 24,
            distance: 15.5
          },
          orderTotal: {
            subtotal: 50000,
            tax: 9000,
            shippingCost: 200,
            totalAmount: 59200
          },
          status: 'confirmed',
          priority: 'high',
          paymentStatus: 'paid',
          paymentMethod: 'upi',
          expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          warehouseSelectionReason: 'Closest warehouse with available stock',
          createdAt: new Date().toISOString()
        }
      ];
      
      setCustomerOrders(mockOrders);

      // Load products
      const productsRes = await fetch('/api/v1/products');
      const productsData = await productsRes.json();
      if (productsData.success) setProducts(productsData.data || []);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load customer orders');
    } finally {
      setLoading(false);
    }
  };

  const createCustomerOrder = async () => {
    try {
      setCreating(true);
      
      // Calculate order details
      const items = newOrder.items.map(item => {
        const product = products.find(p => p._id === item.productId);
        if (!product) throw new Error('Product not found');
        
        return {
          product: {
            id: product._id,
            name: product.name,
            sku: product.sku,
            category: product.category
          },
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: item.quantity * product.price
        };
      });

      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.18; // 18% GST
      const shippingCost = subtotal > 5000 ? 0 : 200; // Free shipping above ₹5000
      const totalAmount = subtotal + tax + shippingCost;

      const orderData = {
        customer: newOrder.customer,
        items,
        orderTotal: {
          subtotal,
          tax,
          shippingCost,
          totalAmount
        },
        priority: newOrder.priority,
        paymentMethod: newOrder.paymentMethod,
        paymentStatus: 'pending'
      };

      const response = await fetch('/api/v1/supply-chain/customer-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Customer order created and optimal warehouse assigned automatically!');
        setShowCreateForm(false);
        setNewOrder({
          customer: {
            name: '',
            email: '',
            phone: '',
            address: {
              street: '',
              city: '',
              state: '',
              country: 'India',
              zipCode: '',
              coordinates: { lat: 0, lng: 0 }
            }
          },
          items: [{ productId: '', quantity: 1 }],
          priority: 'medium',
          paymentMethod: 'cash_on_delivery'
        });
        await loadData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to create customer order');
      }
    } catch (err) {
      console.error('Error creating customer order:', err);
      setError('Failed to create customer order');
    } finally {
      setCreating(false);
    }
  };

  const fulfillOrder = async (orderId: string) => {
    try {
      setProcessing(orderId);
      
      const response = await fetch(`/api/v1/supply-chain/customer-order/${orderId}/fulfill`, {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Order fulfilled! Inventory has been updated and items reserved.');
        await loadData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to fulfill order');
      }
    } catch (err) {
      console.error('Error fulfilling order:', err);
      setError('Failed to fulfill order');
    } finally {
      setProcessing(null);
    }
  };

  const addOrderItem = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
    }));
  };

  const removeOrderItem = (index: number) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'packed': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      case 'returned': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Star className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Customer Order Management</h2>
                <p className="text-gray-600">Process customer orders and manage fulfillment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Customer Order
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

          {/* Create Customer Order Form */}
          {showCreateForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Create New Customer Order</h3>
              
              {/* Customer Information */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={newOrder.customer.name}
                      onChange={(e) => setNewOrder(prev => ({
                        ...prev,
                        customer: { ...prev.customer, name: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter customer name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newOrder.customer.email}
                      onChange={(e) => setNewOrder(prev => ({
                        ...prev,
                        customer: { ...prev.customer, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newOrder.customer.phone}
                      onChange={(e) => setNewOrder(prev => ({
                        ...prev,
                        customer: { ...prev.customer, phone: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={newOrder.customer.address.city}
                      onChange={(e) => setNewOrder(prev => ({
                        ...prev,
                        customer: { 
                          ...prev.customer, 
                          address: { ...prev.customer.address, city: e.target.value }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter city"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Order Items</h4>
                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-3 h-3" />
                    Add Item
                  </button>
                </div>
                
                {newOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 mb-3">
                    <select
                      value={item.productId}
                      onChange={(e) => updateOrderItem(index, 'productId', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select product</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} ({product.sku}) - ₹{product.price}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Qty"
                    />
                    
                    {newOrder.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOrderItem(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Order Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={newOrder.paymentMethod}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={createCustomerOrder}
                  disabled={creating || !newOrder.customer.name || !newOrder.customer.email || newOrder.items.some(item => !item.productId)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Create Order
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Customer Orders List */}
          <div className="space-y-4">
            {customerOrders.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No customer orders found</p>
              </div>
            ) : (
              customerOrders.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(order.priority)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[order.priority as keyof typeof PRIORITY_COLORS]}`}>
                          {order.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <span className="font-mono text-sm text-gray-600">{order.orderNumber}</span>
                    </div>
                    
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => fulfillOrder(order._id)}
                        disabled={processing === order._id}
                        className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm"
                      >
                        {processing === order._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                        Start Fulfillment
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Customer</h4>
                      <p className="text-sm">{order.customer.name}</p>
                      <p className="text-xs text-gray-500">{order.customer.email}</p>
                      <p className="text-xs text-gray-500">{order.customer.phone}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Delivery Address</h4>
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5 text-gray-400" />
                        <div className="text-xs text-gray-600">
                          <p>{order.customer.address.street}</p>
                          <p>{order.customer.address.city}, {order.customer.address.state}</p>
                          <p>{order.customer.address.zipCode}</p>
                        </div>
                      </div>
                    </div>
                    
                    {order.assignedWarehouse && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Assigned Warehouse</h4>
                        <div className="flex items-start gap-1">
                          <Building2 className="w-3 h-3 mt-0.5 text-gray-400" />
                          <div className="text-xs text-gray-600">
                            <p className="font-medium">{order.assignedWarehouse.name}</p>
                            <p>Distance: {order.assignedWarehouse.distance}km</p>
                            <p>ETA: {order.assignedWarehouse.estimatedDeliveryTime}h</p>
                          </div>
                        </div>
                        {order.warehouseSelectionReason && (
                          <p className="text-xs text-blue-600 mt-1">{order.warehouseSelectionReason}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.product.name} ({item.product.sku}) × {item.quantity}</span>
                          <span>₹{item.totalPrice.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t mt-2 pt-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{order.orderTotal.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>₹{order.orderTotal.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>₹{order.orderTotal.shippingCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₹{order.orderTotal.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>Order Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                    {order.expectedDeliveryDate && (
                      <div>Expected Delivery: {new Date(order.expectedDeliveryDate).toLocaleDateString()}</div>
                    )}
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
