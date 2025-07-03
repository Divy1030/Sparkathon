import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, DollarSign, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from 'recharts';
import { Alert } from '../../types';
import { mockWarehouses, mockDemandForecast } from '../../data/mockData';

interface DashboardOverviewProps {
  cardClass: string;
  alerts?: Alert[];
  resolveAlert?: (alertId: number) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ cardClass, alerts: propsAlerts, resolveAlert: propsResolveAlert }) => {
  const [alerts, setAlerts] = useState<Alert[]>(propsAlerts || []);
  const [shipmentAnalytics, setShipmentAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!propsAlerts) {
      fetchAlerts();
    }
    fetchShipmentAnalytics();
  }, [propsAlerts]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alert?limit=50');
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data || []);
      } else {
        // Fallback to mock data
        setAlerts([
          { id: 1, type: 'critical', message: 'Warehouse capacity exceeded', timestamp: '2 hours ago', resolved: false },
          { id: 2, type: 'warning', message: 'Supplier delay expected', timestamp: '4 hours ago', resolved: false },
          { id: 3, type: 'info', message: 'Route optimization available', timestamp: '6 hours ago', resolved: false },
        ]);
      }
    } catch (error) {
      console.error('Error fetching alerts, using mock data:', error);
      // Fallback to mock data
      setAlerts([
        { id: 1, type: 'critical', message: 'Warehouse capacity exceeded', timestamp: '2 hours ago', resolved: false },
        { id: 2, type: 'warning', message: 'Supplier delay expected', timestamp: '4 hours ago', resolved: false },
        { id: 3, type: 'info', message: 'Route optimization available', timestamp: '6 hours ago', resolved: false },
      ]);
    }
  };

  const fetchShipmentAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shipment/analytics');
      const data = await response.json();
      if (data.success) {
        setShipmentAnalytics(data.data);
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
    } catch (error) {
      console.error('Error fetching shipment analytics, using mock data:', error);
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
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: number) => {
    if (propsResolveAlert) {
      propsResolveAlert(alertId);
      return;
    }

    try {
      const response = await fetch(`/api/alert/${alertId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolvedBy: 'user' }),
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ));
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
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
};

export default DashboardOverview;
