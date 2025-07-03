'use client';

import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/apiUtils';

interface PurchaseOrderTestProps {
  cardClass: string;
}

const PurchaseOrderTest: React.FC<PurchaseOrderTestProps> = ({ cardClass }) => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPurchases();
    loadWarehouses();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPurchases({ limit: 10 });
      if (response.success) {
        setPurchases(response.data || []);
      }
    } catch (err) {
      console.error('Error loading purchases:', err);
      setError('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await apiClient.getWarehouses();
      if (response.success && Array.isArray(response.data)) {
        setWarehouses(response.data);
      } else {
        setWarehouses([]);
      }
    } catch (err) {
      console.error('Error loading warehouses:', err);
    }
  };

  const updatePurchaseStatus = async (purchaseId: string, newStatus: string) => {
    try {
      const response = await apiClient.updatePurchaseStatus(purchaseId, {
        status: newStatus,
        actualDeliveryDate: newStatus === 'delivered' ? new Date().toISOString() : undefined,
        notes: `Status updated to ${newStatus} via test interface`
      });

      if (response.success) {
        // Reload purchases to see updated data
        await loadPurchases();
        alert(`Purchase order status updated to ${newStatus}. Check inventory to see changes!`);
      } else {
        alert(`Failed to update status: ${response.message}`);
      }
    } catch (err) {
      console.error('Error updating purchase status:', err);
      alert('Failed to update purchase status');
    }
  };

  const createTestPurchaseOrder = async () => {
    if (warehouses.length === 0) {
      alert('No warehouses available');
      return;
    }

    try {
      // Create a mock purchase order
      const response = await apiClient.createPurchase({
        warehouse: { id: warehouses[0]._id },
        product: { id: '60f1b3b3b3b3b3b3b3b3b3b1' }, // Mock product ID
        supplier: { id: '60f1b3b3b3b3b3b3b3b3b3b2' }, // Mock supplier ID
        quantity: 50,
        orderDate: new Date().toISOString(),
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'Test User',
        unitPrice: 25.99
      });

      if (response.success) {
        await loadPurchases();
        alert('Test purchase order created! You can now test status updates.');
      } else {
        alert(`Failed to create purchase order: ${response.message}`);
      }
    } catch (err) {
      console.error('Error creating purchase order:', err);
      alert('Failed to create purchase order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Package className="w-5 h-5" />
          Purchase Orders & Inventory Test
        </h2>
        <button
          onClick={createTestPurchaseOrder}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Create Test Purchase Order
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li>Create a test purchase order using the button above</li>
          <li>Use the status buttons below to change the purchase order status</li>
          <li>When you mark a purchase as "delivered", inventory will automatically be updated</li>
          <li>Go to the Inventory Management tab to see the changes</li>
          <li>When you cancel a purchase, reserved inventory will be released</li>
        </ol>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading purchases...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No purchase orders found. Create a test purchase order to get started.</p>
            </div>
          ) : (
            purchases.map((purchase: any) => (
              <div key={purchase._id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{purchase.purchaseOrderNumber || `PO-${purchase._id.slice(-6)}`}</h4>
                    <p className="text-sm text-gray-600">
                      {purchase.product?.name || 'Unknown Product'} - Qty: {purchase.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Warehouse: {purchase.warehouse?.name || 'Unknown Warehouse'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(purchase.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                      {purchase.status || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {['pending', 'ordered', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updatePurchaseStatus(purchase._id, status)}
                      disabled={purchase.status === status}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        purchase.status === status
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Mark as {status}
                    </button>
                  ))}
                </div>

                {purchase.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <strong>Notes:</strong> {purchase.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderTest;
