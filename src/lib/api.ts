const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data: T;
  details?: unknown;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiClientError(
      body?.message || body?.error || `Request failed with status ${response.status}`,
      response.status,
      body?.details,
    );
  }

  return (body as ApiResponse<T>).data ?? (body as T);
}

export const api = {
  health: () => request<{ success: boolean; message: string; timestamp: string }>('/api/health'),
  readiness: () => request<{ success: boolean; status: string; database: string; timestamp: string }>('/api/health/ready'),
  login: (email: string, password: string) =>
    request<{ user: { _id: string; email: string; role: string; username: string } }>('/api/v1/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: { _id: string; email: string; role: string; username: string } }>('/api/v1/users/me'),
  logout: () => request<unknown>('/api/v1/users/logout', { method: 'POST' }),
  dashboard: () => request<{
    warehouseUtilization: unknown[];
    inventorySummary: Record<string, number>;
    activeOrders: number;
    pendingPurchases: number;
    recentAlerts: unknown[];
  }>('/api/v1/supply-chain/dashboard'),
  warehouses: (query = 'limit=100') => request<unknown[]>(`/api/v1/warehouses?${query}`),
  warehouseUtilization: (id: string) => request<unknown>(`/api/v1/warehouses/${id}/utilization`),
  updateWarehouse: (id: string, payload: unknown) => request<unknown>(`/api/v1/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  inventory: (query = 'limit=100') => request<unknown[]>(`/api/v1/inventory?${query}`),
  suppliers: (query = 'limit=100') => request<unknown[]>(`/api/v1/suppliers?${query}`),
  recalculateSupplierReliability: (id: string) => request<unknown>(`/api/v1/suppliers/${id}/recalculate-reliability`, { method: 'POST' }),
  supplierPerformance: (id: string) => request<unknown>(`/api/v1/suppliers/${id}/performance`),
  purchases: (query = 'limit=100') => request<unknown[]>(`/api/v1/purchases?${query}`),
  updatePurchaseStatus: (id: string, status: string) => request<unknown>(`/api/v1/purchases/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  receivePurchase: (id: string) => request<unknown>(`/api/v1/supply-chain/purchase/${id}/delivery`, { method: 'POST' }),
  shipments: (query = 'limit=100') => request<unknown[]>(`/api/v1/shipments?${query}`),
  updateShipmentStatus: (id: string, status: string, location?: string) => request<unknown>(`/api/v1/shipments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, location }) }),
  alerts: (query = 'limit=100') => request<unknown[]>(`/api/v1/alerts?${query}`),
  auditLogs: (limit = 100) => request<unknown[]>(`/api/v1/audit-logs?limit=${limit}`),
  researchDatasetSummary: () => request<any>('/api/v1/research/dataset-summary'),
  researchClusters: (k = 3) => request<any>(`/api/v1/research/clusters?k=${k}&maxIterations=100`),
  researchCoverage: (thresholdKm = 250) => request<any>(`/api/v1/research/coverage?thresholdKm=${thresholdKm}`),
  researchCandidates: (k = 3, coverageRadiusKm = 250, weights?: { demand: number; coverageGap: number; accessibility: number; network: number }) => { const query = new URLSearchParams({ k: String(k), coverageRadiusKm: String(coverageRadiusKm) }); if (weights) { query.set('wDemand', String(weights.demand)); query.set('wCoverageGap', String(weights.coverageGap)); query.set('wAccessibility', String(weights.accessibility)); query.set('wNetwork', String(weights.network)); } return request<any>(`/api/v1/research/candidates?${query.toString()}`); },
  researchEvaluation: (thresholdKm = 250, route = false) => request<any>(`/api/v1/research/evaluation?thresholdKm=${thresholdKm}&route=${route}`),
  saveResearchRun: (payload: unknown) => request<any>('/api/v1/research/runs', { method: 'POST', body: JSON.stringify(payload) }),
  researchRuns: (limit = 20) => request<any[]>(`/api/v1/research/runs?limit=${limit}`),
  adjustInventory: (id: string, adjustment: number, reason: string) =>
    request<unknown>(`/api/v1/inventory/${id}/quantity`, {
      method: 'PATCH',
      body: JSON.stringify({ adjustment, reason }),
    }),
  inventoryMovements: (id: string) => request<unknown[]>(`/api/v1/inventory/${id}/movements`),
  inventorySummary: (warehouse?: string) => request<any>(`/api/v1/inventory/summary${warehouse ? `?warehouse=${encodeURIComponent(warehouse)}` : ''}`),
  purchaseAnalytics: (query = '') => request<any>(`/api/v1/purchases/analytics${query ? `?${query}` : ''}`),
  shipmentAnalytics: (query = '') => request<any>(`/api/v1/shipments/analytics${query ? `?${query}` : ''}`),
  alertAnalytics: (query = '') => request<any>(`/api/v1/alerts/analytics${query ? `?${query}` : ''}`),
  orders: (query = 'limit=100') => request<unknown[]>(`/api/v1/orders?${query}`),
  createOrder: (payload: unknown) => request<unknown>('/api/v1/orders', { method: 'POST', body: JSON.stringify(payload) }),
  fulfillOrder: (id: string) => request<unknown>(`/api/v1/orders/${id}/fulfill`, { method: 'POST' }),
  cancelOrder: (id: string) => request<unknown>(`/api/v1/orders/${id}/cancel`, { method: 'POST' }),
  returnOrder: (id: string) => request<unknown>(`/api/v1/orders/${id}/return`, { method: 'POST' }),
  updateOrderStatus: (id: string, status: string) => request<unknown>(`/api/v1/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createOrderShipment: (id: string, carrierName?: string) => request<unknown>(`/api/v1/orders/${id}/shipment`, { method: 'POST', body: JSON.stringify({ carrierName }) }),
  geocode: (query: string) => request<{ latitude: number; longitude: number; displayName: string; address: Record<string, string> }>(`/api/v1/geocode?query=${encodeURIComponent(query)}`),
  resolveAlert: (id: string, resolutionNotes?: string) =>
    request<unknown>(`/api/v1/alerts/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolutionNotes }),
    }),
};

export { API_BASE_URL };
