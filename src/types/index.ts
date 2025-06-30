// Shared types for the application
export type ProductCategory = 'electronics' | 'clothing' | 'food';

// Shipment tracking types
export interface ShipmentStatus {
  id: string;
  status: 'delivered' | 'delayed' | 'in-transit' | 'pending' | 'processing';
  origin: string;
  destination: string;
  estimatedArrival: string;
  actualArrival?: string; // Added for actual arrival tracking
  delay?: number; // delay in days
}

// Enhanced types for warehouse selection
export interface CustomerLocation {
  address: string;
  lat: number;
  lng: number;
  demandedCategory: ProductCategory;
  quantity: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  stock: Record<ProductCategory, number>;
  load: number;
  droneReady: boolean;
  efficiency: number;
}

export interface WarehouseWithScore extends Warehouse {
  distanceScore: number;
  stockScore: number;
  loadScore: number;
  totalScore: number;
  distance?: number; // in km
  estimatedTime?: number; // in minutes
}

export interface WarehouseSelectionResult {
  status: 'ok' | 'partial' | 'unavailable';
  warehouse?: EnhancedWarehouseScore;
  alternatives?: EnhancedWarehouseScore[];
  message?: string;
  fallbackSuggestions?: string[];
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  deliveryTime: number;
  defectRate: number;
  cost: number;
  reliabilityScore: number;
  category: string;
  // Additional properties for SupplierTable component
  reliability: number; // 0-1 reliability score
  leadTime: number; // in days
  costPerUnit: number; // cost per unit
}

export interface InventoryItem {
  product: string;
  current: number;
  forecasted: number;
  reorderLevel: number;
  trend: 'up' | 'down';
}

export interface DemandForecast {
  month: string;
  actual: number;
  predicted: number;
  product: string;
}

export interface Alert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface DeliveryMetric {
  route: string;
  distance: number;
  optimizedTime: number;
  actualTime: number;
  savings: number;
  cost: number;
}

export interface RouteData {
  distance: number;
  duration: number;
  coordinates?: number[][];
  waypoints?: Array<{
    position: number[];
    name: string;
    type: 'start' | 'end' | 'waypoint';
  }>;
  timeSavings?: number;
  fuelSavings?: number;
  estimatedTime?: number;
  optimizedTime?: number;
}

export interface NavItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

// OpenRouteService API Types
export interface OpenRouteServiceResponse {
  durations: number[][];
  distances: number[][];
}

export interface RouteCalculation {
  distance: number; // in meters
  duration: number; // in seconds
  distanceKm: number;
  durationMinutes: number;
}

export interface EnhancedWarehouseScore extends WarehouseWithScore {
  routeCalculation?: RouteCalculation;
  availabilityRatio: number;
  proximityScore: number;
  finalScore: number;
}

// Warehouse Location Recommendation types
export interface OrderData {
  orderId: string;
  lat: number;
  lng: number;
  category: ProductCategory;
  deliveryTime: number; // in hours
  fromWarehouse: string;
  delayScore: number; // 0-100 (higher = more delayed)
  orderValue: number;
  timestamp: string;
}

export interface RecommendedWarehouseLocation {
  id: string;
  suggestedName: string;
  lat: number;
  lng: number;
  score: number;
  orderVolume: number;
  avgDeliveryImprovement: number; // hours saved
  estimatedCostSavings: number; // percentage
  coverageRadius: number; // km
  demandDensity: number;
  reasons: string[];
  nearbyPopulation?: number;
  accessibilityScore?: number;
}

export interface ClusterAnalysis {
  clusterId: number;
  center: { lat: number; lng: number };
  orderCount: number;
  avgDelay: number;
  totalOrderValue: number;
  recommendedLocation: RecommendedWarehouseLocation;
}

// Inventory management types
export interface Inventory {
  id: string;
  productName: string;
  stockLevel: number;
  reorderPoint: number;
  maxCapacity: number;
  turnoverRate: number;
}

// Performance metrics types
export interface PerformanceMetric {
  date: string;
  orderFulfillmentRate: number;
  inventoryTurnover: number;
  supplierReliability: number;
  costEfficiency: number;
}
