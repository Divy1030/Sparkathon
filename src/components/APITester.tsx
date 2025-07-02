import React, { useState } from 'react';

const APITester = () => {
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<any>(null);

  const testWarehouseAPI = async () => {
    setStatus('Testing warehouse API...');
    try {
      const response = await fetch('/api/warehouse?status=active&limit=5');
      const data = await response.json();
      setStatus('✅ Warehouse API successful!');
      setResult(data);
    } catch (error) {
      setStatus('❌ Warehouse API failed');
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testPurchaseAPI = async () => {
    setStatus('Testing purchase API...');
    try {
      const response = await fetch('/api/purchase?limit=5');
      const data = await response.json();
      setStatus('✅ Purchase API successful!');
      setResult(data);
    } catch (error) {
      setStatus('❌ Purchase API failed');
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testCreateWarehouse = async () => {
    setStatus('Testing create warehouse...');
    try {
      const warehouseData = {
        name: 'Test Warehouse',
        location: {
          address: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          coordinates: { lat: 19.0760, lng: 72.8777 }
        },
        capacity: 1000,
        manager: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+91-9876543210'
        }
      };

      const response = await fetch('/api/warehouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouseData),
      });
      const data = await response.json();
      setStatus('✅ Create warehouse successful!');
      setResult(data);
    } catch (error) {
      setStatus('❌ Create warehouse failed');
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">API Connection Tester</h2>
      
      <div className="space-x-2 mb-4">
        <button 
          onClick={testWarehouseAPI}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Warehouse API
        </button>
        
        <button 
          onClick={testPurchaseAPI}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Purchase API
        </button>
        
        <button 
          onClick={testCreateWarehouse}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Test Create Warehouse
        </button>
      </div>
      
      {status && (
        <div className="mt-4">
          <p className="font-semibold">{status}</p>
          {result && (
            <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Backend URL: {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
        <p>These tests will verify that your backend is running and the APIs are working correctly.</p>
        <p>Make sure your backend server is running on the configured URL.</p>
      </div>
    </div>
  );
};

export default APITester;
