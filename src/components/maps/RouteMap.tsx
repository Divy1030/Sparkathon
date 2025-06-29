'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { LatLngExpression, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });

interface RouteMapProps {
  routes?: RouteData[];
  warehouses?: Warehouse[];
  showTraffic?: boolean;
  showWarehouses?: boolean;
  className?: string;
}

interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  optimizedTime?: number;
  estimatedTime?: number;
  type: 'optimized' | 'original' | 'alternative';
}

interface Warehouse {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  stock: Record<string, number>;
  load: number;
  droneReady: boolean;
  efficiency: number;
}

// Custom icons
const createCustomIcon = (color: string, type: 'start' | 'end' | 'waypoint' | 'warehouse') => {
  const iconUrls = {
    start: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
        <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">S</text>
      </svg>
    `),
    end: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
        <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">E</text>
      </svg>
    `),
    waypoint: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
        <circle cx="12" cy="12" r="6" fill="${color}" stroke="white" stroke-width="2"/>
      </svg>
    `),
    warehouse: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
        <rect x="4" y="8" width="16" height="12" fill="${color}" stroke="white" stroke-width="2"/>
        <polygon points="4,8 12,4 20,8" fill="${color}" stroke="white" stroke-width="1"/>
      </svg>
    `)
  };

  return new Icon({
    iconUrl: iconUrls[type],
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export default function RouteMap({ 
  routes = [], 
  warehouses = [], 
  showTraffic = false, 
  showWarehouses = true,
  className = "" 
}: RouteMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`h-96 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  // Calculate map center based on routes or default to India
  const getMapCenter = (): LatLngExpression => {
    if (routes.length > 0 && routes[0].coordinates.length > 0) {
      const coords = routes[0].coordinates;
      const centerLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
      const centerLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
      return [centerLat, centerLng];
    }
    return [20.5937, 78.9629]; // Center of India
  };

  const getMapZoom = (): number => {
    if (routes.length > 0 && routes[0].coordinates.length > 0) {
      return 6; // Zoom level for route view
    }
    return 5; // Default zoom for India
  };

  const routeColors = {
    optimized: '#10B981', // Green
    original: '#EF4444',  // Red
    alternative: '#F59E0B' // Yellow
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={getMapCenter()}
        zoom={getMapZoom()}
        className="h-full w-full rounded-lg"
        zoomControl={true}
      >
        {/* Base map layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Traffic layer (if available) */}
        {showTraffic && (
          <TileLayer
            url="https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=YOUR_THUNDERFOREST_API_KEY"
            attribution='&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>'
            opacity={0.7}
          />
        )}

        {/* Warehouse markers */}
        {showWarehouses && warehouses.map((warehouse) => (
          <Marker
            key={warehouse.id}
            position={[warehouse.location.lat, warehouse.location.lng]}
            icon={createCustomIcon(
              warehouse.load > 80 ? '#EF4444' : warehouse.load > 60 ? '#F59E0B' : '#10B981',
              'warehouse'
            )}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-semibold">{warehouse.name}</h3>
                <p>Load: {warehouse.load}%</p>
                <p>Efficiency: {warehouse.efficiency}%</p>
                <p>Drone Ready: {warehouse.droneReady ? 'Yes' : 'No'}</p>
                <div className="mt-2">
                  <p className="text-xs font-medium">Stock:</p>
                  {Object.entries(warehouse.stock).map(([item, count]) => (
                    <p key={item} className="text-xs">
                      {item}: {count}
                    </p>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route polylines */}
        {routes.map((route, index) => (
          <div key={index}>
            <Polyline
              positions={route.coordinates.map(coord => [coord[1], coord[0]] as LatLngExpression)}
              color={routeColors[route.type]}
              weight={route.type === 'optimized' ? 5 : 3}
              opacity={route.type === 'optimized' ? 0.9 : 0.7}
              dashArray={route.type === 'alternative' ? '10, 10' : undefined}
            />
            
            {/* Start marker */}
            {route.coordinates.length > 0 && (
              <Marker
                position={[route.coordinates[0][1], route.coordinates[0][0]]}
                icon={createCustomIcon('#3B82F6', 'start')}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-semibold">Start Point</h3>
                    <p>Route: {route.type}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* End marker */}
            {route.coordinates.length > 1 && (
              <Marker
                position={[
                  route.coordinates[route.coordinates.length - 1][1],
                  route.coordinates[route.coordinates.length - 1][0]
                ]}
                icon={createCustomIcon('#DC2626', 'end')}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-semibold">Destination</h3>
                    <p>Route: {route.type}</p>
                    <p>Distance: {(route.distance / 1000).toFixed(1)} km</p>
                    <p>Duration: {Math.floor(route.duration / 60)} min</p>
                    {route.optimizedTime && (
                      <p>Optimized: {Math.floor(route.optimizedTime / 60)} min</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Waypoint markers */}
            {route.coordinates.slice(1, -1).map((coord, waypointIndex) => (
              <Marker
                key={waypointIndex}
                position={[coord[1], coord[0]]}
                icon={createCustomIcon('#8B5CF6', 'waypoint')}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-semibold">Waypoint {waypointIndex + 1}</h3>
                    <p>Route: {route.type}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </div>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg text-xs">
        <h4 className="font-semibold mb-2">Map Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-green-500"></div>
            <span>Optimized Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-red-500"></div>
            <span>Original Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-yellow-500 border-dashed border border-yellow-600"></div>
            <span>Alternative Route</span>
          </div>
          {showWarehouses && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500"></div>
                <span>Available Warehouse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500"></div>
                <span>Busy Warehouse</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
