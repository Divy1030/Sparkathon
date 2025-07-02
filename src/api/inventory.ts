import { ApiResponse } from '../lib/api';

// Inventory types (based on backend models)
export interface Inventory {
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
  lastRestocked: string;
  location: {
    zone: string;
    aisle: string;
    shelf: string;
    bin: string;
  };
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  createdAt: string;
  updatedAt: string;
}

export interface UpsertInventoryData {
  warehouseId: string;
  productId: string;
  quantity: number;
  location?: {
    zone?: string;
    aisle?: string;
    shelf?: string;
    bin?: string;
  };
  minimumStockLevel?: number;
  maximumStockLevel?: number;
  reorderPoint?: number;
}

export interface UpdateInventoryQuantityData {
  quantity?: number;
  adjustment?: number;
  reason?: string;
}

export interface InventoryFilters {
  category?: string;
  status?: string;
  warehouse?: string;
  page?: number;
  limit?: number;
}

export interface InventorySummary {
  totalItems: number;
  totalProducts: number;
  totalValue: number;
  statusBreakdown: {
    _id: string;
    count: number;
    totalQuantity: number;
  }[];
  categoryBreakdown: {
    _id: string;
    count: number;
    totalQuantity: number;
  }[];
}

export interface InventoryAdjustmentResult extends Inventory {
  adjustment: {
    oldQuantity: number;
    newQuantity: number;
    change: number;
    reason: string;
  };
}

// Helper function to build query params
const buildQueryParams = (params?: Record<string, any>): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      searchParams.append(key, params[key].toString());
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Inventory API functions
export const inventoryAPI = {
  // Get inventory for a specific warehouse
  async getWarehouseInventory(warehouseId: string, filters?: Omit<InventoryFilters, 'warehouse'>): Promise<ApiResponse<Inventory[]>> {
    const queryParams = buildQueryParams(filters);
    const response = await fetch(`/api/inventory/warehouse/${warehouseId}${queryParams}`);
    return response.json();
  },

  // Get all inventory across warehouses
  async getAll(filters?: InventoryFilters): Promise<ApiResponse<Inventory[]>> {
    const queryParams = buildQueryParams(filters);
    const response = await fetch(`/api/inventory${queryParams}`);
    return response.json();
  },

  // Create or update inventory
  async upsert(data: UpsertInventoryData): Promise<ApiResponse<Inventory>> {
    const response = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Update inventory quantity (for stock adjustments)
  async updateQuantity(id: string, data: UpdateInventoryQuantityData): Promise<ApiResponse<InventoryAdjustmentResult>> {
    const response = await fetch(`/api/inventory/${id}/quantity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get low stock items
  async getLowStockItems(warehouse?: string): Promise<ApiResponse<Inventory[]>> {
    const params = warehouse ? { warehouse } : undefined;
    const queryParams = buildQueryParams(params);
    const response = await fetch(`/api/inventory/low-stock${queryParams}`);
    return response.json();
  },

  // Get inventory summary
  async getSummary(warehouse?: string): Promise<ApiResponse<InventorySummary>> {
    const params = warehouse ? { warehouse } : undefined;
    const queryParams = buildQueryParams(params);
    const response = await fetch(`/api/inventory/summary${queryParams}`);
    return response.json();
  },

  // Delete inventory record
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`/api/inventory/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
