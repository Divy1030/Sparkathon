import endpoints, { ApiResponse } from '../lib/api';

// Purchase types (based on backend models)
export interface Purchase {
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
  notes?: string;
  purchaseOrderNumber: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseData {
  warehouse: {
    id: string;
  };
  product: {
    id: string;
  };
  quantity: number;
  unitPrice?: number;
  supplier: {
    id: string;
  };
  orderDate: string;
  expectedDeliveryDate: string;
  notes?: string;
  createdBy: string;
}

export interface UpdatePurchaseStatusData {
  status: 'pending' | 'approved' | 'ordered' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  actualDeliveryDate?: string;
  notes?: string;
}

export interface PurchaseFilters {
  warehouse?: string;
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface PurchaseAnalytics {
  totalPurchases: number;
  totalAmount: number;
  avgOrderValue: number;
  statusBreakdown: {
    _id: string;
    count: number;
  }[];
  categoryBreakdown: {
    _id: string;
    count: number;
    totalAmount: number;
  }[];
}

export interface PurchaseAnalyticsFilters {
  warehouse?: string;
  startDate?: string;
  endDate?: string;
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

// Purchase API functions
export const purchaseAPI = {
  // Create a new purchase order
  async create(data: CreatePurchaseData): Promise<ApiResponse<Purchase>> {
    const response = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get all purchases with optional filters
  async getAll(filters?: PurchaseFilters): Promise<ApiResponse<Purchase[]>> {
    const queryParams = buildQueryParams(filters);
    const response = await fetch(`/api/purchase${queryParams}`);
    return response.json();
  },

  // Get purchase by ID
  async getById(id: string): Promise<ApiResponse<Purchase>> {
    const response = await fetch(`/api/purchase/${id}`);
    return response.json();
  },

  // Update purchase status
  async updateStatus(id: string, data: UpdatePurchaseStatusData): Promise<ApiResponse<Purchase>> {
    const response = await fetch(`/api/purchase/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete purchase (only if pending or cancelled)
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`/api/purchase/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Get purchase analytics
  async getAnalytics(filters?: PurchaseAnalyticsFilters): Promise<ApiResponse<PurchaseAnalytics>> {
    const queryParams = buildQueryParams(filters);
    const response = await fetch(`/api/purchase/analytics${queryParams}`);
    return response.json();
  },
};
