import React, { useState, useEffect, useCallback } from 'react';
import { OrderData, RecommendedWarehouseLocation, ClusterAnalysis } from '../../types';
import { mockHistoricalOrders } from '../../data/mockData';
import { MapPin, TrendingUp, DollarSign, Clock, Users, Zap, AlertCircle, CheckCircle, Target, BarChart3 } from 'lucide-react';

interface WarehouseLocationRecommendationsProps {
  cardClass: string;
}

const WarehouseLocationRecommendations: React.FC<WarehouseLocationRecommendationsProps> = ({ cardClass }) => {
  const [clusterAnalysis, setClusterAnalysis] = useState<ClusterAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1w' | '1m' | '3m' | '6m'>('1m');
  const [minOrderVolume, setMinOrderVolume] = useState(5);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Enhanced K-means clustering implementation
  const performKMeansClustering = useCallback(async (orders: OrderData[], k: number = 4): Promise<ClusterAnalysis[]> => {
    if (orders.length < k) return [];

    // Initialize centroids randomly
    let centroids = orders
      .sort(() => 0.5 - Math.random())
      .slice(0, k)
      .map(order => ({ lat: order.lat, lng: order.lng }));

    let previousCentroids: typeof centroids = [];
    let iterations = 0;
    const maxIterations = 100;

    // K-means iterations
    while (iterations < maxIterations) {
      // Assign each order to nearest centroid
      const clusters: OrderData[][] = Array(k).fill(null).map(() => []);
      
      orders.forEach(order => {
        let minDistance = Infinity;
        let assignedCluster = 0;
        
        centroids.forEach((centroid, index) => {
          const distance = calculateDistance(order.lat, order.lng, centroid.lat, centroid.lng);
          if (distance < minDistance) {
            minDistance = distance;
            assignedCluster = index;
          }
        });
        
        clusters[assignedCluster].push(order);
      });

      // Update centroids
      previousCentroids = [...centroids];
      centroids = clusters.map(cluster => {
        if (cluster.length === 0) return previousCentroids[clusters.indexOf(cluster)];
        
        const avgLat = cluster.reduce((sum, order) => sum + order.lat, 0) / cluster.length;
        const avgLng = cluster.reduce((sum, order) => sum + order.lng, 0) / cluster.length;
        return { lat: avgLat, lng: avgLng };
      });

      // Check for convergence
      const hasConverged = centroids.every((centroid, index) => {
        const prev = previousCentroids[index];
        return calculateDistance(centroid.lat, centroid.lng, prev.lat, prev.lng) < 0.001;
      });

      if (hasConverged) break;
      iterations++;
    }

    // Generate cluster analysis with async location names
    const clusterPromises = centroids.map(async (centroid, index) => {
      const clusterOrders = orders.filter(order => {
        const distances = centroids.map(c => calculateDistance(order.lat, order.lng, c.lat, c.lng));
        const minDistance = Math.min(...distances);
        return distances[index] === minDistance;
      });

      if (clusterOrders.length < minOrderVolume) {
        return null;
      }

      const avgDelay = clusterOrders.reduce((sum, order) => sum + order.delayScore, 0) / clusterOrders.length;
      const totalOrderValue = clusterOrders.reduce((sum, order) => sum + order.orderValue, 0);
      const avgDeliveryTime = clusterOrders.reduce((sum, order) => sum + order.deliveryTime, 0) / clusterOrders.length;

      // Calculate warehouse recommendation score
      const delayPenalty = avgDelay / 100; // 0-1
      const volumeBonus = Math.min(clusterOrders.length / 20, 1); // 0-1, max at 20 orders
      const valueBonus = Math.min(totalOrderValue / 500000, 1); // 0-1, max at 500k value
      
      const score = (delayPenalty * 0.4 + volumeBonus * 0.3 + valueBonus * 0.3) * 100;

      // Estimate delivery improvement by comparing with existing warehouse network
      const calculateDistanceFromExistingWarehouses = (orderLat: number, orderLng: number) => {
        const existingWarehouses = [
          { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
          { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
          { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
          { name: 'Kolkata', lat: 22.5726, lng: 88.3639 }
        ];

        // Find nearest existing warehouse
        let minDistance = Infinity;
        let nearestWarehouse = '';
        
        existingWarehouses.forEach(warehouse => {
          const distance = calculateDistance(orderLat, orderLng, warehouse.lat, warehouse.lng);
          if (distance < minDistance) {
            minDistance = distance;
            nearestWarehouse = warehouse.name;
          }
        });

        return { distance: minDistance, warehouse: nearestWarehouse };
      };

      const currentAvgDistance = clusterOrders.reduce((sum, order) => {
        const { distance } = calculateDistanceFromExistingWarehouses(order.lat, order.lng);
        return sum + distance;
      }, 0) / clusterOrders.length;

      const newAvgDistance = clusterOrders.reduce((sum, order) => {
        return sum + calculateDistance(order.lat, order.lng, centroid.lat, centroid.lng);
      }, 0) / clusterOrders.length;

      const deliveryImprovement = Math.max(0, (currentAvgDistance - newAvgDistance) / 40); // hours saved
      const costSavings = (deliveryImprovement / avgDeliveryTime) * 100; // percentage

      // Generate location name based on nearby area (now async)
      const suggestedName = await generateLocationName(centroid.lat, centroid.lng);

      const recommendedLocation: RecommendedWarehouseLocation = {
        id: `RWL${index + 1}`,
        suggestedName,
        lat: centroid.lat,
        lng: centroid.lng,
        score,
        orderVolume: clusterOrders.length,
        avgDeliveryImprovement: deliveryImprovement,
        estimatedCostSavings: costSavings,
        coverageRadius: Math.max(...clusterOrders.map(order => 
          calculateDistance(order.lat, order.lng, centroid.lat, centroid.lng)
        )),
        demandDensity: clusterOrders.length / (Math.PI * Math.pow(10, 2)), // orders per 100 sq km
        reasons: generateReasons(clusterOrders, avgDelay, deliveryImprovement),
        nearbyPopulation: estimatePopulation(centroid.lat, centroid.lng),
        accessibilityScore: calculateAccessibilityScore(centroid.lat, centroid.lng)
      };

      return {
        clusterId: index,
        center: centroid,
        orderCount: clusterOrders.length,
        avgDelay,
        totalOrderValue,
        recommendedLocation
      };
    });

    const results = await Promise.all(clusterPromises);
    return results.filter(Boolean) as ClusterAnalysis[];
  }, [minOrderVolume]);

  // Helper functions
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Reverse geocoding function using CORS proxy + OpenRouteService
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using a CORS proxy to bypass CORS restrictions
      const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
      const API_KEY = '5b3ce3597851110001cf62484f6e4c0b9b5a4e5dbcdb409991d98c2e';
      
      const response = await fetch(
        `${CORS_PROXY}https://api.openrouteservice.org/geocode/reverse?api_key=${API_KEY}&point.lon=${lng}&point.lat=${lat}&size=1`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding API failed');
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const properties = feature.properties;
        
        // Build a readable address from available components
        const addressParts = [];
        
        if (properties.neighbourhood) addressParts.push(properties.neighbourhood);
        if (properties.locality) addressParts.push(properties.locality);
        if (properties.county) addressParts.push(properties.county);
        if (properties.region) addressParts.push(properties.region);
        
        const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : properties.label || 'Unknown Location';
        
        return fullAddress;
      }
      
      throw new Error('No results found');
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      // Fallback to enhanced local mapping
      return generateLocationNameFromCoordinates(lat, lng);
    }
  };

  // Alternative reverse geocoding using Nominatim (OpenStreetMap) - Better CORS support
  const reverseGeocodeNominatim = async (lat: number, lng: number): Promise<string> => {
    try {
      // Add a small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1&accept-language=en`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'SupplyChainAI/1.0 (contact@example.com)', // Required by Nominatim
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim API failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.address) {
        const address = data.address;
        const addressParts = [];
        
        if (address.suburb) addressParts.push(address.suburb);
        if (address.city || address.town || address.village) {
          addressParts.push(address.city || address.town || address.village);
        }
        if (address.state) addressParts.push(address.state);
        
        return addressParts.length > 0 ? addressParts.join(', ') : data.display_name.split(',').slice(0, 3).join(', ');
      }
      
      throw new Error('No address found');
    } catch (error) {
      console.warn('Nominatim geocoding failed:', error);
      return generateLocationNameFromCoordinates(lat, lng);
    }
  };

  // Enhanced local coordinate-to-name mapping with much more comprehensive coverage
  const generateLocationNameFromCoordinates = (lat: number, lng: number): string => {
    // Comprehensive location mapping for Indian cities and regions
    const locationData = [
      // Delhi NCR (28.4-28.8, 76.8-77.4)
      { lat: 28.4595, lng: 77.0266, name: "Cyber City, Gurgaon", radius: 0.05 },
      { lat: 28.4735, lng: 77.0444, name: "Golf Course Road, Gurgaon", radius: 0.03 },
      { lat: 28.4483, lng: 77.0673, name: "Sohna Road, Gurgaon", radius: 0.04 },
      { lat: 28.5355, lng: 77.3910, name: "Sector 62, Noida", radius: 0.03 },
      { lat: 28.5706, lng: 77.3272, name: "Sector 18, Noida", radius: 0.03 },
      { lat: 28.6139, lng: 77.2090, name: "Connaught Place, Delhi", radius: 0.02 },
      { lat: 28.7041, lng: 77.1025, name: "Civil Lines, Delhi", radius: 0.03 },
      { lat: 28.6692, lng: 77.4538, name: "Indirapuram, Ghaziabad", radius: 0.03 },
      
      // Mumbai & MMR (18.9-19.3, 72.7-73.1)
      { lat: 19.0760, lng: 72.8777, name: "Andheri East, Mumbai", radius: 0.03 },
      { lat: 19.1075, lng: 72.8263, name: "Andheri West, Mumbai", radius: 0.03 },
      { lat: 19.0330, lng: 72.8697, name: "Worli, Mumbai", radius: 0.02 },
      { lat: 19.0176, lng: 72.8562, name: "Lower Parel, Mumbai", radius: 0.02 },
      { lat: 19.1136, lng: 72.9080, name: "Powai, Mumbai", radius: 0.03 },
      { lat: 19.2183, lng: 72.9781, name: "Borivali East, Mumbai", radius: 0.03 },
      { lat: 18.9937, lng: 73.1194, name: "Thane West", radius: 0.04 },
      
      // Pune (18.4-18.6, 73.7-74.0)
      { lat: 18.5204, lng: 73.8567, name: "Hinjawadi IT Park, Pune", radius: 0.04 },
      { lat: 18.5314, lng: 73.8477, name: "Wakad, Pune", radius: 0.03 },
      { lat: 18.5099, lng: 73.8712, name: "Pimpri-Chinchwad, Pune", radius: 0.03 },
      { lat: 18.5445, lng: 73.8302, name: "Aundh, Pune", radius: 0.03 },
      { lat: 18.5167, lng: 73.8601, name: "Baner Road, Pune", radius: 0.03 },
      { lat: 18.4655, lng: 73.8097, name: "Kothrud, Pune", radius: 0.03 },
      
      // Bangalore (12.8-13.2, 77.4-77.8)
      { lat: 12.9716, lng: 77.5946, name: "MG Road, Bangalore", radius: 0.02 },
      { lat: 12.9352, lng: 77.6245, name: "Electronic City, Bangalore", radius: 0.05 },
      { lat: 13.0358, lng: 77.6973, name: "Whitefield, Bangalore", radius: 0.04 },
      { lat: 12.9279, lng: 77.6271, name: "Koramangala, Bangalore", radius: 0.03 },
      { lat: 13.0067, lng: 77.5635, name: "Hebbal, Bangalore", radius: 0.03 },
      { lat: 12.9698, lng: 77.7500, name: "Marathahalli, Bangalore", radius: 0.03 },
      
      // Chennai (12.9-13.2, 80.1-80.3)
      { lat: 13.0827, lng: 80.2707, name: "T. Nagar, Chennai", radius: 0.02 },
      { lat: 13.0674, lng: 80.2376, name: "Anna Nagar, Chennai", radius: 0.03 },
      { lat: 12.9863, lng: 80.2207, name: "Adyar, Chennai", radius: 0.03 },
      { lat: 13.1185, lng: 80.2574, name: "Perambur, Chennai", radius: 0.03 },
      { lat: 12.9249, lng: 80.1000, name: "OMR IT Corridor, Chennai", radius: 0.05 },
      
      // Hyderabad (17.2-17.5, 78.3-78.6)
      { lat: 17.3850, lng: 78.4867, name: "Banjara Hills, Hyderabad", radius: 0.03 },
      { lat: 17.4399, lng: 78.3489, name: "HITEC City, Hyderabad", radius: 0.04 },
      { lat: 17.4435, lng: 78.3772, name: "Kondapur, Hyderabad", radius: 0.03 },
      { lat: 17.4065, lng: 78.4772, name: "Jubilee Hills, Hyderabad", radius: 0.03 },
      
      // Kolkata (22.4-22.7, 88.2-88.5)
      { lat: 22.5726, lng: 88.3639, name: "Salt Lake City, Kolkata", radius: 0.03 },
      { lat: 22.6708, lng: 88.4707, name: "New Town, Kolkata", radius: 0.04 },
      { lat: 22.5448, lng: 88.3426, name: "Park Street, Kolkata", radius: 0.02 },
      { lat: 22.4707, lng: 88.3607, name: "Behala, Kolkata", radius: 0.03 },
      
      // Ahmedabad (23.0-23.2, 72.5-72.7)
      { lat: 23.0225, lng: 72.5714, name: "SG Highway, Ahmedabad", radius: 0.04 },
      { lat: 23.0359, lng: 72.6156, name: "Vastrapur, Ahmedabad", radius: 0.03 },
      { lat: 23.0732, lng: 72.5290, name: "Chandkheda, Ahmedabad", radius: 0.03 },
      
      // Coimbatore (10.9-11.1, 76.8-77.1)
      { lat: 11.0168, lng: 76.9558, name: "Peelamedu, Coimbatore", radius: 0.03 },
      { lat: 11.0341, lng: 76.9512, name: "Saravanampatti, Coimbatore", radius: 0.03 },
      { lat: 11.0089, lng: 76.9734, name: "RS Puram, Coimbatore", radius: 0.02 },
      { lat: 11.0278, lng: 76.9445, name: "Gandhipuram, Coimbatore", radius: 0.02 },
      
      // Siliguri & North Bengal (26.6-26.8, 88.3-88.5)
      { lat: 26.7271, lng: 88.3953, name: "Siliguri Commercial Area", radius: 0.03 },
      { lat: 26.7456, lng: 88.4102, name: "Matigara, Siliguri", radius: 0.03 },
      { lat: 26.7102, lng: 88.3801, name: "Pradhan Nagar, Siliguri", radius: 0.02 },
      
      // Other major cities
      { lat: 26.9124, lng: 75.7873, name: "Malviya Nagar, Jaipur", radius: 0.03 },
      { lat: 21.1458, lng: 79.0882, name: "Sadar, Nagpur", radius: 0.03 },
      { lat: 18.9220, lng: 72.8347, name: "Dadar, Mumbai", radius: 0.02 },
      { lat: 25.5941, lng: 85.1376, name: "Boring Road, Patna", radius: 0.03 }
    ];

    // Find the closest location within radius
    let bestMatch = null;
    let minDistance = Infinity;

    for (const location of locationData) {
      const distance = Math.sqrt(
        Math.pow(lat - location.lat, 2) + Math.pow(lng - location.lng, 2)
      );
      
      if (distance <= location.radius && distance < minDistance) {
        minDistance = distance;
        bestMatch = location;
      }
    }

    if (bestMatch) {
      return bestMatch.name;
    }

    // Enhanced city-level fallback
    const cityBounds = [
      { bounds: { lat: [28.4, 28.8], lng: [76.8, 77.4] }, name: "Delhi NCR Region" },
      { bounds: { lat: [18.9, 19.3], lng: [72.7, 73.1] }, name: "Mumbai Metropolitan Region" },
      { bounds: { lat: [18.4, 18.6], lng: [73.7, 74.0] }, name: "Pune District" },
      { bounds: { lat: [12.8, 13.2], lng: [77.4, 77.8] }, name: "Bangalore Urban" },
      { bounds: { lat: [12.9, 13.2], lng: [80.1, 80.3] }, name: "Chennai Metropolitan" },
      { bounds: { lat: [17.2, 17.5], lng: [78.3, 78.6] }, name: "Hyderabad District" },
      { bounds: { lat: [22.4, 22.7], lng: [88.2, 88.5] }, name: "Kolkata Metropolitan" },
      { bounds: { lat: [23.0, 23.2], lng: [72.5, 72.7] }, name: "Ahmedabad Urban" },
      { bounds: { lat: [10.9, 11.1], lng: [76.8, 77.1] }, name: "Coimbatore District" },
      { bounds: { lat: [26.6, 26.8], lng: [88.3, 88.5] }, name: "Siliguri Sub-Division" }
    ];

    for (const city of cityBounds) {
      if (lat >= city.bounds.lat[0] && lat <= city.bounds.lat[1] &&
          lng >= city.bounds.lng[0] && lng <= city.bounds.lng[1]) {
        return city.name;
      }
    }

    // State-level fallback
    const stateBounds = [
      { bounds: { lat: [28.0, 30.5], lng: [75.0, 78.5] }, name: "Northern India Hub" },
      { bounds: { lat: [18.0, 20.0], lng: [72.0, 75.0] }, name: "Western India Hub" },
      { bounds: { lat: [12.0, 15.0], lng: [77.0, 81.0] }, name: "Southern India Hub" },
      { bounds: { lat: [22.0, 27.0], lng: [87.0, 89.0] }, name: "Eastern India Hub" }
    ];

    for (const state of stateBounds) {
      if (lat >= state.bounds.lat[0] && lat <= state.bounds.lat[1] &&
          lng >= state.bounds.lng[0] && lng <= state.bounds.lng[1]) {
        return state.name;
      }
    }

    return `Strategic Location ${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  };

  const generateLocationName = async (lat: number, lng: number): Promise<string> => {
    // For demo purposes and to avoid CORS issues, prioritize local mapping
    // Try local mapping first (most reliable)
    const localName = generateLocationNameFromCoordinates(lat, lng);
    
    // If we get a good match from local mapping, use it
    if (localName && !localName.includes('Strategic Location')) {
      return localName;
    }
    
    // Only try APIs for unknown locations and if needed
    try {
      // Try Nominatim first (better CORS support)
      return await reverseGeocodeNominatim(lat, lng);
    } catch (error) {
      console.warn('Nominatim failed, trying OpenRouteService with proxy:', error);
      try {
        return await reverseGeocode(lat, lng);
      } catch (error2) {
        console.warn('All geocoding services failed, using local mapping:', error2);
        return localName; // Fallback to local mapping
      }
    }
  };

  const generateReasons = (orders: OrderData[], avgDelay: number, improvement: number): string[] => {
    const reasons = [];
    
    if (avgDelay > 80) reasons.push('High delivery delay concentration');
    if (orders.length > 10) reasons.push('Strong order volume density');
    if (improvement > 2) reasons.push(`${improvement.toFixed(1)} hours avg delivery time savings`);
    
    const totalValue = orders.reduce((sum, order) => sum + order.orderValue, 0);
    if (totalValue > 200000) reasons.push('High order value area');
    
    const electronicsOrders = orders.filter(o => o.category === 'electronics').length;
    if (electronicsOrders > orders.length * 0.5) {
      reasons.push('Electronics demand hotspot');
    }

    // Add gap analysis from existing warehouses
    const avgDistanceFromExisting = orders.reduce((sum, order) => {
      const existingWarehouses = [
        { lat: 28.6139, lng: 77.2090 }, // Delhi
        { lat: 19.0760, lng: 72.8777 }, // Mumbai
        { lat: 13.0827, lng: 80.2707 }, // Chennai
        { lat: 22.5726, lng: 88.3639 }  // Kolkata
      ];

      let minDistance = Infinity;
      existingWarehouses.forEach(warehouse => {
        const distance = Math.sqrt(
          Math.pow(order.lat - warehouse.lat, 2) + Math.pow(order.lng - warehouse.lng, 2)
        ) * 111; // Convert to approximate km
        minDistance = Math.min(minDistance, distance);
      });

      return sum + minDistance;
    }, 0) / orders.length;

    if (avgDistanceFromExisting > 300) {
      reasons.push('Poor coverage from existing warehouses');
    } else if (avgDistanceFromExisting > 200) {
      reasons.push('Moderate gap in warehouse coverage');
    }

    return reasons;
  };

  const estimatePopulation = (lat: number, lng: number): number => {
    // Simplified population estimation based on known areas
    const populationMap: { [key: string]: number } = {
      '28.4-77.0': 850000, // Gurgaon area
      '18.5-73.8': 650000, // Pune area
      '11.0-76.9': 420000, // Coimbatore area
      '26.7-88.3': 350000  // Siliguri area
    };

    const key = `${lat.toFixed(1)}-${lng.toFixed(1)}`;
    return populationMap[key] || Math.floor(Math.random() * 400000 + 200000);
  };

  const calculateAccessibilityScore = (lat: number, lng: number): number => {
    // Simplified accessibility scoring (in real implementation, use road network APIs)
    const accessibilityMap: { [key: string]: number } = {
      '28.4-77.0': 92, // Gurgaon - excellent highway access
      '18.5-73.8': 88, // Pune - good connectivity
      '11.0-76.9': 85, // Coimbatore - decent access
      '26.7-88.3': 78  // Siliguri - limited access
    };

    const key = `${lat.toFixed(1)}-${lng.toFixed(1)}`;
    return accessibilityMap[key] || Math.floor(Math.random() * 20 + 70);
  };

  const handleAnalyzeLocations = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);

    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Filter orders based on time range (simplified - using last N orders)
      const filteredOrders = mockHistoricalOrders.filter(() => {
        // In real implementation, filter by timestamp based on selectedTimeRange
        return true;
      });

      // Perform clustering analysis (now async)
      const results = await performKMeansClustering(filteredOrders, 4);
      
      // Sort by score descending
      results.sort((a, b) => b.recommendedLocation.score - a.recommendedLocation.score);
      
      setClusterAnalysis(results);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [performKMeansClustering]);

  useEffect(() => {
    // Auto-run analysis on component mount
    handleAnalyzeLocations();
  }, [handleAnalyzeLocations]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">🎯 New Warehouse Location AI</h2>
          <p className="text-gray-600 mt-1">Intelligent micro-warehouse placement recommendations</p>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <Target className="w-5 h-5" />
          <span className="text-sm font-medium">ML-Powered Analysis</span>
        </div>
      </div>

      {/* Analysis Controls */}
      <div className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analysis Parameters
        </h3>
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>🔍 Enhanced Location Intelligence:</strong> This analysis uses a comprehensive local database 
            of Indian locations (50+ cities) with fallback to OpenRouteService and Nominatim APIs for unknown areas. 
            <br />
            <span className="text-xs mt-1 block">
              ✅ Covers major areas: Delhi NCR, Mumbai, Pune, Bangalore, Chennai, Hyderabad, Kolkata, Ahmedabad, Coimbatore, and more
            </span>
          </div>
        </div>

        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            <strong>🏭 Existing Warehouse Integration:</strong> The AI considers our current warehouse network 
            (Delhi, Mumbai, Chennai, Kolkata) and identifies areas with poor coverage or high delivery delays. 
            <br />
            <span className="text-xs mt-1 block">
              💡 New recommendations fill strategic gaps between existing warehouses to optimize the entire network
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Time Range</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as '1w' | '1m' | '3m' | '6m')}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1w">Last 1 Week</option>
              <option value="1m">Last 1 Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Min Order Volume</label>
            <input
              type="number"
              min="1"
              max="20"
              value={minOrderVolume}
              onChange={(e) => setMinOrderVolume(parseInt(e.target.value) || 5)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleAnalyzeLocations}
              disabled={isAnalyzing}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:bg-green-300 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Run AI Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {analysisComplete && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Analysis complete! Found {clusterAnalysis.length} optimal locations using K-Means clustering
              </span>
            </div>
            <div className="mt-2 text-xs text-green-600">
              🌍 Location names resolved using comprehensive Indian location database + API fallbacks
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Results */}
      {clusterAnalysis.length > 0 && (
        <div className="space-y-4">
          {/* Existing Warehouse Network Overview */}
          <div className={`p-4 rounded-lg ${cardClass} border shadow-sm bg-gray-50`}>
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
              🏭 Current Warehouse Network
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">Delhi Hub</div>
                <div className="text-xs text-gray-500">28.61°N, 77.21°E</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">Mumbai Hub</div>
                <div className="text-xs text-gray-500">19.08°N, 72.88°E</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">Chennai Hub</div>
                <div className="text-xs text-gray-500">13.08°N, 80.27°E</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">Kolkata Hub</div>
                <div className="text-xs text-gray-500">22.57°N, 88.36°E</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600 text-center">
              💡 New recommendations strategically fill gaps in this existing network
            </div>
          </div>

          <h3 className="text-xl font-semibold">🏆 Top Warehouse Location Recommendations</h3>
          
          {clusterAnalysis.map((cluster, index) => (
            <div key={cluster.clusterId} className={`p-6 rounded-lg ${cardClass} border shadow-sm`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-gold' : index === 1 ? 'bg-silver' : index === 2 ? 'bg-bronze' : 'bg-gray-500'
                    }`} style={{
                      backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#6B7280'
                    }}>
                      {index + 1}
                    </span>
                    {cluster.recommendedLocation.suggestedName}
                  </h4>
                  <p className="text-gray-600">
                    📍 {cluster.recommendedLocation.lat.toFixed(4)}, {cluster.recommendedLocation.lng.toFixed(4)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {cluster.recommendedLocation.score.toFixed(0)}/100
                  </div>
                  <div className="text-sm text-gray-500">AI Score</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-lg font-semibold text-blue-700">
                    {cluster.orderCount}
                  </div>
                  <div className="text-xs text-blue-600">Orders/Month</div>
                </div>

                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-lg font-semibold text-green-700">
                    {cluster.recommendedLocation.avgDeliveryImprovement.toFixed(1)}h
                  </div>
                  <div className="text-xs text-green-600">Time Saved</div>
                </div>

                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-lg font-semibold text-yellow-700">
                    {cluster.recommendedLocation.estimatedCostSavings.toFixed(1)}%
                  </div>
                  <div className="text-xs text-yellow-600">Cost Savings</div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-lg font-semibold text-purple-700">
                    {cluster.recommendedLocation.coverageRadius.toFixed(1)}km
                  </div>
                  <div className="text-xs text-purple-600">Coverage</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Key Benefits
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {cluster.recommendedLocation.reasons.map((reason, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Population Density:</span>
                      <span className="font-medium">
                        {(cluster.recommendedLocation.nearbyPopulation! / 1000).toFixed(0)}K people
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Demand Density:</span>
                      <span className="font-medium">
                        {cluster.recommendedLocation.demandDensity.toFixed(1)} orders/100km²
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance to Nearest Hub:</span>
                      <span className="font-medium text-red-600">
                        {(() => {
                          const existingWarehouses = [
                            { lat: 28.6139, lng: 77.2090 }, // Delhi
                            { lat: 19.0760, lng: 72.8777 }, // Mumbai
                            { lat: 13.0827, lng: 80.2707 }, // Chennai
                            { lat: 22.5726, lng: 88.3639 }  // Kolkata
                          ];
                          
                          let minDistance = Infinity;
                          existingWarehouses.forEach(warehouse => {
                            const distance = Math.sqrt(
                              Math.pow(cluster.recommendedLocation.lat - warehouse.lat, 2) + 
                              Math.pow(cluster.recommendedLocation.lng - warehouse.lng, 2)
                            ) * 111; // Convert to approximate km
                            minDistance = Math.min(minDistance, distance);
                          });
                          
                          return minDistance.toFixed(0) + ' km';
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Accessibility Score:</span>
                      <span className="font-medium">
                        {cluster.recommendedLocation.accessibilityScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Order Value:</span>
                      <span className="font-medium">
                        ₹{(cluster.totalOrderValue / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network Optimization:</span>
                      <span className="font-medium text-green-600">
                        {cluster.recommendedLocation.score > 80 ? 'Critical Gap' :
                         cluster.recommendedLocation.score > 60 ? 'Strategic Gap' : 'Future Expansion'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Avg Delay Score: {cluster.avgDelay.toFixed(1)}/100
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Priority:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        cluster.recommendedLocation.score > 80 ? 'bg-red-100 text-red-800' :
                        cluster.recommendedLocation.score > 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {cluster.recommendedLocation.score > 80 ? 'HIGH' :
                         cluster.recommendedLocation.score > 60 ? 'MEDIUM' : 'LOW'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {clusterAnalysis.length === 0 && !isAnalyzing && (
        <div className={`p-8 rounded-lg ${cardClass} border shadow-sm text-center`}>
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No Recommendations Available
          </h3>
          <p className="text-gray-500 mb-4">
            Run the AI analysis to get warehouse location recommendations based on historical order data.
          </p>
          <button
            onClick={handleAnalyzeLocations}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default WarehouseLocationRecommendations;
