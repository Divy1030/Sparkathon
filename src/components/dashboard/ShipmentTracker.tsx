import React, { useState, useEffect } from 'react';
import { ShipmentStatus } from '../../types';
import { Truck, CheckCircle, AlertCircle, RefreshCw, Eye, MapPin } from 'lucide-react';
import { apiClient } from '../../lib/apiUtils';

// Mock data fallback
const mockShipments: ShipmentStatus[] = [
  { 
    id: '1', 
    status: 'in-transit', 
    trackingNumber: 'SH001',
    purchaseOrderId: 'PO001',
    origin: { warehouseId: 'w1', name: 'Delhi DC', address: 'Delhi Distribution Center' },
    destination: { name: 'Mumbai Warehouse', address: 'Mumbai Distribution Hub' },
    estimatedArrival: '2024-07-05T10:00:00Z', 
    delay: 0,
    carrier: { name: 'FastTrack Logistics', contactInfo: '+91-11-1234567' },
    items: [{ productId: 'p1', productName: 'Sample Product', quantity: 10, unitPrice: 1000 }],
    cost: { shippingCost: 500, totalCost: 500 },
    trackingHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: '2', 
    status: 'delayed', 
    trackingNumber: 'SH002',
    purchaseOrderId: 'PO002',
    origin: { warehouseId: 'w2', name: 'Chennai Hub', address: 'Chennai Distribution Center' },
    destination: { name: 'Bangalore Warehouse', address: 'Bangalore Distribution Hub' },
    estimatedArrival: '2024-07-04T15:00:00Z', 
    delay: 2,
    carrier: { name: 'Express Delivery', contactInfo: '+91-44-1234567' },
    items: [{ productId: 'p2', productName: 'Sample Product 2', quantity: 5, unitPrice: 2000 }],
    cost: { shippingCost: 300, totalCost: 300 },
    trackingHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: '3', 
    status: 'processing', 
    trackingNumber: 'SH003',
    purchaseOrderId: 'PO003',
    origin: { warehouseId: 'w3', name: 'Kolkata Center', address: 'Kolkata Distribution Center' },
    destination: { name: 'Hyderabad Warehouse', address: 'Hyderabad Distribution Hub' },
    estimatedArrival: '2024-07-06T12:00:00Z', 
    delay: 0,
    carrier: { name: 'Reliable Transport', contactInfo: '+91-33-1234567' },
    items: [{ productId: 'p3', productName: 'Sample Product 3', quantity: 8, unitPrice: 1500 }],
    cost: { shippingCost: 400, totalCost: 400 },
    trackingHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: '4', 
    status: 'delivered', 
    trackingNumber: 'SH004',
    purchaseOrderId: 'PO004',
    origin: { warehouseId: 'w4', name: 'Mumbai Port', address: 'Mumbai Port Warehouse' },
    destination: { name: 'Pune Warehouse', address: 'Pune Distribution Hub' },
    estimatedArrival: '2024-07-03T09:00:00Z', 
    delay: 0,
    carrier: { name: 'Speed Logistics', contactInfo: '+91-22-1234567' },
    items: [{ productId: 'p4', productName: 'Sample Product 4', quantity: 12, unitPrice: 800 }],
    cost: { shippingCost: 250, totalCost: 250 },
    trackingHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

interface ShipmentTrackerProps {
  shipments?: ShipmentStatus[];
  showFilters?: boolean;
  maxItems?: number;
}

export const ShipmentTracker: React.FC<ShipmentTrackerProps> = ({ 
  shipments: propsShipments, 
  showFilters = false,
  maxItems = 10 
}) => {
  const [shipments, setShipments] = useState<ShipmentStatus[]>(propsShipments || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentStatus | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch shipments from API if not provided as props
  useEffect(() => {
    if (!propsShipments) {
      fetchActiveShipments();
    }
  }, [propsShipments]);

  const fetchActiveShipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.getActiveShipments(maxItems);
      
      if (result.success) {
        setShipments(result.data || []);
      } else {
        // Fallback to mock data when API fails
        console.warn('API failed, using mock data:', result.message);
        setShipments(mockShipments);
      }
    } catch (error) {
      console.error('Error fetching shipments, using mock data:', error);
      // Fallback to mock data
      setShipments(mockShipments);
    } finally {
      setLoading(false);
    }
  };

  const refreshShipment = async (shipmentId: string) => {
    setRefreshing(true);
    try {
      const result = await apiClient.getShipmentById(shipmentId);
      
      if (result.success) {
        setShipments(prev => prev.map(s => 
          s.id === shipmentId ? (result.data as ShipmentStatus) : s
        ));
      }
    } catch (error) {
      console.error('Error refreshing shipment:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const updateShipmentStatus = async (shipmentId: string, newStatus: ShipmentStatus['status']) => {
    try {
      const result = await apiClient.updateShipmentStatus(shipmentId, newStatus);
      
      if (result.success) {
        setShipments(prev => prev.map(s => 
          s.id === shipmentId ? { ...s, status: newStatus } : s
        ));
      } else {
        console.error('Failed to update shipment status:', result.message);
      }
    } catch (error) {
      console.error('Error updating shipment status:', error);
    }
  };

  const getShipmentDetails = async (shipmentId: string) => {
    try {
      const result = await apiClient.getShipmentById(shipmentId);
      
      if (result.success) {
        setSelectedShipment(result.data as ShipmentStatus);
      }
    } catch (error) {
      console.error('Error fetching shipment details:', error);
    }
  };
  // Re-fetch when status filter changes
  useEffect(() => {
    if (!propsShipments && statusFilter) {
      fetchActiveShipments();
    }
  }, [statusFilter, propsShipments]);

  const getStatusIcon = (status: ShipmentStatus['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'delayed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      case 'processing':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'in-transit':
        return <Truck className="w-5 h-5 text-green-600" />;
      default:
        return <Truck className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: ShipmentStatus['status']) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'delayed':
        return 'text-red-600 bg-red-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'in-transit':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const filteredShipments = shipments.filter(shipment => 
    statusFilter === 'all' || shipment.status === statusFilter
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Active Shipments</h3>
        <div className="flex gap-2">
          {showFilters && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
          {!propsShipments && (
            <button
              onClick={fetchActiveShipments}
              disabled={loading}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm flex items-center gap-1"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {loading && shipments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading shipments...</div>
        ) : filteredShipments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {statusFilter === 'all' ? 'No shipments found' : `No ${statusFilter} shipments found`}
          </div>
        ) : (
          filteredShipments.map((shipment) => (
            <div key={shipment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0">
                    {getStatusIcon(shipment.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {shipment.origin.name} → {shipment.destination.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tracking: {shipment.trackingNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          ETA: {new Date(shipment.estimatedArrival).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1).replace('-', ' ')}
                        </div>
                        {shipment.delay && shipment.delay > 0 && (
                          <p className="text-sm text-red-500 mt-1">
                            Delayed by {shipment.delay} days
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => getShipmentDetails(shipment.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => refreshShipment(shipment.id)}
                    disabled={refreshing}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors disabled:opacity-50"
                    title="Refresh Status"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Shipment Details</h3>
              <button
                onClick={() => setSelectedShipment(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
                  <p className="text-sm text-gray-900">{selectedShipment.trackingNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedShipment.status)}`}>
                    {selectedShipment.status.charAt(0).toUpperCase() + selectedShipment.status.slice(1).replace('-', ' ')}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Origin</label>
                  <p className="text-sm text-gray-900">{selectedShipment.origin.name}</p>
                  <p className="text-xs text-gray-500">{selectedShipment.origin.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destination</label>
                  <p className="text-sm text-gray-900">{selectedShipment.destination.name}</p>
                  <p className="text-xs text-gray-500">{selectedShipment.destination.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Arrival</label>
                  <p className="text-sm text-gray-900">{new Date(selectedShipment.estimatedArrival).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Carrier</label>
                  <p className="text-sm text-gray-900">{selectedShipment.carrier.name}</p>
                  <p className="text-xs text-gray-500">{selectedShipment.carrier.contactInfo}</p>
                </div>
              </div>
              {selectedShipment.items && selectedShipment.items.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                  <div className="border rounded">
                    {selectedShipment.items.map((item, index) => (
                      <div key={index} className="p-3 border-b last:border-b-0 flex justify-between">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <p className="text-sm">${item.unitPrice}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};