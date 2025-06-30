import { Warehouse, Supplier, InventoryItem, DemandForecast, Alert, DeliveryMetric, CustomerLocation, OrderData, ShipmentStatus } from '../types';

// Mock Warehouses Data - Four Major Indian Cities
export const mockWarehouses: Warehouse[] = [
  { 
    id: 'WH001', 
    name: 'Delhi Distribution Center', 
    location: { lat: 28.6139, lng: 77.2090 }, 
    stock: { electronics: 150, clothing: 200, food: 120 }, 
    load: 60, 
    droneReady: true, 
    efficiency: 95 
  },
  { 
    id: 'WH002', 
    name: 'Mumbai Port Warehouse', 
    location: { lat: 19.0760, lng: 72.8777 }, 
    stock: { electronics: 80, clothing: 150, food: 90 }, 
    load: 85, 
    droneReady: true, 
    efficiency: 88 
  },
  { 
    id: 'WH003', 
    name: 'Chennai Regional Hub', 
    location: { lat: 13.0827, lng: 80.2707 }, 
    stock: { electronics: 120, clothing: 180, food: 75 }, 
    load: 70, 
    droneReady: true, 
    efficiency: 90 
  },
  { 
    id: 'WH004', 
    name: 'Kolkata Eastern Center', 
    location: { lat: 22.5726, lng: 88.3639 }, 
    stock: { electronics: 95, clothing: 130, food: 110 }, 
    load: 45, 
    droneReady: false, 
    efficiency: 92 
  }
];

// Mock Customer Locations for Testing - More diverse locations
export const mockCustomerLocations: CustomerLocation[] = [
  { address: 'Noida, Uttar Pradesh', lat: 28.5355, lng: 77.3910, demandedCategory: 'electronics', quantity: 5 },
  { address: 'Gurgaon, Haryana', lat: 28.4595, lng: 77.0266, demandedCategory: 'clothing', quantity: 10 },
  { address: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567, demandedCategory: 'food', quantity: 15 },
  { address: 'Coimbatore, Tamil Nadu', lat: 11.0168, lng: 76.9558, demandedCategory: 'electronics', quantity: 8 },
  { address: 'Siliguri, West Bengal', lat: 26.7271, lng: 88.3953, demandedCategory: 'clothing', quantity: 12 },
  { address: 'Chandigarh, Punjab', lat: 30.7333, lng: 76.7794, demandedCategory: 'electronics', quantity: 3 },
  { address: 'Nashik, Maharashtra', lat: 19.9975, lng: 73.7898, demandedCategory: 'food', quantity: 20 },
  { address: 'Madurai, Tamil Nadu', lat: 9.9252, lng: 78.1198, demandedCategory: 'clothing', quantity: 7 },
  { address: 'Durgapur, West Bengal', lat: 23.5204, lng: 87.3119, demandedCategory: 'electronics', quantity: 4 },
  { address: 'Faridabad, Haryana', lat: 28.4089, lng: 77.3178, demandedCategory: 'food', quantity: 8 }
];

// Mock Suppliers Data
export const mockSuppliers: Supplier[] = [
  { 
    id: 'S1', 
    name: 'TechFlow Logistics', 
    location: 'Mumbai',
    deliveryTime: 2.1, 
    defectRate: 0.03, 
    cost: 50, 
    reliabilityScore: 95, 
    category: 'Electronics',
    reliability: 0.95,
    leadTime: 3,
    costPerUnit: 12.50
  },
  { 
    id: 'S2', 
    name: 'QuickShip Express', 
    location: 'Delhi',
    deliveryTime: 1.8, 
    defectRate: 0.05, 
    cost: 65, 
    reliabilityScore: 88, 
    category: 'Clothing',
    reliability: 0.88,
    leadTime: 2,
    costPerUnit: 8.75
  },
  { 
    id: 'S3', 
    name: 'ReliableCargo', 
    location: 'Chennai',
    deliveryTime: 3.2, 
    defectRate: 0.12, 
    cost: 40, 
    reliabilityScore: 72, 
    category: 'Food',
    reliability: 0.72,
    leadTime: 5,
    costPerUnit: 15.25
  },
  { 
    id: 'S4', 
    name: 'FastTrack Delivery', 
    location: 'Bangalore',
    deliveryTime: 2.5, 
    defectRate: 0.08, 
    cost: 55, 
    reliabilityScore: 82, 
    category: 'Electronics',
    reliability: 0.82,
    leadTime: 4,
    costPerUnit: 10.90
  },
  { 
    id: 'S5', 
    name: 'SecureTransit', 
    location: 'Kolkata',
    deliveryTime: 2.9, 
    defectRate: 0.02, 
    cost: 70, 
    reliabilityScore: 96, 
    category: 'Food',
    reliability: 0.96,
    leadTime: 3,
    costPerUnit: 18.60
  }
];

