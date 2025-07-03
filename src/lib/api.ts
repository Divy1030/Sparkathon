// Use the environment variable for the API base URL with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// Log the API URL for debugging
console.log('Using API base URL:', API_BASE_URL);

const endpoints = {
  warehouse: {
    create: `${API_BASE_URL}/warehouses`,
    getAll: `${API_BASE_URL}/warehouses`,
    getById: (id: string) => `${API_BASE_URL}/warehouses/${id}`,
    update: (id: string) => `${API_BASE_URL}/warehouses/${id}`,
    delete: (id: string) => `${API_BASE_URL}/warehouses/${id}`,
    getUtilization: (id: string) => `${API_BASE_URL}/warehouses/${id}/utilization`,
  },
  product: {
    create: `${API_BASE_URL}/products`,
    getAll: `${API_BASE_URL}/products`,
    getById: (id: string) => `${API_BASE_URL}/products/${id}`,
    getByCategory: (category: string) => `${API_BASE_URL}/products/category/${category}`,
    update: (id: string) => `${API_BASE_URL}/products/${id}`,
    delete: (id: string) => `${API_BASE_URL}/products/${id}`,
    getCategories: `${API_BASE_URL}/products/categories`,
    search: `${API_BASE_URL}/products/search`,
  },
  purchase: {
    create: `${API_BASE_URL}/purchases`,
    getAll: `${API_BASE_URL}/purchases`,
    getById: (id: string) => `${API_BASE_URL}/purchases/${id}`,
    update: (id: string) => `${API_BASE_URL}/purchases/${id}`,
    updateStatus: (id: string) => `${API_BASE_URL}/purchases/${id}/status`,
    delete: (id: string) => `${API_BASE_URL}/purchases/${id}`,
    getAnalytics: `${API_BASE_URL}/purchases/analytics`,
  },
  inventory: {
    getWarehouseInventory: (warehouseId: string) => `${API_BASE_URL}/inventory/warehouse/${warehouseId}`,
    getAll: `${API_BASE_URL}/inventory`,
    upsert: `${API_BASE_URL}/inventory`,
    updateQuantity: (id: string) => `${API_BASE_URL}/inventory/${id}/quantity`,
    getLowStock: `${API_BASE_URL}/inventory/low-stock`,
    getSummary: `${API_BASE_URL}/inventory/summary`,
    delete: (id: string) => `${API_BASE_URL}/inventory/${id}`,
  },
  supplier: {
    create: `${API_BASE_URL}/suppliers`,
    getAll: `${API_BASE_URL}/suppliers`,
    getById: (id: string) => `${API_BASE_URL}/suppliers/${id}`,
    getByCategory: (category: string) => `${API_BASE_URL}/suppliers/category/${category}`,
    update: (id: string) => `${API_BASE_URL}/suppliers/${id}`,
    delete: (id: string) => `${API_BASE_URL}/suppliers/${id}`,
    getPerformance: (id: string) => `${API_BASE_URL}/suppliers/${id}/performance`,
    search: `${API_BASE_URL}/suppliers/search`,
    getReliabilityMetrics: (id: string) => `${API_BASE_URL}/suppliers/${id}/reliability-metrics`,
    getWithReliability: `${API_BASE_URL}/suppliers/reliability`,
    getRanking: `${API_BASE_URL}/suppliers/ranking`,
    recalculateReliability: (id: string) => `${API_BASE_URL}/suppliers/${id}/recalculate-reliability`,
    recalculateAllReliability: `${API_BASE_URL}/suppliers/reliability/recalculate`,
  },
  user: {
    login: `${API_BASE_URL}/users/login`,
    logout: `${API_BASE_URL}/users/logout`,
  },
  defectReport: {
    create: `${API_BASE_URL}/defect-reports`,
    getAll: `${API_BASE_URL}/defect-reports`,
    getById: (id: string) => `${API_BASE_URL}/defect-reports/${id}`,
    update: (id: string) => `${API_BASE_URL}/defect-reports/${id}`,
    delete: (id: string) => `${API_BASE_URL}/defect-reports/${id}`,
    updateStatus: (id: string) => `${API_BASE_URL}/defect-reports/${id}/status`,
    resolve: (id: string) => `${API_BASE_URL}/defect-reports/${id}/resolve`,
    getAnalytics: `${API_BASE_URL}/defect-reports/analytics`,
    getSupplierSummary: (supplierId: string) => `${API_BASE_URL}/defect-reports/supplier/${supplierId}/summary`,
  },
  shipment: {
    create: `${API_BASE_URL}/shipments`,
    getAll: `${API_BASE_URL}/shipments`,
    getById: (id: string) => `${API_BASE_URL}/shipments/${id}`,
    update: (id: string) => `${API_BASE_URL}/shipments/${id}`,
    updateStatus: (id: string) => `${API_BASE_URL}/shipments/${id}/status`,
    delete: (id: string) => `${API_BASE_URL}/shipments/${id}`,
    getActive: `${API_BASE_URL}/shipments/active`,
    getAnalytics: `${API_BASE_URL}/shipments/analytics`,
  },
  alert: {
    create: `${API_BASE_URL}/alerts`,
    getAll: `${API_BASE_URL}/alerts`,
    getById: (id: string) => `${API_BASE_URL}/alerts/${id}`,
    resolve: (id: string) => `${API_BASE_URL}/alerts/${id}/resolve`,
    bulkResolve: `${API_BASE_URL}/alerts/bulk-resolve`,
    delete: (id: string) => `${API_BASE_URL}/alerts/${id}`,
    getAnalytics: `${API_BASE_URL}/alerts/analytics`,
    generateSystemAlerts: `${API_BASE_URL}/alerts/generate-system-alerts`,
  },
};

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    current: number;
    total: number;
    count: number;
    totalRecords: number;
  };
}

export default endpoints;