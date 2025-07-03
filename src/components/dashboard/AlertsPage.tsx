import React, { useState, useEffect } from 'react';
import { AlertTriangle, Filter, CheckCircle } from 'lucide-react';
import { Alert } from '../../types';

// Mock data fallback
const mockAlerts: Alert[] = [
  { 
    id: 1, 
    type: 'critical', 
    category: 'warehouse',
    title: 'Warehouse Capacity Exceeded',
    message: 'Warehouse capacity exceeded in Delhi DC', 
    severity: 5,
    source: { entityType: 'warehouse', entityId: '1', entityName: 'Delhi DC' },
    resolved: false,
    actionRequired: true,
    dismissible: true,
    timestamp: '2 hours ago',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  { 
    id: 2, 
    type: 'warning', 
    category: 'supplier',
    title: 'Supplier Delay Expected',
    message: 'Supplier delay expected for Electronics shipment', 
    severity: 3,
    source: { entityType: 'supplier', entityId: '2', entityName: 'Electronics Supplier' },
    resolved: false,
    actionRequired: true,
    dismissible: true,
    timestamp: '4 hours ago',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  { 
    id: 3, 
    type: 'info', 
    category: 'system',
    title: 'Route Optimization Available',
    message: 'New route optimization available', 
    severity: 1,
    source: { entityType: 'system' },
    resolved: false,
    actionRequired: false,
    dismissible: true,
    timestamp: '6 hours ago',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  { 
    id: 4, 
    type: 'critical', 
    category: 'inventory',
    title: 'Low Stock Alert',
    message: 'Low stock alert for Product XYZ', 
    severity: 4,
    source: { entityType: 'product', entityId: '3', entityName: 'Product XYZ' },
    resolved: true,
    actionRequired: false,
    dismissible: true,
    timestamp: '8 hours ago',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    resolvedBy: 'admin',
    resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    resolutionNotes: 'Restocked product'
  },
  { 
    id: 5, 
    type: 'warning', 
    category: 'shipment',
    title: 'Weather Delay Expected',
    message: 'Weather delay expected in Chennai route', 
    severity: 2,
    source: { entityType: 'shipment', entityId: '4', entityName: 'Chennai Route' },
    resolved: true,
    actionRequired: false,
    dismissible: true,
    timestamp: '1 day ago',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    resolvedBy: 'admin',
    resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    resolutionNotes: 'Alternative route selected'
  },
];

interface AlertsPageProps {
  cardClass: string;
  alerts?: Alert[];
  resolveAlert?: (alertId: number) => void;
}

const AlertsPage: React.FC<AlertsPageProps> = ({ cardClass, alerts: propsAlerts, resolveAlert: propsResolveAlert }) => {
  const [alerts, setAlerts] = useState<Alert[]>(propsAlerts || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch alerts from API if not provided as props
  useEffect(() => {
    if (!propsAlerts) {
      fetchAlerts();
    }
  }, [propsAlerts]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/alert?limit=50');
      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.data || []);
      } else {
        // Fallback to mock data when API fails
        console.warn('API failed, using mock data:', data.message);
        setAlerts(mockAlerts);
      }
    } catch (error) {
      console.error('Error fetching alerts, using mock data:', error);
      // Fallback to mock data
      setAlerts(mockAlerts);
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

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ));
      } else {
        console.error('Failed to resolve alert:', data.message);
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unresolvedAlerts = alerts.filter(a => !a.resolved);
      const alertIds = unresolvedAlerts.map(a => a.id);
      
      if (alertIds.length === 0) return;

      const response = await fetch('/api/alert/bulk-resolve', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertIds, resolvedBy: 'user' }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setAlerts(prev => prev.map(alert => ({ ...alert, resolved: true })));
      } else {
        console.error('Failed to mark all as read:', data.message);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alerts & Anomalies</h1>
        <div className="flex gap-2">
          {!propsAlerts && (
            <button 
              onClick={fetchAlerts}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          )}
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            <Filter className="w-4 h-4 inline mr-2" />
            Filter
          </button>
          <button 
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {loading && alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Loading alerts...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
              <div className="text-2xl font-bold text-red-600">
                {alerts.filter(a => !a.resolved && a.type === 'critical').length}
              </div>
              <div className="text-sm text-gray-600">Critical Alerts</div>
            </div>
            <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
              <div className="text-2xl font-bold text-yellow-600">
                {alerts.filter(a => !a.resolved && a.type === 'warning').length}
              </div>
              <div className="text-sm text-gray-600">Warning Alerts</div>
            </div>
            <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
              <div className="text-2xl font-bold text-blue-600">
                {alerts.filter(a => !a.resolved && a.type === 'info').length}
              </div>
              <div className="text-sm text-gray-600">Info Alerts</div>
            </div>
            <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
              <div className="text-2xl font-bold text-green-600">
                {alerts.filter(a => a.resolved).length}
              </div>
              <div className="text-sm text-gray-600">Resolved Today</div>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
            <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
            <div className="space-y-4">
              {alerts.filter(a => !a.resolved).length === 0 ? (
                <div className="text-center py-8 text-gray-500">No active alerts</div>
              ) : (
                alerts.filter(a => !a.resolved).map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                    alert.type === 'critical' ? 'bg-red-50 border-red-500' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className={`w-5 h-5 ${
                            alert.type === 'critical' ? 'text-red-500' :
                            alert.type === 'warning' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="font-medium mb-1">{alert.message}</p>
                        <p className="text-sm text-gray-500">{alert.timestamp}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors">
                          Snooze
                        </button>
                        <button 
                          onClick={() => resolveAlert(alert.id)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
            <h3 className="text-lg font-semibold mb-4">Alert History</h3>
            <div className="space-y-3">
              {alerts.filter(a => a.resolved).length === 0 ? (
                <div className="text-center py-4 text-gray-500">No resolved alerts</div>
              ) : (
                alerts.filter(a => a.resolved).map((alert) => (
                  <div key={alert.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-700">{alert.message}</p>
                      <p className="text-sm text-gray-500">{alert.timestamp} - Resolved</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AlertsPage;