// Mock Inventory Data
export const mockInventoryData: InventoryItem[] = [
  { product: 'Electronics', current: 550, forecasted: 480, reorderLevel: 200, trend: 'down' },
  { product: 'Clothing', current: 630, forecasted: 720, reorderLevel: 300, trend: 'up' },
  { product: 'Food', current: 315, forecasted: 380, reorderLevel: 250, trend: 'up' },
  { product: 'Books', current: 180, forecasted: 150, reorderLevel: 100, trend: 'down' }
];

// Mock Demand Forecast Data
export const mockDemandForecast: DemandForecast[] = [
  { month: 'Jan', actual: 320, predicted: 310, product: 'Electronics' },
  { month: 'Feb', actual: 280, predicted: 290, product: 'Electronics' },
  { month: 'Mar', actual: 350, predicted: 340, product: 'Electronics' },
  { month: 'Apr', actual: 400, predicted: 380, product: 'Electronics' },
  { month: 'May', actual: 380, predicted: 390, product: 'Electronics' },
  { month: 'Jun', actual: 420, predicted: 410, product: 'Electronics' }
];

// Mock Alerts Data
export const mockAlerts: Alert[] = [
  { id: 1, type: 'critical', message: 'Electronics stock below reorder level at Delhi Central', timestamp: '2 minutes ago', resolved: false },
  { id: 2, type: 'warning', message: 'Supplier TechFlow delayed delivery by 4 hours', timestamp: '15 minutes ago', resolved: false },
  { id: 3, type: 'info', message: 'New warehouse efficiency optimization available', timestamp: '1 hour ago', resolved: true },
  { id: 4, type: 'critical', message: 'Route disruption on Mumbai-Pune highway', timestamp: '3 hours ago', resolved: false }
];

// Mock Delivery Metrics Data
export const mockDeliveryMetrics: DeliveryMetric[] = [
  { route: 'Delhi-Gurgaon', distance: 32, optimizedTime: 45, actualTime: 52, savings: 15, cost: 120 },
  { route: 'Mumbai-Thane', distance: 28, optimizedTime: 38, actualTime: 35, savings: 22, cost: 95 },
  { route: 'Bangalore-Whitefield', distance: 18, optimizedTime: 25, actualTime: 28, savings: 8, cost: 75 },
  { route: 'Chennai-OMR', distance: 25, optimizedTime: 35, actualTime: 40, savings: 12, cost: 85 }
];

