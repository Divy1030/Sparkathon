import { ApiResponse } from '../lib/api';

// Product types (based on backend models)
export interface Product {
  _id: string;
  name: string;
  description: string;
  category: 'electronics' | 'clothing' | 'food' | 'books' | 'home_garden' | 'toys' | 'sports';
  sku: string;
  price: number;
  supplier: {
    id: string;
    name: string;
    contactInfo: string;
  };
  specifications: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    unit: string;
  };
  minimumOrderQuantity: number;
  leadTime: number;
  status: 'active' | 'discontinued' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  category: 'electronics' | 'clothing' | 'food' | 'books' | 'home_garden' | 'toys' | 'sports';
  sku: string;
  price: number;
  supplier: {
    id: string;
  };
  specifications: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    unit: 'kg' | 'g' | 'lb' | 'piece' | 'box' | 'carton';
  };
  minimumOrderQuantity: number;
  leadTime: number;
  status?: 'active' | 'discontinued' | 'out_of_stock';
}

export interface ProductFilters {
  category?: string;
  status?: string;
  supplier?: string;
  page?: number;
  limit?: number;
}

export interface ProductSearchParams {
  q: string;
  category?: string;
  page?: number;
  limit?: number;
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

// Product API functions
export const productAPI = {
  // Create a new product
  async create(data: CreateProductData): Promise<ApiResponse<Product>> {
    const response = await fetch('/api/product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get all products with optional filters
  async getAll(filters?: ProductFilters): Promise<ApiResponse<Product[]>> {
    const queryParams = buildQueryParams(filters);
    const response = await fetch(`/api/product${queryParams}`);
    return response.json();
  },

  // Get product by ID
  async getById(id: string): Promise<ApiResponse<Product>> {
    const response = await fetch(`/api/product/${id}`);
    return response.json();
  },

  // Get products by category
  async getByCategory(category: string, filters?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<Product[]>> {
    const queryParams = buildQueryParams(filters);
    const response = await fetch(`/api/product/category/${category}${queryParams}`);
    return response.json();
  },

  // Update product
  async update(id: string, data: Partial<CreateProductData>): Promise<ApiResponse<Product>> {
    const response = await fetch(`/api/product/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete product
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`/api/product/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Get product categories
  async getCategories(): Promise<ApiResponse<string[]>> {
    const response = await fetch('/api/product/categories');
    return response.json();
  },

  // Search products
  async search(params: ProductSearchParams): Promise<ApiResponse<Product[]>> {
    const queryParams = buildQueryParams(params);
    const response = await fetch(`/api/product/search${queryParams}`);
    return response.json();
  },
};
