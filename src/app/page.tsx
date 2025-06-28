'use client'
import React, { useState,  } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
 Area, AreaChart, Scatter, ScatterChart
} from 'recharts';
import { 
  Package, Truck, AlertTriangle, Users, MapPin, 
  Home, CheckCircle,DollarSign,
  Warehouse, Bell, FileText, Filter, Download, Moon, Sun
} from 'lucide-react';

// Mock Data
const mockWarehouses = [
  { id: 'W1', name: 'Delhi Central', location: { lat: 28.7041, lng: 77.1025 }, stock: { electronics: 150, clothing: 200, food: 100 }, load: 60, droneReady: true, efficiency: 95 },
  { id: 'W2', name: 'Mumbai Port', location: { lat: 19.0760, lng: 72.8777 }, stock: { electronics: 80, clothing: 150, food: 75 }, load: 85, droneReady: true, efficiency: 88 },
  { id: 'W3', name: 'Bangalore Tech', location: { lat: 12.9716, lng: 77.5946 }, stock: { electronics: 200, clothing: 100, food: 50 }, load: 45, droneReady: false, efficiency: 92 },
  { id: 'W4', name: 'Chennai Hub', location: { lat: 13.0827, lng: 80.2707 }, stock: { electronics: 120, clothing: 180, food: 90 }, load: 70, droneReady: true, efficiency: 90 }
];

type ProductCategory = 'electronics' | 'clothing' | 'food';

type Warehouse = {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  stock: Record<ProductCategory, number>;
  load: number;
  droneReady: boolean;
  efficiency: number;
};

type WarehouseWithScore = Warehouse & {
  distanceScore: number;
  stockScore: number;
  loadScore: number;
  totalScore: number;
};

const mockSuppliers = [
  { id: 'S1', name: 'TechFlow Logistics', deliveryTime: 2.1, defectRate: 0.03, cost: 50, reliabilityScore: 95, category: 'Electronics' },
  { id: 'S2', name: 'QuickShip Express', deliveryTime: 1.8, defectRate: 0.05, cost: 65, reliabilityScore: 88, category: 'Clothing' },
  { id: 'S3', name: 'ReliableCargo', deliveryTime: 3.2, defectRate: 0.12, cost: 40, reliabilityScore: 72, category: 'Food' },
  { id: 'S4', name: 'FastTrack Delivery', deliveryTime: 2.5, defectRate: 0.08, cost: 55, reliabilityScore: 82, category: 'Electronics' },
  { id: 'S5', name: 'SecureTransit', deliveryTime: 2.9, defectRate: 0.02, cost: 70, reliabilityScore: 96, category: 'Food' }
];

const mockInventoryData = [
  { product: 'Electronics', current: 550, forecasted: 480, reorderLevel: 200, trend: 'down' },
  { product: 'Clothing', current: 630, forecasted: 720, reorderLevel: 300, trend: 'up' },
  { product: 'Food', current: 315, forecasted: 380, reorderLevel: 250, trend: 'up' },
  { product: 'Books', current: 180, forecasted: 150, reorderLevel: 100, trend: 'down' }
];

const mockDemandForecast = [
  { month: 'Jan', actual: 320, predicted: 310, product: 'Electronics' },
  { month: 'Feb', actual: 280, predicted: 290, product: 'Electronics' },
  { month: 'Mar', actual: 350, predicted: 340, product: 'Electronics' },
  { month: 'Apr', actual: 400, predicted: 380, product: 'Electronics' },
  { month: 'May', actual: 380, predicted: 390, product: 'Electronics' },
  { month: 'Jun', actual: 420, predicted: 410, product: 'Electronics' }
];

const mockAlerts = [
  { id: 1, type: 'critical', message: 'Electronics stock below reorder level at Delhi Central', timestamp: '2 minutes ago', resolved: false },
  { id: 2, type: 'warning', message: 'Supplier TechFlow delayed delivery by 4 hours', timestamp: '15 minutes ago', resolved: false },
  { id: 3, type: 'info', message: 'New warehouse efficiency optimization available', timestamp: '1 hour ago', resolved: true },
  { id: 4, type: 'critical', message: 'Route disruption on Mumbai-Pune highway', timestamp: '3 hours ago', resolved: false }
];

