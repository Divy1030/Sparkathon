import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface RouteData {
  distance: number;
  duration: number;
  coordinates?: number[][];
  waypoints?: Array<{
    position: number[];
    name: string;
    type: 'start' | 'end' | 'waypoint';
  }>;
}

interface LightMapProps {
  routeData: RouteData | null;
  isLoading?: boolean;
}

const LightMap: React.FC<LightMapProps> = ({ routeData, isLoading }) => {
  const mapRef = useRef<L.Map | null>(null);

  // Convert coordinates to LatLng format (swap lng/lat to lat/lng)
  const getLatLngCoordinates = (coords: number[][]): LatLngTuple[] => {
    if (!coords || !Array.isArray(coords)) {
      return [];
    }
    
    try {
      return coords
        .filter(coord => Array.isArray(coord) && coord.length >= 2)
        .map(([lng, lat]) => [lat, lng] as LatLngTuple);
    } catch (error) {
      console.error('Error converting coordinates:', error);
      return [];
    }
  };

  // Calculate center and bounds for the route
  const getMapBounds = () => {
    if (!routeData?.coordinates || !Array.isArray(routeData.coordinates) || routeData.coordinates.length === 0) {
      return {
        center: [20.5937, 78.9629] as LatLngTuple, // Center of India
        zoom: 5
      };
    }

    try {
      const latLngCoords = getLatLngCoordinates(routeData.coordinates);
      if (latLngCoords.length === 0) {
        return {
          center: [20.5937, 78.9629] as LatLngTuple,
          zoom: 5
        };
      }

      const lats = latLngCoords.map(coord => coord[0]);
      const lngs = latLngCoords.map(coord => coord[1]);

      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

      return {
        center: [centerLat, centerLng] as LatLngTuple,
        zoom: 6
      };
    } catch (error) {
      console.error('Error calculating map bounds:', error);
      return {
        center: [20.5937, 78.9629] as LatLngTuple,
        zoom: 5
      };
    }
  };

  const { center, zoom } = getMapBounds();

  useEffect(() => {
    if (mapRef.current && routeData?.coordinates && Array.isArray(routeData.coordinates)) {
      try {
        const map = mapRef.current;
        const latLngCoords = getLatLngCoordinates(routeData.coordinates);
        
        // Fit bounds to show the entire route
        if (latLngCoords.length > 1) {
          const bounds = L.latLngBounds(latLngCoords);
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch (error) {
        console.error('Error fitting map bounds:', error);
      }
    }
  }, [routeData]);

  if (isLoading) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Calculating route...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={false}
        doubleClickZoom={true}
        touchZoom={true}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={18}
        />
        
        {/* Route polyline */}
        {routeData?.coordinates && Array.isArray(routeData.coordinates) && routeData.coordinates.length > 1 && (
          <Polyline
            positions={getLatLngCoordinates(routeData.coordinates)}
            color="#3B82F6"
            weight={4}
            opacity={0.8}
            smoothFactor={1}
          />
        )}
        
        {/* Waypoint markers */}
        {routeData?.waypoints && Array.isArray(routeData.waypoints) && routeData.waypoints.map((waypoint, index) => {
          if (!waypoint.position || !Array.isArray(waypoint.position) || waypoint.position.length < 2) {
            return null;
          }
          
          const [lng, lat] = waypoint.position;
          const markerColor = waypoint.type === 'start' ? '#10B981' : 
                            waypoint.type === 'end' ? '#EF4444' : '#F59E0B';
          
          return (
            <Marker
              key={index}
              position={[lat, lng]}
              icon={L.divIcon({
                html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                className: 'custom-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">{waypoint.name || 'Location'}</p>
                  <p className="text-sm text-gray-600 capitalize">{waypoint.type} point</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Default message when no route data */}
        {!routeData && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-[1000]">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Enter locations above to see optimized routes</p>
              <p className="text-sm">Routes will be displayed on this map</p>
            </div>
          </div>
        )}
      </MapContainer>
    </div>
  );
};

export default LightMap;
