import { Supplier, Inventory, ShipmentStatus, PerformanceMetric, Warehouse } from '../types';

export const suppliers: Supplier[] = [
  {
    id: '1',
    name: 'TechComponents Inc',
    location: 'San Francisco, CA',
    reliability: 0.95,
    leadTime: 5,
    costPerUnit: 120,
    deliveryTime: 5,
    defectRate: 0.05,
    cost: 120,
    reliabilityScore: 95,
    category: 'Electronics'
  },
  {
    id: '2',
    name: 'Global Parts Ltd',
    location: 'Shanghai, China',
    reliability: 0.88,
    leadTime: 8,
    costPerUnit: 95,
    deliveryTime: 8,
    defectRate: 0.12,
    cost: 95,
    reliabilityScore: 88,
    category: 'Electronics'
  },
  {
    id: '3',
    name: 'EuroSupply GmbH',
    location: 'Munich, Germany',
    reliability: 0.92,
    leadTime: 7,
    costPerUnit: 110,
    deliveryTime: 7,
    defectRate: 0.08,
    cost: 110,
    reliabilityScore: 92,
    category: 'Electronics'
  },
  {
    id: '4',
    name: 'Pacific Logistics',
    location: 'Singapore',
    reliability: 0.89,
    leadTime: 6,
    costPerUnit: 105,
    deliveryTime: 6,
    defectRate: 0.11,
    cost: 105,
    reliabilityScore: 89,
    category: 'Electronics'
  }
];

export const inventory: Inventory[] = [
  {
    id: '1',
    productName: 'Microprocessors',
    stockLevel: 2500,
    reorderPoint: 1000,
    maxCapacity: 5000,
    turnoverRate: 0.85
  },
  {
    id: '2',
    productName: 'Memory Modules',
    stockLevel: 3800,
    reorderPoint: 1500,
    maxCapacity: 6000,
    turnoverRate: 0.75
  },
  {
    id: '3',
    productName: 'Power Units',
    stockLevel: 1200,
    reorderPoint: 800,
    maxCapacity: 3000,
    turnoverRate: 0.92
  },
  {
    id: '4',
    productName: 'Display Panels',
    stockLevel: 900,
    reorderPoint: 600,
    maxCapacity: 2000,
    turnoverRate: 0.88
  }
];

export const shipments: ShipmentStatus[] = [
  {
    id: '1',
    origin: 'San Francisco, CA',
    destination: 'Austin, TX',
    status: 'in-transit',
    estimatedArrival: '2024-03-25',
    delay: 0
  },
  {
    id: '2',
    origin: 'Shanghai, China',
    destination: 'Los Angeles, CA',
    status: 'delayed',
    estimatedArrival: '2024-03-22',
    actualArrival: '2024-03-24',
    delay: 2
  },
  {
    id: '3',
    origin: 'Munich, Germany',
    destination: 'Paris, France',
    status: 'delivered',
    estimatedArrival: '2024-03-20',
    actualArrival: '2024-03-20',
    delay: 0
  }
];

export const performanceMetrics: PerformanceMetric[] = Array.from({ length: 12 }, (_, i) => ({
  date: new Date(2024, i, 1).toISOString().split('T')[0],
  orderFulfillmentRate: 0.85 + Math.random() * 0.1,
  inventoryTurnover: 4 + Math.random() * 2,
  supplierReliability: 0.88 + Math.random() * 0.1,
  costEfficiency: 0.82 + Math.random() * 0.15
}));

// Warehouse data for purchase management
export const warehouses: Warehouse[] = [
  {
    id: 'WH001',
    name: 'Austin Central Warehouse',
    location: { lat: 30.2672, lng: -97.7431 },
    stock: {
      electronics: 15000,
      clothing: 8500,
      food: 12000
    },
    load: 65,
    droneReady: true,
    efficiency: 92
  },
  {
    id: 'WH002',
    name: 'Dallas Distribution Center',
    location: { lat: 32.7767, lng: -96.7970 },
    stock: {
      electronics: 22000,
      clothing: 15000,
      food: 8500
    },
    load: 78,
    droneReady: true,
    efficiency: 88
  },
  {
    id: 'WH003',
    name: 'Houston Industrial Hub',
    location: { lat: 29.7604, lng: -95.3698 },
    stock: {
      electronics: 18500,
      clothing: 12000,
      food: 20000
    },
    load: 55,
    droneReady: false,
    efficiency: 85
  },
  {
    id: 'WH004',
    name: 'San Antonio Logistics Center',
    location: { lat: 29.4241, lng: -98.4936 },
    stock: {
      electronics: 9500,
      clothing: 18000,
      food: 15500
    },
    load: 42,
    droneReady: true,
    efficiency: 90
  },
  {
    id: 'WH005',
    name: 'El Paso Border Facility',
    location: { lat: 31.7619, lng: -106.4850 },
    stock: {
      electronics: 7200,
      clothing: 9800,
      food: 11200
    },
    load: 35,
    droneReady: false,
    efficiency: 82
  }
];