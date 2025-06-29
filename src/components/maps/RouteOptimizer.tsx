import { useState } from "react";
import { MapPin, Route, Plus, Minus, Zap } from "lucide-react";

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

interface RouteOptimizerProps {
  darkMode?: boolean;
  cardClass?: string;
  onRouteCalculated?: (routeData: RouteResult | null) => void;
}

export default function RouteOptimizer({ 
  darkMode = false, 
  cardClass = "bg-white",
  onRouteCalculated 
}: RouteOptimizerProps) {
  const [locations, setLocations] = useState(["", ""]);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (index: number, value: string) => {
    const updated = [...locations];
    updated[index] = value;
    setLocations(updated);
    setError(null);
  };

  const addLocation = () => {
    if (locations.length < 10) {
      setLocations([...locations, ""]);
    }
  };

  const removeLocation = (index: number) => {
    if (locations.length > 2) {
      const updated = locations.filter((_, i) => i !== index);
      setLocations(updated);
    }
  };

  const handleSubmit = async () => {
    // Validate inputs
    const validLocations = locations.filter(loc => loc.trim() !== "");
    if (validLocations.length < 2) {
      setError("Please enter at least 2 locations");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null); // Clear previous results immediately

    try {
      const res = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations: validLocations }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      
      // Call the callback to update the map with route data
      if (onRouteCalculated) {
        onRouteCalculated(data);
      }
    } catch (err: unknown) {
      console.error("Route calculation error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to calculate route";
      setError(errorMessage);
      setResult(null);
      
      // Clear the map on error
      if (onRouteCalculated) {
        onRouteCalculated(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setLocations(["", ""]);
    setResult(null);
    setError(null);
    
    // Clear the map as well
    if (onRouteCalculated) {
      onRouteCalculated(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <div className="flex items-center gap-2 mb-4">
          <Route className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Route Optimizer</h3>
        </div>
        
        <div className="space-y-4">
          {locations.map((loc, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                {i + 1}
              </div>
              <div className="flex-1">
                <input
                  value={loc}
                  onChange={(e) => handleChange(i, e.target.value)}
                  placeholder={`${i === 0 ? 'Starting' : i === locations.length - 1 ? 'Destination' : 'Waypoint'} location`}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              {locations.length > 2 && (
                <button
                  onClick={() => removeLocation(i)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove location"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          
          {locations.length < 10 && (
            <button
              onClick={addLocation}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Waypoint
            </button>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Optimize Route
              </>
            )}
          </button>
          
          <button
            onClick={clearForm}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold">Route Results</h3>
            {result.success && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                Optimized
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(result.distance / 1000).toFixed(1)} km
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Distance</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.floor(result.duration / 60)} min
              </div>
              <div className="text-sm text-gray-600 mt-1">Optimized Time</div>
            </div>
            
            {result.estimatedTime && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.floor(result.estimatedTime / 60)} min
                </div>
                <div className="text-sm text-gray-600 mt-1">Estimated Time</div>
              </div>
            )}
            
            {result.timeSavings && (
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {result.timeSavings}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Time Savings</div>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Speed:</span>
              <span className="font-medium">
                {((result.distance / 1000) / (result.duration / 3600)).toFixed(1)} km/h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fuel Efficiency:</span>
              <span className="font-medium text-green-600">
                ~{((result.distance / 1000) * 0.08).toFixed(1)}L
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Cost:</span>
              <span className="font-medium">
                ${((result.distance / 1000) * 0.15).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CO₂ Emissions:</span>
              <span className="font-medium">
                {((result.distance / 1000) * 0.12).toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