// Mock Historical Order Data for Warehouse Location Recommendations
export const mockHistoricalOrders: OrderData[] = [
  // High-density cluster around Gurgaon (should suggest micro-warehouse)
  { orderId: 'ORD001', lat: 28.4595, lng: 77.0266, category: 'electronics', deliveryTime: 4.2, fromWarehouse: 'WH001', delayScore: 85, orderValue: 15000, timestamp: '2024-12-15T10:30:00Z' },
  { orderId: 'ORD002', lat: 28.4735, lng: 77.0444, category: 'clothing', deliveryTime: 3.8, fromWarehouse: 'WH001', delayScore: 75, orderValue: 8000, timestamp: '2024-12-15T11:45:00Z' },
  { orderId: 'ORD003', lat: 28.4483, lng: 77.0673, category: 'electronics', deliveryTime: 5.1, fromWarehouse: 'WH001', delayScore: 90, orderValue: 22000, timestamp: '2024-12-15T14:20:00Z' },
  { orderId: 'ORD004', lat: 28.4672, lng: 77.0318, category: 'food', deliveryTime: 2.9, fromWarehouse: 'WH001', delayScore: 45, orderValue: 3500, timestamp: '2024-12-15T16:15:00Z' },
  { orderId: 'ORD005', lat: 28.4521, lng: 77.0512, category: 'electronics', deliveryTime: 4.5, fromWarehouse: 'WH001', delayScore: 82, orderValue: 18000, timestamp: '2024-12-16T09:30:00Z' },
  
  // Cluster around Pune (should suggest micro-warehouse)
  { orderId: 'ORD006', lat: 18.5204, lng: 73.8567, category: 'food', deliveryTime: 6.2, fromWarehouse: 'WH002', delayScore: 95, orderValue: 5000, timestamp: '2024-12-16T12:00:00Z' },
  { orderId: 'ORD007', lat: 18.5314, lng: 73.8477, category: 'clothing', deliveryTime: 5.8, fromWarehouse: 'WH002', delayScore: 88, orderValue: 12000, timestamp: '2024-12-16T13:30:00Z' },
  { orderId: 'ORD008', lat: 18.5099, lng: 73.8712, category: 'electronics', deliveryTime: 7.1, fromWarehouse: 'WH002', delayScore: 98, orderValue: 25000, timestamp: '2024-12-16T15:45:00Z' },
  { orderId: 'ORD009', lat: 18.5445, lng: 73.8302, category: 'food', deliveryTime: 5.9, fromWarehouse: 'WH002', delayScore: 85, orderValue: 4200, timestamp: '2024-12-17T10:15:00Z' },
  { orderId: 'ORD010', lat: 18.5167, lng: 73.8601, category: 'electronics', deliveryTime: 6.5, fromWarehouse: 'WH002', delayScore: 92, orderValue: 19000, timestamp: '2024-12-17T14:20:00Z' },
  
  // Cluster around Coimbatore (should suggest micro-warehouse)
  { orderId: 'ORD011', lat: 11.0168, lng: 76.9558, category: 'electronics', deliveryTime: 8.2, fromWarehouse: 'WH003', delayScore: 95, orderValue: 16000, timestamp: '2024-12-17T11:00:00Z' },
  { orderId: 'ORD012', lat: 11.0341, lng: 76.9512, category: 'clothing', deliveryTime: 7.8, fromWarehouse: 'WH003', delayScore: 88, orderValue: 9500, timestamp: '2024-12-17T13:45:00Z' },
  { orderId: 'ORD013', lat: 11.0089, lng: 76.9734, category: 'food', deliveryTime: 6.9, fromWarehouse: 'WH003', delayScore: 82, orderValue: 3800, timestamp: '2024-12-17T16:30:00Z' },
  { orderId: 'ORD014', lat: 11.0278, lng: 76.9445, category: 'electronics', deliveryTime: 8.5, fromWarehouse: 'WH003', delayScore: 96, orderValue: 21000, timestamp: '2024-12-18T09:15:00Z' },
  { orderId: 'ORD015', lat: 11.0198, lng: 76.9623, category: 'clothing', deliveryTime: 7.3, fromWarehouse: 'WH003', delayScore: 85, orderValue: 11000, timestamp: '2024-12-18T12:30:00Z' },
  
  // Cluster around Siliguri (should suggest micro-warehouse)
  { orderId: 'ORD016', lat: 26.7271, lng: 88.3953, category: 'clothing', deliveryTime: 9.1, fromWarehouse: 'WH004', delayScore: 98, orderValue: 7500, timestamp: '2024-12-18T10:45:00Z' },
  { orderId: 'ORD017', lat: 26.7456, lng: 88.4102, category: 'electronics', deliveryTime: 8.7, fromWarehouse: 'WH004', delayScore: 93, orderValue: 17500, timestamp: '2024-12-18T14:15:00Z' },
  { orderId: 'ORD018', lat: 26.7102, lng: 88.3801, category: 'food', deliveryTime: 7.9, fromWarehouse: 'WH004', delayScore: 87, orderValue: 4100, timestamp: '2024-12-18T16:00:00Z' },
  { orderId: 'ORD019', lat: 26.7389, lng: 88.4055, category: 'clothing', deliveryTime: 8.8, fromWarehouse: 'WH004', delayScore: 91, orderValue: 8900, timestamp: '2024-12-19T09:30:00Z' },
  { orderId: 'ORD020', lat: 26.7198, lng: 88.3889, category: 'electronics', deliveryTime: 9.3, fromWarehouse: 'WH004', delayScore: 96, orderValue: 19500, timestamp: '2024-12-19T11:45:00Z' },
  
  // Scattered orders that shouldn't form clusters
  { orderId: 'ORD021', lat: 28.7041, lng: 77.1025, category: 'food', deliveryTime: 1.8, fromWarehouse: 'WH001', delayScore: 25, orderValue: 2500, timestamp: '2024-12-19T13:20:00Z' },
  { orderId: 'ORD022', lat: 19.2183, lng: 72.9781, category: 'electronics', deliveryTime: 2.1, fromWarehouse: 'WH002', delayScore: 30, orderValue: 14000, timestamp: '2024-12-19T15:30:00Z' },
  { orderId: 'ORD023', lat: 13.0674, lng: 80.2376, category: 'clothing', deliveryTime: 2.5, fromWarehouse: 'WH003', delayScore: 35, orderValue: 6500, timestamp: '2024-12-19T17:15:00Z' },
  { orderId: 'ORD024', lat: 22.6708, lng: 88.4707, category: 'food', deliveryTime: 3.2, fromWarehouse: 'WH004', delayScore: 42, orderValue: 3200, timestamp: '2024-12-20T10:00:00Z' },
  
  // More Gurgaon area orders to strengthen the cluster
  { orderId: 'ORD025', lat: 28.4630, lng: 77.0390, category: 'electronics', deliveryTime: 4.1, fromWarehouse: 'WH001', delayScore: 78, orderValue: 16500, timestamp: '2024-12-20T12:15:00Z' },
  { orderId: 'ORD026', lat: 28.4558, lng: 77.0501, category: 'clothing', deliveryTime: 3.9, fromWarehouse: 'WH001', delayScore: 72, orderValue: 9200, timestamp: '2024-12-20T14:45:00Z' },
  { orderId: 'ORD027', lat: 28.4712, lng: 77.0423, category: 'food', deliveryTime: 3.1, fromWarehouse: 'WH001', delayScore: 48, orderValue: 4800, timestamp: '2024-12-20T16:30:00Z' },
  
  // Additional Pune orders
  { orderId: 'ORD028', lat: 18.5278, lng: 73.8456, category: 'electronics', deliveryTime: 6.8, fromWarehouse: 'WH002', delayScore: 89, orderValue: 20500, timestamp: '2024-12-21T09:45:00Z' },
  { orderId: 'ORD029', lat: 18.5134, lng: 73.8634, category: 'food', deliveryTime: 6.1, fromWarehouse: 'WH002', delayScore: 86, orderValue: 5500, timestamp: '2024-12-21T11:30:00Z' },
  { orderId: 'ORD030', lat: 18.5389, lng: 73.8389, category: 'clothing', deliveryTime: 5.7, fromWarehouse: 'WH002', delayScore: 83, orderValue: 10800, timestamp: '2024-12-21T13:15:00Z' }
];

