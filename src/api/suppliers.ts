import { ApiResponse } from '../lib/api';

// Supplier types (based on backend models)
export interface Supplier {
  _id: string;
  name: string;
  code: string;
  contactInfo: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
  };
  businessDetails: {
    registrationNumber: string;
    taxId: string;
    businessType: 'manufacturer' | 'distributor' | 'wholesaler' | 'retailer';
  };
  categories: string[];
  rating: number;
  status: 'active' | 'inactive' | 'suspended';
  paymentTerms: {
    method: 'cash' | 'credit' | 'bank_transfer' | 'cheque';
    creditDays: number;
  };
  deliveryInfo: {
    leadTime: number;
    minimumOrderValue: number;
    shippingMethods: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierData {
  name: string;
  code: string;
  contactInfo: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      country?: string;
      zipCode: string;
    };
  };
  businessDetails: {
    registrationNumber: string;
    taxId: string;
    businessType: 'manufacturer' | 'distributor' | 'wholesaler' | 'retailer';
  };
  categories: string[];
  rating?: number;
  status?: 'active' | 'inactive' | 'suspended';
  paymentTerms?: {
    method?: 'cash' | 'credit' | 'bank_transfer' | 'cheque';
    creditDays?: number;
  };
  deliveryInfo: {
    leadTime: number;
    minimumOrderValue?: number;
    shippingMethods?: string[];
  };
}

export interface SupplierFilters {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface SupplierSearchParams {
  q: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface SupplierWithProducts extends Supplier {
  products: {
    _id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    status: string;
  }[];
}

export interface SupplierPerformance {
  supplier: Supplier;
  metrics: {
    totalOrders: number;
    totalValue: number;
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
    qualityRating: number;
    lastOrderDate: string | null;
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

// Supplier API functions
export const supplierAPI = {
  // Create a new supplier
  async create(data: CreateSupplierData): Promise<ApiResponse<Supplier>> {
    const response = await fetch('/api/supplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get all suppliers with optional filters
  async getAll(filters?: SupplierFilters): Promise<ApiResponse<Supplier[]>> {
    const queryParams = buildQueryParams(filters);
    const response = await fetch(`/api/supplier${queryParams}`);
    return response.json();
  },

  // Get supplier by ID (includes products)
  async getById(id: string): Promise<ApiResponse<SupplierWithProducts>> {
    const response = await fetch(`/api/supplier/${id}`);
    return response.json();
  },

  // Get suppliers by category
  async getByCategory(category: string, filters?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<Supplier[]>> {
    const queryParams = buildQueryParams(filters);
    const response = await fetch(`/api/supplier/category/${category}${queryParams}`);
    return response.json();
  },

  // Update supplier
  async update(id: string, data: Partial<CreateSupplierData>): Promise<ApiResponse<Supplier>> {
    const response = await fetch(`/api/supplier/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete supplier
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`/api/supplier/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Get supplier performance metrics
  async getPerformance(id: string, filters?: { startDate?: string; endDate?: string }): Promise<ApiResponse<SupplierPerformance>> {
    const queryParams = buildQueryParams(filters);
    const response = await fetch(`/api/supplier/${id}/performance${queryParams}`);
    return response.json();
  },

  // Search suppliers
  async search(params: SupplierSearchParams): Promise<ApiResponse<Supplier[]>> {
    const queryParams = buildQueryParams(params);
    const response = await fetch(`/api/supplier/search${queryParams}`);
    return response.json();
  },
};
