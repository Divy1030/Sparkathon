import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter } from 'recharts';
// import { Supplier } from '../../types';
import { mockSuppliers } from '../../data/mockData';

interface SupplierReliabilityProps {
  cardClass: string;
}

const SupplierReliability: React.FC<SupplierReliabilityProps> = ({ cardClass }) => {
  return (
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
};

export default SupplierReliability;
