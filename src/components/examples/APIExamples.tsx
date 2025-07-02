import React, { useState } from 'react';
import { 
  useWarehouses, 
  useProducts, 
  usePurchases, 
  useApiMutation 
} from '../../hooks/useApi';
import { 
  warehouseAPI, 
  productAPI, 
  purchaseAPI, 
  type CreatePurchaseData,
  type Warehouse,
  type Product,
  type Purchase
} from '../../api';

const APIExamplesComponent = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Using hooks to fetch data
  const { warehouses, loading: warehousesLoading } = useWarehouses({ status: 'active' });
  const { products, loading: productsLoading } = useProducts({ 
    category: selectedCategory || undefined,
    status: 'active' 
  });
  const { purchases, loading: purchasesLoading } = usePurchases({ 
    warehouse: selectedWarehouse || undefined 
  });

  // Using mutation hooks for create/update operations
  const createWarehouse = useApiMutation(warehouseAPI.create);
  const createProduct = useApiMutation(productAPI.create);
  const createPurchase = useApiMutation(purchaseAPI.create);

  // Example: Create a new purchase
  const handleCreatePurchase = async () => {
    if (!selectedWarehouse || !products.length) return;

    const purchaseData: CreatePurchaseData = {
      warehouse: { id: selectedWarehouse },
      product: { id: products[0]._id },
      quantity: 10,
      supplier: { id: products[0].supplier.id },
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'user-id-here' // You'll get this from auth context
    };

    try {
      await createPurchase.mutate(purchaseData);
      alert('Purchase order created successfully!');
    } catch (error) {
      alert('Failed to create purchase order');
    }
  };

  // Example: Update purchase status
  const handleUpdatePurchaseStatus = async (purchaseId: string, status: string) => {
    try {
      await purchaseAPI.updateStatus(purchaseId, { 
        status: status as any,
        actualDeliveryDate: status === 'completed' ? new Date().toISOString() : undefined
      });
      alert('Purchase status updated successfully!');
      // Refresh purchases list here
    } catch (error) {
      alert('Failed to update purchase status');
    }
  };

  // Example: Get warehouse utilization
  const handleGetWarehouseUtilization = async (warehouseId: string) => {
    try {
      const response = await warehouseAPI.getUtilization(warehouseId);
      if (response.success && response.data) {
        console.log('Warehouse utilization:', response.data);
        alert(`Utilization: ${response.data.utilizationPercentage}%`);
      }
    } catch (error) {
      alert('Failed to get warehouse utilization');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">API Examples</h1>

      {/* Warehouses Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Warehouses</h2>
        {warehousesLoading ? (
          <p>Loading warehouses...</p>
        ) : (
          <div className="space-y-2">
            <select 
              value={selectedWarehouse} 
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((warehouse: Warehouse) => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name} - {warehouse.location.city}
                </option>
              ))}
            </select>
            {selectedWarehouse && (
              <button 
                onClick={() => handleGetWarehouseUtilization(selectedWarehouse)}
                className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
              >
                Get Utilization
              </button>
            )}
          </div>
        )}
      </div>

      {/* Products Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="food">Food</option>
          <option value="books">Books</option>
          <option value="home_garden">Home & Garden</option>
          <option value="toys">Toys</option>
          <option value="sports">Sports</option>
        </select>
        {productsLoading ? (
          <p>Loading products...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 6).map((product: Product) => (
              <div key={product._id} className="border p-4 rounded">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
                <p className="text-lg font-bold">${product.price}</p>
                <p className="text-sm">SKU: {product.sku}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purchases Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Purchases</h2>
        <button 
          onClick={handleCreatePurchase}
          disabled={!selectedWarehouse || !products.length || createPurchase.loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {createPurchase.loading ? 'Creating...' : 'Create Sample Purchase'}
        </button>
        {purchasesLoading ? (
          <p>Loading purchases...</p>
        ) : (
          <div className="space-y-2">
            {purchases.slice(0, 5).map((purchase: Purchase) => (
              <div key={purchase._id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{purchase.purchaseOrderNumber}</h3>
                  <p>{purchase.product.name} - Qty: {purchase.quantity}</p>
                  <p>Status: <span className="font-semibold">{purchase.status}</span></p>
                  <p>Total: ${purchase.totalAmount}</p>
                </div>
                <div className="space-x-2">
                  {purchase.status === 'pending' && (
                    <button 
                      onClick={() => handleUpdatePurchaseStatus(purchase._id, 'approved')}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Approve
                    </button>
                  )}
                  {purchase.status === 'delivered' && (
                    <button 
                      onClick={() => handleUpdatePurchaseStatus(purchase._id, 'completed')}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Loading States */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">API Status</h3>
        <div className="space-y-1 text-sm">
          <p>Create Warehouse: {createWarehouse.loading ? 'Loading...' : 'Ready'}</p>
          <p>Create Product: {createProduct.loading ? 'Loading...' : 'Ready'}</p>
          <p>Create Purchase: {createPurchase.loading ? 'Loading...' : 'Ready'}</p>
        </div>
        {(createWarehouse.error || createProduct.error || createPurchase.error) && (
          <div className="text-red-500 text-sm">
            {createWarehouse.error || createProduct.error || createPurchase.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default APIExamplesComponent;
