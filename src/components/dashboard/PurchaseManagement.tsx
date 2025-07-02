import React, { useState } from 'react';
import { ShoppingCart, Package, Plus, Search, Filter, Truck, DollarSign, Clock, CheckCircle, MapPin } from 'lucide-react';
import { warehouses } from '../../constant/data';
import { Warehouse } from '../../types';

interface PurchaseManagementProps {
  cardClass: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  price: number;
  supplier: string;
  lastOrdered: string;
  leadTime: number;
}

interface PurchaseOrder {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier: string;
  warehouseId: string;
  warehouseName: string;
  status: 'pending' | 'ordered' | 'shipped' | 'delivered';
  orderDate: string;
  expectedDelivery: string;
}

const PurchaseManagement: React.FC<PurchaseManagementProps> = ({ cardClass }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);

  // Mock data for products
  const products: Product[] = [
    {
      id: 'P001',
      name: 'Smartphones',
      category: 'Electronics',
      currentStock: 45,
      minStock: 100,
      price: 299.99,
      supplier: 'TechFlow Logistics',
      lastOrdered: '2024-11-15',
      leadTime: 5
    },
    {
      id: 'P002',
      name: 'Laptops',
      category: 'Electronics',
      currentStock: 23,
      minStock: 50,
      price: 899.99,
      supplier: 'TechFlow Logistics',
      lastOrdered: '2024-11-10',
      leadTime: 7
    },
    {
      id: 'P003',
      name: 'T-Shirts',
      category: 'Clothing',
      currentStock: 150,
      minStock: 200,
      price: 24.99,
      supplier: 'QuickShip Express',
      lastOrdered: '2024-11-20',
      leadTime: 3
    },
    {
      id: 'P004',
      name: 'Jeans',
      category: 'Clothing',
      currentStock: 78,
      minStock: 120,
      price: 59.99,
      supplier: 'QuickShip Express',
      lastOrdered: '2024-11-18',
      leadTime: 4
    },
    {
      id: 'P005',
      name: 'Organic Rice',
      category: 'Food',
      currentStock: 200,
      minStock: 500,
      price: 12.99,
      supplier: 'ReliableCargo',
      lastOrdered: '2024-11-25',
      leadTime: 2
    }
  ];

  // Mock data for purchase orders
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'PO001',
      productName: 'Smartphones',
      quantity: 100,
      unitPrice: 299.99,
      totalPrice: 29999,
      supplier: 'TechFlow Logistics',
      warehouseId: 'WH001',
      warehouseName: 'Austin Central Warehouse',
      status: 'shipped',
      orderDate: '2024-11-20',
      expectedDelivery: '2024-12-02'
    },
    {
      id: 'PO002',
      productName: 'T-Shirts',
      quantity: 200,
      unitPrice: 24.99,
      totalPrice: 4998,
      supplier: 'QuickShip Express',
      warehouseId: 'WH002',
      warehouseName: 'Dallas Distribution Center',
      status: 'delivered',
      orderDate: '2024-11-18',
      expectedDelivery: '2024-11-28'
    },
    {
      id: 'PO003',
      productName: 'Organic Rice',
      quantity: 500,
      unitPrice: 12.99,
      totalPrice: 6495,
      supplier: 'ReliableCargo',
      warehouseId: 'WH003',
      warehouseName: 'Houston Industrial Hub',
      status: 'pending',
      orderDate: '2024-11-30',
      expectedDelivery: '2024-12-05'
    }
  ]);

  const categories = ['all', 'Electronics', 'Clothing', 'Food'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = () => {
    if (!selectedProduct || !selectedWarehouse) return;

    const newOrder: PurchaseOrder = {
      id: `PO${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      productName: selectedProduct.name,
      quantity: purchaseQuantity,
      unitPrice: selectedProduct.price,
      totalPrice: purchaseQuantity * selectedProduct.price,
      supplier: selectedProduct.supplier,
      warehouseId: selectedWarehouse.id,
      warehouseName: selectedWarehouse.name,
      status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + selectedProduct.leadTime * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setPurchaseOrders(prev => [newOrder, ...prev]);
    setShowPurchaseModal(false);
    setSelectedProduct(null);
    setSelectedWarehouse(null);
    setPurchaseQuantity(1);
  };

  const getStockStatus = (current: number, min: number) => {
    const percentage = (current / min) * 100;
    if (percentage <= 50) return { color: 'text-red-600', bg: 'bg-red-100', status: 'Critical' };
    if (percentage <= 80) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'Low' };
    return { color: 'text-green-600', bg: 'bg-green-100', status: 'Good' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'ordered': return <Package className="w-4 h-4 text-blue-600" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-600" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">🛒 Purchase Management</h2>
          <p className="text-gray-600 mt-1">Manage inventory purchases and track orders</p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.currentStock, product.minStock);
          const needsReorder = product.currentStock <= product.minStock;

          return (
            <div key={product.id} className={`p-6 rounded-lg ${cardClass} border shadow-sm ${needsReorder ? 'ring-2 ring-red-200' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                  {stockStatus.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Stock:</span>
                  <span className="font-medium">{product.currentStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Min Stock:</span>
                  <span className="font-medium">{product.minStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="font-medium">${product.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Supplier:</span>
                  <span className="text-sm">{product.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lead Time:</span>
                  <span className="text-sm">{product.leadTime} days</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedProduct(product);
                  setShowPurchaseModal(true);
                }}
                className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                  needsReorder
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                {needsReorder ? 'Urgent Reorder' : 'Purchase'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Recent Purchase Orders */}
      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <h3 className="text-lg font-semibold mb-4">Recent Purchase Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Order ID</th>
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">Quantity</th>
                <th className="text-left py-2">Total</th>
                <th className="text-left py-2">Warehouse</th>
                <th className="text-left py-2">Supplier</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Expected Delivery</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{order.id}</td>
                  <td className="py-3">{order.productName}</td>
                  <td className="py-3">{order.quantity}</td>
                  <td className="py-3">${order.totalPrice.toLocaleString()}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      {order.warehouseName}
                    </div>
                  </td>
                  <td className="py-3 text-sm">{order.supplier}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="capitalize text-sm">{order.status}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm">{order.expectedDelivery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardClass} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
            <h3 className="text-lg font-semibold mb-4">Purchase {selectedProduct.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Warehouse</label>
                <select
                  value={selectedWarehouse?.id || ''}
                  onChange={(e) => {
                    const warehouse = warehouses.find(w => w.id === e.target.value);
                    setSelectedWarehouse(warehouse || null);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a warehouse...</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} (Load: {warehouse.load}%, Efficiency: {warehouse.efficiency}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Unit Price:</span>
                  <span>${selectedProduct.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{purchaseQuantity}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${(selectedProduct.price * purchaseQuantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Supplier:</span>
                  <span>{selectedProduct.supplier}</span>
                </div>
                {selectedWarehouse && (
                  <div className="flex justify-between">
                    <span>Warehouse:</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedWarehouse.name}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Expected Delivery:</span>
                  <span>{new Date(Date.now() + selectedProduct.leadTime * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={!selectedWarehouse}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  selectedWarehouse
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseManagement;
