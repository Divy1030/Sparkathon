import endpoints, { ApiResponse } from './api';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // For frontend API proxy routes, always use /api prefix
      const url = endpoint.startsWith('/api') ? 
        `${this.baseUrl}${endpoint}` : 
        `${this.baseUrl}/api${endpoint}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        throw new Error('Response is not JSON');
      }
    } catch (error: any) {
      console.error(`API Error for ${endpoint}:`, error);
      return {
        success: false,
        message: error.message || 'An error occurred',
        error: error.message
      };
    }
  }

  // Alert APIs
  async getAlerts(params?: {
    type?: string;
    resolved?: boolean;
    severity?: number;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/alert?${queryString}` : '/alert';
    return this.makeRequest<any[]>(endpoint);
  }

  async resolveAlert(alertId: string | number, resolvedBy?: string) {
    return this.makeRequest(`/alert/${alertId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolvedBy: resolvedBy || 'user' }),
    });
  }

  async bulkResolveAlerts(alertIds: (string | number)[], resolvedBy?: string) {
    return this.makeRequest('/alert/bulk-resolve', {
      method: 'PATCH',
      body: JSON.stringify({ alertIds, resolvedBy: resolvedBy || 'user' }),
    });
  }

  async getAlertAnalytics() {
    return this.makeRequest('/alert/analytics');
  }

  // Shipment APIs
  async getShipments(params?: {
    status?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/shipment?${queryString}` : '/shipment';
    return this.makeRequest<any[]>(endpoint);
  }

  async getActiveShipments(limit?: number) {
    const endpoint = limit ? `/shipment/active?limit=${limit}` : '/shipment/active';
    return this.makeRequest<any[]>(endpoint);
  }

  async getShipmentAnalytics() {
    return this.makeRequest('/shipment/analytics');
  }

  async getShipmentById(shipmentId: string) {
    return this.makeRequest(`/shipment/${shipmentId}`);
  }

  async updateShipmentStatus(shipmentId: string, status: string) {
    return this.makeRequest(`/shipment/${shipmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Supplier APIs
  async getSuppliers(params?: {
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/supplier?${queryString}` : '/supplier';
    return this.makeRequest<any[]>(endpoint);
  }

  async getSupplierReliability() {
    return this.makeRequest('/supplier/reliability');
  }

  async getSupplierRanking() {
    return this.makeRequest('/supplier/ranking');
  }

  // Warehouse APIs
  async getWarehouses() {
    return this.makeRequest('/v1/warehouses');
  }

  async createWarehouse(warehouseData: any) {
    return this.makeRequest('/v1/warehouses', {
      method: 'POST',
      body: JSON.stringify(warehouseData),
    });
  }

  async updateWarehouse(warehouseId: string, warehouseData: any) {
    return this.makeRequest(`/v1/warehouses/${warehouseId}`, {
      method: 'PUT',
      body: JSON.stringify(warehouseData),
    });
  }

  async deleteWarehouse(warehouseId: string) {
    return this.makeRequest(`/v1/warehouses/${warehouseId}`, {
      method: 'DELETE',
    });
  }

  async getWarehouseById(warehouseId: string) {
    return this.makeRequest(`/v1/warehouses/${warehouseId}`);
  }

  async getWarehouseUtilization(warehouseId: string) {
    return this.makeRequest(`/v1/warehouses/${warehouseId}/utilization`);
  }

  // Inventory APIs
  async getInventory(params?: {
    warehouseId?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/inventory?${queryString}` : '/inventory';
    return this.makeRequest<any[]>(endpoint);
  }

  async getWarehouseInventory(warehouseId: string, params?: {
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/inventory/warehouse/${warehouseId}?${queryString}` : `/inventory/warehouse/${warehouseId}`;
    return this.makeRequest<any[]>(endpoint);
  }

  async getInventorySummary(warehouseId?: string) {
    const queryParams = new URLSearchParams();
    if (warehouseId) {
      queryParams.append('warehouse', warehouseId);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/inventory/summary?${queryString}` : '/inventory/summary';
    return this.makeRequest(endpoint);
  }

  async getLowStockItems(warehouseId?: string) {
    const queryParams = new URLSearchParams();
    if (warehouseId) {
      queryParams.append('warehouse', warehouseId);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/inventory/low-stock?${queryString}` : '/inventory/low-stock';
    return this.makeRequest<any[]>(endpoint);
  }

  async createOrUpdateInventory(data: {
    warehouseId: string;
    productId: string;
    quantity: number;
    location?: any;
    minimumStockLevel?: number;
    maximumStockLevel?: number;
    reorderPoint?: number;
  }) {
    return this.makeRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryQuantity(inventoryId: string, data: {
    quantity?: number;
    adjustment?: number;
    reason?: string;
  }) {
    return this.makeRequest(`/inventory/${inventoryId}/quantity`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteInventory(inventoryId: string) {
    return this.makeRequest(`/inventory/${inventoryId}`, {
      method: 'DELETE',
    });
  }

  // Purchase APIs
  async getPurchases(params?: {
    status?: string;
    supplierId?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/purchase?${queryString}` : '/purchase';
    return this.makeRequest<any[]>(endpoint);
  }

  async createPurchase(purchaseData: {
    warehouse: { id: string };
    product: { id: string };
    supplier: { id: string };
    quantity: number;
    orderDate: string;
    expectedDeliveryDate: string;
    createdBy: string;
    unitPrice?: number;
  }) {
    return this.makeRequest('/purchase', {
      method: 'POST',
      body: JSON.stringify(purchaseData),
    });
  }

  async updatePurchaseStatus(purchaseId: string, data: {
    status: string;
    actualDeliveryDate?: string;
    notes?: string;
  }) {
    return this.makeRequest(`/purchase/${purchaseId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPurchaseAnalytics() {
    return this.makeRequest('/purchase/analytics');
  }

  // Defect Report APIs
  async getDefectReports(params?: {
    supplierId?: string;
    status?: string;
    severity?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/defect-reports?${queryString}` : '/defect-reports';
    return this.makeRequest<any[]>(endpoint);
  }

  async getDefectReportById(reportId: string) {
    return this.makeRequest(`/defect-reports/${reportId}`);
  }

  async updateDefectReportStatus(reportId: string, status: string) {
    return this.makeRequest(`/defect-reports/${reportId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async resolveDefectReport(reportId: string, resolutionData?: {
    resolutionDate?: string;
    resolvedBy?: string;
    resolutionNotes?: string;
  }) {
    return this.makeRequest(`/defect-reports/${reportId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({
        resolutionDate: new Date().toISOString(),
        resolvedBy: 'Current User',
        ...resolutionData
      }),
    });
  }

  async getDefectAnalytics() {
    return this.makeRequest('/defect-reports/analytics');
  }

  // Supply Chain APIs
  async getSupplyChainDashboard(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/v1/supply-chain/dashboard');
  }

  async updateWarehouseCategoryCapacity(warehouseId: string, data: { category: string; maxCapacity: number }): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/v1/supply-chain/warehouse/${warehouseId}/category-capacity`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getWarehouseCategoryCapacities(warehouseId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/v1/supply-chain/warehouse/${warehouseId}/category-capacities`);
  }

  async processPurchaseDelivery(purchaseId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/v1/supply-chain/purchase/${purchaseId}/delivery`, {
      method: 'POST'
    });
  }

  async generateAutoPurchaseOrders(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/v1/supply-chain/auto-purchase-orders', {
      method: 'POST'
    });
  }

  async processCustomerOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/v1/supply-chain/customer-order', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async fulfillCustomerOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/v1/supply-chain/customer-order/${orderId}/fulfill`, {
      method: 'POST'
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual functions for backward compatibility
export const {
  getAlerts,
  resolveAlert,
  bulkResolveAlerts,
  getAlertAnalytics,
  getShipments,
  getActiveShipments,
  getShipmentAnalytics,
  getShipmentById,
  updateShipmentStatus,
  getSuppliers,
  getSupplierReliability,
  getSupplierRanking,
  getWarehouses,
  getWarehouseUtilization,
  getInventory,
  getWarehouseInventory,
  getInventorySummary,
  getLowStockItems,
  createOrUpdateInventory,
  updateInventoryQuantity,
  deleteInventory,
  getPurchases,
  createPurchase,
  updatePurchaseStatus,
  getPurchaseAnalytics,
  getDefectReports,
  getDefectReportById,
  updateDefectReportStatus,
  resolveDefectReport,
  getDefectAnalytics,
  getSupplyChainDashboard,
  updateWarehouseCategoryCapacity,
  getWarehouseCategoryCapacities,
  processPurchaseDelivery,
  generateAutoPurchaseOrders,
  processCustomerOrder,
  fulfillCustomerOrder,
} = apiClient;
