import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from 'recharts';
import RouteOptimizer from '../maps/RouteOptimizer';
import dynamic from 'next/dynamic';

interface RouteResult {
  distance: number;
  duration: number;
  estimatedTime?: number;
  optimizedTime?: number;
  timeSavings?: string;
  coordinates?: number[][];
  waypoints?: Array<{
    position: number[];
    name: string;
    type: 'start' | 'end' | 'waypoint';
  }>;
  success?: boolean;
}

// Dynamically import the map component to avoid SSR issues
const LightMap = dynamic(() => import('../maps/LightMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
});

interface MapSimulationProps {
  cardClass: string;
  darkMode: boolean;
}

const MapSimulation: React.FC<MapSimulationProps> = ({ cardClass, darkMode }) => {
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showWarehouses, setShowWarehouses] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  const handleRouteCalculated = (data: RouteResult | null) => {
    console.log('Route calculated:', data);
    setRouteData(data);
    setIsCalculating(false);
    if (data) {
      setShowRoutes(true);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Map Simulation & Route Optimization</h1>
      
      {/* Route Optimizer Section */}
      <RouteOptimizer 
        darkMode={darkMode} 
        cardClass={cardClass} 
        onRouteCalculated={handleRouteCalculated}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
            <h3 className="text-lg font-semibold mb-4">Interactive Route Map</h3>
            <LightMap 
              routeData={routeData} 
              isLoading={isCalculating}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
            <h3 className="text-lg font-semibold mb-4">Map Controls</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowWarehouses(!showWarehouses)}
                className={`w-full px-4 py-2 rounded transition-colors ${
                  showWarehouses 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showWarehouses ? 'Hide' : 'Show'} Warehouses
              </button>
              <button 
                onClick={() => setShowRoutes(!showRoutes)}
                className={`w-full px-4 py-2 rounded transition-colors ${
                  showRoutes 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showRoutes ? 'Hide' : 'Show'} Routes
              </button>
              <button 
                onClick={() => setShowTraffic(!showTraffic)}
                className={`w-full px-4 py-2 rounded transition-colors ${
                  showTraffic 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showTraffic ? 'Hide' : 'Show'} Traffic Data
              </button>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
            <h3 className="text-lg font-semibold mb-4">Live Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Active Routes:</span>
                <span className="font-semibold">{routeData ? 1 : 127}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Vehicles:</span>
                <span className="font-semibold">84</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Delivery Time:</span>
                <span className="font-semibold">
                  {routeData?.duration 
                    ? `${Math.floor(routeData.duration / 60)} min`
                    : '42 min'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-semibold text-green-600">96.8%</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
            <h3 className="text-lg font-semibold mb-4">Route Analytics</h3>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {routeData?.timeSavings ? routeData.timeSavings : '15%'}
                </div>
                <div className="text-xs text-gray-600">Time Savings</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  $2,840
                </div>
                <div className="text-xs text-gray-600">Fuel Cost Saved</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {routeData?.distance ? `${(routeData.distance / 1000).toFixed(0)} km` : '284 km'}
                </div>
                <div className="text-xs text-gray-600">Total Distance</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Delivery Zone Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={[
              { x: 28.7, y: 77.1, cluster: 'North', deliveries: 45 },
              { x: 28.6, y: 77.2, cluster: 'North', deliveries: 38 },
              { x: 19.0, y: 72.8, cluster: 'West', deliveries: 52 },
              { x: 19.1, y: 72.9, cluster: 'West', deliveries: 41 },
              { x: 12.9, y: 77.5, cluster: 'South', deliveries: 33 },
              { x: 13.0, y: 77.6, cluster: 'South', deliveries: 29 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="Latitude" />
              <YAxis dataKey="y" name="Longitude" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="North Zone" data={[{ x: 28.7, y: 77.1 }, { x: 28.6, y: 77.2 }]} fill="#3B82F6" />
              <Scatter name="West Zone" data={[{ x: 19.0, y: 72.8 }, { x: 19.1, y: 72.9 }]} fill="#10B981" />
              <Scatter name="South Zone" data={[{ x: 12.9, y: 77.5 }, { x: 13.0, y: 77.6 }]} fill="#F59E0B" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Route Efficiency Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { week: 'W1', efficiency: 85, cost: 2400 },
              { week: 'W2', efficiency: 88, cost: 2200 },
              { week: 'W3', efficiency: 92, cost: 2100 },
              { week: 'W4', efficiency: 89, cost: 2300 },
              { week: 'W5', efficiency: 94, cost: 1900 },
              { week: 'W6', efficiency: 96, cost: 1800 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="efficiency" stroke="#10B981" strokeWidth={2} name="Efficiency %" />
              <Line type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={2} name="Cost ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MapSimulation;
