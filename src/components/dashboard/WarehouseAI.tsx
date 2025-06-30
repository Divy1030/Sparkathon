import React, { useState } from 'react';
import { ProductCategory, CustomerLocation, WarehouseSelectionResult, EnhancedWarehouseScore, RouteCalculation } from '../../types';
import { mockWarehouses, mockCustomerLocations } from '../../data/mockData';
import { MapPin, Package, Clock, AlertTriangle, CheckCircle, Truck, Navigation, Zap, Target } from 'lucide-react';
import WarehouseLocationRecommendations from './WarehouseLocationRecommendations';

interface WarehouseAIProps {
  cardClass: string;
}

const WarehouseAI: React.FC<WarehouseAIProps> = ({ cardClass }) => {
  const [customerLocation, setCustomerLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('electronics');
  const [quantity, setQuantity] = useState(1);
  const [selectionResult, setSelectionResult] = useState<WarehouseSelectionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [useOpenRouteService, setUseOpenRouteService] = useState(false);
  const [activeTab, setActiveTab] = useState<'selection' | 'recommendations'>('selection');

  // Enhanced Haversine formula with better accuracy
  const calculateHaversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };

  // OpenRouteService API integration
  const calculateRouteWithOpenRouteService = async (
    warehouseLat: number, 
    warehouseLng: number, 
    customerLat: number, 
    customerLng: number
  ): Promise<RouteCalculation> => {
    try {
      // Note: You'll need to get a free API key from openrouteservice.org
      const API_KEY = '5b3ce3597851110001cf62484f6e4c0b9b5a4e5dbcdb409991d98c2e'; // Replace with your actual API key
      
      const response = await fetch('https://api.openrouteservice.org/v2/matrix/driving-car', {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          locations: [[warehouseLng, warehouseLat], [customerLng, customerLat]],
          metrics: ['distance', 'duration']
        })
      });

      if (!response.ok) {
        throw new Error('OpenRouteService API failed');
      }

      const data = await response.json();
      const distance = data.distances[0][1]; // in meters
      const duration = data.durations[0][1]; // in seconds

      return {
        distance,
        duration,
        distanceKm: distance / 1000,
        durationMinutes: duration / 60
      };
    } catch (error) {
      console.warn('OpenRouteService failed, falling back to Haversine:', error);
      // Fallback to Haversine with estimated time
      const distanceKm = calculateHaversineDistance(warehouseLat, warehouseLng, customerLat, customerLng);
      return {
        distance: distanceKm * 1000,
        duration: (distanceKm / 40) * 3600, // Assuming 40 km/h average speed
        distanceKm,
        durationMinutes: (distanceKm / 40) * 60
      };
    }
  };

  // Enhanced warehouse selection algorithm with better scoring
  const getBestWarehouse = async (customer: CustomerLocation): Promise<WarehouseSelectionResult> => {
    // Step 1: Filter warehouses with required category and check stock
    const availableWarehouses = mockWarehouses.filter(w => 
      w.stock[customer.demandedCategory] > 0
    );

    if (availableWarehouses.length === 0) {
      return {
        status: 'unavailable',
        alternatives: [],
        message: `No warehouse has ${customer.demandedCategory} in stock`,
        fallbackSuggestions: [
          'Check alternative product categories',
          'Wait for restocking from suppliers',
          'Consider emergency procurement'
        ]
      };
    }

    // Step 2: Calculate enhanced scores for each warehouse
    const warehousesWithScores: EnhancedWarehouseScore[] = await Promise.all(
      availableWarehouses.map(async (warehouse) => {
        // Calculate route information
        const routeCalc = useOpenRouteService 
          ? await calculateRouteWithOpenRouteService(
              warehouse.location.lat, 
              warehouse.location.lng, 
              customer.lat, 
              customer.lng
            )
          : {
              distanceKm: calculateHaversineDistance(
                warehouse.location.lat, 
                warehouse.location.lng, 
                customer.lat, 
                customer.lng
              ),
              durationMinutes: 0,
              distance: 0,
              duration: 0
            };

        // Enhanced scoring algorithm
        const availableStock = warehouse.stock[customer.demandedCategory];
        const availabilityRatio = availableStock / customer.quantity;
        
        // Distance score (0-100): Closer = higher score
        const maxReasonableDistance = 2000; // 2000 km max
        const proximityScore = Math.max(0, 100 - (routeCalc.distanceKm / maxReasonableDistance) * 100);
        
        // Stock availability score (0-100)
        const stockScore = availabilityRatio >= 1 
          ? Math.min(100, 50 + (availabilityRatio - 1) * 10) // Bonus for excess stock
          : availabilityRatio * 50; // Penalty for insufficient stock
        
        // Load capacity score (0-100): Lower load = higher score
        const loadScore = Math.max(0, 100 - warehouse.load);
        
        // Efficiency score (already 0-100)
        const efficiencyScore = warehouse.efficiency;
        
        // Drone readiness bonus
        const droneBonus = warehouse.droneReady ? 10 : 0;
        
        // Final weighted score with improved weights
        const finalScore = (
          proximityScore * 0.35 +      // 35% weight on proximity
          stockScore * 0.30 +          // 30% weight on stock availability
          efficiencyScore * 0.20 +     // 20% weight on efficiency
          loadScore * 0.15             // 15% weight on current load
        ) + droneBonus;

        return {
          ...warehouse,
          distance: routeCalc.distanceKm,
          estimatedTime: Math.round(routeCalc.durationMinutes || (routeCalc.distanceKm / 40) * 60),
          distanceScore: proximityScore,
          stockScore,
          loadScore,
          totalScore: finalScore,
          routeCalculation: routeCalc,
          availabilityRatio,
          proximityScore,
          finalScore
        };
      })
    );

    // Step 3: Sort by final score and check if we have sufficient stock
    warehousesWithScores.sort((a, b) => b.finalScore - a.finalScore);
    
    const sufficientStockWarehouses = warehousesWithScores.filter(w => 
      w.availabilityRatio >= 1
    );

    if (sufficientStockWarehouses.length > 0) {
      const bestWarehouse = sufficientStockWarehouses[0];
      return {
        status: 'ok',
        warehouse: bestWarehouse,
        alternatives: sufficientStockWarehouses.slice(1, 4),
        message: `✅ Perfect match found! ${bestWarehouse.name} has ${bestWarehouse.stock[customer.demandedCategory]} units available (${bestWarehouse.distance?.toFixed(1)} km away)`
      };
    } else {
      // No warehouse has sufficient stock, but show best alternatives
      const bestPartialWarehouse = warehousesWithScores[0];
      return {
        status: 'partial',
        warehouse: bestPartialWarehouse,
        alternatives: warehousesWithScores.slice(1, 4),
        message: `⚠️ Partial fulfillment: ${bestPartialWarehouse.name} has ${bestPartialWarehouse.stock[customer.demandedCategory]} units (need ${customer.quantity})`,
        fallbackSuggestions: [
          `Split order: Get ${bestPartialWarehouse.stock[customer.demandedCategory]} from ${bestPartialWarehouse.name}`,
          'Check remaining quantity from alternative warehouses',
          'Reduce order quantity to available stock'
        ]
      };
    }
  };

  // Smart location parser to find customer coordinates
  const parseCustomerLocation = (locationInput: string): CustomerLocation => {
    const foundLocation = mockCustomerLocations.find(loc => 
      loc.address.toLowerCase().includes(locationInput.toLowerCase()) ||
      locationInput.toLowerCase().includes(loc.address.toLowerCase().split(',')[0])
    );

    if (foundLocation) {
      return {
        ...foundLocation,
        demandedCategory: selectedCategory,
        quantity: quantity
      };
    }

    // Smart defaults based on common Indian cities
    const cityDefaults: { [key: string]: { lat: number, lng: number } } = {
      'delhi': { lat: 28.6139, lng: 77.2090 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'ahmedabad': { lat: 23.0225, lng: 72.5714 }
    };

    const cityKey = Object.keys(cityDefaults).find(city => 
      locationInput.toLowerCase().includes(city)
    );

    const coords = cityKey ? cityDefaults[cityKey] : { lat: 28.5355, lng: 77.3910 }; // Default to Noida

    return {
      address: locationInput,
      lat: coords.lat,
      lng: coords.lng,
      demandedCategory: selectedCategory,
      quantity: quantity
    };
  };

  const handleCalculateRecommendation = async () => {
    if (!customerLocation.trim()) {
      alert('Please enter customer location');
      return;
    }

    setIsCalculating(true);
    
    try {
      const customer = parseCustomerLocation(customerLocation);
      const result = await getBestWarehouse(customer);
      setSelectionResult(result);
    } catch (error) {
      console.error('Error calculating recommendation:', error);
      setSelectionResult({
        status: 'unavailable',
        alternatives: [],
        message: 'Error calculating recommendation. Please try again.',
        fallbackSuggestions: ['Check your internet connection', 'Try a different location']
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Warehouse Selector AI</h1>
        <div className="flex items-center gap-2 text-blue-600">
          <Truck className="w-5 h-5" />
          <span className="text-sm font-medium">Smart Location Matching</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('selection')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'selection'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Package className="w-4 h-4" />
            Warehouse Selection
          </div>
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'recommendations'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Target className="w-4 h-4" />
            New Location AI
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'selection' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Input Section */}
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Customer Location</label>
              <input
                type="text"
                value={customerLocation}
                onChange={(e) => setCustomerLocation(e.target.value)}
                placeholder="e.g., Noida, Gurgaon, Pune, Coimbatore..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Try: Noida, Gurgaon, Pune, Coimbatore, or Siliguri
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Product Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ProductCategory)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="food">Food</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Use OpenRouteService API</span>
                <span className="text-xs text-gray-500">(More accurate routes)</span>
              </div>
              <button
                onClick={() => setUseOpenRouteService(!useOpenRouteService)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  useOpenRouteService ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useOpenRouteService ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <button
              onClick={handleCalculateRecommendation}
              disabled={isCalculating}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:bg-blue-300 flex items-center justify-center gap-2"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {useOpenRouteService ? 'Calculating with GPS...' : 'Calculating...'}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Get AI Recommendation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {selectionResult && (
          <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {selectionResult.status === 'ok' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : selectionResult.status === 'partial' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              Recommendation Result
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">{selectionResult.message}</p>
            </div>
            
            {(selectionResult.status === 'ok' || selectionResult.status === 'partial') && selectionResult.warehouse && (
              <div className="space-y-4">
                <div className={`p-4 border rounded-lg ${
                  selectionResult.status === 'ok' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <h4 className={`font-semibold flex items-center gap-2 ${
                    selectionResult.status === 'ok' ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    <MapPin className="w-4 h-4" />
                    {selectionResult.warehouse.name}
                  </h4>
                  <p className={`${selectionResult.status === 'ok' ? 'text-green-700' : 'text-yellow-700'}`}>
                    ID: {selectionResult.warehouse.id}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div>
                      <span className={`${selectionResult.status === 'ok' ? 'text-green-600' : 'text-yellow-600'}`}>Distance:</span>
                      <span className="font-semibold ml-1">{selectionResult.warehouse.distance?.toFixed(1)} km</span>
                    </div>
                    <div>
                      <span className={`${selectionResult.status === 'ok' ? 'text-green-600' : 'text-yellow-600'}`}>Est. Time:</span>
                      <span className="font-semibold ml-1">{selectionResult.warehouse.estimatedTime} mins</span>
                    </div>
                  </div>
                  
                  {useOpenRouteService && selectionResult.warehouse.routeCalculation && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                      <span className="text-blue-600 font-medium">🛰️ GPS-calculated route</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>AI Final Score:</span>
                    <span className="font-semibold text-blue-600">
                      {selectionResult.warehouse.finalScore?.toFixed(1) || selectionResult.warehouse.totalScore?.toFixed(1)}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stock Available:</span>
                    <span className={`font-semibold ${
                      selectionResult.warehouse.stock[selectedCategory] >= quantity ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectionResult.warehouse.stock[selectedCategory]} units
                      {selectionResult.warehouse.availabilityRatio && (
                        <span className="text-gray-500 ml-1">
                          ({(selectionResult.warehouse.availabilityRatio * 100).toFixed(0)}% of needed)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Warehouse Load:</span>
                    <span className={`font-semibold ${
                      selectionResult.warehouse.load < 70 ? 'text-green-600' : 
                      selectionResult.warehouse.load < 85 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectionResult.warehouse.load}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efficiency:</span>
                    <span className="font-semibold text-blue-600">{selectionResult.warehouse.efficiency}%</span>
                  </div>
                  {selectionResult.warehouse.droneReady && (
                    <div className="flex justify-between">
                      <span>Drone Delivery:</span>
                      <span className="font-semibold text-green-600">Available ✈️</span>
                    </div>
                  )}
                </div>

                {/* Detailed Score Breakdown */}
                {selectionResult.warehouse.proximityScore !== undefined && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-700 mb-2">Score Breakdown:</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Proximity (35%):</span>
                        <span>{selectionResult.warehouse.proximityScore?.toFixed(1)}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stock Availability (30%):</span>
                        <span>{selectionResult.warehouse.stockScore?.toFixed(1)}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency (20%):</span>
                        <span>{selectionResult.warehouse.efficiency}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Load Capacity (15%):</span>
                        <span>{selectionResult.warehouse.loadScore?.toFixed(1)}/100</span>
                      </div>
                      {selectionResult.warehouse.droneReady && (
                        <div className="flex justify-between text-green-600">
                          <span>Drone Bonus:</span>
                          <span>+10</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectionResult.status === 'unavailable' && (
              <div className="space-y-4">
                {selectionResult.fallbackSuggestions && (
                  <div>
                    <h5 className="font-medium mb-2 text-red-700">Suggested Actions:</h5>
                    <ul className="space-y-1">
                      {selectionResult.fallbackSuggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {selectionResult.status === 'partial' && selectionResult.fallbackSuggestions && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <h5 className="font-medium mb-2 text-yellow-800">Alternative Options:</h5>
                <ul className="space-y-1">
                  {selectionResult.fallbackSuggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                      <span className="text-yellow-500">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Warehouse Status Overview */}
      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <h3 className="text-lg font-semibold mb-4">Warehouse Network Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockWarehouses.map((warehouse) => (
            <div key={warehouse.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{warehouse.name}</h4>
                <span className={`px-2 py-1 rounded text-xs ${
                  warehouse.load < 70 ? 'bg-green-100 text-green-800' : 
                  warehouse.load < 85 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {warehouse.load}% Load
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Electronics:</span>
                  <span className="font-medium">{warehouse.stock.electronics}</span>
                </div>
                <div className="flex justify-between">
                  <span>Clothing:</span>
                  <span className="font-medium">{warehouse.stock.clothing}</span>
                </div>
                <div className="flex justify-between">
                  <span>Food:</span>
                  <span className="font-medium">{warehouse.stock.food}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Drone Ready:</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    warehouse.droneReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {warehouse.droneReady ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distance Matrix (if result exists) */}
      {selectionResult && selectionResult.alternatives && selectionResult.alternatives.length > 0 && (
        <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Alternative Warehouses</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Warehouse</th>
                  <th className="text-left p-3">Distance</th>
                  <th className="text-left p-3">Est. Time</th>
                  <th className="text-left p-3">Stock ({selectedCategory})</th>
                  <th className="text-left p-3">AI Score</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {selectionResult.alternatives.map((warehouse) => (
                  <tr key={warehouse.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{warehouse.name}</td>
                    <td className="p-3">{warehouse.distance?.toFixed(1)} km</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {warehouse.estimatedTime} mins
                      </div>
                    </td>
                    <td className="p-3">{warehouse.stock[selectedCategory]}</td>
                    <td className="p-3">{warehouse.totalScore.toFixed(1)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        warehouse.stock[selectedCategory] >= quantity ? 
                        'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {warehouse.stock[selectedCategory] >= quantity ? 'Available' : 'Insufficient Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      ) : (
        <WarehouseLocationRecommendations cardClass={cardClass} />
      )}
    </div>
  );
};

export default WarehouseAI;
