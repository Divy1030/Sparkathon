import { useState, useEffect } from 'react';
import { 
  warehouseAPI, 
  productAPI, 
  purchaseAPI, 
  inventoryAPI, 
  supplierAPI,
  type Warehouse,
  type Product,
  type Purchase,
  type Inventory,
  type Supplier,
  type ApiResponse 
} from '../api';

// Custom hooks for easy API usage

// Warehouse hooks
export const useWarehouses = (filters?: { status?: string; page?: number; limit?: number }) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setLoading(true);
        const response = await warehouseAPI.getAll(filters);
        if (response.success && response.data) {
          setWarehouses(response.data);
        } else {
          setError(response.message || 'Failed to fetch warehouses');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, [filters]);

  return { warehouses, loading, error, refetch: () => window.location.reload() };
};

// Products hooks
export const useProducts = (filters?: { category?: string; status?: string; page?: number; limit?: number }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getAll(filters);
        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          setError(response.message || 'Failed to fetch products');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  return { products, loading, error };
};

// Purchase hooks
export const usePurchases = (filters?: { warehouse?: string; status?: string; category?: string; page?: number; limit?: number }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const response = await purchaseAPI.getAll(filters);
        if (response.success && response.data) {
          setPurchases(response.data);
        } else {
          setError(response.message || 'Failed to fetch purchases');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [filters]);

  return { purchases, loading, error };
};

// Inventory hooks
export const useInventory = (filters?: { category?: string; status?: string; warehouse?: string; page?: number; limit?: number }) => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await inventoryAPI.getAll(filters);
        if (response.success && response.data) {
          setInventory(response.data);
        } else {
          setError(response.message || 'Failed to fetch inventory');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [filters]);

  return { inventory, loading, error };
};

// Suppliers hooks
export const useSuppliers = (filters?: { status?: string; category?: string; page?: number; limit?: number }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const response = await supplierAPI.getAll(filters);
        if (response.success && response.data) {
          setSuppliers(response.data);
        } else {
          setError(response.message || 'Failed to fetch suppliers');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [filters]);

  return { suppliers, loading, error };
};

// Generic API mutation hook
export const useApiMutation = <T, U>(
  apiFunction: (data: U) => Promise<ApiResponse<T>>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = async (input: U) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(input);
      if (response.success && response.data) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Operation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, data };
};
