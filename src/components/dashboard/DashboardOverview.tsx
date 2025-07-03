import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, DollarSign, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from 'recharts';
import { Alert, ShipmentAnalytics, AlertAnalytics, WarehouseDB } from '../../types';
import { mockDemandForecast } from '../../data/mockData';
import { apiClient } from '../../lib/apiUtils';
import { SupplierTable } from './SupplierTable';

interface DashboardOverviewProps {
  cardClass: string;
  alerts?: Alert[];
  resolveAlert?: (alertId: number) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  cardClass, 
  alerts: propsAlerts, 
  resolveAlert: propsResolveAlert 
}) => {
  const [alerts, setAlerts] = useState<Alert[]>(propsAlerts || []);
  const [shipmentAnalytics, setShipmentAnalytics] = useState<ShipmentAnalytics | null>(null);
  const [alertAnalytics, setAlertAnalytics] = useState<AlertAnalytics | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseDB[]>([]);
  const [warehousePerformance, setWarehousePerformance] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierReliability, setSupplierReliability] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propsAlerts) {
      fetchAlerts();
    }
    fetchAnalytics();
    fetchWarehouses();
    fetchSuppliers();
  }, [propsAlerts]);

  const fetchAlerts = async () => {
    try {
      const response = await apiClient.getAlerts({ limit: 10, resolved: false });
      if (response.success && response.data) {
        setAlerts(response.data);
      } else {
        // Fallback to mock data
        setAlerts([
          { 
            id: 1, 
            type: 'critical', 
            category: 'warehouse',
            title: 'Warehouse Capacity Critical',
            message: 'Warehouse capacity exceeded in Delhi DC', 
            severity: 5,
            source: { entityType: 'warehouse', entityName: 'Delhi DC' },
            resolved: false,
            actionRequired: true,
            dismissible: false,
            timestamp: '2 hours ago',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          { 
            id: 2, 
            type: 'warning', 
            category: 'supplier',
            title: 'Supplier Delay Alert',
            message: 'Supplier delay expected for Electronics shipment', 
            severity: 3,
            source: { entityType: 'supplier', entityName: 'Tech Solutions' },
            resolved: false,
            actionRequired: true,
            dismissible: true,
            timestamp: '4 hours ago',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Failed to load alerts');
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [shipmentResponse, alertResponse] = await Promise.all([
        apiClient.getShipmentAnalytics(),
        apiClient.getAlertAnalytics()
      ]);

      if (shipmentResponse.success && shipmentResponse.data) {
        setShipmentAnalytics(shipmentResponse.data as ShipmentAnalytics);
      } else {
        // Fallback to mock data
        setShipmentAnalytics({
          totalShipments: 1247,
          onTimeDeliveryRate: 96.8,
          statusBreakdown: [
            { _id: 'delivered', count: 850, totalCost: 45000 },
            { _id: 'in-transit', count: 280, totalCost: 15000 },
            { _id: 'delayed', count: 117, totalCost: 8000 }
          ]
        });
      }

      if (alertResponse.success && alertResponse.data) {
        setAlertAnalytics(alertResponse.data as AlertAnalytics);
      } else {
        // Fallback to mock data
        setAlertAnalytics({
          totalAlerts: 45,
          unresolvedCount: 12,
          criticalCount: 3,
          categoryBreakdown: [
            { _id: 'warehouse', count: 8 },
            { _id: 'supplier', count: 5 },
            { _id: 'shipment', count: 7 }
          ],
          severityDistribution: [
            { _id: 5, count: 3 },
            { _id: 4, count: 4 },
            { _id: 3, count: 5 }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.getWarehouses();
      if (response.success && response.data && Array.isArray(response.data)) {
        const warehouseData = response.data as WarehouseDB[];
        setWarehouses(warehouseData);
        
        // Fetch utilization data for each warehouse
        const utilizationPromises = warehouseData.map(async (warehouse) => {
          try {
            const utilizationResponse = await apiClient.getWarehouseUtilization(warehouse._id);
            return {
              ...warehouse,
              utilizationData: utilizationResponse.success ? utilizationResponse.data : null
            };
          } catch (error) {
            console.error(`Error fetching utilization for ${warehouse.name}:`, error);
            return warehouse;
          }
        });
        
        const warehousesWithUtilization = await Promise.all(utilizationPromises);
        
        // Transform warehouse data for chart display
        const performanceData = warehousesWithUtilization.map((warehouse: any) => ({
          name: warehouse.name.split(' ')[0], // Short name for chart
          fullName: warehouse.name,
          efficiency: warehouse.currentUtilization || Math.random() * 30 + 70, // Fallback to random data
          capacity: warehouse.capacity || 1000,
          utilization: warehouse.currentUtilization || Math.random() * 40 + 40,
          status: warehouse.status,
          utilizationData: warehouse.utilizationData || null
        }));
        setWarehousePerformance(performanceData);
      } else {
        // Fallback to mock data
        const mockData = [
          { name: 'Delhi', fullName: 'Delhi Distribution Center', efficiency: 95, capacity: 1000, utilization: 60, status: 'active' },
          { name: 'Mumbai', fullName: 'Mumbai Port Warehouse', efficiency: 88, capacity: 800, utilization: 85, status: 'active' },
          { name: 'Chennai', fullName: 'Chennai Regional Hub', efficiency: 90, capacity: 900, utilization: 70, status: 'active' },
          { name: 'Kolkata', fullName: 'Kolkata Eastern Center', efficiency: 92, capacity: 750, utilization: 45, status: 'active' }
        ];
        setWarehousePerformance(mockData);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      // Fallback to mock data
      const mockData = [
        { name: 'Delhi', fullName: 'Delhi Distribution Center', efficiency: 95, capacity: 1000, utilization: 60, status: 'active' },
        { name: 'Mumbai', fullName: 'Mumbai Port Warehouse', efficiency: 88, capacity: 800, utilization: 85, status: 'active' },
        { name: 'Chennai', fullName: 'Chennai Regional Hub', efficiency: 90, capacity: 900, utilization: 70, status: 'active' },
        { name: 'Kolkata', fullName: 'Kolkata Eastern Center', efficiency: 92, capacity: 750, utilization: 45, status: 'active' }
      ];
      setWarehousePerformance(mockData);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const [suppliersResponse, reliabilityResponse] = await Promise.all([
        apiClient.getSuppliers(),
        apiClient.getSupplierReliability()
      ]);

      if (suppliersResponse.success && suppliersResponse.data && Array.isArray(suppliersResponse.data)) {
        setSuppliers(suppliersResponse.data.slice(0, 5)); // Show top 5 suppliers
      } else {
        // Fallback to mock data
        setSuppliers([
          { id: '1', name: 'Tech Solutions India', category: 'Electronics', reliability: 0.95 },
          { id: '2', name: 'Fashion Hub Ltd', category: 'Clothing', reliability: 0.88 },
          { id: '3', name: 'Food Distributors Co', category: 'Food', reliability: 0.92 }
        ]);
      }

      if (reliabilityResponse.success && reliabilityResponse.data) {
        setSupplierReliability(reliabilityResponse.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      // Fallback to mock data
      setSuppliers([
        { id: '1', name: 'Tech Solutions India', category: 'Electronics', reliability: 0.95 },
        { id: '2', name: 'Fashion Hub Ltd', category: 'Clothing', reliability: 0.88 },
        { id: '3', name: 'Food Distributors Co', category: 'Food', reliability: 0.92 }
      ]);
    }
  };

  const refreshDashboard = async () => {
    setLoading(true);
    await Promise.all([
      fetchAlerts(),
      fetchAnalytics(),
      fetchWarehouses(),
      fetchSuppliers()
    ]);
    setLoading(false);
  };

  const resolveAlert = async (alertId: number) => {
    if (propsResolveAlert) {
      propsResolveAlert(alertId);
      return;
    }

    try {
      const response = await apiClient.resolveAlert(alertId);
      if (response.success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ));
      } else {
        console.error('Failed to resolve alert:', response.message);
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex gap-2">
          <button
            onClick={refreshDashboard}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          {error && (
            <div className="px-4 py-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Shipments</p>
              <p className="text-2xl font-bold">
                {shipmentAnalytics?.totalShipments || '1,247'}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">
            {loading ? 'Loading...' : '↑ 12% from yesterday'}
          </p>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Delivery Success Rate</p>
              <p className="text-2xl font-bold">
                {shipmentAnalytics?.onTimeDeliveryRate ? `${shipmentAnalytics.onTimeDeliveryRate}%` : '96.8%'}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">
            {loading ? 'Loading...' : '↑ 2.1% this week'}
          </p>
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
          <p className="text-sm text-yellow-600 mt-2">
            {alerts.filter(a => !a.resolved && a.type === 'critical').length} critical alerts
          </p>
        </div>
      </div>

      {/* Warehouse Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {warehousePerformance.slice(0, 4).map((warehouse) => (
          <div key={warehouse.name} className={`p-4 rounded-lg ${cardClass} border shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{warehouse.fullName}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                warehouse.status === 'active' ? 'bg-green-100 text-green-800' :
                warehouse.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {warehouse.status}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Utilization:</span>
                <span className="font-medium">{warehouse.utilization}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Capacity:</span>
                <span className="font-medium">{warehouse.capacity}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    warehouse.utilization > 80 ? 'bg-red-500' :
                    warehouse.utilization > 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${warehouse.utilization}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert for Warehouse Issues */}
      {warehouses.some(w => w.currentUtilization > 90) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <h4 className="font-medium text-red-800">Warehouse Capacity Alert</h4>
              <p className="text-sm text-red-600">
                {warehouses.filter(w => w.currentUtilization > 90).length} warehouse(s) are over 90% capacity
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Performance Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Suppliers</p>
              <p className="text-2xl font-bold">{suppliers.length}</p>
            </div>
            <Package className="w-8 h-8 text-indigo-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">
            {suppliers.length > 0 ? 
              `${Math.round(suppliers.reduce((acc: number, s: any) => acc + ((s.reliability || s.reliabilityScore || 0) * (s.reliability ? 100 : 1)), 0) / suppliers.length)}% avg reliability` :
              'Loading supplier data...'
            }
          </p>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Supplier Reliability</p>
              <p className="text-2xl font-bold">
                {supplierReliability?.averageReliability ? 
                  `${Math.round(supplierReliability.averageReliability)}%` : 
                  '94.2%'
                }
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">
            {supplierReliability?.topPerformers ? 
              `${supplierReliability.topPerformers} top performers` : 
              '↑ 3.2% this month'
            }
          </p>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Delivery Time</p>
              <p className="text-2xl font-bold">
                {suppliers.length > 0 ? 
                  `${Math.round(suppliers.reduce((acc: number, s: any) => acc + (s.deliveryTime || s.leadTime || 5), 0) / suppliers.length)} days` :
                  '5.2 days'
                }
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-blue-600 mt-2">
            {loading ? 'Loading...' : '↓ 0.8 days improved'}
          </p>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cost Efficiency</p>
              <p className="text-2xl font-bold">
                {suppliers.length > 0 ? 
                  `$${Math.round(suppliers.reduce((acc: number, s: any) => acc + (s.cost || s.costPerUnit || 500), 0) / suppliers.length)}` :
                  '$485'
                }
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">
            {loading ? 'Loading...' : '↓ 12% cost reduction'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Warehouse Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={warehousePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${value}${name === 'efficiency' ? '%' : ''}`, 
                  name === 'efficiency' ? 'Utilization' : name
                ]}
                labelFormatter={(label) => {
                  const warehouse = warehousePerformance.find(w => w.name === label);
                  return warehouse ? warehouse.fullName : label;
                }}
              />
              <Bar dataKey="efficiency" fill="#3B82F6" name="Utilization %" />
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

      {/* Supplier Performance Table */}
      <div className="space-y-6">
        <SupplierTable suppliers={suppliers} cardClass={cardClass} />
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
};

export default DashboardOverview;