const mockDeliveryMetrics = [
  { route: 'Delhi-Gurgaon', distance: 32, optimizedTime: 45, actualTime: 52, savings: 15, cost: 120 },
  { route: 'Mumbai-Thane', distance: 28, optimizedTime: 38, actualTime: 35, savings: 22, cost: 95 },
  { route: 'Bangalore-Whitefield', distance: 18, optimizedTime: 25, actualTime: 28, savings: 8, cost: 75 },
  { route: 'Chennai-OMR', distance: 25, optimizedTime: 35, actualTime: 40, savings: 12, cost: 85 }
];

// Main Dashboard Component
export default function SupplyChainDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  // const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [alerts, setAlerts] = useState(mockAlerts);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard Overview', icon: Home },
    { id: 'inventory', name: 'Inventory Forecasting', icon: Package },
    { id: 'suppliers', name: 'Supplier Reliability', icon: Users },
    { id: 'delivery', name: 'Last-Mile Delivery', icon: Truck },
    { id: 'warehouse-ai', name: 'Warehouse Selector AI', icon: Warehouse },
    { id: 'map', name: 'Map Simulation', icon: MapPin },
    { id: 'alerts', name: 'Alerts & Anomalies', icon: Bell },
    { id: 'reports', name: 'Reports & Insights', icon: FileText }
  ];

  const resolveAlert = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  // const theme = darkMode ? 'dark' : 'light';
  const bgClass = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const sidebarClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  // Dashboard Overview Component
  const DashboardOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${cardClass} border hover:shadow-md transition-all`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders Today</p>
              <p className="text-2xl font-bold">1,247</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">↑ 12% from yesterday</p>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Delivery Success Rate</p>
              <p className="text-2xl font-bold">96.8%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">↑ 2.1% this week</p>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cost Efficiency</p>
              <p className="text-2xl font-bold">$2.4M</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-sm text-red-600 mt-2">↓ 5% from last month</p>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Alerts</p>
              <p className="text-2xl font-bold">{alerts.filter(a => !a.resolved).length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm text-yellow-600 mt-2">3 critical alerts</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Warehouse Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockWarehouses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="efficiency" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Demand Forecast vs Actual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockDemandForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="predicted" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg ${
              alert.type === 'critical' ? 'bg-red-50 border-red-200' :
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            } border`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${
                  alert.type === 'critical' ? 'text-red-500' :
                  alert.type === 'warning' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} />
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm text-gray-500">{alert.timestamp}</p>
                </div>
              </div>
              {!alert.resolved && (
                <button 
                  onClick={() => resolveAlert(alert.id)}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
                >
                  Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Inventory Forecasting Component
  const InventoryForecasting = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inventory Forecasting</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
            <h3 className="text-lg font-semibold mb-4">Demand Prediction</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={mockDemandForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="actual" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="predicted" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Stock Alerts</h3>
          <div className="space-y-4">
            {mockInventoryData.map((item, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                item.current < item.reorderLevel ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{item.product}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.trend === 'up' ? '↗' : '↘'} {item.trend}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Current: {item.current}</p>
                <p className="text-sm text-gray-600">Forecasted: {item.forecasted}</p>
                {item.current < item.reorderLevel && (
                  <p className="text-sm text-red-600 font-medium mt-1">⚠ Reorder needed</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <h3 className="text-lg font-semibold mb-4">Inventory Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">Current Stock</th>
                <th className="text-left p-3">Forecasted Demand</th>
                <th className="text-left p-3">Reorder Level</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockInventoryData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{item.product}</td>
                  <td className="p-3">{item.current}</td>
                  <td className="p-3">{item.forecasted}</td>
                  <td className="p-3">{item.reorderLevel}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.current < item.reorderLevel ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {item.current < item.reorderLevel ? 'Low Stock' : 'Optimal'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                      {item.current < item.reorderLevel ? 'Reorder' : 'Monitor'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Supplier Reliability Component
  const SupplierReliability = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Supplier Reliability</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Reliability Scores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockSuppliers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reliabilityScore" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={mockSuppliers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="deliveryTime" name="Delivery Time" />
              <YAxis dataKey="defectRate" name="Defect Rate" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Suppliers" data={mockSuppliers} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <h3 className="text-lg font-semibold mb-4">Supplier Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Supplier</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Delivery Time (days)</th>
                <th className="text-left p-3">Defect Rate</th>
                <th className="text-left p-3">Cost ($)</th>
                <th className="text-left p-3">Reliability Score</th>
                <th className="text-left p-3">Ranking</th>
              </tr>
            </thead>
            <tbody>
              {mockSuppliers
                .sort((a, b) => b.reliabilityScore - a.reliabilityScore)
                .map((supplier, index) => (
                <tr key={supplier.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{supplier.name}</td>
                  <td className="p-3">{supplier.category}</td>
                  <td className="p-3">{supplier.deliveryTime}</td>
                  <td className="p-3">{(supplier.defectRate * 100).toFixed(1)}%</td>
                  <td className="p-3">${supplier.cost}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        supplier.reliabilityScore >= 90 ? 'bg-green-500' :
                        supplier.reliabilityScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      {supplier.reliabilityScore}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      index < 2 ? 'bg-green-100 text-green-800' :
                      index >= mockSuppliers.length - 2 ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      #{index + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
        <div className="space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800">✓ Top Performer</h4>
            <p className="text-green-700">SecureTransit shows excellent reliability (96%) with low defect rates. Consider increasing order volume.</p>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800">⚠ Performance Issue</h4>
            <p className="text-red-700">ReliableCargo has high defect rate (12%) and longer delivery times. Consider alternative suppliers.</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800">💡 Optimization</h4>
            <p className="text-blue-700">TechFlow Logistics offers good balance of speed and reliability for electronics category.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Last-Mile Delivery Component
  const LastMileDelivery = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Last-Mile Delivery Optimization</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Route Optimization Results</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockDeliveryMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="route" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="optimizedTime" fill="#10B981" name="Optimized Time" />
              <Bar dataKey="actualTime" fill="#F59E0B" name="Actual Time" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Cost vs Distance Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={mockDeliveryMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="distance" name="Distance (km)" />
              <YAxis dataKey="cost" name="Cost ($)" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Routes" data={mockDeliveryMetrics} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <h3 className="text-lg font-semibold mb-4">Route Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Route</th>
                <th className="text-left p-3">Distance (km)</th>
                <th className="text-left p-3">Optimized Time</th>
                <th className="text-left p-3">Actual Time</th>
                <th className="text-left p-3">Time Savings</th>
                <th className="text-left p-3">Cost ($)</th>
                <th className="text-left p-3">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {mockDeliveryMetrics.map((route, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{route.route}</td>
                  <td className="p-3">{route.distance}</td>
                  <td className="p-3">{route.optimizedTime} min</td>
                  <td className="p-3">{route.actualTime} min</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      route.savings > 15 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {route.savings}%
                    </span>
                  </td>
                  <td className="p-3">${route.cost}</td>
                  <td className="p-3">
                    <div className={`w-full bg-gray-200 rounded-full h-2`}>
                      <div 
                        className={`h-2 rounded-full ${
                          route.savings > 15 ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(route.savings * 4, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Delivery Clustering</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span>North Zone</span>
              <span className="font-semibold">24 deliveries</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span>South Zone</span>
              <span className="font-semibold">18 deliveries</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
              <span>East Zone</span>
              <span className="font-semibold">32 deliveries</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
              <span>West Zone</span>
              <span className="font-semibold">15 deliveries</span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Real-time Metrics</h3>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">94.2%</p>
              <p className="text-sm text-gray-600">On-time Delivery</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">$2,847</p>
              <p className="text-sm text-gray-600">Cost Savings Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">127</p>
              <p className="text-sm text-gray-600">Active Routes</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Route Simulation</h3>
          <button className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Simulate New Batch
          </button>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Estimated Savings:</span>
              <span className="font-semibold text-green-600">18%</span>
            </div>
            <div className="flex justify-between">
              <span>Total Distance:</span>
              <span className="font-semibold">284 km</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Time:</span>
              <span className="font-semibold">4.2 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Warehouse Selector AI Component
  const WarehouseAI = () => {
    const [customerLocation, setCustomerLocation] = useState('');
    const [selectedItem, setSelectedItem] = useState<ProductCategory>('electronics');
    const [recommendation, setRecommendation] = useState<WarehouseWithScore | null>(null);

    const calculateRecommendation = () => {
      // Mock AI calculation
      const scores: WarehouseWithScore[] = mockWarehouses.map(warehouse => ({
        ...warehouse,
        distanceScore: Math.random() * 100,
        stockScore: warehouse.stock[selectedItem] || 0,
        loadScore: 100 - warehouse.load,
        totalScore: Math.random() * 100
      })).sort((a, b) => b.totalScore - a.totalScore);

      setRecommendation(scores[0]);
    };

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Warehouse Selector AI</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Customer Location</label>
                <input
                  type="text"
                  value={customerLocation}
                  onChange={(e) => setCustomerLocation(e.target.value)}
                  placeholder="Enter customer address or coordinates"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Product Category</label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value as ProductCategory)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food</option>
                </select>
              </div>
              <button
                onClick={calculateRecommendation}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Get AI Recommendation
              </button>
            </div>
          </div>

          {recommendation && (
            <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
              <h3 className="text-lg font-semibold mb-4">Recommended Warehouse</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800">{recommendation.name}</h4>
                  <p className="text-green-700">ID: {recommendation.id}</p>
                  <p className="text-green-700">Score: {recommendation.totalScore.toFixed(1)}/100</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Distance Score:</span>
                    <span className="font-semibold">{recommendation.distanceScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stock Availability:</span>
                    <span className="font-semibold">{recommendation.stock[selectedItem] || 0} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Load:</span>
                    <span className="font-semibold">{recommendation.load}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Drone Ready:</span>
                    <span className={`font-semibold ${recommendation.droneReady ? 'text-green-600' : 'text-red-600'}`}>
                      {recommendation.droneReady ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Warehouse Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Warehouse</th>
                  <th className="text-left p-3">Stock ({selectedItem})</th>
                  <th className="text-left p-3">Current Load</th>
                  <th className="text-left p-3">Efficiency</th>
                  <th className="text-left p-3">Drone Ready</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockWarehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{warehouse.name}</td>
                    <td className="p-3">{warehouse.stock[selectedItem] || 0}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              warehouse.load > 80 ? 'bg-red-500' : 
                              warehouse.load > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${warehouse.load}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{warehouse.load}%</span>
                      </div>
                    </td>
                    <td className="p-3">{warehouse.efficiency}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        warehouse.droneReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {warehouse.droneReady ? 'Ready' : 'Not Ready'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        warehouse.load < 70 && (warehouse.stock[selectedItem] || 0) > 50 ? 
                        'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {warehouse.load < 70 && (warehouse.stock[selectedItem] || 0) > 50 ? 'Optimal' : 'Busy'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Map Simulation Component
  const MapSimulation = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Map Simulation</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
            <h3 className="text-lg font-semibold mb-4">Interactive Map View</h3>
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p>Interactive map would be rendered here</p>
                <p className="text-sm">Warehouses, delivery routes, and customer clusters</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
            <h3 className="text-lg font-semibold mb-4">Map Controls</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Show Warehouses
              </button>
              <button className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                Show Delivery Routes
              </button>
              <button className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                Show Customer Clusters
              </button>
              <button className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
                Show Traffic Data
              </button>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
            <h3 className="text-lg font-semibold mb-4">Live Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Active Routes:</span>
                <span className="font-semibold">127</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Vehicles:</span>
                <span className="font-semibold">84</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Delivery Time:</span>
                <span className="font-semibold">42 min</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-semibold text-green-600">96.8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">KMeans Clustering Results</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={[
              { x: 28.7, y: 77.1, cluster: 'A' },
              { x: 28.6, y: 77.2, cluster: 'A' },
              { x: 19.0, y: 72.8, cluster: 'B' },
              { x: 19.1, y: 72.9, cluster: 'B' },
              { x: 12.9, y: 77.5, cluster: 'C' },
              { x: 13.0, y: 77.6, cluster: 'C' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="Latitude" />
              <YAxis dataKey="y" name="Longitude" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Cluster A" data={[{ x: 28.7, y: 77.1 }, { x: 28.6, y: 77.2 }]} fill="#8884d8" />
              <Scatter name="Cluster B" data={[{ x: 19.0, y: 72.8 }, { x: 19.1, y: 72.9 }]} fill="#82ca9d" />
              <Scatter name="Cluster C" data={[{ x: 12.9, y: 77.5 }, { x: 13.0, y: 77.6 }]} fill="#ffc658" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Micro-Warehouse Recommendations</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800">Zone A - North Delhi</h4>
              <p className="text-blue-700">High density area, recommend micro-warehouse</p>
              <p className="text-sm text-blue-600">Potential savings: 15% delivery time</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800">Zone B - Mumbai Suburbs</h4>
              <p className="text-green-700">Expanding customer base detected</p>
              <p className="text-sm text-green-600">ROI projection: 8 months</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800">Zone C - Bangalore East</h4>
              <p className="text-yellow-700">Current coverage adequate</p>
              <p className="text-sm text-yellow-600">Monitor for growth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Alerts Component
  const AlertsPage = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alerts & Anomalies</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            <Filter className="w-4 h-4 inline mr-2" />
            Filter
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
            Mark All Read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
          <div className="text-2xl font-bold text-red-600">
            {alerts.filter(a => !a.resolved && a.type === 'critical').length}
          </div>
          <div className="text-sm text-gray-600">Critical Alerts</div>
        </div>
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
          <div className="text-2xl font-bold text-yellow-600">
            {alerts.filter(a => !a.resolved && a.type === 'warning').length}
          </div>
          <div className="text-sm text-gray-600">Warning Alerts</div>
        </div>
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
          <div className="text-2xl font-bold text-blue-600">
            {alerts.filter(a => !a.resolved && a.type === 'info').length}
          </div>
          <div className="text-sm text-gray-600">Info Alerts</div>
        </div>
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
          <div className="text-2xl font-bold text-green-600">
            {alerts.filter(a => a.resolved).length}
          </div>
          <div className="text-sm text-gray-600">Resolved Today</div>
        </div>
      </div>

      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
        <div className="space-y-4">
          {alerts.filter(a => !a.resolved).map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
              alert.type === 'critical' ? 'bg-red-50 border-red-500' :
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.type === 'critical' ? 'text-red-500' :
                      alert.type === 'warning' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-medium mb-1">{alert.message}</p>
                  <p className="text-sm text-gray-500">{alert.timestamp}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors">
                    Snooze
                  </button>
                  <button 
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <h3 className="text-lg font-semibold mb-4">Alert History</h3>
        <div className="space-y-3">
          {alerts.filter(a => a.resolved).map((alert) => (
            <div key={alert.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">{alert.message}</p>
                <p className="text-sm text-gray-500">{alert.timestamp} - Resolved</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Reports Component
  const ReportsPage = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Insights</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
            <Download className="w-4 h-4 inline mr-2" />
            Export CSV
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
            <Download className="w-4 h-4 inline mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Cost Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
              { month: 'Jan', cost: 2400000, savings: 120000 },
              { month: 'Feb', cost: 2200000, savings: 180000 },
              { month: 'Mar', cost: 2500000, savings: 95000 },
              { month: 'Apr', cost: 2300000, savings: 210000 },
              { month: 'May', cost: 2100000, savings: 250000 },
              { month: 'Jun', cost: 2400000, savings: 180000 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value.toLocaleString()}`, '']} />
              <Legend />
              <Area type="monotone" dataKey="cost" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              <Area type="monotone" dataKey="savings" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Delivery Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { week: 'W1', onTime: 94, delayed: 6 },
              { week: 'W2', onTime: 96, delayed: 4 },
              { week: 'W3', onTime: 92, delayed: 8 },
              { week: 'W4', onTime: 98, delayed: 2 },
              { week: 'W5', onTime: 95, delayed: 5 },
              { week: 'W6', onTime: 97, delayed: 3 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="onTime" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="delayed" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-medium text-green-800">Cost Optimization</h4>
              <p className="text-sm text-green-700">15% reduction in delivery costs through route optimization</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-blue-800">Efficiency Gains</h4>
              <p className="text-sm text-blue-700">AI-powered warehouse selection improved fulfillment by 22%</p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-yellow-800">Growth Opportunity</h4>
              <p className="text-sm text-yellow-700">Emerging demand in South zones suggests expansion potential</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Report Filters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <select className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Warehouse</label>
              <select className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option>All Warehouses</option>
                {mockWarehouses.map(w => (
                  <option key={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Food</option>
              </select>
            </div>
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              Apply Filters
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$2.4M</div>
              <div className="text-sm text-gray-600">Total Savings This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">96.8%</div>
              <div className="text-sm text-gray-600">Average Delivery Success</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">89</div>
              <div className="text-sm text-gray-600">Supplier Performance Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">127</div>
              <div className="text-sm text-gray-600">Active Routes Daily</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render current page
  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardOverview />;
      case 'inventory': return <InventoryForecasting />;
      case 'suppliers': return <SupplierReliability />;
      case 'delivery': return <LastMileDelivery />;
      case 'warehouse-ai': return <WarehouseAI />;
      case 'map': return <MapSimulation />;
      case 'alerts': return <AlertsPage />;
      case 'reports': return <ReportsPage />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-200`}>
      <div className="flex">
        {/* Sidebar */}
        <div className={`w-64 ${sidebarClass} border-r shadow-lg min-h-screen sticky top-0 transition-colors duration-200`}>
          <div className="p-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Truck className="w-8 h-8 text-blue-600" />
              Logistics Dashboard
            </h2>
          </div>
          
          <nav className="px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-gray-700`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="text-sm font-medium">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
}