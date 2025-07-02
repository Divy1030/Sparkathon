import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter } from 'recharts';
import { AlertTriangle, Plus, FileText, TrendingUp, Award } from 'lucide-react';
import { mockSuppliers } from '../../data/mockData';
import DefectReportForm from '../forms/DefectReportForm';
import DefectReportsList from './DefectReportsList';

interface SupplierReliabilityProps {
  cardClass: string;
}

const SupplierReliability: React.FC<SupplierReliabilityProps> = ({ cardClass }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'defects' | 'report'>('overview');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [reliabilityData, setReliabilityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSupplierRanking();
  }, []);

  const fetchSupplierRanking = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/supplier/ranking');
      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data || mockSuppliers);
      }
    } catch (error) {
      console.error('Error fetching supplier ranking:', error);
      setSuppliers(mockSuppliers);
    } finally {
      setLoading(false);
    }
  };

  const recalculateReliability = async (supplierId: string) => {
    try {
      const response = await fetch(`/api/supplier/${supplierId}/recalculate-reliability`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        fetchSupplierRanking(); // Refresh the data
        alert('Supplier reliability recalculated successfully!');
      } else {
        alert('Error recalculating reliability: ' + data.message);
      }
    } catch (error) {
      console.error('Error recalculating reliability:', error);
      alert('Error recalculating reliability. Please try again.');
    }
  };

  const handleDefectReportSubmit = () => {
    // Refresh supplier data after new defect report
    fetchSupplierRanking();
    setActiveTab('defects');
  };

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === id 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Supplier Reliability</h1>
        <div className="flex gap-3">
          <TabButton id="overview" label="Overview" icon={TrendingUp} />
          <TabButton id="defects" label="Defect Reports" icon={FileText} />
          <TabButton id="report" label="Report Defect" icon={Plus} />
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
              <h3 className="text-lg font-semibold mb-4">Reliability Scores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={suppliers}>
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
                <ScatterChart data={suppliers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="deliveryTime" name="Delivery Time" />
                  <YAxis dataKey="defectRate" name="Defect Rate" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Suppliers" data={suppliers} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Supplier Details</h3>
              <button
                onClick={fetchSupplierRanking}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh Rankings
              </button>
            </div>
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
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers
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
                        <div className="flex items-center gap-2">
                          {index === 0 && <Award className="w-4 h-4 text-yellow-500" />}
                          <span className={`px-2 py-1 rounded text-xs ${
                            index < 2 ? 'bg-green-100 text-green-800' :
                            index >= suppliers.length - 2 ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedSupplier(supplier.id);
                              setActiveTab('defects');
                            }}
                            className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors"
                          >
                            View Defects
                          </button>
                          <button
                            onClick={() => recalculateReliability(supplier.id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                          >
                            Recalculate
                          </button>
                        </div>
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
                <p className="text-green-700">
                  {suppliers.length > 0 && suppliers.sort((a, b) => b.reliabilityScore - a.reliabilityScore)[0]?.name} shows excellent reliability with low defect rates. Consider increasing order volume.
                </p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800">⚠ Performance Issue</h4>
                <p className="text-red-700">
                  Monitor suppliers with reliability scores below 80%. Consider alternative suppliers or implement improvement plans.
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800">💡 Optimization</h4>
                <p className="text-blue-700">
                  Regular defect reporting and reliability recalculation helps maintain accurate supplier assessments.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'defects' && (
        <DefectReportsList 
          cardClass={cardClass} 
          supplierId={selectedSupplier}
          onViewReport={(report) => {
            // Handle view report
            console.log('View report:', report);
          }}
          onEditReport={(report) => {
            // Handle edit report
            console.log('Edit report:', report);
          }}
        />
      )}

      {activeTab === 'report' && (
        <DefectReportForm 
          cardClass={cardClass}
          onSubmit={handleDefectReportSubmit}
        />
      )}
    </div>
  );
};

export default SupplierReliability;
