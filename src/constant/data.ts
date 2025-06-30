import { Supplier, Inventory, ShipmentStatus, PerformanceMetric } from '../types';

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