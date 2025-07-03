import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { apiClient } from '../../lib/apiUtils';

interface Supplier {
  _id?: string;
  id: string;
  name: string;
  location: {
    address?: string;
    city?: string;
    state?: string;
  } | string;
  contactInfo: string;
  category: string;
  reliability?: number;
  reliabilityScore?: number;
  leadTime?: number;
  deliveryTime?: number;
  costPerUnit?: number;
  cost?: number;
}

interface SupplierTableProps {
  suppliers?: Supplier[];
  cardClass?: string;
}

export const SupplierTable: React.FC<SupplierTableProps> = ({ 
  suppliers: propSuppliers, 
  cardClass = "bg-white" 
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(propSuppliers || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'name' | 'reliability' | 'leadTime' | 'cost'>('reliability');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!propSuppliers) {
      fetchSuppliers();
    }
  }, [propSuppliers]);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getSuppliers();
      if (response.success && response.data && Array.isArray(response.data)) {
        setSuppliers(response.data as Supplier[]);
      } else {
        // Fallback to mock data
        const mockData: Supplier[] = [
          { 
            id: '1', 
            name: 'Tech Solutions India', 
            location: { address: 'Mumbai, Maharashtra', city: 'Mumbai', state: 'Maharashtra' },
            contactInfo: 'contact@techsolutions.in',
            category: 'Electronics',
            reliability: 0.95,
            reliabilityScore: 95,
            leadTime: 5,
            deliveryTime: 5,
            costPerUnit: 850,
            cost: 850
          },
          { 
            id: '2', 
            name: 'Fashion Hub Ltd', 
            location: { address: 'Delhi, NCR', city: 'Delhi', state: 'Delhi' },
            contactInfo: 'info@fashionhub.com',
            category: 'Clothing',
            reliability: 0.88,
            reliabilityScore: 88,
            leadTime: 7,
            deliveryTime: 7,
            costPerUnit: 420,
            cost: 420
          }
        ];
        setSuppliers(mockData);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'reliability':
        aValue = a.reliability || a.reliabilityScore || 0;
        bValue = b.reliability || b.reliabilityScore || 0;
        break;
      case 'leadTime':
        aValue = a.leadTime || a.deliveryTime || 0;
        bValue = b.leadTime || b.deliveryTime || 0;
        break;
      case 'cost':
        aValue = a.costPerUnit || a.cost || 0;
        bValue = b.costPerUnit || b.cost || 0;
        break;
      default:
        return 0;
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatLocation = (location: Supplier['location']) => {
    if (typeof location === 'string') return location;
    if (location?.city && location?.state) return `${location.city}, ${location.state}`;
    if (location?.address) return location.address;
    return 'Unknown';
  };

  const getReliabilityValue = (supplier: Supplier) => {
    const reliability = supplier.reliability || supplier.reliabilityScore;
    if (typeof reliability === 'number') {
      return reliability > 1 ? reliability : reliability * 100;
    }
    return 0;
  };

  const getSortIcon = (field: typeof sortField) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className={`${cardClass} rounded-xl shadow-lg overflow-hidden p-8`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${cardClass} rounded-xl shadow-lg overflow-hidden`}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Supplier Performance</h3>
        <button
          onClick={fetchSuppliers}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm"
        >
          <RefreshCw className={`w-4 h-4 inline mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Supplier
                  {getSortIcon('name')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('reliability')}
              >
                <div className="flex items-center gap-1">
                  Reliability
                  {getSortIcon('reliability')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('leadTime')}
              >
                <div className="flex items-center gap-1">
                  Lead Time
                  {getSortIcon('leadTime')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('cost')}
              >
                <div className="flex items-center gap-1">
                  Cost/Unit
                  {getSortIcon('cost')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSuppliers.map((supplier) => {
              const reliability = getReliabilityValue(supplier);
              return (
                <tr key={supplier._id || supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {supplier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatLocation(supplier.location)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {supplier.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        reliability >= 90 ? 'bg-green-500' :
                        reliability >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      {reliability.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {supplier.leadTime || supplier.deliveryTime || 'N/A'} {(supplier.leadTime || supplier.deliveryTime) ? 'days' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${supplier.costPerUnit || supplier.cost || 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {suppliers.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <p>No suppliers found.</p>
        </div>
      )}
    </div>
  );
};