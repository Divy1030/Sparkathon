import React, { useState, useEffect } from 'react';
import { ShipmentStatus } from '../../types';
import { Truck, CheckCircle, AlertCircle } from 'lucide-react';

// Mock data fallback
const mockShipments: ShipmentStatus[] = [
  { id: '1', status: 'in-transit', origin: 'Delhi DC', destination: 'Mumbai', estimatedArrival: '2024-07-05T10:00:00Z', delay: 0 },
  { id: '2', status: 'delayed', origin: 'Chennai Hub', destination: 'Bangalore', estimatedArrival: '2024-07-04T15:00:00Z', delay: 2 },
  { id: '3', status: 'processing', origin: 'Kolkata Center', destination: 'Hyderabad', estimatedArrival: '2024-07-06T12:00:00Z', delay: 0 },
  { id: '4', status: 'delivered', origin: 'Mumbai Port', destination: 'Pune', estimatedArrival: '2024-07-03T09:00:00Z', delay: 0 },
];

interface ShipmentTrackerProps {
  shipments?: ShipmentStatus[];
}

export const ShipmentTracker: React.FC<ShipmentTrackerProps> = ({ shipments: propsShipments }) => {
  const [shipments, setShipments] = useState<ShipmentStatus[]>(propsShipments || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const response = await fetch('/api/shipment/active?limit=10');
      const data = await response.json();
      
      if (data.success) {
        setShipments(data.data || []);
      } else {
        // Fallback to mock data when API fails
        console.warn('API failed, using mock data:', data.message);
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
  const getStatusIcon = (status: ShipmentStatus['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="text-green-500" />;
      case 'delayed':
        return <AlertCircle className="text-red-500" />;
      default:
        return <Truck className="text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Active Shipments</h3>
        {!propsShipments && (
          <button
            onClick={fetchActiveShipments}
            disabled={loading}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {loading && shipments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading shipments...</div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No active shipments found</div>
        ) : (
          shipments.map((shipment) => (
            <div key={shipment.id} className="flex items-center p-4 border rounded-lg">
              <div className="mr-4">
                {getStatusIcon(shipment.status)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {shipment.origin} → {shipment.destination}
                    </p>
                    <p className="text-sm text-gray-500">
                      ETA: {new Date(shipment.estimatedArrival).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${
                    shipment.status === 'delayed' ? 'text-red-500' : 
                    shipment.status === 'delivered' ? 'text-green-500' : 'text-blue-500'
                  }`}>
                    {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                  </div>
                </div>
                {shipment.delay && shipment.delay > 0 ? (
                  <p className="text-sm text-red-500 mt-1">
                    Delayed by {shipment.delay} days
                  </p>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};