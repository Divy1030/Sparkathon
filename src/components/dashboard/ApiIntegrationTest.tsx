import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface ApiTestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  response?: any;
  error?: string;
  responseTime?: number;
}

interface ApiIntegrationTestProps {
  cardClass: string;
}

const ApiIntegrationTest: React.FC<ApiIntegrationTestProps> = ({ cardClass }) => {
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const apiEndpoints = [
    { name: 'Warehouses', url: '/api/warehouse' },
    { name: 'Warehouse Utilization', url: '/api/warehouse/WH001/utilization' },
    { name: 'Products', url: '/api/product' },
    { name: 'Suppliers', url: '/api/supplier' },
    { name: 'Supplier Reliability', url: '/api/supplier/reliability' },
    { name: 'Supplier Ranking', url: '/api/supplier/ranking' },
    { name: 'Purchases', url: '/api/purchase' },
    { name: 'Purchase Analytics', url: '/api/purchase/analytics' },
    { name: 'Inventory', url: '/api/inventory' },
    { name: 'Shipments', url: '/api/shipment' },
    { name: 'Shipment Analytics', url: '/api/shipment/analytics' },
    { name: 'Active Shipments', url: '/api/shipment/active' },
    { name: 'Alerts', url: '/api/alert' },
    { name: 'Alert Analytics', url: '/api/alert/analytics' },
    { name: 'Defect Reports', url: '/api/defect-reports' },
    { name: 'Defect Analytics', url: '/api/defect-reports/analytics' },
  ];

  const testApi = async (endpoint: { name: string; url: string }): Promise<ApiTestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch(endpoint.url);
      const responseTime = Date.now() - startTime;
      const data = await response.json();
      
      return {
        endpoint: endpoint.name,
        status: response.ok ? 'success' : 'error',
        response: data,
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint: endpoint.name,
        status: 'error',
        responseTime,
        error: error.message || 'Network error'
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    // Initialize results with pending status
    const initialResults: ApiTestResult[] = apiEndpoints.map(endpoint => ({
      endpoint: endpoint.name,
      status: 'pending'
    }));
    setResults(initialResults);

    // Test each endpoint
    for (let i = 0; i < apiEndpoints.length; i++) {
      const endpoint = apiEndpoints[i];
      const result = await testApi(endpoint);
      
      setResults(prev => prev.map((r, index) => 
        index === i ? result : r
      ));
    }

    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const pendingCount = results.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">API Integration Test</h1>
        <button
          onClick={runAllTests}
          disabled={testing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
          {testing ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-sm text-gray-600">Successful</div>
          </div>
          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm text-center`}>
            <div className="text-2xl font-bold text-blue-600">{results.length}</div>
            <div className="text-sm text-gray-600">Total Endpoints</div>
          </div>
        </div>
      )}

      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <h3 className="text-lg font-semibold mb-4">API Endpoints Status</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {results.length === 0 && !testing && (
            <div className="text-center py-8 text-gray-500">
              Click "Run Tests" to check API integration status
            </div>
          )}
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.endpoint}</span>
                    {result.responseTime && (
                      <span className="text-xs text-gray-500">
                        ({result.responseTime}ms)
                      </span>
                    )}
                  </div>
                  {result.error && (
                    <p className="text-sm text-red-600 mb-2">{result.error}</p>
                  )}
                  {result.response && result.status === 'success' && (
                    <div className="text-xs text-gray-600">
                      <div>Status: {result.response.success ? 'Success' : 'Failed'}</div>
                      {result.response.data && (
                        <div>
                          Data: {Array.isArray(result.response.data) 
                            ? `${result.response.data.length} items` 
                            : 'Object'}
                        </div>
                      )}
                      {result.response.message && (
                        <div>Message: {result.response.message}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Integration Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>API Integration Status:</span>
              <span className={successCount === results.length && !testing ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                {testing ? 'Testing in progress...' : 
                 successCount === results.length ? 'All APIs Working' : 
                 `${successCount}/${results.length} APIs Working`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average Response Time:</span>
              <span className="font-medium">
                {results.filter(r => r.responseTime).length > 0 
                  ? `${Math.round(results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.filter(r => r.responseTime).length)}ms`
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span>Backend Connectivity:</span>
              <span className={successCount > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {successCount > 0 ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiIntegrationTest;
