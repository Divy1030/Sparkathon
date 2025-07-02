import endpoints, { ApiResponse } from '../lib/api';

// Warehouse types (based on backend models)
export interface Warehouse {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  capacity: number;
  currentUtilization: number;
  manager: {
    name: string;
    email: string;
    phone: string;
  };
  operationalHours: {
    open: string;
    close: string;
    timezone: string;
  };
  facilities: string[];
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseData {
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    country?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  capacity: number;
  manager: {
    name: string;
    email: string;
    phone: string;
  };
  operationalHours?: {
    open?: string;
    close?: string;
    timezone?: string;
  };
  facilities?: string[];
  status?: 'active' | 'inactive' | 'maintenance';
}

export interface WarehouseFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export interface WarehouseUtilization {
  warehouseId: string;
  name: string;
  capacity: number;
  currentItems: number;
  utilizationPercentage: number;
  availableSpace: number;
  inventoryBreakdown: {
    productName: string;
    category: string;
    quantity: number;
    status: string;
  }[];
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

// Warehouse API functions
export const warehouseAPI = {
  // Create a new warehouse
  async create(data: CreateWarehouseData): Promise<ApiResponse<Warehouse>> {
    const response = await fetch('/api/warehouse/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get all warehouses with optional filters
  async getAll(filters?: WarehouseFilters): Promise<ApiResponse<Warehouse[]>> {
    const queryParams = buildQueryParams(filters);
    const response = await fetch(`/api/warehouse${queryParams}`);
    return response.json();
  },

  // Get warehouse by ID
  async getById(id: string): Promise<ApiResponse<Warehouse>> {
    const response = await fetch(`/api/warehouse/${id}`);
    return response.json();
  },

  // Update warehouse
  async update(id: string, data: Partial<CreateWarehouseData>): Promise<ApiResponse<Warehouse>> {
    const response = await fetch(`/api/warehouse/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete warehouse
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`/api/warehouse/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Get warehouse utilization
  async getUtilization(id: string): Promise<ApiResponse<WarehouseUtilization>> {
    const response = await fetch(`/api/warehouse/${id}/utilization`);
    return response.json();
  },
};
