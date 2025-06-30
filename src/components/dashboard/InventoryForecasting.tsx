import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
// import { InventoryItem, DemandForecast } from '../../types';
import { mockInventoryData, mockDemandForecast } from '../../data/mockData';

interface InventoryForecastingProps {
  cardClass: string;
}

const InventoryForecasting: React.FC<InventoryForecastingProps> = ({ cardClass }) => {
  return (
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
};

export default InventoryForecasting;
