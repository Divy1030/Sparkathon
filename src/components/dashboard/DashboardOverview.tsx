import React from 'react';
import { Package, CheckCircle, DollarSign, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from 'recharts';
import { Alert } from '../../types';
import { mockWarehouses, mockDemandForecast } from '../../data/mockData';

interface DashboardOverviewProps {
  cardClass: string;
  alerts: Alert[];
  resolveAlert: (alertId: number) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ cardClass, alerts, resolveAlert }) => {
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
};

export default DashboardOverview;
