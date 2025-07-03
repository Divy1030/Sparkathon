// Shared types for the application
export type ProductCategory = 'electronics' | 'clothing' | 'food' | 'books' | 'home_garden' | 'toys' | 'sports';

// Navigation types
export interface NavItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Alert types matching backend model
export interface Alert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  category: 'inventory' | 'supplier' | 'shipment' | 'warehouse' | 'system' | 'defect';
  title: string;
  message: string;
  severity: 1 | 2 | 3 | 4 | 5; // 1 = lowest, 5 = highest
  source: {
    entityType: 'warehouse' | 'supplier' | 'product' | 'shipment' | 'defect' | 'system';
    entityId?: string;
    entityName?: string;
  };
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  data?: any;
  actionRequired: boolean;
  dismissible: boolean;
  expiresAt?: string;
  timestamp?: string; // For backward compatibility
  createdAt: string;
  updatedAt: string;
}

// Shipment types matching backend model
export interface ShipmentStatus {
  id: string;
  purchaseOrderId: string;
  trackingNumber: string;
  status: 'processing' | 'in-transit' | 'delivered' | 'delayed' | 'cancelled';
  origin: {
    warehouseId: string;
    name: string;
    address: string;
  };
  destination: {
    customerId?: string;
    name: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  estimatedArrival: string;
  actualArrival?: string;
  delay?: number; // in days
  carrier: {
    name: string;
    contactInfo: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  cost: {
    shippingCost: number;
    insuranceCost?: number;
    totalCost: number;
  };
  trackingHistory: Array<{
    timestamp: string;
    status: string;
    location: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
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

export interface EnhancedWarehouseScore extends WarehouseWithScore {
  selectionReason?: string;
  confidence?: number;
  warnings?: string[];
  routeCalculation?: RouteCalculation;
  availabilityRatio?: number;
  proximityScore?: number;
  finalScore?: number;
}

export interface WarehouseSelectionResult {
  status: 'ok' | 'partial' | 'unavailable';
  warehouse?: EnhancedWarehouseScore;
  alternatives?: EnhancedWarehouseScore[];
  message?: string;
  fallbackSuggestions?: string[];
}

// Supplier types matching backend model
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
  reliabilityMetrics?: {
    defectRate: number;
    onTimeDeliveryRate: number;
    responseTime: number;
    overallScore: number;
    lastCalculated: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Warehouse types matching backend model
export interface WarehouseDB {
  _id: string;
  name: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
    city: string;
    state: string;
    country: string;
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

// Product types matching backend model
export interface Product {
  _id: string;
  name: string;
  description: string;
  category: ProductCategory;
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

// Purchase types matching backend model
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

// Analytics types
export interface ShipmentAnalytics {
  totalShipments: number;
  onTimeDeliveryRate: number;
  averageDeliveryTime?: number;
  totalShippingCost?: number;
  statusBreakdown: Array<{
    _id: string;
    count: number;
    totalCost: number;
  }>;
  monthlyTrends?: Array<{
    month: string;
    totalShipments: number;
    onTimeRate: number;
  }>;
}

export interface AlertAnalytics {
  totalAlerts: number;
  unresolvedCount: number;
  criticalCount: number;
  categoryBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  severityDistribution: Array<{
    _id: number;
    count: number;
  }>;
  resolutionTimes?: {
    average: number;
    median: number;
  };
}

// API Response types
export interface PaginationInfo {
  current: number;
  total: number;
  count: number;
  totalRecords: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

// Defect Report types matching backend model
export interface DefectReport {
  _id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'quality' | 'packaging' | 'delivery' | 'documentation' | 'other';
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
  };
  supplier: {
    id: string;
    name: string;
    code: string;
  };
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: Array<{
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
  resolution?: {
    description: string;
    resolvedBy: string;
    resolvedAt: string;
    actionsTaken: string[];
  };
  impact: {
    financialLoss?: number;
    customersAffected?: number;
    unitsAffected?: number;
  };
  rootCause?: string;
  preventiveMeasures?: string[];
  followUpRequired: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Inventory types
export interface InventoryItem {
  _id: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category: ProductCategory;
  };
  warehouse: {
    id: string;
    name: string;
  };
  quantity: number;
  minimumThreshold: number;
  maximumThreshold: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  totalValue: number;
  location: {
    zone: string;
    aisle: string;
    shelf: string;
    bin: string;
  };
  lastRestocked: string;
  lastMovement: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'reserved';
  createdAt: string;
  updatedAt: string;
}

// Dashboard component props interface
export interface DashboardComponentProps {
  cardClass: string;
  darkMode?: boolean;
}

// Route calculation interface
export interface RouteCalculation {
  distance: number;
  duration: number;
  distanceKm: number;
  durationMinutes: number;
}