// Mock Shipments Data
export const mockShipments: ShipmentStatus[] = [
  {
    id: 'SH001',
    status: 'in-transit',
    origin: 'Delhi Distribution Center',
    destination: 'Gurgaon Customer Hub',
    estimatedArrival: '2024-12-22 15:30',
  },
  {
    id: 'SH002',
    status: 'delayed',
    origin: 'Mumbai Warehouse',
    destination: 'Pune Delivery Center',
    estimatedArrival: '2024-12-22 18:45',
    delay: 2
  },
  {
    id: 'SH003',
    status: 'delivered',
    origin: 'Chennai Storage',
    destination: 'Coimbatore Hub',
    estimatedArrival: '2024-12-21 14:20',
  },
  {
    id: 'SH004',
    status: 'processing',
    origin: 'Kolkata Facility',
    destination: 'Siliguri Branch',
    estimatedArrival: '2024-12-23 10:15',
  },
  {
    id: 'SH005',
    status: 'in-transit',
    origin: 'Delhi Distribution Center',
    destination: 'Noida Tech Park',
    estimatedArrival: '2024-12-22 12:00',
  },
  {
    id: 'SH006',
    status: 'delayed',
    origin: 'Mumbai Warehouse',
    destination: 'Thane Industrial Area',
    estimatedArrival: '2024-12-22 20:30',
    delay: 1
  }
];
