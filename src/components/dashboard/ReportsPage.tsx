import React from 'react';
import { Download } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { mockWarehouses } from '../../data/mockData';

interface ReportsPageProps {
  cardClass: string;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ cardClass }) => {
  return (
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
};

export default ReportsPage;
