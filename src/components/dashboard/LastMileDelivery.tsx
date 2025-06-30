import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter } from 'recharts';
// import { DeliveryMetric } from '../../types';
import { mockDeliveryMetrics } from '../../data/mockData';

interface LastMileDeliveryProps {
  cardClass: string;
}

const LastMileDelivery: React.FC<LastMileDeliveryProps> = ({ cardClass }) => {
  return (
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
};

export default LastMileDelivery;
